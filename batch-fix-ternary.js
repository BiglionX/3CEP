const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('开始批量修复 src/app 中的三元运算符错误...\n');

// 获取所有 tsx/ts 文件
function findFiles(dir, ext) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...findFiles(fullPath, ext));
    } else if (ext.includes(path.extname(item.name))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

const srcAppDir = path.join(__dirname, 'src/app');
const allFiles = findFiles(srcAppDir, ['.ts', '.tsx']);

console.log(`找到 ${allFiles.length} 个文件\n`);

// 模式：缺少问号的三元运算符
// 匹配：condition  'value1' : 'value2'
// 应该：condition ? 'value1' : 'value2'
const ternaryPattern = /([a-zA-Z_$][a-zA-Z0-9_$]*(?:\[[^\]]+\]|\.[a-zA-Z_$][a-zA-Z0-9_$]*|\([^)]*\))?\s+['"]\s*[^'"][^'"]*['"]?\s*:)/g;

let totalFixed = 0;
const fileErrors = {};

allFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fixedCount = 0;
    
    // 修复缺少问号的三元运算符
    const matches = content.match(ternaryPattern);
    if (matches) {
      content = content.replace(ternaryPattern, '$1?');
      fixedCount = matches.length;
      totalFixed += matches.length;
      
      const relativePath = path.relative(__dirname, filePath);
      fileErrors[relativePath] = (fileErrors[relativePath] || 0) + matches.length;
    }
    
    if (fixedCount > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ ${path.relative(__dirname, filePath)} - 修复 ${fixedCount} 处错误`);
    }
  } catch (error) {
    console.error(`✗ ${filePath}: ${error.message}`);
  }
});

console.log(`\n总共修复了 ${totalFixed} 处错误\n`);
console.log('\n错误最多的文件：');
Object.entries(fileErrors)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([file, count]) => {
    console.log(`  ${file}: ${count} 处错误`);
  });

console.log('\n修复完成！');
