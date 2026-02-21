@echo off
REM WMS系统Windows部署脚本
REM 用于在Windows环境下部署海外仓智能管理系统

echo 🚀 开始部署WMS系统...

REM 检查环境变量
echo 🔧 检查环境配置...
if "%NEXT_PUBLIC_SUPABASE_URL%"=="" (
    echo ❌ 缺少环境变量: NEXT_PUBLIC_SUPABASE_URL
    exit /b 1
)

if "%SUPABASE_SERVICE_ROLE_KEY%"=="" (
    echo ❌ 缺少环境变量: SUPABASE_SERVICE_ROLE_KEY
    exit /b 1
)

echo ✅ 环境变量检查通过

REM 安装依赖
echo 📦 安装项目依赖...
call npm install

REM 运行数据库迁移
echo 🗄️ 执行数据库迁移...
call npx supabase migration up

REM 编译TypeScript
echo ⚡ 编译TypeScript代码...
call npm run build

REM 运行集成测试
echo 🧪 执行集成测试...
node scripts\test-wms-integration.js

if %errorlevel% neq 0 (
    echo ❌ 集成测试失败，部署终止
    exit /b 1
)

echo ✅ 集成测试通过

REM 启动服务
echo 🚀 启动WMS服务...
start "WMS Service" cmd /k "npm run dev"

REM 等待服务启动
timeout /t 10 /nobreak >nul

REM 验证API接口
echo 🔍 验证API接口...
powershell -Command "& {try {Invoke-WebRequest -Uri 'http://localhost:3001/api/wms/connections' -Method GET -ErrorAction Stop; Write-Host '✅ API接口验证通过'} catch {Write-Host '❌ API接口验证失败'; exit 1}}"

if %errorlevel% neq 0 (
    echo ❌ API验证失败
    exit /b 1
)

REM 启动定时同步任务
echo ⏰ 启动定时同步任务...
echo 正在启动后台同步服务...

echo 🎉 WMS系统部署完成！

echo.
echo 📋 部署信息:
echo    - 服务地址: http://localhost:3001
echo    - API文档: http://localhost:3001/api/wms
echo    - 管理界面: http://localhost:3001/admin/wms
echo.
echo 🔧 管理命令:
echo    - 查看连接: curl http://localhost:3001/api/wms/connections
echo    - 手动同步: curl -X POST http://localhost:3001/api/wms/inventory -d "{\"action\":\"manual-sync\"}"
echo    - 状态检查: curl http://localhost:3001/api/wms/inventory?action=status
echo.
echo 💡 提示: 系统已以后台进程方式运行，可通过任务管理器查看node.exe进程

pause