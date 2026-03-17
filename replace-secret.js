const fs = require('fs');

// 读取文件
const filePath = 'fix-encoding-api-config.js';
if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 替换敏感字符串
  const original = 'sk_test_********************************';
  const replacement = 'stripe_example_placeholder';

  if (content.includes(original)) {
    content = content.replace(new RegExp(original, 'g'), replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✓ 已替换敏感字符串');
  } else {
    console.log('✓ 文件已经是安全的');
  }
} else {
  console.log('✓ 文件不存在');
}
