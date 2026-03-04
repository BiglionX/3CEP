/**
 * 批量修复 TypeScript 文件中的严重语法错误
 */

const fs = require('fs');
const path = require('path');

// 需要修复的文件列表
const filesToFix = [
  'src/tech/api/services/alert-aggregator.ts',
  'src/tech/api/services/api-config-service.ts',
  'src/tech/api/services/audit-service.ts',
  'src/tech/api/services/billing-engine.service.ts',
];

// 修复函数
function fixFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ 文件不存在：${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;

  // 修复各种严重的语法问题
  const fixes = [
    // 修复断裂的注释和代码混合
    [/\/\/ 检查抑制规\s*if/g, '// 检查抑制规则\n    if'],
    [/告警被抑\?/g, '告警被抑制'],

    // 修复数据库配置注释
    [/\/\/ 数据库配\s*\{/g, '// 数据库配置\n      {'],
    [/操作的密钥，/g, "操作的密钥',"],

    // 修复筛选条件
    [/\/\/ 应用筛选条\s*if/g, '// 应用筛选条件\n      if'],

    // 修复查看说明书费用
    [
      /\/\/ 查看说明书费\s*this\.rules\.set/g,
      '// 查看说明书费用\n    this.rules.set',
    ],
    [/查看说明书费\?,/g, "查看说明书费用',"],

    // 修复其他常见模式
    [/- console\.log\(.*?\)(this\.statistics)/g, '$1'],
  ];

  // 应用所有修复
  for (const [pattern, replacement] of fixes) {
    content = content.replace(pattern, replacement);
  }

  // 保存修复后的文件
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ 已修复：${filePath}`);
    return true;
  } else {
    console.log(`⚠️  无需修复：${filePath}`);
    return false;
  }
}

// 主函数
async function main() {
  console.log('🔧 开始修复 TypeScript 文件严重语法错误...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const file of filesToFix) {
    try {
      if (fixFile(file)) {
        successCount++;
      }
    } catch (error) {
      console.error(`❌ 处理 ${file} 时出错:`, error.message);
      errorCount++;
    }
  }

  console.log('\n========================================');
  console.log(`修复完成！`);
  console.log(`✅ 成功：${successCount} 个文件`);
  console.log(`❌ 失败：${errorCount} 个文件`);
  console.log('========================================');

  process.exit(errorCount > 0 ? 1 : 0);
}

main();
