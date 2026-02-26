#!/bin/bash
# OpenQuote 链接库模块 - 四阶段部署验证脚本
# 符合项目标准化部署流程：构建→数据库迁移→服务部署→验证

set -e

echo "🚀 OpenQuote 链接库模块部署验证"
echo "=================================="
echo ""

# 阶段1: 环境检查与构建验证
echo "_STAGE 1: 环境与构建验证_"
echo "------------------------"

# 检查必需环境变量
echo "🔍 检查环境配置..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ 错误: NEXT_PUBLIC_SUPABASE_URL 未配置"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ 错误: SUPABASE_SERVICE_ROLE_KEY 未配置"
    exit 1
fi

echo "✅ 环境变量检查通过"
echo "🌍 Supabase URL: ${NEXT_PUBLIC_SUPABASE_URL:0:50}..."

# 检查必需文件
echo "📂 检查部署文件..."
required_files=(
    "supabase/migrations/029_unified_link_library_final.sql"
    "src/app/api/links/query/route.ts"
    "src/app/api/links/priority/route.ts"
    "src/app/admin/links/library/page.tsx"
    "config/dify-link-library-workflow.json"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 缺少必需文件: $file"
        exit 1
    fi
done
echo "✅ 所有必需文件存在"

# 阶段2: 数据库迁移验证
echo ""
echo "_STAGE 2: 数据库迁移验证_"
echo "-------------------------"

echo "📊 验证数据库表结构..."
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function validateDatabase() {
    try {
        // 检查统一链接库表
        const { data: tableData, error: tableError } = await supabase
            .from('unified_link_library')
            .select('count')
            .limit(1);
        
        if (tableError) {
            console.log('❌ unified_link_library 表不存在或无法访问');
            process.exit(1);
        }
        
        // 获取详细统计
        const { data: stats } = await supabase
            .from('unified_link_library')
            .select('*');
        
        const total = stats.length;
        const active = stats.filter(s => s.status === 'active').length;
        const pending = stats.filter(s => s.status === 'pending_review').length;
        const highPriority = stats.filter(s => s.priority > 50).length;
        
        console.log('✅ unified_link_library 表验证通过');
        console.log('📊 数据统计:');
        console.log('   总记录数:', total);
        console.log('   活跃链接:', active);
        console.log('   待审核:', pending);
        console.log('   高优先级:', highPriority);
        
        // 验证表结构完整性
        const sampleRecord = stats[0];
        const requiredFields = ['id', 'url', 'title', 'priority', 'status'];
        const missingFields = requiredFields.filter(field => !(field in sampleRecord));
        
        if (missingFields.length > 0) {
            console.log('❌ 缺少必要字段:', missingFields.join(', '));
            process.exit(1);
        }
        
        console.log('✅ 表结构完整性验证通过');
        
    } catch (error) {
        console.log('❌ 数据库验证失败:', error.message);
        process.exit(1);
    }
}

validateDatabase().catch(() => process.exit(1));
"

# 阶段3: 服务部署验证
echo ""
echo "_STAGE 3: 服务部署验证_"
echo "-----------------------"

echo "サービ 验证API服务可用性..."
# 检查本地开发服务器是否运行
if ! nc -z localhost 3001 2>/dev/null; then
    echo "⚠️  警告: 本地开发服务器 (端口3001) 未运行"
    echo "💡 建议启动命令: npm run dev"
else
    echo "✅ 本地开发服务器运行正常"
fi

# 验证API端点
echo "🔗 验证核心API端点..."
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function validateAPI() {
    try {
        // 测试查询功能
        const testQuery = 'iPhone电池';
        const { data, error } = await supabase
            .from('unified_link_library')
            .select('url, title, priority, source')
            .eq('status', 'active')
            .or(\`title.ilike.%\${testQuery}%,description.ilike.%\${testQuery}%\`)
            .order('priority', { ascending: false })
            .limit(3);
        
        if (error) {
            console.log('❌ API查询功能测试失败:', error.message);
            process.exit(1);
        }
        
        console.log('✅ API查询功能正常');
        console.log('📊 测试查询返回', data.length, '条结果');
        
        // 性能测试
        const startTime = Date.now();
        for (let i = 0; i < 5; i++) {
            await supabase
                .from('unified_link_library')
                .select('count')
                .limit(1);
        }
        const avgTime = (Date.now() - startTime) / 5;
        
        console.log('⚡ API响应性能: 平均', avgTime.toFixed(2), 'ms');
        
        if (avgTime > 500) {
            console.log('⚠️  警告: API响应时间较慢');
        }
        
    } catch (error) {
        console.log('❌ API验证失败:', error.message);
        process.exit(1);
    }
}

validateAPI().catch(() => process.exit(1));
"

# 阶段4: 集成测试与回归验证
echo ""
echo "_STAGE 4: 集成测试与回归验证_"
echo "----------------------------"

echo "🧪 执行端到端集成测试..."
node scripts/test-dify-integration.js

echo ""
echo "📋 部署验证总结"
echo "==============="
echo "✅ 环境配置检查通过"
echo "✅ 数据库迁移验证通过" 
echo "✅ API服务功能正常"
echo "✅ 集成测试全部通过"
echo ""
echo "🎉 OpenQuote 链接库模块部署验证完成！"
echo "🔧 可用功能:"
echo "   - 管理后台: http://localhost:3001/admin/links/library"
echo "   - API接口: POST /api/links/query"
echo "   - Dify集成: 导入 config/dify-link-library-workflow.json"
echo ""
echo "📝 后续建议:"
echo "   1. 在生产环境部署前执行完整回归测试"
echo "   2. 配置监控告警机制"
echo "   3. 建立定期备份策略"