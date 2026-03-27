// 诊断认证 Cookie 问题
const { getAuthCookieName } = require('./src/lib/utils/cookie-utils');

console.log('🔍 开始诊断认证 Cookie 问题...\n');

// 1. 检查环境变量
console.log('1️⃣ 检查环境变量配置:');
console.log(
  `   NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ 未设置'}`
);
console.log(
  `   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 已设置' : '❌ 未设置'}`
);
console.log(
  `   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已设置' : '❌ 未设置'}`
);

// 2. 计算预期的 Cookie 名称
console.log('\n2️⃣ 预期的 Cookie 名称:');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const expectedCookieName = getAuthCookieName(supabaseUrl);
console.log(`   预期 Cookie 名称：${expectedCookieName}`);
console.log(`   实际日志中的名称：sb-hrjqzbhqueleszkvnsen-auth-token`);

// 3. 分析 Supabase URL
if (supabaseUrl) {
  try {
    const url = new URL(supabaseUrl);
    const hostname = url.hostname;
    const parts = hostname.split('.');
    console.log('\n3️⃣ Supabase URL 分析:');
    console.log(`   完整 URL: ${supabaseUrl}`);
    console.log(`   Hostname: ${hostname}`);
    console.log(`   项目名称：${parts[0]}`);
    console.log(
      `   Cookie 名称匹配：${expectedCookieName === 'sb-hrjqzbhqueleszkvnsen-auth-token' ? '✅ 一致' : '❌ 不一致'}`
    );
  } catch (error) {
    console.log(`\n3️⃣ Supabase URL 解析失败：${error}`);
  }
}

// 4. 检查登录流程
console.log('\n4️⃣ 登录流程检查:');
console.log(`   - Login API 应该设置 cookie: ${expectedCookieName}`);
console.log('   - Cookie 应该包含 session 数据（access_token, refresh_token）');
console.log(
  '   - Cookie 配置：httpOnly=true, secure=false, sameSite=lax, maxAge=3600'
);

// 5. 检查 Session API
console.log('\n5️⃣ Session API 检查:');
console.log(`   - 应该读取 cookie: ${expectedCookieName}`);
console.log('   - 如果 cookie 不存在，返回 401（正常）');
console.log('   - 如果 cookie 存在但无效，返回 401');

// 6. 可能的问题
console.log('\n6️⃣ 可能的问题:');
console.log('   ❓ 浏览器是否保存了正确的 cookie？');
console.log('   ❓ Cookie 域名是否正确？（应该是 localhost）');
console.log('   ❓ Cookie 路径是否正确？（应该是 /）');
console.log('   ❓ 是否在登录后立即访问了 /api/session/me？');

// 7. 建议的调试步骤
console.log('\n7️⃣ 建议的调试步骤:');
console.log('   1. 打开浏览器开发者工具 → Application → Cookies');
console.log(`   2. 查找名为 "${expectedCookieName}" 的 cookie`);
console.log('   3. 检查 cookie 的值、域名、路径、过期时间');
console.log('   4. 如果没有找到，尝试重新登录');
console.log('   5. 如果 cookie 存在但仍然 401，检查 cookie 值是否有效');

console.log('\n✅ 诊断完成！\n');
