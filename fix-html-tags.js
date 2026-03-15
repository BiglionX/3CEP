const fs = require('fs');
const path = require('path');

function fixFile(filePath, fixes) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fixCount = 0;

  fixes.forEach(fix => {
    const pattern = new RegExp(fix.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (pattern.test(content)) {
      content = content.replace(pattern, fix.replace);
      fixCount++;
      console.log(`  修复: "${fix.find}" -> "${fix.replace}"`);
    }
  });

  if (fixCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ 已修复 ${fixCount} 处:`, path.relative(process.cwd(), filePath));
    return true;
  }
  return false;
}

// HTML/JSX 标签错误列表
const htmlFixes = [
  {
    file: 'src/app/contact/page.tsx',
    fixes: [
      { find: '将4小时内回复您/p>', replace: '将4小时内回复您</p>' }
    ]
  },
  {
    file: 'src/app/bypass-middleware-test/page.tsx',
    fixes: [
      { find: '您已获得管理员访问权/p>', replace: '您已获得管理员访问权</p>' }
    ]
  },
  {
    file: 'src/app/brand/profile/page.tsx',
    fixes: [
      { find: '品牌商资/h1>', replace: '品牌商信息</h1>' },
      { find: '认证状/p>', replace: '认证状态</p>' }
    ]
  }
];

// 字符串未闭合错误
const stringFixes = [
  {
    file: 'src/app/register/page.tsx',
    fixes: [
      { find: "'创建账户", replace: "'创建账户'" }
    ]
  }
];

console.log('开始修复HTML/JSX标签和字符串错误...\n');

let fixedCount = 0;

htmlFixes.forEach(item => {
  const fullPath = path.join(process.cwd(), item.file);
  if (fs.existsSync(fullPath)) {
    if (fixFile(fullPath, item.fixes)) {
      fixedCount++;
    }
  }
});

stringFixes.forEach(item => {
  const fullPath = path.join(process.cwd(), item.file);
  if (fs.existsSync(fullPath)) {
    if (fixFile(fullPath, item.fixes)) {
      fixedCount++;
    }
  }
});

console.log(`\n修复完成！共修复 ${fixedCount} 个文件`);
