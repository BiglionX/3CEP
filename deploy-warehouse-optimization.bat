@echo off
REM 智能分仓引擎Windows部署脚本

echo 🚀 开始部署智能分仓引擎...

REM 设置环境变量
set NODE_ENV=production

REM 构建项目
echo 🏗️  构建项目...
npm run build

REM 启动服务
echo 🏃 启动服务...
npm run start

REM 等待服务启动
echo ⏳ 等待服务启动...
timeout /t 10

REM 运行健康检查
echo 🏥 运行健康检查...
node scripts\test-warehouse-api.js

REM 运行功能测试
echo 🧪 运行功能测试...
npx ts-node scripts\test-warehouse-optimization.ts

echo ✅ 智能分仓引擎部署完成！
pause