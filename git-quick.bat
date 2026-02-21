@echo off
:: 精简 Git 操作脚本

echo ========================================
echo Git 快速操作菜单
echo ========================================

:menu
echo.
echo 请选择操作：
echo 1. 查看状态
echo 2. 添加所有更改
echo 3. 快速提交
echo 4. 推送到远程
echo 5. 拉取最新代码
echo 6. 创建功能分支
echo 7. 合并到 develop
echo 8. 查看提交历史
echo 9. 退出
echo.

set /p choice=请输入选项 (1-9): 

if "%choice%"=="1" goto status
if "%choice%"=="2" goto add
if "%choice%"=="3" goto commit
if "%choice%"=="4" goto push
if "%choice%"=="5" goto pull
if "%choice%"=="6" goto branch
if "%choice%"=="7" goto merge
if "%choice%"=="8" goto log
if "%choice%"=="9" goto exit

echo 无效选择，请重新输入
goto menu

:status
echo.
echo 当前 Git 状态：
git status
goto menu

:add
echo.
echo 添加所有更改...
git add .
echo 完成！
goto menu

:commit
echo.
set /p msg=请输入提交信息: 
if "%msg%"=="" (
    echo 提交信息不能为空！
    goto commit
)
git commit -m "%msg%"
goto menu

:push
echo.
echo 推送代码到远程仓库...
git push
goto menu

:pull
echo.
echo 拉取最新代码...
git pull
goto menu

:branch
echo.
set /p feature=请输入功能名称: 
if "%feature%"=="" (
    echo 功能名称不能为空！
    goto branch
)
git checkout -b feature/%feature%
echo 创建并切换到分支: feature/%feature%
goto menu

:merge
echo.
echo 合并到 develop 分支...
git checkout develop
git pull origin develop
git merge %feature%
git push origin develop
goto menu

:log
echo.
echo 最近的提交记录：
git log --oneline -10
goto menu

:exit
echo 再见！
exit /b 0