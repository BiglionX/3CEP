#!/usr/bin/env node

/**
 * 环境变量配置验证脚本
 * 验证不同环境下的配置文件完整性和正确性
 */

const fs = require('fs');
const path = require('path');

// 环境配置定义
const environments = {
  dev: {
    files: ['.env.dev', '.env.dev.local'],
    requiredVars: [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'DATABASE_URL',
      'NEXT_PUBLIC_SITE_URL'
    ],
    name: '开发环境'
  },
  stage: {
    files: ['.env.stage', '.env.stage.local'],
    requiredVars: [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'DATABASE_URL',
      'NEXT_PUBLIC_SITE_URL'
    ],
    name: '预发布环境'
  },
  prod: {
    files: ['.env.prod', '.env.prod.local'],
    requiredVars: [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'DATABASE_URL',
      'NEXT_PUBLIC_SITE_URL'
    ],
    name: '生产环境'
  }
};

// 占位符模式检测
const placeholderPatterns = [
  /your_[a-zA-Z0-9_-]+/i,
  /YOUR_[A-Z0-9_-]+/,
  /\[.*PASSWORD.*\]/i,
  /actual_[a-zA-Z0-9_-]+/i
];

function checkPlaceholder(content, varName) {
  return placeholderPatterns.some(pattern => pattern.test(content));
}

function validateEnvironment(envKey, envConfig) {
  console.log(`\n🔍 验证${envConfig.name}配置:`);
  console.log('='.repeat(40));
  
  let allValid = true;
  let fileExists = false;
  
  // 检查配置文件存在性
  for (const fileName of envConfig.files) {
    const filePath = path.join(__dirname, '..', fileName);
    if (fs.existsSync(filePath)) {
      fileExists = true;
      console.log(`✅ 配置文件存在: ${fileName}`);
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // 检查必需变量
        console.log(`\n📋 必需变量检查:`);
        for (const varName of envConfig.requiredVars) {
          if (content.includes(varName)) {
            const hasPlaceholder = checkPlaceholder(content, varName);
            if (hasPlaceholder) {
              console.log(`⚠️  ${varName}: 存在占位符，需要替换`);
              allValid = false;
            } else {
              console.log(`✅ ${varName}: 配置完整`);
            }
          } else {
            console.log(`❌ ${varName}: 缺失`);
            allValid = false;
          }
        }
        
        // 检查环境特定变量
        const envSpecificChecks = {
          dev: ['ENABLE_DEVTOOLS', 'HOT_RELOAD_ENABLED'],
          stage: ['MONITORING_ENABLED', 'RATE_LIMITING_ENABLED'],
          prod: ['HTTPS_ONLY', 'AUTO_BACKUP_ENABLED', 'CONTENT_SECURITY_POLICY']
        };
        
        if (envSpecificChecks[envKey]) {
          console.log(`\n🔧 环境特定配置检查:`);
          for (const varName of envSpecificChecks[envKey]) {
            if (content.includes(varName)) {
              console.log(`✅ ${varName}: 已配置`);
            } else {
              console.log(`⚠️  ${varName}: 建议配置`);
            }
          }
        }
        
      } catch (error) {
        console.log(`❌ 读取文件 ${fileName} 失败: ${error.message}`);
        allValid = false;
      }
    } else {
      console.log(`❌ 配置文件不存在: ${fileName}`);
    }
  }
  
  if (!fileExists) {
    console.log(`❌ 该环境没有任何配置文件`);
    allValid = false;
  }
  
  return allValid;
}

function validateSecrets() {
  console.log(`\n🔒 敏感信息配置检查:`);
  console.log('='.repeat(40));
  
  const secretsFile = path.join(__dirname, '..', '.env.secrets');
  if (!fs.existsSync(secretsFile)) {
    console.log('❌ .env.secrets 文件不存在');
    return false;
  }
  
  try {
    const content = fs.readFileSync(secretsFile, 'utf8');
    const placeholderCount = (content.match(/actual_[a-zA-Z0-9_-]+/gi) || []).length;
    
    if (placeholderCount > 0) {
      console.log(`⚠️  发现 ${placeholderCount} 个敏感信息占位符需要替换`);
      return false;
    } else {
      console.log('✅ 敏感信息配置完整');
      return true;
    }
  } catch (error) {
    console.log(`❌ 读取敏感信息文件失败: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🚀 FixCycle 环境配置验证工具\n');
  
  let overallValid = true;
  
  // 验证各个环境
  for (const [envKey, envConfig] of Object.entries(environments)) {
    const isValid = validateEnvironment(envKey, envConfig);
    if (!isValid) {
      overallValid = false;
    }
  }
  
  // 验证敏感信息
  const secretsValid = validateSecrets();
  if (!secretsValid) {
    overallValid = false;
  }
  
  // 输出总结
  console.log('\n' + '='.repeat(50));
  console.log('📊 配置验证总结:');
  console.log('='.repeat(50));
  
  if (overallValid) {
    console.log('✅ 所有环境配置验证通过！');
    console.log('\n📋 建议下一步操作:');
    console.log('1. 确保所有占位符都已替换为真实值');
    console.log('2. 在生产环境中启用所有安全配置');
    console.log('3. 定期轮换敏感密钥');
  } else {
    console.log('❌ 发现配置问题，请根据上述提示进行修正');
    console.log('\n🔧 修复建议:');
    console.log('1. 复制 .env.[环境].example 到 .env.[环境]');
    console.log('2. 替换所有 your_/YOUR_ 占位符');
    console.log('3. 确保敏感信息已正确配置在 .env.secrets 中');
    process.exit(1);
  }
}

// 执行验证
if (require.main === module) {
  main();
}

module.exports = { validateEnvironment, environments };