const fs = require('fs');
const path = require('path');

// 需要修复的文件列表
const filesToFix = [
  'src/app/register/page.tsx',
  'src/app/profile/settings/page.tsx',
  'src/app/profile/security/page.tsx',
  'src/app/profile/personalization/coupon-wallet/page.tsx',
  'src/app/profile/personalization/preference-settings/page.tsx',
  'src/app/pwa-demo/page.tsx',
  'src/app/quotation/page.tsx',
  'src/app/rbac-demo/page.tsx',
  'src/app/repair-shop/diagnostics/page.tsx',
  'src/app/repair-shop/feedback-demo/page.tsx',
  'src/app/repair-shop/loading-demo/page.tsx',
  'src/app/repair-shop/mobile-optimization-demo/page.tsx',
];

let totalFixes = 0;

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  文件不存在: ${filePath}`);
    return;
  }

  console.log(`\n📝 正在处理: ${filePath}`);
  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;

  // 1. 删除第 2 行的单引号
  content = content.replace(/^'(use client|use server)'\s*\n'\s*$/gm, "'$1'");
  
  // 2. 删除行末多余的引号
  content = content.replace(/;''$/gm, ';');
  content = content.replace(/;'\s*$/gm, ';');
  content = content.replace(/'\s*$/gm, '');
  
  // 3. 修复 'use client' 或 'use server' 后面多余的引号
  content = content.replace(/^'(use client|use server)'\s*'\s*$/gm, "'$1'");
  
  // 4. 删除单独一行的引号
  content = content.replace(/^\s*'\s*$/gm, '');
  
  // 5. 修复 import 语句末尾的额外引号
  content = content.replace(/import\s+.*from\s+'[^']*';'/g, match => {
    return match.slice(0, -2) + ";";
  });
  
  // 6. 修复 const/let 声明后的额外引号
  content = content.replace(/(const|let|var)\s+\w+\s*=\s*[\s\S]*?;'/g, match => {
    return match.slice(0, -1) + ";";
  });

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    totalFixes++;
    console.log(`✅ 已修复`);
  } else {
    console.log(`ℹ️  无需修复`);
  }
});

console.log(`\n🎉 完成！共修复 ${totalFixes} 个文件`);
