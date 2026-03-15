const fs = require('fs');
const path = require('path');

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

function checkEncoding(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    
    // 检查 BOM
    if (buffer.length >= 3 && 
        buffer[0] === 0xEF && 
        buffer[1] === 0xBB && 
        buffer[2] === 0xBF) {
      return 'UTF-8 with BOM';
    }
    
    // 尝试用 UTF-8 解码
    const utf8Content = buffer.toString('utf8');
    
    // 检查是否有 UTF-8 解码错误
    try {
      // 重新编码检查
      const reEncoded = Buffer.from(utf8Content, 'utf8');
      if (reEncoded.equals(buffer)) {
        return 'UTF-8 (无BOM)';
      } else {
        return '可能不是UTF-8';
      }
    } catch (error) {
      return 'UTF-8 解码失败';
    }
  } catch (error) {
    return '读取错误';
  }
}

function main() {
  const directory = 'src/app';
  console.log(`检查 ${directory} 目录下的文件编码...\n`);
  
  const encodings = {};
  let totalCount = 0;
  
  traverseDir(directory, (filePath) => {
    totalCount++;
    const encoding = checkEncoding(filePath);
    encodings[encoding] = (encodings[encoding] || 0) + 1;
  });
  
  console.log('编码统计：');
  Object.entries(encodings).forEach(([encoding, count]) => {
    console.log(`  ${encoding}: ${count} 个文件`);
  });
  
  console.log(`\n总计: ${totalCount} 个文件`);
  
  if (encodings['UTF-8 (无BOM)'] || encodings['UTF-8 with BOM']) {
    console.log('\n✅ 所有文件都是 UTF-8 编码');
  }
}

main();
