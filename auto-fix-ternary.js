const fs = require('fs');
const path = require('path');

// 需要修复的文件列表
const filesToFix = [
  'src/app/foreign-trade/company/logistics/shipping/page.tsx',
  'src/app/foreign-trade/company/orders/tracking/page.tsx',
  'src/app/foreign-trade/company/logistics/tracking/page.tsx',
  'src/app/foreign-trade/company/logistics/warehouse/page.tsx',
];

console.log('开始修复三元运算符问题...\n');

filesToFix.forEach((filePath, index) => {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  文件不存在: ${filePath}`);
    return;
  }

  console.log(`[${index + 1}/${filesToFix.length}] 修复: ${filePath}`);

  try {
    let content = fs.readFileSync(fullPath, 'utf8');

    // 修复三元运算符模式: condition  value : other -> condition ? value : other
    // 需要小心匹配，避免误修复合法的代码

    let fixCount = 0;

    // 模式1: condition后直接跟字符串（不带空格）
    content = content.replace(
      /([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*(?:\([^)]*\))?)\s*('[^']*'|"[^"]*")\s*:/g,
      (match, condition, value) => {
        fixCount++;
        return `${condition} ? ${value} :`;
      }
    );

    // 模式2: condition后直接跟变量名
    content = content.replace(
      /([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*(?:\([^)]*\))?)\s+([a-zA-Z0-9_]+)\s*:/g,
      (match, condition, value) => {
        // 避免修复合法的 JSX 标签，如 <div> 或 </div>
        if (value === 'div' || value === 'nav' || value === 'Card' || value.startsWith('<')) {
          return match;
        }
        fixCount++;
        return `${condition} ? ${value} :`;
      }
    );

    if (fixCount > 0) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`   ✅ 修复了 ${fixCount} 处问题`);
    } else {
      console.log(`   ℹ️  没有发现需要修复的问题`);
    }
  } catch (error) {
    console.error(`   ❌ 修复失败: ${error.message}`);
  }
});

console.log('\n修复完成！');
console.log('\n请运行以下命令检查修复结果：');
console.log('  npx eslint src/app/foreign-trade/');
console.log('\n然后手动提交修复的文件：');
console.log('  git add src/app/foreign-trade/');
console.log('  git commit -m "fix: 修复 foreign-trade 模块的三元运算符问题"');
