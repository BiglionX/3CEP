#!/bin/bash
# 智能议价引擎生产环境部署脚本

set -e  # 遇到错误立即退出

echo "🚀 开始部署智能议价引擎到生产环境..."

# 配置变量
PROJECT_DIR="/var/www/3cep"
BACKUP_DIR="/var/backups/3cep"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "📁 创建备份目录..."
mkdir -p "$BACKUP_DIR"

echo "📦 备份当前版本..."
if [ -d "$PROJECT_DIR" ]; then
    tar -czf "${BACKUP_DIR}/3cep_backup_${TIMESTAMP}.tar.gz" -C "$(dirname $PROJECT_DIR)" "$(basename $PROJECT_DIR)"
    echo "✅ 备份完成: ${BACKUP_DIR}/3cep_backup_${TIMESTAMP}.tar.gz"
fi

echo "📥 克隆最新代码..."
cd /var/www
rm -rf 3cep_temp
git clone https://github.com/your-org/3cep.git 3cep_temp

echo "📋 切换到发布分支..."
cd 3cep_temp
git checkout production

echo "🔧 安装依赖..."
npm install --production

echo "⚙️  配置环境变量..."
# 这里需要根据实际的生产环境密钥进行配置
cp .env.production .env.local

echo "🗄️  执行数据库迁移..."
npx supabase db push --local

echo "🏗️  构建应用..."
npm run build

echo "🧹 清理旧版本..."
if [ -d "$PROJECT_DIR" ]; then
    rm -rf "$PROJECT_DIR"
fi

echo "🚚 部署新版本..."
mv 3cep_temp "$PROJECT_DIR"

echo "サービ 启动服务..."
cd "$PROJECT_DIR"
pm2 restart 3cep || pm2 start npm --name "3cep" -- start

echo "🔍 验证部署..."
sleep 10
curl -f http://localhost:3000/api/health || echo "⚠️  健康检查失败"

echo "📊 部署验证..."
node scripts/validate-negotiation-engine.js

echo "✅ 智能议价引擎生产环境部署完成！"
echo "应用查看地址: http://your-domain.com/negotiation"
