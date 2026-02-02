# PostgreSQL Authentication Fix Script
# PowerShell version

param(
    [Parameter(Mandatory=$true)]
    [string]$Password
)

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Growth Tracker - PostgreSQL Authentication Fix" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Find PostgreSQL installation
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
    exit 1
}

Write-Host "[SUCCESS] Found PostgreSQL installation: $pgPath" -ForegroundColor Green
Write-Host "[SUCCESS] Bin directory: $binPath" -ForegroundColor Green

# Set environment variable for password
$env:PGPASSWORD = $Password

try {
    Write-Host "`nTesting PostgreSQL connection with provided password..." -ForegroundColor Yellow
    
    # Test basic connection to PostgreSQL
    $testConn = & "$binPath\psql.exe" -U postgres -c "SELECT version();" -t 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Successfully connected to PostgreSQL!" -ForegroundColor Green
        
        # Create database if it doesn't exist using a different approach
        Write-Host "`nCreating database 'growth_tracker' if it doesn't exist..." -ForegroundColor Yellow
        
        $createDbResult = & "$binPath\createdb.exe" -U postgres -w growth_tracker 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[SUCCESS] Database 'growth_tracker' created or already exists" -ForegroundColor Green
        } else {
            # Check if it's just an "already exists" error
            $errorStr = $createDbResult | Out-String
            if ($errorStr -like "*already exists*") {
                Write-Host "[INFO] Database 'growth_tracker' already exists" -ForegroundColor Yellow
            } else {
                Write-Host "[WARNING] Error creating database: $errorStr" -ForegroundColor Red
            }
        }
        
        # Connect to the database and create extensions using a here-string to avoid file encoding issues
        Write-Host "`nConnecting to database and creating extensions..." -ForegroundColor Yellow
        
        # Create extensions using psql with inline commands
        $extensionCommands = @"
\c growth_tracker
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
SELECT 'Extensions created successfully' as status;
"@

        # Write to temp file with explicit UTF-8 encoding
        $tempExtensionsFile = [System.IO.Path]::GetTempFileName()
        [System.IO.File]::WriteAllText($tempExtensionsFile, $extensionCommands, [System.Text.Encoding]::UTF8)
        
        $extensionResult = & "$binPath\psql.exe" -U postgres -d growth_tracker -f $tempExtensionsFile 2>&1
        $extensionOutput = $extensionResult | Out-String
        Remove-Item $tempExtensionsFile -ErrorAction SilentlyContinue
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[SUCCESS] Extensions created successfully" -ForegroundColor Green
        } else {
            Write-Host "[INFO] Extension creation output: $extensionOutput" -ForegroundColor Yellow
        }

        # Create table structures
        Write-Host "`nCreating table structures..." -ForegroundColor Yellow
        
        $tableCommands = @"
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
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
\$\$ language 'plpgsql';

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

SELECT 'Table structures created successfully' as status;
"@

        # Write to temp file with explicit UTF-8 encoding
        $tempTablesFile = [System.IO.Path]::GetTempFileName()
        [System.IO.File]::WriteAllText($tempTablesFile, $tableCommands, [System.Text.Encoding]::UTF8)
        
        $tableResult = & "$binPath\psql.exe" -U postgres -d growth_tracker -f $tempTablesFile 2>&1
        $tableOutput = $tableResult | Out-String
        Remove-Item $tempTablesFile -ErrorAction SilentlyContinue
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[SUCCESS] Table structures created successfully" -ForegroundColor Green
        } else {
            Write-Host "[INFO] Table creation output: $tableOutput" -ForegroundColor Yellow
        }
        
        # Verify the tables were created
        Write-Host "`nVerifying created tables..." -ForegroundColor Yellow
        $verifyResult = & "$binPath\psql.exe" -U postgres -d growth_tracker -c "\dt" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[SUCCESS] Verified database tables" -ForegroundColor Green
            $verifyResult | Select-String -Pattern "profiles|skills|goals|achievements" | ForEach-Object {
                Write-Host "  - $($_.ToString().Trim())" -ForegroundColor Green
            }
        }
    } else {
        $errorStr = $testConn | Out-String
        Write-Host "[ERROR] Failed to connect to PostgreSQL: $errorStr" -ForegroundColor Red
        Write-Host "`n[INFO] Possible causes and solutions:" -ForegroundColor Yellow
        Write-Host "  1. Wrong password - verify your PostgreSQL password" -ForegroundColor White
        Write-Host "  2. PostgreSQL service not running - start the PostgreSQL service" -ForegroundColor White
        Write-Host "  3. Authentication method - check pg_hba.conf file" -ForegroundColor White
        Write-Host "  4. Port 5432 blocked - check firewall settings" -ForegroundColor White
        Write-Host "`n[INFO] To check if PostgreSQL service is running:" -ForegroundColor Yellow
        Write-Host "  Get-Service | Where-Object {\$_.Name -like '*postgresql*'}" -ForegroundColor White
        Write-Host "`n[INFO] To start PostgreSQL service (as administrator):" -ForegroundColor Yellow
        Write-Host "  Start-Service *postgresql*" -ForegroundColor White
    }
} catch {
    Write-Host "[ERROR] An error occurred during execution: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "[DEBUG] Error details: $($_.Exception)" -ForegroundColor Red
} finally {
    # Clean up environment variable
    if (Test-Path env:PGPASSWORD) {
        Remove-Item env:PGPASSWORD
    }
}

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "Authentication fix script completed" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan