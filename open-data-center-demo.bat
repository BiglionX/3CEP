@echo off
echo 正在打开数据中心门户演示页面...
echo.
echo 文件路径: %cd%\public\data-center-demo.html
echo.

REM 尝试使用默认浏览器打开
start "" "%cd%\public\data-center-demo.html"

echo 演示页面已在浏览器中打开！
echo.
echo 如需查看更多信息，请查看 DATA_CENTER_PORTAL_DEMO.md 文件
echo.
pause