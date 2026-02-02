# Check PostgreSQL service status
# PowerShell script

Write-Host "Checking PostgreSQL service status..." -ForegroundColor Yellow

# Find PostgreSQL services
$pgServices = Get-Service | Where-Object { $_.Name -like "*postgresql*" -or $_.DisplayName -like "*PostgreSQL*" }

if ($pgServices) {
    foreach ($service in $pgServices) {
        $status = $service.Status
        $name = $service.Name
        $displayName = $service.DisplayName
        
        if ($status -eq "Running") {
            Write-Host "[SUCCESS] Service: $displayName ($name) - Status: $status" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Service: $displayName ($name) - Status: $status" -ForegroundColor Red
            Write-Host "[INFO] Tip: Please start this service" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "[ERROR] PostgreSQL service not found" -ForegroundColor Red
    Write-Host "[INFO] Tip: Please confirm PostgreSQL was installed correctly" -ForegroundColor Cyan
}

Write-Host "`nTo start PostgreSQL service, run PowerShell as administrator and execute:" -ForegroundColor Yellow
Write-Host "Start-Service *postgresql*" -ForegroundColor White