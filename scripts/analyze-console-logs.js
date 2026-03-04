const fs = require('fs');
const path = require('path');

console.log('🧹 开始分析 console.log 使用情况...\n');

let totalConsoleLogs = 0;
const filesWithConsole = [];

// 跳过测试文件和配置文件
const skipPatterns = [
  /[/\\]__tests__[/\\]/,
  /[/\\]\.spec\./,
  /[/\\]\.test\./,
  /[/\\]tests?[/\\]/,
  /\.config\./,
  /node_modules/,
  /.next/,
  /out/,
  /public/,
];

// 递归扫描文件
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);

    try {
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // 跳过特定目录
        if (['node_modules', '.next', 'out', '.git', 'backup'].includes(file)) {
          return;
        }
        scanDirectory(filePath);
      } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
        // 检查是否应该跳过
        if (skipPatterns.some(pattern => pattern.test(filePath))) {
          return;
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        let consoleCount = 0;
        const consoleLines = [];

        lines.forEach((line, index) => {
          // 查找 console.log, console.warn, console.error, console.info, console.debug
          const matches = line.match(
            /console\.(log|warn|error|info|debug|trace)\s*\(/
          );
          if (matches) {
            consoleCount++;
            consoleLines.push({
              line: index + 1,
              type: matches[1],
              content: line.trim(),
            });
          }
        });

        if (consoleCount > 0) {
          filesWithConsole.push({
            file: path.relative(path.join(__dirname, '..'), filePath),
            count: consoleCount,
            lines: consoleLines,
          });
          totalConsoleLogs += consoleCount;
        }
      }
    } catch (error) {
      // 忽略读取错误
    }
  });
}

// 扫描 src 目录
const srcDir = path.join(__dirname, '..', 'src');
scanDirectory(srcDir);

// 输出报告
console.log('===================================');
console.log('📊 Console.log 使用分析报告');
console.log('===================================\n');

console.log(`总计发现 ${totalConsoleLogs} 处 console 语句`);
console.log(`涉及 ${filesWithConsole.length} 个文件\n`);

// 按数量排序，显示最多的前 20 个文件
const topFiles = filesWithConsole
  .sort((a, b) => b.count - a.count)
  .slice(0, 20);

console.log('📌 Console.log 使用最多的文件 (Top 20):');
console.log('-----------------------------------');
topFiles.forEach(({ file, count }) => {
  console.log(`${count.toString().padStart(3)} 处 - ${file}`);
});

console.log('\n\n💡 建议处理优先级:');
console.log('-----------------------------------');
console.log('1. 高优先级：API 路由、服务层、工具函数（应完全移除）');
console.log('2. 中优先级：业务组件（保留关键错误日志）');
console.log('3. 低优先级：UI 组件、调试代码（可移除）');
console.log('4. 保留：错误监控、审计日志相关的 console.error/warn');

console.log('\n\n🔧 自动化清理建议:');
console.log('-----------------------------------');
console.log('可以使用以下 ESLint 规则自动检测:');
console.log('  "no-console": ["error", { "allow": ["warn", "error"] }]');
console.log('\n或者手动审查上述文件，将 console.log 替换为:');
console.log('  - 正式日志系统（如 winston, bunyan）');
console.log('  - 错误监控服务（如 Sentry）');
console.log('  - 直接移除不必要的调试代码');

console.log('\n===================================\n');
