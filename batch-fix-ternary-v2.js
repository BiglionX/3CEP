const fs = require('fs');
const path = require('path');

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

filesToFix.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf-8');
    
    // 替换所有模式: 字母/下划线 + 两个空格 + 单引号
    content = content.replace(/([\w])  '([^']*)'/g, '$1 ? \'$2\'');
    content = content.replace(/(\w\w)  '([^']*)'/g, '$1 ? \'$2\'');
    content = content.replace(/(\w\w\w)  '([^']*)'/g, '$1 ? \'$2\'');
    content = content.replace(/(\w\w\w\w)  '([^']*)'/g, '$1 ? \'$2\'');
    content = content.replace(/(\w\w\w\w\w)  '([^']*)'/g, '$1 ? \'$2\'');
    content = content.replace(/(\w\w\w\w\w\w)  '([^']*)'/g, '$1 ? \'$2\'');
    content = content.replace(/(\w\w\w\w\w\w\w\w)  '([^']*)'/g, '$1 ? \'$2\'');
    
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`Fixed: ${filePath}`);
  } else {
    console.log(`Skipped (not found): ${filePath}`);
  }
});

console.log('\nSecond batch fix completed!');
