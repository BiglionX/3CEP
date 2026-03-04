#!/usr/bin/env node

// 二维码生成服务部署验证脚本
const fs = require('fs');
const path = require('path');

console.log('🚀 FixCycle 3.0 二维码生成服务部署验证开始...\n');

// 1. 检查项目结构
console.log('📋 第一步：检查项目结构...');
const requiredFiles = [
  'src/services/qrcode.service.ts',
  'src/app/api/qrcode/generate/route.ts',
  'supabase/migrations/018_create_qrcode_system.sql',
  'src/app/admin/qrcodes/page.tsx',
  'docs/guides/qrcode-generation-service-guide.md',
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
  console.log('\n❌ 项目文件不完整，请检查上述缺失文件');
  process.exit(1);
}

// 2. 检查依赖安装状态
console.log('\n📋 第二步：检查依赖安装状态...');
const dependencies = [
  { name: 'qrcode', package: 'qrcode' },
  { name: 'sharp', package: 'sharp' },
  { name: '@types/qrcode', package: '@types/qrcode' },
  { name: '@types/sharp', package: '@types/sharp' },
];

let allDepsInstalled = true;
dependencies.forEach(dep => {
  try {
    require.resolve(dep.package);
    console.log(`   ✅ ${dep.name} 已安装`);
  } catch (e) {
    console.log(`   ❌ ${dep.name} 未安装`);
    allDepsInstalled = false;
  }
});

// 3. 检查package.json配置
console.log('\n📋 第三步：检查package.json配置...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const hasQRDependencies =
  packageJson.dependencies &&
  packageJson.dependencies.qrcode &&
  packageJson.dependencies.sharp;

console.log(
  `   ${hasQRDependencies ? '✅' : '❌'} package.json中已配置二维码依赖`
);

// 4. 输出部署指导
console.log('\n📋 第四步：部署指导');

console.log('\n🔧 手动部署步骤：');

console.log('\n1️⃣ 安装依赖包:');
console.log('   npm install qrcode sharp');
console.log('   npm install @types/qrcode @types/sharp --save-dev');

console.log('\n2️⃣ 执行数据库迁移:');
console.log('   在Supabase控制台中执行以下文件:');
console.log('   supabase/migrations/018_create_qrcode_system.sql');

console.log('\n3️⃣ 配置环境变量:');
console.log('   在.env.local文件中添加:');
console.log('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
console.log('   QR_CODE_BASE_URL=https://fx.cn  # 可选');

console.log('\n4️⃣ 验证部署:');
console.log('   重启开发服务器: npm run dev');
console.log('   访问管理页面: http://localhost:3001/admin/qrcodes');
console.log('   运行测试脚本: node scripts/test-qrcode-generation.js');

// 5. 提供快速测试API
console.log('\n📋 第五步：快速测试API示例');

const testApiCall = `
// 测试单个二维码生成
curl -X POST http://localhost:3001/api/qrcode/generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "productId": "prod_test_001",
    "brandId": "brand_test_001",
    "productName": "测试产品",
    "productModel": "TEST-001",
    "config": {
      "format": "png",
      "size": 300
    }
  }'
`;

console.log('\n📡 API测试命令:');
console.log(testApiCall);

// 6. 验收标准检查清单
console.log('\n📋 第六步：验收标准检查清单');

const acceptanceCriteria = [
  '✅ 依赖包安装成功',
  '✅ 数据库表结构创建完成',
  '✅ API路由可正常访问',
  '✅ 能够成功生成二维码',
  '✅ 返回有效的Base64图片数据',
  '✅ 二维码ID唯一且格式正确',
  '✅ 数据正确存储到数据库',
  '✅ 管理后台页面可正常使用',
];

console.log('\n🎯 验收检查项:');
acceptanceCriteria.forEach(item => {
  console.log(`   ${item}`);
});

// 7. 故障排除指南
console.log('\n📋 第七步：常见问题排查');

console.log('\n❓ 问题1: 依赖安装失败');
console.log('   解决方案: 检查npm源配置，尝试使用 cnpm 或 yarn');

console.log('\n❓ 问题2: 数据库迁移失败');
console.log('   解决方案: 检查Supabase连接配置，确保有足够的权限');

console.log('\n❓ 问题3: API返回500错误');
console.log('   解决方案: 检查环境变量配置，查看服务端日志');

console.log('\n❓ 问题4: 二维码无法显示');
console.log('   解决方案: 检查Base64数据格式，验证图片解码');

// 8. 完成状态
console.log('\n🎉 部署验证脚本执行完成！');
console.log('📊 当前状态: 等待手动部署步骤完成');

if (!allDepsInstalled) {
  console.log('\n⚠️  请注意: 依赖包尚未安装，请先执行第一步');
}

console.log('\n💡 建议下一步:');
console.log('   1. 按照上面的指导完成手动部署');
console.log('   2. 部署完成后再次运行此脚本验证');
console.log('   3. 如遇问题参考故障排除指南');
