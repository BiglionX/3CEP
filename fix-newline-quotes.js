const fs = require('fs');
const path = require('path');

// 获取所有 src/app 下的 .tsx 和 .ts 文件
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
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
  const originalContent = content;

  // 1. 修复单引号后面换行的问题
  content = content.replace(/'\n/g, "'\n");
  
  // 2. 修复 import 语句中的引号问题
  content = content.replace(/import\s+.*from\s+'[^']*'\s*\n'/g, match => {
    return match.slice(0, -2) + "\n";
  });

  // 3. 修复行尾多余的引号
  content = content.replace(/;'\n/g, ";\n");
  content = content.replace(/;''\n/g, ";\n");
  
  // 4. 修复 'use client' 或 'use server' 后面的错误引号
  content = content.replace(/^'(use client|use server)'\s*'\s*$/gm, "'$1'");
  content = content.replace(/^"(use client|use server)"\s*"\s*$/gm, '"$1"');
  
  // 5. 修复换行后跟着引号的情况
  content = content.replace(/\n'[^']*'\n'/g, (match) => {
    const lines = match.split('\n');
    if (lines.length >= 2 && lines[1].endsWith("'")) {
      return lines[0] + '\n' + lines[1].slice(0, -1) + '\n';
    }
    return match;
  });

  // 6. 修复 export default 后面跟引号的问题
  content = content.replace(/^export default function \w+\(\) \{/gm, (match) => {
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    totalFixes++;
    console.log(`✅ 已修复: ${relativePath}`);
  }
});

console.log(`\n🎉 完成！共修复 ${totalFixes} 个文件`);
