#!/usr/bin/env node

/**
 * 最终诊断报告生成器
 */

const fs = require('fs');
const path = require('path');

console.log('📋 最终诊断报告\n');

// 收集所有相关信息
const report = {
  timestamp: new Date().toISOString(),
  systemInfo: {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  },
  fileStatus: {},
  testResults: [],
  recommendations: [],
};

// 检查关键文件
const criticalFiles = [
  'src/app/login/page.tsx',
  'src/app/api/auth/login/route.ts',
  'src/app/api/auth/check-session/route.ts',
  'src/components/GoogleLoginButton.tsx',
];

console.log('📁 文件状态检查:');
criticalFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  const exists = fs.existsSync(fullPath);
  report.fileStatus[file] = exists ? '存在' : '缺失';
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// 检查最近的修改时间
console.log('\n⏱️  文件修改时间:');
criticalFiles.forEach(file => {
  if (report.fileStatus[file] === '存在') {
    try {
      const stats = fs.statSync(path.join(process.cwd(), file));
      console.log(`  ${file}: ${stats.mtime.toLocaleString()}`);
    } catch (error) {
      console.log(`  ${file}: 无法获取时间信息`);
    }
  }
});

// 环境变量检查
console.log('\n⚙️  环境变量检查:');
const envFiles = ['.env.local', '.env'];
envFiles.forEach(envFile => {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const siteUrl = content.match(/NEXT_PUBLIC_SITE_URL=(.*)/);
    if (siteUrl) {
      console.log(`  ${envFile}: ${siteUrl[1]}`);
    }
  }
});

// 创建最终建议
console.log('\n💡 最终建议:');

const suggestions = [
  '1. 完全重启开发环境',
  '2. 使用无痕浏览器模式测试',
  '3. 检查浏览器开发者工具Console',
  '4. 验证Network面板请求响应',
  '5. 确认管理员权限设置',
  '6. 检查路由配置文件',
  '7. 验证Cookie设置情况',
];

suggestions.forEach(suggestion => {
  console.log(`   ${suggestion}`);
  report.recommendations.push(suggestion);
});

// 生成测试链接
console.log('\n🧪 测试链接:');
const testLinks = [
  'http://localhost:3001/ultimate-test - 终极诊断页面',
  'http://localhost:3001/minimal-login-test - 最小化测试',
  'http://localhost:3001/login?redirect=/admin/dashboard - 标准登录测试',
];

testLinks.forEach(link => {
  console.log(`   ${link}`);
});

// 保存报告
const reportPath = path.join(process.cwd(), 'login-jump-diagnosis-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n📄 诊断报告已保存到: ${reportPath}`);

console.log('\n🎯 下一步行动:');
console.log('1. 访问终极诊断页面运行完整测试');
console.log('2. 根据测试结果提供具体错误信息');
console.log('3. 如需进一步帮助，请提供完整的诊断报告');

console.log('\n⚠️  如果所有测试都失败，请考虑:');
console.log('   • 检查系统防火墙设置');
console.log('   • 验证Node.js和npm版本兼容性');
console.log('   • 确认项目依赖包完整性');
console.log('   • 检查端口3001是否被其他程序占用');
