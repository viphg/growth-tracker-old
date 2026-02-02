# 成长追踪器 - 部署指南

## 项目概述

成长追踪器是一个现代化的个人成长管理系统，帮助用户追踪技能、目标和成就，支持云端同步和离线使用。

## 部署方式

### 1. Docker 部署（推荐）

#### 构建并运行

```bash
# 构建并启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app
```

#### 环境变量配置

创建 `.env` 文件：

```env
# Supabase 配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# 数据库配置（如果使用内置数据库）
DB_USER=postgres
DB_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@db:5432/growth_tracker
```

### 2. 手动部署

#### 构建应用

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build
```

构建完成后，产物会在 `dist` 目录中，可以部署到任何静态文件服务器。

#### 配置 Web 服务器

对于 SPA 应用，需要配置服务器将所有路由重定向到 `index.html`：

##### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## PWA 功能

应用支持 PWA 特性：
- 可安装到主屏幕
- 离线使用
- 推送通知
- 设备兼容

## 环境要求

- Node.js 18+
- npm 或 yarn
- Docker 和 Docker Compose（用于容器化部署）

## 常见问题

### 1. 首次访问加载慢

由于应用使用了代码分割和懒加载，首次访问可能需要下载较多资源。后续访问会有缓存。

### 2. PWA 安装问题

确保部署使用 HTTPS 协议，否则 PWA 功能可能受限。

### 3. 数据同步问题

检查 Supabase 配置是否正确，确保网络连接正常。

## 维护

### 更新应用

```bash
# 拉取最新代码
git pull origin main

# 重建 Docker 镜像
docker-compose build --no-cache
docker-compose up -d
```

### 备份数据

数据主要存储在 Supabase 中，建议定期备份 Supabase 数据库。

## 性能优化

- 启用 Gzip 压缩
- 静态资源使用 CDN
- 配置浏览器缓存
- 使用负载均衡（高流量场景）