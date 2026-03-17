@echo off
cd /d %~dp0
setlocal

echo Starting filter-branch...
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch fix-encoding-api-config.js" --prune-empty --tag-name-filter cat -- --all

echo.
echo Done!
pause
