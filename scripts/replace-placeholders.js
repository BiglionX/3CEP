#!/usr/bin/env node

/**
 * 配置文件占位符替换工具
 * 批量替换 .env.dev、.env.stage、.env.prod 中的占位符
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 FixCycle 配置文件占位符替换工具\n');
console.log('=====================================\n');

// 配置项 - 使用实际的 Supabase 配置
const CONFIG = {
  supabaseUrl: 'https://hrjqzbhqueleszkvnsen.supabase.co',
  supabaseAnonKey: 'sb_publishable_5e-tqlrRNyKW3fAmWJipIQ_1-fjS711',
  // 注意：Service Role Key 需要用户手动替换，这里保留占位符提示
  supabaseServiceRoleKey: 'your_service_role_key_here',

  // 数据库密码占位符（需要用户手动替换）
  dbPassword: '[YOUR-PASSWORD]',

  // 应用配置
  siteUrl: 'http://localhost:3001',
  appName: 'FixCycle',

  // Stripe 测试密钥（开发环境可用）
  stripePublishableKey: 'pk_test_your_publishable_key_here',
  stripeSecretKey: 'sk_test_your_secret_key_here',
  stripeWebhookSecret: 'whsec_your_webhook_secret',

  // AI API 密钥（需要用户手动替换）
  deepseekApiKey: 'sk-your-api-key-here',
  qwenApiKey: 'sk-your-qwen-api-key-here',

  // Pinecone 配置（需要用户手动替换）
  pineconeApiKey: 'your_pinecone_api_key_here',
  pineconeEnvironment: 'your_pinecone_environment_here',
  pineconeIndexName: 'supplier-match-index',

  // Weaviate 配置（需要用户手动替换）
  weaviateHost: 'your_weaviate_host_here',
  weaviateApiKey: 'your_weaviate_api_key_here',

  // n8n 配置
  n8nUrl: 'http://localhost:5678',

  // JWT 配置
  jwtSecret: 'your-super-secret-jwt-key-here-change-in-production',
};

// 要处理的配置文件
const ENV_FILES = [
  { path: '.env.dev', name: '开发环境' },
  { path: '.env.stage', name: '预发布环境' },
  { path: '.env.prod', name: '生产环境' },
];

/**
 * 替换文件中的占位符
 */
function replacePlaceholders(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  文件不存在：${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let replacedCount = 0;

  Object.entries(replacements).forEach(([placeholder, value]) => {
    const regex = new RegExp(
      placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      'g'
    );
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, value);
      replacedCount += matches.length;
      console.log(`   ✅ 替换 ${placeholder} → ${value.substring(0, 30)}...`);
    }
  });

  if (replacedCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${filePath} - 替换了 ${replacedCount} 个占位符\n`);
    return true;
  } else {
    console.log(`ℹ️  ${filePath} - 无需替换\n`);
    return false;
  }
}

/**
 * 检查文件中剩余的占位符
 */
function checkRemainingPlaceholders(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // 匹配完整的占位符模式
  const placeholderPattern =
    /your_[a-zA-Z0-9_]+|YOUR_[A-Z0-9_]+|\[.*?-PASSWORD\]|sk-[a-z]+-your-[a-z-]+|pk_[a-z]+_your_[a-z_]+|sk_test_your_[a-z_]+|sk_live_your_[a-z_]+|whsec_your_[a-z_]+|your_[a-z_]+_here/gi;
  const matches = content.match(placeholderPattern);

  if (matches) {
    console.log(
      `⚠️  ${filePath} - 还剩 ${matches.length} 个占位符需要手动替换:`
    );
    const unique = [...new Set(matches)];
    unique.forEach(match => {
      console.log(`   - ${match}`);
    });
    console.log('');
    return matches.length;
  }

  console.log(`✅ ${filePath} - 所有占位符已替换\n`);
  return 0;
}

// 主执行逻辑
async function main() {
  console.log('📋 步骤 1: 批量替换占位符\n');

  ENV_FILES.forEach(envFile => {
    console.log(`处理 ${envFile.name} (${envFile.path}):`);

    const fullPath = path.join(process.cwd(), envFile.path);
    const replacements = {
      'https://hrjqzbhqueleszkvnsen.supabase.co': CONFIG.supabaseUrl,
      'sb_publishable_5e-tqlrRNyKW3fAmWJipIQ_1-fjS711': CONFIG.supabaseAnonKey,
      'http://localhost:5678': CONFIG.n8nUrl,
    };

    replacePlaceholders(fullPath, replacements);
  });

  console.log('\n📋 步骤 2: 检查剩余占位符\n');

  let totalRemaining = 0;
  ENV_FILES.forEach(envFile => {
    const fullPath = path.join(process.cwd(), envFile.path);
    if (fs.existsSync(fullPath)) {
      totalRemaining += checkRemainingPlaceholders(fullPath);
    }
  });

  console.log('\n=====================================\n');
  console.log('📊 总结报告:\n');

  if (totalRemaining === 0) {
    console.log('🎉 所有配置文件已完成！\n');
  } else {
    console.log(`⚠️  还有 ${totalRemaining} 个占位符需要手动替换\n`);
    console.log('🔧 需要手动配置的敏感信息:');
    console.log('   1. SUPABASE_SERVICE_ROLE_KEY - Supabase 服务角色密钥');
    console.log('   2. DATABASE_URL 中的密码');
    console.log('   3. Stripe API 密钥（如使用支付功能）');
    console.log('   4. DeepSeek API 密钥');
    console.log('   5. QWEN API 密钥');
    console.log('   6. Pinecone API 密钥和配置');
    console.log('   7. Weaviate 配置');
    console.log('   8. JWT_SECRET - JWT 加密密钥\n');
  }

  console.log('💡 下一步操作:');
  console.log('   1. 打开各个 .env 文件，替换剩余的占位符');
  console.log('   2. 运行 npm run verify:environment 验证配置');
  console.log('   3. 运行 npm run check:health 进行健康检查\n');

  console.log('✨ 配置工具执行完成！');
}

main();
