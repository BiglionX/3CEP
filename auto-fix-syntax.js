const fs = require('fs');
const path = require('path');

// 查找并修复常见的语法错误模式
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 修复模式 1: 缺失三元运算符的 ?
  // 匹配：{condition  'value' : 'other'}
  content = content.replace(
    /(\w+\s*===\s*\w+\s+)\n?\s*(['"`][^'"`]*['"`])\s*\n?\s*:/g,
    '$1 ? $2 :'
  );

  // 修复模式 2: files.[0] -> files[0]
  content = content.replace(/\.files\.\[/g, '.files[');

  // 修复模式 3: 未闭合的字符串 - 尝试修复常见的中文标识符
  content = content.replace(/'([^']{1,5})，/g, "'$1',");

  // 修复模式 4: 损坏的 HTML 标签
  content = content.replace(
    /<option value="([^"]+)"[^>]*>([^<]*)<\/option>/g,
    '<option value="$1">$2</option>'
  );

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed: ${filePath}`);
    return true;
  }

  return false;
}

// 扫描 src/app/admin 目录下的所有 tsx 文件
const scanDir = dir => {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !file.startsWith('.') &&
      !file.includes('node_modules')
    ) {
      scanDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      try {
        fixFile(filePath);
      } catch (error) {
        console.error(`✗ Error processing ${filePath}:`, error.message);
      }
    }
  });
};

console.log('Starting automatic syntax fix...\n');
scanDir(path.join(__dirname, 'src/app/admin'));
console.log('\nDone!');
