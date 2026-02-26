const { chromium } = require('playwright');

async function verifyFixes() {
  console.log('🔧 验证进出口页面跳转功能修复...\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage();
  
  try {
    console.log('📋 1. 访问修复后的外贸公司主页...');
    await page.goto('http://localhost:3001/foreign-trade/company');
    await page.waitForLoadState('networkidle');
    
    // 检查页面基本功能
    const title = await page.title();
    console.log('📄 页面标题:', title);
    
    const hasImportCenter = await page.isVisible('text=进口商业务中心');
    const hasExportCenter = await page.isVisible('text=出口商业务中心');
    console.log('✅ 进口商业务中心显示:', hasImportCenter);
    console.log('✅ 出口商业务中心显示:', hasExportCenter);
    
    // 检查统计卡片
    console.log('\n📊 2. 验证统计卡片跳转功能...');
    const statCards = await page.$$('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 > div');
    console.log(`找到 ${statCards.length} 个统计卡片`);
    
    // 测试第一个统计卡片点击
    if (statCards.length > 0) {
      const firstCard = statCards[0];
      const cardText = await firstCard.textContent();
      console.log('📄 第一个卡片内容:', cardText?.substring(0, 30) + '...');
      
      const initialUrl = page.url();
      await firstCard.click();
      await page.waitForTimeout(1500);
      
      const afterClickUrl = page.url();
      const navigated = afterClickUrl.includes('/orders') && afterClickUrl !== initialUrl;
      
      console.log('🔄 统计卡片跳转测试:');
      console.log('  点击前URL:', initialUrl);
      console.log('  点击后URL:', afterClickUrl);
      console.log('  跳转成功:', navigated);
      
      if (navigated) {
        await page.goBack();
        await page.waitForLoadState('networkidle');
      }
    }
    
    // 测试订单详情跳转
    console.log('\n📋 3. 验证订单详情跳转功能...');
    const orderItems = await page.$$('.border.border-gray-200.rounded-lg.p-4.cursor-pointer');
    console.log(`找到 ${orderItems.length} 个订单项`);
    
    if (orderItems.length > 0) {
      const firstOrder = orderItems[0];
      const orderText = await firstOrder.textContent();
      console.log('📄 第一个订单预览:', orderText?.substring(0, 50) + '...');
      
      const initialUrl = page.url();
      await firstOrder.click();
      await page.waitForTimeout(2000);
      
      const afterClickUrl = page.url();
      const navigated = afterClickUrl.includes('/order/') && afterClickUrl !== initialUrl;
      
      console.log('🔄 订单详情跳转测试:');
      console.log('  点击前URL:', initialUrl);
      console.log('  点击后URL:', afterClickUrl);
      console.log('  跳转成功:', navigated);
      
      if (navigated) {
        await page.goBack();
        await page.waitForLoadState('networkidle');
      }
    }
    
    // 测试创建订单按钮
    console.log('\n📋 4. 验证创建订单按钮跳转...');
    const createOrderBtn = await page.$('button:has-text("创建采购订单"), button:has-text("创建销售订单")');
    
    if (createOrderBtn) {
      const btnText = await createOrderBtn.textContent();
      console.log('📄 按钮文本:', btnText?.trim());
      
      const initialUrl = page.url();
      await createOrderBtn.click();
      await page.waitForTimeout(2000);
      
      const afterClickUrl = page.url();
      const navigated = afterClickUrl.includes('/orders/create') && afterClickUrl !== initialUrl;
      
      console.log('🔄 创建订单按钮测试:');
      console.log('  点击前URL:', initialUrl);
      console.log('  点击后URL:', afterClickUrl);
      console.log('  跳转成功:', navigated);
      
      if (navigated) {
        await page.goBack();
        await page.waitForLoadState('networkidle');
      }
    }
    
    // 测试新创建的页面
    console.log('\n📋 5. 验证新增页面访问...');
    
    // 测试分析页面
    console.log('  测试业务分析页面...');
    await page.goto('http://localhost:3001/foreign-trade/company/analytics');
    await page.waitForLoadState('networkidle');
    const hasAnalyticsTitle = await page.isVisible('text=业务分析');
    console.log('  ✅ 业务分析页面访问:', hasAnalyticsTitle);
    
    // 测试审批页面
    console.log('  测试审批管理页面...');
    await page.goto('http://localhost:3001/foreign-trade/company/approvals');
    await page.waitForLoadState('networkidle');
    const hasApprovalsTitle = await page.isVisible('text=审批管理');
    console.log('  ✅ 审批管理页面访问:', hasApprovalsTitle);
    
    // 返回主页进行综合测试
    console.log('\n📋 6. 综合功能测试...');
    await page.goto('http://localhost:3001/foreign-trade/company');
    await page.waitForLoadState('networkidle');
    
    // 测试角色切换
    const roleSwitchBtn = await page.$('button:has-text("出口商")');
    if (roleSwitchBtn) {
      const initialTitle = await page.textContent('h1');
      await roleSwitchBtn.click();
      await page.waitForTimeout(1000);
      const afterSwitchTitle = await page.textContent('h1');
      
      console.log('🔄 角色切换测试:');
      console.log('  切换前标题:', initialTitle?.trim());
      console.log('  切换后标题:', afterSwitchTitle?.trim());
      console.log('  切换成功:', initialTitle !== afterSwitchTitle);
    }
    
    // 截图保存
    await page.screenshot({ 
      path: 'test-results/fixes-verification.png', 
      fullPage: true 
    });
    console.log('\n📸 验证截图已保存: test-results/fixes-verification.png');
    
    console.log('\n✅ 修复验证完成！');
    
  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error);
  } finally {
    await browser.close();
  }
}

verifyFixes()
  .then(() => {
    console.log('\n🏁 验证任务完成！');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 验证失败:', error);
    process.exit(1);
  });