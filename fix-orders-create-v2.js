const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/foreign-trade/company/orders/create/page.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// 修复1: 三元运算符的 variant 属性
content = content.replace(
  /variant={\s*formData\.priority === 'high'\s+'destructive'\s+: formData\.priority === 'medium'\s+'default'\s+: 'secondary'\s*}/g,
  "variant={\n                      formData.priority === 'high'\n                        ? 'destructive'\n                        : formData.priority === 'medium'\n                          ? 'default'\n                          : 'secondary'\n                    }"
);

// 修复2: 优先级文本显示
content = content.replace(
  /formData\.priority === 'high'\s+'高'\s+: formData\.priority === 'medium'\s+'中'\s+: '低'\s*}\s*优先级/g,
  "formData.priority === 'high'\n                        ? '高'\n                        : formData.priority === 'medium'\n                          ? '中'\n                          : '低'}\n                    优先级"
);

// 修复3: formData.type === 'import'  '进口采购' : '出口销售'
content = content.replace(
  /formData\.type === 'import'\s+'进口采购'\s+: '出口销售'/g,
  "formData.type === 'import' ? '进口采购' : '出口销售'"
);

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ 已修复 orders/create/page.tsx v2');
