const fs = require('fs');

let content = fs.readFileSync('src/app/enterprise/page.tsx', 'utf8');

// 添加badge属性到所有缺少的对象
content = content.replace(/path: '\/enterprise\/(\w+)',\s*}/g, "path: '/enterprise/$1',\n      badge: '',}");

// 修复三元运算符
content = content.replace(/\{\s*activeTab === '(\w+)'\s+'([^']+)'\s+: '([^']+)'\s*\}/g, "{activeTab === '$1' ? '$2' : '$3'}");

fs.writeFileSync('src/app/enterprise/page.tsx', content, 'utf8');
console.log('✅ enterprise/page.tsx 修复完成');
