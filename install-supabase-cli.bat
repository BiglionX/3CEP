@echo off
echo ========================================
echo Supabase CLI 安装脚本
echo ========================================
echo.

echo 方法 1: 下载官方安装包
echo 访问: https://github.com/supabase/cli/releases
echo 下载最新的 Windows 安装包 (supabase_windows_amd64.exe)
echo 重命名为 supabase.exe 并移动到系统 PATH 目录
echo.

echo 方法 2: 使用 Chocolatey
echo choco install supabase-cli
echo.

echo 方法 3: 使用 PowerShell 手动安装
echo 1. 下载: https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.exe
echo 2. 重命名为 supabase.exe
echo 3. 移动到: C:\Windows\System32 或其他 PATH 目录
echo.

echo 方法 4: 使用项目本地版本
echo 在项目中使用 npx supabase 或将 CLI 放入项目目录
echo.

echo ========================================
echo 推荐操作步骤:
echo ========================================
echo.
echo 1. 打开浏览器访问: https://github.com/supabase/cli/releases
echo 2. 下载: supabase_windows_amd64.exe (约 50MB)
echo 3. 重命名为 supabase.exe
echo 4. 移动到以下任一目录:
echo    - C:\Windows\System32\ (推荐，需要管理员权限)
echo    - C:\Users\%USERNAME%\AppData\Local\Programs\
echo    - 或添加到系统 PATH
echo.

pause
