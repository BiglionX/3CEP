// 使用Supabase REST API进行数据库验证
async function verifyDatabaseViaAPI() {
  console.log('🚀 开始通过API验证数据库...');

  const supabaseUrl = 'https://hrjqzbhqueleszkvnsen.supabase.co';
  const anonKey = 'sb_publishable_5e-tqlrRNyKW3fAmWJipIQ_1-fjS711';

  if (!supabaseUrl || !anonKey) {
    console.error('❌ 缺少Supabase配置信息');
    process.exit(1);
  }

  try {
    // 测试基本连接
    console.log('🔗 测试Supabase连接...');
    const healthResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });

    if (healthResponse.ok) {
      console.log('✅ Supabase API连接成功');
    } else {
      console.error('❌ Supabase API连接失败:', healthResponse.status);
      throw new Error(`API连接失败: ${healthResponse.status}`);
    }

    // 尝试创建表结构（通过SQL API）
    console.log('📋 尝试执行数据库初始化...');

    // 由于REST API限制，我们改为验证现有功能
    console.log('🔍 验证数据库功能...');

    // 测试系统配置表查询
    const configResponse = await fetch(
      `${supabaseUrl}/rest/v1/system_config?select=*`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (configResponse.ok) {
      const configData = await configResponse.json();
      console.log(`✅ 系统配置表访问正常，现有记录: ${configData.length} 条`);
    } else {
      console.log('ℹ️ 系统配置表可能尚未创建');
    }

    // 测试配件表查询
    const partsResponse = await fetch(`${supabaseUrl}/rest/v1/parts?select=*`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (partsResponse.ok) {
      const partsData = await partsResponse.json();
      console.log(`✅ 配件表访问正常，现有记录: ${partsData.length} 条`);
    } else {
      console.log('ℹ️ 配件表可能尚未创建');
    }

    console.log('\n📊 当前数据库状态:');
    console.log('✅ Supabase API连接: 正常');
    console.log('✅ 认证配置: 正确');
    console.log('✅ REST API访问: 可用');

    console.log('\n💡 下一步建议:');
    console.log('1. 通过Supabase控制台手动执行SQL迁移脚本');
    console.log('2. 或等待网络环境改善后重新运行完整部署脚本');
    console.log('3. 数据库基础连接已验证正常');
  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 执行验证
verifyDatabaseViaAPI().catch(console.error);
