# PostgreSQL安装诊断脚本
# PowerShell版本

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "PostgreSQL安装诊断脚本" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

Write-Host "`n1. 检查PostgreSQL安装路径..." -ForegroundColor Yellow

$pgPaths = @(
    "C:\Program Files\PostgreSQL\*",
    "C:\Program Files (x86)\PostgreSQL\*",
    "$env:ProgramFiles\PostgreSQL\*",
    "${env:ProgramFiles(x86)}\PostgreSQL\*"
)

$foundPg = $false
foreach ($pathPattern in $pgPaths) {
    $paths = Get-Item $pathPattern -ErrorAction SilentlyContinue | Sort-Object Name -Descending
    foreach ($path in $paths) {
        $binPath = Join-Path $path "bin"
        $pgConfig = Join-Path $binPath "pg_config.exe"
        
        if (Test-Path $pgConfig) {
            Write-Host "? 找到PostgreSQL安装: $path" -ForegroundColor Green
            Write-Host "   Bin目录: $binPath" -ForegroundColor White
            
            # 检查是否在PATH中
            $currentPath = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") -split ';'
            $pathInEnv = $currentPath -contains $binPath
            
            if ($pathInEnv) {
                Write-Host "? 此路径已在系统PATH中" -ForegroundColor Green
            } else {
                Write-Host "? 此路径不在系统PATH中" -ForegroundColor Red
                Write-Host "?? 请将 $binPath 添加到系统PATH环境变量" -ForegroundColor Cyan
            }
            
            $foundPg = $true
            break
        }
    }
    
    if ($foundPg) {
        break
    }
}

if (-not $foundPg) {
    Write-Host "? 未找到PostgreSQL安装" -ForegroundColor Red
    Write-Host "?? 请先安装PostgreSQL" -ForegroundColor Cyan
    Write-Host "   下载地址: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads" -ForegroundColor Cyan
} else {
    Write-Host "`n2. 检查环境变量..." -ForegroundColor Yellow
    
    $pathVar = $env:PATH
    $pgInPath = $pathVar -split ';' | Where-Object { $_ -match "PostgreSQL" }
    
    if ($pgInPath) {
        Write-Host "? PostgreSQL路径在当前会话PATH中:" -ForegroundColor Green
        foreach ($item in $pgInPath) {
            Write-Host "   $item" -ForegroundColor White
        }
    } else {
        Write-Host "? PostgreSQL路径不在当前会话PATH中" -ForegroundColor Red
        Write-Host "?? 请重新启动PowerShell以加载新的环境变量" -ForegroundColor Cyan
    }
    
    Write-Host "`n3. 尝试直接运行pg_config..." -ForegroundColor Yellow
    
    # 尝试直接运行pg_config
    $pgFound = Get-Command "pg_config.exe" -ErrorAction SilentlyContinue
    if ($pgFound) {
        Write-Host "? pg_config命令可用" -ForegroundColor Green
        try {
            $version = & pg_config --version
            Write-Host "? PostgreSQL版本: $version" -ForegroundColor Green
        } catch {
            Write-Host "? pg_config执行失败: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "? pg_config命令不可用" -ForegroundColor Red
        
        # 尝试在可能的路径中直接运行
        foreach ($pathPattern in $pgPaths) {
            $paths = Get-Item $pathPattern -ErrorAction SilentlyContinue | Sort-Object Name -Descending
            foreach ($path in $paths) {
                $binPath = Join-Path $path "bin"
                $pgConfig = Join-Path $binPath "pg_config.exe"
                
                if (Test-Path $pgConfig) {
                    Write-Host "   尝试路径: $pgConfig" -ForegroundColor White
                    try {
                        $version = & $pgConfig --version
                        Write-Host "   ? PostgreSQL版本: $version" -ForegroundColor Green
                        Write-Host "   ?? 请将 $binPath 添加到系统PATH环境变量" -ForegroundColor Cyan
                        break
                    } catch {
                        Write-Host "   ? 无法运行pg_config: $($_.Exception.Message)" -ForegroundColor Red
                    }
                }
            }
        }
    }
}

Write-Host "`n4. 检查PostgreSQL服务..." -ForegroundColor Yellow

$pgServices = Get-Service | Where-Object { $_.Name -like "*postgresql*" -or $_.DisplayName -like "*PostgreSQL*" }

if ($pgServices) {
    foreach ($service in $pgServices) {
        $status = $service.Status
        $name = $service.Name
        $displayName = $service.DisplayName
        
        if ($status -eq "Running") {
            Write-Host "? 服务: $displayName - 状态: $status" -ForegroundColor Green
        } else {
            Write-Host "? 服务: $displayName - 状态: $status" -ForegroundColor Red
            Write-Host "?? 请启动PostgreSQL服务" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "? 未找到PostgreSQL服务" -ForegroundColor Red
    Write-Host "?? 请确认PostgreSQL已正确安装并已注册为服务" -ForegroundColor Cyan
}

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "诊断完成" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan

Write-Host "`n常见解决方案:" -ForegroundColor Yellow
Write-Host "1. 如果PostgreSQL已安装但命令不可用，请将安装路径添加到PATH环境变量" -ForegroundColor White
Write-Host "2. 如果服务未运行，请以管理员身份启动PowerShell并运行: Start-Service *postgresql*" -ForegroundColor White
Write-Host "3. 如果刚安装PostgreSQL，请重新启动PowerShell以加载环境变量" -ForegroundColor White
Write-Host "4. 检查防火墙设置是否阻止了PostgreSQL端口 (默认5432)" -ForegroundColor White