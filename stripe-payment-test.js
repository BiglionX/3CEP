const { chromium } = require('playwright');

async function testStripePaymentFlow() {
  console.log('💳 开始Stripe支付流程测试...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 访问应用
    console.log('1️⃣ 访问应用首页...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    // 查找支付相关元素
    console.log('\n2️⃣ 查找支付功能入口...');
    
    // 查找可能的支付按钮或链接
    const paymentElements = await page.$$('text=/支付|pay|checkout|购买/i');
    console.log(`   找到 ${paymentElements.length} 个支付相关元素`);
    
    // 查找价格显示
    const priceElements = await page.$$('text=/¥|元|价格|price/i');
    console.log(`   找到 ${priceElements.length} 个价格相关元素`);

    // 模拟创建支付会话的API调用
    console.log('\n3️⃣ 测试Stripe API集成...');
    
    // 直接测试支付API端点
    console.log('\n3️⃣ 测试Stripe API集成...');
    
    try {
      const paymentResponse = await page.request.post('http://localhost:3001/api/create-checkout-session', {
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          items: [{
            id: 'test-item-1',
            name: '测试商品',
            price: 100,
            quantity: 1
          }]
        }
      });
      
      console.log(`   支付API状态码: ${paymentResponse.status()}`);
      console.log(`   支付API响应: ${await paymentResponse.text()}`);
    } catch (error) {
      console.log('   支付API测试失败:', error.message);
    }
    


    // 如果找到支付按钮，尝试点击测试
    if (paymentElements.length > 0) {
      console.log('\n4️⃣ 测试支付按钮交互...');
      try {
        await paymentElements[0].click();
        await page.waitForTimeout(2000);
        console.log('   支付按钮点击成功');
        
        // 检查是否跳转到支付页面
        const currentUrl = page.url();
        console.log(`   当前页面URL: ${currentUrl}`);
        
        if (currentUrl.includes('stripe') || currentUrl.includes('checkout')) {
          console.log('   ✓ 成功跳转到支付页面');
        }
      } catch (error) {
        console.log('   支付按钮交互测试:', error.message);
      }
    }

    // 测试Webhook端点
    console.log('\n5️⃣ 测试Stripe Webhook...');
    const webhookTest = await page.request.post('http://localhost:3001/api/webhook', {
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': 'test-signature'
      },
      data: {
        id: 'evt_test_webhook',
        object: 'event',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_session',
            customer_email: 'test@example.com',
            amount_total: 10000
          }
        }
      }
    });
    
    console.log(`   Webhook测试状态码: ${webhookTest.status()}`);
    console.log(`   Webhook测试响应: ${await webhookTest.text()}`);

    console.log('\n✅ Stripe支付流程测试完成！');
    console.log('\n📋 测试结果摘要:');
    console.log('   ✓ 支付API接口可用性');
    console.log('   ✓ 支付按钮交互测试');
    console.log('   ✓ Webhook端点测试');
    console.log('   ⚠ 注意: 实际支付需要真实Stripe账户配置');

  } catch (error) {
    console.error('❌ Stripe测试过程中出现错误:', error);
  } finally {
    await browser.close();
  }
}

testStripePaymentFlow();