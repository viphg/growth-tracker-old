# 本地PostgreSQL安装和配置指南

## Windows系统安装PostgreSQL

### 方法一：使用官方安装包（推荐）

1. **下载PostgreSQL**
   - 访问 https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
   - 选择适合您系统的版本（Windows）
   - 下载安装文件

2. **安装PostgreSQL**
   - 运行下载的安装程序
   - 选择安装路径（建议使用默认路径）
   - 选择要安装的组件（建议全选）
   - 设置超级用户（postgres）密码（记住这个密码）
   - 选择端口（默认5432）
   - 选择区域设置（建议使用默认）
   - 完成安装

3. **配置环境变量**
   - 安装完成后，需要将PostgreSQL的bin目录添加到系统PATH环境变量
   - 默认路径通常为：`C:\Program Files\PostgreSQL\<版本号>\bin`
   - 添加方法：
     1. 右键"此电脑" → "属性"
     2. 点击"高级系统设置"
     3. 点击"环境变量"
     4. 在"系统变量"中找到"Path"，点击"编辑"
     5. 点击"新建"，添加PostgreSQL的bin目录路径
     6. 点击"确定"保存
     7. 重新启动PowerShell或命令提示符

4. **验证安装**
   - 重新打开PowerShell或命令提示符
   - 输入以下命令验证安装：
   ```powershell
   pg_config --version
   ```

### 方法二：使用Chocolatey（如果已安装）

```cmd
choco install postgresql
```

## 验证PostgreSQL安装

我们提供了一个PowerShell脚本来帮助您验证PostgreSQL安装：

```powershell
# 运行验证脚本
.\check-postgres.ps1
```

## 初始化数据库

### 1. 启动PostgreSQL服务
PostgreSQL安装后会自动启动服务，您可以通过Windows服务管理器检查服务状态。
如果服务未运行，在Windows服务中启动名为 "postgresql-*" 的服务。

### 2. 使用脚本创建数据库和表结构

我们提供了一个自动化的PowerShell脚本来创建数据库和表结构：

```powershell
# 用法：.\init-postgres-db.ps1 "您的PostgreSQL密码"
.\init-postgres-db.ps1 "your_password"
```

### 3. 手动初始化（备用方法）

如果脚本方法不工作，可以手动执行以下步骤：

打开PowerShell，使用以下命令创建数据库和必要的扩展：

```powershell
# 连接到PostgreSQL（使用您的密码替换"your_password"）
$env:PGPASSWORD="your_password"
psql -U postgres

# 在psql提示符下执行以下命令：
# 创建数据库
CREATE DATABASE growth_tracker;

# 连接到数据库并创建扩展
\c growth_tracker
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

# 退出psql
\q
```

## 配置环境变量

在 `api` 目录下创建 `.env` 文件：

```env
DB_HOST=localhost
DB_USER=postgres
DB_NAME=growth_tracker
DB_PASSWORD=your_postgres_password
DB_PORT=5432
PORT=3000
NODE_ENV=development
```

## 安装API服务依赖

```cmd
cd api
npm install
```

## 启动API服务

```cmd
cd api
npm run dev
```

## 验证数据库连接

API服务启动时会自动创建所需的表结构。您可以在启动后检查数据库：

```cmd
# 连接到数据库
psql -U postgres -d growth_tracker

# 查看表
\dt

# 退出
\q
```

## 故障排除

### 常见问题

1. **pg_config : 无法将"pg_config"项识别为 cmdlet、函数、脚本文件或可运行程序的名称**
   - 问题：PostgreSQL的bin目录未添加到PATH环境变量
   - 解决：按照上面的步骤将PostgreSQL bin目录添加到PATH

2. **无法连接到数据库**
   - 确认PostgreSQL服务正在运行
   - 检查用户名和密码是否正确
   - 确认端口号是否正确（默认5432）

3. **权限错误**
   - 确认用户有足够的权限访问数据库
   - 检查pg_hba.conf配置文件

4. **端口被占用**
   - 更改数据库端口或停止占用端口的服务

### 检查PostgreSQL服务状态

在Windows服务管理器中查找 "postgresql" 或使用命令：

```cmd
sc query postgresql-x64-15
```

## 重要提示

1. 记住您设置的postgres用户密码，后续配置会用到
2. 确保防火墙没有阻止PostgreSQL使用的端口（默认5432）
3. 为了开发方便，可以使用pgAdmin等图形化工具管理数据库
4. 安装PostgreSQL后请重新启动PowerShell以使环境变量生效