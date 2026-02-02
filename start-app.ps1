# 成长追踪器 - 一键启动脚本
# PowerShell版本

param(
    [switch]$Frontend,
    [switch]$Backend,
    [switch]$All
)

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "成长追踪器 - 一键启动脚本" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# 检查Node.js是否安装
if (!(Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js 未安装或未添加到PATH" -ForegroundColor Red
    Write-Host "💡 请先安装Node.js" -ForegroundColor Cyan
    exit 1
}

# 检查npm是否安装
if (!(Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm 未安装或未添加到PATH" -ForegroundColor Red
    Write-Host "💡 请先安装Node.js (npm通常随Node.js一起安装)" -ForegroundColor Cyan
    exit 1
}

# 检查PostgreSQL服务状态
Write-Host "`n正在检查PostgreSQL服务状态..." -ForegroundColor Yellow

$pgServices = Get-Service | Where-Object { $_.Name -like "*postgresql*" -or $_.DisplayName -like "*PostgreSQL*" }

$pgServiceRunning = $false
if ($pgServices) {
    foreach ($service in $pgServices) {
        if ($service.Status -eq "Running") {
            Write-Host "✅ PostgreSQL服务: $($service.DisplayName) - 状态: $($service.Status)" -ForegroundColor Green
            $pgServiceRunning = $true
        }
    }
}

if (!$pgServiceRunning) {
    Write-Host "❌ PostgreSQL服务未运行" -ForegroundColor Red
    Write-Host "💡 请先启动PostgreSQL服务" -ForegroundColor Cyan
    Write-Host "   以管理员身份运行PowerShell并执行: Start-Service *postgresql*" -ForegroundColor Cyan
    exit 1
}

# 检查数据库连接
Write-Host "`n正在测试数据库连接..." -ForegroundColor Yellow

try {
    # 尝试运行psql命令
    $testResult = psql -U postgres -c "SELECT 'DB Connection OK';" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 数据库连接正常" -ForegroundColor Green
    } else {
        Write-Host "⚠️  数据库连接测试失败，但服务正在运行" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  无法测试数据库连接，但服务正在运行" -ForegroundColor Yellow
}

# 根据参数决定启动哪些组件
if ($All -or $Backend) {
    Write-Host "`n正在启动API服务..." -ForegroundColor Yellow
    
    # 检查API目录
    if (Test-Path ".\api") {
        Set-Location ".\api"
        
        # 安装依赖（如果需要）
        if (!(Test-Path ".\node_modules")) {
            Write-Host "正在安装API依赖..." -ForegroundColor Yellow
            npm install
        }
        
        # 启动API服务（在后台）
        Start-Process "npm" -ArgumentList "run", "dev"
        Write-Host "✅ API服务已启动 (端口 3000)" -ForegroundColor Green
        Set-Location ".."
    } else {
        Write-Host "❌ API目录不存在，请确认项目结构" -ForegroundColor Red
    }
}

if ($All -or $Frontend) {
    Write-Host "`n正在启动前端应用..." -ForegroundColor Yellow
    
    # 检查前端依赖
    if (!(Test-Path ".\node_modules")) {
        Write-Host "正在安装前端依赖..." -ForegroundColor Yellow
        npm install
    }
    
    # 启动前端应用（在后台）
    Start-Process "npm" -ArgumentList "run", "dev"
    Write-Host "✅ 前端应用已启动 (端口 5173)" -ForegroundColor Green
}

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "应用已启动！" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan

if ($All -or $Frontend) {
    Write-Host "前端应用: http://localhost:5173" -ForegroundColor Yellow
}
if ($All -or $Backend) {
    Write-Host "API服务: http://localhost:3000" -ForegroundColor Yellow
}
Write-Host "数据库: PostgreSQL (端口 5432)" -ForegroundColor Yellow

Write-Host "`n💡 提示: 打开浏览器访问前端应用地址开始使用" -ForegroundColor Cyan