@echo off
:: Git 批量提交精简脚本

echo ========================================
echo Git 批量提交精简工具
echo ========================================

:menu
echo.
echo 当前待提交文件统计：
powershell "cd '%~dp0'; $files = git status --porcelain; Write-Host '总文件数:' $files.Count"
echo.
echo 请选择操作模式：
echo 1. 查看待提交文件详情
echo 2. 执行第一批次提交（配置文件）
echo 3. 执行第二批次提交（核心文档）
echo 4. 执行第三批次提交（业务文件）
echo 5. 全部自动提交（推荐）
echo 6. 退出
echo.

set /p choice=请输入选项 (1-6): 

if "%choice%"=="1" goto show_files
if "%choice%"=="2" goto batch1
if "%choice%"=="3" goto batch2
if "%choice%"=="4" goto batch3
if "%choice%"=="5" goto auto_commit
if "%choice%"=="6" goto exit

echo 无效选择，请重新输入
goto menu

:show_files
echo.
echo 待提交文件详情：
powershell "cd '%~dp0'; git status --porcelain | Select-Object -First 20"
echo ...
pause
goto menu

:batch1
echo.
echo 执行第一批次提交 - 基础配置文件
git add .gitignore .eslintrc.json .prettierrc .lintstagedrc.json .prettierignore
git add package.json package-lock.json tsconfig.json tsconfig.test.json
git add next.config.js next-env.d.ts
git add postcss.config.js tailwind.config.js jest.config.js playwright.config.ts
git add docker-compose.*.yml vercel.json
git commit -m "chore(config): 完善项目基础配置和环境设置"
echo 第一批次提交完成！
pause
goto menu

:batch2
echo.
echo 执行第二批次提交 - 核心文档
git add README.md QUICK_START.md
git add GIT_QUICK_REFERENCE.md GIT_BRANCH_STRATEGY.md GIT_FILE_ORGANIZATION.md
git add docs/project-overview/*.md docs/technical-docs/*.md
git add docs/guides/*.md
git commit -m "docs(core): 完善项目核心文档和使用指南"
echo 第二批次提交完成！
pause
goto menu

:batch3
echo.
echo 执行第三批次提交 - 业务实现文件
echo 按功能模块分组提交...

:: Git和部署相关
git add .gitmessage git-quick*.bat
git add deploy-*.bat deploy-*.sh scripts/*.bat scripts/*.sh
git commit -m "chore(deploy): 完善部署脚本和工具"

:: 数据库和配置
git add *.sql config/ supabase/
git commit -m "feat(database): 完善数据库结构和配置"

:: 测试和验证
git add tests/ test-*.ts test-*.js
git commit -m "test(core): 完善核心功能测试"

:: 业务模块
git add src/ n8n-workflows/ ml-phase2/
git commit -m "feat(business): 完善核心业务功能实现"

echo 第三批次提交完成！
pause
goto menu

:auto_commit
echo.
echo 开始全自动批量提交...
call :batch1
call :batch2
call :batch3
echo.
echo 所有文件已成功提交！
echo 最终状态检查：
powershell "cd '%~dp0'; $remaining = git status --porcelain; if($remaining.Count -eq 0){Write-Host '✅ 所有文件已提交完成！'} else {Write-Host '⚠️ 仍有' $remaining.Count '个文件待处理'}"
pause
goto menu

:exit
echo 再见！
exit /b 0