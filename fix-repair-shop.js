const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/repair-shop/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 修复未闭合的引号
content = content.replace(/^(')$/gm, ''); // 删除行首的单引号
content = content.replace(/'$/, "'"); // 修复行尾缺少的引号
content = content.replace(/(\w+)\s*{\s*$/gm, '$1 () {\n'); // 修复函数定义
content = content.replace(/className="([^"]*)"/g, 'className="$1"'); // 修复className属性

// 修复三元运算符
content = content.replace(/\b(\w+)\s+(\w+)\s*:\s*/g, '$1 ? $2 :'); // pattern: var1 var2 :

// 修复特定的JSX属性
content = content.replace(/className="([^"]*)"/g, 'className="$1"');
content = content.replace(/value="([^"]*)"/g, 'value="$1"');
content = content.replace(/placeholder="([^"]*)"/g, 'placeholder="$1"');
content = content.replace(/type="([^"]*)"/g, 'type="$1"');
content = content.replace(/size="([^"]*)"/g, 'size="$1"');
content = content.replace(/variant="([^"]*)"/g, 'variant="$1"');
content = content.replace(/disabled="([^"]*)"/g, 'disabled="$1"');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ repair-shop/page.tsx 已修复');
