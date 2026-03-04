#!/usr/bin/env node

/**
 * 快速健康检查脚本
 * 检查项目核心组件和服务状态
 */

const fs = require('fs');
const path = require('path');

console.log('🏥 FixCycle 项目健康检查\n');

// 1. 检查核心目录结构
console.log('📁 目录结构检查:');
const coreDirs = [
  'src/app/admin',
  'src/app/api',
  'src/components',
  'src/lib',
  'src/supply-chain',
  'src/fcx-system',
  'src/data-center',
  'supabase/migrations',
  'scripts',
];

let dirCheckPassed = 0;
coreDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${dir}`);
  if (exists) dirCheckPassed++;
});

console.log(`\n  目录完整性: ${dirCheckPassed}/${coreDirs.length}\n`);

// 2. 检查关键文件
console.log('📄 关键文件检查:');
const keyFiles = [
  'package.json',
  'next.config.js',
  'tsconfig.json',
  'supabase/config.toml',
  '.env',
];

let fileCheckPassed = 0;
keyFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${file}`);
  if (exists) fileCheckPassed++;
});

console.log(`\n  文件完整性: ${fileCheckPassed}/${keyFiles.length}\n`);

// 3. 检查迁移文件
console.log('💾 数据库迁移检查:');
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
if (fs.existsSync(migrationsDir)) {
  const migrationFiles = fs.readdirSync(migrationsDir);
  console.log(`  ✅ 找到 ${migrationFiles.length} 个迁移文件`);
  migrationFiles.forEach(file => {
    console.log(`    - ${file}`);
  });
} else {
  console.log('  ❌ 迁移目录不存在');
}

// 4. 检查脚本文件
console.log('\n🤖 自动化脚本检查:');
const scriptsDir = path.join(__dirname, '..');
const scriptFiles = fs
  .readdirSync(scriptsDir)
  .filter(file => file.startsWith('test-') && file.endsWith('.js'));

console.log(`  ✅ 找到 ${scriptFiles.length} 个测试脚本`);
scriptFiles.slice(0, 5).forEach(file => {
  console.log(`    - ${file}`);
});
if (scriptFiles.length > 5) {
  console.log(`    ... 还有 ${scriptFiles.length - 5} 个脚本`);
}

// 5. 检查API路由
console.log('\n🌐 API端点检查:');
const apiRoutes = [
  'src/app/api/auth',
  'src/app/api/admin',
  'src/app/api/supply-chain',
  'src/app/api/fcx',
  'src/app/api/data-center',
];

let apiCheckPassed = 0;
apiRoutes.forEach(route => {
  const fullPath = path.join(__dirname, '..', route);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${route}`);
  if (exists) apiCheckPassed++;
});

console.log(`\n  API完整性: ${apiCheckPassed}/${apiRoutes.length}\n`);

// 6. 总体状态评估
const totalChecks = coreDirs.length + keyFiles.length + apiRoutes.length + 3; // +3 for migrations, scripts, env
const passedChecks = dirCheckPassed + fileCheckPassed + apiCheckPassed + 3;

const completionRate = Math.round((passedChecks / totalChecks) * 100);

console.log('🏆 总体健康状况:');
console.log(`  完成度: ${passedChecks}/${totalChecks} (${completionRate}%)`);

if (completionRate >= 90) {
  console.log('  🎉 项目状态: 优秀 - 准备就绪');
} else if (completionRate >= 75) {
  console.log('  👍 项目状态: 良好 - 基本完备');
} else if (completionRate >= 60) {
  console.log('  👌 项目状态: 合格 - 需要完善');
} else {
  console.log('  🔧 项目状态: 需要大量修复');
}

// 7. 建议行动项
console.log('\n📝 建议行动项:');
const actions = [];

if (dirCheckPassed < coreDirs.length) {
  actions.push('1. 补充缺失的核心目录结构');
}

if (fileCheckPassed < keyFiles.length) {
  actions.push('2. 创建缺失的关键配置文件');
}

if (apiCheckPassed < apiRoutes.length) {
  actions.push('3. 完善API路由结构');
}

if (actions.length === 0) {
  actions.push('1. 执行完整的端到端测试');
  actions.push('2. 进行生产环境部署准备');
  actions.push('3. 开始用户验收测试');
}

actions.forEach(action => console.log(`  ${action}`));

console.log('\n✨ 健康检查完成！');
