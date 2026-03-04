const puppeteer = require('puppeteer');
const fs = require('fs');

async function runMobileBacktest() {
  console.log('🚀 开始DC015移动端适配回测验证...\n');

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    args: ['--window-size=1920,1080'],
  });

  const page = await browser.newPage();
  const results = {
    timestamp: new Date().toISOString(),
    modules: {},
    summary: {},
  };

  try {
    // 设置视口大小用于不同设备测试
    const viewports = {
      desktop: { width: 1920, height: 1080 },
      tablet: { width: 768, height: 1024 },
      mobile: { width: 375, height: 667 },
      small_mobile: { width: 320, height: 568 },
    };

    // 测试1: 不同设备尺寸下的布局适应性
    console.log('🧪 测试1: 响应式布局适配性验证');
    results.modules.layoutAdaptation = { status: 'pending', tests: [] };

    for (const [device, viewport] of Object.entries(viewports)) {
      await page.setViewport(viewport);
      await page.goto('http://localhost:3001/data-center', {
        waitUntil: 'networkidle0',
      });

      // 等待页面加载完成
      await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});

      const layoutTest = await page.evaluate(deviceName => {
        const body = document.body;
        const computedStyle = window.getComputedStyle(body);

        // 检查关键响应式元素
        const sidebar = document.querySelector('[class*="sidebar"]');
        const header = document.querySelector('header');
        const cards = document.querySelectorAll('[class*="card"]');
        const buttons = document.querySelectorAll('button');

        // 检查布局属性
        const layoutChecks = {
          hasResponsiveClasses:
            !!document.querySelector('[class*="sm:"]') ||
            !!document.querySelector('[class*="md:"]') ||
            !!document.querySelector('[class*="lg:"]'),
          hasMobileClasses:
            !!document.querySelector('[class*="xs:"]') ||
            !!document.querySelector('[class*="mobile-"]'),
          sidebarExists: !!sidebar,
          headerExists: !!header,
          hasCards: cards.length > 0,
          hasButtons: buttons.length > 0,
          overflowHandling: computedStyle.overflowX !== 'visible',
        };

        return {
          device: deviceName,
          layoutChecks,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
        };
      }, device);

      const passedChecks = Object.values(layoutTest.layoutChecks).filter(
        Boolean
      ).length;
      const totalChecks = Object.keys(layoutTest.layoutChecks).length;
      const passRate = Math.round((passedChecks / totalChecks) * 100);

      results.modules.layoutAdaptation.tests.push({
        name: `${device}设备适配`,
        status: passRate >= 80 ? 'passed' : 'failed',
        details: `通过率: ${passRate}% (${passedChecks}/${totalChecks}) - 视口: ${layoutTest.viewportWidth}x${layoutTest.viewportHeight}`,
        data: layoutTest,
      });

      // 截图保存
      await page.screenshot({
        path: `test-results/mobile-${device}-layout.png`,
        fullPage: true,
      });
    }

    results.modules.layoutAdaptation.status = 'complete';
    console.log('   ✅ 布局适配测试完成\n');

    // 测试2: 触摸交互和点击区域
    console.log('🧪 测试2: 触摸交互友好性验证');
    results.modules.touchInteraction = { status: 'pending', tests: [] };

    await page.setViewport(viewports.mobile);
    await page.goto('http://localhost:3001/data-center', {
      waitUntil: 'networkidle0',
    });

    const touchTests = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const interactiveElements = Array.from(
        document.querySelectorAll('a, button, input, select')
      );

      // 检查触摸友好的最小尺寸
      const touchFriendlyElements = interactiveElements.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width >= 44 && rect.height >= 44;
      });

      // 检查是否有适当的间距
      const elementsWithSpacing = interactiveElements.filter(el => {
        const style = window.getComputedStyle(el);
        const margin = parseFloat(style.margin) || 0;
        const padding = parseFloat(style.padding) || 0;
        return margin >= 8 || padding >= 8;
      });

      return {
        totalInteractiveElements: interactiveElements.length,
        touchFriendlyCount: touchFriendlyElements.length,
        spacingCompliantCount: elementsWithSpacing.length,
        touchFriendlyRatio:
          interactiveElements.length > 0
            ? Math.round(
                (touchFriendlyElements.length / interactiveElements.length) *
                  100
              )
            : 0,
        spacingCompliantRatio:
          interactiveElements.length > 0
            ? Math.round(
                (elementsWithSpacing.length / interactiveElements.length) * 100
              )
            : 0,
      };
    });

    results.modules.touchInteraction.tests.push({
      name: '触摸交互测试',
      status: touchTests.touchFriendlyRatio >= 80 ? 'passed' : 'failed',
      details: `触摸友好元素: ${touchTests.touchFriendlyCount}/${touchTests.totalInteractiveElements} (${touchTests.touchFriendlyRatio}%)`,
      data: touchTests,
    });

    results.modules.touchInteraction.status = 'complete';
    console.log('   ✅ 触摸交互测试完成\n');

    // 测试3: 内容可读性和信息层次
    console.log('🧪 测试3: 内容可读性验证');
    results.modules.contentReadability = { status: 'pending', tests: [] };

    const readabilityTests = await page.evaluate(() => {
      // 检查字体大小
      const texts = Array.from(
        document.querySelectorAll(
          'p, h1, h2, h3, h4, div:not(.icon), span:not(.icon)'
        )
      );
      const fontSizeChecks = texts.map(el => {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        return {
          element: el.tagName.toLowerCase(),
          fontSize: fontSize,
          isReadable: fontSize >= 12, // 最小可读字体大小
        };
      });

      const readableTexts = fontSizeChecks.filter(check => check.isReadable);
      const readabilityRatio =
        texts.length > 0
          ? Math.round((readableTexts.length / texts.length) * 100)
          : 0;

      // 检查文本截断处理
      const truncatedElements = Array.from(
        document.querySelectorAll('[class*="truncate"], [class*="line-clamp"]')
      );

      return {
        totalTextElements: texts.length,
        readableTexts: readableTexts.length,
        readabilityRatio,
        truncatedElements: truncatedElements.length,
        fontSizeDistribution: fontSizeChecks.map(check => check.fontSize),
      };
    });

    results.modules.contentReadability.tests.push({
      name: '内容可读性测试',
      status: readabilityTests.readabilityRatio >= 90 ? 'passed' : 'failed',
      details: `可读文本: ${readabilityTests.readableTexts}/${readabilityTests.totalTextElements} (${readabilityTests.readabilityRatio}%)`,
      data: readabilityTests,
    });

    results.modules.contentReadability.status = 'complete';
    console.log('   ✅ 内容可读性测试完成\n');

    // 测试4: 导航和菜单适配
    console.log('🧪 测试4: 移动端导航验证');
    results.modules.navigation = { status: 'pending', tests: [] };

    // 测试汉堡菜单功能
    const hamburgerMenuTest = await page.evaluate(async () => {
      const menuButton = document.querySelector('[class*="lg:hidden"]');
      const sidebar = document.querySelector('[class*="sidebar"]');

      if (!menuButton || !sidebar) {
        return { hasMenuFunctionality: false, details: '缺少菜单组件' };
      }

      // 检查初始状态
      const initialState = {
        menuVisible: window.getComputedStyle(menuButton).display !== 'none',
        sidebarTransform: window.getComputedStyle(sidebar).transform,
      };

      // 模拟点击菜单按钮
      menuButton.click();
      await new Promise(resolve => setTimeout(resolve, 500));

      const afterClickState = {
        sidebarTransform: window.getComputedStyle(sidebar).transform,
      };

      // 关闭菜单
      const closeButton = document.querySelector(
        '[class*="lg:hidden"] ~ button, [onclick*="sidebar"]'
      );
      if (closeButton) {
        closeButton.click();
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      return {
        hasMenuFunctionality: true,
        initialState,
        afterClickState,
        menuToggleWorks:
          initialState.sidebarTransform !== afterClickState.sidebarTransform,
      };
    });

    results.modules.navigation.tests.push({
      name: '汉堡菜单功能',
      status: hamburgerMenuTest.menuToggleWorks ? 'passed' : 'failed',
      details: hamburgerMenuTest.hasMenuFunctionality
        ? `菜单切换: ${hamburgerMenuTest.menuToggleWorks ? '正常' : '异常'}`
        : hamburgerMenuTest.details,
      data: hamburgerMenuTest,
    });

    results.modules.navigation.status = 'complete';
    console.log('   ✅ 导航功能测试完成\n');

    // 测试5: 查询页面移动端适配
    console.log('🧪 测试5: 查询页面移动端适配验证');
    results.modules.queryPage = { status: 'pending', tests: [] };

    await page.goto('http://localhost:3001/data-center/query', {
      waitUntil: 'networkidle0',
    });
    await page.setViewport(viewports.mobile);

    const queryPageTests = await page.evaluate(() => {
      // 检查标签页适配
      const tabs = document.querySelector('[class*="TabsList"]');
      const tabTriggers = Array.from(document.querySelectorAll('[role="tab"]'));

      // 检查表单元素适配
      const inputs = Array.from(
        document.querySelectorAll('input, textarea, select')
      );
      const properlySizedInputs = inputs.filter(input => {
        const rect = input.getBoundingClientRect();
        return rect.width > 50 && rect.height > 30;
      });

      // 检查响应式表格
      const tables = document.querySelectorAll('table');
      const tableContainers = Array.from(
        document.querySelectorAll('[class*="overflow"]')
      ).filter(el => el.querySelector('table'));

      return {
        hasTabs: !!tabs,
        tabCount: tabTriggers.length,
        totalInputs: inputs.length,
        properlySizedInputs: properlySizedInputs.length,
        inputSizeRatio:
          inputs.length > 0
            ? Math.round((properlySizedInputs.length / inputs.length) * 100)
            : 0,
        tableCount: tables.length,
        scrollableTables: tableContainers.length,
      };
    });

    results.modules.queryPage.tests.push({
      name: '查询页面适配',
      status: queryPageTests.inputSizeRatio >= 90 ? 'passed' : 'failed',
      details: `输入元素适配: ${queryPageTests.properlySizedInputs}/${queryPageTests.totalInputs} (${queryPageTests.inputSizeRatio}%)`,
      data: queryPageTests,
    });

    // 截图保存查询页面
    await page.screenshot({
      path: 'test-results/mobile-query-page.png',
      fullPage: true,
    });

    results.modules.queryPage.status = 'complete';
    console.log('   ✅ 查询页面适配测试完成\n');

    // 生成汇总报告
    const allTests = [
      ...results.modules.layoutAdaptation.tests,
      ...results.modules.touchInteraction.tests,
      ...results.modules.contentReadability.tests,
      ...results.modules.navigation.tests,
      ...results.modules.queryPage.tests,
    ];

    const passedTests = allTests.filter(
      test => test.status === 'passed'
    ).length;
    const totalTests = allTests.length;
    const successRate = Math.round((passedTests / totalTests) * 100);

    results.summary = {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate,
      overallStatus: successRate >= 85 ? 'passed' : 'failed',
    };

    // 输出结果
    console.log('📊 回测验证结果汇总:');
    console.log('=====================');
    console.log(`总测试项: ${totalTests}`);
    console.log(`通过项: ${passedTests}`);
    console.log(`失败项: ${totalTests - passedTests}`);
    console.log(`成功率: ${successRate}%`);
    console.log(
      `整体状态: ${results.summary.overallStatus === 'passed' ? '✅ 通过' : '❌ 未通过'}`
    );

    // 保存详细报告
    fs.writeFileSync(
      'test-results/dc015-mobile-backtest-report.json',
      JSON.stringify(results, null, 2)
    );

    console.log(
      '\n📋 详细报告已保存至: test-results/dc015-mobile-backtest-report.json'
    );
    console.log('📸 屏幕截图已保存至: test-results/ 目录');

    if (results.summary.overallStatus === 'passed') {
      console.log('\n🎉 DC015移动端适配任务回测验证通过！');
      console.log('✅ 响应式布局适配良好');
      console.log('✅ 触摸交互体验优化');
      console.log('✅ 内容可读性达标');
      console.log('✅ 导航功能正常');
      console.log('✅ 查询页面适配完善');
    } else {
      console.log('\n⚠️  DC015移动端适配任务需要进一步优化');
      console.log('请查看详细报告了解具体问题');
    }
  } catch (error) {
    console.error('❌ 回测过程中发生错误:', error);
    results.error = error.message;
  } finally {
    await browser.close();
  }

  return results;
}

// 执行回测
if (require.main === module) {
  runMobileBacktest()
    .then(() => {
      console.log('\n🏁 移动端适配回测完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 回测执行失败:', error);
      process.exit(1);
    });
}

module.exports = { runMobileBacktest };
