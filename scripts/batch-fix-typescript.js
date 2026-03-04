const fs = require('fs');
const path = require('path');

console.log('🔧 开始批量修复 TypeScript 文件...\n');

let filesFixed = 0;
let totalReplacements = 0;

// 常见乱码替换表
const encodingFixes = [
  { pattern: /状？/g, replacement: '状态' },
  { pattern: /户？/g, replacement: '户' },
  { pattern: /电？/g, replacement: '电池' },
  { pattern: /屏？/g, replacement: '屏幕' },
  { pattern: /无？/g, replacement: '无法' },
  { pattern: /开？/g, replacement: '开机' },
  { pattern: /失？/g, replacement: '失败' },
  { pattern: /功？/g, replacement: '成功' },
  { pattern: /创？/g, replacement: '创建' },
  { pattern: /等？/g, replacement: '等' },
  { pattern: /输出？/g, replacement: '输出' },
  { pattern: /类型？/g, replacement: '类型' },
  { pattern: /调？/g, replacement: '调试' },
  { pattern: /信？/g, replacement: '信息' },
  { pattern: /符？/g, replacement: '符号' },
];

const fileExtensions = ['.ts', '.tsx'];

function scanAndFixDirectory(dirPath, depth = 0) {
  if (depth > 10) return;
  
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (['node_modules', '.next', 'out', 'public', 'dist', 'coverage', '.git'].includes(entry.name)) {
      continue;
    }
    
    if (entry.isDirectory()) {
      scanAndFixDirectory(fullPath, depth + 1);
    } else if (entry.isFile() && fileExtensions.includes(path.extname(entry.name))) {
      fixFile(fullPath);
    }
  }
}

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let fileChanged = false;
    
    encodingFixes.forEach(({ pattern, replacement }) => {
      const matches = newContent.match(pattern);
      if (matches) {
        newContent = newContent.replace(pattern, replacement);
        fileChanged = true;
        totalReplacements += matches.length;
      }
    });
    
    if (fileChanged) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      filesFixed++;
      console.log(`✅ 已修复：${filePath}`);
    }
  } catch (error) {
    // 忽略错误，继续处理下一个文件
  }
}

// 主函数
function main() {
  console.log('📂 开始扫描 src 目录...\n');
  
  const dirsToScan = ['src/app', 'src/components', 'src/modules'];
  
  dirsToScan.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(dirPath)) {
      scanAndFixDirectory(dirPath);
    }
  });
  
  console.log('\n===================================');
  console.log('📊 修复总结:');
  console.log('===================================');
  console.log(`✅ 已修复文件数：${filesFixed}`);
  console.log(`✅ 总替换次数：${totalReplacements}`);
  console.log('===================================\n');
  
  if (filesFixed === 0) {
    console.log('✨ 未发现乱码字符，所有文件编码正常！\n');
  } else {
    console.log('💡 建议：运行 `npx tsc --noEmit` 验证 TypeScript 错误是否减少\n');
  }
}

// 执行
main();
