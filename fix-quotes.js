const fs = require('fs');
const path = require('path');

// 遍历目录
function traverseDir(dir, callback) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        traverseDir(filePath, callback);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        callback(filePath);
      }
    });
  } catch (error) {
    // 忽略无法访问的目录
  }
}

// 修复引号问题
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let modified = false;
    let fixes = [];

    // 修复常见的引号问题
    const fixesList = [
      { pattern: /'每小时$/g, replacement: "'每小时'" },
      { pattern: /'系统管理员,$/g, replacement: "'系统管理员'," },
      { pattern: /'运营部,$/g, replacement: "'运营部'," },
      { pattern: /'管理,$/g, replacement: "'管理'," },
      { pattern: /'技术,$/g, replacement: "'技术'," },
      { pattern: /'产品,$/g, replacement: "'产品'," },
      { pattern: /'销售,$/g, replacement: "'销售'," },
      { pattern: /'市场,$/g, replacement: "'市场'," },
      { pattern: /'运营,$/g, replacement: "'运营'," },
      { pattern: /'财务,$/g, replacement: "'财务'," },
    ];

    fixesList.forEach(({ pattern, replacement }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        modified = true;
        fixes.push(`修复引号: "${matches[0]}" -> "${replacement}"`);
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${filePath}`);
      fixes.forEach(f => console.log(`   ${f}`));
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ ${filePath}: ${error.message}`);
    return false;
  }
}

// 主函数
function main() {
  const directory = 'src/app';
  console.log(`开始修复引号问题 ${directory} 目录...\n`);
  
  let checkedCount = 0;
  let fixedCount = 0;
  
  traverseDir(directory, (filePath) => {
    checkedCount++;
    if (fixFile(filePath)) {
      fixedCount++;
    }
  });
  
  console.log(`\n修复完成!`);
  console.log(`✅ 检查文件: ${checkedCount} 个`);
  console.log(`✅ 修复文件: ${fixedCount} 个`);
}

main();
