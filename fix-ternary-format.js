const fs = require('fs');
const path = require('path');

console.log('修复三元运算符格式错误...\n');

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

let totalFixed = 0;
const fixedFiles = [];

allFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // 模式1：condition  'value' :? 'value2'
    // 修复：condition ? 'value' : 'value2'
    let newContent = content.replace(/(\S)\s+(['"][^'"]*['"]\s+):\s*\?/g, '$1? $2');
    
    // 模式2：condition  'value' : 'value2'（问号在行尾）
    // 检查是否有多行三元运算符，第二行以:开头
    const lines = newContent.split('\n');
    for (let i = 0; i < lines.length - 1; i++) {
      const currentLine = lines[i];
      const nextLine = lines[i + 1];
      
      // 检查：当前行以 'value' 结尾，下一行以 : 开头
      if (currentLine.match(/(['"][^'"]*['"]\s*)$/) && nextLine.match(/^:\s*['"]/)) {
        // 将当前行的末尾添加 ?，删除下一行的 :
        lines[i] = currentLine.replace(/(['"][^'"]*['"]\s*)$/, '$1? ');
        lines[i + 1] = nextLine.replace(/^:\s*/, '');
        hasChanges = true;
      }
    }
    
    newContent = lines.join('\n');
    
    if (content !== newContent) {
      totalFixed++;
      fixedFiles.push(path.relative(__dirname, filePath));
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✓ ${path.relative(__dirname, filePath)}`);
    }
  } catch (error) {
    console.error(`✗ ${filePath}: ${error.message}`);
  }
});

console.log(`\n总共修复了 ${fixedFiles.length} 个文件\n`);

if (fixedFiles.length > 0) {
  console.log('\n修复的文件列表：');
  fixedFiles.forEach(file => {
    console.log(`  ${file}`);
  });
}

console.log('\n修复完成！');
