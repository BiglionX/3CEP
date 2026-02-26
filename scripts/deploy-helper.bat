@echo off
setlocal enabledelayedexpansion

echo 🚀 OpenQuote 统一链接库部署助手
echo ==================================
echo.

REM 检查环境变量
if "%NEXT_PUBLIC_SUPABASE_URL%"=="" (
    echo ❌ 错误: 未找到 NEXT_PUBLIC_SUPABASE_URL 环境变量
    echo 请确保在 .env 文件中设置了正确的Supabase配置
    pause
    exit /b 1
)

echo ✅ 环境检查通过
echo Supabase URL: %NEXT_PUBLIC_SUPABASE_URL%
echo.

echo 📋 部署步骤:
echo 1. 登录您的 Supabase 控制台
echo 2. 选择对应的项目  
echo 3. 进入 SQL Editor 页面
echo 4. 复制并执行以下文件的内容:
echo    supabase\migrations\028_unified_link_library_clean.sql
echo.
echo 或者，您也可以使用以下命令行方式:
echo npx supabase migration up
echo.

echo 🔍 部署前检查:
echo 现有表状态:
node -e ^
"const { createClient } = require('@supabase/supabase-js');"^
"const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);"^
"Promise.all(["^
"  supabase.from('hot_links').select('count').limit(1),"^
"  supabase.from('hot_link_pool').select('count').limit(1)"^
"]).then((^[hotLinks, hotLinkPool^]) =^> {"^
"  console.log('hot_links 表:', hotLinks.data?.^[0^]?.count ^|^| 0, '条记录');"^
"  console.log('hot_link_pool 表:', hotLinkPool.data?.^[0^]?.count ^|^| 0, '条记录');"^
"}).catch(err =^> {"^
"  console.log('检查失败:', err.message);"^
"});"

echo.
echo 🎯 部署后验证:
echo node scripts\test-link-query.js
echo.
echo 🌐 管理后台访问:
echo http://localhost:3001/admin/links/library
echo.
echo 🔌 Dify集成配置:
echo - API端点: http://your-domain/api/links/query
echo - 请求方法: POST  
echo - 请求体: {"query": "用户问题", "limit": 3}
echo.

pause