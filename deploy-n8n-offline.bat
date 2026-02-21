@echo off
:: n8n离线部署脚本
:: ================================================

echo 🚀 开始n8n离线部署...

:: 检查必要工具
echo 🔍 检查必要工具...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到Docker，请先安装Docker Desktop
    pause
    exit /b 1
)

echo ✅ Docker已安装

:: 检查环境变量文件
if not exist ".env.n8n" (
    echo ❌ 错误: 未找到.env.n8n配置文件
    pause
    exit /b 1
)

:: 检查配置文件
if not exist "docker-compose.n8n-minimal.yml" (
    echo ❌ 错误: 未找到docker-compose.n8n-minimal.yml配置文件
    pause
    exit /b 1
)

:: 创建必要目录
echo 📁 创建必要目录...
if not exist "n8n" mkdir n8n
if not exist "n8n\custom" mkdir n8n\custom
if not exist "n8n\logs" mkdir n8n\logs

:: 检查Docker镜像是否存在
echo 🔍 检查Docker镜像...
docker images postgres:15-alpine --format "{{.Repository}}:{{.Tag}}" | findstr "postgres:15-alpine" >nul
if %errorlevel% neq 0 (
    echo ⚠️  警告: 未找到postgres:15-alpine镜像
    echo    请先执行: docker load ^< n8n-images.tar
    pause
    exit /b 1
)

docker images n8nio/n8n:latest --format "{{.Repository}}:{{.Tag}}" | findstr "n8nio/n8n:latest" >nul
if %errorlevel% neq 0 (
    echo ⚠️  警告: 未找到n8nio/n8n:latest镜像
    echo    请先执行: docker load ^< n8n-images.tar
    pause
    exit /b 1
)

echo ✅ 所需镜像已存在

:: 启动服务
echo 🐳 启动n8n服务...
docker-compose --env-file .env.n8n -f docker-compose.n8n-minimal.yml up -d

if %errorlevel% neq 0 (
    echo ❌ Docker Compose启动失败
    docker-compose --env-file .env.n8n -f docker-compose.n8n-minimal.yml logs
    pause
    exit /b 1
)

:: 等待服务启动
echo ⏳ 等待服务启动...
timeout /t 30 >nul

:: 检查服务状态
echo 🔍 检查服务状态...
docker-compose --env-file .env.n8n -f docker-compose.n8n-minimal.yml ps

:: 等待n8n完全启动
echo ⏳ 等待n8n完全启动...
set COUNT=0
:wait_loop
timeout /t 10 >nul
curl -f http://localhost:5678/healthz >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ n8n服务启动成功
    goto deployment_complete
)

set /a COUNT+=1
if %COUNT% gtr 60 (
    echo ⚠️  n8n服务启动超时，但仍可能在后台启动
    echo    您可以通过以下命令查看日志：
    echo    docker-compose -f docker-compose.n8n-minimal.yml logs -f n8n
    goto deployment_complete
)

echo ⏳ 等待中... (%COUNT%/60)
goto wait_loop

:deployment_complete
:: 显示访问信息
echo.
echo 🎉 n8n部署完成！
echo ========================================
echo 访问地址: http://localhost:5678
echo 默认情况下无需登录即可使用
echo ========================================
echo.
echo 📋 管理命令:
echo   查看日志: docker-compose -f docker-compose.n8n-minimal.yml logs -f n8n
echo   停止服务: docker-compose -f docker-compose.n8n-minimal.yml down
echo   重启服务: docker-compose -f docker-compose.n8n-minimal.yml restart
echo   查看状态: docker-compose -f docker-compose.n8n-minimal.yml ps
echo.
echo 🧪 验证部署:
echo   node scripts/test-n8n-deployment.js
echo.

echo ✅ 部署脚本执行完成！
pause