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
            Write-Host "[SUCCESS] Found PostgreSQL installation: $path" -ForegroundColor Green
            Write-Host "   Bin directory: $binPath" -ForegroundColor White
            
            # 检查是否在PATH中
            $currentPath = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") -split ';'
            $pathInEnv = $currentPath -contains $binPath
            
            if ($pathInEnv) {
                Write-Host "[SUCCESS] This path is already in system PATH" -ForegroundColor Green
            } else {
                Write-Host "[ERROR] This path is not in system PATH" -ForegroundColor Red
                Write-Host "[INFO] Please add $binPath to system PATH environment variable" -ForegroundColor Cyan
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
    Write-Host "[ERROR] PostgreSQL installation not found" -ForegroundColor Red
    Write-Host "[INFO] Please install PostgreSQL first" -ForegroundColor Cyan
    Write-Host "   Download URL: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads" -ForegroundColor Cyan
} else {
    Write-Host "`n2. Checking environment variables..." -ForegroundColor Yellow
    
    $pathVar = $env:PATH
    $pgInPath = $pathVar -split ';' | Where-Object { $_ -match "PostgreSQL" }
    
    if ($pgInPath) {
        Write-Host "[SUCCESS] PostgreSQL path is in current session PATH:" -ForegroundColor Green
        foreach ($item in $pgInPath) {
            Write-Host "   $item" -ForegroundColor White
        }
    } else {
        Write-Host "[WARNING] PostgreSQL path is not in current session PATH" -ForegroundColor Yellow
        Write-Host "[INFO] Please restart PowerShell to load new environment variables" -ForegroundColor Cyan
    }
    
    Write-Host "`n3. Trying to run pg_config directly..." -ForegroundColor Yellow
    
    # 尝试直接运行pg_config
    $pgFound = Get-Command "pg_config.exe" -ErrorAction SilentlyContinue
    if ($pgFound) {
        Write-Host "[SUCCESS] pg_config command is available" -ForegroundColor Green
        try {
            $version = & pg_config --version
            Write-Host "[SUCCESS] PostgreSQL version: $version" -ForegroundColor Green
        } catch {
            Write-Host "[ERROR] Failed to run pg_config: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "[ERROR] pg_config command is not available" -ForegroundColor Red
        
        # 尝试在可能的路径中直接运行
        foreach ($pathPattern in $pgPaths) {
            $paths = Get-Item $pathPattern -ErrorAction SilentlyContinue | Sort-Object Name -Descending
            foreach ($path in $paths) {
                $binPath = Join-Path $path "bin"
                $pgConfig = Join-Path $binPath "pg_config.exe"
                
                if (Test-Path $pgConfig) {
                    Write-Host "   Trying path: $pgConfig" -ForegroundColor White
                    try {
                        $version = & $pgConfig --version
                        Write-Host "   [SUCCESS] PostgreSQL version: $version" -ForegroundColor Green
                        Write-Host "   [INFO] Please add $binPath to system PATH environment variable" -ForegroundColor Cyan
                        break
                    } catch {
                        Write-Host "   [ERROR] Cannot run pg_config: $($_.Exception.Message)" -ForegroundColor Red
                    }
                }
            }
        }
    }
}

Write-Host "`n4. Checking PostgreSQL service..." -ForegroundColor Yellow

$pgServices = Get-Service | Where-Object { $_.Name -like "*postgresql*" -or $_.DisplayName -like "*PostgreSQL*" }

if ($pgServices) {
    foreach ($service in $pgServices) {
        $status = $service.Status
        $name = $service.Name
        $displayName = $service.DisplayName
        
        if ($status -eq "Running") {
            Write-Host "[SUCCESS] Service: $displayName - Status: $status" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Service: $displayName - Status: $status" -ForegroundColor Red
            Write-Host "[INFO] Please start the PostgreSQL service" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "[ERROR] PostgreSQL service not found" -ForegroundColor Red
    Write-Host "[INFO] Please confirm PostgreSQL was installed correctly and registered as a service" -ForegroundColor Cyan
}

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "Diagnosis completed" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan

Write-Host "`nCommon Solutions:" -ForegroundColor Yellow
Write-Host "1. If PostgreSQL is installed but commands are unavailable, add the installation path to PATH environment variable" -ForegroundColor White
Write-Host "2. If service is not running, start PowerShell as administrator and run: Start-Service *postgresql*" -ForegroundColor White
Write-Host "3. If you just installed PostgreSQL, restart PowerShell to load environment variables" -ForegroundColor White
Write-Host "4. Check firewall settings that might block PostgreSQL port (default 5432)" -ForegroundColor White