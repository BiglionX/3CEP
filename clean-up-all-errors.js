const fs = require('fs');
const path = require('path');

// 获取所有 src/app 下的 .tsx 文件
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const allFiles = getAllFiles(path.join(__dirname, 'src/app'));
let totalFixes = 0;

allFiles.forEach(filePath => {
  const relativePath = path.relative(__dirname, filePath);
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalLength = content.length;
  let fixes = 0;

  // 1. 修复三元运算符缺少 ? 的情况 (pattern: condition  true/false : value)
  content = content.replace(/(\w+\s*===?\s*['"][\w-]+['"])\s+(\w+)\s*:\s*(\w+)/g, (match, condition, trueVal, falseVal) => {
    if (match.includes('?')) return match;
    return `${condition} ? ${trueVal} : ${falseVal}`;
  });

  // 2. 修复 grid-cols 重复错误
  content = content.replace(/grid-cols-1\s+grid-cols-2/g, 'grid-cols-1 md:grid-cols-2');
  content = content.replace(/grid-cols-1\s+grid-cols-3/g, 'grid-cols-1 md:grid-cols-3');
  content = content.replace(/grid-cols-1\s+grid-cols-4/g, 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4');
  content = content.replace(/grid-cols-2\s+grid-cols-3/g, 'grid-cols-2 lg:grid-cols-3');
  content = content.replace(/grid-cols-2\s+grid-cols-4/g, 'grid-cols-2 lg:grid-cols-4');
  
  // 3. 修复三元运算符中条件后直接跟值的情况 (condition ? value : 变成 condition ? ? value :)
  content = content.replace(/(\w+\s*\?\s*)\s+\?\s+([\s\S]*?)\s*:/g, '$1$2 :');
  
  // 4. 修复 condition  ( 这种情况
  content = content.replace(/(\w+\s*===?\s*['"][\w-]+['"])\s*\(/g, (match, condition) => {
    if (match.includes('?')) return match;
    return `${condition} ? (`;
  });

  // 5. 修复 tailwind 类名中的 bg-600 bg-700 重复
  const bgColors = ['red', 'blue', 'green', 'purple', 'yellow', 'gray', 'indigo', 'pink'];
  bgColors.forEach(color => {
    const pattern1 = new RegExp(`bg-${color}-600\\s+bg-${color}-700`, 'g');
    const pattern2 = new RegExp(`bg-${color}-700\\s+bg-${color}-600`, 'g');
    content = content.replace(pattern1, `bg-${color}-600 hover:bg-${color}-700`);
    content = content.replace(pattern2, `bg-${color}-600 hover:bg-${color}-700`);
  });

  // 6. 修复 Boolean() String() Number() 作为函数调用的错误
  content = content.replace(/Boolean\(/g, '!!');
  
  // 7. 修复 px-4 px-8 重复
  content = content.replace(/px-4\s+px-8/g, 'px-8');
  content = content.replace(/px-8\s+px-4/g, 'px-8');

  if (content !== fs.readFileSync(filePath, 'utf-8')) {
    fs.writeFileSync(filePath, content, 'utf-8');
    totalFixes++;
    console.log(`✅ 已修复: ${relativePath}`);
  }
});

console.log(`\n🎉 完成！共修复 ${totalFixes} 个文件`);
