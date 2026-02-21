#!/usr/bin/env node

/**
 * TypeScript模块导入问题修复验证脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 TypeScript模块导入问题诊断和修复验证');
console.log('==========================================\n');

// 1. 检查目标文件是否存在
const targetFile = path.join(__dirname, '..', 'test-tenant-api-fix.ts');
console.log(`📄 检查目标文件: ${targetFile}`);

if (!fs.existsSync(targetFile)) {
  console.log('❌ 目标文件不存在');
  process.exit(1);
}

// 2. 检查数据库类型文件
const dbTypesFile = path.join(__dirname, '..', 'src', 'lib', 'database.types.ts');
console.log(`📄 检查数据库类型文件: ${dbTypesFile}`);

if (!fs.existsSync(dbTypesFile)) {
  console.log('❌ 数据库类型文件不存在');
  process.exit(1);
}

// 3. 验证TypeScript配置
const tsConfigFile = path.join(__dirname, '..', 'tsconfig.json');
console.log(`📄 检查TypeScript配置: ${tsConfigFile}`);

if (fs.existsSync(tsConfigFile)) {
  const tsConfig = JSON.parse(fs.readFileSync(tsConfigFile, 'utf8'));
  
  console.log('⚙️  TypeScript配置检查:');
  console.log(`   baseUrl: ${tsConfig.compilerOptions.baseUrl || '未设置'}`);
  
  if (tsConfig.compilerOptions.paths) {
    console.log('   paths配置:');
    Object.keys(tsConfig.compilerOptions.paths).forEach(key => {
      console.log(`     ${key} -> ${tsConfig.compilerOptions.paths[key]}`);
    });
  } else {
    console.log('   ❌ 未找到paths配置');
  }
}

// 4. 编译测试
console.log('\n⚡ 执行TypeScript编译测试...');

const { execSync } = require('child_process');

try {
  // 使用标准tsconfig.json编译
  execSync('npx tsc --noEmit test-tenant-api-fix.ts', { stdio: 'pipe' });
  console.log('✅ 使用标准配置编译成功');
  
  // 使用测试配置编译
  if (fs.existsSync(path.join(__dirname, 'tsconfig.test.json'))) {
    execSync('npx tsc --noEmit --project tsconfig.test.json test-tenant-api-fix.ts', { stdio: 'pipe' });
    console.log('✅ 使用测试配置编译成功');
  }
  
} catch (error) {
  console.log('❌ 编译失败:');
  console.log(error.stdout?.toString() || error.message);
  process.exit(1);
}

// 5. 运行测试
console.log('\n🏃 运行测试...');
try {
  const result = execSync('node test-tenant-api-fix.ts', { encoding: 'utf8' });
  console.log('✅ 测试执行成功');
  console.log('测试输出:');
  console.log(result);
} catch (error) {
  console.log('❌ 测试执行失败:');
  console.log(error.stderr?.toString() || error.message);
}

console.log('\n🎉 诊断和修复验证完成！');
console.log('\n📋 修复建议总结:');
console.log('1. ✅ 使用相对路径导入解决当前问题');
console.log('2. 📝 考虑创建专用的测试tsconfig文件');
console.log('3. 🔧 确保IDE和编辑器正确加载tsconfig配置');
console.log('4. 🔄 定期验证TypeScript配置的有效性');