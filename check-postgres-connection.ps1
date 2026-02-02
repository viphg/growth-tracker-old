# PostgreSQL Service and Connection Check
# PowerShell version

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Service and Connection Check" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Check if PostgreSQL service is running
Write-Host "`n1. Checking PostgreSQL service status..." -ForegroundColor Yellow

$pgServices = Get-Service | Where-Object { $_.Name -like "*postgresql*" -or $_.DisplayName -like "*PostgreSQL*" }

if ($pgServices) {
    foreach ($service in $pgServices) {
        $status = $service.Status
        $name = $service.Name
        $displayName = $service.DisplayName
        
        if ($status -eq "Running") {
            Write-Host "   [SUCCESS] Service: $displayName - Status: $status" -ForegroundColor Green
        } else {
            Write-Host "   [ERROR] Service: $displayName - Status: $status" -ForegroundColor Red
            Write-Host "   [INFO] Please start this service as administrator: Start-Service '$name'" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "   [ERROR] PostgreSQL service not found" -ForegroundColor Red
    Write-Host "   [INFO] Please confirm PostgreSQL was installed correctly" -ForegroundColor Cyan
}

# Find PostgreSQL installation
Write-Host "`n2. Finding PostgreSQL installation..." -ForegroundColor Yellow

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
            Write-Host "   [SUCCESS] Found PostgreSQL at: $pgPath" -ForegroundColor Green
            Write-Host "   [SUCCESS] Bin directory: $binPath" -ForegroundColor Green
            break
        }
    }
    
    if ($pgPath) {
        break
    }
}

if (-not $pgPath) {
    Write-Host "   [ERROR] PostgreSQL installation not found" -ForegroundColor Red
    exit 1
}

# Test if psql command is available
Write-Host "`n3. Testing psql command availability..." -ForegroundColor Yellow

$psqlPath = Join-Path $binPath "psql.exe"
if (Test-Path $psqlPath) {
    Write-Host "   [SUCCESS] psql command available at: $psqlPath" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] psql command not found at: $psqlPath" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL version (without authentication)
Write-Host "`n4. Checking PostgreSQL version..." -ForegroundColor Yellow

try {
    $versionResult = & $psqlPath -U postgres --dbname=postgres --host=localhost --port=5432 --command="SELECT version();" --tuples-only --no-align 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [INFO] PostgreSQL is accessible (authentication will be required for operations)" -ForegroundColor Yellow
    } else {
        Write-Host "   [WARNING] Could not connect to PostgreSQL (may require password)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   [WARNING] Connection test failed (expected if password is required)" -ForegroundColor Yellow
}

Write-Host "`n5. Common PostgreSQL connection parameters:" -ForegroundColor Yellow
Write-Host "   Host: localhost or 127.0.0.1" -ForegroundColor White
Write-Host "   Port: 5432" -ForegroundColor White
Write-Host "   Database: postgres (for initial connection)" -ForegroundColor White
Write-Host "   User: postgres" -ForegroundColor White
Write-Host "   Password: (you set during installation)" -ForegroundColor White

Write-Host "`n6. To create a database user for the application, you can run:" -ForegroundColor Yellow
Write-Host "   psql -U postgres -c \"CREATE USER growth_user WITH PASSWORD 'your_password';\"" -ForegroundColor White
Write-Host "   psql -U postgres -c \"GRANT ALL PRIVILEGES ON DATABASE growth_tracker TO growth_user;\"" -ForegroundColor White

Write-Host "`n7. Troubleshooting authentication issues:" -ForegroundColor Yellow
Write-Host "   - Verify your PostgreSQL password is correct" -ForegroundColor White
Write-Host "   - Check pg_hba.conf file for authentication method (should be 'md5' or 'password')" -ForegroundColor White
Write-Host "   - Ensure PostgreSQL service is running" -ForegroundColor White
Write-Host "   - Confirm port 5432 is not blocked by firewall" -ForegroundColor White

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "Check completed" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan