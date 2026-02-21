@echo off
REM 智能议价引擎生产环境部署脚本 (Windows)

echo 🚀 开始部署智能议价引擎到生产环境...

REM 配置变量
set PROJECT_DIR=C:\inetpub\wwwroot\3cep
set BACKUP_DIR=C:\backups\3cep
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

echo 📁 创建备份目录...
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo 📦 备份当前版本...
if exist "%PROJECT_DIR%" (
    powershell -Command "Compress-Archive -Path '%PROJECT_DIR%' -DestinationPath '%BACKUP_DIR%\3cep_backup_%TIMESTAMP%.zip' -Force"
    echo ✅ 备份完成: %BACKUP_DIR%\3cep_backup_%TIMESTAMP%.zip
)

echo 📥 克隆最新代码...
cd /d C:\inetpub\wwwroot
if exist "3cep_temp" rd /s /q "3cep_temp"
git clone https://github.com/your-org/3cep.git 3cep_temp

echo 📋 切换到发布分支...
cd 3cep_temp
git checkout production

echo 🔧 安装依赖...
npm install --production

echo ⚙️  配置环境变量...
copy .env.production .env.local

echo 🗄️  执行数据库迁移...
npx supabase db push --local

echo 🏗️  构建应用...
npm run build

echo 🧹 清理旧版本...
if exist "%PROJECT_DIR%" rd /s /q "%PROJECT_DIR%"

echo 🚚 部署新版本...
move 3cep_temp "%PROJECT_DIR%"

echo 📊 启动服务...
cd "%PROJECT_DIR%"
net stop "3cep-app" 2>nul
net start "3cep-app" || npm start

timeout /t 10 /nobreak >nul

echo 🔍 验证部署...
powershell -Command "Invoke-WebRequest -Uri 'http://localhost:3000/api/health' -Method GET" 2>nul || echo ⚠️  健康检查失败

echo 📊 部署验证...
node scripts\validate-negotiation-engine.js

echo ✅ 智能议价引擎生产环境部署完成！
echo 应用查看地址: http://your-domain.com/negotiation

pause
