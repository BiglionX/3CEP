@echo off
cd /d "%~dp0"
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch src/services/api-config-service.ts" --prune-empty --tag-name-filter cat -- --all
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch src/tech/api/services/api-config-service.ts" --prune-empty --tag-name-filter cat -- --all
echo Filter completed
pause
