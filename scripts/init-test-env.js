const fs = require('fs');
const path = require('path');

console.log('🔧 初始化测试环境...');

// 创建存储状态目录
const storageDir = path.resolve('test-data/storage-states');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
  console.log('📁 创建存储状态目录');
}

// 创建空的存储状态文件
const storageFiles = [
  'admin-storage.json',
  'consumer-storage.json', 
  'engineer-storage.json',
  'shopowner-storage.json'
];

storageFiles.forEach(file => {
  const filePath = path.join(storageDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({
      cookies: [],
      origins: []
    }));
    console.log(`📄 创建存储文件: ${file}`);
  }
});

// 创建测试结果目录
const resultDirs = [
  'test-results/screenshots',
  'test-results/videos',
  'test-results/traces'
];

resultDirs.forEach(dir => {
  const fullPath = path.resolve(dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 创建结果目录: ${dir}`);
  }
});

console.log('✅ 测试环境初始化完成');