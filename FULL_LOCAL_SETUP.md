# 成长追踪器 - 本地完整设置指南

## 概述

本指南将帮助您在本地环境中完整设置成长追踪器，包括前端、后端API和PostgreSQL数据库。

## 系统要求

- Node.js (v16 或更高版本)
- PostgreSQL (v12 或更高版本)
- npm 或 yarn
- Git (可选)

## 安装步骤

### 1. 安装依赖软件

#### 安装Node.js
- 访问 https://nodejs.org/
- 下载并安装最新LTS版本

#### 安装PostgreSQL
- 访问 https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
- 下载并安装PostgreSQL
- 记住安装过程中设置的超级用户密码

### 2. 克隆或下载项目

```bash
git clone <repository-url>
# 或直接下载ZIP文件并解压
```

### 3. 设置PostgreSQL数据库

#### 方法1：使用SQL脚本
```bash
# 连接到PostgreSQL并运行初始化脚本
psql -U postgres -f init-database.sql
```

#### 方法2：手动设置
```bash
# 连接到PostgreSQL
psql -U postgres

# 在psql中执行以下命令：
# 创建数据库
CREATE DATABASE growth_tracker;

# 连接到数据库并创建扩展
\c growth_tracker
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

# 退出
\q
```

### 4. 配置API服务

```bash
# 进入API目录
cd api

# 安装依赖
npm install

# 配置数据库连接
cp .env.example .env
# 编辑 .env 文件，更新数据库配置：
# DB_PASSWORD=您在安装PostgreSQL时设置的密码
```

### 5. 启动API服务

```bash
# 在api目录中
npm run dev
# 或
node server.js
```

API服务将在 http://localhost:3000 上运行。

### 6. 配置前端应用

```bash
# 在项目根目录
npm install
```

### 7. 启动前端应用

```bash
# 在项目根目录
npm run dev
```

前端应用将在 http://localhost:5173 (或下一个可用端口) 上运行。

## 验证安装

1. 打开浏览器访问前端应用地址
2. 尝试注册或登录
3. 检查控制台是否有关于API连接的错误
4. 检查PostgreSQL数据库是否已创建相应的表

## 故障排除

### 数据库连接问题
- 确认PostgreSQL服务正在运行
- 检查api/.env中的数据库配置
- 确认数据库密码正确

### 端口冲突
- 检查端口3000 (API) 和 5173 (前端) 是否已被占用
- 更改相应配置文件中的端口号

### 权限问题
- 确认PostgreSQL用户有足够权限访问数据库
- 检查防火墙设置

## 开发模式

在开发模式下，您可以：

- 前端代码更改会自动热重载
- API服务可通过 nodemon 自动重启
- 使用PostgreSQL进行持久化数据存储

## 生产部署

要部署到生产环境：

1. 使用Docker Compose进行容器化部署
2. 配置环境变量
3. 设置反向代理（如Nginx）
4. 配置SSL证书

参见 DEPLOYMENT.md 和 ALIBABA_DEPLOYMENT.md 获取详细部署说明。

## 数据库结构

系统包含以下表：

- `profiles`: 用户资料
- `skills`: 技能信息
- `goals`: 目标信息
- `achievements`: 成就信息

## API端点

- `GET /profiles/:id` - 获取用户资料
- `POST /profiles` - 创建/更新用户资料
- `GET /skills?user_id=:id` - 获取用户技能
- `POST /skills` - 创建技能
- `PUT /skills/:id` - 更新技能
- `DELETE /skills/:id` - 删除技能
- `GET /goals?user_id=:id` - 获取用户目标
- `POST /goals` - 创建目标
- `PUT /goals/:id` - 更新目标
- `DELETE /goals/:id` - 删除目标
- `GET /achievements?user_id=:id` - 获取用户成就
- `POST /achievements` - 创建成就
- `DELETE /achievements/:id` - 删除成就

## 环境变量

### 前端环境变量
- `VITE_API_URL` - API服务地址

### 后端环境变量
- `DB_HOST` - 数据库主机
- `DB_USER` - 数据库用户
- `DB_NAME` - 数据库名
- `DB_PASSWORD` - 数据库密码
- `DB_PORT` - 数据库端口
- `PORT` - API服务端口

## 维护

### 备份数据库
```bash
pg_dump -U postgres growth_tracker > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 恢复数据库
```bash
psql -U postgres -d growth_tracker -f backup_file.sql
```

## 性能优化

- 为经常查询的字段添加索引
- 定期清理不需要的数据
- 配置适当的连接池大小
- 使用缓存层（如Redis）提高性能

---
成功完成本地完整设置后，您将拥有一个功能齐全的成长追踪器应用，具有持久化数据存储能力。