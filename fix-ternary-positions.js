const fs = require('fs');
const path = require('path');

console.log('修复三元运算符问号位置错误...\n');

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

// 修复：将 ':?' 替换为 '?' :'
// 错误：condition  'value1' :? 'value2'
// 正确：condition ? 'value1' : 'value2'
const errorPattern = /:\s*\?/g;

let totalFixed = 0;
const fixedFiles = [];

allFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 检查是否存在 ':?' 模式
    if (content.includes(':?') || content.includes(': ?')) {
      const before = content.length;
      content = content.replace(errorPattern, ' ?');
      const after = content.length;
      
      const fixCount = (before - after) / 2; // 每次替换去掉1个字符
      if (fixCount > 0) {
        totalFixed += fixCount;
        fixedFiles.push({
          path: path.relative(__dirname, filePath),
          count: fixCount
        });
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ ${path.relative(__dirname, filePath)} - 修复 ${fixCount} 处错误`);
      }
    }
  } catch (error) {
    console.error(`✗ ${filePath}: ${error.message}`);
  }
});

console.log(`\n总共修复了 ${totalFixed} 处错误\n`);
console.log('\n修复的文件数量：', fixedFiles.length);

if (fixedFiles.length > 0) {
  console.log('\n修复最多的文件：');
  fixedFiles
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .forEach(({path, count}) => {
      console.log(`  ${path}: ${count} 处错误`);
    });
}

console.log('\n修复完成！');
