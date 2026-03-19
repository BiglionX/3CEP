const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/admin/finance/page.tsx',
  'src/app/admin/content-review/manual/page.tsx',
  'src/app/data-center/query/page.tsx',
  'src/app/bi/dashboard/page.tsx',
  'src/app/foreign-trade/company/partners/contracts/page.tsx',
  'src/app/enterprise/demo/page.tsx',
  'src/app/data-center/sources/page.tsx',
  'src/app/data-center/security/page.tsx',
  'src/app/data-center/monitoring/page.tsx',
  'src/app/admin/user-manager/page.tsx',
  'src/app/admin/manuals/page.tsx',
  'src/app/admin/system-dashboard/page.tsx',
  'src/app/admin/inventory/page.tsx',
  'src/app/admin/diagnostics/page.tsx',
  'src/app/admin/device-manager/page.tsx',
  'src/app/admin/demo/page.tsx',
  'src/app/admin/parts-market/page.tsx',
  'src/app/admin/parts/page.tsx',
  'src/app/admin/content/page.tsx',
];

filesToFix.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf-8');
    
    // 替换三元运算符中缺少的 ? (模式: === 'xxx'  'xxx' : 'xxx')
    content = content.replace(/=== '([^']*)'  '([^']*)' : '([^']*)'/g, "=== '$1' ? '$2' : '$3'");
    
    // 替换变量三元运算符 (模式: 变量  'xxx' : 'xxx')
    content = content.replace(/(\w)  '([^']*)' : '([^']*)'/g, '$1 ? \'$2\' : \'$3\'');
    
    // 替换 className 模式
    content = content.replace(/(\w)  '([^']*)'/g, '$1 ? \'$2\'');
    
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`Fixed: ${filePath}`);
  } else {
    console.log(`Skipped (not found): ${filePath}`);
  }
});

console.log('\nBatch fix completed!');
