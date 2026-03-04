#!/usr/bin/env node

/**
 * 彻底解决登录访问问题 - 模拟真实用户登录流程
 */

const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');
require('dotenv').config();

async function realUserLoginTest() {
  console.log('🕵️‍♂️ 模拟真实用户登录流程测试');
  console.log('================================');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 100,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    console.log('\n1️⃣ 访问登录页面...');
    await page.goto(
      'http://localhost:3001/login?redirect=%2Fadmin%2Fdashboard'
    );
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    console.log('✅ 登录页面加载成功');

    console.log('\n2️⃣ 填写登录信息...');
    await page.type('input[type="email"]', '1055603323@qq.com');
    await page.type('input[type="password"]', '12345678');
    console.log('✅ 登录信息填写完成');

    console.log('\n3️⃣ 提交登录表单...');
    await page.click('button[type="submit"]');

    console.log('\n4️⃣ 等待登录完成和重定向...');
    try {
      // 等待页面跳转或URL变化
      await page.waitForFunction(
        () => {
          return window.location.pathname !== '/login';
        },
        { timeout: 15000 }
      );

      const currentUrl = page.url();
      console.log('✅ 当前页面URL:', currentUrl);

      if (currentUrl.includes('/admin/dashboard')) {
        console.log('🎉 成功进入管理后台！');

        // 检查页面内容
        const pageContent = await page.content();
        const hasAdminContent =
          pageContent.includes('管理后台') ||
          pageContent.includes('admin') ||
          pageContent.includes('Dashboard');

        if (hasAdminContent) {
          console.log('✅ 页面内容验证通过');
        } else {
          console.log('⚠️  页面内容可能不完整');
        }
      } else if (currentUrl.includes('/login')) {
        const errorMessage = await page
          .$eval('.text-red-700', el => el?.textContent || '')
          .catch(() => '');
        if (errorMessage) {
          console.log('❌ 登录失败，错误信息:', errorMessage);
        } else {
          console.log('⚠️  仍在登录页面，但无明显错误信息');
        }
      } else {
        console.log('ℹ️  跳转到了其他页面:', currentUrl);
      }
    } catch (timeoutError) {
      console.log('⏰ 登录超时，检查当前状态...');
      const currentUrl = page.url();
      console.log('当前URL:', currentUrl);

      const pageContent = await page.content();
      if (pageContent.includes('管理后台') || currentUrl.includes('/admin')) {
        console.log('🎉 可能已进入管理后台');
      } else {
        console.log('❌ 登录未成功');
      }
    }

    console.log('\n5️⃣ 检查浏览器存储...');
    // 检查localStorage和cookies
    const localStorageItems = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('sb-')) {
          items[key] = localStorage.getItem(key);
        }
      }
      return items;
    });

    console.log('LocalStorage中的Supabase项:', Object.keys(localStorageItems));

    const cookies = await page.cookies();
    const supabaseCookies = cookies.filter(cookie =>
      cookie.name.includes('sb-')
    );
    console.log('Supabase相关Cookies数量:', supabaseCookies.length);

    console.log('\n🔍 浏览器将保持开启60秒供手动检查...');
    console.log('请在此期间验证:');
    console.log('- 是否成功进入管理后台');
    console.log('- 页面功能是否正常');
    console.log('- 控制台是否有错误信息');
    console.log('- 网络请求是否正常');

    await new Promise(resolve => setTimeout(resolve, 60000));
  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
    console.log('\n🏁 测试完成');
  }
}

realUserLoginTest();
