@echo off
setlocal enabledelayedexpansion

echo ========================================
echo OpenQuote 链接库统一表一键部署工具
echo ========================================
echo.

REM 检查环境
echo 🔍 检查环境配置...
if "%NEXT_PUBLIC_SUPABASE_URL%"=="" (
    echo ❌ 错误: 未找到 Supabase 配置
    echo 请确保已正确配置环境变量
    goto :error
)

echo ✅ Supabase 配置检查通过
echo URL: %NEXT_PUBLIC_SUPABASE_URL%
echo.

REM 显示部署说明
echo 📋 部署说明:
echo 1. 此脚本将指导您完成统一链接库表的手动部署
echo 2. 需要在 Supabase 控制台中执行 SQL 脚本
echo 3. 部署文件位置: supabase/migrations/029_unified_link_library_final.sql
echo.

REM 打开Supabase控制台
echo 🌐 正在打开 Supabase 控制台...
start https://app.supabase.com/

echo.
echo 📝 请按以下步骤操作:
echo 1. 在打开的浏览器中登录您的 Supabase 账户
echo 2. 选择对应的项目
echo 3. 点击左侧 "SQL Editor"
echo 4. 点击 "New query" 创建新查询
echo 5. 复制文件内容并粘贴到编辑器中:
echo    supabase\migrations\029_unified_link_library_final.sql
echo 6. 点击 "RUN" 执行查询
echo.

REM 等待用户确认
echo ⏰ 请在 Supabase 控制台完成上述操作后再继续...
pause

REM 验证部署结果
echo.
echo 🔍 验证部署结果...
node -e ^
"const { createClient } = require('@supabase/supabase-js');" ^
"const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);" ^
"supabase.from('unified_link_library').select('count').limit(1).then(result => {" ^
"  if (result.error) {" ^
"    console.log('❌ 部署验证失败:', result.error.message);" ^
"  } else {" ^
"    console.log('✅ 部署验证成功！');" ^
"    console.log('统一链接库表已创建');" ^
"  }" ^
"}).catch(err => console.log('❌ 连接失败:', err.message));"

echo.
echo 🎯 后续步骤:
echo 1. 运行测试验证: node scripts\test-link-query.js
echo 2. 访问管理后台: http://localhost:3001/admin/links/library
echo 3. 配置 Dify 集成 (如需要)

goto :success

:error
echo.
echo ❌ 部署过程出现错误
exit /b 1

:success
echo.
echo ✅ 部署工具执行完成
echo 如需进一步帮助，请查看 DEPLOYMENT_GUIDE.md 文件
pause