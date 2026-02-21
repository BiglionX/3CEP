// 简化版数据库部署验证脚本
const { Client } = require('pg');

async function deployAndVerify() {
  console.log('🚀 开始数据库部署验证...');
  
  // 从环境变量获取数据库连接信息
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:Sup_105!^-^@db.hrjqzbhqueleszkvnsen.supabase.co:5432/postgres';
  
  if (!databaseUrl) {
    console.error('❌ 未找到数据库连接信息');
    process.exit(1);
  }

  console.log('🔗 连接数据库...');
  const client = new Client({ connectionString: databaseUrl });

  try {
    // 连接数据库
    await client.connect();
    console.log('✅ 数据库连接成功');

    // 执行初始化脚本
    console.log('📋 执行数据库初始化...');
    
    // 读取并执行SQL文件
    const fs = require('fs');
    const path = require('path');
    
    // 执行表结构创建
    const initSql = fs.readFileSync(path.join(__dirname, '../supabase/migrations/001_init_schema.sql'), 'utf8');
    await client.query(initSql);
    console.log('✅ 表结构创建完成');

    // 执行种子数据插入
    const seedSql = fs.readFileSync(path.join(__dirname, '../supabase/migrations/002_seed_data.sql'), 'utf8');
    await client.query(seedSql);
    console.log('✅ 种子数据插入完成');

    // 验证数据
    console.log('🔍 验证数据完整性...');
    
    const tables = ['parts', 'part_prices', 'uploaded_content', 'appointments', 'system_config'];
    
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`✅ 表 ${table}: ${result.rows[0].count} 条记录`);
    }

    // 测试查询
    console.log('🧪 测试基本查询...');
    const testData = await client.query('SELECT * FROM parts LIMIT 3');
    console.log('✅ 配件数据查询测试通过');
    
    const priceData = await client.query('SELECT * FROM part_prices LIMIT 3');
    console.log('✅ 价格数据查询测试通过');

    console.log('\n🎉 数据库部署验证完成！');
    console.log('📊 部署摘要:');
    console.log('   - 表结构: 已创建');
    console.log('   - 种子数据: 已插入');
    console.log('   - 基本查询: 测试通过');
    console.log('   - 数据库连接: 正常');

  } catch (error) {
    console.error('❌ 部署过程中发生错误:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// 执行部署
deployAndVerify().catch(console.error);