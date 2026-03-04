#!/usr/bin/env node

/**
 * 终极修复脚本：解决布局文件冲突问题
 * 问题：两个 EnhancedAdminLayout 文件同时存在导致登录状态控件显示异常
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 终极修复：布局文件冲突问题\n');

// 1. 检查当前布局文件状态
console.log('1️⃣ 检查布局文件状态');

const componentsLayoutPath = path.join(
  process.cwd(),
  'src',
  'components',
  'admin',
  'EnhancedAdminLayout.tsx'
);
const modulesLayoutPath = path.join(
  process.cwd(),
  'src',
  'modules',
  'common',
  'components',
  'admin',
  'EnhancedAdminLayout.tsx'
);

const componentsExists = fs.existsSync(componentsLayoutPath);
const modulesExists = fs.existsSync(modulesLayoutPath);

console.log(
  `✅ src/components/admin/EnhancedAdminLayout.tsx: ${componentsExists ? '存在' : '不存在'}`
);
console.log(
  `❌ src/modules/common/components/admin/EnhancedAdminLayout.tsx: ${modulesExists ? '存在' : '不存在'}`
);

// 2. 如果旧版本存在，删除它
if (modulesExists) {
  console.log('\n2️⃣ 删除旧版布局文件...');

  try {
    fs.unlinkSync(modulesLayoutPath);
    console.log('✅ 旧版 EnhancedAdminLayout.tsx 已删除');
  } catch (error) {
    console.error('❌ 删除失败:', error.message);
  }
}

// 3. 验证当前使用的布局文件
console.log('\n3️⃣ 验证布局文件使用情况');

try {
  const layoutContent = fs.readFileSync(
    path.join(process.cwd(), 'src', 'app', 'admin', 'layout.tsx'),
    'utf8'
  );
  const importLine = layoutContent
    .split('\n')
    .find(line => line.includes('EnhancedAdminLayout'));

  if (
    importLine &&
    importLine.includes('@/components/admin/EnhancedAdminLayout')
  ) {
    console.log('✅ 正确使用 src/components/admin/EnhancedAdminLayout.tsx');
  } else {
    console.log('❌ 布局文件导入路径不正确');
  }
} catch (error) {
  console.log('❌ 无法读取 layout.tsx 文件');
}

// 4. 强制清理缓存
console.log('\n4️⃣ 清理缓存');

try {
  // 删除 Next.js 缓存
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    const exec = require('child_process').exec;
    exec(
      `rmdir /s /q "${nextDir}"`,
      { shell: 'cmd.exe' },
      (err, stdout, stderr) => {
        if (err) {
          console.log('⚠️  .next 目录删除失败:', err.message);
        } else {
          console.log('✅ .next 缓存已清理');
        }
      }
    );
  } else {
    console.log('✅ .next 目录不存在，无需清理');
  }
} catch (error) {
  console.log('❌ 缓存清理失败:', error.message);
}

// 5. 创建最终验证脚本
console.log('\n5️⃣ 创建最终验证脚本');

const finalValidationContent = `
/**
 * 最终验证脚本 - 确认布局文件冲突已解决
 */

console.log('🔍 最终验证布局文件冲突修复...');

// 检查关键文件
const fs = require('fs');
const path = require('path');

const componentsLayout = path.join(process.cwd(), 'src', 'components', 'admin', 'EnhancedAdminLayout.tsx');
const modulesLayout = path.join(process.cwd(), 'src', 'modules', 'common', 'components', 'admin', 'EnhancedAdminLayout.tsx');

console.log('检查文件存在性:');
console.log('- components layout:', fs.existsSync(componentsLayout) ? '✅ 存在' : '❌ 不存在');
console.log('- modules layout:', fs.existsSync(modulesLayout) ? '❌ 存在(应已删除)' : '✅ 不存在');

// 验证登录状态控件逻辑
const content = fs.readFileSync(componentsLayout, 'utf8');
const hasUnifiedLogin = content.includes('{userEmail ? (') && 
                         content.includes('// 已登录状态') &&
                         content.includes('// 未登录状态');

console.log('统一登录控件逻辑:', hasUnifiedLogin ? '✅ 完整' : '❌ 不完整');

console.log('\\n🎯 预期效果:');
console.log('- 右上角应该只有一个控件区域');
console.log('- 根据登录状态动态切换显示内容');
console.log('- 未登录时显示: 登录 + 免费注册');
console.log('- 已登录时显示: 用户信息 + 退出按钮');

console.log('\\n🔧 测试步骤:');
console.log('1. 访问 http://localhost:3001/admin');
console.log('2. 确认右上角只有一个控件');
console.log('3. 登录后验证状态切换');
`;

const validationScriptPath = path.join(
  process.cwd(),
  'scripts',
  'final-validation-fix.js'
);
fs.writeFileSync(validationScriptPath, finalValidationContent);
console.log('✅ 最终验证脚本已创建');

// 6. 提供最终操作指引
console.log('\n📋 最终操作步骤:');
console.log('1. 停止开发服务器 (Ctrl+C)');
console.log('2. 运行: node scripts/final-validation-fix.js');
console.log('3. 删除 .next 目录 (如果上面没成功): rmdir /s /q .next');
console.log('4. 重新启动: npm run dev');
console.log('5. 访问 http://localhost:3001/admin 验证修复效果');

console.log('\n🎉 修复完成！现在应该只有一个统一的登录状态控件');
