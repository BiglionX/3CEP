const fs = require('fs');
const path = require('path');

console.log('🔍 开始验证模块导入...');

// 检查文件是否存在
const cardPath = path.join(__dirname, '../src/components/ui/card.tsx');
console.log(`📄 检查文件: ${cardPath}`);

if (fs.existsSync(cardPath)) {
  console.log('✅ card.tsx 文件存在');
  
  // 读取文件内容
  const content = fs.readFileSync(cardPath, 'utf8');
  console.log('📋 文件导出内容:');
  
  // 提取导出的组件名称
  const exportMatches = content.match(/export\s+{\s*([^}]+)\s*}/);
  if (exportMatches) {
    const exports = exportMatches[1].split(',').map(e => e.trim());
    console.log('   导出组件:', exports);
  }
} else {
  console.log('❌ card.tsx 文件不存在');
}

// 验证 tsconfig.json 配置
const tsConfigPath = path.join(__dirname, '../tsconfig.json');
if (fs.existsSync(tsConfigPath)) {
  const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
  console.log('\n⚙️  TypeScript 配置检查:');
  console.log('   baseUrl:', tsConfig.compilerOptions.baseUrl || '未设置');
  console.log('   paths:', tsConfig.compilerOptions.paths || '未设置');
  
  if (tsConfig.compilerOptions.paths && tsConfig.compilerOptions.paths['@/*']) {
    console.log('✅ 路径映射 @/* 已正确配置');
  } else {
    console.log('❌ 路径映射 @/* 未配置');
  }
}

console.log('\n✅ 验证完成！');