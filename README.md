# 成长追踪器 - 个人成长管理系统

🌱 记录技能、目标和成就，见证你的成长历程

## ✨ 功能特色

- 📈 **技能追踪** - 可视化技能成长趋势，多维度分析
- 📅 **目标管理** - 设定目标、跟踪进度、及时提醒
- 🏆 **成就系统** - 记录里程碑，激励持续进步
- 🎨 **主题切换** - 多种配色方案，个性化体验
- 📤 **数据导出** - 支持 JSON/PDF 导出备份
- 🔔 **智能提醒** - 目标到期自动通知
- 📱 **PWA 支持** - 可安装至桌面，离线可用
- 🗄️ **本地数据库** - 支持自托管数据库，数据完全掌控

## 🚀 快速开始

### 本地开发

```bash
# 克隆项目
git clone <repository-url>
cd growth-tracker

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 生产部署

使用 Docker 部署：

```bash
# 构建并启动完整栈（前端+后端+数据库）
docker compose up -d

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f

# 或单独部署前端
docker build -t growth-tracker .
docker run -d -p 80:80 growth-tracker
```

## 🔧 技术栈

- **前端框架**: React + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS + 自定义主题
- **UI组件**: 自定义组件库
- **后端API**: Node.js + Express
- **数据库**: PostgreSQL
- **部署**: Docker + Nginx

## 📁 项目结构

```
.
├── src/                    # 前端源码
│   ├── components/         # UI组件
│   ├── hooks/             # 自定义Hooks
│   ├── lib/               # 工具函数
│   ├── types/             # 类型定义
│   └── pages/             # 页面组件
├── api/                   # 后端API服务
├── db/                    # 数据库初始化脚本
├── public/                # 静态资源
├── Dockerfile             # 前端Docker配置
├── docker-compose.yml     # 完整栈部署配置
└── nginx.conf             # Nginx配置
```

## 🎨 主题定制

系统提供多种主题：

- 默认紫
- 海洋蓝
- 森林绿
- 日落橙
- 午夜黑

通过主题切换器可实时预览和应用。

## 📊 数据分析

- 技能雷达图
- 技能排行榜
- 技能分布饼图
- 年度成长回顾

## 🔄 数据管理

- 本地存储（未登录状态）
- 自托管数据库（PostgreSQL）
- 数据导入/导出
- 跨设备同步

## 📱 PWA 功能

- 添加到主屏幕
- 离线可用
- 推送通知
- 设备兼容

## ☁️ 阿里云部署

支持一键部署到阿里云：

1. **准备阿里云ECS实例**
   - 规格：2核4GB内存起步
   - 系统：Ubuntu 20.04 LTS
   - 开放端口：80, 443, 22

2. **使用一键部署脚本**
   ```bash
   # 上传项目文件到服务器
   chmod +x aliyun-deploy.sh
   ./aliyun-deploy.sh
   ```

3. **详细部署指南**见 [ALIBABA_DEPLOYMENT.md](./ALIBABA_DEPLOYMENT.md)

## 🖥️ 本地开发环境

### 1. 安装PostgreSQL数据库

按照 [POSTGRESQL_SETUP_GUIDE.md](./POSTGRESQL_SETUP_GUIDE.md) 的说明安装PostgreSQL。

### 2. 验证PostgreSQL安装

在PowerShell中运行以下命令检查安装状态：
```powershell
.\diagnose-postgres.ps1
```

### 3. 初始化数据库

1. **使用PowerShell脚本创建数据库和表结构**
   ```powershell
   # 请替换your_password为您的PostgreSQL密码
   .\init-postgres-db.ps1 "your_password"
   ```

2. **或手动初始化**
   ```bash
   # 连接到PostgreSQL
   psql -U postgres
   
   # 在psql中执行以下命令
   CREATE DATABASE growth_tracker;
   \c growth_tracker
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   \q
   ```

### 3. 配置API服务

1. **安装API依赖**
   ```bash
   cd api
   npm install
   ```

2. **配置数据库连接**
   ```bash
   # 在api目录下创建环境配置文件
   cp .env.example .env
   # 编辑 .env 文件，填入正确的数据库配置
   ```

3. **启动API服务**
   ```bash
   npm run dev
   ```

### 4. 启动前端应用

```bash
# 在项目根目录
npm install
npm run dev
```

### 本地开发架构

```
前端应用 (React) ←→ API服务 (Node.js/Express) ←→ PostgreSQL数据库
端口: 5173/5174         端口: 3000                端口: 5432
```

## 🛠️ 本地自托管

### 环境配置

1. **配置数据库连接**
   ```bash
   # 编辑 .env 文件
   nano .env.local
   ```

2. **启动完整服务栈**
   ```bash
   # 启动数据库、API和前端
   docker-compose up -d
   ```

### 自定义API端点

修改 `src/lib/api-client.ts` 配置你的API服务器：

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
```

## 📄 部署

详见 [DEPLOYMENT.md](./DEPLOYMENT.md) 和 [ALIBABA_DEPLOYMENT.md](./ALIBABA_DEPLOYMENT.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

💡 **小贴士**: 定期记录成长点滴，积少成多，终将成就更好的自己！