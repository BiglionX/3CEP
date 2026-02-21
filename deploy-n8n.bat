@echo off
:: n8n自动化部署脚本 (Windows版本)
:: ================================================

echo 🚀 开始部署n8n自动化工作流平台...

:: 检查必要工具
echo 🔍 检查必要工具...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到Docker，请先安装Docker Desktop
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到docker-compose，请先安装docker-compose
    pause
    exit /b 1
)

echo ✅ Docker和docker-compose已安装

:: 检查环境变量文件
if not exist ".env.n8n" (
    echo ❌ 错误: 未找到.env.n8n配置文件
    echo 💡 请复制.env.n8n.example并配置相关参数
    pause
    exit /b 1
)

:: 检查必要配置 (简化版检查)
echo 🔍 检查必要配置...
findstr /C:"your-super-long-and-random-encryption-key-here-change-this-in-production" .env.n8n >nul
if %errorlevel% equ 0 (
    echo ⚠️  警告: 请修改.env.n8n中的N8N_ENCRYPTION_KEY为强随机字符串
    echo    否则将使用默认值继续部署
    timeout /t 5 >nul
)

findstr /C:"your-secure-postgres-password-change-this" .env.n8n >nul
if %errorlevel% equ 0 (
    echo ⚠️  警告: 请修改.env.n8n中的POSTGRES_PASSWORD为安全密码
    echo    否则将使用默认值继续部署
    timeout /t 5 >nul
)

echo ✅ 配置检查完成

:: 创建必要的目录
echo 📁 创建必要目录...
if not exist "n8n" mkdir n8n
if not exist "n8n\custom" mkdir n8n\custom
if not exist "n8n\logs" mkdir n8n\logs
if not exist "n8n\nginx" mkdir n8n\nginx
if not exist "n8n\nginx\conf.d" mkdir n8n\nginx\conf.d
if not exist "n8n\ssl" mkdir n8n\ssl

:: 构建和启动服务
echo 🐳 构建和启动n8n服务...
docker-compose -f docker-compose.n8n.yml up -d

if %errorlevel% neq 0 (
    echo ❌ Docker Compose启动失败
    pause
    exit /b 1
)

:: 等待服务启动
echo ⏳ 等待服务启动...
timeout /t 30 >nul

:: 检查服务状态
echo 🔍 检查服务状态...
docker-compose -f docker-compose.n8n.yml ps

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
if %COUNT% gtr 30 (
    echo ❌ n8n服务启动超时
    docker-compose -f docker-compose.n8n.yml logs n8n
    pause
    exit /b 1
)

echo ⏳ 等待中... (%COUNT%/30)
goto wait_loop

:deployment_complete
:: 显示访问信息
echo.
echo 🎉 n8n部署完成！
echo ========================================
echo 访问地址: http://localhost:5678
echo 默认情况下无需登录即可使用
echo 如需启用认证，请修改.env.n8n中的相关配置
echo ========================================
echo.
echo 📋 管理命令:
echo   查看日志: docker-compose -f docker-compose.n8n.yml logs -f n8n
echo   停止服务: docker-compose -f docker-compose.n8n.yml down
echo   重启服务: docker-compose -f docker-compose.n8n.yml restart
echo   查看状态: docker-compose -f docker-compose.n8n.yml ps
echo.

echo ✅ 部署完成！
pause