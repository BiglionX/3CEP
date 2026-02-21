#!/usr/bin/env node

// 二维码数据库迁移执行脚本
const fs = require('fs');

console.log('🗄️  二维码生成服务数据库迁移准备...\n');

// 读取迁移文件
const migrationFile = 'supabase/migrations/018_create_qrcode_system.sql';
try {
  const migrationSql = fs.readFileSync(migrationFile, 'utf8');
  console.log('✅ 成功读取迁移文件');
  
  console.log('\n📋 迁移文件内容预览:');
  const lines = migrationSql.split('\n');
  const previewLines = lines.slice(0, 20); // 显示前20行
  
  previewLines.forEach((line, index) => {
    if (line.trim()) {
      console.log(`   ${index + 1}: ${line}`);
    }
  });
  
  if (lines.length > 20) {
    console.log(`   ... (还有 ${lines.length - 20} 行)`);
  }
  
  console.log('\n🔧 执行迁移步骤:');
  console.log('1. 登录到 Supabase 控制台');
  console.log('2. 进入 SQL Editor');
  console.log('3. 复制以下文件的全部内容:');
  console.log(`   ${migrationFile}`);
  console.log('4. 在 SQL Editor 中粘贴并执行');
  console.log('5. 确认执行成功，无错误信息');
  
  console.log('\n📋 迁移将创建的表:');
  console.log('   • product_qrcodes - 产品二维码主表');
  console.log('   • qr_generation_logs - 生成日志表');
  console.log('   • qr_scan_statistics - 扫描统计表');
  
  console.log('\n📋 迁移将创建的索引:');
  console.log('   • product_qrcodes上的多个查询索引');
  console.log('   • 触发器函数用于自动更新时间戳');
  console.log('   • RLS策略用于数据安全');
  
  console.log('\n📋 验证迁移成功的方法:');
  console.log('1. 在 Supabase Table Editor 中查看新表是否创建');
  console.log('2. 检查表结构是否正确');
  console.log('3. 确认索引和触发器是否存在');
  
} catch (error) {
  console.error('❌ 读取迁移文件失败:', error.message);
  process.exit(1);
}

console.log('\n💡 提示: 迁移执行后，请运行集成测试验证功能');