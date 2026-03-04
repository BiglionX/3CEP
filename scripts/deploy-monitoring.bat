@echo off
REM 采购智能体监控体系部署脚本 (Windows)

echo 🚀 开始部署采购智能体监控体系...
echo ==========================================

REM 配置变量
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..
set CONFIG_DIR=%PROJECT_ROOT%\config\monitoring
set MONITORING_DIR=C:\procurement-monitoring

echo 📁 创建监控目录结构...
if not exist "%MONITORING_DIR%" mkdir "%MONITORING_DIR%"
if not exist "%MONITORING_DIR%\configs" mkdir "%MONITORING_DIR%\configs"

echo 📋 部署监控配置文件...

REM Prometheus配置
if exist "%CONFIG_DIR%\prometheus-procurement.yml" (
    copy "%CONFIG_DIR%\prometheus-procurement.yml" "%MONITORING_DIR%\configs\" >nul
    echo ✅ Prometheus配置文件已部署
) else (
    echo ⚠️  Prometheus配置文件不存在
)

REM 告警规则
if exist "%CONFIG_DIR%\procurement-alert-rules.yml" (
    copy "%CONFIG_DIR%\procurement-alert-rules.yml" "%MONITORING_DIR%\configs\" >nul
    echo ✅ 告警规则文件已部署
) else (
    echo ⚠️  告警规则文件不存在
)

echo ✅ 配置文件部署完成

REM 创建Docker Compose文件
echo 🐳 创建Docker Compose配置...

(
echo version: '3.8'
echo.
echo services:
echo   prometheus:
echo     image: prom/prometheus:latest
echo     container_name: procurement-prometheus
echo     ports:
echo       - "9090:9090"
echo     volumes:
echo       - ./configs/prometheus-procurement.yml:/etc/prometheus/prometheus.yml
echo       - ./configs/procurement-alert-rules.yml:/etc/prometheus/rules/procurement-alert-rules.yml
echo       - prometheus_data:/prometheus
echo     command:
echo       - '--config.file=/etc/prometheus/prometheus.yml'
echo       - '--storage.tsdb.path=/prometheus'
echo       - '--web.console.libraries=/etc/prometheus/console_libraries'
echo       - '--web.console.templates=/etc/prometheus/consoles'
echo       - '--storage.tsdb.retention.time=30d'
echo     restart: unless-stopped
echo.
echo   grafana:
echo     image: grafana/grafana:latest
echo     container_name: procurement-grafana
echo     ports:
echo       - "3001:3000"
echo     volumes:
echo       - grafana_data:/var/lib/grafana
echo     environment:
echo       - GF_SECURITY_ADMIN_PASSWORD=admin123
echo       - GF_USERS_ALLOW_SIGN_UP=false
echo     restart: unless-stopped
echo.
echo   alertmanager:
echo     image: prom/alertmanager:latest
echo     container_name: procurement-alertmanager
echo     ports:
echo       - "9093:9093"
echo     volumes:
echo       - ./configs/alertmanager.yml:/etc/alertmanager/alertmanager.yml
echo       - alertmanager_data:/alertmanager
echo     command:
echo       - '--config.file=/etc/alertmanager/alertmanager.yml'
echo       - '--storage.path=/alertmanager'
echo     restart: unless-stopped
echo.
echo volumes:
echo   prometheus_data:
echo   grafana_data:
echo   alertmanager_data:
) > "%MONITORING_DIR%\docker-compose.yml"

echo ✅ Docker Compose配置已创建

REM 创建Alertmanager配置
echo 🛡️  创建Alertmanager配置...

(
echo global:
echo   resolve_timeout: 5m
echo.
echo route:
echo   group_by: ['alertname']
echo   group_wait: 10s
echo   group_interval: 10s
echo   repeat_interval: 1h
echo   receiver: 'default-receiver'
echo.
echo receivers:
echo   - name: 'default-receiver'
echo     webhook_configs:
echo       - url: 'http://localhost:3000/api/procurement-intelligence/alerts/webhook'
echo         send_resolved: true
echo.
echo inhibit_rules:
echo   - source_match:
echo       severity: 'critical'
echo     target_match:
echo       severity: 'warning'
echo     equal: ['alertname', 'dev', 'instance']
) > "%MONITORING_DIR%\configs\alertmanager.yml"

echo ✅ Alertmanager配置已创建

REM 启动监控服务
echo 🚀 启动监控服务...
cd /d "%MONITORING_DIR%"

REM 检查Docker是否可用
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到Docker，请先安装Docker Desktop
    pause
    exit /b 1
)

docker-compose up -d

if %errorlevel% equ 0 (
    echo ✅ 监控服务启动成功
) else (
    echo ❌ 监控服务启动失败
    pause
    exit /b 1
)

REM 等待服务启动
echo ⏳ 等待服务启动...
timeout /t 30 /nobreak >nul

REM 验证服务状态
echo 🔍 验证服务状态...

REM 检查Prometheus
curl -s http://localhost:9090/-/healthy >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Prometheus服务运行正常
) else (
    echo ❌ Prometheus服务异常
)

REM 检查Grafana
curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Grafana服务运行正常
) else (
    echo ❌ Grafana服务异常
)

REM 检查Alertmanager
curl -s http://localhost:9093/-/ready >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Alertmanager服务运行正常
) else (
    echo ❌ Alertmanager服务异常
)

REM 检查应用指标端点
echo 📊 检查应用指标端点...
curl -s http://localhost:3000/api/procurement-intelligence/metrics >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 应用指标端点可用
) else (
    echo ⚠️  应用指标端点暂时不可用（可能是应用尚未启动）
)

REM 输出访问信息
echo.
echo ==========================================
echo 🎉 采购智能体监控体系部署完成！
echo ==========================================
echo.
echo 🌐 访问地址:
echo   Prometheus: http://localhost:9090
echo   Grafana: http://localhost:3001 (用户名: admin, 密码: admin123)
echo   Alertmanager: http://localhost:9093
echo.
echo 📂 配置文件位置:
echo   %MONITORING_DIR%\configs\
echo.
echo 🔧 管理命令:
echo   启动服务: cd /d %MONITORING_DIR% && docker-compose up -d
echo   停止服务: cd /d %MONITORING_DIR% && docker-compose down
echo   查看日志: cd /d %MONITORING_DIR% && docker-compose logs -f
echo   重启服务: cd /d %MONITORING_DIR% && docker-compose restart
echo.
echo 📝 注意事项:
echo   1. 请确保应用服务已在3000端口运行
echo   2. 首次登录Grafana后请及时修改默认密码
echo   3. 可在Grafana中导入采购智能体专用仪表板
echo   4. 告警规则可根据实际业务需求进行调整

pause