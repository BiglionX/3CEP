const fs = require('fs');

const filePath = './src/app/foreign-trade/company/page.tsx';

let content = fs.readFileSync(filePath, 'utf8');
console.log('开始修复...\n');

// 修复第 84 行：缺少 ? 符号
if (content.includes("activeRole === 'importer'\n         [\n")) {
  console.log('✓ 修复第 84 行三元运算符错误');
  content = content.replace(
    /activeRole === 'importer'\n         \[/g,
    "activeRole === 'importer' ? [\n"
  );
}

// 检查文件是否修复成功
if (content.includes("activeRole === 'importer' ? [")) {
  console.log('✓ 三元运算符修复成功');
} else {
  console.log('✗ 三元运算符修复失败');
}

// 写回文件
fs.writeFileSync(filePath, content, 'utf8');
console.log('\n修复完成！请检查文件。');
