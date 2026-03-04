/**
 * 批量修复 TypeScript 文件中的编码问题和重复注释
 */

const fs = require('fs');
const path = require('path');

// 需要修复的文件列表
const filesToFix = [
  'src/tech/api/services/alert-aggregator.ts',
  'src/tech/api/services/api-config-service.ts',
  'src/tech/api/services/audit-service.ts',
  'src/tech/api/services/billing-engine.service.ts',
  'src/tech/api/services/confidence.service.ts',
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

  // 修复重复的 TODO 注释
  content = content.replace(
    /\/\/ TODO: 移除调试日志 - \/\/ TODO: 移除调试日志 - console\.log\(`.*?`\)\}/g,
    match => {
      // 提取 console.log 内容
      const consoleMatch = match.match(/console\.log\(`(.*?)`\)/);
      if (consoleMatch) {
        return `console.log(\`${consoleMatch[1]}\`);\n  }`;
      }
      return '}\n  }';
    }
  );

  // 修复断裂的中文字符串（连接被换行符分割的字符串）
  content = content.replace(
    /'([^']*?)向量数据库连接成\?\s*'([^']*?)向量数据库连接失\?;/g,
    `'$1向量数据库连接成功' : '$2向量数据库连接失败';`
  );

  // 修复其他常见模式
  content = content.replace(
    /\/\/ TODO: 移除调试日志 - \/\/ TODO: 移除调试日志/g,
    ''
  );

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
  console.log('🔧 开始修复 TypeScript 文件...\n');

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
