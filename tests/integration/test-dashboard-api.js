const fs = require('fs');

// 测试运营数据看板API
async function testDashboardAPI() {
  console.log('🚀 开始测试运营数据看板API...\n');

  try {
    // 测试统计数据API
    console.log('📊 测试统计数据API...');
    const statsResponse = await fetch(
      'http://localhost:3001/api/admin/dashboard/stats'
    );
    const statsData = await statsResponse.json();

    console.log('✅ 统计数据API响应:');
    console.log(JSON.stringify(statsData, null, 2));

    // 测试CSV导出API
    console.log('\n📥 测试CSV导出API...');
    const exportResponse = await fetch(
      'http://localhost:3001/api/admin/dashboard/export?type=daily_report'
    );

    if (exportResponse.ok) {
      console.log('✅ CSV导出API成功响应');
      const csvData = await exportResponse.text();
      console.log('📋 CSV数据预览 (前200字符):');
      console.log(`${csvData.substring(0, 200)}...`);

      // 保存测试CSV文件
      fs.writeFileSync('test-dashboard-report.csv', csvData, 'utf8');
      console.log('💾 测试报告已保存到: test-dashboard-report.csv');
    } else {
      console.log('❌ CSV导出API失败:', exportResponse.status);
    }

    console.log('\n🎉 运营数据看板API测试完成！');
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

// 运行测试
if (require.main === module) {
  testDashboardAPI();
}

module.exports = { testDashboardAPI };
