// DC005 原型开发回测验证脚本
// 验证统一门户前端原型界面和基本导航结构的功能完整性

const puppeteer = require('puppeteer');
const fs = require('fs');

async function runDC005Backtest() {
  console.log('🚀 开始 DC005 原型开发回测验证...');
  console.log('📋 测试目标: 验证统一门户前端原型界面和基本导航结构\n');

  const results = {
    timestamp: new Date().toISOString(),
    testName: 'DC005 Prototype Development Backtest',
    modules: {},
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      successRate: 0,
    },
  };

  // 启动浏览器
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    args: ['--window-size=1920,1080'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // 测试1: 主页访问和基本结构
    console.log('🧪 测试1: 主页访问和基本结构');
    results.modules.homepage = { status: 'pending', tests: [] };

    try {
      await page.goto('http://localhost:3001/data-center', {
        waitUntil: 'networkidle0',
        timeout: 10000,
      });

      // 验证页面标题
      const title = await page.title();
      const hasCorrectTitle = title.includes('数据管理中心');
      results.modules.homepage.tests.push({
        name: '页面标题验证',
        status: hasCorrectTitle ? 'passed' : 'failed',
        details: hasCorrectTitle ? '标题正确' : `标题不正确: ${title}`,
      });

      // 验证侧边栏存在
      const sidebarExists = await page.$('.sidebar, [class*="sidebar"]');
      results.modules.homepage.tests.push({
        name: '侧边栏结构验证',
        status: sidebarExists ? 'passed' : 'failed',
        details: sidebarExists ? '侧边栏存在' : '侧边栏缺失',
      });

      // 验证导航菜单项
      const menuItems = await page.$$('button[class*="justify-start"]');
      const menuItemCount = menuItems.length;
      const hasExpectedMenus = menuItemCount >= 6;
      results.modules.homepage.tests.push({
        name: '导航菜单完整性',
        status: hasExpectedMenus ? 'passed' : 'failed',
        details: `找到 ${menuItemCount} 个菜单项，期望至少6个`,
      });

      results.modules.homepage.status = 'complete';
    } catch (error) {
      results.modules.homepage.status = 'failed';
      results.modules.homepage.tests.push({
        name: '主页访问测试',
        status: 'failed',
        details: `访问失败: ${error.message}`,
      });
    }

    // 测试2: 导航功能验证
    console.log('\n🧪 测试2: 导航功能验证');
    results.modules.navigation = { status: 'pending', tests: [] };

    try {
      // 测试点击不同菜单项
      const menuButtons = await page.$$('button[class*="justify-start"]');

      if (menuButtons.length > 0) {
        // 点击第二个菜单项（数据源管理）
        await menuButtons[1].click();
        await page.waitForTimeout(1000);

        const currentUrl = page.url();
        const navigatedCorrectly = currentUrl.includes('/data-center/sources');
        results.modules.navigation.tests.push({
          name: '菜单导航功能',
          status: navigatedCorrectly ? 'passed' : 'failed',
          details: navigatedCorrectly
            ? '导航成功'
            : `导航失败，当前URL: ${currentUrl}`,
        });

        // 返回主页
        await page.goto('http://localhost:3001/data-center', {
          waitUntil: 'networkidle0',
        });
      }

      results.modules.navigation.status = 'complete';
    } catch (error) {
      results.modules.navigation.status = 'failed';
      results.modules.navigation.tests.push({
        name: '导航功能测试',
        status: 'failed',
        details: `导航测试失败: ${error.message}`,
      });
    }

    // 测试3: 响应式布局验证
    console.log('\n🧪 测试3: 响应式布局验证');
    results.modules.responsive = { status: 'pending', tests: [] };

    try {
      // 测试桌面端布局
      await page.setViewport({ width: 1920, height: 1080 });
      await page.reload({ waitUntil: 'networkidle0' });

      const desktopLayout = await page.evaluate(() => {
        const sidebar = document.querySelector('.sidebar, [class*="sidebar"]');
        const isSidebarVisible =
          sidebar && window.getComputedStyle(sidebar).transform === 'none';
        return { isSidebarVisible };
      });

      results.modules.responsive.tests.push({
        name: '桌面端布局',
        status: desktopLayout.isSidebarVisible ? 'passed' : 'failed',
        details: desktopLayout.isSidebarVisible
          ? '侧边栏正确显示'
          : '侧边栏显示异常',
      });

      // 测试移动端布局
      await page.setViewport({ width: 375, height: 667 });
      await page.reload({ waitUntil: 'networkidle0' });

      const mobileLayout = await page.evaluate(() => {
        const sidebar = document.querySelector('.sidebar, [class*="sidebar"]');
        const isSidebarHidden =
          sidebar && window.getComputedStyle(sidebar).transform !== 'none';
        return { isSidebarHidden };
      });

      results.modules.responsive.tests.push({
        name: '移动端布局',
        status: mobileLayout.isSidebarHidden ? 'passed' : 'failed',
        details: mobileLayout.isSidebarHidden
          ? '移动端响应式正常'
          : '移动端适配异常',
      });

      // 恢复桌面端视图
      await page.setViewport({ width: 1920, height: 1080 });
      results.modules.responsive.status = 'complete';
    } catch (error) {
      results.modules.responsive.status = 'failed';
      results.modules.responsive.tests.push({
        name: '响应式布局测试',
        status: 'failed',
        details: `布局测试失败: ${error.message}`,
      });
    }

    // 测试4: 子页面功能验证
    console.log('\n🧪 测试4: 子页面功能验证');
    results.modules.subpages = { status: 'pending', tests: [] };

    try {
      // 测试数据源管理页面
      await page.goto('http://localhost:3001/data-center/sources', {
        waitUntil: 'networkidle0',
      });

      const sourcesPageLoaded = await page.$('[class*="space-y-6"]');
      results.modules.subpages.tests.push({
        name: '数据源管理页面',
        status: sourcesPageLoaded ? 'passed' : 'failed',
        details: sourcesPageLoaded ? '页面加载成功' : '页面加载失败',
      });

      // 测试查询分析页面
      await page.goto('http://localhost:3001/data-center/query', {
        waitUntil: 'networkidle0',
      });

      const queryPageLoaded = await page.$('[class*="space-y-6"]');
      results.modules.subpages.tests.push({
        name: '查询分析页面',
        status: queryPageLoaded ? 'passed' : 'failed',
        details: queryPageLoaded ? '页面加载成功' : '页面加载失败',
      });

      // 测试监控告警页面
      await page.goto('http://localhost:3001/data-center/monitoring', {
        waitUntil: 'networkidle0',
      });

      const monitoringPageLoaded = await page.$('[class*="space-y-6"]');
      results.modules.subpages.tests.push({
        name: '监控告警页面',
        status: monitoringPageLoaded ? 'passed' : 'failed',
        details: monitoringPageLoaded ? '页面加载成功' : '页面加载失败',
      });

      results.modules.subpages.status = 'complete';
    } catch (error) {
      results.modules.subpages.status = 'failed';
      results.modules.subpages.tests.push({
        name: '子页面功能测试',
        status: 'failed',
        details: `子页面测试失败: ${error.message}`,
      });
    }

    // 测试5: 交互元素验证
    console.log('\n🧪 测试5: 交互元素验证');
    results.modules.interactions = { status: 'pending', tests: [] };

    try {
      await page.goto('http://localhost:3001/data-center', {
        waitUntil: 'networkidle0',
      });

      // 测试按钮点击
      const addButton = await page.$('button:has-text("添加数据源")');
      if (addButton) {
        await addButton.click();
        await page.waitForTimeout(500);
        const dialogVisible = await page.$('[role="dialog"]');
        results.modules.interactions.tests.push({
          name: '模态框交互',
          status: dialogVisible ? 'passed' : 'failed',
          details: dialogVisible ? '对话框正确显示' : '对话框未显示',
        });

        // 关闭对话框
        await page.keyboard.press('Escape');
      }

      // 测试搜索功能
      const searchInput = await page.$('input[placeholder*="搜索"]');
      if (searchInput) {
        await searchInput.type('测试搜索');
        results.modules.interactions.tests.push({
          name: '搜索输入功能',
          status: 'passed',
          details: '搜索输入框可正常使用',
        });
      }

      results.modules.interactions.status = 'complete';
    } catch (error) {
      results.modules.interactions.status = 'failed';
      results.modules.interactions.tests.push({
        name: '交互元素测试',
        status: 'failed',
        details: `交互测试失败: ${error.message}`,
      });
    }

    // 计算汇总结果
    let totalTests = 0;
    let passedTests = 0;

    Object.values(results.modules).forEach(module => {
      if (module.tests) {
        totalTests += module.tests.length;
        passedTests += module.tests.filter(
          test => test.status === 'passed'
        ).length;
      }
    });

    results.summary.totalTests = totalTests;
    results.summary.passedTests = passedTests;
    results.summary.failedTests = totalTests - passedTests;
    results.summary.successRate =
      totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    // 输出详细结果
    console.log('\n📊 DC005 回测验证结果汇总:');
    console.log('=====================================');
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过测试: ${passedTests}`);
    console.log(`失败测试: ${results.summary.failedTests}`);
    console.log(`成功率: ${results.summary.successRate}%`);
    console.log('=====================================\n');

    Object.entries(results.modules).forEach(([moduleName, module]) => {
      const passed = module.tests
        ? module.tests.filter(t => t.status === 'passed').length
        : 0;
      const total = module.tests ? module.tests.length : 0;
      console.log(`${moduleName}: ${passed}/${total} 通过`);
    });

    // 保存结果到文件
    const outputPath = 'reports/dc005-backtest-results.json';
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 详细结果已保存到: ${outputPath}`);

    // 返回最终结果
    return {
      success: results.summary.successRate >= 80,
      results,
      message:
        results.summary.successRate >= 80
          ? '✅ DC005 原型开发回测通过!'
          : '❌ DC005 原型开发回测未达到预期标准',
    };
  } catch (error) {
    console.error('❌ 回测过程中发生错误:', error);
    return {
      success: false,
      error: error.message,
      message: '❌ DC005 回测执行失败',
    };
  } finally {
    await browser.close();
  }
}

// 执行回测
if (require.main === module) {
  runDC005Backtest()
    .then(result => {
      console.log(`\n${'='.repeat(50)}`);
      console.log(result.message);
      console.log('='.repeat(50));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ 回测执行异常:', error);
      process.exit(1);
    });
}

module.exports = { runDC005Backtest };
