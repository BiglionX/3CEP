@echo off
REM Besu 私有链部署脚本 (Windows PowerShell)
REM FixCycle 6.0 Blockchain Production Deployment

echo ========================================
echo Besu 私有链生产环境部署
echo ========================================

REM 检查 Docker 是否安装
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker 未安装，请先安装 Docker Desktop
    pause
    exit /b 1
)

where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose 未安装
    pause
    exit /b 1
)

echo [OK] Docker 环境检查通过
echo.

REM 创建数据目录
echo 创建数据目录...
if not exist "besu-data\validator-1" mkdir besu-data\validator-1
if not exist "besu-data\validator-2" mkdir besu-data\validator-2
if not exist "besu-data\validator-3" mkdir besu-data\validator-3
echo [OK] 目录创建完成
echo.

REM 生成节点密钥（简化版，实际需要更复杂的逻辑）
echo 生成节点私钥...
for %%i in (1,2,3) do (
    if not exist "besu-data\validator-%%i\key" (
        echo 正在生成节点 %%i 的私钥...
        docker run --rm ^
            -v %cd%\besu-data\validator-%%i:/data ^
            hyperledger/besu ^
            operator generate-blockchain-config ^
            --config-file=/config/config.toml ^
            --to=/data ^
            --private-key-file-name=key
        echo [OK] 节点 %%i 私钥生成完成
    ) else (
        echo [SKIP] 节点 %%i 私钥已存在
    )
)
echo.

REM 启动 Besu 节点
echo 启动 Besu 节点...
docker-compose -f docker-compose.besu.yml up -d

echo 等待节点启动...
timeout /t 10 /nobreak >nul

REM 检查节点状态
echo 检查节点状态...
for %%i in (1,2,3) do (
    set /a PORT=8545+(%%i-1)*2
    echo 检查节点 %%i (端口 !PORT!)...

    for /l %%j in (1,1,30) do (
        curl -s -X POST ^
            -H "Content-Type: application/json" ^
            --data "{\"jsonrpc\":\"2.0\",\"method\":\"net_version\",\"params\":[],\"id\":1}" ^
            http://localhost:!PORT! > temp_response_%%i.json

        findstr /C:"result" temp_response_%%i.json >nul 2>&1
        if not errorlevel 1 (
            echo [OK] 节点 %%i 启动成功
            del temp_response_%%i.json
            goto :next_node
        )

        timeout /t 2 /nobreak >nul
    )

    echo [ERROR] 节点 %%i 启动失败
    exit /b 1

    :next_node
)

echo.
echo ========================================
echo Besu 私有链部署完成！
echo ========================================
echo.
echo 节点信息:
echo   节点 1: http://localhost:8545 (主节点)
echo   节点 2: http://localhost:8547
echo   节点 3: http://localhost:8549
echo.
echo Chain ID: 2024
echo 共识机制：IBFT2 PoA
echo 出块时间：5 秒
echo.
echo 下一步操作:
echo   1. 编译智能合约：npm run compile
echo   2. 部署智能合约：npm run deploy:besu
echo   3. 更新合约地址到配置文件
echo.
echo 停止命令：
echo   docker-compose -f docker-compose.besu.yml down
echo.
echo 查看日志:
echo   docker-compose -f docker-compose.besu.yml logs -f
echo.

pause
