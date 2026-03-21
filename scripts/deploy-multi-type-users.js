/**
 * 多类型用户管理 - 数据库迁移执行脚本
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 错误：缺少 Supabase 环境变量配置');
  console.error(
    '请检查 .env 文件中的 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY'
  );
  process.exit(1);
}

console.log('🔧 正在连接到 Supabase...');
console.log(`   URL: ${SUPABASE_URL}`);

// 读取 SQL 文件
const sqlFilePath = path.join(
  __dirname,
  '..',
  'sql',
  'multi-type-user-management.sql'
);
let sqlContent;

try {
  sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  console.log(`✅ 已读取 SQL 文件：${sqlFilePath}`);
} catch (error) {
  console.error(`❌ 错误：无法读取 SQL 文件`);
  console.error(error.message);
  process.exit(1);
}

// 创建 Supabase 客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
  console.log('\n🚀 开始执行数据库迁移...\n');

  try {
    // 将 SQL 分割成单独的语句
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(
        stmt =>
          stmt.length > 0 &&
          !stmt.startsWith('--') &&
          !stmt.startsWith('COMMENT ON') &&
          !stmt.startsWith('SELECT')
      );

    console.log(`📊 检测到 ${statements.length} 个 SQL 语句需要执行\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const statementNum = i + 1;

      try {
        // 使用 Supabase RPC 执行原始 SQL
        const { error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          // 如果是未知函数错误，尝试直接执行
          if (error.message.includes('function exec_sql')) {
            console.log(
              `⚠️  语句 ${statementNum}: Supabase 不支持直接执行，需要手动导入`
            );
            console.log(`   ${statement.substring(0, 100)}...`);
            errorCount++;
          } else {
            throw error;
          }
        } else {
          successCount++;
          console.log(`✅ 语句 ${statementNum}/${statements.length} 执行成功`);
        }
      } catch (error) {
        console.error(`❌ 语句 ${statementNum} 执行失败:`);
        console.error(`   ${error.message}`);
        console.error(`   SQL: ${statement.substring(0, 100)}...`);
        errorCount++;
      }

      // 添加小延迟避免速率限制
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 迁移完成统计:');
    console.log(`   ✅ 成功：${successCount} 个语句`);
    console.log(`   ❌ 失败：${errorCount} 个语句`);
    console.log('='.repeat(60));

    if (errorCount > 0) {
      console.log('\n⚠️  部分语句执行失败，建议:');
      console.log(
        '   1. 使用 Supabase Dashboard 的 SQL Editor 手动执行 SQL 文件'
      );
      console.log(
        '   2. 使用 psql 命令行工具: psql YOUR_DATABASE_URL < sql/multi-type-user-management.sql'
      );
      console.log('   3. 使用 pgAdmin 等数据库管理工具导入');
    } else {
      console.log('\n🎉 所有语句执行成功！数据库迁移完成！');
    }
  } catch (error) {
    console.error('\n❌ 迁移过程中发生错误:');
    console.error(error.message);
    console.error('\n💡 建议使用以下方法之一手动执行:');
    console.log('   1. Supabase Dashboard -> SQL Editor');
    console.log(
      '   2. psql 命令行：psql YOUR_DATABASE_URL < sql/multi-type-user-management.sql'
    );
    console.log('   3. pgAdmin 或其他数据库管理工具');
  }
}

// 运行迁移
runMigration();
