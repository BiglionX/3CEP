/**
 * 批量修复损坏的中文字符脚本
 */

const fs = require('fs');
const path = require('path');

// 需要修复的文件
const filesToFix = [
  'src/agents-orchestrator/__tests__/reliability.test.ts',
  'src/agents-orchestrator/orchestrator.ts',
];

// 替换规则
const replacements = [
  { from: /可重试错误时触发重？/g, to: '可重试错误时触发重试？' },
  { from: /不重/g, to: '不重' },
  { from: /最大重试次数限？/g, to: '最大重试次数限制？' },
  { from: /初/g, to: '初' },
  { from: /次重/g, to: '次重' },
  { from: /幂等性测？/g, to: '幂等性测试？' },
  { from: /相同幂等键应该只处理一？/g, to: '相同幂等键应该只处理一次？' },
  { from: /模拟的成功响？/g, to: '模拟的成功响应？' },
  { from: /30% 失败？/g, to: '30% 失败？' },
  {
    from: /模拟偶尔的失败情况用于测试重？/g,
    to: '模拟偶尔的失败情况用于测试重试？',
  },
];

filesToFix.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  文件不存在：${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  replacements.forEach(({ from, to }) => {
    const newContent = content.replace(from, to);
    if (newContent !== content) {
      modified = true;
      content = newContent;
    }
  });

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ 已修复：${filePath}`);
  } else {
    console.log(`ℹ️  无需修复：${filePath}`);
  }
});

console.log('\n✨ 批量修复完成！');
