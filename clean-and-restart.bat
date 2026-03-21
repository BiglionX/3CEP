@echo off
echo ========================================
echo 清理 Next.js 缓存并重启开发服务器
echo ========================================

echo [1/3] 停止所有 Node 进程...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/3] 清理 .next 目录...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo [3/3] 清理完成！
echo.
echo 现在可以重新启动开发服务器了
echo 命令：npm run dev
pause
