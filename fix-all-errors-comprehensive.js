const fs = require('fs');
const path = require('path');

// 递归查找所有 tsx 和 ts 文件
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 跳过 node_modules 和 .next
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        findFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

const srcDir = path.join(__dirname, 'src');
const allFiles = findFiles(srcDir);

let fixedCount = 0;
let checkedCount = 0;

console.log('开始扫描所有源代码文件...\n');

allFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const originalContent = content;
    
    // 修复三元运算符错误（缺少 ?）
    const ternaryPatterns = [
      /=== 0  \(/g,           // === 0  (  ->  === 0 ? (
      /=== null  \(/g,        // === null  (  ->  === null ? (
      /=== undefined  \(/g,   // === undefined  (  ->  === undefined ? (
      /=== ''  \(/g,          // === ''  (  ->  === '' ? (
      /=== '  \(/g,           // === '  (  ->  === ' ? (
      /=== "  \(/g,           // === "  (  ->  === " ? (
      /\.length === 0  \(/g,   // .length === 0  (  ->  .length === 0 ? (
      /\.length > 0  \(/g,     // .length > 0  (  ->  .length > 0 ? (
      /\.length < 1  \(/g,     // .length < 1  (  ->  .length < 1 ? (
    ];
    
    ternaryPatterns.forEach(pattern => {
      const replacement = pattern.source.replace('  (', ' ? (');
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    });
    
    // 修复 Tailwind 类名错误
    const classFixes = [
      [/\bflex:row\b/g, 'sm:flex-row'],
      [/\bflex:col\b/g, 'flex-col'],
      [/\bgrid-cols-1 grid-cols-2\b/g, 'grid-cols-1 sm:grid-cols-2'],
      [/\bpx:6\b/g, 'px-6'],
      [/\bpy:6\b/g, 'py-6'],
      [/\btext:xl\b/g, 'text-xl'],
      [/\btext:blue-700\b/g, 'hover:text-blue-700'],
      [/\btext:gray-700\b/g, 'text-gray-700'],
      [/\bbg-gray-100 text-gray-700 bg-gray-200\b/g, 'bg-gray-100 text-gray-700'],
      [/\bbg-blue-600.*bg-blue-700\b/g, 'bg-blue-600 hover:bg-blue-700'],
    ];
    
    classFixes.forEach(([pattern, replacement]) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    });
    
    // 修复重复的类名（移除重复的）
    content = content.replace(/className="([^"]*)\s+(bg-[^\s"]+)\s+\2\b/g, 'className="$1 $2"');
    content = content.replace(/className="([^"]*)\s+(text-[^\s"]+)\s+\2\b/g, 'className="$1 $2"');
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed: ${filePath.replace(__dirname, '')}`);
      fixedCount++;
    }
    
    checkedCount++;
  } catch (error) {
    console.error(`✗ Error reading ${filePath}:`, error.message);
  }
});

console.log(`\n修复完成!`);
console.log(`扫描文件: ${checkedCount} 个`);
console.log(`成功修复: ${fixedCount} 个文件`);
