const fs = require('fs');
const path = require('path');

// 需要修复的文件列表
const filesToFix = [
  'src/app/final-verification/page.tsx',
  'src/app/fcx/exchange/page.tsx',
  'src/app/foreign-trade/company/logistics/warehouse/page.tsx',
  'src/app/exporter/trading/page.tsx',
  'src/app/enterprise/workflow-automation/page.tsx',
  'src/app/faq/page.tsx',
  'src/app/fcx/page.tsx',
];

let totalFixes = 0;

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  文件不存在: ${filePath}`);
    return;
  }

  console.log(`\n📝 正在处理: ${filePath}`);
  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalLength = content.length;
  let fixes = 0;

  // 1. 修复 userInfo ? ? JSON.stringify($2) 之类的错误
  content = content.replace(/(\w+)\s+\?\s+\?\s+JSON\.stringify\(\$2\)/g, '$1 ? JSON.stringify($1)');
  
  // 2. 修复 map 函数中的三元运算符错误 (条件后缺少 ? 和 :)
  content = content.replace(/(\w+\s*===?\s*\w+)\s*\{\s*\.\.\.\w+,\s*[\s\S]*?\}\s*:\s*\w+/g, (match) => {
    // 这是一个简化的处理，具体场景可能更复杂
    return match.replace(/(\w+\s*===?\s*\w+)\s*\{/, '$1 ? {');
  });
  
  // 修复更具体的 map 模式
  content = content.replace(/(\w+\.map\([^)]*\))\s*(\w+\s*===?\s*\w+)\s*\{([\s\S]*?)\}(\s*:\s*\w+)/g, '$1 $2 ? {$3}$4');
  
  // 3. 修复 onClick 中的三元运算符缺少 ? 的情况
  content = content.replace(/(\w+\s*===?\s*['"][\w-]+['"])\s+(\w+)\s*(?!\?)/g, (match, condition, handler) => {
    if (match.includes('=>') || match.includes('function')) return match;
    return `${condition} ? ${handler}`;
  });
  
  // 4. 修复 grid-cols-2lg:grid-cols-4 这类错误 (缺少空格或冒号)
  content = content.replace(/grid-cols-(\d)lg:grid-cols-(\d)/g, 'grid-cols-$1 lg:grid-cols-$2');
  
  // 5. 修复 bg-blue-600 bg:blue-700 这类冲突
  content = content.replace(/bg-\w+-\d+\s+bg:\w+-\d+/g, (match) => {
    // 保留第一个，移除错误的 bg:
    const parts = match.split(' ');
    return parts[0];
  });
  
  // 6. 修复 Boolean() Number() String() 被当作函数调用
  content = content.replace(/Boolean\(/g, '!!');
  content = content.replace(/Number\(/g, 'Number(');  // 保持不变，但检查是否是类型错误
  content = content.replace(/String\(/g, 'String(');  // 保持不变
  
  // 7. 修复 template string 中的 $2 变量引用错误
  content = content.replace(/\$2/g, (match, offset, string) => {
    // 检查是否在 template string 中
    const before = string.substring(0, offset);
    if (before.endsWith('userInfo ? ? JSON.stringify(')) {
      return 'userInfo';
    }
    return match;
  });
  
  // 8. 修复 map 函数中的条件判断
  content = content.replace(/(\w+)\.map\(\s*(\w+)\s*=>\s*(\w+\s*===?\s*\w+)\s*\{([\s\S]*?)\}\s*(\w+)\)/g, 
    '$1.map($2 => $3 ? {$4} : $5)');
  
  // 9. 修复 activeTab === 'warehouses' handleCreateWarehouse 这类
  content = content.replace(/(\w+\s*===?\s*['"][\w-]+['"])\s+(\w+)\s*:\s*(\w+)/g, '$1 ? $2 : $3');

  const newLength = content.length;
  fixes = originalLength - newLength;

  if (fixes > 0 || content !== fs.readFileSync(fullPath, 'utf-8')) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    totalFixes++;
    console.log(`✅ 已修复 (${fixes} 个字符变化)`);
  } else {
    console.log(`ℹ️  无需修复`);
  }
});

console.log(`\n🎉 完成！共修复 ${totalFixes} 个文件`);
