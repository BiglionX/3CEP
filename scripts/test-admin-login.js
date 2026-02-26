#!/usr/bin/env node

/**
 * 管理员登录功能验证脚本
 * 测试端到端登录流程
 */

const fs = require('fs');
const path = require('path');

async function testAdminLogin() {
  console.log('🧪 开始测试管理员登录功能...');
  console.log('================================');
  
  // 读取测试账户信息
  const accountFilePath = path.join(process.cwd(), 'test-accounts', 'admin-accounts.json');
  
  if (!fs.existsSync(accountFilePath)) {
    console.error('❌ 未找到测试账户文件');
    console.log('请先运行: node scripts/create-test-admin.js');
    process.exit(1);
  }
  
  const accounts = JSON.parse(fs.readFileSync(accountFilePath, 'utf8'));
  const adminAccount = accounts.superAdmin;
  
  console.log(`\n📋 测试账户信息:`);
  console.log(`   邮箱: ${adminAccount.email}`);
  console.log(`   密码: ${adminAccount.password}`);
  console.log(`   登录地址: ${adminAccount.loginUrl}`);
  
  // 检查本地开发服务器是否运行
  console.log(`\n1️⃣ 检查开发服务器状态...`);
  
  try {
    const response = await fetch('http://localhost:3001/api/health');
    if (response.ok) {
      console.log('✅ 开发服务器正在运行');
    } else {
      console.log('⚠️  服务器响应异常');
    }
  } catch (error) {
    console.log('❌ 开发服务器未启动');
    console.log('请运行: npm run dev');
    return;
  }
  
  // 测试登录API可用性
  console.log(`\n2️⃣ 测试登录接口...`);
  
  try {
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: adminAccount.email,
        password: adminAccount.password
      })
    });
    
    console.log(`   登录接口状态: ${loginResponse.status}`);
    
    if (loginResponse.status === 404) {
      console.log('⚠️  登录接口不存在，将使用UI登录测试');
    } else if (loginResponse.status === 200) {
      const result = await loginResponse.json();
      console.log('✅ 登录接口可用');
      console.log(`   响应: ${JSON.stringify(result)}`);
    } else {
      console.log(`⚠️  登录接口返回状态: ${loginResponse.status}`);
    }
  } catch (error) {
    console.log('⚠️  登录接口测试失败:', error.message);
  }
  
  // 生成测试用例
  console.log(`\n3️⃣ 生成端到端测试用例...`);
  
  const testCases = [
    {
      name: '访问登录页面',
      url: 'http://localhost:3001/login',
      expected: '显示登录表单'
    },
    {
      name: '输入管理员凭证',
      action: `在邮箱输入框输入: ${adminAccount.email}`,
      expected: '邮箱正确显示'
    },
    {
      name: '输入密码',
      action: `在密码输入框输入: ${adminAccount.password}`,
      expected: '密码正确输入'
    },
    {
      name: '提交登录',
      action: '点击登录按钮',
      expected: '成功跳转到管理后台'
    },
    {
      name: '验证管理员权限',
      url: 'http://localhost:3001/admin',
      expected: '能够访问管理员页面'
    }
  ];
  
  console.log('\n📋 端到端测试步骤:');
  testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.name}`);
    if (testCase.action) {
      console.log(`   操作: ${testCase.action}`);
    }
    if (testCase.url) {
      console.log(`   地址: ${testCase.url}`);
    }
    console.log(`   期望: ${testCase.expected}`);
    console.log('');
  });
  
  // 生成自动化测试脚本
  const automationScript = `
// Cypress端到端测试脚本
describe('管理员登录测试', () => {
  const adminEmail = '${adminAccount.email}';
  const adminPassword = '${adminAccount.password}';
  
  it('应该能够成功登录管理员账户', () => {
    // 访问登录页面
    cy.visit('/login?redirect=%2Fadmin');
    
    // 输入邮箱
    cy.get('[data-testid="email-input"]').type(adminEmail);
    
    // 输入密码
    cy.get('[data-testid="password-input"]').type(adminPassword);
    
    // 提交登录
    cy.get('[data-testid="login-button"]').click();
    
    // 验证登录成功
    cy.url().should('include', '/admin');
    cy.contains('管理后台').should('be.visible');
  });
  
  it('应该能够访问管理员功能', () => {
    // 假设已经登录
    cy.visit('/admin');
    
    // 验证管理员功能可见
    cy.contains('用户管理').should('be.visible');
    cy.contains('系统设置').should('be.visible');
  });
});
`;
  
  const testScriptPath = path.join(process.cwd(), 'test-accounts', 'e2e-login-test.js');
  fs.writeFileSync(testScriptPath, automationScript);
  
  console.log(`📝 自动化测试脚本已生成: ${testScriptPath}`);
  
  // 生成快速测试命令
  console.log(`\n⚡ 快速测试命令:`);
  console.log(`   1. 打开浏览器访问: ${adminAccount.loginUrl}`);
  console.log(`   2. 输入邮箱: ${adminAccount.email}`);
  console.log(`   3. 输入密码: ${adminAccount.password}`);
  console.log(`   4. 点击登录按钮`);
  
  console.log(`\n🎯 测试目标:`);
  console.log(`   - 验证登录流程完整性`);
  console.log(`   - 确认管理员权限正确`);
  console.log(`   - 测试端到端功能连通性`);
  
  console.log(`\n✅ 管理员登录测试准备完成！`);
  console.log(`现在可以开始进行端到端功能测试。`);
}

// 执行测试
testAdminLogin().catch(error => {
  console.error('❌ 测试执行失败:', error.message);
  process.exit(1);
});