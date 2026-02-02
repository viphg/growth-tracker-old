# 检查PostgreSQL安装和配置脚本
# PowerShell版本

Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow

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
    Write-Host "[SUCCESS] Found PostgreSQL installation: $pgPath" -ForegroundColor Green
    
    $binPath = Join-Path $pgPath "bin"
    Write-Host "[SUCCESS] PostgreSQL bin directory: $binPath" -ForegroundColor Green
    
    # 检查PATH中是否已包含PostgreSQL路径
    $currentPath = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") -split ';'
    $pathExists = $currentPath -contains $binPath
    
    if ($pathExists) {
        Write-Host "[SUCCESS] PostgreSQL path is already in system PATH" -ForegroundColor Green
        
        # 测试pg_config命令
        try {
            $version = & "$binPath\pg_config.exe" --version
            Write-Host "[SUCCESS] PostgreSQL version: $version" -ForegroundColor Green
            
            # 测试数据库连接
            Write-Host "`nTesting database connection..." -ForegroundColor Yellow
            try {
                # 尝试连接到PostgreSQL
                $connTest = & "$binPath\psql.exe" -U postgres -c "SELECT version();" -t 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "[SUCCESS] Database connection successful!" -ForegroundColor Green
                } else {
                    Write-Host "[WARNING] Database connection test failed, please check if PostgreSQL service is running" -ForegroundColor Red
                    Write-Host "[INFO] Tip: You can start the 'postgresql-*' service in Windows Services" -ForegroundColor Cyan
                }
            } catch {
                Write-Host "[WARNING] Cannot connect to database, please check if PostgreSQL service is running" -ForegroundColor Red
            }
        } catch {
            Write-Host "[ERROR] pg_config command test failed" -ForegroundColor Red
        }
    } else {
        Write-Host "[ERROR] PostgreSQL path is not in system PATH" -ForegroundColor Red
        Write-Host "[INFO] Please add $binPath to system PATH environment variable" -ForegroundColor Cyan
        
        Write-Host "`nManual PATH addition steps:" -ForegroundColor Yellow
        Write-Host "1. Right-click 'This PC' -> 'Properties'" -ForegroundColor White
        Write-Host "2. Click 'Advanced system settings'" -ForegroundColor White
        Write-Host "3. Click 'Environment Variables'" -ForegroundColor White
        Write-Host "4. In 'System Variables' find 'Path', click 'Edit'" -ForegroundColor White
        Write-Host "5. Click 'New', add: $binPath" -ForegroundColor White
        Write-Host "6. Click 'OK' to save" -ForegroundColor White
        Write-Host "7. Restart PowerShell" -ForegroundColor White
    }
} else {
    Write-Host "[ERROR] PostgreSQL installation not found" -ForegroundColor Red
    Write-Host "[INFO] Please confirm PostgreSQL is properly installed" -ForegroundColor Cyan
    Write-Host "   Default installation path is usually: C:\Program Files\PostgreSQL\[version]" -ForegroundColor Cyan
}

Write-Host "`nTip: If you just installed PostgreSQL, please restart PowerShell to make environment variables take effect." -ForegroundColor Magenta