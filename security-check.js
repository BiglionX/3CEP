const fs = require('fs');
const path = require('path');

console.log('🔒 安全检查报告\n');

// 检查.gitignore文件
console.log('1️⃣ 检查.gitignore配置...');
const gitignorePath = '.gitignore';
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  const requiredEntries = [
    '.env.local',
    '.env*.local',
    'node_modules/',
    '.next/',
    '*.log',
    '.DS_Store',
    'coverage/',
    '.nyc_output/'
  ];
  
  console.log('   当前.gitignore内容:');
  console.log(gitignoreContent);
  
  const missingEntries = requiredEntries.filter(entry => !gitignoreContent.includes(entry));
  if (missingEntries.length > 0) {
    console.log('   ❌ 缺少以下重要条目:');
    missingEntries.forEach(entry => console.log(`      - ${entry}`));
  } else {
    console.log('   ✅ .gitignore配置完整');
  }
} else {
  console.log('   ❌ .gitignore文件不存在');
}

// 检查环境变量文件
console.log('\n2️⃣ 检查环境变量安全性...');
const envFiles = ['.env.local', '.env'];
envFiles.forEach(envFile => {
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf8');
    console.log(`   ${envFile}:`);
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (value && value.length > 10) {
        console.log(`      ${key}=******** (${value.length} 字符)`);
      } else {
        console.log(`      ${key}=${value || ''}`);
      }
    });
  }
});

// 检查敏感信息
console.log('\n3️⃣ 检查代码中的敏感信息...');
const checkSensitiveInfo = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const sensitivePatterns = [
    /sk_test_[a-zA-Z0-9]+/,
    /sk_live_[a-zA-Z0-9]+/,
    /[0-9a-f]{32}/,
    /secret/i,
    /password/i,
    /token/i
  ];
  
  sensitivePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      console.log(`   ⚠️  在 ${filePath} 中发现潜在敏感信息: ${matches[0]}`);
    }
  });
};

// 检查主要文件
const filesToCheck = [
  'src/app/page.tsx',
  'package.json',
  '.env.local'
];

filesToCheck.forEach(checkSensitiveInfo);

// 密钥轮换建议
console.log('\n4️⃣ 密钥安全管理建议:');
console.log('   🔑 定期轮换建议:');
console.log('      - Stripe密钥: 每6个月轮换一次');
console.log('      - 数据库密码: 每3个月轮换一次');
console.log('      - API密钥: 根据使用情况定期轮换');
console.log('');
console.log('   🛡️ 最佳实践:');
console.log('      - 使用环境变量存储敏感信息');
console.log('      - 启用双因素认证');
console.log('      - 定期审查访问权限');
console.log('      - 备份重要密钥到安全位置');

console.log('\n✅ 安全检查完成！');