/**
 * 简化版WMS效能分析看板测试
 * 直接测试API端点的基本连通性
 */

async function testBasicConnectivity() {
  console.log('📡 测试WMS效能分析看板API连通性...\n');

  try {
    // 测试KPI定义接口
    console.log('📋 测试KPI定义接口 (/api/wms/dashboard/kpi-definitions)');
    const kpiResponse = await fetch(
      'http://localhost:3001/api/wms/dashboard/kpi-definitions'
    );

    console.log(`   状态码: ${kpiResponse.status}`);
    console.log(`   状态文本: ${kpiResponse.statusText}`);

    if (kpiResponse.ok) {
      const kpiData = await kpiResponse.json();
      console.log('   ✅ 响应成功');
      console.log(`   响应数据结构: ${Object.keys(kpiData)}`);
      if (kpiData.success) {
        console.log(`   KPI数量: ${kpiData.data?.totalCount || 0}`);
      }
    } else {
      console.log('   ❌ 响应失败');
      const errorText = await kpiResponse.text();
      console.log(`   错误内容: ${errorText.substring(0, 200)}...`);
    }

    // 测试性能看板接口
    console.log('\n📊 测试性能看板接口 (/api/wms/dashboard/performance)');
    const perfResponse = await fetch(
      'http://localhost:3001/api/wms/dashboard/performance'
    );

    console.log(`   状态码: ${perfResponse.status}`);
    console.log(`   状态文本: ${perfResponse.statusText}`);

    if (perfResponse.ok) {
      const perfData = await perfResponse.json();
      console.log('   ✅ 响应成功');
      console.log(`   响应数据结构: ${Object.keys(perfData)}`);
      if (perfData.success) {
        console.log(
          `   仓库数量: ${perfData.data?.summary?.totalWarehouses || 0}`
        );
        console.log(`   告警数量: ${perfData.data?.alerts?.length || 0}`);
      }
    } else {
      console.log('   ❌ 响应失败');
      const errorText = await perfResponse.text();
      console.log(`   错误内容: ${errorText.substring(0, 200)}...`);
    }

    console.log('\n✅ 连通性测试完成');
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    if (error.cause) {
      console.error('   详细错误:', error.cause);
    }
  }
}

// 运行测试
testBasicConnectivity();
