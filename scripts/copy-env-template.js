#!/usr/bin/env node

/**
 * 复制环境变量模板脚本
 * 快速生成 .env 文件
 */

const fs = require('fs');
const path = require('path');

const envExamplePath = path.join(__dirname, '..', '.env.example');
const envPath = path.join(__dirname, '..', '.env');

console.log('📋 环境模板复制工具\n');

// 检查示例文件是否存在
if (!fs.existsSync(envExamplePath)) {
  console.error('❌ 错误: .env.example 文件不存在');
  process.exit(1);
}

// 检查是否已有 .env 文件
if (fs.existsSync(envPath)) {
  console.log('⚠️  警告: .env 文件已存在');
  console.log('   如果继续将覆盖现有文件');

  // 简单确认（实际项目中可能需要更复杂的交互）
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('是否覆盖现有 .env 文件? (y/N): ', answer => {
    if (answer.toLowerCase() === 'y') {
      copyTemplate();
    } else {
      console.log('❌ 操作已取消');
      rl.close();
      process.exit(0);
    }
    rl.close();
  });
} else {
  copyTemplate();
}

function copyTemplate() {
  try {
    // 复制文件
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ 成功: .env 文件已创建');
    console.log('📝 请编辑 .env 文件，填入实际的配置值');
    console.log('\n🔑 重要的配置项:');
    console.log('  - NEXT_PUBLIC_SUPABASE_URL');
    console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('  - SUPABASE_SERVICE_ROLE_KEY');
    console.log('  - DATABASE_URL');
    console.log('\n💡 获取这些值的方法:');
    console.log('  访问 https://app.supabase.com/project/_/settings/api');
  } catch (error) {
    console.error('❌ 复制失败:', error.message);
    process.exit(1);
  }
}
