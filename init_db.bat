@echo off
setlocal

echo ===========================================
echo Growth Tracker - PostgreSQL Database Setup
echo ===========================================

REM 设置当前目录
cd /d "D:\Qoder"

REM 设置PostgreSQL密码
set PGPASSWORD=database1!

echo.
echo Initializing PostgreSQL database with provided password...
echo.

REM 运行SQL脚本
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -f "init_growth_tracker_db.sql"

REM 清理环境变量
set PGPASSWORD=

echo.
echo ===========================================
echo Database setup completed
echo ===========================================

pause