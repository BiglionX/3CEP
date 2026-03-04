const { chromium } = require('playwright');

async function simpleForeignTradeCheck() {
  console.log('🔍 简化版进出口页面功能检查...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 访问外贸公司主页
    console.log('📋 访问外贸公司主页...');
    await page.goto('http://localhost:3001/foreign-trade/company');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // 检查页面标题
    const title = await page.title();
    console.log('📄 页面标题:', title);

    // 检查是否存在关键元素
    const hasImportHeader = await page.isVisible('text=进口商业务中心', {
      timeout: 3000,
    });
    const hasExportHeader = await page.isVisible('text=出口商业务中心', {
      timeout: 3000,
    });
    const hasStatsCards = await page.isVisible('.grid', { timeout: 3000 });

    console.log('✅ 进口商业务中心显示:', hasImportHeader);
    console.log('✅ 出口商业务中心显示:', hasExportHeader);
    console.log('✅ 统计卡片网格显示:', hasStatsCards);

    // 检查按钮
    console.log('\n📋 检查页面按钮...');
    const buttons = await page.$$('button');
    console.log(`🔍 找到 ${buttons.length} 个按钮`);

    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const buttonText = await buttons[i].textContent();
      const buttonClass = await buttons[i].getAttribute('class');
      console.log(
        `  ${i + 1}. ${buttonText?.trim()} (${buttonClass?.includes('outline') ? '轮廓' : '实心'})`
      );
    }

    // 检查可点击元素
    console.log('\n📋 检查可点击元素...');
    const clickableElements = await page.$$('.cursor-pointer');
    console.log(`🔍 找到 ${clickableElements.length} 个可点击元素`);

    // 尝试点击第一个统计卡片
    console.log('\n📋 测试统计卡片点击...');
    const statCards = await page.$$('.grid > div');
    if (statCards.length > 0) {
      console.log(`📊 找到 ${statCards.length} 个统计卡片`);

      // 获取第一个卡片的信息
      const firstCardText = await statCards[0].textContent();
      console.log(
        '📄 第一个卡片内容:',
        `${firstCardText?.substring(0, 50)}...`
      );

      // 尝试点击
      try {
        const initialUrl = page.url();
        await statCards[0].click();
        await page.waitForTimeout(1000);
        const newUrl = page.url();

        console.log('🔄 点击前后URL对比:');
        console.log('  点击前:', initialUrl);
        console.log('  点击后:', newUrl);
        console.log('  是否跳转:', newUrl !== initialUrl);

        // 如果跳转了，返回原页面
        if (newUrl !== initialUrl) {
          await page.goBack();
          await page.waitForLoadState('networkidle');
        }
      } catch (error) {
        console.log('❌ 点击统计卡片时出错:', error.message);
      }
    }

    // 测试创建订单按钮
    console.log('\n📋 测试创建订单按钮...');
    const createOrderButtons = await page.$$('button:has-text("创建")');
    console.log(`🔍 找到 ${createOrderButtons.length} 个包含"创建"的按钮`);

    if (createOrderButtons.length > 0) {
      const firstCreateBtn = createOrderButtons[0];
      const btnText = await firstCreateBtn.textContent();
      console.log('📄 按钮文本:', btnText?.trim());

      try {
        const initialUrl = page.url();
        await firstCreateBtn.click();
        await page.waitForTimeout(1500);
        const newUrl = page.url();

        console.log('🔄 点击创建订单按钮:');
        console.log('  点击前:', initialUrl);
        console.log('  点击后:', newUrl);
        console.log(
          '  是否跳转:',
          newUrl !== initialUrl && newUrl.includes('create')
        );
      } catch (error) {
        console.log('❌ 点击创建订单按钮时出错:', error.message);
      }
    }

    // 测试订单详情跳转
    console.log('\n📋 测试订单详情跳转...');
    const orderItems = await page.$$('.border.border-gray-200.rounded-lg.p-4');
    console.log(`🔍 找到 ${orderItems.length} 个订单项`);

    if (orderItems.length > 0) {
      const firstOrder = orderItems[0];
      const orderText = await firstOrder.textContent();
      console.log('📄 第一个订单预览:', `${orderText?.substring(0, 80)}...`);

      // 检查是否有cursor-pointer类
      const hasPointer = await firstOrder.evaluate(el =>
        el.classList.contains('cursor-pointer')
      );
      console.log('🖱️ 是否可点击:', hasPointer);

      if (hasPointer) {
        try {
          const initialUrl = page.url();
          await firstOrder.click();
          await page.waitForTimeout(1500);
          const newUrl = page.url();

          console.log('🔄 点击订单详情:');
          console.log('  点击前:', initialUrl);
          console.log('  点击后:', newUrl);
          console.log('  是否跳转到订单详情:', newUrl.includes('/order/'));

          // 返回
          if (newUrl !== initialUrl) {
            await page.goBack();
            await page.waitForLoadState('networkidle');
          }
        } catch (error) {
          console.log('❌ 点击订单详情时出错:', error.message);
        }
      }
    }

    // 截图保存
    await page.screenshot({
      path: 'test-results/simple-foreign-trade-check.png',
      fullPage: true,
    });
    console.log(
      '\n📸 页面截图已保存: test-results/simple-foreign-trade-check.png'
    );

    console.log('\n✅ 简化版检查完成！');
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  } finally {
    await browser.close();
  }
}

// 执行检查
simpleForeignTradeCheck()
  .then(() => {
    console.log('\n🏁 检查任务完成！');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 检查失败:', error);
    process.exit(1);
  });
