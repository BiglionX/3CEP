const fs = require('fs');
const path = require('path');

console.log('🧹 开始清理临时文件和备份文件...\n');

let deletedFiles = 0;
let skippedFiles = 0;

// 定义要删除的文件模式
const patternsToDelete = [
  /\.backup$/, // .backup 结尾
  /\.backup-\d+$/, // .backup-123456 结尾
  /\.backup\.\d+$/, // .backup.1234567890 结尾
  /\.ts-fix-backup$/, // .ts-fix-backup 结尾
  /\.old$/, // .old 结尾
  /\.tmp$/, // .tmp 结尾
  /\.bak$/, // .bak 结尾
];

// 需要保留的关键备份文件（相对路径）
const filesToKeep = [
  'src/middleware.backup.ts', // 这是中间件备份，可能需要
];

// 递归查找并删除文件
function scanAndDelete(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);

    try {
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // 跳过 node_modules、.next、out 等目录
        if (['node_modules', '.next', 'out', '.git'].includes(file)) {
          return;
        }
        scanAndDelete(filePath);
      } else {
        // 检查是否需要删除
        const shouldDelete = patternsToDelete.some(pattern =>
          pattern.test(file)
        );

        const isProtected = filesToKeep.some(keep =>
          filePath.replace(/\\/g, '/').endsWith(keep.replace(/\\/g, '/'))
        );

        if (shouldDelete && !isProtected) {
          fs.unlinkSync(filePath);
          console.log(`✓ 已删除：${filePath}`);
          deletedFiles++;
        }
      }
    } catch (error) {
      console.error(`⚠ 处理失败 ${filePath}: ${error.message}`);
      skippedFiles++;
    }
  });
}

// 扫描项目根目录
const rootDir = path.join(__dirname, '..');
scanAndDelete(rootDir);

console.log('\n===================================');
console.log('✅ 清理完成！');
console.log(`已删除文件：${deletedFiles}`);
console.log(`跳过文件：${skippedFiles}`);
console.log('===================================\n');

if (deletedFiles > 0) {
  console.log('💡 提示：已删除的文件包括临时备份和缓存文件');
  console.log('   如有需要可以从 Git 历史恢复\n');
}
