const fs = require('fs');
const path = require('path');

// 路径映射规则
const PATH_MAPPINGS = [
  { from: /@\/data-center\//g, to: '@/modules/data-center/' },
  { from: /@\/fcx-system\//g, to: '@/modules/fcx-alliance/' },
  { from: /@\/middleware\//g, to: '@/tech/middleware/' },
  { from: /@\/utils\//g, to: '@/tech/utils/' },
  { from: /@\/models\//g, to: '@/tech/database/models/' },
  { from: /@\/permissions\//g, to: '@/modules/common/permissions/' },
  { from: /@\/analytics\//g, to: '@/modules/data-center/analytics/' },
  { from: /@\/monitoring\//g, to: '@/tech/api/services/' },
  { from: /@\/security\//g, to: '@/tech/middleware/' },
];

let stats = { total: 0, modified: 0, replacements: 0 };

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    PATH_MAPPINGS.forEach(({ from, to }) => {
      const matches = content.match(from);
      if (matches) {
        content = content.replace(from, to);
        stats.replacements += matches.length;
      }
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.modified++;
    }
    stats.total++;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (
      stat.isDirectory() &&
      !file.startsWith('.') &&
      file !== 'node_modules'
    ) {
      walkDir(filePath);
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      processFile(filePath);
    }
  });
}

console.log('🚀 开始修复导入路径...\n');
walkDir(path.join(__dirname, '../src'));

console.log('✅ 完成!');
console.log(`📊 统计:`);
console.log(`   - 扫描文件：${stats.total}`);
console.log(`   - 修改文件：${stats.modified}`);
console.log(`   - 替换次数：${stats.replacements}`);
