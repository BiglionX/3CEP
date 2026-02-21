#!/bin/bash
# 工单管理系统部署脚本

echo "🚀 开始部署工单管理系统..."

# 1. 检查依赖
echo "1️⃣ 检查系统依赖..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

echo "✅ 依赖检查通过"

# 2. 安装依赖包
echo "2️⃣ 安装依赖包..."
npm install

# 3. 编译TypeScript
echo "3️⃣ 编译TypeScript..."
npx tsc

# 4. 运行测试
echo "4️⃣ 运行系统测试..."
node scripts/test-ticket-management.js

# 5. 启动服务
echo "5️⃣ 启动工单管理系统..."
echo "✅ 工单管理系统部署完成！"

echo ""
echo "🔧 系统功能:"
echo "   - 智能工单分配算法"
echo "   - SLA监控和自动升级"
echo "   - 自动结算处理"
echo "   - 实时状态监控"

echo ""
echo "📡 API端点:"
echo "   POST /api/tickets - 工单管理操作"
echo "   GET /api/tickets?action=statistics - 系统统计"

echo ""
echo "⏱️  建议的定时任务:"
echo "   */5 * * * * node scripts/check-overdue-tickets.js"
echo "   0 * * * * node scripts/process-auto-settlement.js"

echo ""
echo "📊 访问系统统计:"
echo "   curl 'http://localhost:3000/api/tickets?action=statistics'"