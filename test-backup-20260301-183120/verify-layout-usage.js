#!/usr/bin/env node

/**
 * 验证实际使用的布局文件
 */
const fs = require('fs');
const path = require('path');

console.log('🔍 验证布局文件使用情况...\n');

// 检查所有可能的布局文件
const layoutFiles = [
  'src/app/admin/layout.tsx',
  'src/components/admin/EnhancedAdminLayout.tsx',
  'src/modules/common/components/admin/EnhancedAdminLayout.tsx',
  'src/components/admin/AdminLayout.tsx',
  'src/modules/common/components/admin/AdminLayout.tsx',
];

layoutFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`✅ ${file}`);

    // 检查是否包含关键标识
    if (content.includes('EnhancedAdminLayout')) {
      console.log(`   🔍 包含 EnhancedAdminLayout`);
    }
    if (content.includes('userEmail') && content.includes('is_admin')) {
      console.log(`   🔍 包含用户状态逻辑`);
    }
  } catch (error) {
    console.log(`❌ ${file} - ${error.message}`);
  }
});

console.log('\n📋 根据 src/app/admin/layout.tsx，实际使用的是:');
console.log('   @/components/admin/EnhancedAdminLayout');

console.log('\n🎯 建议操作:');
console.log('1. 清除浏览器缓存和Next.js缓存');
console.log('2. 重新启动开发服务器');
console.log('3. 如果问题仍在，请提供最新的页面源码');
