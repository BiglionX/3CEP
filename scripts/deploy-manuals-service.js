#!/usr/bin/env node

// 说明书管理服务部署验证脚本
const fs = require('fs');
const path = require('path');

console.log('📚 FixCycle 3.0 说明书管理服务部署验证开始...\n');

// 1. 检查项目结构
console.log('📋 第一步：检查项目结构...');
const requiredFiles = [
  'src/services/enhanced-manuals.service.ts',
  'src/app/api/manuals/route.ts',
  'src/app/api/manuals/[manualId]/route.ts',
  'src/app/api/manuals/[manualId]/review/route.ts',
  'src/app/api/manuals/[manualId]/comments/route.ts',
  'src/app/admin/manuals/page.tsx',
  'src/components/RichTextEditor.tsx',
  'supabase/migrations/019_enhance_manuals_system.sql',
  'scripts/test-manuals-service.js'
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
  { name: '@supabase/supabase-js', package: '@supabase/supabase-js' },
  { name: 'react', package: 'react' },
  { name: 'next', package: 'next' }
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
const hasRequiredDeps = packageJson.dependencies && 
  packageJson.dependencies['@supabase/supabase-js'];

console.log(`   ${hasRequiredDeps ? '✅' : '❌'} package.json中已配置必要依赖`);

// 4. 输出部署指导
console.log('\n📋 第四步：部署指导');

console.log('\n🔧 手动部署步骤：');

console.log('\n1️⃣ 执行数据库迁移:');
console.log('   在Supabase控制台中执行以下文件:');
console.log('   supabase/migrations/019_enhance_manuals_system.sql');

console.log('\n2️⃣ 配置环境变量:');
console.log('   在.env.local文件中添加:');
console.log('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');

console.log('\n3️⃣ 验证部署:');
console.log('   重启开发服务器: npm run dev');
console.log('   访问管理页面: http://localhost:3001/admin/manuals');
console.log('   运行测试脚本: node scripts/test-manuals-service.js');

// 5. 提供快速测试API
console.log('\n📋 第五步：快速测试API示例');

const testApiCall = `
// 测试创建说明书
curl -X POST http://localhost:3001/api/manuals \\
  -H "Content-Type: application/json" \\
  -d '{
    "productId": "prod_test_001",
    "title": {
      "zh": "测试产品说明书",
      "en": "Test Product Manual"
    },
    "content": {
      "zh": "<h1>产品介绍</h1><p>这是测试内容</p>",
      "en": "<h1>Product Introduction</h1><p>This is test content</p>"
    },
    "languageCodes": ["zh", "en"],
    "createdBy": "user_test_001"
  }'
`;

console.log('\n📡 API测试命令:');
console.log(testApiCall);

// 6. 验收标准检查清单
console.log('\n📋 第六步：验收标准检查清单');

const acceptanceCriteria = [
  '✅ 数据库表结构创建完成',
  '✅ API路由可正常访问',
  '✅ 能够成功创建多语言说明书',
  '✅ 内容正确保存到数据库',
  '✅ 支持图文、视频等多媒体内容',
  '✅ 管理后台页面可正常使用',
  '✅ 富文本编辑器功能正常',
  '✅ 多语言切换功能正常',
  '✅ 权限控制准确有效',
  '✅ 版本管理和审核流程完整'
];

console.log('\n🎯 验收检查项:');
acceptanceCriteria.forEach(item => {
  console.log(`   ${item}`);
});

// 7. 故障排除指南
console.log('\n📋 第七步：常见问题排查');

console.log('\n❓ 问题1: 数据库迁移失败');
console.log('   解决方案: 检查Supabase连接配置，确保有足够的权限');

console.log('\n❓ 问题2: API返回500错误');
console.log('   解决方案: 检查环境变量配置，查看服务端日志');

console.log('\n❓ 问题3: 页面无法加载');
console.log('   解决方案: 检查Next.js路由配置，确认组件导入正确');

console.log('\n❓ 问题4: 富文本编辑器异常');
console.log('   解决方案: 检查组件类型定义，确认props传递正确');

// 8. 完成状态
console.log('\n🎉 部署验证脚本执行完成！');
console.log('📊 当前状态: 等待手动部署步骤完成');

if (!allDepsInstalled) {
  console.log('\n⚠️  请注意: 必要依赖尚未完全安装');
}

console.log('\n💡 建议下一步:');
console.log('   1. 按照上面的指导完成手动部署');
console.log('   2. 部署完成后再次运行此脚本验证');
console.log('   3. 如遇问题参考故障排除指南');