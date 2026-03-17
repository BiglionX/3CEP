const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/app/enterprise/admin/fxc/page.tsx',
  'src/app/enterprise/admin/procurement/page.tsx',
  'src/app/enterprise/admin/documents/page.tsx',
  'src/app/enterprise/admin/analytics/page.tsx',
  'src/app/enterprise/admin/team/page.tsx',
  'src/app/enterprise/admin/settings/page.tsx',
  'src/app/enterprise/admin/crowdfunding/page.tsx',
  'src/app/enterprise/admin/reward-qa/page.tsx',
  'src/app/enterprise/after-sales/page.tsx',
  'src/app/enterprise/admin/devices/page.tsx',
];

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`文件不存在: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // 检查是否已经有 QrCode
  if (content.includes('QrCode')) {
    console.log(`✓ ${filePath} - 已包含 QrCode`);
    return;
  }

  // 添加 QrCode 到 import 语句
  const importPattern = /from 'lucide-react';/;
  if (importPattern.test(content)) {
    content = content.replace(
      /from 'lucide-react';/,
      "from 'lucide-react';\n  QrCode,"
    );
  } else {
    console.log(`  ${filePath} - 未找到 lucide-react 导入`);
    return;
  }

  // 添加菜单项
  const menuPattern =
    /\{ name: '数据分析', href: '\/enterprise\/admin\/analytics', icon: TrendingUp \},/;
  if (menuPattern.test(content)) {
    content = content.replace(
      menuPattern,
      "{ name: '数据分析', href: '/enterprise/admin/analytics', icon: TrendingUp },\n    { name: '二维码溯源', href: '/enterprise/admin/traceability', icon: QrCode },"
    );
  } else {
    console.log(`  ${filePath} - 未找到数据分析菜单项`);
    return;
  }

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✓ ${filePath} - 已更新`);
});

console.log('\n更新完成！');
