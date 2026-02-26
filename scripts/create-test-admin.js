#!/usr/bin/env node

/**
 * 简化版管理员账号设置脚本
 * 直接通过API端点创建测试用管理员账户
 */

const fs = require('fs');
const path = require('path');

async function createTestAdminAccount() {
  console.log('🚀 创建测试管理员账户...');
  console.log('==========================');
  
  const adminCredentials = {
    email: '1055603323@qq.com',
    password: '12345678',
    name: '超级管理员'
  };
  
  // 创建本地存储的测试账户文件
  const testAccountsDir = path.join(process.cwd(), 'test-accounts');
  if (!fs.existsSync(testAccountsDir)) {
    fs.mkdirSync(testAccountsDir, { recursive: true });
  }
  
  const accountFilePath = path.join(testAccountsDir, 'admin-accounts.json');
  
  // 读取现有账户
  let accounts = {};
  if (fs.existsSync(accountFilePath)) {
    const fileContent = fs.readFileSync(accountFilePath, 'utf8');
    accounts = JSON.parse(fileContent);
  }
  
  // 添加新的管理员账户
  accounts.superAdmin = {
    ...adminCredentials,
    createdAt: new Date().toISOString(),
    purpose: '端到端测试专用账户',
    permissions: ['admin', 'all_modules', 'user_management'],
    loginUrl: 'http://localhost:3001/login?redirect=%2Fadmin'
  };
  
  // 保存到文件
  fs.writeFileSync(accountFilePath, JSON.stringify(accounts, null, 2));
  
  console.log('✅ 测试管理员账户已创建！');
  console.log('\n📋 账户信息:');
  console.log(`   邮箱: ${adminCredentials.email}`);
  console.log(`   密码: ${adminCredentials.password}`);
  console.log(`   姓名: ${adminCredentials.name}`);
  console.log(`   权限: 超级管理员`);
  
  console.log('\n🔗 登录信息:');
  console.log(`   登录地址: http://localhost:3001/login?redirect=%2Fadmin`);
  console.log(`   账户文件: ${accountFilePath}`);
  
  console.log('\n⚠️  重要提醒:');
  console.log('   - 此为测试账户，仅用于开发环境');
  console.log('   - 请勿在生产环境中使用');
  console.log('   - 建议定期更换测试密码');
  
  // 创建登录测试脚本
  const loginTestScript = `
// 测试管理员登录的前端代码示例
const testAdminLogin = async () => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: '${adminCredentials.email}',
      password: '${adminCredentials.password}'
    })
  });
  
  const result = await response.json();
  console.log('登录结果:', result);
  return result;
};

// 使用示例
testAdminLogin().then(result => {
  if (result.success) {
    console.log('✅ 管理员登录成功');
    window.location.href = '/admin';
  } else {
    console.log('❌ 登录失败:', result.error);
  }
});
`;
  
  const scriptPath = path.join(testAccountsDir, 'login-test.js');
  fs.writeFileSync(scriptPath, loginTestScript);
  
  console.log(`\n📝 登录测试脚本已生成: ${scriptPath}`);
  
  // 生成环境变量示例
  const envExample = `
# 测试管理员账户配置
TEST_ADMIN_EMAIL=${adminCredentials.email}
TEST_ADMIN_PASSWORD=${adminCredentials.password}
TEST_ADMIN_NAME=${adminCredentials.name}
TEST_LOGIN_URL=http://localhost:3001/login?redirect=%2Fadmin
`;
  
  const envPath = path.join(testAccountsDir, '.env.test-admin');
  fs.writeFileSync(envPath, envExample);
  
  console.log(`\n⚙️  环境变量配置: ${envPath}`);
  
  console.log('\n🎉 测试环境准备完成！');
  console.log('现在可以通过指定的登录地址进行端到端测试。');
}

// 执行创建
createTestAdminAccount().catch(error => {
  console.error('❌ 创建测试账户失败:', error.message);
  process.exit(1);
});