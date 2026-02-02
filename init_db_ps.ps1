# Set the PostgreSQL password as environment variable
$env:PGPASSWORD = "database1!"

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Growth Tracker - PostgreSQL Database Setup" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

Write-Host "`nInitializing PostgreSQL database with provided password..." -ForegroundColor Yellow

# Change to the correct directory
Set-Location "D:\Qoder"

# Run the SQL initialization script
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$sqlFile = "init_growth_tracker_db.sql"

if (Test-Path $psqlPath) {
    if (Test-Path $sqlFile) {
        Write-Host "Executing SQL script: $sqlFile" -ForegroundColor Yellow
        & $psqlPath -U postgres -f $sqlFile
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[SUCCESS] Database initialized successfully!" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Database initialization failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        }
    } else {
        Write-Host "[ERROR] SQL file not found: $sqlFile" -ForegroundColor Red
    }
} else {
    Write-Host "[ERROR] psql executable not found: $psqlPath" -ForegroundColor Red
}

# Clean up the environment variable
Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "Database setup completed" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan

Read-Host "Press Enter to continue"