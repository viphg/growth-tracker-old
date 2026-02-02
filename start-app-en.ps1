# Growth Tracker - One-click startup script
# PowerShell version

param(
    [switch]$Frontend,
    [switch]$Backend,
    [switch]$All
)

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Growth Tracker - One-click Startup Script" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Check if Node.js is installed
if (!(Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not installed or not added to PATH" -ForegroundColor Red
    Write-Host "[INFO] Please install Node.js first" -ForegroundColor Cyan
    exit 1
}

# Check if npm is installed
if (!(Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] npm is not installed or not added to PATH" -ForegroundColor Red
    Write-Host "[INFO] Please install Node.js (npm typically comes with Node.js)" -ForegroundColor Cyan
    exit 1
}

# Check PostgreSQL service status
Write-Host "`nChecking PostgreSQL service status..." -ForegroundColor Yellow

$pgServices = Get-Service | Where-Object { $_.Name -like "*postgresql*" -or $_.DisplayName -like "*PostgreSQL*" }

$pgServiceRunning = $false
if ($pgServices) {
    foreach ($service in $pgServices) {
        if ($service.Status -eq "Running") {
            Write-Host "[SUCCESS] PostgreSQL service: $($service.DisplayName) - Status: $($service.Status)" -ForegroundColor Green
            $pgServiceRunning = $true
        }
    }
}

if (!$pgServiceRunning) {
    Write-Host "[ERROR] PostgreSQL service is not running" -ForegroundColor Red
    Write-Host "[INFO] Please start PostgreSQL service first" -ForegroundColor Cyan
    Write-Host "   Run PowerShell as administrator and execute: Start-Service *postgresql*" -ForegroundColor Cyan
    exit 1
}

# Check database connection
Write-Host "`nTesting database connection..." -ForegroundColor Yellow

try {
    # Try to run psql command
    $testResult = psql -U postgres -c "SELECT 'DB Connection OK';" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Database connection is working" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Database connection test failed, but service is running" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[WARNING] Cannot test database connection, but service is running" -ForegroundColor Yellow
}

# Decide which components to start based on parameters
if ($All -or $Backend) {
    Write-Host "`nStarting API service..." -ForegroundColor Yellow
    
    # Check API directory
    if (Test-Path ".\api") {
        Set-Location ".\api"
        
        # Install dependencies (if needed)
        if (!(Test-Path ".\node_modules")) {
            Write-Host "Installing API dependencies..." -ForegroundColor Yellow
            npm install
        }
        
        # Start API service (in background)
        Start-Process "npm" -ArgumentList "run", "dev"
        Write-Host "[SUCCESS] API service started (port 3000)" -ForegroundColor Green
        Set-Location ".."
    } else {
        Write-Host "[ERROR] API directory does not exist, please confirm project structure" -ForegroundColor Red
    }
}

if ($All -or $Frontend) {
    Write-Host "`nStarting frontend application..." -ForegroundColor Yellow
    
    # Check frontend dependencies
    if (!(Test-Path ".\node_modules")) {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    # Start frontend application (in background)
    Start-Process "npm" -ArgumentList "run", "dev"
    Write-Host "[SUCCESS] Frontend application started (port 5173)" -ForegroundColor Green
}

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "Applications have been started!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan

if ($All -or $Frontend) {
    Write-Host "Frontend application: http://localhost:5173" -ForegroundColor Yellow
}
if ($All -or $Backend) {
    Write-Host "API service: http://localhost:3000" -ForegroundColor Yellow
}
Write-Host "Database: PostgreSQL (port 5432)" -ForegroundColor Yellow

Write-Host "`n[INFO] Open your browser and visit the frontend application address to start using" -ForegroundColor Cyan