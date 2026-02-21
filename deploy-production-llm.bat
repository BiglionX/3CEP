@echo off
REM 大模型API集成生产部署脚本 (Windows版本)

echo 🚀 开始大模型API集成生产部署...

REM 1. 代码检查和测试
echo 📋 执行代码质量检查...
npm run lint
if %errorlevel% neq 0 (
    echo ❌ 代码检查失败
    exit /b 1
)

npm run build
if %errorlevel% neq 0 (
    echo ❌ 构建失败
    exit /b 1
)

REM 2. 运行集成测试
echo 🧪 执行集成测试...
node scripts\test-large-model-integration.js
if %errorlevel% neq 0 (
    echo ❌ 集成测试失败
    exit /b 1
)

REM 3. 环境变量验证
echo 🔐 验证环境变量配置...
if "%DEEPSEEK_API_KEY%"=="" (
    echo ❌ 错误: 未配置DEEPSEEK_API_KEY
    exit /b 1
)

if "%QWEN_API_KEY%"=="" (
    echo ❌ 错误: 未配置QWEN_API_KEY
    exit /b 1
)

echo ✅ 环境变量配置正常

REM 4. 数据库迁移检查
echo 🗄️  检查数据库状态...
npx supabase migration list

REM 5. 启动生产服务
echo 🏃 启动生产服务...
npm run start

echo 🎉 部署完成！服务已启动
echo 📊 监控端点: http://localhost:3001/api/b2b-procurement/parse-demand-llm

pause