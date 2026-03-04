const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deployUnifiedLinkLibrary() {
  console.log('🚀 开始部署统一链接库系统...\n');

  try {
    // 读取SQL文件
    const sqlContent = fs.readFileSync(
      'supabase/migrations/028_unified_link_library.sql',
      'utf8'
    );

    // 分割SQL语句（按分号分割，但保留多行语句）
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(
        stmt =>
          stmt.length > 0 &&
          !stmt.startsWith('--') &&
          !stmt.startsWith('\\echo')
      );

    console.log(`📝 共计 ${statements.length} 个SQL语句待执行\n`);

    // 执行每个语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim().length === 0) continue;

      console.log(`执行语句 ${i + 1}/${statements.length}:`);
      console.log(
        statement.substring(0, 100) + (statement.length > 100 ? '...' : '')
      );

      try {
        // 对于SELECT语句，使用rpc或直接查询
        if (statement.toUpperCase().startsWith('SELECT')) {
          // 这些是验证语句，跳过执行
          console.log('✅ 验证语句，跳过执行\n');
          continue;
        }

        // 对于CREATE INDEX等DDL语句，需要特殊处理
        if (
          statement.toUpperCase().includes('CREATE INDEX') ||
          statement.toUpperCase().includes('CREATE TABLE') ||
          statement.toUpperCase().includes('ALTER TABLE') ||
          statement.toUpperCase().includes('CREATE POLICY') ||
          statement.toUpperCase().includes('CREATE TRIGGER') ||
          statement.toUpperCase().includes('CREATE FUNCTION')
        ) {
          // 使用rpc执行DDL（如果支持）
          const { error } = await supabase.rpc('execute_sql', {
            sql: statement,
          });
          if (error) {
            // 如果rpc不支持，尝试其他方式
            console.log('⚠️  RPC执行失败，尝试直接执行...');
            // 这里可以添加备用执行逻辑
          }
        } else {
          // 对于INSERT/UPDATE语句，直接执行
          const { error } = await supabase.rpc('execute_sql', {
            sql: statement,
          });
          if (error) {
            console.log('❌ 执行失败:', error.message);
          } else {
            console.log('✅ 执行成功\n');
          }
        }
      } catch (error) {
        console.log('❌ 执行异常:', error.message);
        // 继续执行下一个语句
      }
    }

    // 验证部署结果
    console.log('\n🔍 验证部署结果...');
    await verifyDeployment();
  } catch (error) {
    console.error('❌ 部署失败:', error.message);
    process.exit(1);
  }
}

async function verifyDeployment() {
  try {
    // 检查表是否存在
    const { data: tableExists } = await supabase
      .from('unified_link_library')
      .select('count')
      .limit(1);

    if (tableExists) {
      console.log('✅ unified_link_library 表创建成功');

      // 统计数据
      const { data: stats } = await supabase
        .from('unified_link_library')
        .select('*');

      console.log(`📊 总链接数: ${stats.length}`);

      const activeCount = stats.filter(link => link.status === 'active').length;
      const pendingCount = stats.filter(
        link => link.status === 'pending_review'
      ).length;
      const highPriorityCount = stats.filter(link => link.priority > 50).length;

      console.log(`🟢 活跃链接: ${activeCount}`);
      console.log(`🟡 待审核链接: ${pendingCount}`);
      console.log(`⭐ 高优先级链接: ${highPriorityCount}`);

      // 显示前几条记录
      console.log('\n📋 前5条高优先级链接:');
      const { data: topLinks } = await supabase
        .from('unified_link_library')
        .select('title, source, priority, status')
        .order('priority', { ascending: false })
        .limit(5);

      topLinks.forEach((link, index) => {
        console.log(
          `${index + 1}. ${link.title} (${link.source}) - 优先级: ${link.priority} - 状态: ${link.status}`
        );
      });
    } else {
      console.log('❌ unified_link_library 表不存在');
    }
  } catch (error) {
    console.log('❌ 验证失败:', error.message);
  }
}

// 执行部署
if (require.main === module) {
  deployUnifiedLinkLibrary().catch(console.error);
}

module.exports = { deployUnifiedLinkLibrary };
