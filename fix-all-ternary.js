const fs = require('fs');
const path = require('path');

// 递归获取所有 .tsx 和 .ts 文件
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if ((file.endsWith('.tsx') || file.endsWith('.ts')) && !file.endsWith('.test.ts') && !file.endsWith('.spec.ts')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function fixFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;

  // 模式1: 字母/符号 + 两个空格 + 单引号开头
  content = content.replace(/([\w\]\)])  '/g, "$1 ? '");

  // 模式2: 任何非空格字符 + 两个空格 + 单引号
  content = content.replace(/([^\s}])  '([^']*)'/g, "$1 ? '$2'");

  // 模式3: 处理多行情况
  content = content.replace(/(\w)\s+\n\s+'([^']*)'/g, "$1 ? '$2'");

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`Fixed: ${filePath}`);
    return 1;
  }
  return 0;
}

// 获取所有需要检查的文件
const appDir = path.join(process.cwd(), 'src/app');
const allFiles = getAllFiles(appDir);

let fixedCount = 0;
let checkedCount = 0;

console.log(`Checking ${allFiles.length} files...\n`);

allFiles.forEach(file => {
  const relativePath = path.relative(process.cwd(), file);
  checkedCount++;
  fixedCount += fixFile(relativePath);
});

console.log(`\nCompleted!`);
console.log(`Checked: ${checkedCount} files`);
console.log(`Fixed: ${fixedCount} files`);
