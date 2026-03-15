const fs = require('fs');
const path = require('path');

// 需要修复的 API 路径文件
const apiFiles = [
  'src/app/api/agent/orchestrate/route.ts',
  'src/app/api/agent/orchestrate/tasks/route.ts',
  'src/app/api/audit/logs/route.ts',
  'src/app/api/warehouse/optimize/route.ts',
  'src/app/api/wms/callback/inbound/route.ts',
  'src/app/api/wms/connections/route.ts',
  'src/app/api/wms/dashboard/kpi-definitions/route.ts',
  'src/app/api/wms/dashboard/performance/route.ts',
  'src/app/api/wms/inbound-forecast/route.ts',
  'src/app/api/wms/inventory/route.ts',
  'src/app/api/workflows/[id]/execute/route.ts',
  'src/app/api/workflows/route.ts',
];

let totalFixes = 0;

apiFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  文件不存在: ${filePath}`);
    return;
  }

  console.log(`\n📝 正在处理: ${filePath}`);
  let content = fs.readFileSync(fullPath, 'utf-8');

  // 1. 修复未终止的字符串字面量
  // 检查常见的未终止字符串模式
  content = content.replace(/(const|let|var)\s+\w+\s*=\s*['"`][^'"`]*$/gm, match => {
    // 如果一行以字符串开始但没有结束，添加闭合引号
    if (match.endsWith("'") || match.endsWith('"') || match.endsWith('`')) {
      return match;
    }
    // 根据开头确定使用什么引号
    if (match.includes("'")) {
      return match + "'";
    } else if (match.includes('"')) {
      return match + '"';
    } else if (match.includes('`')) {
      return match + '`';
    }
    return match;
  });

  // 2. 修复 try/catch 语法错误
  content = content.replace(/\}\s*\}\s*\}\s*\}/g, '}\n}\n}');

  // 3. 修复常见的语法错误
  content = content.replace(/\]\s*\[\s*\]/g, ']');

  if (content !== fs.readFileSync(fullPath, 'utf-8')) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    totalFixes++;
    console.log(`✅ 已修复`);
  } else {
    console.log(`ℹ️  无需修复`);
  }
});

console.log(`\n🎉 完成！共修复 ${totalFixes} 个文件`);
