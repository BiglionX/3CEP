const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/foreign-trade/company/orders/create/page.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// 修复1: formData.type === 'import'\n       [ -> formData.type === 'import'\n        ? [
content = content.replace(
  /formData\.type === 'import'\s+\[/g,
  "formData.type === 'import'\n        ? ["
);

// 修复2: 逗号运算符问题 (第68行左右的逗号)
content = content.replace(
  /{ id: '1', name: 'Samsung Electronics \(韩国\)', country: '韩国' },\s+{ id: '2', name: 'Apple Inc\. \(美国\)', country: '美国' },\s+{ id: '3', name: 'Sony Corporation \(日本\)', country: '日本' },\s+{ id: '4', name: 'LG Electronics \(韩国\)', country: '韩国' },\s+\]/g,
  "{ id: '1', name: 'Samsung Electronics (韩国)', country: '韩国' },\n          { id: '2', name: 'Apple Inc. (美国)', country: '美国' },\n          { id: '3', name: 'Sony Corporation (日本)', country: '日本' },\n          { id: '4', name: 'LG Electronics (韩国)', country: '韩国' },\n        ]"
);

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ 已修复 orders/create/page.tsx');
