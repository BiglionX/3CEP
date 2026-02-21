#!/bin/bash
# 智能分仓引擎部署脚本

echo "🚀 开始部署智能分仓引擎..."

# 设置环境变量
export NODE_ENV=production

# 构建项目
echo "🏗️  构建项目..."
npm run build

# 启动服务
echo "🏃 启动服务..."
npm run start &

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 运行健康检查
echo "🏥 运行健康检查..."
node scripts/test-warehouse-api.js

# 运行功能测试
echo "🧪 运行功能测试..."
npx ts-node scripts/test-warehouse-optimization.ts

echo "✅ 智能分仓引擎部署完成！"