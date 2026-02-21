// 数据库部署验证脚本
const { Client } = require('pg');
const { execSync } = require('child_process');

async function verifyDatabase() {
  console.log('🔍 开始数据库验证...');
  
  // 从环境变量获取数据库连接信息
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ 未找到 DATABASE_URL 环境变量');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    // 连接数据库
    await client.connect();
    console.log('✅ 数据库连接成功');

    // 验证表结构
    const tables = ['parts', 'part_prices', 'uploaded_content', 'appointments', 'system_config'];
    console.log('\n📋 验证表结构...');
    
    for (const table of tables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`, [table]);
      
      if (result.rows[0].exists) {
        console.log(`✅ 表 ${table} 存在`);
        
        // 检查表中的记录数
        const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`   📊 记录数: ${countResult.rows[0].count}`);
      } else {
        console.error(`❌ 表 ${table} 不存在`);
        throw new Error(`Table ${table} not found`);
      }
    }

    // 验证RLS策略
    console.log('\n🛡️ 验证RLS策略...');
    const rlsResult = await client.query(`
      SELECT tablename, relrowsecurity as rls_enabled
      FROM pg_tables t
      JOIN pg_class c ON t.tablename = c.relname
      WHERE t.schemaname = 'public' 
      AND t.tablename IN ($1, $2, $3, $4, $5)
      ORDER BY tablename`, tables);
    
    let rlsEnabledCount = 0;
    rlsResult.rows.forEach(row => {
      if (row.rls_enabled) {
        console.log(`✅ 表 ${row.tablename} RLS已启用`);
        rlsEnabledCount++;
      } else {
        console.warn(`⚠️ 表 ${row.tablename} RLS未启用`);
      }
    });
    
    if (rlsEnabledCount === tables.length) {
      console.log('✅ 所有表RLS策略已正确应用');
    } else {
      console.warn(`⚠️ 部分表RLS策略未启用 (${rlsEnabledCount}/${tables.length})`);
    }

    // 验证索引
    console.log('\n🔍 验证索引...');
    const indexResult = await client.query(`
      SELECT indexname, tablename
      FROM pg_indexes 
      WHERE schemaname = 'public'
      AND tablename IN ($1, $2, $3, $4, $5)
      ORDER BY tablename, indexname`, tables);
    
    console.log(`✅ 创建了 ${indexResult.rowCount} 个索引`);

    // 验证视图
    console.log('\n👁️ 验证视图...');
    const viewResult = await client.query(`
      SELECT viewname 
      FROM pg_views 
      WHERE schemaname = 'public'
      AND viewname = 'parts_with_prices'`);
    
    if (viewResult.rowCount > 0) {
      console.log('✅ 视图 parts_with_prices 存在');
    } else {
      console.error('❌ 视图 parts_with_prices 不存在');
      throw new Error('View parts_with_prices not found');
    }

    // 测试基本查询
    console.log('\n🧪 测试基本查询...');
    const testData = await client.query('SELECT * FROM parts_with_prices LIMIT 1');
    if (testData.rowCount > 0) {
      console.log('✅ 基本查询测试通过');
    } else {
      console.warn('⚠️ 无测试数据，请确认是否已插入种子数据');
    }

    // 验证扩展
    console.log('\n🔌 验证PostgreSQL扩展...');
    const extResult = await client.query(`
      SELECT name FROM pg_available_extensions 
      WHERE name = 'uuid-ossp'`);
    
    if (extResult.rowCount > 0) {
      console.log('✅ uuid-ossp 扩展可用');
    } else {
      console.error('❌ uuid-ossp 扩展不可用');
    }

    console.log('\n🎉 数据库验证完成！');
    console.log('📊 部署摘要:');
    console.log(`   - 表数量: ${tables.length}`);
    console.log(`   - RLS启用表: ${rlsEnabledCount}/${tables.length}`);
    console.log(`   - 索引数量: ${indexResult.rowCount}`);
    console.log(`   - 视图数量: 1`);

  } catch (error) {
    console.error('❌ 数据库验证失败:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// 执行验证
verifyDatabase().catch(console.error);