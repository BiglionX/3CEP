/**
 * 认证 Cookie 调试脚本
 * 用于诊断和验证认证 cookie 的设置和读取
 */

const { createClient } = require('@supabase/supabase-js');

// 环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('\n=== 认证 Cookie 诊断工具 ===\n');
console.log('Supabase URL:', supabaseUrl);
console.log('项目名称:', supabaseUrl.split('//')[1]?.split('.')[0] || '未找到');
console.log(
  'Cookie 名称:',
  `sb-${supabaseUrl.split('//')[1]?.split('.')[0] || 'procyc'}-auth-token`
);
console.log('');

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('测试登录功能...');

  // 测试邮箱（请替换为实际测试账号）
  const testEmail = 'test@example.com';
  const testPassword = 'testpassword';

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (error) {
      console.error('❌ 登录失败:', error.message);
      return;
    }

    console.log('✅ 登录成功!');
    console.log('用户 ID:', data.user.id);
    console.log('用户邮箱:', data.user.email);
    console.log('Session:', JSON.stringify(data.session, null, 2));

    // 验证 token
    console.log('\n验证访问令牌...');
    const { data: userData, error: userError } = await supabase.auth.getUser(
      data.session.access_token
    );

    if (userError) {
      console.error('❌ Token 验证失败:', userError.message);
    } else {
      console.log('✅ Token 验证成功!');
      console.log('用户信息:', userData.user.email);
    }
  } catch (err) {
    console.error('❌ 测试异常:', err.message);
  }
}

async function checkAdminUser(userId) {
  console.log(`\n检查管理员用户 ${userId} ...`);

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data: adminData } = await supabaseAdmin
      .from('admin_users')
      .select('id, user_id, role, is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (adminData) {
      console.log('✅ 是管理员用户');
      console.log('角色:', adminData.role);
    } else {
      console.log('ℹ️  不是管理员用户或未激活');
    }
  } catch (err) {
    console.log('ℹ️  查询失败（可能是表不存在）:', err.message);
  }
}

async function main() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ 错误：环境变量未配置');
    console.log('请确保 .env 文件中包含:');
    console.log('  - NEXT_PUBLIC_SUPABASE_URL');
    console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return;
  }

  await testLogin();
}

// 运行诊断
main().catch(console.error);
