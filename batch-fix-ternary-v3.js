const fs = require('fs');
const path = require('path');

// 获取所有包含问题的文件
const { execSync } = require('child_process');

// 使用更精确的正则表达式匹配所有模式: 'xxx'  'yyy' : 'zzz'
// 以及: 变量  'xxx' : 'yyy'

function fixFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipped (not found): ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;

  // 模式1: === 'xxx'  'yyy' : 'zzz'
  content = content.replace(/=== '([^']*)'  '([^']*)'/g, "=== '$1' ? '$2'");

  // 模式2: 变量或表达式  'xxx' : 'yyy'
  // 使用更宽泛的模式匹配
  content = content.replace(/([^\s])  '([^']*)' : '([^']*)'/g, "$1 ? '$2' : '$3'");

  // 模式3: 只有 '  ' 模式
  content = content.replace(/'  '/g, "' ? '");

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`Fixed: ${filePath}`);
  } else {
    console.log(`No changes needed: ${filePath}`);
  }
}

// 需要修复的文件列表
const filesToFix = [
  'src/app/admin/shops/page.tsx',
  'src/app/admin/parts/page.tsx',
  'src/app/admin/manuals/page.tsx',
  'src/app/repair-shop/react-query-test/page.tsx',
  'src/app/enterprise/demo/page.tsx',
  'src/app/marketplace/page.tsx',
  'src/app/marketplace/checkout/page.tsx',
  'src/app/marketplace/categories/[category]/page.tsx',
  'src/app/data-center/sources/page.tsx',
  'src/app/data-center/query/page.tsx',
  'src/app/bi/dashboard/page.tsx',
  'src/app/audit/page.tsx',
  'src/app/api/foreign-trade/orders/route.ts',
  'src/app/api/v1/interact/like/route.ts',
  'src/app/api/data-pipeline/route.ts',
  'src/app/api/data-center/monitoring/alert-engine/route.ts',
  'src/app/api/procurement-intelligence/price-optimization/route.ts',
  'src/app/api/articles/[id]/like/route.ts',
  'src/app/api/admin/links/pending/route.ts',
  'src/app/api/admin/system/monitoring/alerts/route.ts',
  'src/app/api/admin/shops/pending/route.ts',
  'src/app/api/admin/manuals/review/route.ts',
];

filesToFix.forEach(fixFile);

console.log('\nThird batch fix completed!');
