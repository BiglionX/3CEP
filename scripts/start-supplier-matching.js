#!/usr/bin/env node

/**
 * 供应商智能匹配系统快速启动脚本
 * 用于快速测试和验证系统功能
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 供应商智能匹配系统 - 快速启动');
console.log('=====================================\n');

// 检查必要文件是否存在
const requiredFiles = [
  'src/b2b-procurement-agent/models/supplier-vector.model.ts',
  'src/b2b-procurement-agent/services/vector-retrieval.service.ts',
  'src/b2b-procurement-agent/services/multi-factor-scoring.service.ts',
  'src/b2b-procurement-agent/services/supplier-matching.service.ts',
  'src/app/api/procurement/match-suppliers/route.ts',
  'scripts/test-supplier-matching.js',
];

console.log('🔍 检查系统文件...');
let allFilesExist = true;

for (const file of requiredFiles) {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} (缺失)`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.log('\n❌ 系统文件不完整，请检查安装！');
  process.exit(1);
}

console.log('\n✅ 所有系统文件检查通过！\n');

// 显示系统信息
console.log('📋 系统信息:');
console.log('  版本: 1.0.0');
console.log('  核心功能: 向量检索 + 多因子评分');
console.log('  支持数据库: Pinecone, Weaviate');
console.log('  验收标准: Top5匹配准确率≥80%\n');

// 显示快速使用方法
console.log('⚡ 快速使用:');
console.log('  1. 运行测试: npm run test:supplier-matching');
console.log('  2. 启动服务: npm run dev');
console.log(
  '  3. API测试: curl -X POST http://localhost:3001/api/procurement/match-suppliers\n'
);

// 显示API示例
console.log('📝 API调用示例:');
console.log(`
curl -X POST http://localhost:3001/api/procurement/match-suppliers \\
  -H "Content-Type: application/json" \\
  -d '{
    "procurementRequest": {
      "items": [
        {
          "productName": "高性能电容器",
          "category": "电子元件",
          "quantity": 10000,
          "unit": "个",
          "estimatedUnitPrice": 2.3
        }
      ],
      "urgency": "high"
    },
    "topK": 5
  }'
`);

console.log(
  '\n📖 详细文档请查看: docs/guides/supplier-matching-system-guide.md'
);
console.log('\n🎉 系统准备就绪！');

// 如果直接运行此脚本，则执行快速测试
if (require.main === module) {
  console.log('\n🧪 执行快速功能验证...\n');

  const { spawn } = require('child_process');

  const testProcess = spawn('node', ['scripts/test-supplier-matching.js'], {
    cwd: path.join(__dirname, '..'),
  });

  testProcess.stdout.on('data', data => {
    process.stdout.write(data);
  });

  testProcess.stderr.on('data', data => {
    process.stderr.write(data);
  });

  testProcess.on('close', code => {
    console.log(`\n🏁 验证完成，退出码: ${code}`);
    process.exit(code);
  });
}
