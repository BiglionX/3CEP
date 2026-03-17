@echo off
setlocal enabledelayedexpansion

echo Starting git filter-branch to remove sensitive file from history...

git filter-branch --force --index-filter "git rm --cached --ignore-unmatch fix-encoding-api-config.js" --prune-empty --tag-name-filter cat -- --all

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo Filter-branch completed successfully!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Review the changes: git log
    echo 2. Force push to remote: git push --force --all
    echo 3. Force push tags: git push --force --tags
    echo 4. Clean up refs: git for-each-ref --format="delete %(refname)" refs/original/ | git update-ref --stdin
) else (
    echo.
    echo Error occurred during filter-branch
)

pause
