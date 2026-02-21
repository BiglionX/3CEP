@echo off
:: Simplified Git Quick Operations Script

echo ========================================
echo Git Quick Operations Menu
echo ========================================

:menu
echo.
echo Please select an operation:
echo 1. Check Status
echo 2. Add All Changes
echo 3. Quick Commit
echo 4. Push to Remote
echo 5. Pull Latest Code
echo 6. Create Feature Branch
echo 7. Merge to Develop
echo 8. View Commit History
echo 9. Exit
echo.

set /p choice=Enter option (1-9): 

if "%choice%"=="1" goto status
if "%choice%"=="2" goto add
if "%choice%"=="3" goto commit
if "%choice%"=="4" goto push
if "%choice%"=="5" goto pull
if "%choice%"=="6" goto branch
if "%choice%"=="7" goto merge
if "%choice%"=="8" goto log
if "%choice%"=="9" goto exit

echo Invalid selection, please try again
goto menu

:status
echo.
echo Current Git Status:
git status
goto menu

:add
echo.
echo Adding all changes...
git add .
echo Done!
goto menu

:commit
echo.
set /p msg=Enter commit message: 
if "%msg%"=="" (
    echo Commit message cannot be empty!
    goto commit
)
git commit -m "%msg%"
goto menu

:push
echo.
echo Pushing code to remote repository...
git push
goto menu

:pull
echo.
echo Pulling latest code...
git pull
goto menu

:branch
echo.
set /p feature=Enter feature name: 
if "%feature%"=="" (
    echo Feature name cannot be empty!
    goto branch
)
git checkout -b feature/%feature%
echo Created and switched to branch: feature/%feature%
goto menu

:merge
echo.
echo Merging to develop branch...
git checkout develop
git pull origin develop
git merge %feature%
git push origin develop
goto menu

:log
echo.
echo Recent commit history:
git log --oneline -10
goto menu

:exit
echo Goodbye!
exit /b 0