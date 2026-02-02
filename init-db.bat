@echo off
REM 自动化PostgreSQL数据库初始化脚本
REM 请在运行前确保PostgreSQL已安装并正在运行

echo ============================================
echo 成长追踪器 - PostgreSQL数据库初始化脚本
echo ============================================

REM 检查是否提供了数据库密码参数
if "%1"=="" (
  echo 错误: 请提供PostgreSQL超级用户密码作为参数
  echo 使用方法: init-db.bat your_password
  pause
  exit /b 1
)

set PG_PASSWORD=%1

echo.
echo 正在创建数据库...
echo CREATE DATABASE growth_tracker; | psql -U postgres -h localhost -p 5432 -W

echo.
echo 正在连接到数据库并创建扩展...
echo \c growth_tracker; CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; CREATE EXTENSION IF NOT EXISTS "pgcrypto"; | psql -U postgres -d postgres -h localhost -p 5432 -W

echo.
echo 正在创建数据库表结构...
echo Connecting to growth_tracker database to create tables...
psql -U postgres -d growth_tracker -h localhost -p 5432 -f ../db/init.sql -W

echo.
echo ============================================
echo 数据库初始化完成！
echo ============================================
echo.
echo 现在您可以：
echo 1. 更新 api/.env 文件中的数据库配置
echo 2. 运行 npm install 在 api 目录
echo 3. 启动API服务: npm run dev
echo.

pause