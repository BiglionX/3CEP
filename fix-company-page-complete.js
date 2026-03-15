const fs = require('fs');

const filePath = './src/app/foreign-trade/company/page.tsx';

let content = fs.readFileSync(filePath, 'utf8');
console.log('开始全面修复...\n');

const fixes = [];

// 修复所有三元运算符错误（缺少 ?）
const ternaryPatterns = [
  [/=== 'import'\s+'text-blue-600'/g, "=== 'import' ? 'text-blue-600'"],
  [/=== 'import'\s+{[^}]*}'进口商业务中心'/g, "=== 'import' ? {'进口商业务中心'"],
  [/=== 'pending'\s+'text-yellow-600'/g, "=== 'pending' ? 'text-yellow-600'"],
  [/=== 'pending'\s+'text-yellow-800'/g, "=== 'pending' ? 'text-yellow-800'"],
  [/=== 'confirmed'\s+'text-green-600'/g, "=== 'confirmed' ? 'text-green-600'"],
  [/=== 'confirmed'\s+'text-green-800'/g, "=== 'confirmed' ? 'text-green-800'"],
  [/=== 'shipped'\s+'text-blue-600'/g, "=== 'shipped' ? 'text-blue-600'"],
  [/=== 'shipped'\s+'text-blue-800'/g, "=== 'shipped' ? 'text-blue-800'"],
  [/=== 'cancelled'\s+'text-red-600'/g, "=== 'cancelled' ? 'text-red-600'"],
  [/=== 'cancelled'\s+'text-red-800'/g, "=== 'cancelled' ? 'text-red-800'"],
  [/=== 'delivered'\s+'text-purple-600'/g, "=== 'delivered' ? 'text-purple-600'"],
  [/=== 'delivered'\s+'text-purple-800'/g, "=== 'delivered' ? 'text-purple-800'"],
  [/\.length > 0\s+'bg-red-100'/g, ".length > 0 ? 'bg-red-100'"],
  [/\.length > 0\s+'bg-green-100'/g, ".length > 0 ? 'bg-green-100'"],
  [/\.length > 0\s+true\s+false/g, ".length > 0 ? true : false"],
  [/\?\s+true\s+false/g, "? true : false"],
];

ternaryPatterns.forEach(([pattern, replacement]) => {
  const matches = content.match(pattern);
  if (matches) {
    content = content.replace(pattern, replacement);
    fixes.push(`三元运算符: ${pattern.toString().substring(1, 30)}... (${matches.length} 处)`);
  }
});

// 修复三元运算符的 false 分支
const falseFixes = [
  [/=== 'import'\s+'进口商业务中心'\s+:\s+'出口商业务中心'/g, "=== 'import' ? '进口商业务中心' : '出口商业务中心'"],
  [/=== 'pending'\s+'待确认'\s+:\s+/g, "=== 'pending' ? '待确认' : "],
  [/=== 'confirmed'\s+'已确认'\s+:\s+/g, "=== 'confirmed' ? '已确认' : "],
];

falseFixes.forEach(([pattern, replacement]) => {
  const matches = content.match(pattern);
  if (matches) {
    content = content.replace(pattern, replacement);
    fixes.push(`三元运算符: ${pattern.toString().substring(1, 30)}... (${matches.length} 处)`);
  }
});

// 写回文件
fs.writeFileSync(filePath, content, 'utf8');

console.log('修复完成！');
console.log(`共修复 ${fixes.length} 类问题：\n`);
fixes.forEach((fix, i) => {
  console.log(`${i + 1}. ${fix}`);
});
console.log(`\n请运行 linter 检查剩余错误。`);
