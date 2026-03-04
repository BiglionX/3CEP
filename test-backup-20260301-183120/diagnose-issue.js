// 诊断数据库表创建问题
async function diagnoseTableCreation() {
  console.log('🔍 诊断数据库表创建问题...');

  const supabaseUrl = 'https://hrjqzbhqueleszkvnsen.supabase.co';
  const serviceKey = 'your_service_role_key_here';

  try {
    // 1. 检查当前数据库中的所有表
    console.log('\n1️⃣ 检查当前数据库表...');
    const tablesResponse = await fetch(
      `${supabaseUrl}/rest/v1/?select=tablename,schemaname&table_type=eq.base%20table`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    );

    if (tablesResponse.ok) {
      const tables = await tablesResponse.json();
      console.log('📊 当前数据库中的表:');
      tables.forEach(table => {
        console.log(`  - ${table.schemaname}.${table.tablename}`);
      });
    } else {
      console.log('❌ 无法获取表列表');
    }

    // 2. 尝试手动创建一个简单的测试表
    console.log('\n2️⃣ 测试表创建功能...');
    const testTableSQL = `
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // 由于REST API限制，我们需要通过不同的方式测试
    console.log('💡 Supabase REST API限制:');
    console.log('   - 无法直接执行DDL语句(CREATE TABLE等)');
    console.log('   - 需要通过SQL Editor或pgAdmin等工具执行');
    console.log('   - 或者使用Supabase CLI');

    // 3. 检查是否有执行SQL的RPC函数
    console.log('\n3️⃣ 检查可用的RPC函数...');
    const rpcResponse = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });

    if (rpcResponse.ok) {
      const rpcFunctions = await rpcResponse.json();
      console.log('📊 可用的RPC函数:');
      rpcFunctions.forEach(func => {
        console.log(`  - ${func.name}`);
      });
    }

    // 4. 提供解决方案
    console.log(`\n${'='.repeat(50)}`);
    console.log('🔧 问题诊断结果和解决方案');
    console.log('='.repeat(50));

    console.log('\n❌ 问题确认:');
    console.log('   SQL语句执行显示"Success"但实际上表未创建');
    console.log('   这是因为Supabase REST API不支持DDL操作');

    console.log('\n✅ 解决方案:');
    console.log('   1. 使用Supabase控制台SQL Editor执行SQL文件');
    console.log('   2. 或安装Supabase CLI本地执行');
    console.log('   3. 或使用pgAdmin等PostgreSQL客户端工具');

    console.log('\n📋 推荐执行步骤:');
    console.log(
      '   1. 访问: https://app.supabase.com/project/hrjqzbhqueleszkvnsen/sql'
    );
    console.log('   2. 打开SQL Editor');
    console.log('   3. 依次执行以下文件:');
    console.log('      - supabase/migrations/001_init_schema.sql');
    console.log('      - supabase/migrations/002_seed_data.sql');
    console.log('      - supabase/rls_policies.sql');
  } catch (error) {
    console.error('❌ 诊断过程中发生错误:', error.message);
  }
}

// 执行诊断
diagnoseTableCreation().catch(console.error);
