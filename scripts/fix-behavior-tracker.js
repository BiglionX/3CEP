/**
 * 批量修复 behavior-tracker.ts 文件
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/analytics/behavior-tracker.ts');

let content = fs.readFileSync(filePath, 'utf8');

// 修复模式列表
const replacements = [
  // 修复重复的 TODO 注释
  {
    from: /\/\/ TODO: 移除调试日志 - \/\/ TODO: 移除调试日志 - console\.log\(\s*('[^']*')\s*\)(\r?\n\s*)return;/g,
    to: (match, p1) => `console.log(${p1});\n      return;`,
  },
  {
    from: /\/\/ TODO: 移除调试日志 - \/\/ TODO: 移除调试日志 - console\.log\(/g,
    to: 'console.log(',
  },
  // 修复损坏的类定义
  {
    from: /\/\/ 用户行为追踪器主？export class BehaviorTracker/g,
    to: '// 用户行为追踪器主类\nexport class BehaviorTracker',
  },
];

let modified = false;
replacements.forEach(({ from, to }) => {
  const newContent = content.replace(from, typeof to === 'function' ? to : to);
  if (newContent !== content) {
    modified = true;
    content = newContent;
  }
});

if (modified) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ 已修复 behavior-tracker.ts');
} else {
  console.log('ℹ️  无需修复');
}
