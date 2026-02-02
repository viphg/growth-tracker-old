# PostgreSQL验证和配置脚本
# PowerShell版本

Write-Host "正在检查PostgreSQL安装..." -ForegroundColor Yellow

# 尝试查找PostgreSQL安装路径
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\*",
    "C:\Program Files (x86)\PostgreSQL\*",
    "$env:ProgramFiles\PostgreSQL\*",
    "${env:ProgramFiles(x86)}\PostgreSQL\*"
)

$pgPath = $null

foreach ($pathPattern in $possiblePaths) {
    $paths = Get-Item $pathPattern -ErrorAction SilentlyContinue | Sort-Object Name -Descending
    foreach ($path in $paths) {
        $binPath = Join-Path $path "bin"
        $pgConfig = Join-Path $binPath "pg_config.exe"
        
        if (Test-Path $pgConfig) {
            $pgPath = $path
            break
        }
    }
    
    if ($pgPath) {
        break
    }
}

if ($pgPath) {
    Write-Host "✅ 找到PostgreSQL安装路径: $pgPath" -ForegroundColor Green
    
    $binPath = Join-Path $pgPath "bin"
    Write-Host "✅ PostgreSQL bin目录: $binPath" -ForegroundColor Green
    
    # 检查PATH中是否已包含PostgreSQL路径
    $currentPath = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") -split ';'
    $pathExists = $currentPath -contains $binPath
    
    if ($pathExists) {
        Write-Host "✅ PostgreSQL路径已在系统PATH中" -ForegroundColor Green
        
        # 测试pg_config命令
        try {
            $version = & "$binPath\pg_config.exe" --version
            Write-Host "✅ PostgreSQL版本: $version" -ForegroundColor Green
            
            # 测试数据库连接
            Write-Host "`n正在测试数据库连接..." -ForegroundColor Yellow
            try {
                # 尝试连接到PostgreSQL
                $connTest = & "$binPath\psql.exe" -U postgres -c "SELECT version();" -t 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ 数据库连接成功!" -ForegroundColor Green
                } else {
                    Write-Host "⚠️  数据库连接测试失败，请检查PostgreSQL服务是否正在运行" -ForegroundColor Red
                    Write-Host "💡 提示: 您可以在Windows服务中启动'postgresql-*'服务" -ForegroundColor Cyan
                }
            } catch {
                Write-Host "⚠️  无法连接到数据库，请检查PostgreSQL服务是否正在运行" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ pg_config命令测试失败" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ PostgreSQL路径未在系统PATH中" -ForegroundColor Red
        Write-Host "💡 请将 $binPath 添加到系统PATH环境变量中" -ForegroundColor Cyan
        
        Write-Host "`n手动添加PATH的方法:" -ForegroundColor Yellow
        Write-Host "1. 右键'此电脑' → '属性'" -ForegroundColor White
        Write-Host "2. 点击'高级系统设置'" -ForegroundColor White
        Write-Host "3. 点击'环境变量'" -ForegroundColor White
        Write-Host "4. 在'系统变量'中找到'Path'，点击'编辑'" -ForegroundColor White
        Write-Host "5. 点击'新建'，添加: $binPath" -ForegroundColor White
        Write-Host "6. 点击'确定'保存" -ForegroundColor White
        Write-Host "7. 重新启动PowerShell" -ForegroundColor White
    }
} else {
    Write-Host "❌ 未找到PostgreSQL安装" -ForegroundColor Red
    Write-Host "💡 请确认PostgreSQL已正确安装" -ForegroundColor Cyan
    Write-Host "   默认安装路径通常是: C:\Program Files\PostgreSQL\[版本号]" -ForegroundColor Cyan
}

Write-Host "`n提示: 如果刚安装PostgreSQL，请重新启动PowerShell以使环境变量生效。" -ForegroundColor Magenta