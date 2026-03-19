const fs = require('fs');

let content = fs.readFileSync('src/app/scan/[id]/page.tsx', 'utf8');

// 先输出字符信息
console.log('Line 123 chars:', content.split('\n')[122]);

// 修复 err instanceof Error 的问题
content = content.replace(/setError\(err instanceof Error\s+(\S+)\s+err\.message : '获取产品信息失败'\);/g,
  "setError(err instanceof Error ? err.message : '获取产品信息失败');");
content = content.replace(/setError\(err instanceof Error\s+(\S+)\s+err\.message : '网络错误'\);/g,
  "setError(err instanceof Error ? err.message : '网络错误');");

fs.writeFileSync('src/app/scan/[id]/page.tsx', content, 'utf8');
console.log('Fixed err instanceof Error');
