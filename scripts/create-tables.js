// 直接通过Supabase API创建表结构
async function createDatabaseTables() {
  console.log('🚀 开始创建数据库表结构...');

  const supabaseUrl = 'https://hrjqzbhqueleszkvnsen.supabase.co';
  const serviceKey = 'your_service_role_key_here';

  try {
    // 1. 创建配件表 (parts)
    console.log('\n1️⃣ 创建配件表 (parts)...');
    const createPartsTable = `
      CREATE TABLE IF NOT EXISTS parts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        brand VARCHAR(100),
        model VARCHAR(100),
        description TEXT,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const partsResponse = await fetch(
      `${supabaseUrl}/rest/v1/rpc/execute_sql`,
      {
        method: 'POST',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql: createPartsTable }),
      }
    );

    if (partsResponse.ok) {
      console.log('✅ 配件表创建成功');
    } else {
      console.log('ℹ️ 配件表可能已存在或需要通过控制台创建');
    }

    // 2. 创建价格表 (part_prices)
    console.log('\n2️⃣ 创建价格表 (part_prices)...');
    const createPricesTable = `
      CREATE TABLE IF NOT EXISTS part_prices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
        platform VARCHAR(50) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        url TEXT,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const pricesResponse = await fetch(
      `${supabaseUrl}/rest/v1/rpc/execute_sql`,
      {
        method: 'POST',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql: createPricesTable }),
      }
    );

    if (pricesResponse.ok) {
      console.log('✅ 价格表创建成功');
    } else {
      console.log('ℹ️ 价格表可能已存在或需要通过控制台创建');
    }

    // 3. 创建上传内容表 (uploaded_content)
    console.log('\n3️⃣ 创建上传内容表 (uploaded_content)...');
    const createContentTable = `
      CREATE TABLE IF NOT EXISTS uploaded_content (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        url TEXT NOT NULL UNIQUE,
        title VARCHAR(255),
        description TEXT,
        content_type VARCHAR(50),
        user_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 4. 创建预约表 (appointments)
    console.log('\n4️⃣ 创建预约表 (appointments)...');
    const createAppointmentsTable = `
      CREATE TABLE IF NOT EXISTS appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 5. 创建系统配置表 (system_config)
    console.log('\n5️⃣ 创建系统配置表 (system_config)...');
    const createConfigTable = `
      CREATE TABLE IF NOT EXISTS system_config (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key VARCHAR(100) UNIQUE NOT NULL,
        value JSONB,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    console.log('\n📋 表结构创建语句已生成');
    console.log('💡 由于REST API限制，建议通过以下方式创建表结构:');
    console.log('   1. 登录 Supabase 控制台');
    console.log('   2. 进入 SQL Editor');
    console.log('   3. 执行 supabase/migrations/001_init_schema.sql 文件内容');

    // 尝试检查表是否已存在
    console.log('\n🔍 检查现有表结构...');
    const tablesToCheck = [
      'parts',
      'part_prices',
      'uploaded_content',
      'appointments',
      'system_config',
    ];
    const existingTables = [];

    for (const tableName of tablesToCheck) {
      try {
        const checkResponse = await fetch(
          `${supabaseUrl}/rest/v1/${tableName}?select=count&id=eq.1`,
          {
            headers: {
              apikey: serviceKey,
              Authorization: `Bearer ${serviceKey}`,
            },
          }
        );

        if (checkResponse.ok) {
          existingTables.push(tableName);
          console.log(`✅ 表 ${tableName} 已存在`);
        } else {
          console.log(`❌ 表 ${tableName} 不存在`);
        }
      } catch (error) {
        console.log(`❌ 检查表 ${tableName} 时出错`);
      }
    }

    console.log(
      `\n📊 当前状态: ${existingTables.length}/${tablesToCheck.length} 个表已存在`
    );

    if (existingTables.length === tablesToCheck.length) {
      console.log('🎉 所有表结构已存在！');
    } else {
      const missingTables = tablesToCheck.filter(
        t => !existingTables.includes(t)
      );
      console.log(`⚠️ 缺失的表: ${missingTables.join(', ')}`);
      console.log(
        '🔧 请通过Supabase控制台SQL Editor执行相应的CREATE TABLE语句'
      );
    }
  } catch (error) {
    console.error('❌ 创建表结构时发生错误:', error.message);
    console.log('\n💡 建议解决方案:');
    console.log('1. 登录 https://app.supabase.com');
    console.log('2. 选择项目 hrjqzbhqueleszkvnsen');
    console.log('3. 进入 SQL Editor');
    console.log('4. 执行 supabase/migrations/001_init_schema.sql 文件内容');
  }
}

// 执行表结构创建
createDatabaseTables().catch(console.error);
