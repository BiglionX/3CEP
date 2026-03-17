@echo off
echo 正在清除 .next 缓存...
echo.

REM 停止所有 Node 进程
taskkill /F /IM node.exe 2>nul
taskkill /F /IM next-server.exe 2>nul

REM 等待进程结束
timeout /t 2 /nobreak >nul

REM 删除 .next 目录
if exist ".next" (
    echo 删除 .next 目录...
    rmdir /s /q ".next"
    echo .next 目录已删除
) else (
    echo .next 目录不存在
)

REM 删除 node_modules/.cache
if exist "node_modules\.cache" (
    echo 删除 node_modules\.cache 目录...
    rmdir /s /q "node_modules\.cache"
    echo node_modules\.cache 目录已删除
) else (
    echo node_modules\.cache 目录不存在
)

echo.
echo ========================================
echo 缓存清除完成!
echo ========================================
echo.
echo 请运行以下命令重启开发服务器:
echo   npm run dev
echo.
pause
