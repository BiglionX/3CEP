const { chromium } = require('playwright');

async function testForeignTradeNavigation() {
  console.log('🔍 开始进出口页面管理界面跳转功能检查...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const testResults = [];

  try {
    // 设置视口大小
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 1. 测试外贸公司主页跳转
    console.log('📋 测试 1: 外贸公司主页跳转功能...');
    await page.goto('http://localhost:3001/foreign-trade/company');
    await page.waitForLoadState('networkidle');

    // 检查页面基本元素
    const hasHeader = await page.isVisible('text=进口商业务中心');
    const hasStatsGrid = await page.isVisible(
      '.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4'
    );
    const statsCardCount = await page
      .locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 > div')
      .count();

    testResults.push({
      test: '外贸公司主页访问',
      status: hasHeader && hasStatsGrid ? '✅ 通过' : '❌ 失败',
      details: {
        页面标题显示: hasHeader,
        统计卡片网格: hasStatsGrid,
        统计卡片数量: statsCardCount,
      },
    });

    // 2. 测试统计卡片点击跳转
    console.log('\n📋 测试 2: 统计卡片点击跳转...');
    const statCards = await page
      .locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 > div')
      .all();
    const cardNavigationTests = [];

    for (let i = 0; i < Math.min(statCards.length, 4); i++) {
      const card = statCards[i];
      const cardText = await card.textContent();
      const cardTitle = await card
        .locator('.text-sm.font-medium')
        .textContent();

      // 点击卡片（如果有点击事件）
      try {
        await card.click();
        await page.waitForTimeout(500);

        const currentUrl = page.url();
        const navigated =
          currentUrl !== 'http://localhost:3001/foreign-trade/company';

        cardNavigationTests.push({
          卡片标题: cardTitle?.trim(),
          卡片内容预览: `${cardText?.substring(0, 30)}...`,
          点击后跳转: navigated,
          目标URL: currentUrl,
        });

        // 返回原页面
        if (navigated) {
          await page.goBack();
          await page.waitForLoadState('networkidle');
        }
      } catch (error) {
        cardNavigationTests.push({
          卡片标题: cardTitle?.trim(),
          卡片内容预览: `${cardText?.substring(0, 30)}...`,
          点击后跳转: false,
          错误信息: error.message,
        });
      }
    }

    testResults.push({
      test: '统计卡片跳转功能',
      status: cardNavigationTests.some(test => test.点击后跳转)
        ? '✅ 部分通过'
        : '⚠️ 未发现跳转',
      details: cardNavigationTests,
    });

    // 3. 测试主要按钮跳转
    console.log('\n📋 测试 3: 主要按钮跳转功能...');
    const buttons = await page.locator('button').all();
    const buttonTests = [];

    // 测试特定按钮
    const createOrderBtn = await page
      .locator('button:has-text("创建订单")')
      .first();
    const exportBtn = await page.locator('button:has-text("导出数据")').first();
    const viewDetailsBtn = await page
      .locator('button:has-text("查看详情")')
      .first();

    // 测试创建订单按钮
    if (await createOrderBtn.isVisible()) {
      const initialUrl = page.url();
      await createOrderBtn.click();
      await page.waitForTimeout(1000);

      const afterClickUrl = page.url();
      const navigated = afterClickUrl !== initialUrl;

      buttonTests.push({
        按钮名称: '创建订单',
        点击前URL: initialUrl,
        点击后URL: afterClickUrl,
        是否跳转: navigated,
      });

      if (navigated) {
        await page.goBack();
        await page.waitForLoadState('networkidle');
      }
    }

    // 测试导出按钮
    if (await exportBtn.isVisible()) {
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await exportBtn.click();
      await page.waitForTimeout(500);

      buttonTests.push({
        按钮名称: '导出数据',
        是否触发: consoleMessages.some(msg => msg.includes('导出')),
        控制台输出: consoleMessages.filter(msg => msg.includes('导出')),
      });
    }

    testResults.push({
      test: '主要按钮功能',
      status: buttonTests.length > 0 ? '✅ 已测试' : '⚠️ 未找到目标按钮',
      details: buttonTests,
    });

    // 4. 测试订单详情跳转
    console.log('\n📋 测试 4: 订单详情跳转...');
    const orderItems = await page
      .locator('.border.border-gray-200.rounded-lg.p-4.cursor-pointer')
      .all();
    const orderDetailTests = [];

    if (orderItems.length > 0) {
      const firstOrder = orderItems[0];
      const orderText = await firstOrder.textContent();

      const initialUrl = page.url();
      await firstOrder.click();
      await page.waitForTimeout(1000);

      const afterClickUrl = page.url();
      const navigated =
        afterClickUrl.includes('/order/') && afterClickUrl !== initialUrl;

      orderDetailTests.push({
        订单信息: `${orderText?.substring(0, 50)}...`,
        点击前URL: initialUrl,
        点击后URL: afterClickUrl,
        成功跳转: navigated,
      });

      if (navigated) {
        await page.goBack();
        await page.waitForLoadState('networkidle');
      }
    }

    testResults.push({
      test: '订单详情跳转',
      status:
        orderDetailTests.length > 0
          ? orderDetailTests[0].成功跳转
            ? '✅ 通过'
            : '❌ 失败'
          : '⚠️ 未找到可点击的订单项',
      details: orderDetailTests,
    });

    // 5. 测试标签页切换
    console.log('\n📋 测试 5: 标签页切换功能...');
    const tabs = await page.locator('[role="tab"]').all();
    const tabTests = [];

    if (tabs.length > 0) {
      for (let i = 0; i < Math.min(tabs.length, 3); i++) {
        const tab = tabs[i];
        const tabText = await tab.textContent();

        try {
          await tab.click();
          await page.waitForTimeout(300);

          const isSelected =
            (await tab.getAttribute('data-state')) === 'active';

          tabTests.push({
            标签页: tabText?.trim(),
            是否选中: isSelected,
          });
        } catch (error) {
          tabTests.push({
            标签页: tabText?.trim(),
            错误: error.message,
          });
        }
      }
    }

    testResults.push({
      test: '标签页切换',
      status: tabTests.length > 0 ? '✅ 已测试' : '⚠️ 未找到标签页',
      details: tabTests,
    });

    // 6. 测试筛选功能
    console.log('\n📋 测试 6: 筛选功能...');
    const filterInputs = await page.locator('input[type="text"]').all();
    const selectDropdowns = await page.locator('select').all();
    const filterTests = [];

    // 测试搜索框
    if (filterInputs.length > 0) {
      const searchInput = filterInputs[0];
      await searchInput.fill('测试搜索');
      const inputValue = await searchInput.inputValue();

      filterTests.push({
        控件类型: '搜索输入框',
        输入值: inputValue,
        功能正常: inputValue === '测试搜索',
      });
    }

    // 测试下拉筛选
    if (selectDropdowns.length > 0) {
      const firstSelect = selectDropdowns[0];
      const options = await firstSelect.locator('option').all();

      filterTests.push({
        控件类型: '下拉筛选',
        可选项数量: options.length,
        功能可用: options.length > 0,
      });
    }

    testResults.push({
      test: '筛选功能',
      status: filterTests.length > 0 ? '✅ 已测试' : '⚠️ 未找到筛选控件',
      details: filterTests,
    });

    // 输出最终测试报告
    console.log('\n📊 === 进出口页面跳转功能测试报告 ===');
    console.log('测试时间:', new Date().toLocaleString('zh-CN'));
    console.log('测试URL: http://localhost:3001/foreign-trade/company\n');

    testResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.test}: ${result.status}`);
      if (Array.isArray(result.details)) {
        result.details.forEach((detail, detailIndex) => {
          console.log(`   ${detailIndex + 1})`, detail);
        });
      } else {
        Object.entries(result.details).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      }
      console.log('');
    });

    // 总体评估
    const passedTests = testResults.filter(r => r.status.includes('✅')).length;
    const totalTests = testResults.length;
    const passRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log(`📈 测试总结:`);
    console.log(`   通过测试: ${passedTests}/${totalTests} (${passRate}%)`);

    if (passRate >= 80) {
      console.log('   🎉 整体跳转功能良好！');
    } else if (passRate >= 60) {
      console.log('   ⚠️ 部分跳转功能需要优化');
    } else {
      console.log('   ❌ 跳转功能存在较多问题');
    }

    // 截图保存
    await page.screenshot({
      path: 'test-results/foreign-trade-navigation-test.png',
      fullPage: true,
    });
    console.log(
      '\n📸 测试截图已保存: test-results/foreign-trade-navigation-test.png'
    );
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    testResults.push({
      test: '测试执行',
      status: '❌ 错误',
      details: { 错误信息: error.message },
    });
  } finally {
    await browser.close();
  }

  return testResults;
}

// 执行测试
testForeignTradeNavigation()
  .then(results => {
    console.log('\n🏁 进出口页面跳转功能检查完成！');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 测试执行失败:', error);
    process.exit(1);
  });
