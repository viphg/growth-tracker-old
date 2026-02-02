# 检查PostgreSQL服务状态
# PowerShell脚本

Write-Host "正在检查PostgreSQL服务状态..." -ForegroundColor Yellow

# 查找PostgreSQL服务
$pgServices = Get-Service | Where-Object { $_.Name -like "*postgresql*" -or $_.DisplayName -like "*PostgreSQL*" }

if ($pgServices) {
    foreach ($service in $pgServices) {
        $status = $service.Status
        $name = $service.Name
        $displayName = $service.DisplayName
        
        if ($status -eq "Running") {
            Write-Host "✅ 服务: $displayName ($name) - 状态: $status" -ForegroundColor Green
        } else {
            Write-Host "❌ 服务: $displayName ($name) - 状态: $status" -ForegroundColor Red
            Write-Host "💡 提示: 请启动此服务" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "❌ 未找到PostgreSQL服务" -ForegroundColor Red
    Write-Host "💡 提示: 请确认PostgreSQL已正确安装" -ForegroundColor Cyan
}

Write-Host "`n如需启动PostgreSQL服务，请以管理员身份运行PowerShell并执行:" -ForegroundColor Yellow
Write-Host "Start-Service *postgresql*" -ForegroundColor White