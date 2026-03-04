#!/usr/bin/env node

/**
 * 登录跳转功能最终验证脚本
 */

const fs = require('fs');
const path = require('path');

console.log('✅ 登录跳转功能最终验证\n');

// 1. 检查关键文件状态
console.log('1️⃣ 关键文件状态检查');

const criticalFiles = [
  'src/app/api/auth/login/route.ts',
  'src/app/login/page.tsx',
  'src/components/GoogleLoginButton.tsx',
  '.env.local',
];

criticalFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// 2. 验证语法正确性
console.log('\n2️⃣ 语法验证');

const filesToCheck = [
  'src/app/api/auth/login/route.ts',
  'src/app/login/page.tsx',
];

filesToCheck.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      // 简单的语法检查
      const hasUnmatchedBraces =
        (content.match(/{/g) || []).length !==
        (content.match(/}/g) || []).length;
      const hasUnmatchedParentheses =
        (content.match(/\(/g) || []).length !==
        (content.match(/\)/g) || []).length;

      if (hasUnmatchedBraces || hasUnmatchedParentheses) {
        console.log(`❌ ${file} - 可能存在语法错误`);
      } else {
        console.log(`✅ ${file} - 语法检查通过`);
      }
    } catch (error) {
      console.log(`❌ ${file} - 读取失败: ${error.message}`);
    }
  }
});

// 3. 检查环境变量
console.log('\n3️⃣ 环境变量验证');

const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const siteUrlMatch = envContent.match(/NEXT_PUBLIC_SITE_URL=(.*)/);
  if (siteUrlMatch && siteUrlMatch[1].includes('3001')) {
    console.log('✅ 端口配置正确');
  } else {
    console.log('❌ 端口配置可能有问题');
  }
}

// 4. 创建最终测试计划
console.log('\n4️⃣ 最终测试计划');

console.log('\n📋 手动验证步骤:');

console.log('\n第一步: 基础功能测试');
console.log('1. 访问: http://localhost:3001/login');
console.log('2. 使用账号: 1055603323@qq.com');
console.log('3. 密码: 12345678');
console.log('4. 观察是否能成功登录并跳转');

console.log('\n第二步: 带参数跳转测试');
console.log('1. 访问: http://localhost:3001/login?redirect=/admin/dashboard');
console.log('2. 执行登录');
console.log('3. 验证是否跳转到 /admin/dashboard');

console.log('\n第三步: 开发者工具验证');
console.log('1. 打开F12开发者工具');
console.log('2. Console标签: 查看登录和跳转日志');
console.log('3. Network标签: 确认API请求成功(200状态)');
console.log('4. Application标签: 验证Cookie设置');

console.log('\n第四步: 错误情况测试');
console.log('1. 使用错误密码测试错误提示');
console.log('2. 测试未登录状态下的页面访问');
console.log('3. 验证会话过期处理');

// 5. 提供快速验证命令
console.log('\n5️⃣ 快速验证命令');

console.log('\n🔧 服务器状态检查:');
console.log('npm run dev');

console.log('\n🧪 功能测试:');
console.log('curl -X POST http://localhost:3001/api/auth/login \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"email":"1055603323@qq.com","password":"12345678"}\'');

console.log('\n📊 预期结果:');
console.log('✅ 服务器正常启动 (端口3001)');
console.log('✅ 登录API返回200状态');
console.log('✅ 登录成功后正确跳转');
console.log('✅ 管理员用户能访问管理后台');
console.log('✅ 普通用户跳转到指定页面');

// 6. 故障排除指南
console.log('\n6️⃣ 故障排除指南');

console.log('\n常见问题及解决方案:');

console.log('\n问题1: 服务器无法启动');
console.log('解决方案:');
console.log('  - 检查端口3001是否被占用');
console.log('  - 运行: taskkill /F /PID <占用端口的进程ID>');
console.log('  - 重新运行: npm run dev');

console.log('\n问题2: 登录API返回500错误');
console.log('解决方案:');
console.log('  - 检查Supabase配置是否正确');
console.log('  - 验证环境变量是否设置');
console.log('  - 查看服务器控制台错误信息');

console.log('\n问题3: 登录成功但不跳转');
console.log('解决方案:');
console.log('  - 检查浏览器Console中的JavaScript错误');
console.log('  - 验证redirect参数是否正确传递');
console.log('  - 清除浏览器缓存和Cookie');

console.log('\n问题4: 管理员权限验证失败');
console.log('解决方案:');
console.log('  - 检查数据库中用户权限设置');
console.log('  - 验证用户元数据中的isAdmin字段');
console.log('  - 确认admin_users表数据正确');

console.log('\n✅ 验证准备完成！请按步骤进行测试。');
console.log('\n如有任何问题，请提供具体的错误信息和复现步骤。');
