@echo off
echo ================================================
echo n8n 自动化工作流平台部署脚本
echo ================================================

echo 正在检查 Docker 环境...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到 Docker，请先安装 Docker Desktop
    pause
    exit /b 1
)

echo 正在检查 Docker Compose...
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到 Docker Compose
    pause
    exit /b 1
)

echo 创建必要的目录结构...
mkdir n8n\custom 2>nul
mkdir n8n\logs 2>nul
mkdir n8n\nginx\conf.d 2>nul
mkdir n8n\ssl 2>nul

echo 设置环境变量...
set COMPOSE_FILE=docker-compose.n8n.yml
set ENV_FILE=.env.n8n

echo 停止可能正在运行的旧实例...
docker-compose -f %COMPOSE_FILE% --env-file %ENV_FILE% down

echo 拉取最新镜像...
docker-compose -f %COMPOSE_FILE% --env-file %ENV_FILE% pull

echo 启动 n8n 服务...
docker-compose -f %COMPOSE_FILE% --env-file %ENV_FILE% up -d

echo 等待服务启动...
timeout /t 30 /nobreak >nul

echo 检查服务状态...
docker-compose -f %COMPOSE_FILE% --env-file %ENV_FILE% ps

echo ================================================
echo 部署完成！
echo ================================================
echo 访问地址: https://n8n.yourdomain.com
echo 本地访问: http://localhost:5678
echo ================================================
echo 如需查看日志，请运行: docker-compose -f docker-compose.n8n.yml logs -f
echo ================================================

pause