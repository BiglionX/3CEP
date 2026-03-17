@echo off
echo ========================================
echo 清理 Next.js 缓存目录
echo ========================================
echo.

echo 正在删除 .next 目录...
if exist .next (
    rmdir /s /q .next
    echo [成功] .next 目录已删除
) else (
    echo [提示] .next 目录不存在
)
echo.

echo 正在删除 node_modules\.cache 目录...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo [成功] node_modules\.cache 目录已删除
) else (
    echo [提示] node_modules\.cache 目录不存在
)
echo.

echo ========================================
echo 缓存清理完成！
echo ========================================
echo.
echo 请运行以下命令启动开发服务器：
echo   npm run dev
echo.
pause
