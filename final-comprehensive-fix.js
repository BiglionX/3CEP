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
  'src/app/feedback/page.tsx',
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

  // 1. 修复三元运算符语法错误 (condition  true : false)
  content = content.replace(/(\S+)\s{2,}:\s*true/g, '$1 ? true');
  content = content.replace(/(\S+)\s{2,}:\s*false/g, '$1 ? false');
  
  // 2. 修复 JSON.stringify 前面的错误
  content = content.replace(/(\w+)\s+JSON\.stringify\(/g, '$1 ? JSON.stringify(');
  
  // 3. 修复 Tailwind 类名中的错误 ? 和 :
  content = content.replace(/(\w+)\s+\?\s+(\w+)\s*:\s*(\w+)/g, '$1$2:$3');
  content = content.replace(/(\w+)-(\w+)\s+\?\s+(\w+)\s*:\s*(\w+)-(\w+)/g, '$1-$2$3:$4-$5');
  
  // 4. 修复 grid: cols-2 这类错误
  content = content.replace(/grid:\s*cols-(\d+)/g, 'grid-cols-$1');
  
  // 5. 修复 bg:blue-700 这类错误
  content = content.replace(/bg:(\w+)/g, 'bg-$1');
  
  // 6. 修复 bg:red-600 这类错误
  content = content.replace(/bg:([a-z]+)-(\d+)/g, 'bg-$1-$2');
  
  // 7. 修复 rounded , {loading ? 这类错误
  content = content.replace(/rounded\s*,\s*\{/g, 'rounded {');
  
  // 8. 修复 template strings 中的错误
  content = content.replace(/\[\{type\.toUpperCase\(\)\}\]/g, '${type.toUpperCase()}');
  
  // 9. 修复 includeFcxPrice=true 这类 URL 参数错误
  content = content.replace(/includeFcxPrice=true/g, '?includeFcxPrice=true');
  
  // 10. 修复 exchange/limit=10 这类 URL 路径错误
  content = content.replace(/\/exchange(\w+)limit=/g, '/exchange?$1limit=');
  content = content.replace(/exchangelimit=/g, 'exchange?limit=');
  
  // 11. 修复 template string 中的花括号
  content = content.replace(/\{([^}]+)\s+JSON\.stringify\([^)]+\)\s*:\s*'null'\}/g, '{$1 ? JSON.stringify($2) : "null"}');
  
  // 12. 修复 userInfo.email 这类可能错误
  content = content.replace(/userInfo\.email/g, 'userInfo?.email');
  content = content.replace(/userInfo\.roles/g, 'userInfo?.roles');
  
  // 13. 修复错误的对象属性访问
  content = content.replace(/setUserFcxBalance\(result\.data\.availableBalance/g, 'setUserFcxBalance(result.data?.availableBalance');
  
  // 14. 修复 template string 中的错误
  content = content.replace(/\`认证测试失败:\s*\{/g, '`认证测试失败: ${');
  content = content.replace(/\`重新加载失败:\s*\{/g, '`重新加载失败: ${');

  const newLength = content.length;
  fixes = originalLength - newLength;

  if (fixes > 0 || content !== fs.readFileSync(fullPath, 'utf-8')) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    totalFixes++;
    console.log(`✅ 已修复 (${fixes} 个字符减少)`);
  } else {
    console.log(`ℹ️  无需修复`);
  }
});

console.log(`\n🎉 完成！共修复 ${totalFixes} 个文件`);
