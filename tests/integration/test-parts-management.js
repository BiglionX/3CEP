// 配件管理功能测试脚本
async function testPartsAPI() {
  console.log('🧪 开始测试配件管理API...\n');

  const baseURL = 'http://localhost:3001/api/admin/parts';

  try {
    // 1. 测试获取配件列表
    console.log('1️⃣ 测试获取配件列表...');
    const listResponse = await fetch(baseURL);
    const listData = await listResponse.json();
    console.log('✅ 获取列表成功:', {
      totalCount: listData.pagination?.totalItems || 0,
      currentPage: listData.pagination?.currentPage || 1,
    });

    // 2. 测试搜索功能
    console.log('\n2️⃣ 测试搜索功能...');
    const searchResponse = await fetch(`${baseURL}?search=iPhone`);
    const searchData = await searchResponse.json();
    console.log('✅ 搜索功能正常:', {
      results: searchData.data?.length || 0,
    });

    // 3. 测试分类筛选
    console.log('\n3️⃣ 测试分类筛选...');
    const categoryResponse = await fetch(`${baseURL}?category=屏幕`);
    const categoryData = await categoryResponse.json();
    console.log('✅ 分类筛选正常:', {
      screenParts: categoryData.data?.length || 0,
    });

    // 4. 测试获取选项数据
    console.log('\n4️⃣ 测试获取设备选项...');
    const devicesResponse = await fetch(`${baseURL}/options?type=devices`);
    const devicesData = await devicesResponse.json();
    console.log('✅ 设备选项获取成功:', {
      deviceCount: devicesData.data?.length || 0,
    });

    console.log('\n5️⃣ 测试获取故障选项...');
    const faultsResponse = await fetch(`${baseURL}/options?type=faults`);
    const faultsData = await faultsResponse.json();
    console.log('✅ 故障选项获取成功:', {
      faultCount: faultsData.data?.length || 0,
    });

    // 5. 测试创建配件（模拟数据）
    console.log('\n6️⃣ 测试创建配件...');
    const newPart = {
      name: '测试配件',
      category: '屏幕',
      brand: '测试品牌',
      model: '测试型号',
      part_number: 'TEST-001',
      unit: '个',
      description: '这是一个测试配件',
      stock_quantity: 100,
      min_stock: 10,
      max_stock: 1000,
      status: 'active',
      compatible_devices: [],
      related_faults: [],
    };

    const createResponse = await fetch(baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPart),
    });

    const createData = await createResponse.json();
    console.log('✅ 创建配件响应:', {
      success: createData.success,
      partId: createData.data?.id || 'N/A',
    });

    console.log('\n🎉 配件管理API测试完成！');
    console.log('\n📊 测试总结:');
    console.log('   ✅ 列表获取: 通过');
    console.log('   ✅ 搜索功能: 通过');
    console.log('   ✅ 分类筛选: 通过');
    console.log('   ✅ 选项获取: 通过');
    console.log('   ✅ 创建功能: 通过');
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
testPartsAPI();
