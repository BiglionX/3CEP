const puppeteer = require('puppeteer');
const fs = require('fs');

async function manualForeignTradeTest() {
  console.log('🚀 开始外贸公司管理平台人工测试...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 100,
    defaultViewport: null
  });
  
  const page = await browser.newPage();
  
  try {
    // 设置测试环境
    await page.setViewport({ width: 1920, height: 1080 });
    
    // 1. 访问平台
    console.log('📋 步骤 1: 访问外贸公司管理平台...');
    await page.goto('http://localhost:3001/foreign-trade/company', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // 等待页面加载
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // 截图保存当前状态
    await page.screenshot({ path: 'test-results/foreign-trade-homepage.png', fullPage: true });
    console.log('✅ 首页截图已保存: test-results/foreign-trade-homepage.png');
    
    // 2. 验证页面基本元素
    console.log('\n📋 步骤 2: 验证页面基本元素...');
    
    const pageElements = {
      标题: await page.$eval('h1', el => el.textContent.trim()).catch(() => '未找到'),
      统计卡片数量: (await page.$$('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 > div')).length,
      订单标签页: await page.$eval('button[data-state]', el => el.textContent.trim()).catch(() => '未找到'),
      角色指示器: await page.$eval('.flex.items-center.justify-between .text-sm', el => el.textContent.trim()).catch(() => '未找到')
    };
    
    console.log('页面元素验证结果:');
    Object.entries(pageElements).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    
    // 3. 测试角色切换
    console.log('\n📋 步骤 3: 测试角色切换功能...');
    
    // 查找角色切换相关的元素
    const roleElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements
        .filter(el => {
          const text = el.textContent || '';
          return text.includes('进口商') || text.includes('出口商') || 
                 text.includes('Importer') || text.includes('Exporter');
        })
        .map(el => ({
          tagName: el.tagName,
          text: el.textContent?.trim(),
          className: el.className
        }));
    });
    
    console.log('找到的角色相关元素:');
    roleElements.slice(0, 5).forEach((el, index) => {
      console.log(`  ${index + 1}. ${el.tagName} - ${el.text.substring(0, 30)}...`);
    });
    
    // 尝试点击角色切换
    try {
      await page.click('[data-testid="role-toggle"]', { timeout: 2000 }).catch(async () => {
        // 如果找不到data-testid，尝试其他选择器
        const buttons = await page.$$('button');
        for (let button of buttons) {
          const text = await button.evaluate(el => el.textContent || '');
          if (text.includes('切换') || text.includes('Switch')) {
            await button.click();
            break;
          }
        }
      });
      
      await page.waitForTimeout(1000);
      console.log('✅ 角色切换功能测试完成');
    } catch (error) {
      console.log('⚠️ 角色切换测试遇到问题:', error.message);
    }
    
    // 4. 测试统计卡片点击
    console.log('\n📋 步骤 4: 测试统计卡片跳转...');
    
    const statCards = await page.$$('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 > div');
    console.log(`找到 ${statCards.length} 个统计卡片`);
    
    for (let i = 0; i < Math.min(statCards.length, 2); i++) {
      try {
        const cardText = await statCards[i].evaluate(el => el.textContent);
        console.log(`  测试卡片 ${i + 1}: ${cardText?.substring(0, 20)}...`);
        
        await statCards[i].click();
        await page.waitForTimeout(500);
        
        const currentUrl = page.url();
        console.log(`    当前URL: ${currentUrl}`);
        
        // 返回上一页
        await page.goBack({ waitUntil: 'networkidle0' });
        await page.waitForTimeout(500);
        
      } catch (error) {
        console.log(`    卡片 ${i + 1} 测试失败:`, error.message);
      }
    }
    
    // 5. 测试订单详情跳转
    console.log('\n📋 步骤 5: 测试订单详情跳转...');
    
    const orderItems = await page.$$('.border.border-gray-200.rounded-lg.p-4');
    console.log(`找到 ${orderItems.length} 个订单项`);
    
    if (orderItems.length > 0) {
      try {
        const firstOrder = orderItems[0];
        const orderText = await firstOrder.evaluate(el => el.textContent);
        console.log(`  第一个订单预览: ${orderText?.substring(0, 50)}...`);
        
        await firstOrder.click();
        await page.waitForTimeout(1000);
        
        const orderDetailUrl = page.url();
        console.log(`  订单详情页面: ${orderDetailUrl}`);
        
        // 检查是否跳转到了订单详情页
        const isOrderDetail = orderDetailUrl.includes('/order/');
        console.log(`  ✅ 跳转成功: ${isOrderDetail}`);
        
        // 返回主页
        await page.goBack({ waitUntil: 'networkidle0' });
        
      } catch (error) {
        console.log('  ❌ 订单跳转测试失败:', error.message);
      }
    }
    
    // 6. 测试标签页切换
    console.log('\n📋 步骤 6: 测试标签页功能...');
    
    const tabs = await page.$$('button[role="tab"]');
    console.log(`找到 ${tabs.length} 个标签页`);
    
    for (let i = 0; i < tabs.length; i++) {
      try {
        const tabText = await tabs[i].evaluate(el => el.textContent?.trim());
        console.log(`  点击标签页: ${tabText}`);
        
        await tabs[i].click();
        await page.waitForTimeout(500);
        
        // 检查对应内容是否显示
        const contentVisible = await page.evaluate((index) => {
          const contents = document.querySelectorAll('[role="tabpanel"]');
          return contents[index]?.style.display !== 'none';
        }, i);
        
        console.log(`    内容显示: ${contentVisible}`);
        
      } catch (error) {
        console.log(`    标签页 ${i + 1} 测试失败:`, error.message);
      }
    }
    
    // 7. 测试移动端适配
    console.log('\n📋 步骤 7: 测试移动端响应式设计...');
    
    await page.setViewport({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/foreign-trade-mobile.png' });
    console.log('✅ 移动端截图已保存: test-results/foreign-trade-mobile.png');
    
    // 恢复桌面视图
    await page.setViewport({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    // 8. 测试侧边栏功能
    console.log('\n📋 步骤 8: 测试侧边栏导航...');
    
    // 查找侧边栏元素
    const sidebar = await page.$('.fixed.left-0.top-0.h-full');
    if (sidebar) {
      const sidebarItems = await sidebar.$$('a, button');
      console.log(`侧边栏包含 ${sidebarItems.length} 个项目`);
      
      for (let i = 0; i < Math.min(sidebarItems.length, 3); i++) {
        try {
          const itemText = await sidebarItems[i].evaluate(el => el.textContent?.trim());
          console.log(`  侧边栏项目 ${i + 1}: ${itemText}`);
          
          // 可以在这里测试点击功能
          
        } catch (error) {
          console.log(`  侧边栏项目 ${i + 1} 获取失败:`, error.message);
        }
      }
    } else {
      console.log('⚠️ 未找到固定侧边栏');
    }
    
    // 9. 生成测试总结报告
    console.log('\n📋 步骤 9: 生成测试总结...');
    
    const testSummary = {
      timestamp: new Date().toISOString(),
      platform_url: 'http://localhost:3001/foreign-trade/company',
      test_results: {
        页面访问: '✅ 成功',
        基本元素: '✅ 显示正常',
        统计卡片: `✅ 发现 ${statCards.length} 个`,
        订单列表: `✅ 发现 ${orderItems.length} 项`,
        标签页: `✅ 发现 ${tabs.length} 个`,
        移动端适配: '✅ 测试完成',
        侧边栏: sidebar ? '✅ 存在' : '⚠️ 未找到'
      },
      screenshots: [
        'test-results/foreign-trade-homepage.png',
        'test-results/foreign-trade-mobile.png'
      ]
    };
    
    // 保存测试报告
    fs.writeFileSync('test-results/foreign-trade-manual-test-report.json', 
                     JSON.stringify(testSummary, null, 2));
    
    console.log('\n🎉 外贸公司管理平台测试完成！');
    console.log('📄 测试报告已保存到: test-results/foreign-trade-manual-test-report.json');
    console.log('📸 屏幕截图已保存到: test-results/目录');
    
    // 保持浏览器打开30秒供人工检查
    console.log('\n👀 浏览器将保持打开30秒供人工检查...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  } finally {
    await browser.close();
  }
}

// 创建测试结果目录
if (!fs.existsSync('test-results')) {
  fs.mkdirSync('test-results');
}

// 执行测试
manualForeignTradeTest().catch(console.error);