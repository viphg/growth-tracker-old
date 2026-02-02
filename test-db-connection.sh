# 数据库连接测试脚本

echo "正在测试PostgreSQL数据库连接..."

# 检查PostgreSQL是否已安装
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL 已安装"
else
    echo "❌ PostgreSQL 未安装"
    echo "请先安装PostgreSQL，然后重试"
    exit 1
fi

# 检查数据库是否存在
echo "正在检查数据库连接..."
PGPASSWORD=${DB_PASSWORD:-your_postgres_password} psql -h ${DB_HOST:-localhost} -U ${DB_USER:-postgres} -d ${DB_NAME:-growth_tracker} -c "SELECT 'Database connection successful' as status;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ 数据库连接成功"
    echo " "
    echo "现在您可以："
    echo "1. 确保PostgreSQL服务正在运行"
    echo "2. 更新 api/.env 文件中的数据库密码"
    echo "3. 重启API服务: cd api && node server.js"
    echo "4. 启动前端应用: npm run dev"
    echo " "
    echo "应用将在以下地址运行："
    echo "- 前端: http://localhost:5173"
    echo "- API: http://localhost:3000"
    echo "- 数据库: http://localhost:5432"
else
    echo "❌ 数据库连接失败"
    echo " "
    echo "请确保："
    echo "1. PostgreSQL服务正在运行"
    echo "2. 数据库 'growth_tracker' 已创建"
    echo "3. api/.env 文件中的数据库配置正确"
    echo "4. 数据库密码正确"
fi