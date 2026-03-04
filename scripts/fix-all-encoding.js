/**
 * 批量修复 TypeScript 文件中的编码问题
 */

const fs = require('fs');
const path = require('path');

// 需要修复的文件列表
const filesToFix = [
  'src/tech/api/services/api-config-service.ts',
  'src/tech/api/services/audit-service.ts',
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

  // 修复各种编码损坏的中文字符
  const fixes = [
    // 修复"成功"被损坏为"成？"
    [/连接成\?/g, '连接成功'],
    [/连接失\?/g, '连接失败'],
    [/功能待实\?/g, '功能待实现'],
    [/简单验\?/g, '简单验证'],
    [/数据库配\?/g, '数据库配置'],
    [/操作的密\?/g, '操作的密钥'],
    [/连接信\?/g, '连接信息'],
    [/测试功能待实\?/g, '测试功能待实现'],

    // 修复断裂的注释和代码
    [/\/\/ 简单验\?\s*\}/g, '// 简单验证\n    }'],
    [
      /return connectionString\.includes\('postgresql:\/\/'\);\s*\}/g,
      "return connectionString.includes('postgresql://'); // 简单验证\n    }",
    ],
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
  console.log('🔧 开始修复 TypeScript 文件编码问题...\n');

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
