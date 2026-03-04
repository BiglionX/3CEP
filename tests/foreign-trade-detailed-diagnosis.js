const { chromium } = require('playwright');

async function detailedDiagnosis() {
  console.log('🔍 进出口页面详细诊断...\n');

  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();

  // 监听控制台消息和网络请求
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('🔴 控制台错误:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('💥 页面错误:', error.message);
  });

  try {
    console.log('📋 1. 访问外贸公司主页...');
    await page.goto('http://localhost:3001/foreign-trade/company');
    await page.waitForLoadState('networkidle');

    // 检查页面结构
    console.log('\n📋 2. 分析页面结构...');

    // 检查统计卡片
    const statCards = await page.$$(
      '.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 > div'
    );
    console.log(`📊 统计卡片数量: ${statCards.length}`);

    for (let i = 0; i < statCards.length; i++) {
      const card = statCards[i];
      const text = await card.textContent();
      const hasClickHandler = await card.evaluate(
        el => !!el.onclick || el.classList.contains('cursor-pointer')
      );
      console.log(
        `  卡片 ${i + 1}: ${text?.substring(0, 30)}... | 可点击: ${hasClickHandler}`
      );
    }

    // 检查按钮
    console.log('\n📋 3. 分析按钮功能...');
    const buttons = await page.$$('button');
    console.log(`按钮总数: ${buttons.length}`);

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const onclick = await button.evaluate(
        el => el.onclick?.toString() || '无'
      );
      const className = await button.getAttribute('class');

      console.log(`  按钮 ${i + 1}: "${text?.trim()}"`);
      console.log(`    类名: ${className?.substring(0, 50)}...`);
      console.log(
        `    点击事件: ${onclick.includes('router.push') ? '有路由跳转' : '无路由跳转'}`
      );
    }

    // 检查订单项
    console.log('\n📋 4. 分析订单项...');
    const orderItems = await page.$$(
      '.border.border-gray-200.rounded-lg.p-4.cursor-pointer'
    );
    console.log(`订单项数量: ${orderItems.length}`);

    for (let i = 0; i < Math.min(orderItems.length, 2); i++) {
      const order = orderItems[i];
      const text = await order.textContent();
      const onclick = await order.evaluate(
        el => el.onclick?.toString() || '无'
      );

      console.log(`  订单 ${i + 1}: ${text?.substring(0, 50)}...`);
      console.log(`    点击事件: ${onclick}`);
    }

    // 手动测试跳转
    console.log('\n📋 5. 手动测试跳转功能...');

    // 测试角色切换
    console.log('🔄 测试角色切换...');
    const importerBtn = await page.$('button:has-text("进口商")');
    const exporterBtn = await page.$('button:has-text("出口商")');

    if (importerBtn && exporterBtn) {
      const initialText = await page.textContent('h1');
      console.log('初始标题:', initialText);

      await exporterBtn.click();
      await page.waitForTimeout(1000);
      const afterSwitchText = await page.textContent('h1');
      console.log('切换后标题:', afterSwitchText);
      console.log('角色切换成功:', afterSwitchText !== initialText);
    }

    // 测试订单详情跳转
    console.log('\n🔄 测试订单详情跳转...');
    if (orderItems.length > 0) {
      const firstOrder = orderItems[0];
      const initialUrl = page.url();

      console.log('点击前URL:', initialUrl);
      await firstOrder.click();
      await page.waitForTimeout(2000);

      const afterClickUrl = page.url();
      console.log('点击后URL:', afterClickUrl);
      console.log(
        '跳转成功:',
        afterClickUrl.includes('/order/') && afterClickUrl !== initialUrl
      );

      // 如果跳转成功，返回
      if (afterClickUrl !== initialUrl) {
        await page.goBack();
        await page.waitForLoadState('networkidle');
      }
    }

    // 测试创建订单按钮
    console.log('\n🔄 测试创建订单按钮...');
    const createBtn = await page.$('button:has-text("创建采购订单")');
    if (createBtn) {
      const initialUrl = page.url();
      console.log('点击前URL:', initialUrl);

      await createBtn.click();
      await page.waitForTimeout(2000);

      const afterClickUrl = page.url();
      console.log('点击后URL:', afterClickUrl);
      console.log(
        '跳转成功:',
        afterClickUrl.includes('create') && afterClickUrl !== initialUrl
      );

      if (afterClickUrl !== initialUrl) {
        await page.goBack();
        await page.waitForLoadState('networkidle');
      }
    }

    // 检查网络请求
    console.log('\n📋 6. 网络请求分析...');
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('foreign-trade')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          ok: response.ok(),
        });
      }
    });

    // 触发一些交互来捕获请求
    if (statCards.length > 0) {
      await statCards[0].click();
      await page.waitForTimeout(1000);
    }

    console.log('相关网络响应:');
    responses.forEach((resp, index) => {
      console.log(`  ${index + 1}. ${resp.status} ${resp.url}`);
    });

    // 最终状态检查
    console.log('\n📋 7. 最终状态检查...');
    const finalUrl = page.url();
    const finalTitle = await page.title();
    console.log('最终URL:', finalUrl);
    console.log('最终标题:', finalTitle);

    // 截图
    await page.screenshot({
      path: 'test-results/detailed-diagnosis.png',
      fullPage: true,
    });
    console.log('\n📸 诊断截图已保存: test-results/detailed-diagnosis.png');
  } catch (error) {
    console.error('❌ 诊断过程中发生错误:', error);
  } finally {
    await browser.close();
  }
}

detailedDiagnosis()
  .then(() => {
    console.log('\n🏁 详细诊断完成！');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 诊断失败:', error);
    process.exit(1);
  });
