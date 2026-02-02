# PostgreSQL数据库初始化脚本
# PowerShell版本

param(
    [Parameter(Mandatory=$true)]
    [string]$Password
)

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "成长追踪器 - PostgreSQL数据库初始化脚本" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# 检查PostgreSQL是否已安装
Write-Host "`n正在检查PostgreSQL安装..." -ForegroundColor Yellow

$pgPath = $null
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\*",
    "C:\Program Files (x86)\PostgreSQL\*",
    "$env:ProgramFiles\PostgreSQL\*",
    "${env:ProgramFiles(x86)}\PostgreSQL\*"
)

foreach ($pathPattern in $possiblePaths) {
    $paths = Get-Item $pathPattern -ErrorAction SilentlyContinue | Sort-Object Name -Descending
    foreach ($path in $paths) {
        $binPath = Join-Path $path "bin"
        $pgConfig = Join-Path $binPath "pg_config.exe"
        
        if (Test-Path $pgConfig) {
            $pgPath = $path
            $binPath = Join-Path $path "bin"
            break
        }
    }
    
    if ($pgPath) {
        break
    }
}

if (-not $pgPath) {
    Write-Host "❌ 未找到PostgreSQL安装" -ForegroundColor Red
    Write-Host "💡 请先安装PostgreSQL并确保已添加到PATH环境变量" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ 找到PostgreSQL安装路径: $pgPath" -ForegroundColor Green

# 设置环境变量
$env:PGPASSWORD = $Password

try {
    # 创建数据库
    Write-Host "`n正在创建数据库 'growth_tracker'..." -ForegroundColor Yellow
    
    $createDbCmd = """
SELECT 'CREATE DATABASE growth_tracker' 
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'growth_tracker')
"""
    
    $result = & "$binPath\psql.exe" -U postgres -h localhost -p 5432 -c $createDbCmd
    Write-Host "✅ 数据库创建命令执行完成" -ForegroundColor Green

    # 连接到数据库并创建扩展和表
    Write-Host "`n正在连接到数据库并创建扩展..." -ForegroundColor Yellow
    
    # 创建扩展
    $extensionsSql = @"
\c growth_tracker
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
"@
    
    # 将SQL写入临时文件并执行
    $tempSqlFile = [System.IO.Path]::GetTempFileName()
    $extensionsSql | Out-File -FilePath $tempSqlFile -Encoding UTF8
    
    & "$binPath\psql.exe" -U postgres -h localhost -p 5432 -f $tempSqlFile
    Remove-Item $tempSqlFile
    
    Write-Host "✅ 扩展创建完成" -ForegroundColor Green

    # 创建表结构
    Write-Host "`n正在创建表结构..." -ForegroundColor Yellow
    
    $tablesSql = @"
\c growth_tracker

-- 创建 profiles 表
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL DEFAULT '我的成长之路',
    bio TEXT,
    avatar_url TEXT,
    email VARCHAR(255),
    location VARCHAR(255),
    website VARCHAR(255),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 skills 表
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    level INTEGER CHECK (level >= 0 AND level <= 100) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 goals 表
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline DATE NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 achievements 表
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    icon VARCHAR(10) DEFAULT '🏆',
    category VARCHAR(100) NOT NULL
);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 profiles 表添加更新时间触发器
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 为 skills 表添加更新时间触发器
DROP TRIGGER IF EXISTS update_skills_updated_at ON skills;
CREATE TRIGGER update_skills_updated_at 
    BEFORE UPDATE ON skills 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 创建一个示例用户
INSERT INTO profiles (id, name, bio, is_public) 
SELECT '123e4567-e89b-12d3-a456-426614174000', '示例用户', '这是一个示例用户', FALSE
WHERE NOT EXISTS (SELECT FROM profiles WHERE id = '123e4567-e89b-12d3-a456-426614174000');
"@
    
    $tempSqlFile = [System.IO.Path]::GetTempFileName()
    $tablesSql | Out-File -FilePath $tempSqlFile -Encoding UTF8
    
    & "$binPath\psql.exe" -U postgres -h localhost -p 5432 -f $tempSqlFile
    Remove-Item $tempSqlFile
    
    Write-Host "✅ 表结构创建完成" -ForegroundColor Green

    Write-Host "`n===========================================" -ForegroundColor Cyan
    Write-Host "数据库初始化完成！" -ForegroundColor Green
    Write-Host "===========================================" -ForegroundColor Cyan
    
    Write-Host "`n现在您可以：" -ForegroundColor Yellow
    Write-Host "1. 更新 api/.env 文件中的数据库配置" -ForegroundColor White
    Write-Host "2. 运行 npm install 在 api 目录" -ForegroundColor White
    Write-Host "3. 启动API服务: npm run dev" -ForegroundColor White
    
} catch {
    Write-Host "❌ 执行过程中出现错误: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # 清理环境变量
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}