# Set the PostgreSQL password as environment variable
$env:PGPASSWORD = "database1!"

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Growth Tracker - PostgreSQL Database Setup (Two-Step)" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

Write-Host "`nStep 1: Creating growth_tracker database..." -ForegroundColor Yellow

# Change to the correct directory
Set-Location "D:\Qoder"

# Run the database creation script
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$dbScript = "create_db.sql"

if (Test-Path $psqlPath) {
    if (Test-Path $dbScript) {
        Write-Host "Executing database creation script: $dbScript" -ForegroundColor Yellow
        & $psqlPath -U postgres -f $dbScript
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[SUCCESS] Database created successfully!" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Database creation failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        }
    } else {
        Write-Host "[ERROR] Database creation script not found: $dbScript" -ForegroundColor Red
    }

    # Wait and retry connecting to the database
    Write-Host "`nWaiting for database to be ready..." -ForegroundColor Yellow
    $maxRetries = 10
    $retryCount = 0
    
    do {
        Start-Sleep -Seconds 2
        Write-Host "Attempting to connect to growth_tracker database (attempt $($retryCount + 1)/$maxRetries)..." -ForegroundColor Yellow
        & $psqlPath -U postgres -d growth_tracker -c "SELECT 1;" 2>$null
        $connectionSuccess = $LASTEXITCODE -eq 0
        $retryCount++
    } while (-not $connectionSuccess -and $retryCount -lt $maxRetries)
    
    # Run the table setup script
    $tableScript = "setup_tables.sql"
    if (Test-Path $tableScript) {
        if ($connectionSuccess) {
            Write-Host "`nStep 2: Setting up table structures: $tableScript" -ForegroundColor Yellow
            & $psqlPath -U postgres -d growth_tracker -f $tableScript
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[SUCCESS] Table structures created successfully!" -ForegroundColor Green
            } else {
                Write-Host "[ERROR] Table structure creation failed with exit code: $LASTEXITCODE" -ForegroundColor Red
            }
        } else {
            Write-Host "[ERROR] Could not connect to growth_tracker database after $maxRetries attempts" -ForegroundColor Red
        }
    } else {
        Write-Host "[ERROR] Table setup script not found: $tableScript" -ForegroundColor Red
    }
} else {
    Write-Host "[ERROR] psql executable not found: $psqlPath" -ForegroundColor Red
}

# Clean up the environment variable
Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "Two-step database setup completed" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan

Read-Host "Press Enter to continue"