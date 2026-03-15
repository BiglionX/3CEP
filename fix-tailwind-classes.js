const fs = require('fs');
const path = require('path');

const files = [
  'src/app/foreign-trade/company/logistics/warehouse/page.tsx',
  'src/app/final-verification/page.tsx',
  'src/app/feedback/page.tsx',
  'src/app/fcx/page.tsx',
  'src/app/fcx/exchange/page.tsx',
  'src/app/faq/page.tsx',
  'src/app/exporter/trading/page.tsx',
  'src/app/enterprise/workflow-automation/page.tsx'
];

let totalFixes = 0;

files.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ 文件不存在: ${filePath}`);
    return;
  }
  
  console.log(`\n🔧 修复文件: ${filePath}`);
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalLength = content.length;
  
  let fileFixes = 0;
  
  // 1. 修复 Tailwind 响应式类名中的错误
  // flex-col ? sm :flex-row → flex-col sm:flex-row
  const responsiveClassPattern = /(\w+-\w+)\s*\?\s*([a-z]+)\s*:\s*([a-z]+)-(\w+)/g;
  
  const responsiveMatches = content.match(responsiveClassPattern);
  if (responsiveMatches) {
    content = content.replace(responsiveClassPattern, (match, baseClass, breakpoint1, breakpoint2, suffix) => {
      fileFixes++;
      return `${baseClass} ${breakpoint2}:${suffix}`;
    });
    console.log(`  ✅ 响应式类名: ${fileFixes} 处`);
  }
  
  // 2. 修复多重响应式类名
  // grid-cols-1 ? md :grid-cols-2 ? lg :grid-cols-4 → grid-cols-1 md:grid-cols-2 lg:grid-cols-4
  const multiResponsivePattern = /(\w+-\d+)\s*\?\s*([a-z]+)\s*:\s*(\w+)-(\d+)\s*\?\s*([a-z]+)\s*:\s*(\w+)-(\d+)/g;
  
  const multiMatches = content.match(multiResponsivePattern);
  if (multiMatches) {
    content = content.replace(multiResponsivePattern, (match, prop1, bp1, prop2, val1, bp2, prop3, val2) => {
      fileFixes++;
      return `${prop1} ${bp1}:${prop2}-${val1} ${bp2}:${prop3}-${val2}`;
    });
    console.log(`  ✅ 多重响应式类名: ${fileFixes} 处`);
  }
  
  // 3. 修复 hover 状态类名
  // text-gray-500 ? hover :text-gray-700 ? hover :border-gray-300 → text-gray-500 hover:text-gray-700 hover:border-gray-300
  const hoverClassPattern = /(\w+-\w+-\d+)\s*\?\s*hover\s*:\s*(\w+-\w+-\d+)\s*\?\s*hover\s*:\s*(\w+-\w+-\d+)/g;
  
  const hoverMatches = content.match(hoverClassPattern);
  if (hoverMatches) {
    content = content.replace(hoverClassPattern, (match, cls1, cls2, cls3) => {
      fileFixes++;
      return `${cls1} hover:${cls2} hover:${cls3}`;
    });
    console.log(`  ✅ hover 状态类名: ${fileFixes} 处`);
  }
  
  // 4. 修复三元运算符缺少 ?
  // activeTab === 'warehouses'  '添加仓库' : '添加库存' → activeTab === 'warehouses' ? '添加仓库' : '添加库存'
  const ternaryPattern = /([a-zA-Z_$][a-zA-Z0-9_$\s\[\]()\.=!'"]+)\s+(['"][^'"]+['"])\s*:\s*(['"][^'"]+['"])/g;
  
  const ternaryMatches = content.match(ternaryPattern);
  if (ternaryMatches) {
    content = content.replace(ternaryPattern, (match, condition, trueValue, falseValue) => {
      // 检查是否真的是三元运算符
      if (condition.includes(' ') && !condition.includes('?')) {
        fileFixes++;
        return `${condition} ? ${trueValue} : ${falseValue}`;
      }
      return match;
    });
    console.log(`  ✅ 三元运算符: ${fileFixes} 处`);
  }
  
  // 5. 修复 JSX 中的错误语法
  // onClick={condition  true : false} → onClick={condition ? true : false}
  const jsxTernaryPattern = /\{([^}]*)\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)\}/g;
  
  const jsxTernaryMatches = content.match(jsxTernaryPattern);
  if (jsxTernaryMatches) {
    content = content.replace(jsxTernaryPattern, (match, condition, trueValue, falseValue) => {
      if (!condition.includes('?') && !condition.includes(':')) {
        fileFixes++;
        return `{${condition} ? ${trueValue} : ${falseValue}}`;
      }
      return match;
    });
    console.log(`  ✅ JSX 三元运算符: ${fileFixes} 处`);
  }
  
  // 6. 修复对象字面量中的错误
  // { prop: value $ prop: value } → { prop: value, prop: value }
  const objectPattern = /(\w+):\s*([^,}]+)\s*\$\s*/g;
  
  const objectMatches = content.match(objectPattern);
  if (objectMatches) {
    content = content.replace(objectPattern, (match, key, value) => {
      fileFixes++;
      return `${key}: ${value}, `;
    });
    console.log(`  ✅ 对象字面量: ${fileFixes} 处`);
  }
  
  // 7. 修复函数体中的错误语法
  content = content.replace(/return\s+([^;{]+)\s*\$\s*/g, 'return $1; ');
  content = content.replace(/if\s*\(([^)]+)\)\s*\$\s*/g, 'if ($1) {');
  content = content.replace(/\}\s*\$\s*/g, '} ');
  
  if (content.length !== originalLength) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`  📝 文件已更新，共修复 ${fileFixes} 处`);
    totalFixes += fileFixes;
  } else {
    console.log(`  ℹ️  无需修复`);
  }
});

console.log(`\n🎉 Tailwind 类名修复完成！总计修复 ${totalFixes} 处`);
