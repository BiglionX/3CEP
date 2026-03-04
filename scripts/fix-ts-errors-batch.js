#!/usr/bin/env node

/**
 * 批量 TypeScript 错误修复脚本 v2.0
 * 针对项目中常见的语法错误进行批量修复
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 开始批量修复 TypeScript 错误...\n');

let totalFixes = 0;

// 需要修复的文件模式
const filesToProcess = [
  'src/utils/performance-optimizer.ts',
  'src/tech/utils/lib/warehouse/wms-shipment.service.ts',
  'src/app/api/admin/system/monitoring/alerts/route.ts',
];

// 常见错误模式和修复方案
const fixPatterns = [
  {
    // 修复损坏的中文字符串
    pattern: /成？/g,
    replacement: '成功',
  },
  {
    // 修复损坏的中文字符串
    pattern: /请？/g,
    replacement: '请求',
  },
  {
    // 修复损坏的中文字符串
    pattern: /资源？/g,
    replacement: '资源',
  },
  {
    // 修复损坏的中文字符串
    pattern: /微调？/g,
    replacement: '微调',
  },
  {
    // 修复损坏的中文字符串
    pattern: /调？/g,
    replacement: '调整',
  },
  {
    // 修复损坏的中文字符串
    pattern: /数据？/g,
    replacement: '数据',
  },
  {
    // 修复损坏的中文字符串
    pattern: /缓存？/g,
    replacement: '缓存',
  },
  {
    // 修复损坏的中文字符串
    pattern: /计？/g,
    replacement: '计算',
  },
  {
    // 修复未终止的字符串（单行）
    pattern: /push\('([^']+)?\);$/gm,
    replacement: match => {
      if (!match.includes("')")) {
        return match.replace(/\);$/, "');");
      }
      return match;
    },
  },
  {
    // 修复注释中的 TODO 标记重复
    pattern: /\/\/ TODO: 移除调试日志 - \/\/ TODO: 移除调试日志 - /g,
    replacement: '// ',
  },
  {
    // 清理损坏的注释（特殊字符）
    pattern: /[\uFFFD\u0080-\u009F]/g,
    replacement: '',
  },
  {
    // 修复类型注解错误 any: -> (value:
    pattern: /\bany:\s*\(/g,
    replacement: '(value: ',
  },
];

// 处理单个文件
function processFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  文件不存在：${filePath}`);
    return 0;
  }

  console.log(`📄 处理文件：${filePath}`);

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  let fileFixes = 0;

  // 应用所有修复模式
  fixPatterns.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      const count = matches.length;
      content = content.replace(pattern, replacement);
      fileFixes += count;
      if (count > 0) {
        console.log(`   ✅ 修复模式 "${pattern}": ${count} 处`);
      }
    }
  });

  // 如果内容有变化，保存文件
  if (content !== originalContent) {
    // 创建备份
    const backupPath = `${fullPath}.bak`;
    fs.writeFileSync(backupPath, originalContent);

    // 保存修复后的内容
    fs.writeFileSync(fullPath, content);
    console.log(`   💾 已保存修复（备份：${path.basename(backupPath)}）\n`);
    totalFixes += fileFixes;
  } else {
    console.log(`   ✓ 无需修复\n`);
  }

  return fileFixes;
}

// 主函数
function main() {
  console.log('📋 待处理文件列表:');
  filesToProcess.forEach(file => console.log(`   - ${file}`));
  console.log('\n');

  // 处理每个文件
  filesToProcess.forEach(processFile);

  console.log('='.repeat(60));
  console.log(`📊 修复完成统计:`);
  console.log(`✅ 共修复：${totalFixes} 处`);
  console.log(`📁 处理文件：${filesToProcess.length} 个`);
  console.log('='.repeat(60));

  console.log('\n🧪 建议验证命令:');
  console.log('   npx tsc --noEmit  # 验证 TypeScript 编译');
  console.log('   npm run lint     # 验证代码规范\n');
}

// 运行主函数
main();
