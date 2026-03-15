const fs = require('fs');
const path = require('path');

// 查找所有需要修复的文件
const filesToFix = [
  'src/app/zustand-demo/page.tsx',
  'src/app/workflows/page.tsx',
  'src/app/ultimate-self-debug/page.tsx',
  'src/app/ultimate-diagnosis/page.tsx',
  'src/app/tutorials/page.tsx',
  'src/app/tokens/page.tsx',
  'src/app/team/[teamId]/page.tsx',
  'src/app/team/page.tsx',
  'src/app/security-dashboard/page.tsx',
  'src/app/scan/[id]/page.tsx',
  'src/app/repair-shop/work-orders-paginated/page.tsx',
  'src/app/repair-shop/work-orders/page.tsx',
  'src/app/repair-shop/pagination-test/page.tsx',
  'src/app/pwa-demo/page.tsx',
  'src/app/performance-testing-demo/page.tsx',
  'src/app/performance-monitoring/page.tsx',
  'src/app/negotiation/page.tsx',
  'src/app/mobile-gestures-demo/page.tsx',
  'src/app/marketplace/cart/page.tsx',
  'src/app/importer/procurement/page.tsx',
  'src/app/gestures-demo/page.tsx',
  'src/app/foreign-trade/company/partners/suppliers/page.tsx',
  'src/app/foreign-trade/company/partners/customers/page.tsx',
  'src/app/foreign-trade/company/partners/contracts/page.tsx',
  'src/app/cache-fix/page.tsx',
  'src/app/enterprise/after-sales/page.tsx',
  'src/app/behavior-tracking-demo/page.tsx',
  'src/app/behavior-tracking/page.tsx',
  'src/app/audit/page.tsx',
  'src/app/articles/page.tsx',
  'src/app/email-login-debug/page.tsx',
  'src/app/diagnosis/page.tsx',
  'src/app/deployment/one-click/page.tsx',
  'src/app/agents/page.tsx',
  'src/app/admin/user-manager/page.tsx',
  'src/app/admin/tutorials/page.tsx',
  'src/app/admin/system-dashboard/page.tsx',
  'src/app/admin/inbound-forecast/page.tsx',
  'src/app/admin/reviews/page.tsx',
  'src/app/admin/qrcodes/page.tsx',
  'src/app/admin/dict/faults/page.tsx',
  'src/app/admin/dict/devices/page.tsx',
  'src/app/admin/diagnostics/page.tsx',
  'src/app/admin/parts-market/page.tsx',
  'src/app/admin/device-manager/page.tsx',
  'src/app/admin/manuals/page.tsx',
  'src/app/admin/batch-qrcodes/page.tsx',
];

let fixedCount = 0;
let errorCount = 0;

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      // 修复 === 0  (  为  === 0 ? (
      if (content.includes('=== 0  (')) {
        content = content.replace(/=== 0  \(/g, '=== 0 ? (');
        modified = true;
      }
      
      // 修复 === null  (  为  === null ? (
      if (content.includes('=== null  (')) {
        content = content.replace(/=== null  \(/g, '=== null ? (');
        modified = true;
      }
      
      // 修复 === undefined  (  为  === undefined ? (
      if (content.includes('=== undefined  (')) {
        content = content.replace(/=== undefined  \(/g, '=== undefined ? (');
        modified = true;
      }
      
      // 修复 === ''  (  为  === '' ? (
      if (content.includes("=== ''  (")) {
        content = content.replace(/=== ''  \(/g, "=== '' ? (");
        modified = true;
      }
      
      // 修复 .length === 0  (  为  .length === 0 ? (
      if (content.includes('.length === 0  (')) {
        content = content.replace(/\.length === 0  \(/g, '.length === 0 ? (');
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✓ Fixed: ${filePath}`);
        fixedCount++;
      }
    }
  } catch (error) {
    console.error(`✗ Error fixing ${filePath}:`, error.message);
    errorCount++;
  }
});

console.log(`\n修复完成!`);
console.log(`成功修复: ${fixedCount} 个文件`);
console.log(`错误数量: ${errorCount} 个文件`);
