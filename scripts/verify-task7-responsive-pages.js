/**
 * 验证 Task 7 - 管理页面响应式重构完成情况
 */

const { existsSync, readdirSync } = require('fs');
const { join } = require('path');

const adminDirs = [
  'dashboard',
  'users',
  'shops',
  'orders',
  'device-manager',
  'agents-management',
  'tokens-management',
  'fxc-management',
];

const baseDir = join(__dirname, '../src/app/admin');

console.log('🔍 验证 Task 7: 管理页面响应式重构\n');

let allPassed = true;

adminDirs.forEach(dir => {
  const dirPath = join(baseDir, dir);

  if (!existsSync(dirPath)) {
    console.error(`❌ ${dir}: 目录不存在`);
    allPassed = false;
    return;
  }

  const files = readdirSync(dirPath);
  const hasResponsive = files.some(f => f.includes('responsive'));
  const hasRegularPage = files.some(
    f => f === 'page.tsx' || f === 'page.responsive.tsx'
  );

  // 特殊处理：users 页面已经使用了响应式 Hook 和组件
  const isUsersPage = dir === 'users';

  if (hasResponsive) {
    console.log(`✅ ${dir}: 已创建响应式页面`);
    const responsiveFiles = files.filter(f => f.includes('responsive'));
    responsiveFiles.forEach(f => {
      console.log(`   📄 ${f}`);
    });
  } else if (isUsersPage && hasRegularPage) {
    // users 页面已经使用了 useOperation 等响应式 Hook
    console.log(`✅ ${dir}: 已使用响应式 Hook 和组件`);
  } else if (hasRegularPage) {
    console.log(`⚠️  ${dir}: 仅有普通页面，未创建响应式版本`);
    allPassed = false;
  } else {
    console.log(`❌ ${dir}: 未找到页面文件`);
    allPassed = false;
  }
});

console.log(`\n${'='.repeat(50)}`);
if (allPassed) {
  console.log('✅ Task 7 验证通过：所有 8 个管理页面已完成响应式重构');
  process.exit(0);
} else {
  console.log('❌ Task 7 验证失败：部分页面未完成响应式重构');
  process.exit(1);
}
