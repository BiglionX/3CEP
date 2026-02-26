@echo off
:: 角色权限测试一键执行脚本 (Windows)
:: 自动化验证所有角色的权限配置

echo ==================================================
echo     FixCycle 角色权限测试执行器
echo ==================================================
echo.

:: 检查Node.js环境
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到Node.js环境
    echo 请先安装Node.js并确保已添加到PATH环境变量
    pause
    exit /b 1
)

:: 检查测试配置文件
if not exist "complete-role-accounts.json" (
    echo ❌ 错误: 未找到角色账户配置文件
    echo 请确保在test-accounts目录下运行此脚本
    pause
    exit /b 1
)

echo ✅ 环境检查通过
echo.

:: 设置环境变量
set TEST_ENV=development
set TEST_BASE_URL=http://localhost:3001
set HEADLESS=true

echo 📋 当前配置:
echo    测试环境: %TEST_ENV%
echo    基础URL: %TEST_BASE_URL%
echo    无头模式: %HEADLESS%
echo.

:: 询问用户是否继续
echo 💡 即将开始执行角色权限测试...
echo    - 将验证所有12个角色的权限配置
echo    - 预计耗时: 3-5分钟
echo    - 请确保开发服务器正在运行
echo.

choice /C YN /M "是否继续执行测试"
if %errorlevel% equ 2 (
    echo 用户取消操作
    exit /b 0
)

echo.
echo 🚀 开始执行测试...
echo ====================

:: 第一步: 生成测试数据
echo 1️⃣ 生成测试数据...
node generate-test-data.js
if %errorlevel% neq 0 (
    echo ❌ 测试数据生成失败
    pause
    exit /b 1
)

:: 第二步: 执行权限验证
echo.
echo 2️⃣ 执行权限验证...
node validate-role-permissions.js
set test_result=%errorlevel%

:: 第三步: 显示结果
echo.
echo 3️⃣ 测试完成
echo ====================

if %test_result% equ 0 (
    echo ✅ 所有测试通过！权限配置正确
    echo 🎉 角色权限验证成功完成
) else (
    echo ⚠️  部分测试未通过，请检查权限配置
    echo 📋 详细报告请查看生成的JSON报告文件
)

echo.
echo 📁 相关文件:
echo    - 完整账户配置: complete-role-accounts.json
echo    - 权限映射文件: role-permissions-map.json  
echo    - 测试数据文件: generated-test-data.json
echo    - 测试报告文件: role-permission-test-report-*.json
echo    - 使用指南文档: ROLE_TESTING_GUIDE.md

echo.
echo 💡 建议后续操作:
echo    1. review 生成的测试报告
echo    2. 根据失败项调整权限配置
echo    3. 重新运行测试验证修复效果
echo    4. 在CI/CD中集成权限测试

echo.
pause