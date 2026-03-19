const fs = require('fs');

let content = fs.readFileSync('src/app/scan/page.tsx', 'utf8');
content = content.replace(/[ \t]+$/gm, ''); // 移除行尾空格
fs.writeFileSync('src/app/scan/page.tsx', content, 'utf8');
console.log('行尾空格已清理');
