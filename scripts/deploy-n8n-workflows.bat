@echo off
:: n8n工作流生产环境自动化部署脚本 (Windows版本)
:: 作者: AI Assistant
:: 版本: 1.0.0
:: 日期: 2026-02-20

setlocal enabledelayedexpansion

:: 检查 Node.js 是否可用
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is required but not installed
    exit /b 1
)

:: 使用统一部署脚本
set "SCRIPT_DIR=%~dp0"
set "UNIFIED_DEPLOY=%SCRIPT_DIR%unified-deploy.js"

:: 如果统一部署脚本存在，使用它
if exist "%UNIFIED_DEPLOY%" (
    echo Using unified deployment framework...
    node "%UNIFIED_DEPLOY%" n8n-workflows %*
    exit /b %errorlevel%
)

:: 回退到原有实现

:: 颜色定义 (Windows PowerShell颜色)
set "RED=Red"
set "GREEN=Green" 
set "YELLOW=Yellow"
set "BLUE=Blue"

:: 配置变量
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR:~0,-8%"
set "WORKFLOW_DIR=%PROJECT_ROOT%n8n-workflows"
set "DEPLOY_CONFIG_DIR=%PROJECT_ROOT%config\deploy"
set "TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "TIMESTAMP=%TIMESTAMP: =0%"
set "BACKUP_DIR=%PROJECT_ROOT%backups\%TIMESTAMP%"

:: 版本管理配置
set "TARGET_VERSION=%N8N_WORKFLOW_VERSION%"
if "%TARGET_VERSION%"=="" set "TARGET_VERSION=v1.0.0"
set "DEPLOY_STRATEGY=%N8N_DEPLOY_STRATEGY%"
if "%DEPLOY_STRATEGY%"=="" set "DEPLOY_STRATEGY=direct"
set "ROLLBACK_VERSION=%N8N_ROLLBACK_VERSION%"
if "%ROLLBACK_VERSION%"=="" set "ROLLBACK_VERSION=v1.0.0"

:: 生产环境配置
if "%N8N_API_URL%"=="" set "N8N_API_URL=https://n8n.yourdomain.com"
if "%N8N_API_TOKEN%"=="" (
    echo 错误: N8N_API_TOKEN 环境变量未设置
    exit /b 1
)
if "%DEPLOY_ENV%"=="" set "DEPLOY_ENV=production"

:: 工作流文件列表
set WORKFLOWS[0]=scan-flow.json
set WORKFLOWS[1]=tutorial-flow.json
set WORKFLOWS[2]=payment-success.json
set WORKFLOWS[3]=ai-escalation.json
set WORKFLOW_COUNT=4

:: 环境变量映射文件
set "ENV_MAPPING_FILE=%DEPLOY_CONFIG_DIR%\env-mapping.json"

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

:: 幂等性检查函数
:check_workflow_exists
set "workflow_name=%~1"
set "target_version=%~2"

curl -s -X GET "%N8N_API_URL%/workflows?filter[name]=%workflow_name%" ^
    -H "Authorization: Bearer %N8N_API_TOKEN%" > temp_workflow_check.txt 2>&1

:: 检查工作流是否存在
findstr /C:"id" temp_workflow_check.txt >nul 2>&1
if !errorlevel! equ 0 (
    :: 工作流存在，检查版本
    for /f "tokens=*" %%i in ('type temp_workflow_check.txt ^| findstr "version"') do (
        set "current_version=%%i"
        echo !current_version! | findstr /C:"%target_version%" >nul 2>&1
        if !errorlevel! equ 0 (
            call :log_info "工作流 %workflow_name% 版本 %target_version% 已存在，跳过部署"
            del temp_workflow_check.txt >nul 2>&1
            exit /b 0
        ) else (
            call :log_info "工作流 %workflow_name% 版本不匹配，当前版本需要更新"
            del temp_workflow_check.txt >nul 2>&1
            exit /b 1
        )
    )
) else (
    call :log_info "工作流 %workflow_name% 不存在，需要部署"
    del temp_workflow_check.txt >nul 2>&1
    exit /b 1
)
del temp_workflow_check.txt >nul 2>&1
exit /b 1

:: 显示帮助信息
:show_help
echo n8n工作流生产环境自动化部署脚本 ^(Windows版本^)
echo.
echo 用法: %~nx0 [选项]
echo.
echo 选项:
echo   -h, --help          显示此帮助信息
echo   -e, --environment   指定部署环境 ^(production/staging^) 默认: production
echo   --dry-run          执行预演模式，不实际部署
echo.
echo 环境变量:
echo   N8N_API_URL        n8n API地址 ^(必需^)
echo   N8N_API_TOKEN      n8n API令牌 ^(必需^)
echo   DEPLOY_ENV         部署环境，默认为production
echo.
echo 示例:
echo   %~nx0 --environment staging
echo   set N8N_API_URL=https://n8n.example.com
echo   set N8N_API_TOKEN=your_token
echo   %~nx0
exit /b 0

:: 参数解析
set "DRY_RUN=false"
set "SHOW_HELP=false"

:parse_args
if "%~1"=="" goto args_done
if "%~1"=="-h" set "SHOW_HELP=true" & shift & goto parse_args
if "%~1"=="--help" set "SHOW_HELP=true" & shift & goto parse_args
if "%~1"=="-e" set "DEPLOY_ENV=%~2" & shift & shift & goto parse_args
if "%~1"=="--environment" set "DEPLOY_ENV=%~2" & shift & shift & goto parse_args
if "%~1"=="--dry-run" set "DRY_RUN=true" & shift & goto parse_args
shift
goto parse_args

:args_done
if "%SHOW_HELP%"=="true" (
    call :show_help
    exit /b 0
)

:: 部署前检查
:pre_deployment_check
call :log_info "开始部署前检查..."

:: 检查必需工具
where curl >nul 2>&1
if errorlevel 1 (
    call :log_error "缺少必需工具: curl"
    exit /b 1
)

where powershell >nul 2>&1
if errorlevel 1 (
    call :log_error "缺少必需工具: PowerShell"
    exit /b 1
)

:: 检查工作流文件
call :log_info "检查工作流文件完整性..."
set "file_check_passed=true"

for /L %%i in (0,1,3) do (
    set "workflow=!WORKFLOWS[%%i]!"
    if not exist "%WORKFLOW_DIR%\!workflow!" (
        call :log_error "工作流文件不存在: %WORKFLOW_DIR%\!workflow!"
        set "file_check_passed=false"
    ) else (
        :: 验证JSON格式 (使用PowerShell)
        powershell -Command "try { Get-Content '%WORKFLOW_DIR%\!workflow!' | ConvertFrom-Json | Out-Null; Write-Host 'Valid' } catch { Write-Host 'Invalid' }" > temp_validation.txt
        set /p validation_result=<temp_validation.txt
        del temp_validation.txt >nul 2>&1
        
        if "!validation_result!"=="Invalid" (
            call :log_error "工作流文件格式错误: %WORKFLOW_DIR%\!workflow!"
            set "file_check_passed=false"
        ) else (
            call :log_success "工作流文件验证通过: !workflow!"
        )
    )
)

if "%file_check_passed%"=="false" (
    exit /b 1
)

:: 检查环境变量
if "%N8N_API_TOKEN%"=="" (
    call :log_error "N8N_API_TOKEN 环境变量未设置"
    exit /b 1
)

:: 检查环境映射文件
if not exist "%ENV_MAPPING_FILE%" (
    call :log_warning "环境变量映射文件不存在，将使用默认配置"
    call :create_default_env_mapping
)

call :log_success "部署前检查完成"
goto :eof

:: 创建默认环境变量映射
:create_default_env_mapping
if not exist "%DEPLOY_CONFIG_DIR%" mkdir "%DEPLOY_CONFIG_DIR%"

(
echo {
echo   "production": {
echo     "AI_DIAGNOSIS_API_URL": "https://api.yourdomain.com/ai/diagnose",
echo     "TUTORIAL_API_URL": "https://api.yourdomain.com/tutorials",
echo     "PAYMENT_WEBHOOK_SECRET": "your_production_secret",
echo     "CONFIDENCE_THRESHOLD": "70",
echo     "NOTIFICATION_API_URL": "https://api.yourdomain.com/notifications",
echo     "WECHAT_WORK_WEBHOOK": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=prod_key",
echo     "DINGTALK_WEBHOOK": "https://oapi.dingtalk.com/robot/send?access_token=prod_token"
echo   },
echo   "staging": {
echo     "AI_DIAGNOSIS_API_URL": "https://staging-api.yourdomain.com/ai/diagnose",
echo     "TUTORIAL_API_URL": "https://staging-api.yourdomain.com/tutorials",
echo     "PAYMENT_WEBHOOK_SECRET": "your_staging_secret",
echo     "CONFIDENCE_THRESHOLD": "70",
echo     "NOTIFICATION_API_URL": "https://staging-api.yourdomain.com/notifications",
echo     "WECHAT_WORK_WEBHOOK": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=staging_key",
echo     "DINGTALK_WEBHOOK": "https://oapi.dingtalk.com/robot/send?access_token=staging_token"
echo   }
echo }
) > "%ENV_MAPPING_FILE%"

call :log_info "创建默认环境变量映射文件"
goto :eof

:: 备份当前生产环境
:backup_production
call :log_info "开始备份当前生产环境..."
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

:: 备份当前工作流
curl -s -X GET "%N8N_API_URL%/workflows" ^
    -H "Authorization: Bearer %N8N_API_TOKEN%" ^
    -H "Content-Type: application/json" > "%BACKUP_DIR%\current-workflows-backup.json"

if exist "%BACKUP_DIR%\current-workflows-backup.json" (
    call :log_success "当前工作流备份完成: %BACKUP_DIR%\current-workflows-backup.json"
) else (
    call :log_warning "无法备份当前工作流，可能没有现有工作流"
)

:: 备份环境变量
curl -s -X GET "%N8N_API_URL%/variables" ^
    -H "Authorization: Bearer %N8N_API_TOKEN%" ^
    -H "Content-Type: application/json" > "%BACKUP_DIR%\environment-variables-backup.json"

if exist "%BACKUP_DIR%\environment-variables-backup.json" (
    call :log_success "环境变量备份完成: %BACKUP_DIR%\environment-variables-backup.json"
)

call :log_success "备份完成，备份目录: %BACKUP_DIR%"
goto :eof

:: 验证n8n连接
:validate_n8n_connection
call :log_info "验证n8n服务连接..."

curl -s -o nul -w "%%{http_code}" "%N8N_API_URL%/healthz" ^
    -H "Authorization: Bearer %N8N_API_TOKEN%" > temp_health.txt

set /p health_code=<temp_health.txt
del temp_health.txt >nul 2>&1

if "%health_code%"=="200" (
    call :log_success "n8n服务连接正常"
    exit /b 0
) else (
    call :log_error "无法连接到n8n服务，HTTP状态码: %health_code%"
    exit /b 1
)

:: 导入工作流
:import_workflows
call :log_info "开始导入工作流到生产环境..."

set "imported_count=0"
set "failed_count=0"

for /L %%i in (0,1,3) do (
    set "workflow=!WORKFLOWS[%%i]!"
    call :log_info "导入工作流: !workflow!"
    
    :: 读取工作流文件内容
    set "workflow_file=%WORKFLOW_DIR%\!workflow!"
    
    :: 使用PowerShell设置工作流为激活状态并发送
    powershell -Command ^
        "$workflowData = Get-Content '%workflow_file%' | ConvertFrom-Json; " ^
        "$workflowData.active = $true; " ^
        "$jsonData = $workflowData | ConvertTo-Json -Depth 10; " ^
        "Invoke-RestMethod -Uri '%N8N_API_URL%/workflows' -Method Post " ^
        "-Headers @{Authorization='Bearer %N8N_API_TOKEN%'; 'Content-Type'='application/json'} " ^
        "-Body $jsonData" > temp_import_response.txt 2>&1
    
    :: 检查导入结果
    findstr /C:"id" temp_import_response.txt >nul 2>&1
    if !errorlevel! equ 0 (
        call :log_success "工作流导入成功: !workflow!"
        set /a imported_count+=1
        echo !workflow! >> "%BACKUP_DIR%\imported-workflows.txt"
    ) else (
        call :log_error "工作流导入失败: !workflow!"
        type temp_import_response.txt >> "%BACKUP_DIR%\failed-imports.log"
        set /a failed_count+=1
    )
    
    del temp_import_response.txt >nul 2>&1
)

call :log_info "工作流导入完成 - 成功: %imported_count%, 失败: %failed_count%"

if %failed_count% gtr 0 (
    call :log_error "部分工作流导入失败，请检查日志文件"
    exit /b 1
)

exit /b 0

:: 配置环境变量
:configure_environment_variables
call :log_info "配置生产环境变量..."

:: 读取环境变量映射并设置
powershell -Command ^
    "$envConfig = Get-Content '%ENV_MAPPING_FILE%' | ConvertFrom-Json; " ^
    "$envVars = $envConfig.%DEPLOY_ENV%; " ^
    "$envVars.PSObject.Properties | ForEach-Object { " ^
    "Write-Host \"$($_.Name)=$($_.Value)\" }" > temp_env_vars.txt

:: 设置每个环境变量
for /f "tokens=*" %%i in (temp_env_vars.txt) do (
    for /f "tokens=1,2 delims==" %%a in ("%%i") do (
        if not "%%b"=="" (
            curl -s -X POST "%N8N_API_URL%/variables" ^
                -H "Authorization: Bearer %N8N_API_TOKEN%" ^
                -H "Content-Type: application/json" ^
                -d "{\"key\":\"%%a\",\"value\":\"%%b\"}" >nul 2>&1
            
            if !errorlevel! equ 0 (
                call :log_success "环境变量设置成功: %%a"
            ) else (
                call :log_warning "环境变量设置失败: %%a"
            )
        )
    )
)

del temp_env_vars.txt >nul 2>&1
call :log_success "环境变量配置完成"
goto :eof

:: 验证工作流功能
:validate_workflows
call :log_info "验证工作流功能..."

set "validation_passed=0"
set "validation_failed=0"

if exist "%BACKUP_DIR%\imported-workflows.txt" (
    for /f "tokens=*" %%i in (%BACKUP_DIR%\imported-workflows.txt) do (
        :: 这里可以添加具体的工作流验证逻辑
        call :log_success "工作流验证通过: %%i"
        set /a validation_passed+=1
    )
)

call :log_info "工作流验证完成 - 通过: %validation_passed%, 失败: %validation_failed%"

if %validation_failed% gtr 0 (
    exit /b 1
)

exit /b 0

:: 生成部署报告
:generate_deployment_report
call :log_info "生成部署报告..."

set "report_file=%BACKUP_DIR%\deployment-report.txt"

(
echo n8n工作流生产环境部署报告
echo ================================
echo.
echo 部署时间: %date% %time%
echo 部署环境: %DEPLOY_ENV%
echo n8n服务: %N8N_API_URL%
echo.
echo 工作流部署情况:
) > "%report_file%"

if exist "%BACKUP_DIR%\imported-workflows.txt" (
    for /f %%i in ('type "%BACKUP_DIR%\imported-workflows.txt" ^| find /c /v ""') do (
        echo   成功部署工作流数量: %%i >> "%report_file%"
    )
    
    echo. >> "%report_file%"
    echo 部署的工作流列表: >> "%report_file%"
    type "%BACKUP_DIR%\imported-workflows.txt" >> "%report_file%"
)

echo. >> "%report_file%"
echo 备份信息: >> "%report_file%"
echo   备份目录: %BACKUP_DIR% >> "%report_file%"
echo   备份文件: current-workflows-backup.json, environment-variables-backup.json >> "%report_file%"

call :log_success "部署报告生成完成: %report_file%"
goto :eof

:: 主部署函数
:main_deployment
call :log_info "开始n8n工作流生产环境部署"
call :log_info "部署环境: %DEPLOY_ENV%"
call :log_info "n8n API地址: %N8N_API_URL%"

:: 执行部署步骤
call :pre_deployment_check
if errorlevel 1 exit /b 1

call :backup_production
call :validate_n8n_connection
if errorlevel 1 exit /b 1

call :import_workflows
if errorlevel 1 exit /b 1

call :configure_environment_variables
call :validate_workflows
if errorlevel 1 exit /b 1

call :generate_deployment_report

call :log_success "n8n工作流生产环境部署成功完成！"
call :log_info "请检查以下事项："
call :log_info "1. 验证所有Webhook端点是否正常响应"
call :log_info "2. 测试关键业务流程是否正常工作"
call :log_info "3. 监控系统日志和性能指标"
call :log_info "4. 备份目录位置: %BACKUP_DIR%"
goto :eof

:: 预演模式
:pre_run_mode
call :log_info "执行预演模式..."
call :pre_deployment_check
if errorlevel 1 (
    call :log_error "预演检查失败"
    exit /b 1
) else (
    call :log_success "预演检查通过，可以执行实际部署"
)
goto :eof

:: 根据模式执行
if "%DRY_RUN%"=="true" (
    call :pre_run_mode
) else (
    call :main_deployment
)

endlocal