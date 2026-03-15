const fs = require('fs');
const path = require('path');

// 需要修复的文件列表
const filesToFix = [
  'd:/BigLionX/3cep/src/app/exporter/trading/page.tsx',
  'd:/BigLionX/3cep/src/app/foreign-trade/company/logistics/warehouse/page.tsx',
  'd:/BigLionX/3cep/src/app/final-verification/page.tsx',
];

let totalFixes = 0;

filesToFix.forEach(filePath => {
  console.log(`\n处理文件: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalLength = content.length;
    
    // 修复 1: 三元运算符缺少 ? 符号
    // 例如: condition  ( ... ) 应该是 condition ? ( ... )
    content = content.replace(
      /(\w+)\s+\(/g,
      (match, p1, offset, string) => {
        // 检查前面是否是条件表达式的一部分
        const before = string.substring(0, offset);
        // 如果前面有 = 或 === 等，说明这是三元运算符的条件部分
        if (before.match(/\)\s*===\s*\w+\s+$/) || 
            before.match(/\w+\s+===\s*\w+\s+$/) ||
            before.match(/\.length\s+===\s*0\s+$/)) {
          return `${p1} ? (`;
        }
        return match;
      }
    );
    
    // 修复 2: 嵌套三元运算符缺少 ? 符号
    content = content.replace(
      /===\s*['"]?\w+['"]?\s+\(/g,
      (match, offset, string) => {
        const before = string.substring(0, offset);
        // 如果这是嵌套的三元运算符，添加 ?
        if (before.match(/\?\s*'/) || before.match(/\?\s*"/) || before.match(/\s+'/)) {
          return match.replace(' ? (', ' ? ');
        }
        return match;
      }
    );
    
    // 修复 3: 修复 flex-col ? sm:flex-row 错误
    content = content.replace(/flex-col\s*\?\s*sm:flex-row/g, 'flex-col sm:flex-row');
    content = content.replace(/flex-col\s*\?\s*md:flex-row/g, 'flex-col md:flex-row');
    
    // 修复 4: 修复 grid-cols-1 grid-cols-2 错误
    content = content.replace(/grid-cols-1\s+grid-cols-2/g, 'grid-cols-1 md:grid-cols-2');
    content = content.replace(/grid-cols-1\s+grid-cols-2\s+lg:grid-cols-4/g, 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4');
    content = content.replace(/grid-cols-2\s+lg:grid-cols-4/g, 'md:grid-cols-2 lg:grid-cols-4');
    
    // 修复 5: 修复 px:6lg:px-8 错误
    content = content.replace(/px:6lg:px-8/g, 'px-6 lg:px-8');
    content = content.replace(/flex:rowsm:items-center/g, 'flex-col sm:items-center');
    content = content.replace(/justify:between/g, 'justify-between');
    content = content.replace(/flex:row/g, 'flex-row');
    
    // 修复 6: 修复 text:gray-700hover:border-gray-300
    content = content.replace(/text:gray-700hover:border-gray-300/g, 'text-gray-700 hover:border-gray-300');
    
    // 修复 7: 修复模板字符串中的逗号和变量引用错误
    content = content.replace(/, \{warehouse\.utilization\}%/g, `, ${warehouse.utilization}%`);
    content = content.replace(/width: `, \{warehouse\.utilization\}%`/g, `width: \`\${warehouse.utilization}%\``);
    content = content.replace(/width: `, \{Math\.min\(100, \(item\.quantity \/ item\.maxStock\) \* 100\)}%`/g, 
      'width: `${Math.min(100, (item.quantity / item.maxStock) * 100)}%`');
    
    // 修复 8: 修复空格后的三元运算符
    content = content.replace(/===\s*['"]?\w+['"]?\s+'/g, '=== "?" ');
    
    // 修复 9: 修复嵌套三元运算符中的 ? 和 : 
    content = content.replace(
      /===\s*['"]?\w+['"]?\s+\n\s*['"]?/g,
      (match) => {
        if (match.includes('\n')) {
          return match.replace(/\n\s*/, ' ? ');
        }
        return match;
      }
    );
    
    // 修复 10: 修复 hover:bg-color-700disabled:bg-gray-400
    content = content.replace(/hover:bg-blue-700disabled:bg-gray-400/g, 'hover:bg-blue-700 disabled:bg-gray-400');
    content = content.replace(/hover:bg-green-700disabled:bg-gray-400/g, 'hover:bg-green-700 disabled:bg-gray-400');
    content = content.replace(/hover:bg-purple-700disabled:bg-gray-400/g, 'hover:bg-purple-700 disabled:bg-gray-400');
    
    // 修复 11: 修复 bg-red-500 bg-red-600
    content = content.replace(/bg-red-500\s+bg-red-600/g, 'bg-red-500 hover:bg-red-600');
    content = content.replace(/bg-blue-500\s+bg-blue-600/g, 'bg-blue-500 hover:bg-blue-600');
    content = content.replace(/bg-green-500\s+bg-green-600/g, 'bg-green-500 hover:bg-green-600');
    content = content.replace(/bg-purple-500\s+bg-purple-600/g, 'bg-purple-500 hover:bg-purple-600');
    
    // 修复 12: 修复条件判断中的空格问题
    content = content.replace(/(\w+===\s*['"]?\w+['"]?)\s+\(/g, '$1 ? (');
    
    // 修复 13: 修复 {loading ? 'bg-yellow-100' : 'bg-green-100'} 中的空格
    content = content.replace(/\{loading\s+\?\s*['"]bg-yellow-100['"]\s*:\s*['"]bg-green-100['"]\}/g, 
      '${loading ? \'bg-yellow-100\' : \'bg-green-100\'}');
    content = content.replace(/\{isAuthenticated\s+\?\s*['"]bg-green-100['"]\s*:\s*['"]bg-red-100['"]\}/g, 
      '${isAuthenticated ? \'bg-green-100\' : \'bg-red-100\'}');
    
    // 修复 14: 修复三元运算符结果中的空格
    content = content.replace(/(\w+)\s+\?\s*['"]?[\u4e00-\u9fa5a-zA-Z]+['"]?\s*:\s*/g, '$1 ? ');
    content = content.replace(/(\w+)\s+\?\s*['"]?[\u4e00-\u9fa5a-zA-Z]+['"]?\s*\)/g, '$1 ? ');
    
    // 修复 15: 修复模板字符串中的样式
    content = content.replace(/className=\{\`h-2 rounded-full \$\{[^}]+\`\}\}/g, 
      (match) => {
        return match.replace(/\`\$\{/, '` ${');
      });
    
    const changes = originalLength - content.length;
    if (changes !== 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ 已修复 ${Math.abs(changes)} 处更改`);
      totalFixes += Math.abs(changes);
    } else {
      console.log('  无需修复');
    }
    
  } catch (error) {
    console.error(`✗ 处理文件失败:`, error.message);
  }
});

console.log(`\n总计修复: ${totalFixes} 处更改`);
