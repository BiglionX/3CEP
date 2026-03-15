const fs = require('fs');
const path = require('path');

// 需要修复的文件列表（包含编码问题）
const filesToFix = [
  'src/app/api/workflows/route.ts',
  'src/app/api/warehouse/optimize/route.ts',
  'src/app/api/wms/callback/inbound/route.ts',
  'src/app/api/wms/dashboard/kpi-definitions/route.ts',
  'src/app/api/wms/dashboard/performance/route.ts',
  'src/app/api/wms/inbound-forecast/route.ts',
  'src/app/api/wms/connections/route.ts',
  'src/app/api/wms/inventory/route.ts',
  'src/app/api/workflows/[id]/execute/route.ts',
  'src/app/articles/[id]/page.tsx',
  'src/app/articles/page.tsx',
  'src/app/brand/login/page.tsx',
  'src/app/brand/profile/page.tsx',
  'src/app/bypass-middleware-test/page.tsx',
  'src/app/components/TestComponentDemo.tsx',
  'src/app/contact/page.tsx',
  'src/app/data-center/security/page.tsx',
  'src/app/profile/personalization/coupon-wallet/page.tsx',
  'src/app/profile/personalization/preference-settings/page.tsx',
  'src/app/profile/security/page.tsx',
  'src/app/profile/settings/page.tsx',
  'src/app/pwa-demo/page.tsx',
  'src/app/quotation/page.tsx',
  'src/app/rbac-demo/page.tsx',
  'src/app/register/page.tsx',
  'src/app/repair-shop/diagnostics/page.tsx',
  'src/app/repair-shop/feedback-demo/page.tsx',
  'src/app/repair-shop/loading-demo/page.tsx',
  'src/app/repair-shop/mobile-optimization-demo/page.tsx',
  'src/app/repair-shop/page.tsx',
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

  // 1. 修复未终止的单引号字符串
  content = content.replace(/'([^']*)$/gm, (match, inner) => {
    if (match.includes(',')) return match; // 如果有逗号，可能是正常的
    return `'${inner}'`;
  });

  // 2. 修复未终止的双引号字符串
  content = content.replace(/"([^"]*)$/gm, (match, inner) => {
    if (match.includes(',')) return match;
    return `"${inner}"`;
  });

  // 3. 修复未终止的模板字符串
  content = content.replace(/`([^`]*)$/gm, (match, inner) => {
    if (match.includes(',')) return match;
    return `\`${inner}\``;
  });

  // 4. 修复特定的编码问题字符串
  // 检测包含中文字符但未结束的字符串
  content = content.replace(/error:\s*'([\u4e00-\u9fa5]+[^']*)$/gm, (match, inner) => {
    return `error: '${inner}'`;
  });

  // 5. 修复常见的错误模式
  content = content.replace(/},\s*\{/g, '},\n{');

  // 6. 修复三元运算符语法错误
  content = content.replace(/(\w+)\s+\?\s*\?/g, '$1 ?');

  if (content !== fs.readFileSync(fullPath, 'utf-8')) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    totalFixes++;
    console.log(`✅ 已修复`);
  } else {
    console.log(`ℹ️  无需修复`);
  }
});

console.log(`\n🎉 完成！共修复 ${totalFixes} 个文件`);
