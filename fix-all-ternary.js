const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fixes = 0;

  // 修复三元运算符缺少 ? 的情况 - 模式1: {variable  ( -> {variable ? (
  const pattern1 = /\{(\w+)\s+\(/g;
  let match;
  while ((match = pattern1.exec(content)) !== null) {
    const fullMatch = match[0];
    const variable = match[1];
    // 只修复确实是三元运算符的情况（后面会有 :）
    const afterMatch = content.slice(match.index);
    const hasColonAfter = afterMatch.includes(':') &&
                         afterMatch.indexOf(':') < afterMatch.indexOf('}') &&
                         afterMatch.indexOf('}') > 0;
    if (hasColonAfter) {
      const replacement = fullMatch.replace(/\{(\w+)\s+\(/, '{$1 ? (');
      content = content.slice(0, match.index) + replacement + content.slice(match.index + fullMatch.length);
      fixes++;
    }
  }

  // 修复三元运算符缺少 ? 的情况 - 模式2: {variable  'text' : 'text'} -> {variable ? 'text' : 'text'}
  content = content.replace(/\{(\w+)\s+'([^']+)'\s*:\s*'([^']+)'\}/g, '{$1 ? \'$2\' : \'$3\'}');
  content = content.replace(/\{(\w+)\s+"([^"]+)"\s*:\s*"([^"]+)"/g, '{$1 ? "$2" : "$3"}');

  if (fixes > 0 || content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ 已修复 ${fixes} 处:`, path.relative(process.cwd(), filePath));
    return true;
  }
  return false;
}

// 需要修复的文件列表
const filesToFix = [
  'src/app/api-interceptor-demo/page.tsx',
  'src/app/tenant-demo/page.tsx',
  'src/app/scan/[id]/page.tsx',
  'src/app/scan/page.tsx',
  'src/app/repair-shop/work-orders-paginated/page.tsx',
  'src/app/repair-shop/work-orders/page.tsx',
  'src/app/repair-shop/work-orders/new/page.tsx',
  'src/app/repair-shop/pagination-test/page.tsx',
  'src/app/repair-shop/loading-demo/page.tsx',
  'src/app/repair-shop/diagnostics/page.tsx',
  'src/app/register/page.tsx',
  'src/app/quotation/page.tsx',
  'src/app/profile/security/page.tsx',
  'src/app/profile/layout.tsx',
  'src/app/procurement-intelligence/page.tsx',
  'src/app/performance-testing-demo/page.tsx',
  'src/app/performance-monitoring/page.tsx',
  'src/app/moderation/manual/page.tsx',
  'src/app/maintenance/page.tsx',
  'src/app/login-optimization-test/page.tsx',
  'src/app/landing/components/Testimonial.tsx',
  'src/app/importer/logistics/page.tsx',
  'src/app/enterprise/procurement/page.tsx',
  'src/app/enterprise/forgot-password/page.tsx',
  'src/app/enterprise/agents/customize/page.tsx',
  'src/app/enterprise/after-sales/page.tsx',
  'src/app/enterprise/admin/auth/page.tsx',
  'src/app/enhanced-rbac-demo/page.tsx',
  'src/app/device/scan/[qrcodeId]/page.tsx',
  'src/app/deployment/one-click/page.tsx',
  'src/app/data-center/settings/page.tsx',
  'src/app/data-center/query/page.tsx',
  'src/app/crowdfunding/[id]/page.tsx',
  'src/app/crowdfunding/create/page.tsx',
  'src/app/contact/page.tsx',
  'src/app/bypass-middleware-test/page.tsx',
  'src/app/brand/profile/page.tsx',
  'src/app/admin/user-manager/page.tsx',
  'src/app/admin/inventory/page.tsx',
  'src/app/admin/inbound-forecast/page.tsx',
  'src/app/admin/finance/page.tsx',
  'src/app/admin/shops/pending/page.tsx',
  'src/app/admin/shops/page.tsx',
  'src/app/admin/diagnostics/page.tsx',
  'src/app/admin/procurement/page.tsx',
  'src/app/admin-access-test/page.tsx'
];

console.log('开始批量修复三元运算符错误...\n');

let fixedCount = 0;
filesToFix.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    if (fixFile(fullPath)) {
      fixedCount++;
    }
  } else {
    console.log('⚠️  文件不存在:', file);
  }
});

console.log(`\n批量修复完成！共修复 ${fixedCount} 个文件`);
