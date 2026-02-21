// 测试维修教程HTTP API功能
async function testTutorialsAPI() {
  console.log('🧪 开始测试维修教程API...\n');
  
  const baseUrl = 'http://localhost:3003';
  
  try {
    // 1. 测试公共API - 获取教程列表
    console.log('1️⃣ 测试公共API - 获取教程列表');
    const publicResponse = await fetch(`${baseUrl}/api/tutorials?page=1&pageSize=5`);
    const publicData = await publicResponse.json();
    
    if (publicResponse.ok) {
      console.log('✅ 公共API调用成功');
      console.log(`   教程数量: ${publicData.tutorials?.length || 0}`);
      console.log(`   总记录数: ${publicData.pagination?.totalCount || 0}`);
      if (publicData.tutorials && publicData.tutorials.length > 0) {
        console.log('   教程预览:');
        publicData.tutorials.slice(0, 2).forEach((tutorial, index) => {
          console.log(`     ${index + 1}. ${tutorial.title} (${tutorial.device_model})`);
        });
      }
    } else {
      console.log('❌ 公共API调用失败:', publicData.error);
      console.log('   详细信息:', publicData.details || '无');
    }
    
    // 2. 测试管理员API - 获取所有状态的教程
    console.log('\n2️⃣ 测试管理员API - 获取教程列表');
    const adminResponse = await fetch(`${baseUrl}/api/admin/tutorials?status=draft`);
    const adminData = await adminResponse.json();
    
    if (adminResponse.ok) {
      console.log('✅ 管理员API调用成功');
      console.log(`   草稿教程数量: ${adminData.tutorials?.length || 0}`);
    } else {
      console.log('❌ 管理员API调用失败:', adminData.error);
      console.log('   详细信息:', adminData.details || '无');
    }
    
    // 3. 测试按设备型号筛选
    console.log('\n3️⃣ 测试按设备型号筛选');
    const deviceFilterResponse = await fetch(`${baseUrl}/api/tutorials?deviceModel=iPhone 14 Pro`);
    const deviceFilterData = await deviceFilterResponse.json();
    
    if (deviceFilterResponse.ok) {
      console.log('✅ 设备筛选API调用成功');
      console.log(`   iPhone 14 Pro 教程数量: ${deviceFilterData.tutorials?.length || 0}`);
    } else {
      console.log('❌ 设备筛选API调用失败:', deviceFilterData.error);
    }
    
    // 4. 测试搜索功能
    console.log('\n4️⃣ 测试搜索功能');
    const searchResponse = await fetch(`${baseUrl}/api/tutorials?search=屏幕`);
    const searchData = await searchResponse.json();
    
    if (searchResponse.ok) {
      console.log('✅ 搜索API调用成功');
      console.log(`   包含"屏幕"的教程数量: ${searchData.tutorials?.length || 0}`);
    } else {
      console.log('❌ 搜索API调用失败:', searchData.error);
    }
    
    // 5. 测试单个教程详情（假设第一个教程存在）
    console.log('\n5️⃣ 测试单个教程详情');
    // 先获取一个教程ID
    if (publicData.tutorials && publicData.tutorials.length > 0) {
      const firstTutorialId = publicData.tutorials[0].id;
      const detailResponse = await fetch(`${baseUrl}/api/tutorials/${firstTutorialId}`);
      const detailData = await detailResponse.json();
      
      if (detailResponse.ok) {
        console.log('✅ 教程详情API调用成功');
        console.log(`   教程标题: ${detailData.tutorial?.title}`);
        console.log(`   浏览次数: ${detailData.tutorial?.view_count}`);
      } else {
        console.log('❌ 教程详情API调用失败:', detailData.error);
      }
    } else {
      console.log('   ⚠️ 无教程可供测试详情接口');
    }
    
    console.log('\n🎉 API测试完成！');
    console.log('\n📋 测试总结:');
    console.log('   - 公共API访问: ' + (publicResponse.ok ? '✅' : '❌'));
    console.log('   - 管理员API访问: ' + (adminResponse.ok ? '✅' : '❌'));
    console.log('   - 设备筛选: ' + (deviceFilterResponse.ok ? '✅' : '❌'));
    console.log('   - 搜索功能: ' + (searchResponse.ok ? '✅' : '❌'));
    console.log('   - 教程详情: ' + (typeof detailResponse !== 'undefined' ? (detailResponse.ok ? '✅' : '❌') : '⚠️ 未测试'));
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    if (error.cause) {
      console.error('   详细错误:', error.cause);
    }
  }
}

// 执行测试
testTutorialsAPI().catch(console.error);