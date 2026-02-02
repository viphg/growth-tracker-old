#!/bin/bash

# 成长追踪器部署脚本

set -e  # 遇到错误时停止执行

echo "🌱 开始部署成长追踪器..."

# 检查 Docker 是否已安装
if ! [ -x "$(command -v docker)" ]; then
  echo "❌ Docker 未安装，请先安装 Docker"
  exit 1
fi

# 检查 Docker Compose 是否已安装
if ! [ -x "$(command -v docker-compose)" ]; then
  echo "⚠️ Docker Compose 未安装，尝试使用 docker compose (Docker v20.10.0+)"
  if ! docker compose version > /dev/null 2>&1; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
  fi
fi

# 构建并启动应用
echo "🔧 构建应用..."
if command -v docker-compose > /dev/null; then
  docker-compose build
  docker-compose up -d
else
  docker compose build
  docker compose up -d
fi

echo "✅ 应用已部署完成！"
echo ""
echo "🌐 访问地址: http://localhost"
echo "📋 查看状态: docker-compose ps"
echo "📊 查看日志: docker-compose logs -f app"
echo ""
echo "💡 提示: 首次启动可能需要几分钟，请耐心等待。"