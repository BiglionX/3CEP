#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 开始项目结构迁移...\n');

// 迁移映射配置
const migrationMap = {
  // 路由迁移
  'src/app/repair-shop': 'src/modules/repair-service/app',
  'src/app/importer': 'src/modules/b2b-procurement/app/importer',
  'src/app/exporter': 'src/modules/b2b-procurement/app/exporter',
  'src/app/admin': 'src/modules/admin-panel/app',
  'src/app/login': 'src/modules/auth/app',
  'src/app/fcx': 'src/modules/fcx-alliance/app',

  // 技术组件迁移
  'src/controllers': 'src/tech/api/controllers',
  'src/models': 'src/tech/database/models',
  'src/middleware': 'src/tech/middleware',
  'src/hooks': 'src/tech/utils/hooks',
  'src/types': 'src/tech/types',

  // 服务层迁移
  'src/services': 'src/tech/api/services',
  'src/lib': 'src/tech/utils/lib',

  // 组件迁移
  'src/components': 'src/modules/common/components',
};

// 安全检查函数
function safeMove(source, target) {
  if (!fs.existsSync(source)) {
    console.log(`⚠️  源路径不存在: ${source}`);
    return false;
  }

  // 确保目标目录存在
  const targetDir = path.dirname(target);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  try {
    // 如果是目录，递归复制
    if (fs.statSync(source).isDirectory()) {
      copyDirRecursive(source, target);
    } else {
      fs.copyFileSync(source, target);
    }
    console.log(`✅ 已迁移: ${source} → ${target}`);
    return true;
  } catch (error) {
    console.error(`❌ 迁移失败: ${source}`, error.message);
    return false;
  }
}

// 递归复制目录
function copyDirRecursive(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const items = fs.readdirSync(source);
  items.forEach(item => {
    const sourcePath = path.join(source, item);
    const targetPath = path.join(target, item);

    if (fs.statSync(sourcePath).isDirectory()) {
      copyDirRecursive(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

// 执行迁移
let successCount = 0;
const totalCount = Object.keys(migrationMap).length;

console.log('📋 迁移计划:');
Object.entries(migrationMap).forEach(([source, target]) => {
  console.log(`   ${source} → ${target}`);
});

console.log('\n🔄 开始执行迁移...\n');

Object.entries(migrationMap).forEach(([source, target]) => {
  if (safeMove(source, target)) {
    successCount++;
  }
});

console.log(`\n📊 迁移完成统计:`);
console.log(`   总计: ${totalCount} 项`);
console.log(`   成功: ${successCount} 项`);
console.log(`   失败: ${totalCount - successCount} 项`);

if (successCount === totalCount) {
  console.log('\n🎉 所有迁移任务完成！');
} else {
  console.log('\n⚠️  部分迁移失败，请检查日志');
}

// 生成迁移报告
const report = {
  timestamp: new Date().toISOString(),
  migrationMap,
  results: {
    total: totalCount,
    success: successCount,
    failed: totalCount - successCount,
  },
  status: successCount === totalCount ? 'SUCCESS' : 'PARTIAL_SUCCESS',
};

fs.writeFileSync('migration-report.json', JSON.stringify(report, null, 2));

console.log('\n📝 详细报告已生成: migration-report.json');
