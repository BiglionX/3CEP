@echo off
REM 采购智能体生产环境部署脚本 (Windows)

echo 🚀 开始部署采购智能体系统到生产环境...
echo ====================================================

REM 配置变量
set PROJECT_DIR=%~dp0..
set BACKUP_DIR=%PROJECT_DIR%\backups
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

echo 📁 创建备份目录...
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo 📦 备份当前版本...
set BACKUP_NAME=procurement-intelligence-%TIMESTAMP%
set BACKUP_PATH=%BACKUP_DIR%\%BACKUP_NAME%

mkdir "%BACKUP_PATH%" 2>nul

REM 备份重要文件和目录
echo 备份配置文件...
if exist "%PROJECT_DIR%\.env" copy "%PROJECT_DIR%\.env" "%BACKUP_PATH%\" >nul
if exist "%PROJECT_DIR%\package.json" copy "%PROJECT_DIR%\package.json" "%BACKUP_PATH%\" >nul
if exist "%PROJECT_DIR%\next.config.js" copy "%PROJECT_DIR%\next.config.js" "%BACKUP_PATH%\" >nul

echo 备份采购智能体相关文件...
if exist "%PROJECT_DIR%\src\app\procurement-intelligence" (
    xcopy "%PROJECT_DIR%\src\app\procurement-intelligence" "%BACKUP_PATH%\src\app\procurement-intelligence\" /E /I /H >nul
)
if exist "%PROJECT_DIR%\sql" (
    xcopy "%PROJECT_DIR%\sql\*procurement*" "%BACKUP_PATH%\sql\" /E /I /H >nul
    xcopy "%PROJECT_DIR%\sql\*supplier*" "%BACKUP_PATH%\sql\" /E /I /H >nul
    xcopy "%PROJECT_DIR%\sql\*price*" "%BACKUP_PATH%\sql\" /E /I /H >nul
    xcopy "%PROJECT_DIR%\sql\*decision*" "%BACKUP_PATH%\sql\" /E /I /H >nul
)

echo ✅ 备份完成: %BACKUP_PATH%

echo 📥 获取最新代码...
cd /d "%PROJECT_DIR%"

REM 检查是否是Git仓库
if exist ".git" (
    echo 拉取最新代码...
    git fetch origin
    git reset --hard origin/main
    
    if %errorlevel% neq 0 (
        echo ⚠️  代码拉取失败，使用当前版本继续部署
    )
) else (
    echo ℹ️  非Git仓库，跳过代码更新
)

echo 🔧 安装生产依赖...
npm ci --production
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo 🏗️ 构建应用...
npm run build
if %errorlevel% neq 0 (
    echo ❌ 应用构建失败
    pause
    exit /b 1
)

echo 🗄️ 执行数据库迁移...

REM 执行采购智能体相关的SQL脚本
set SQL_SCRIPTS=supplier-intelligence-profiles.sql international-price-indices.sql procurement-decision-audit.sql alter-foreign-trade-partners.sql

for %%s in (%SQL_SCRIPTS%) do (
    if exist "%PROJECT_DIR%\sql\%%s" (
        echo 执行迁移脚本: %%s
        psql -f "%PROJECT_DIR%\sql\%%s" 2>nul
        if %errorlevel% neq 0 (
            echo ⚠️  脚本执行警告: %%s
        )
    )
)

REM 运行数据迁移工具
if exist "%PROJECT_DIR%\scripts\data-migration-tools\procurement-data-migrator.js" (
    echo 运行数据迁移工具...
    node "%PROJECT_DIR%\scripts\data-migration-tools\procurement-data-migrator.js"
    if %errorlevel% neq 0 (
        echo ⚠️  数据迁移工具执行警告
    )
)

echo 🚚 部署服务...

REM 停止现有服务
echo 停止现有服务...
taskkill /f /im node.exe 2>nul
docker-compose -f docker-compose.prod.yml down 2>nul
docker-compose -f docker-compose.n8n.yml down 2>nul

REM 启动服务
echo 启动采购智能体服务...
npm run start

if %errorlevel% neq 0 (
    echo ❌ 服务启动失败
    pause
    exit /b 1
)

REM 启动相关Docker服务
if exist "%PROJECT_DIR%\docker-compose.prod.yml" (
    echo 启动生产环境Docker服务...
    docker-compose -f "%PROJECT_DIR%\docker-compose.prod.yml" up -d
)

if exist "%PROJECT_DIR%\docker-compose.n8n.yml" (
    echo 启动n8n服务...
    docker-compose -f "%PROJECT_DIR%\docker-compose.n8n.yml" up -d
)

echo ⏳ 等待服务启动...
timeout /t 15 /nobreak >nul

echo 🔍 验证部署状态...

REM 检查服务健康状态
echo 检查主服务健康状态...
curl -f http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 主服务健康检查通过
) else (
    echo ⚠️  主服务健康检查异常
)

echo 检查采购智能体服务...
curl -f http://localhost:3000/api/procurement-intelligence/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 采购智能体服务健康检查通过
) else (
    echo ⚠️  采购智能体服务健康检查异常
)

REM 验证核心功能接口
echo 验证核心功能接口...

curl -f http://localhost:3000/api/procurement-intelligence/suppliers/profiles >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 供应商画像接口测试通过
) else (
    echo ⚠️  供应商画像接口测试异常
)

curl -f http://localhost:3000/api/procurement-intelligence/market/prices >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 市场价格接口测试通过
) else (
    echo ⚠️  市场价格接口测试异常
)

curl -f http://localhost:3000/api/procurement-intelligence/decisions/history >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 决策历史接口测试通过
) else (
    echo ⚠️  决策历史接口测试异常
)

echo ====================================================
echo 🎉 采购智能体部署完成！
echo ====================================================
echo 
echo 🌐 访问地址:
echo   采购智能体主页面: http://localhost:3000/procurement-intelligence
echo   API文档: http://localhost:3000/api/procurement-intelligence/docs
echo   健康检查: http://localhost:3000/api/procurement-intelligence/health
echo 
echo 📝 后续操作:
echo   1. 检查服务日志: npm run logs
echo   2. 监控系统状态: npm run monitor
echo   3. 查看备份文件: %BACKUP_PATH%
echo 
echo 📦 备份位置: %BACKUP_PATH%
echo 

pause