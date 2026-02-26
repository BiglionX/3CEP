const { chromium } = require('playwright');

async function quickVerify() {
  console.log('⚡ 快速验证修复效果...\n');
  
  const browser = await chromium.launch({ headless: true }); // 使用无头模式加快速度
  const page = await browser.newPage();
  
  try {
    // 设置较短的超时时间
    page.setDefaultTimeout(10000);
    
    console.log('1️⃣ 测试主页访问...');
    await page.goto('http://localhost:3001/foreign-trade/company');
    const title = await page.title();
    console.log('✅ 主页访问成功:', title.includes('FixCycle') ? '✓' : '✗');
    
    console.log('2️⃣ 测试分析页面...');
    await page.goto('http://localhost:3001/foreign-trade/company/analytics');
    const hasAnalytics = await page.isVisible('text=业务分析', { timeout: 3000 });
    console.log('✅ 分析页面访问:', hasAnalytics ? '✓' : '✗');
    
    console.log('3️⃣ 测试审批页面...');
    await page.goto('http://localhost:3001/foreign-trade/company/approvals');
    const hasApprovals = await page.isVisible('text=审批管理', { timeout: 3000 });
    console.log('✅ 审批页面访问:', hasApprovals ? '✓' : '✗');
    
    console.log('4️⃣ 测试订单详情页面...');
    await page.goto('http://localhost:3001/foreign-trade/company/order/PO-2026-001');
    const hasOrderDetail = await page.isVisible('text=PO-2026-001', { timeout: 3000 });
    console.log('✅ 订单详情页面访问:', hasOrderDetail ? '✓' : '✗');
    
    console.log('5️⃣ 测试创建订单页面...');
    await page.goto('http://localhost:3001/foreign-trade/company/orders/create');
    const hasCreateOrder = await page.isVisible('text=创建', { timeout: 3000 });
    console.log('✅ 创建订单页面访问:', hasCreateOrder ? '✓' : '✗');
    
    console.log('\n🎉 快速验证完成！');
    console.log('\n📊 验证结果汇总:');
    console.log(`   • 主页访问: ${title.includes('FixCycle') ? '✅' : '❌'}`);
    console.log(`   • 业务分析页面: ${hasAnalytics ? '✅' : '❌'}`);
    console.log(`   • 审批管理页面: ${hasApprovals ? '✅' : '❌'}`);
    console.log(`   • 订单详情页面: ${hasOrderDetail ? '✅' : '❌'}`);
    console.log(`   • 创建订单页面: ${hasCreateOrder ? '✅' : '❌'}`);
    
    const successCount = [title.includes('FixCycle'), hasAnalytics, hasApprovals, hasOrderDetail, hasCreateOrder]
      .filter(Boolean).length;
    const totalCount = 5;
    const successRate = ((successCount / totalCount) * 100).toFixed(1);
    
    console.log(`\n📈 总体成功率: ${successCount}/${totalCount} (${successRate}%)`);
    
    if (successRate >= 80) {
      console.log('🏆 修复效果良好！');
    } else if (successRate >= 60) {
      console.log('⚠️ 部分功能需要进一步检查');
    } else {
      console.log('❌ 修复存在问题，需要重新检查');
    }
    
  } catch (error) {
    console.error('❌ 验证过程出错:', error.message);
  } finally {
    await browser.close();
  }
}

quickVerify()
  .then(() => {
    console.log('\n🏁 验证结束');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 验证失败:', error);
    process.exit(1);
  });