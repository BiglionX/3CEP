// 测试维修教程API功能
const { createClient } = require('@supabase/supabase-js')

async function testTutorialsAPI() {
  console.log('🧪 开始测试维修教程API...\n');
  
  // 初始化Supabase客户端
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // 1. 测试公共API - 获取教程列表
    console.log('1️⃣ 测试公共API - 获取教程列表');
    const publicResponse = await fetch('http://localhost:3003/api/tutorials?page=1&pageSize=5');
    const publicData = await publicResponse.json();
    
    if (publicResponse.ok) {
      console.log('✅ 公共API调用成功');
      console.log(`   教程数量: ${publicData.tutorials?.length || 0}`);
      console.log(`   总记录数: ${publicData.pagination?.totalCount || 0}`);
    } else {
      console.log('❌ 公共API调用失败:', publicData.error);
    }
    
    // 2. 测试管理员API - 获取所有状态的教程
    console.log('\n2️⃣ 测试管理员API - 获取教程列表');
    const adminResponse = await fetch('http://localhost:3003/api/admin/tutorials?status=draft');
    const adminData = await adminResponse.json();
    
    if (adminResponse.ok) {
      console.log('✅ 管理员API调用成功');
      console.log(`   草稿教程数量: ${adminData.tutorials?.length || 0}`);
    } else {
      console.log('❌ 管理员API调用失败:', adminData.error);
    }
    
    // 3. 测试创建教程（管理员）
    console.log('\n3️⃣ 测试创建新教程');
    const newTutorial = {
      device_model: 'Xiaomi Redmi Note 12',
      fault_type: 'charging_issue',
      title: '红米Note 12 充电问题解决方案',
      description: '详细解决红米Note 12充电慢、无法充电等问题',
      steps: [
        {
          id: 'step1',
          title: '检查充电线和充电器',
          description: '首先检查使用的充电线和充电器是否正常工作',
          estimated_time: 5
        },
        {
          id: 'step2', 
          title: '清洁充电口',
          description: '使用软毛刷清洁手机充电口内的灰尘和杂物',
          estimated_time: 10
        }
      ],
      tools: ['软毛刷', '放大镜'],
      parts: [],
      difficulty_level: 2,
      estimated_time: 30,
      status: 'draft'
    };
    
    // 注意：这里需要真实的管理员认证，暂时跳过创建测试
    console.log('   📝 创建教程测试（需要管理员权限）- 跳过');
    
    // 4. 测试数据库直接查询
    console.log('\n4️⃣ 测试数据库查询');
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('repair_tutorials')
      .select('*')
      .limit(3);
    
    if (!dbError) {
      console.log('✅ 数据库查询成功');
      console.log(`   查询到 ${dbData.length} 条记录`);
      dbData.forEach((tutorial, index) => {
        console.log(`   ${index + 1}. ${tutorial.title} (${tutorial.device_model} - ${tutorial.status})`);
      });
    } else {
      console.log('❌ 数据库查询失败:', dbError.message);
    }
    
    // 5. 测试按条件查询
    console.log('\n5️⃣ 测试条件查询');
    const { data: filteredData, error: filterError } = await supabaseAdmin
      .from('repair_tutorials')
      .select('*')
      .eq('device_model', 'iPhone 14 Pro')
      .eq('status', 'published');
    
    if (!filterError) {
      console.log('✅ 条件查询成功');
      console.log(`   iPhone 14 Pro 发布教程数量: ${filteredData.length}`);
    } else {
      console.log('❌ 条件查询失败:', filterError.message);
    }
    
    console.log('\n🎉 API测试完成！');
    console.log('\n📋 测试总结:');
    console.log('   - 公共API访问: ' + (publicResponse.ok ? '✅' : '❌'));
    console.log('   - 管理员API访问: ' + (adminResponse.ok ? '✅' : '❌'));
    console.log('   - 数据库查询: ' + (!dbError ? '✅' : '❌'));
    console.log('   - 条件查询: ' + (!filterError ? '✅' : '❌'));
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 执行测试
testTutorialsAPI().catch(console.error);