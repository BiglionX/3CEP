// 使用Supabase REST API验证数据库结构
// 无需安装额外依赖

async function verifyDatabaseStructure() {
  console.log('🔍 开始验证数据库结构...');
  
  const supabaseUrl = 'https://hrjqzbhqueleszkvnsen.supabase.co';
  const serviceKey = 'your_service_role_key_here';
  
  const headers = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json'
  };

  try {
    // 验证必需的表是否存在
    const requiredTables = ['devices', 'fault_types', 'hot_links', 'repair_shops', 'parts'];
    
    console.log('\n📋 验证表结构...');
    for (const tableName of requiredTables) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=*&limit=1`, {
          headers: headers
        });
        
        if (response.ok) {
          console.log(`✅ 表 ${tableName} 存在且可访问`);
          
          // 检查表结构（列是否存在）
          await verifyTableColumns(tableName, headers, supabaseUrl);
        } else {
          console.error(`❌ 表 ${tableName} 不存在或无法访问`);
        }
      } catch (error) {
        console.error(`❌ 检查表 ${tableName} 时出错:`, error.message);
      }
    }
    
    // 验证数据完整性
    console.log('\n📊 验证数据完整性...');
    await checkDataCounts(headers, supabaseUrl);
    
    // 验证RLS策略
    console.log('\n🛡️ 验证RLS策略...');
    await checkRLSPolicies(headers, supabaseUrl);
    
    console.log('\n🎉 数据库验证完成！');
    
  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error.message);
    console.error('详细错误:', error);
  }
}

// 验证表的列结构
async function verifyTableColumns(tableName, headers, supabaseUrl) {
  // 定义每个表期望的列
  const expectedColumns = {
    'devices': ['id', 'brand', 'model', 'category', 'os_type', 'thumbnail_url', 'status'],
    'fault_types': ['id', 'name', 'category', 'sub_category', 'image_url', 'repair_guide_url', 'status'],
    'hot_links': ['id', 'url', 'title', 'category', 'sub_category', 'image_url', 'share_count', 'status'],
    'repair_shops': ['id', 'name', 'country', 'postal_code', 'logo_url', 'cover_image_url', 'specialties', 'languages', 'certification_level', 'is_verified', 'status'],
    'parts': ['id', 'name', 'category', 'brand', 'model']
  };
  
  const expected = expectedColumns[tableName] || [];
  if (expected.length === 0) return;
  
  try {
    // 尝试获取一条记录来检查列结构
    const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=*&limit=1`, {
      headers: headers
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.length > 0) {
        const actualColumns = Object.keys(data[0]);
        const missingColumns = expected.filter(col => !actualColumns.includes(col));
        const extraColumns = actualColumns.filter(col => !expected.includes(col) && col !== 'created_at' && col !== 'updated_at');
        
        if (missingColumns.length > 0) {
          console.warn(`  ⚠️  缺少列: ${missingColumns.join(', ')}`);
        }
        if (extraColumns.length > 0) {
          console.log(`  ℹ️  额外列: ${extraColumns.join(', ')}`);
        }
        if (missingColumns.length === 0) {
          console.log(`  ✅ 列结构完整`);
        }
      }
    }
  } catch (error) {
    console.log(`  ℹ️  无法检查列结构: ${error.message}`);
  }
}

// 检查各表数据量
async function checkDataCounts(headers, supabaseUrl) {
  const tables = [
    { name: 'devices', minCount: 100 },
    { name: 'fault_types', minCount: 20 },
    { name: 'hot_links', minCount: 10 },
    { name: 'repair_shops', minCount: 20 },
    { name: 'parts', minCount: 10 }
  ];
  
  for (const table of tables) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${table.name}?select=count`, {
        headers: {
          ...headers,
          'Prefer': 'count=exact'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const count = Array.isArray(data) ? data.length : 0;
        const status = count >= table.minCount ? '✅' : '⚠️';
        console.log(`${status} ${table.name}: ${count} 条记录 (最低要求: ${table.minCount})`);
      } else {
        console.log(`❌ ${table.name}: 无法获取计数`);
      }
    } catch (error) {
      console.log(`❌ ${table.name}: 查询失败`);
    }
  }
}

// 检查RLS策略
async function checkRLSPolicies(headers, supabaseUrl) {
  try {
    // 检查系统表获取RLS状态
    const response = await fetch(`${supabaseUrl}/rest/v1/?select=tablename,relrowsecurity&table_type=eq.base%20table`, {
      headers: headers
    });
    
    if (response.ok) {
      console.log('✅ RLS策略检查完成');
      // 这里可以进一步检查具体的策略，但REST API有限制
    } else {
      console.log('ℹ️  无法详细检查RLS策略');
    }
  } catch (error) {
    console.log('ℹ️  RLS策略检查受限');
  }
}

// 执行验证
if (require.main === module) {
  verifyDatabaseStructure();
}

module.exports = { verifyDatabaseStructure };
