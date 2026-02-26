#!/usr/bin/env node

/**
 * 完整登录流程测试
 */

const puppeteer = require('puppeteer');

async function testFullLoginFlow() {
  console.log('🧪 开始完整登录流程测试...');
  console.log('========================');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false, // 显示浏览器窗口以便观察
      slowMo: 100, // 减慢操作速度便于观察
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    console.log('\n1️⃣ 访问登录页面...');
    await page.goto('http://localhost:3001/login?redirect=%2Fadmin');
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    console.log('✅ 登录页面加载成功');
    
    console.log('\n2️⃣ 填写登录信息...');
    await page.type('input[type="email"]', '1055603323@qq.com');
    await page.type('input[type="password"]', '12345678');
    console.log('✅ 登录信息填写完成');
    
    console.log('\n3️⃣ 提交登录表单...');
    await page.click('button[type="submit"]');
    
    console.log('\n4️⃣ 等待登录结果...');
    // 等待可能出现的重定向或错误信息
    try {
      await page.waitForNavigation({ timeout: 10000 });
      const currentUrl = page.url();
      console.log('✅ 页面跳转到:', currentUrl);
      
      if (currentUrl.includes('/admin')) {
        console.log('🎉 成功进入管理后台！');
      } else if (currentUrl.includes('/login')) {
        // 检查是否有错误信息
        const errorMessage = await page.$eval('.text-red-700', el => el.textContent).catch(() => null);
        if (errorMessage) {
          console.log('❌ 登录失败，错误信息:', errorMessage);
        } else {
          console.log('⚠️  仍在登录页面，但无明显错误信息');
        }
      } else {
        console.log('ℹ️  跳转到了其他页面:', currentUrl);
      }
    } catch (timeoutError) {
      console.log('⏰ 页面跳转超时');
      // 检查当前页面状态
      const pageContent = await page.content();
      if (pageContent.includes('管理后台') || pageContent.includes('admin')) {
        console.log('🎉 可能已进入管理后台（页面内容检测）');
      } else {
        console.log('❌ 登录后无响应或跳转');
      }
    }
    
    console.log('\n5️⃣ 检查页面元素...');
    // 检查是否存在管理后台特有的元素
    const adminElements = await Promise.all([
      page.$('header').catch(() => null),
      page.$('[href="/admin"]').catch(() => null),
      page.$('nav').catch(() => null)
    ]);
    
    const foundAdminElements = adminElements.filter(el => el !== null).length;
    console.log(`✅ 检测到 ${foundAdminElements} 个可能的管理后台元素`);
    
    // 保持浏览器打开30秒供手动检查
    console.log('\n🔍 浏览器将保持开启30秒供手动检查...');
    console.log('请在此期间检查：');
    console.log('- 是否进入了管理后台');
    console.log('- 页面是否有错误信息');
    console.log('- 控制台是否有JavaScript错误');
    
    await new Promise(resolve => setTimeout(resolve, 30000));
    
  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
    console.log('\n🏁 测试完成');
  }
}

testFullLoginFlow();