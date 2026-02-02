# PostgreSQL Database Setup Helper
# This script guides you through setting up the database manually

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Growth Tracker - PostgreSQL Database Setup Helper" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

Write-Host "`nDetected PostgreSQL is installed and service is running." -ForegroundColor Green
Write-Host "However, authentication is required." -ForegroundColor Yellow

Write-Host "`nSteps to set up the database:" -ForegroundColor Yellow

Write-Host "1. Open a new Command Prompt as Administrator" -ForegroundColor White
Write-Host "2. Navigate to PostgreSQL bin directory:" -ForegroundColor White
Write-Host "   cd `"C:\Program Files\PostgreSQL\18\bin`"" -ForegroundColor White
Write-Host "3. Run the SQL script directly:" -ForegroundColor White
Write-Host "   psql -U postgres -d postgres -f `"D:\Qoder\init_growth_tracker_db.sql`"" -ForegroundColor White
Write-Host "4. Enter your PostgreSQL password when prompted" -ForegroundColor White

Write-Host "`nAlternatively, you can run this command directly in Command Prompt:" -ForegroundColor Yellow
Write-Host "SET PGPASSWORD=your_actual_password && psql -U postgres -f `"D:\Qoder\init_growth_tracker_db.sql`" && SET PGPASSWORD=" -ForegroundColor White

Write-Host "`nIf you're still having authentication issues, you may need to:" -ForegroundColor Yellow
Write-Host "1. Reset the postgres user password using pgAdmin or single-user mode" -ForegroundColor White
Write-Host "2. Check the pg_hba.conf file to ensure authentication method is set correctly" -ForegroundColor White
Write-Host "3. The pg_hba.conf file is typically located at:" -ForegroundColor White
Write-Host "   C:\Program Files\PostgreSQL\18\data\pg_hba.conf" -ForegroundColor White

Write-Host "`nFor pg_hba.conf, ensure there's a line similar to:" -ForegroundColor White
Write-Host "   host    all             all             127.0.0.1/32            md5" -ForegroundColor White

Write-Host "`nAfter making changes to pg_hba.conf, restart the PostgreSQL service." -ForegroundColor Yellow

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "Setup helper completed" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan