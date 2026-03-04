/**
 * NextAuth环境变量验证脚本
 * 检查必要的环境变量是否配置正确
 */

console.log('🔐 开始NextAuth环境变量验证...\n');

// 检查环境变量
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
];

const missingVars = [];
const presentVars = [];

console.log('🔍 检查必需的环境变量:');

for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];
  if (value) {
    presentVars.push(envVar);
    // 对于敏感信息只显示部分字符
    const displayValue =
      envVar.includes('KEY') || envVar.includes('SECRET')
        ? `${value.substring(0, 4)}...${value.slice(-4)}`
        : value.substring(0, 30) + (value.length > 30 ? '...' : '');
    console.log(`  ✅ ${envVar}: ${displayValue}`);
  } else {
    missingVars.push(envVar);
    console.log(`  ❌ ${envVar}: 未设置`);
  }
}

console.log('\n📊 验证结果:');
console.log(`  已配置: ${presentVars.length}/${requiredEnvVars.length}`);
console.log(`  缺失: ${missingVars.length}/${requiredEnvVars.length}`);

if (missingVars.length > 0) {
  console.log('\n❌ 缺失的环境变量:');
  missingVars.forEach(envVar => {
    console.log(`  - ${envVar}`);
  });

  console.log('\n🔧 配置建议:');
  console.log('请在 .env.local 文件中添加以下配置:');
  console.log('');

  if (missingVars.includes('NEXT_PUBLIC_SUPABASE_URL')) {
    console.log('# Supabase URL (从Supabase项目仪表板获取)');
    console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  }

  if (missingVars.includes('SUPABASE_SERVICE_ROLE_KEY')) {
    console.log('# Supabase Service Role Key (从Supabase项目仪表板获取)');
    console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  }

  if (missingVars.includes('NEXTAUTH_SECRET')) {
    console.log(
      '# NextAuth密钥 (用于JWT签名，可使用 openssl rand -base64 32 生成)'
    );
    console.log(
      'NEXTAUTH_SECRET=your-random-secret-key-at-least-32-characters'
    );
  }

  if (missingVars.includes('NEXTAUTH_URL')) {
    console.log('# NextAuth URL (你的应用URL)');
    console.log('NEXTAUTH_URL=http://localhost:3001');
  }

  console.log('\n⚠️  在配置完成前，NextAuth可能无法正常工作');
  process.exit(1);
} else {
  console.log('\n✅ 所有必需的环境变量都已配置');
  console.log('\n🚀 NextAuth配置验证通过!');
  console.log('\n📋 下一步建议:');
  console.log('1. 重启开发服务器使配置生效');
  console.log('2. 测试登录功能');
  console.log('3. 验证会话管理是否正常工作');
}

// 额外检查：验证Supabase连接
console.log('\n🔌 验证Supabase连接...');
try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    // 简单的URL格式验证
    const url = new URL(supabaseUrl);
    if (url.protocol === 'https:') {
      console.log('  ✅ Supabase URL格式正确');
    } else {
      console.log('  ⚠️  Supabase URL应使用HTTPS协议');
    }
  }
} catch (error) {
  console.log('  ❌ Supabase URL格式无效');
}

console.log('\n🎉 环境变量验证完成!');
