#!/bin/bash

# 阿里云一键部署脚本 - 成长追踪器

set -e  # 遇到错误时停止执行

echo "🚀 开始部署成长追踪器到阿里云..."

# 检查必要工具
echo "🔍 检查必要工具..."

if ! [ -x "$(command -v docker)" ]; then
  echo "❌ Docker 未安装，正在安装..."
  sudo apt update
  sudo apt install -y docker.io
  sudo systemctl start docker
  sudo systemctl enable docker
  sudo usermod -aG docker $USER
  echo "✅ Docker 安装完成"
else
  echo "✅ Docker 已安装"
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "❌ Docker Compose 未安装，正在安装 Docker Compose 插件..."
  # Docker Compose 现在是 Docker 的一个插件，通常随 Docker 一起安装
  echo "⚠️  Docker Compose 通常是作为 Docker 的一部分安装的"
  echo "✅ 请确保安装了带有 compose 插件的 Docker 版本"
else
  echo "✅ Docker Compose 已安装"
fi

# 检查项目文件
if [ ! -f "docker-compose.yml" ]; then
  echo "❌ docker-compose.yml 文件不存在"
  exit 1
fi

if [ ! -f ".env" ]; then
  if [ -f ".env.local" ]; then
    echo "📝 复制环境配置文件..."
    cp .env.local .env
    echo "⚠️ 请检查 .env 文件中的配置是否正确"
  else
    echo "❌ 未找到环境配置文件 .env 或 .env.local"
    exit 1
  fi
fi

# 构建并启动服务
echo "🔨 构建并启动服务..."
docker compose down || true  # 忽略错误
docker compose build
docker compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "✅ 检查服务状态..."
docker compose ps

echo ""
echo "🎉 部署完成！"
echo ""
echo "🌐 应用访问地址: http://$(curl -s ifconfig.me)"
echo "📋 查看服务状态: docker-compose ps"
echo "📊 查看应用日志: docker compose logs app"
echo "📊 查看API日志: docker compose logs api"
echo "📊 查看数据库日志: docker compose logs db"
echo ""
echo "🔧 如需停止服务: docker-compose down"
echo "🔄 如需重启服务: docker-compose restart"
echo ""
echo "💡 提示: 首次启动可能需要几分钟，请耐心等待。"
echo "💡 提示: 请确保安全组已开放80端口以供访问。"