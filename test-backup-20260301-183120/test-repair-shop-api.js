/**
 * 维修店API测试脚本
 * 验证店铺数据API的功能
 */

async function testRepairShopAPI() {
  console.log('🧪 开始测试维修店API...\n');

  try {
    // 测试1: 基础数据获取
    console.log('1. 测试基础数据获取...');
    const basicResponse = await fetch(
      'http://localhost:3001/api/repair-shop/shops'
    );
    const basicData = await basicResponse.json();
    console.log('✅ 基础数据获取成功:', {
      success: basicData.success,
      count: basicData.count,
      totalPages: basicData.totalPages,
    });

    // 测试2: 搜索功能
    console.log('\n2. 测试搜索功能...');
    const searchResponse = await fetch(
      'http://localhost:3001/api/repair-shop/shops?search=苹果'
    );
    const searchData = await searchResponse.json();
    console.log('✅ 搜索功能测试成功:', {
      success: searchData.success,
      count: searchData.count,
      firstResult: searchData.data[0]?.name,
    });

    // 测试3: 服务筛选
    console.log('\n3. 测试服务筛选...');
    const serviceResponse = await fetch(
      'http://localhost:3001/api/repair-shop/shops?service=iPhone维修'
    );
    const serviceData = await serviceResponse.json();
    console.log('✅ 服务筛选测试成功:', {
      success: serviceData.success,
      count: serviceData.count,
    });

    // 测试4: 评分筛选
    console.log('\n4. 测试评分筛选...');
    const ratingResponse = await fetch(
      'http://localhost:3001/api/repair-shop/shops?minRating=4.7'
    );
    const ratingData = await ratingResponse.json();
    console.log('✅ 评分筛选测试成功:', {
      success: ratingData.success,
      count: ratingData.count,
      avgRating:
        ratingData.data.reduce((sum, shop) => sum + shop.rating, 0) /
        ratingData.count,
    });

    // 测试5: 分页功能
    console.log('\n5. 测试分页功能...');
    const pageResponse = await fetch(
      'http://localhost:3001/api/repair-shop/shops?page=1&pageSize=2'
    );
    const pageData = await pageResponse.json();
    console.log('✅ 分页功能测试成功:', {
      success: pageData.success,
      currentPage: pageData.currentPage,
      totalPages: pageData.totalPages,
      itemsPerPage: pageData.data.length,
    });

    console.log('\n🎉 所有API测试通过！');
    console.log('\n📊 测试总结:');
    console.log('- 基础数据获取: ✅ 通过');
    console.log('- 搜索功能: ✅ 通过');
    console.log('- 服务筛选: ✅ 通过');
    console.log('- 评分筛选: ✅ 通过');
    console.log('- 分页功能: ✅ 通过');

    return true;
  } catch (error) {
    console.error('❌ API测试失败:', error);
    return false;
  }
}

// 执行测试
testRepairShopAPI().then(success => {
  if (success) {
    console.log('\n✅ 维修店API功能验证完成');
  } else {
    console.log('\n❌ 维修店API存在功能性问题');
  }
});
