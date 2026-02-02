# 阿里云部署指南 - 成长追踪器

## 方案概述

本指南介绍如何将成长追踪器（包含前端、后端API和PostgreSQL数据库）完整部署到阿里云上。

## 部署架构

- **前端应用**: Nginx容器，提供Web界面
- **后端API**: Node.js Express应用，处理业务逻辑
- **数据库**: PostgreSQL，存储用户数据
- **部署方式**: Docker Compose容器化部署

## 阿里云资源配置

### 1. ECS实例配置建议
- **规格**: 2核4GB内存起步（可根据用户量调整）
- **操作系统**: Ubuntu 20.04 LTS 或 CentOS 7+
- **安全组规则**:
  - HTTP: 80 (允许公网访问)
  - HTTPS: 443 (可选，用于SSL)
  - SSH: 22 (管理用，建议限制IP)

### 2. RDS配置（可选，也可以使用ECS部署）
- **数据库类型**: PostgreSQL 12+
- **规格**: 2核4GB内存起步
- **存储**: 根据数据量选择（建议100GB起步）

## 部署步骤

### 步骤1: 准备ECS实例

1. 登录阿里云控制台，购买ECS实例
2. 配置安全组，开放必要端口
3. 连接到ECS实例

```bash
ssh root@<your-server-ip>
```

### 步骤2: 安装必要软件

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Docker
sudo apt install -y ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 添加当前用户到docker组
sudo usermod -aG docker $USER

# 验证安装
docker --version
docker compose version  # 注意：现在使用 'docker compose' 而不是 'docker-compose'
```

**注意**: 现代Docker安装使用 `docker compose` (子命令) 而不是独立的 `docker-compose` 命令。

### 步骤3: 上传项目文件

将项目文件上传到服务器（使用scp或Git克隆）：

```bash
# 如果使用Git
git clone <your-repo-url>
cd growth-tracker

# 或者使用SCP上传本地文件
scp -r ./* root@<your-server-ip>:/home/ubuntu/growth-tracker
```

### 步骤4: 配置环境变量

创建环境配置文件：

```bash
cd growth-tracker
cp .env.local .env

# 编辑环境变量（根据实际需求修改）
nano .env
```

### 步骤5: 部署应用

```bash
# 构建并启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 步骤6: 配置域名和SSL（可选）

如果使用自定义域名：

```bash
# 安装Certbot获取SSL证书
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d yourdomain.com
```

## 数据库备份与恢复

### 备份数据库

```bash
# 进入数据库容器
docker exec -it growth_tracker_db pg_dump -U postgres growth_tracker > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 恢复数据库

```bash
# 恢复数据库备份
docker exec -i growth_tracker_db psql -U postgres -d growth_tracker < backup_file.sql
```

## 监控与维护

### 查看服务状态

```bash
# 查看所有容器状态
docker-compose ps

# 查看日志
docker-compose logs app    # 前端日志
docker-compose logs api    # API日志
docker-compose logs db     # 数据库日志
```

### 更新应用

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动服务
docker-compose down
docker-compose build
docker-compose up -d
```

### 性能优化建议

1. **数据库优化**:
   - 定期清理不必要的数据
   - 配置合理的连接池大小

2. **应用优化**:
   - 使用CDN加速静态资源
   - 配置浏览器缓存策略

3. **安全加固**:
   - 定期更新系统和软件包
   - 配置防火墙规则
   - 使用强密码保护

## 故障排除

### 常见问题

1. **服务启动失败**:
   ```bash
   # 检查日志
   docker-compose logs
   ```

2. **数据库连接失败**:
   ```bash
   # 检查数据库容器状态
   docker-compose logs db
   ```

3. **前端无法访问API**:
   ```bash
   # 检查API服务状态
   docker-compose logs api
   ```

### 性能监控

```bash
# 查看容器资源使用情况
docker stats

# 查看系统资源使用
htop
```

## 成本优化

1. **按需升级**: 根据实际使用情况调整ECS规格
2. **自动快照**: 配置自动快照策略
3. **流量优化**: 启用CDN减少服务器带宽消耗

## 安全建议

1. **SSH访问**: 使用密钥认证，禁用密码登录
2. **数据库**: 不要将数据库端口暴露到公网
3. **定期更新**: 定期更新系统和应用的安全补丁

## 扩展方案

1. **负载均衡**: 使用阿里云SLB分发流量
2. **自动伸缩**: 配置弹性伸缩组应对流量变化
3. **多地部署**: 在多个地域部署以提高可用性

---

完成以上步骤后，您的成长追踪器将在阿里云上稳定运行，拥有完整的本地数据库和应用程序。