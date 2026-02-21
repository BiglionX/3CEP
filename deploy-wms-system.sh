#!/bin/bash
# WMS系统部署脚本
# 用于部署海外仓智能管理系统

echo "🚀 开始部署WMS系统..."

# 检查环境变量
echo "🔧 检查环境配置..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ 缺少环境变量: NEXT_PUBLIC_SUPABASE_URL"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ 缺少环境变量: SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

echo "✅ 环境变量检查通过"

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 运行数据库迁移
echo "🗄️ 执行数据库迁移..."
npx supabase migration up

# 编译TypeScript
echo "⚡ 编译TypeScript代码..."
npm run build

# 运行集成测试
echo "🧪 执行集成测试..."
node scripts/test-wms-integration.js

if [ $? -ne 0 ]; then
    echo "❌ 集成测试失败，部署终止"
    exit 1
fi

echo "✅ 集成测试通过"

# 启动服务
echo "🚀 启动WMS服务..."
npm run dev &

# 等待服务启动
sleep 10

# 验证API接口
echo "🔍 验证API接口..."
curl -f http://localhost:3001/api/wms/connections || {
    echo "❌ API接口验证失败"
    exit 1
}

echo "✅ API接口验证通过"

# 启动定时同步任务
echo "⏰ 启动定时同步任务..."
node -e "
const { wmsSyncScheduler } = require('./src/lib/warehouse/wms-sync-scheduler');
wmsSyncScheduler.start().catch(console.error);
"

echo "🎉 WMS系统部署完成！"

echo ""
echo "📋 部署信息:"
echo "   - 服务地址: http://localhost:3001"
echo "   - API文档: http://localhost:3001/api/wms"
echo "   - 管理界面: http://localhost:3001/admin/wms"
echo ""
echo "🔧 管理命令:"
echo "   - 查看连接: curl http://localhost:3001/api/wms/connections"
echo "   - 手动同步: curl -X POST http://localhost:3001/api/wms/inventory -d '{\"action\":\"manual-sync\"}'"
echo "   - 状态检查: curl http://localhost:3001/api/wms/inventory?action=status"