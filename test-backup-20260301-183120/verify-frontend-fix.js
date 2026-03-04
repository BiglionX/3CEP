const puppeteer = require('puppeteer');

async function verifyFrontendFix() {
  console.log('🔍 验证前端管理员权限修复效果...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // 监听控制台错误
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('admin_users')) {
        console.log('🚨 控制台错误:', msg.text());
      }
    });

    // 访问统一认证测试页面
    console.log('正在访问统一认证测试页面...');
    await page.goto('http://localhost:3001/unified-auth-test', {
      waitUntil: 'networkidle0',
      timeout: 10000,
    });

    // 等待页面加载完成
    await page.waitForSelector('[data-testid="auth-status"]', {
      timeout: 5000,
    });

    // 获取认证状态
    const authStatus = await page.evaluate(() => {
      const statusEl = document.querySelector('[data-testid="auth-status"]');
      return statusEl ? statusEl.textContent : '未找到状态元素';
    });

    console.log('认证状态:', authStatus);

    // 检查管理员权限显示
    const adminPermission = await page.evaluate(() => {
      const adminEls = Array.from(document.querySelectorAll('*')).filter(
        el =>
          el.textContent &&
          (el.textContent.includes('管理员权限') ||
            el.textContent.includes('admin'))
      );
      return adminEls.map(el => ({
        text: el.textContent.trim(),
        tagName: el.tagName,
      }));
    });

    console.log('\n管理员权限相关信息:');
    adminPermission.forEach((item, index) => {
      console.log(`${index + 1}. ${item.tagName}: ${item.text}`);
    });

    // 检查是否有401或500错误
    const hasErrors = await page.evaluate(() => {
      const logs = [];
      const originalConsoleError = console.error;
      console.error = (...args) => {
        logs.push(args.join(' '));
        originalConsoleError.apply(console, args);
      };
      return logs.some(log => log.includes('401') || log.includes('500'));
    });

    console.log('\n错误检查结果:', hasErrors ? '❌ 发现错误' : '✅ 无错误');

    // 截图保存验证结果
    await page.screenshot({
      path: 'frontend-fix-verification.png',
      fullPage: true,
    });
    console.log('\n📸 验证结果截图已保存: frontend-fix-verification.png');
  } catch (error) {
    console.error('验证过程中出错:', error.message);
  } finally {
    await browser.close();
  }
}

verifyFrontendFix();
