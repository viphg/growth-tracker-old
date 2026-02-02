# PostgreSQL Database Initialization Script
# PowerShell version

param(
    [Parameter(Mandatory=$true)]
    [string]$Password
)

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Growth Tracker - PostgreSQL Database Initialization Script" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Check if PostgreSQL is installed
Write-Host "`nChecking PostgreSQL installation..." -ForegroundColor Yellow

$pgPath = $null
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\*",
    "C:\Program Files (x86)\PostgreSQL\*",
    "$env:ProgramFiles\PostgreSQL\*",
    "${env:ProgramFiles(x86)}\PostgreSQL\*"
)

foreach ($pathPattern in $possiblePaths) {
    $paths = Get-Item $pathPattern -ErrorAction SilentlyContinue | Sort-Object Name -Descending
    foreach ($path in $paths) {
        $binPath = Join-Path $path "bin"
        $pgConfig = Join-Path $binPath "pg_config.exe"
        
        if (Test-Path $pgConfig) {
            $pgPath = $path
            $binPath = Join-Path $path "bin"
            break
        }
    }
    
    if ($pgPath) {
        break
    }
}

if (-not $pgPath) {
    Write-Host "[ERROR] PostgreSQL installation not found" -ForegroundColor Red
    Write-Host "[INFO] Please install PostgreSQL and ensure it is added to PATH environment variable" -ForegroundColor Cyan
    exit 1
}

Write-Host "[SUCCESS] Found PostgreSQL installation: $pgPath" -ForegroundColor Green

# Set environment variable
$env:PGPASSWORD = $Password

try {
    # Create database
    Write-Host "`nCreating database 'growth_tracker'..." -ForegroundColor Yellow
    
    $createDbCmd = @"
SELECT 'CREATE DATABASE growth_tracker' 
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'growth_tracker')
"@
    
    $result = & "$binPath\psql.exe" -U postgres -h localhost -p 5432 -c $createDbCmd
    Write-Host "[SUCCESS] Database creation command completed" -ForegroundColor Green

    # Connect to database and create extensions
    Write-Host "`nConnecting to database and creating extensions..." -ForegroundColor Yellow
    
    # Create extensions
    $extensionsSql = @"
\c growth_tracker
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
"@
    
    # Write SQL to temp file and execute
    $tempSqlFile = [System.IO.Path]::GetTempFileName()
    $extensionsSql | Out-File -FilePath $tempSqlFile -Encoding UTF8
    
    & "$binPath\psql.exe" -U postgres -h localhost -p 5432 -f $tempSqlFile
    Remove-Item $tempSqlFile
    
    Write-Host "[SUCCESS] Extensions created" -ForegroundColor Green

    # Create table structures
    Write-Host "`nCreating table structures..." -ForegroundColor Yellow
    
    $tablesSql = @"
\c growth_tracker

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL DEFAULT 'My Growth Journey',
    bio TEXT,
    avatar_url TEXT,
    email VARCHAR(255),
    location VARCHAR(255),
    website VARCHAR(255),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    level INTEGER CHECK (level >= 0 AND level <= 100) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline DATE NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    icon VARCHAR(10) DEFAULT '🏆',
    category VARCHAR(100) NOT NULL
);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update timestamp trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add update timestamp trigger for skills table
DROP TRIGGER IF EXISTS update_skills_updated_at ON skills;
CREATE TRIGGER update_skills_updated_at 
    BEFORE UPDATE ON skills 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create a sample user
INSERT INTO profiles (id, name, bio, is_public) 
SELECT '123e4567-e89b-12d3-a456-426614174000', 'Sample User', 'This is a sample user', FALSE
WHERE NOT EXISTS (SELECT FROM profiles WHERE id = '123e4567-e89b-12d3-a456-426614174000');
"@
    
    $tempSqlFile = [System.IO.Path]::GetTempFileName()
    $tablesSql | Out-File -FilePath $tempSqlFile -Encoding UTF8
    
    & "$binPath\psql.exe" -U postgres -h localhost -p 5432 -f $tempSqlFile
    Remove-Item $tempSqlFile
    
    Write-Host "[SUCCESS] Table structures created" -ForegroundColor Green

    Write-Host "`n===========================================" -ForegroundColor Cyan
    Write-Host "Database initialization completed!" -ForegroundColor Green
    Write-Host "===========================================" -ForegroundColor Cyan
    
    Write-Host "`nNow you can:" -ForegroundColor Yellow
    Write-Host "1. Update api/.env file with database configuration" -ForegroundColor White
    Write-Host "2. Run npm install in api directory" -ForegroundColor White
    Write-Host "3. Start API service: npm run dev" -ForegroundColor White
    
} catch {
    Write-Host "[ERROR] An error occurred during execution: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Clean up environment variable
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}