const fs = require('fs');
const path = require('path');

console.log('🔧 开始清理生产环境的 console.log...\n');

let modifiedFiles = 0;
let replacedLogs = 0;

// 需要跳过的文件和目录
const skipPatterns = [
  /[/\\]__tests__[/\\]/,
  /[/\\]\.spec\./,
  /[/\\]\.test\./,
  /[/\\]tests?[/\\]/,
  /[/\\]mocks?[/\\]/,
  /[/\\]demos?[/\\]/,
  /[/\\]examples?[/\\]/,
  /\.config\./,
  /node_modules/,
  /.next/,
  /out/,
  /public/,
  /cli\.js$/, // CLI 工具保留
  /manual-test\.ts$/, // 手动测试文件保留
];

// 保留的 console 类型（用于错误监控）
const allowedConsoleTypes = ['error', 'warn'];

// 递归处理文件
function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);

    try {
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (['node_modules', '.next', 'out', '.git', 'backup'].includes(file)) {
          return;
        }
        processDirectory(filePath);
      } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
        // 检查是否应该跳过
        if (skipPatterns.some(pattern => pattern.test(filePath))) {
          return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // 策略 1: 将 console.log/info/debug 替换为注释掉的版本
        content = content.replace(
          /console\.(log|info|debug|trace)\s*\(([^)]*)\)\s*;?/g,
          (match, type, args) => {
            // 如果是允许的類型，保留
            if (allowedConsoleTypes.includes(type)) {
              return match;
            }
            // 否则注释掉
            replacedLogs++;
            return `// TODO: 移除调试日志 - console.${type}(${args})`;
          }
        );

        // 策略 2: 对于简单的 console.log（无参数），直接删除整行
        const lines = content.split('\n');
        const filteredLines = lines.filter(line => {
          // 如果行只包含 console.log() 且没有其他代码，删除
          if (
            /^\s*\/\/\s*TODO:.*console\.(log|info|debug|trace)\s*\(\s*\)/.test(
              line
            )
          ) {
            replacedLogs++;
            return false;
          }
          return true;
        });

        content = filteredLines.join('\n');

        // 保存修改后的文件
        if (content !== originalContent) {
          fs.writeFileSync(filePath, content, 'utf8');
          modifiedFiles++;

          if (modifiedFiles <= 10) {
            // 只显示前 10 个文件的详细信息
            console.log(
              `✓ 已处理：${path.relative(path.join(__dirname, '..'), filePath)}`
            );
          }
        }
      }
    } catch (error) {
      console.error(`⚠ 处理失败 ${filePath}: ${error.message}`);
    }
  });
}

// 扫描 src 目录
const srcDir = path.join(__dirname, '..', 'src');
processDirectory(srcDir);

console.log('\n===================================');
console.log('✅ 清理完成！');
console.log('===================================\n');

if (modifiedFiles > 10) {
  console.log(`... 以及其他 ${modifiedFiles - 10} 个文件`);
}

console.log(`修改文件数：${modifiedFiles}`);
console.log(`清理日志数：${replacedLogs}`);

console.log('\n💡 后续工作:');
console.log('-----------------------------------');
console.log('1. 审查被注释掉的 console.log，确认可以安全删除');
console.log('2. 对于需要保留的日志，迁移到正式日志系统');
console.log('3. 运行测试确保功能正常');
console.log('4. 配置 ESLint 防止新的 console.log 添加\n');
