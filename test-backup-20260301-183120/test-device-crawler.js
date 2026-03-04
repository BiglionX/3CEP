#!/usr/bin/env node

/**
 * 设备型号爬虫测试脚本
 * 验证智能爬虫系统的功能
 */

const {
  SmartDeviceCrawler,
} = require('../dist/lib/data-augmentation/smart-crawler');

async function testDeviceCrawler() {
  console.log('🚀 开始测试设备型号智能爬虫系统\n');

  const crawler = new SmartDeviceCrawler();

  try {
    // 测试爬虫状态
    const status = crawler.getStatus();
    console.log('📊 爬虫初始状态:');
    console.log(`   - 是否运行中: ${status.isRunning}`);
    console.log(`   - 用户代理数量: ${status.userAgentCount}\n`);

    // 测试单个品牌爬取
    console.log('📱 开始爬取Apple设备型号...');
    const appleDevices = await crawler.crawlDeviceModels('Apple', 2);
    console.log(
      `✅ Apple设备爬取完成，获得 ${appleDevices.length} 个设备型号\n`
    );

    // 显示部分结果
    if (appleDevices.length > 0) {
      console.log('📋 部分设备型号示例:');
      appleDevices.slice(0, 5).forEach((device, index) => {
        console.log(
          `   ${index + 1}. ${device.brand} ${device.model} (${device.category})`
        );
      });
      console.log('');
    }

    // 测试批量爬取
    console.log('🔄 开始批量爬取多个品牌...');
    const brands = ['华为', '小米', 'OPPO'];
    const allDevices = await crawler.crawlMultipleBrands(brands, 1);
    console.log(`✅ 批量爬取完成，总共获得 ${allDevices.length} 个设备型号\n`);

    // 统计结果
    const brandStats = {};
    allDevices.forEach(device => {
      brandStats[device.brand] = (brandStats[device.brand] || 0) + 1;
    });

    console.log('📈 品牌数据统计:');
    Object.entries(brandStats).forEach(([brand, count]) => {
      console.log(`   ${brand}: ${count} 个设备`);
    });

    console.log('\n🎉 设备型号爬虫测试完成！');
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    console.error('详细错误:', error);
  } finally {
    // 关闭爬虫
    await crawler.close();
    console.log('\n🔒 爬虫已关闭');
  }
}

// 执行测试
if (require.main === module) {
  testDeviceCrawler().catch(console.error);
}

module.exports = { testDeviceCrawler };
