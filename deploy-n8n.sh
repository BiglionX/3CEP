#!/bin/bash

# n8n自动化部署脚本 (Linux/macOS版本)
# ================================================

set -e  # 遇到错误立即退出

echo "🚀 开始部署n8n自动化工作流平台..."

# 检查必要工具
echo "🔍 检查必要工具..."
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: 未找到Docker，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ 错误: 未找到docker-compose，请先安装docker-compose"
    exit 1
fi

echo "✅ Docker和docker-compose已安装"

# 检查环境变量文件
if [ ! -f ".env.n8n" ]; then
    echo "❌ 错误: 未找到.env.n8n配置文件"
    echo "💡 请复制.env.n8n.example并配置相关参数"
    exit 1
fi

# 加载环境变量
source .env.n8n

# 检查必要配置
echo "🔍 检查必要配置..."
if [ "$N8N_ENCRYPTION_KEY" = "your-super-long-and-random-encryption-key-here-change-this-in-production" ]; then
    echo "❌ 错误: 请修改N8N_ENCRYPTION_KEY为强随机字符串"
    exit 1
fi

if [ "$POSTGRES_PASSWORD" = "your-secure-postgres-password-change-this" ]; then
    echo "❌ 错误: 请修改POSTGRES_PASSWORD为安全密码"
    exit 1
fi

echo "✅ 配置检查通过"

# 创建必要的目录
echo "📁 创建必要目录..."
mkdir -p n8n/custom
mkdir -p n8n/logs
mkdir -p n8n/nginx/conf.d
mkdir -p n8n/ssl

# 构建和启动服务
echo "🐳 构建和启动n8n服务..."
docker-compose -f docker-compose.n8n.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose -f docker-compose.n8n.yml ps

# 检查健康状态
echo "🏥 检查服务健康状态..."
if docker-compose -f docker-compose.n8n.yml exec n8n-postgres pg_isready -U n8n > /dev/null 2>&1; then
    echo "✅ PostgreSQL数据库运行正常"
else
    echo "❌ PostgreSQL数据库未响应"
    exit 1
fi

if docker-compose -f docker-compose.n8n.yml exec n8n-redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis服务运行正常"
else
    echo "❌ Redis服务未响应"
    exit 1
fi

# 等待n8n完全启动
echo "⏳ 等待n8n完全启动..."
for i in {1..30}; do
    if curl -f http://localhost:${N8N_PORT:-5678}/healthz > /dev/null 2>&1; then
        echo "✅ n8n服务启动成功"
        break
    fi
    echo "⏳ 等待中... ($i/30)"
    sleep 10
done

if ! curl -f http://localhost:${N8N_PORT:-5678}/healthz > /dev/null 2>&1; then
    echo "❌ n8n服务启动失败"
    docker-compose -f docker-compose.n8n.yml logs n8n
    exit 1
fi

# 显示访问信息
echo ""
echo "🎉 n8n部署完成！"
echo "========================================"
echo "访问地址: http://localhost:${N8N_PORT:-5678}"
echo "默认情况下无需登录即可使用"
echo "如需启用认证，请修改.env.n8n中的相关配置"
echo "========================================"
echo ""
echo "📋 管理命令:"
echo "  查看日志: docker-compose -f docker-compose.n8n.yml logs -f n8n"
echo "  停止服务: docker-compose -f docker-compose.n8n.yml down"
echo "  重启服务: docker-compose -f docker-compose.n8n.yml restart"
echo "  查看状态: docker-compose -f docker-compose.n8n.yml ps"
echo ""

echo "✅ 部署完成！"