@echo off
:: n8n 监控系统 Windows 管理脚本

setlocal enabledelayedexpansion

:: 颜色定义 (PowerShell)
set "BLUE=Blue"
set "GREEN=Green"
set "YELLOW=Yellow"
set "RED=Red"

:: 配置变量
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR:~0,-8%"
set "MONITOR_CONFIG=%PROJECT_ROOT%config\monitoring\n8n-monitor-config.json"
set "NODE_SCRIPT=%SCRIPT_DIR%n8n-monitor.js"
set "LOG_DIR=%PROJECT_ROOT%logs\monitoring"

:: 日志函数
:log_info
echo [INFO] %date% %time% - %~1
exit /b 0

:log_success
echo [SUCCESS] %date% %time% - %~1
exit /b 0

:log_warning
echo [WARNING] %date% %time% - %~1
exit /b 0

:log_error
echo [ERROR] %date% %time% - %~1
exit /b 1

:: 检查前置条件
:check_prerequisites
call :log_info "检查监控系统前置条件..."

if not exist "%NODE_SCRIPT%" (
    call :log_error "监控脚本不存在: %NODE_SCRIPT%"
    exit /b 1
)

if not exist "%MONITOR_CONFIG%" (
    call :log_warning "监控配置文件不存在，将使用默认配置"
)

:: 检查 Node.js
where node >nul 2>&1
if errorlevel 1 (
    call :log_error "Node.js 未安装"
    exit /b 1
)

:: 检查 PM2
where pm2 >nul 2>&1
if errorlevel 1 (
    call :log_info "PM2 未安装，将使用基本后台运行"
    set "USE_PM2=false"
) else (
    call :log_info "PM2 可用，将使用进程管理"
    set "USE_PM2=true"
)

call :log_success "前置条件检查完成"
goto :eof

:: 启动监控 (使用 PM2)
:start_with_pm2
call :log_info "使用 PM2 启动监控系统..."

:: 检查是否已存在进程
pm2 list | findstr "n8n-monitor" >nul 2>&1
if !errorlevel! equ 0 (
    call :log_warning "监控进程已在运行，重启中..."
    pm2 restart n8n-monitor >nul 2>&1
) else (
    :: 启动新进程
    pm2 start "%NODE_SCRIPT%" ^
        --name "n8n-monitor" ^
        --silent >nul 2>&1
)

:: 保存进程列表
pm2 save >nul 2>&1

call :log_success "监控系统已通过 PM2 启动"
pm2 list | findstr "n8n-monitor"
goto :eof

:: 启动监控 (基本方式)
:start_basic
call :log_info "使用基本方式启动监控系统..."

:: 创建日志目录
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

:: 后台运行
start /b cmd /c "node "%NODE_SCRIPT%" > "%LOG_DIR%\monitor.log" 2> "%LOG_DIR%\monitor.err""
echo %! > "%LOG_DIR%\monitor.pid"

call :log_success "监控系统已在后台启动"
call :log_info "日志文件: %LOG_DIR%\monitor.log"
goto :eof

:: 停止监控
:stop_monitor
call :log_info "停止监控系统..."

if "%USE_PM2%"=="true" (
    pm2 list | findstr "n8n-monitor" >nul 2>&1
    if !errorlevel! equ 0 (
        pm2 stop n8n-monitor >nul 2>&1
        pm2 delete n8n-monitor >nul 2>&1
        call :log_success "PM2 监控进程已停止"
    ) else (
        call :log_warning "未找到运行中的监控进程"
    )
) else (
    set "PID_FILE=%LOG_DIR%\monitor.pid"
    if exist "%PID_FILE%" (
        set /p MONITOR_PID=<"%PID_FILE%"
        taskkill /PID !MONITOR_PID! /F >nul 2>&1
        if !errorlevel! equ 0 (
            call :log_success "监控进程已停止 (PID: !MONITOR_PID!)"
        ) else (
            call :log_warning "监控进程已不在运行"
        )
        del "%PID_FILE%" >nul 2>&1
    ) else (
        call :log_warning "未找到 PID 文件"
    )
)
goto :eof

:: 重启监控
:restart_monitor
call :log_info "重启监控系统..."
call :stop_monitor
timeout /t 2 /nobreak >nul
call :start_monitor
goto :eof

:: 查看状态
:status_monitor
if "%USE_PM2%"=="true" (
    call :log_info "PM2 监控进程状态:"
    pm2 list | findstr "n8n-monitor" || call :log_warning "监控进程未运行"
) else (
    set "PID_FILE=%LOG_DIR%\monitor.pid"
    if exist "%PID_FILE%" (
        set /p MONITOR_PID=<"%PID_FILE%"
        tasklist /FI "PID eq !MONITOR_PID!" 2>nul | findstr "node.exe" >nul 2>&1
        if !errorlevel! equ 0 (
            call :log_success "监控进程正在运行 (PID: !MONITOR_PID!)"
            tasklist /FI "PID eq !MONITOR_PID!"
        ) else (
            call :log_error "PID文件存在但进程未运行"
        )
    ) else (
        call :log_warning "监控进程未运行"
    )
)
goto :eof

:: 查看日志
:view_logs
set "lines=%~1"
if "%lines%"=="" set "lines=50"

if "%USE_PM2%"=="true" (
    pm2 logs n8n-monitor --lines %lines%
) else (
    set "LOG_FILE=%LOG_DIR%\monitor.log"
    if exist "%LOG_FILE%" (
        powershell -Command "Get-Content '%LOG_FILE%' -Tail %lines%"
    ) else (
        call :log_error "日志文件不存在: %LOG_FILE%"
    )
)
goto :eof

:: 查看错误日志
:view_errors
set "lines=%~1"
if "%lines%"=="" set "lines=20"

if "%USE_PM2%"=="true" (
    pm2 logs n8n-monitor --err --lines %lines%
) else (
    set "ERROR_FILE=%LOG_DIR%\monitor.err"
    if exist "%ERROR_FILE%" (
        powershell -Command "Get-Content '%ERROR_FILE%' -Tail %lines%"
    ) else (
        call :log_error "错误日志文件不存在: %ERROR_FILE%"
    )
)
goto :eof

:: 显示帮助信息
:show_help
echo n8n 监控系统管理脚本
echo.
echo 用法: %~nx0 {start^|stop^|restart^|status^|logs^|errors^|help}
echo.
echo 命令:
echo   start           启动监控系统
echo   stop            停止监控系统
echo   restart         重启监控系统
echo   status          查看监控系统状态
echo   logs [lines]    查看监控日志 (默认50行)
echo   errors [lines]  查看错误日志 (默认20行)
echo   help            显示此帮助信息
echo.
echo 环境变量:
echo   N8N_BASE_URL    n8n 服务地址 (默认: http://localhost:5678)
echo   N8N_API_TOKEN   API 访问令牌
echo.
echo 示例:
echo   %~nx0 start
echo   %~nx0 status
echo   %~nx0 logs 100
echo   set N8N_BASE_URL=https://n8n.example.com
echo   %~nx0 start
goto :eof

:: 根据运行方式确定启动函数
:start_monitor
if "%USE_PM2%"=="true" (
    call :start_with_pm2
) else (
    call :start_basic
)
goto :eof

:: 主函数
set "command=%~1"
if "%command%"=="" set "command=help"

if "%command%"=="start" (
    call :check_prerequisites
    call :start_monitor
) else if "%command%"=="stop" (
    call :stop_monitor
) else if "%command%"=="restart" (
    call :restart_monitor
) else if "%command%"=="status" (
    call :status_monitor
) else if "%command%"=="logs" (
    call :view_logs %~2
) else if "%command%"=="errors" (
    call :view_errors %~2
) else (
    call :show_help
)

endlocal