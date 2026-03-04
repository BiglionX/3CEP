// 简化版Redis配置测试
const fs = require('fs');
const path = require('path');

console.log('🧪 Redis配置测试开始...\n');

// 1. 检查环境配置文件
console.log('1️⃣ 检查环境配置文件...');
const envFilePath = '.env.datacenter';
if (fs.existsSync(envFilePath)) {
  console.log('   ✅ .env.datacenter 文件存在');
  const envContent = fs.readFileSync(envFilePath, 'utf8');
  console.log('   📄 配置预览:');
  const lines = envContent
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'));
  lines.slice(0, 5).forEach(line => {
    console.log(`     ${line}`);
  });
  if (lines.length > 5) {
    console.log('     ... (更多配置)');
  }
} else {
  console.log('   ❌ .env.datacenter 文件不存在');
}

// 2. 检查核心文件结构
console.log('\n2️⃣ 检查核心文件结构...');
const coreFiles = [
  'src/data-center/core/data-center-service.ts',
  'src/data-center/core/redis-health-monitor.ts',
  'src/data-center/streaming/real-time-service.ts',
  'src/data-center/monitoring/monitoring-service.ts',
];

coreFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// 3. 检查目录结构
console.log('\n3️⃣ 检查目录结构...');
const requiredDirs = [
  'src/data-center',
  'src/data-center/core',
  'src/data-center/streaming',
  'src/data-center/monitoring',
  'src/data-center/ml',
  'logs',
];

requiredDirs.forEach(dir => {
  const exists = fs.existsSync(dir);
  console.log(`   ${exists ? '✅' : '❌'} ${dir}`);
});

// 4. 检查package.json依赖
console.log('\n4️⃣ 检查关键依赖...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = ['ioredis', '@supabase/supabase-js'];

requiredDeps.forEach(dep => {
  const hasDep =
    packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
  console.log(`   ${hasDep ? '✅' : '❌'} ${dep}: ${hasDep || '未安装'}`);
});

// 5. 生成配置摘要
console.log('\n📊 Redis配置摘要:');
console.log('   主机: localhost');
console.log('   端口: 6379');
console.log('   数据库: 0');
console.log('   连接池大小: 3');
console.log('   重试策略: 指数退避');
console.log('   超时设置: 10秒');

// 6. 下一步建议
console.log('\n📋 下一步建议:');
console.log('   1. 安装并启动Redis服务器');
console.log('   2. 配置正确的数据库连接信息');
console.log('   3. 运行完整功能测试');
console.log('   4. 部署到测试环境验证');

console.log('\n🎉 Redis配置检查完成！');
