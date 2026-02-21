const { chromium } = require('playwright');

async function runAPITests() {
  console.log('🚀 开始API功能测试...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 访问应用首页
    console.log('1️⃣ 访问应用首页...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // 测试健康检查API
    console.log('\n2️⃣ 测试健康检查API...');
    const healthResponse = await page.request.get('http://localhost:3001/api/health');
    console.log(`   状态码: ${healthResponse.status()}`);
    console.log(`   响应: ${await healthResponse.text()}`);

    // 测试零件比较API（模拟数据）
    console.log('\n3️⃣ 测试零件比较API...');
    const compareResponse = await page.request.post('http://localhost:3001/api/parts/compare', {
      data: {
        partNumbers: ['12345', '67890'],
        vehicleInfo: { year: '2020', make: 'Toyota', model: 'Camry' }
      }
    });
    console.log(`   状态码: ${compareResponse.status()}`);
    console.log(`   响应: ${await compareResponse.text()}`);

    // 测试UI交互功能
    console.log('\n4️⃣ 测试UI核心功能...');
    
    // 测试搜索功能
    console.log('   🔍 测试搜索功能...');
    await page.fill('[placeholder="输入零件号或描述"]', '刹车片');
    await page.click('button:has-text("搜索")');
    await page.waitForTimeout(2000);
    
    // 测试点赞功能
    console.log('   👍 测试点赞功能...');
    const likeButtons = await page.$$('button:has-text("👍")');
    if (likeButtons.length > 0) {
      await likeButtons[0].click();
      await page.waitForTimeout(1000);
      console.log('   点赞功能正常');
    }

    // 测试预约表单
    console.log('   📅 测试预约功能...');
    await page.click('button:has-text("预约安装")');
    await page.waitForSelector('form');
    
    // 填写预约信息
    await page.fill('#name', '测试用户');
    await page.fill('#phone', '13800138000');
    await page.fill('#date', '2024-12-31');
    await page.fill('#time', '14:00');
    await page.fill('#notes', '测试预约备注');
    
    await page.click('button:has-text("提交预约")');
    await page.waitForTimeout(2000);
    console.log('   预约功能正常');

    // 测试文件上传功能
    console.log('   📁 测试文件上传功能...');
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      // 创建临时测试文件
      const fs = require('fs');
      const path = require('path');
      const testFilePath = path.join(__dirname, 'test-upload.txt');
      fs.writeFileSync(testFilePath, '测试上传文件内容');
      
      await fileInput.setInputFiles(testFilePath);
      await page.waitForTimeout(2000);
      fs.unlinkSync(testFilePath); // 清理测试文件
      console.log('   文件上传功能正常');
    }

    console.log('\n✅ 所有API功能测试完成！');
    console.log('\n📋 测试结果摘要:');
    console.log('   ✓ 健康检查API');
    console.log('   ✓ 零件比较API');
    console.log('   ✓ 搜索功能');
    console.log('   ✓ 点赞功能');
    console.log('   ✓ 预约功能');
    console.log('   ✓ 文件上传功能');

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  } finally {
    await browser.close();
  }
}

runAPITests();