# Set the PostgreSQL password as environment variable
$env:PGPASSWORD = "database1!"

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Growth Tracker - Verify Database Setup" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

Write-Host "`nVerifying PostgreSQL database setup..." -ForegroundColor Yellow

# Change to the correct directory
Set-Location "D:\Qoder"

# Check if the database exists
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

if (Test-Path $psqlPath) {
    Write-Host "Checking if growth_tracker database exists..." -ForegroundColor Yellow
    & $psqlPath -U postgres -h localhost -p 5432 -c "SELECT datname FROM pg_database WHERE datname='growth_tracker';"
    
    Write-Host "`nChecking tables in growth_tracker database..." -ForegroundColor Yellow
    & $psqlPath -U postgres -h localhost -p 5432 -d growth_tracker -c "\dt"
    
    Write-Host "`nChecking if profiles table exists and has data..." -ForegroundColor Yellow
    & $psqlPath -U postgres -h localhost -p 5432 -d growth_tracker -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles');"
    
    Write-Host "`nChecking if skills table exists..." -ForegroundColor Yellow
    & $psqlPath -U postgres -h localhost -p 5432 -d growth_tracker -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'skills');"
    
    Write-Host "`nChecking if goals table exists..." -ForegroundColor Yellow
    & $psqlPath -U postgres -h localhost -p 5432 -d growth_tracker -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'goals');"
    
    Write-Host "`nChecking if achievements table exists..." -ForegroundColor Yellow
    & $psqlPath -U postgres -h localhost -p 5432 -d growth_tracker -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'achievements');"
} else {
    Write-Host "[ERROR] psql executable not found: $psqlPath" -ForegroundColor Red
}

# Clean up the environment variable
Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "Database verification completed" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan

Read-Host "Press Enter to continue"