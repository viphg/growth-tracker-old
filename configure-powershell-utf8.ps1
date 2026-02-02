# Configure PowerShell for UTF-8 encoding
# This helps prevent character encoding issues when running scripts

Write-Host "Configuring PowerShell for UTF-8 encoding..." -ForegroundColor Yellow

# Set console output encoding to UTF-8
$OutputEncoding = [console]::InputEncoding = [console]::OutputEncoding = New-Object System.Text.UTF8Encoding

# Set the default encoding for PowerShell
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Update registry to make UTF-8 the default for PowerShell sessions
$regPath = "HKCU:\Console\%SystemRoot%_System32_WindowsPowerShell_v1.0_powershell.exe"
if (!(Test-Path $regPath)) {
    New-Item -Path $regPath -Force | Out-Null
}

# Set code page to UTF-8 (65001)
Set-ItemProperty -Path $regPath -Name "CodePage" -Value 65001 -Force

# Set PowerShell profile encoding
$profileDir = Split-Path -Parent $PROFILE
if (!(Test-Path $profileDir)) {
    New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
}

Write-Host "[SUCCESS] PowerShell configured for UTF-8 encoding" -ForegroundColor Green
Write-Host "Settings applied:" -ForegroundColor White
Write-Host "  - Console input/output encoding: UTF-8" -ForegroundColor White
Write-Host "  - Registry code page: UTF-8 (65001)" -ForegroundColor White

Write-Host "`n[INFO] You may need to restart PowerShell for all changes to take effect" -ForegroundColor Cyan
Write-Host "[INFO] After restarting, you should have fewer character encoding issues" -ForegroundColor Cyan