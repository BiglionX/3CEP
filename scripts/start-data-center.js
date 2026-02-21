const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 启动数据中心服务...');

try {
  // 检查Docker是否运行
  try {
    execSync('docker info', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Docker未运行，请先启动Docker');
    process.exit(1);
  }

  // 创建必要的目录
  const dirs = [
    'logs/trino',
    'src/data-center/engine/trino-config/catalog'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 创建目录: ${dir}`);
    }
  });

  // 复制环境变量文件（如果不存在）
  const envExample = '.env.datacenter.example';
  const envFile = '.env.datacenter';
  
  if (!fs.existsSync(envFile) && fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envFile);
    console.log('📋 复制环境变量模板...');
    console.log('⚠️  请编辑 .env.datacenter 文件，配置正确的数据库密码');
  }

  // 启动Docker Compose服务
  console.log('🐳 启动Docker服务...');
  execSync('docker-compose -f docker-compose.datacenter.yml up -d', { stdio: 'inherit' });

  // 等待服务启动
  console.log('⏳ 等待服务启动...');
  setTimeout(() => {
    // 检查服务状态
    console.log('🔍 检查服务状态...');
    execSync('docker-compose -f docker-compose.datacenter.yml ps', { stdio: 'inherit' });

    console.log('');
    console.log('✅ 数据中心服务启动完成！');
    console.log('📊 Trino管理界面: http://localhost:8080');
    console.log('📊 Redis: localhost:6379');
    console.log('📊 数据中心API: http://localhost:3001/api/data-center');
    console.log('');
    console.log('💡 使用说明:');
    console.log('1. 确保lionfix和supabase数据库已在本地运行');
    console.log('2. 编辑 .env.datacenter 配置正确的数据库连接信息');
    console.log('3. 访问 http://localhost:3001/api/data-center?action=health 测试连接');
    console.log('');
    console.log('🔧 停止服务: npm run data-center:stop');
    console.log('🔄 重启服务: npm run data-center:restart');
  }, 10000);

} catch (error) {
  console.error('❌ 启动失败:', error.message);
  process.exit(1);
}