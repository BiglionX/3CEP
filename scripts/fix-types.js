const fs = require('fs');
const path = require('path');

console.log('🔧 开始修复 TypeScript 语法错误...\n');

let filesFixed = 0;
let totalErrors = 0;

// 需要修复的文件列表
const filesToFix = [
  'src/components/auth/UnifiedLogin.tsx',
  'src/components/admin/ConfigManager.tsx',
  'src/lib/image-optimizer.ts',
  'src/components/TenantSwitcher.tsx',
  'src/components/forms/PurchaseOrderForm.tsx',
  'src/components/fcx/FcxEquityCenter.tsx',
  'src/components/enhanced-rbac/PermissionManagementPanel.tsx',
  'src/lib/isolated-auth-service.ts',
  'src/components/notifications/notification-system.tsx',
  'src/components/MLPredictionDashboard.tsx',
  'src/components/admin/CreateInboundForecastForm.tsx',
  'src/components/admin/ApiConfigManager.tsx',
  'src/components/tutorial/StepByStepTutorial.tsx',
  'src/components/enhanced-error-boundary.tsx',
  'src/components/crowdfunding/UpgradeRecommendationList.tsx',
  'src/lib/unified-auth.ts',
  'src/lib/image-static-optimizer.ts',
  'src/lib/edge-cache-strategy.ts',
  'src/middleware.backup.ts',
  'src/middleware/api-cache-middleware.ts',
  'src/tech/api/services/crowdfunding/reward-service.ts',
  'src/tech/api/services/device-lifecycle.service.ts',
  'src/tech/api/services/token-service.ts',
  'src/tech/utils/hooks/use-auth.ts',
  'src/utils/performance-testing.ts',
];

// 正则表达式模式
const patterns = [
  // 模式 1: (param: any: Type) -> (param: Type)
  { regex: /(\w+):\s*any:\s*(\w+(?:<[^>]+>)?)/g, replacement: '$1: $2' },

  // 模式 2: async (param: any: Type) -> async (param: Type)
  {
    regex: /async\s+\((\w+):\s*any:\s*(\w+(?:<[^>]+>)?)\)/g,
    replacement: 'async ($1: $2)',
  },

  // 模式 3: map(async (item: any: Type) -> map(async (item: Type)
  {
    regex: /map\(async\s+(\w+):\s*any:\s*(\w+(?:<[^>]+>)?)\)/g,
    replacement: 'map(async $1: $2)',
  },

  // 模式 4: 可选链重复 ??. -> ?.
  { regex: /\?\?\./g, replacement: '?.' },
];

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, '..', file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠ 文件不存在：${file}`);
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let fileChanged = false;

    patterns.forEach(({ regex, replacement }) => {
      const matches = newContent.match(regex);
      if (matches) {
        newContent = newContent.replace(regex, replacement);
        fileChanged = true;
        totalErrors += matches.length;
      }
    });

    if (fileChanged) {
      // 备份原文件
      const backupPath = `${filePath}.backup-fix`;
      fs.writeFileSync(backupPath, content, 'utf8');

      // 写入修复后的内容
      fs.writeFileSync(filePath, newContent, 'utf8');

      console.log(`✓ 已修复：${file} (${totalErrors} 处)`);
      filesFixed++;
    } else {
      console.log(`⚠ 无需修复：${file}`);
    }
  } catch (error) {
    console.error(`✗ 处理失败 ${file}: ${error.message}`);
  }
});

console.log('\n===================================');
console.log('✅ 修复完成！');
console.log(`已修复文件数：${filesFixed}`);
console.log(`总计修复错误：${totalErrors}`);
console.log('===================================\n');
