const fs = require('fs');
const path = require('path');

// 测试数据中心基础架构
async function testDataCenterInfrastructure() {
  console.log('🧪 测试数据中心基础架构...\n');

  // 1. 检查目录结构
  console.log('📁 检查目录结构:');
  const requiredDirs = [
    'src/data-center',
    'src/data-center/core',
    'src/data-center/engine',
    'src/data-center/engine/trino-config',
    'src/data-center/engine/trino-config/catalog',
    'logs/trino',
  ];

  let allDirsExist = true;
  requiredDirs.forEach(dir => {
    const exists = fs.existsSync(dir);
    console.log(`  ${exists ? '✅' : '❌'} ${dir}`);
    if (!exists) allDirsExist = false;
  });

  // 2. 检查配置文件
  console.log('\n📄 检查配置文件:');
  const configFiles = [
    'docker-compose.datacenter.yml',
    'src/data-center/engine/trino-config/node.properties',
    'src/data-center/engine/trino-config/config.properties',
    'src/data-center/engine/trino-config/catalog/lionfix.properties',
    'src/data-center/engine/trino-config/catalog/fixcycle.properties',
    'src/data-center/core/data-center-service.ts',
    'src/app/api/data-center/route.ts',
  ];

  let allFilesExist = true;
  configFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
  });

  // 3. 检查环境变量模板
  console.log('\n⚙️ 检查环境配置:');
  const envTemplateExists = fs.existsSync('.env.datacenter.example');
  console.log(`  ${envTemplateExists ? '✅' : '❌'} .env.datacenter.example`);

  const envFileExists = fs.existsSync('.env.datacenter');
  console.log(`  ${envFileExists ? '✅' : '⭕'} .env.datacenter (需要配置)`);

  // 4. 检查package.json脚本
  console.log('\n📦 检查npm脚本:');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = [
    'data-center:start',
    'data-center:stop',
    'data-center:restart',
    'data-center:logs',
    'data-center:status',
  ];

  requiredScripts.forEach(script => {
    const exists = !!packageJson.scripts[script];
    console.log(`  ${exists ? '✅' : '❌'} ${script}`);
  });

  // 5. 总结
  console.log('\n📊 测试总结:');
  console.log(`  目录结构: ${allDirsExist ? '✅ 完整' : '❌ 不完整'}`);
  console.log(`  配置文件: ${allFilesExist ? '✅ 完整' : '❌ 不完整'}`);
  console.log(
    `  环境配置: ${envTemplateExists ? '✅ 模板存在' : '❌ 缺少模板'}`
  );

  const overallSuccess = allDirsExist && allFilesExist && envTemplateExists;
  console.log(
    `\n🎯 第一阶段基础设施搭建: ${overallSuccess ? '✅ 成功' : '❌ 需要修正'}`
  );

  if (!overallSuccess) {
    console.log('\n🔧 建议修正项:');
    if (!allDirsExist) console.log('  - 运行脚本创建缺失的目录');
    if (!allFilesExist) console.log('  - 检查配置文件是否正确创建');
    if (!envTemplateExists) console.log('  - 创建环境变量模板文件');
  }

  return overallSuccess;
}

// 执行测试
testDataCenterInfrastructure().catch(console.error);
