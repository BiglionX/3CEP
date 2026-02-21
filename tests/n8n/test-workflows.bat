@echo off
setlocal enabledelayedexpansion

echo 🚀 n8n 工作流测试脚本 (Windows)
echo ================================

:: 配置变量
set N8N_HOST=%N8N_HOST%
if "%N8N_HOST%"=="" set N8N_HOST=localhost

set N8N_PORT=%N8N_PORT%
if "%N8N_PORT%"=="" set N8N_PORT=5678

set BASE_URL=http://%N8N_HOST%:%N8N_PORT%

echo 🔧 测试配置:
echo    n8n 地址: %BASE_URL%
echo.

:: 检查是否安装了 curl
curl --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到 curl 命令，请先安装 curl
    pause
    exit /b 1
)

:: 健康检查
echo 🏥 执行健康检查...
echo.

echo 检查 n8n 服务状态:
curl -s %BASE_URL%/healthz >nul 2>&1
if errorlevel 1 (
    echo ❌ 无法连接到 n8n 服务
    echo 请确保 n8n 正在运行在 %BASE_URL%
    pause
    exit /b 1
) else (
    echo ✅ n8n 服务运行正常
)

echo.
echo ────────────────────────────────────────────────
echo.

:: 测试基础工作流
echo 🧪 测试基础 B2B 采购需求解析工作流
echo 端点: /webhook/b2b-procurement-parse
echo.

curl -X POST %BASE_URL%/webhook/b2b-procurement-parse ^
     -H "Content-Type: application/json" ^
     -d "{^
           \"description\": \"我需要采购100个电子元件A和50个连接器B，预算5000元\",^
           \"companyId\": \"test-company-001\",^
           \"requesterId\": \"test-user-001\"^
         }"

echo.
echo ────────────────────────────────────────────────
echo.

:: 测试高级工作流
echo 🧪 测试高级 B2B 采购需求解析工作流
echo 端点: /webhook/b2b-procurement-advanced
echo.

curl -X POST %BASE_URL%/webhook/b2b-procurement-advanced ^
     -H "Content-Type: application/json" ^
     -d "{^
           \"description\": \"紧急采购一批服务器配件，包括CPU、内存条、硬盘等，要求一周内到货\",^
           \"companyId\": \"tech-company-ltd\",^
           \"requesterId\": \"procurement-manager\"^
         }"

echo.
echo ────────────────────────────────────────────────
echo.

echo 🎉 测试完成！

echo.
echo 💡 提示:
echo    - 如果返回 404 错误，请检查工作流是否已导入并激活
echo    - 如果返回 500 错误，请检查智能体 API 是否正常运行
echo    - 可以通过设置环境变量来指定不同的地址:
echo      set N8N_HOST=your-n8n-server.com
echo      set N8N_PORT=5678

pause