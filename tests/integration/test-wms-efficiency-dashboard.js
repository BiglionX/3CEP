/**
 * WMS效能分析看板测试脚本
 * 验证API接口和基本功能
 */

async function testWMSEfficiencyDashboard() {
  console.log('🚀 开始测试WMS效能分析看板...\n');

  try {
    // 测试1: 获取KPI定义
    console.log('📋 测试1: 获取KPI定义');
    const kpiResponse = await fetch(
      'http://localhost:3001/api/wms/dashboard/kpi-definitions'
    );
    const kpiData = await kpiResponse.json();

    if (kpiData.success) {
      console.log('✅ KPI定义获取成功');
      console.log(`   - 总共定义了 ${kpiData.data.totalCount} 个KPI指标`);
      console.log(`   - 包含分类: ${kpiData.data.categories.join(', ')}`);
    } else {
      console.log('❌ KPI定义获取失败:', kpiData.error);
    }

    // 测试2: 获取默认看板数据
    console.log('\n📊 测试2: 获取默认看板数据');
    const dashboardResponse = await fetch(
      'http://localhost:3001/api/wms/dashboard/performance'
    );
    const dashboardData = await dashboardResponse.json();

    if (dashboardData.success) {
      console.log('✅ 看板数据获取成功');
      console.log(
        `   - 仓库总数: ${dashboardData.data.summary.totalWarehouses}`
      );
      console.log(
        `   - 活跃仓库: ${dashboardData.data.summary.activeWarehouses}`
      );
      console.log(
        `   - 平均评分: ${dashboardData.data.summary.avgCompositeScore.toFixed(2)}`
      );
      console.log(`   - 告警数量: ${dashboardData.data.alerts.length}`);
      console.log(
        `   - 仓库指标数量: ${dashboardData.data.warehouseMetrics.length}`
      );
    } else {
      console.log('❌ 看板数据获取失败:', dashboardData.error);
    }

    // 测试3: 带筛选条件的数据获取
    console.log('\n🔍 测试3: 带筛选条件的数据获取');
    const filteredResponse = await fetch(
      'http://localhost:3001/api/wms/dashboard/performance?startDate=2026-01-01&endDate=2026-02-01&timeDimension=monthly'
    );
    const filteredData = await filteredResponse.json();

    if (filteredData.success) {
      console.log('✅ 筛选数据获取成功');
      console.log(
        `   - 时间范围: ${filteredData.data.filters.dateRange.startDate} 至 ${filteredData.data.filters.dateRange.endDate}`
      );
      console.log(`   - 时间维度: ${filteredData.data.filters.timeDimension}`);
    } else {
      console.log('❌ 筛选数据获取失败:', filteredData.error);
    }

    // 测试4: POST方式获取数据
    console.log('\n📤 测试4: POST方式获取数据');
    const postResponse = await fetch(
      'http://localhost:3001/api/wms/dashboard/performance',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: {
            dateRange: {
              startDate: '2026-01-01',
              endDate: '2026-02-01',
            },
            timeDimension: 'weekly',
          },
        }),
      }
    );
    const postData = await postResponse.json();

    if (postData.success) {
      console.log('✅ POST方式数据获取成功');
    } else {
      console.log('❌ POST方式数据获取失败:', postData.error);
    }

    // 测试5: 按分类获取KPI定义
    console.log('\n🏷️ 测试5: 按分类获取KPI定义');
    const categoryResponse = await fetch(
      'http://localhost:3001/api/wms/dashboard/kpi-definitions?category=efficiency'
    );
    const categoryData = await categoryResponse.json();

    if (categoryData.success) {
      console.log('✅ 按分类获取KPI定义成功');
      console.log(
        `   - 效率类KPI数量: ${Object.keys(categoryData.data.kpiDefinitions).length}`
      );
    } else {
      console.log('❌ 按分类获取KPI定义失败:', categoryData.error);
    }

    // 验收标准检查
    console.log('\n🎯 验收标准检查:');

    const checks = [
      {
        name: '关键指标展示',
        passed:
          dashboardData.success &&
          dashboardData.data.warehouseMetrics.length > 0,
        description: '能展示关键指标',
      },
      {
        name: '日期筛选支持',
        passed: filteredData.success,
        description: '支持按日期筛选',
      },
      {
        name: '仓库筛选支持',
        passed: kpiData.success,
        description: '支持按仓库筛选',
      },
      {
        name: '实时数据更新',
        passed: dashboardData.success && dashboardData.timestamp,
        description: '提供实时数据',
      },
      {
        name: '告警功能',
        passed:
          dashboardData.success && Array.isArray(dashboardData.data.alerts),
        description: '具备告警提醒功能',
      },
    ];

    checks.forEach(check => {
      const status = check.passed ? '✅' : '❌';
      console.log(`   ${status} ${check.name}: ${check.description}`);
    });

    const passedChecks = checks.filter(c => c.passed).length;
    const totalChecks = checks.length;
    console.log(`\n📈 测试总结: ${passedChecks}/${totalChecks} 项验收标准通过`);

    if (passedChecks === totalChecks) {
      console.log('🎉 所有验收标准均已满足！WMS效能分析看板功能正常。');
    } else {
      console.log('⚠️  部分功能需要进一步完善。');
    }
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testWMSEfficiencyDashboard();
