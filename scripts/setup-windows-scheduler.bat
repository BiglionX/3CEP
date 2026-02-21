@echo off
setlocal enabledelayedexpansion

:: =============================================================================
:: FixCycle Windows 监控调度配置工具
:: Version: 1.0.0
:: Description: 自动配置Windows计划任务以实现系统监控自动化
:: =============================================================================

echo.
echo ===========================================================================
echo                        FixCycle 监控调度配置工具                        
echo ===========================================================================
echo.

:: 获取当前目录和项目根目录
set "CURRENT_DIR=%~dp0"
set "PROJECT_ROOT=%CURRENT_DIR:~0,-8%"  :: 移除 "\scripts" 后缀
cd /d "%PROJECT_ROOT%"

echo 当前工作目录: %PROJECT_ROOT%
echo.

:: 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ 错误: 需要管理员权限才能配置计划任务
    echo 请右键选择"以管理员身份运行"此脚本
    echo.
    pause
    exit /b 1
)

:: 创建日志和备份目录
echo [初始化] 创建必要的目录结构...
if not exist "logs\scheduler" mkdir "logs\scheduler"
if not exist "logs\backup" mkdir "logs\backup"
if not exist "backups" mkdir "backups"
if not exist "config\scheduler" mkdir "config\scheduler"

:: 备份现有任务（如果存在）
echo [初始化] 检查现有FixCycle计划任务...
for /f "tokens=*" %%i in ('schtasks /query /tn "FixCycle-*" 2^>nul ^| findstr "FixCycle"') do (
    echo 备份现有任务: %%i
    schtasks /query /tn "%%i" /xml > "config\scheduler\%%i-backup.xml" 2>nul
)

echo.

:: =============================================================================
:: 配置监控任务
:: =============================================================================

echo [1/8] 配置快速健康检查任务...
set "TASK_NAME=FixCycle-Quick-Health-Check"
set "TASK_DESC=每15分钟执行快速健康检查"
set "SCRIPT_PATH="%PROJECT_ROOT%\scripts\quick-health-check.js""
set "SCHEDULE=*/15 * * * *"

schtasks /create /tn "%TASK_NAME%" ^
  /tr "cmd /c \"cd /d \"%PROJECT_ROOT%\" ^&^& node %SCRIPT_PATH% ^>^> logs\scheduler\health-check.log 2^>^&1\"" ^
  /sc minute /mo 15 ^
  /ru "SYSTEM" ^
  /rl HIGHEST ^
  /f >nul 2>&1

if !errorlevel! equ 0 (
    echo    ✓ %TASK_NAME% 配置成功
    schtasks /change /tn "%TASK_NAME%" /sd "2024-01-01" /st "00:00"
) else (
    echo    ✗ %TASK_NAME% 配置失败
)

echo.

echo [2/8] 配置完整健康检查任务...
set "TASK_NAME=FixCycle-Full-Health-Check"
set "TASK_DESC=每小时执行完整健康检查"
set "SCRIPT_PATH="%PROJECT_ROOT%\scripts\health-check-suite.js""

schtasks /create /tn "%TASK_NAME%" ^
  /tr "cmd /c \"cd /d \"%PROJECT_ROOT%\" ^&^& node %SCRIPT_PATH% ^>^> logs\scheduler\health-suite.log 2^>^&1\"" ^
  /sc hourly /mo 1 ^
  /ru "SYSTEM" ^
  /rl HIGHEST ^
  /f >nul 2>&1

if !errorlevel! equ 0 (
    echo    ✓ %TASK_NAME% 配置成功
) else (
    echo    ✗ %TASK_NAME% 配置失败
)

echo.

echo [3/8] 配置数据库监控任务...
set "TASK_NAME=FixCycle-Database-Monitor"
set "TASK_DESC=每30分钟执行数据库监控"
set "SCRIPT_PATH="%PROJECT_ROOT%\scripts\monitor-database.js""

schtasks /create /tn "%TASK_NAME%" ^
  /tr "cmd /c \"cd /d \"%PROJECT_ROOT%\" ^&^& node %SCRIPT_PATH% --once ^>^> logs\scheduler\db-monitor.log 2^>^&1\"" ^
  /sc minute /mo 30 ^
  /ru "SYSTEM" ^
  /rl HIGHEST ^
  /f >nul 2>&1

if !errorlevel! equ 0 (
    echo    ✓ %TASK_NAME% 配置成功
) else (
    echo    ✗ %TASK_NAME% 配置失败
)

echo.

echo [4/8] 配置n8n健康检查任务...
set "TASK_NAME=FixCycle-N8N-Health-Check"
set "TASK_DESC=每5分钟检查n8n服务状态"
set "SCRIPT_PATH="%PROJECT_ROOT%\scripts\check-n8n-health.js""

schtasks /create /tn "%TASK_NAME%" ^
  /tr "cmd /c \"cd /d \"%PROJECT_ROOT%\" ^&^& node %SCRIPT_PATH% ^>^> logs\scheduler\n8n-health.log 2^>^&1\"" ^
  /sc minute /mo 5 ^
  /ru "SYSTEM" ^
  /rl HIGHEST ^
  /f >nul 2>&1

if !errorlevel! equ 0 (
    echo    ✓ %TASK_NAME% 配置成功
) else (
    echo    ✗ %TASK_NAME% 配置失败
)

echo.

echo [5/8] 配置每日备份任务...
set "TASK_NAME=FixCycle-Daily-Backup"
set "TASK_DESC=每日凌晨2点执行数据库备份"
set "SCRIPT_PATH="%PROJECT_ROOT%\scripts\backup-database.js""

schtasks /create /tn "%TASK_NAME%" ^
  /tr "cmd /c \"cd /d \"%PROJECT_ROOT%\" ^&^& node %SCRIPT_PATH% backup ^>^> logs\scheduler\backup.log 2^>^&1\"" ^
  /sc daily /st 02:00 ^
  /ru "SYSTEM" ^
  /rl HIGHEST ^
  /f >nul 2>&1

if !errorlevel! equ 0 (
    echo    ✓ %TASK_NAME% 配置成功
) else (
    echo    ✗ %TASK_NAME% 配置失败
)

echo.

echo [6/8] 配置n8n工作流备份任务...
set "TASK_NAME=FixCycle-N8N-Backup"
set "TASK_DESC=每日凌晨3点备份n8n配置"
set "SCRIPT_PATH="%PROJECT_ROOT%\scripts\backup-n8n.js""

schtasks /create /tn "%TASK_NAME%" ^
  /tr "cmd /c \"cd /d \"%PROJECT_ROOT%\" ^&^& node %SCRIPT_PATH% ^>^> logs\scheduler\n8n-backup.log 2^>^&1\"" ^
  /sc daily /st 03:00 ^
  /ru "SYSTEM" ^
  /rl HIGHEST ^
  /f >nul 2>&1

if !errorlevel! equ 0 (
    echo    ✓ %TASK_NAME% 配置成功
) else (
    echo    ✗ %TASK_NAME% 配置失败
)

echo.

echo [7/8] 配置日志清理任务...
set "TASK_NAME=FixCycle-Log-Cleanup"
set "TASK_DESC=每2小时清理过期日志文件"
set "CLEANUP_CMD=forfiles /p "logs" /m *.log.* /d -7 /c "cmd /c del @path""

schtasks /create /tn "%TASK_NAME%" ^
  /tr "cmd /c \"%CLEANUP_CMD% ^>^> logs\scheduler\cleanup.log 2^>^&1\"" ^
  /sc hourly /mo 2 ^
  /ru "SYSTEM" ^
  /rl HIGHEST ^
  /f >nul 2>&1

if !errorlevel! equ 0 (
    echo    ✓ %TASK_NAME% 配置成功
) else (
    echo    ✗ %TASK_NAME% 配置失败
)

echo.

echo [8/8] 配置备份清理任务...
set "TASK_NAME=FixCycle-Backup-Cleanup"
set "TASK_DESC=每周日凌晨4点清理过期备份"
set "CLEANUP_CMD=powershell -Command "Get-ChildItem 'backups' -Filter 'backup-*' -Recurse | Where-Object {$_.CreationTime -lt (Get-Date).AddDays(-30)} | Remove-Item -Force -Recurse""

schtasks /create /tn "%TASK_NAME%" ^
  /tr "cmd /c \"%CLEANUP_CMD% ^>^> logs\scheduler\backup-cleanup.log 2^>^&1\"" ^
  /sc weekly /d SUN /st 04:00 ^
  /ru "SYSTEM" ^
  /rl HIGHEST ^
  /f >nul 2>&1

if !errorlevel! equ 0 (
    echo    ✓ %TASK_NAME% 配置成功
) else (
    echo    ✗ %TASK_NAME% 配置失败
)

echo.
echo ===========================================================================
echo                         任务配置状态汇总                                
echo ===========================================================================
echo.

:: 显示配置结果
set TASK_COUNT=0
set SUCCESS_COUNT=0

for %%t in (
    "FixCycle-Quick-Health-Check"
    "FixCycle-Full-Health-Check" 
    "FixCycle-Database-Monitor"
    "FixCycle-N8N-Health-Check"
    "FixCycle-Daily-Backup"
    "FixCycle-N8N-Backup"
    "FixCycle-Log-Cleanup"
    "FixCycle-Backup-Cleanup"
) do (
    set /a TASK_COUNT+=1
    schtasks /query /tn %%~t >nul 2>&1
    if !errorlevel! equ 0 (
        set /a SUCCESS_COUNT+=1
        echo ✓ %%~t [已配置]
    ) else (
        echo ✗ %%~t [配置失败]
    )
)

echo.
echo 配置完成: %SUCCESS_COUNT%/%TASK_COUNT% 个任务配置成功

:: =============================================================================
:: 创建管理脚本
:: =============================================================================

echo.
echo [生成管理工具] 创建任务管理脚本...

:: 创建任务状态查看脚本
cat > "%PROJECT_ROOT%\scripts\show-scheduled-tasks.bat" << EOF
@echo off
echo.
echo ==================== FixCycle 计划任务状态 ====================
echo.
schtasks /query /tn "FixCycle-*" /fo LIST | findstr /i "TaskName\|Last Run Time\|Next Run Time\|Status"
echo.
echo =================================================================
echo.
pause
EOF

:: 创建任务手动执行脚本
cat > "%PROJECT_ROOT%\scripts\run-scheduled-task.bat" << EOF
@echo off
setlocal enabledelayedexpansion

if "%1"=="" (
    echo 用法: run-scheduled-task.bat ^<task-name^>
    echo 可用任务:
    schtasks /query /tn "FixCycle-*" /fo TABLE | findstr "FixCycle"
    exit /b 1
)

set "TASK_NAME=FixCycle-%1"
echo 手动运行任务: %TASK_NAME%

schtasks /run /tn "%TASK_NAME%"
if !errorlevel! equ 0 (
    echo ✓ 任务启动成功
) else (
    echo ✗ 任务启动失败
)

timeout /t 5 >nul
echo.
echo 任务执行状态:
schtasks /query /tn "%TASK_NAME%" /fo LIST | findstr /i "Last Run Time\|Status"
echo.
pause
EOF

:: 创建任务删除脚本
cat > "%PROJECT_ROOT%\scripts\remove-scheduled-tasks.bat" << EOF
@echo off
setlocal enabledelayedexpansion

echo 警告: 此操作将删除所有FixCycle相关的计划任务!
echo.
choice /c YN /m "确定要继续吗"
if errorlevel 2 exit /b 0

echo 删除FixCycle计划任务...

for %%t in (
    "FixCycle-Quick-Health-Check"
    "FixCycle-Full-Health-Check"
    "FixCycle-Database-Monitor"
    "FixCycle-N8N-Health-Check"
    "FixCycle-Daily-Backup"
    "FixCycle-N8N-Backup"
    "FixCycle-Log-Cleanup"
    "FixCycle-Backup-Cleanup"
) do (
    echo 删除任务: %%~t
    schtasks /delete /tn %%~t /f >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✓ %%~t 已删除
    ) else (
        echo ✗ %%~t 删除失败或不存在
    )
)

echo.
echo 所有FixCycle计划任务已删除
echo.
pause
EOF

echo ✓ 管理脚本已生成:
echo   - scripts\show-scheduled-tasks.bat  (查看任务状态)
echo   - scripts\run-scheduled-task.bat    (手动执行任务)
echo   - scripts\remove-scheduled-tasks.bat (删除所有任务)

:: =============================================================================
:: 配置验证和测试
:: =============================================================================

echo.
echo [验证配置] 测试任务执行...

:: 测试快速健康检查任务
echo 测试快速健康检查...
schtasks /run /tn "FixCycle-Quick-Health-Check" >nul 2>&1
if %errorlevel% equ 0 (
    timeout /t 10 /nobreak >nul
    if exist "logs\scheduler\health-check.log" (
        echo ✓ 健康检查任务执行成功
        echo   最新日志:
        powershell -Command "Get-Content 'logs\scheduler\health-check.log' -Tail 5"
    ) else (
        echo ⚠ 健康检查任务已启动，但日志文件未生成
    )
) else (
    echo ✗ 健康检查任务启动失败
)

echo.
echo ===========================================================================
echo                           配置完成                                      
echo ===========================================================================
echo.
echo 已配置的计划任务:
echo 1. FixCycle-Quick-Health-Check    (每15分钟) - 快速健康检查
echo 2. FixCycle-Full-Health-Check     (每小时)   - 完整健康检查
echo 3. FixCycle-Database-Monitor      (每30分钟) - 数据库监控
echo 4. FixCycle-N8N-Health-Check      (每5分钟)  - n8n服务检查
echo 5. FixCycle-Daily-Backup          (每日2点)  - 数据库备份
echo 6. FixCycle-N8N-Backup            (每日3点)  - n8n配置备份
echo 7. FixCycle-Log-Cleanup           (每2小时)  - 日志清理
echo 8. FixCycle-Backup-Cleanup        (每周日4点) - 备份清理
echo.
echo 管理命令:
echo   查看任务状态: scripts\show-scheduled-tasks.bat
echo   手动执行任务: scripts\run-scheduled-task.bat ^<task-name^>
echo   删除所有任务: scripts\remove-scheduled-tasks.bat
echo.
echo 日志文件位置:
echo   logs\scheduler\*.log
echo.
echo 注意事项:
echo 1. 所有任务以SYSTEM账户运行，具有最高权限
echo 2. 任务失败时会记录到对应日志文件
echo 3. 建议定期检查任务执行状态和日志
echo 4. 如需修改调度时间，请使用任务计划程序GUI
echo.
pause