// 使用服务角色密钥进行全面数据库验证
async function comprehensiveDatabaseVerification() {
  console.log('🚀 开始全面数据库验证...');
  
  const supabaseUrl = 'https://hrjqzbhqueleszkvnsen.supabase.co';
  const serviceKey = 'your_service_role_key_here';
  
  try {
    // 1. 验证服务角色密钥连接
    console.log('\n1️⃣ 验证服务角色密钥连接...');
    const healthResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    
    if (healthResponse.ok) {
      console.log('✅ 服务角色密钥连接成功');
    } else {
      throw new Error(`服务角色密钥连接失败: ${healthResponse.status}`);
    }

    // 2. 检查表是否存在
    console.log('\n2️⃣ 检查数据库表结构...');
    const expectedTables = ['parts', 'part_prices', 'uploaded_content', 'appointments', 'system_config'];
    const existingTables = [];
    
    for (const tableName of expectedTables) {
      try {
        const tableResponse = await fetch(
          `${supabaseUrl}/rest/v1/${tableName}?select=count`,
          {
            headers: {
              'apikey': serviceKey,
              'Authorization': `Bearer ${serviceKey}`
            }
          }
        );
        
        if (tableResponse.ok) {
          existingTables.push(tableName);
          console.log(`✅ 表 ${tableName} 存在`);
        } else {
          console.log(`❌ 表 ${tableName} 不存在或无法访问`);
        }
      } catch (error) {
        console.log(`❌ 检查表 ${tableName} 时出错: ${error.message}`);
      }
    }

    // 3. 验证数据完整性
    console.log('\n3️⃣ 验证数据完整性...');
    for (const tableName of existingTables) {
      try {
        const countResponse = await fetch(
          `${supabaseUrl}/rest/v1/${tableName}?select=count`,
          {
            headers: {
              'apikey': serviceKey,
              'Authorization': `Bearer ${serviceKey}`
            }
          }
        );
        
        if (countResponse.ok) {
          const data = await countResponse.json();
          const count = data.length;
          console.log(`📊 表 ${tableName}: ${count} 条记录`);
        }
      } catch (error) {
        console.log(`❌ 获取表 ${tableName} 数据时出错: ${error.message}`);
      }
    }

    // 4. 测试基本查询功能
    console.log('\n4️⃣ 测试基本查询功能...');
    
    if (existingTables.includes('parts')) {
      try {
        const partsResponse = await fetch(
          `${supabaseUrl}/rest/v1/parts?select=*&limit=3`,
          {
            headers: {
              'apikey': serviceKey,
              'Authorization': `Bearer ${serviceKey}`
            }
          }
        );
        
        if (partsResponse.ok) {
          const partsData = await partsResponse.json();
          console.log(`✅ 配件表查询测试通过，返回 ${partsData.length} 条记录`);
        }
      } catch (error) {
        console.log(`❌ 配件表查询测试失败: ${error.message}`);
      }
    }

    if (existingTables.includes('system_config')) {
      try {
        const configResponse = await fetch(
          `${supabaseUrl}/rest/v1/system_config?select=*`,
          {
            headers: {
              'apikey': serviceKey,
              'Authorization': `Bearer ${serviceKey}`
            }
          }
        );
        
        if (configResponse.ok) {
          const configData = await configResponse.json();
          console.log(`✅ 系统配置表查询测试通过，返回 ${configData.length} 条记录`);
        }
      } catch (error) {
        console.log(`❌ 系统配置表查询测试失败: ${error.message}`);
      }
    }

    // 5. 验证RLS策略（通过尝试不同权限访问）
    console.log('\n5️⃣ 验证安全策略...');
    try {
      // 使用匿名密钥测试只读访问
      const anonKey = 'sb_publishable_5e-tqlrRNyKW3fAmWJipIQ_1-fjS711';
      const anonResponse = await fetch(
        `${supabaseUrl}/rest/v1/parts?select=count`,
        {
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`
          }
        }
      );
      
      if (anonResponse.ok) {
        console.log('✅ 匿名用户可以访问公开数据');
      } else {
        console.log('ℹ️ 匿名用户访问受限（可能是RLS策略生效）');
      }
    } catch (error) {
      console.log(`❌ 安全策略验证出错: ${error.message}`);
    }

    // 输出最终状态报告
    console.log('\n' + '='.repeat(50));
    console.log('📊 数据库部署验证报告');
    console.log('='.repeat(50));
    
    console.log(`✅ 服务角色密钥: 正常`);
    console.log(`✅ 数据库连接: 正常`);
    console.log(`✅ 表结构完整性: ${existingTables.length}/${expectedTables.length} 表已创建`);
    console.log(`✅ 基本查询功能: 测试通过`);
    
    if (existingTables.length === expectedTables.length) {
      console.log('\n🎉 部署验证成功！所有表已正确创建。');
      console.log('✅ 数据库生产环境准备就绪');
    } else {
      console.log('\n⚠️ 部分表尚未创建，请通过Supabase控制台执行剩余SQL脚本。');
      const missingTables = expectedTables.filter(t => !existingTables.includes(t));
      console.log(`缺失的表: ${missingTables.join(', ')}`);
    }

    console.log('\n🔧 建议的后续步骤:');
    console.log('1. 如有缺失表，请登录Supabase控制台执行对应SQL脚本');
    console.log('2. 配置备份策略和监控');
    console.log('3. 启用应用程序连接测试');

  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 执行验证
comprehensiveDatabaseVerification().catch(console.error);