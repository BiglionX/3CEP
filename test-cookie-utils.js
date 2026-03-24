/**
 * Cookie 工具函数单元测试
 */

const {
  extractProjectName,
  getAuthCookieName,
  parseSessionCookie,
  serializeSessionCookie,
  validateEnvConfig,
} = require('./src/lib/utils/cookie-utils');

console.log('\n=== Cookie 工具函数测试 ===\n');

// 测试 1: extractProjectName
console.log('测试 extractProjectName:');
const testUrls = [
  'https://hrjqzbhqueleszkvnsen.supabase.co',
  'https://test-project.supabase.co',
  'http://localhost:54321',
  '',
  undefined,
];

testUrls.forEach(url => {
  const result = extractProjectName(url);
  console.log(`  "${url}" -> "${result}"`);
});

// 测试 2: getAuthCookieName
console.log('\n测试 getAuthCookieName:');
const cookieName = getAuthCookieName(
  'https://hrjqzbhqueleszkvnsen.supabase.co'
);
console.log(`  预期：sb-hrjqzbhqueleszkvnsen-auth-token`);
console.log(`  实际：${cookieName}`);
console.log(
  `  结果：${cookieName === 'sb-hrjqzbhqueleszkvnsen-auth-token' ? '✅ 通过' : '❌ 失败'}`
);

// 测试 3: Session Cookie 序列化和反序列化
console.log('\n测试 Session Cookie 处理:');
const mockSession = {
  access_token: 'test_access_token_123',
  refresh_token: 'test_refresh_token_456',
  expires_in: 3600,
  user: {
    id: 'user-123',
    email: 'test@example.com',
  },
};

const serialized = serializeSessionCookie(mockSession);
console.log('序列化后的 Cookie:', serialized.substring(0, 50) + '...');

const parsed = parseSessionCookie(serialized);
console.log('反序列化后的数据:');
console.log('  access_token:', parsed?.access_token);
console.log('  user.id:', parsed?.user?.id);
console.log('  user.email:', parsed?.user?.email);

const matches =
  parsed?.access_token === mockSession.access_token &&
  parsed?.user?.id === mockSession.user.id;
console.log(`结果：${matches ? '✅ 通过' : '❌ 失败'}`);

// 测试 4: 环境变量验证
console.log('\n测试环境变量验证:');
const configResult = validateEnvConfig();
console.log('配置是否有效:', configResult.isValid ? '✅ 是' : '❌ 否');

if (configResult.errors.length > 0) {
  console.log('错误:');
  configResult.errors.forEach(err => console.log(`  - ${err}`));
}

if (configResult.warnings.length > 0) {
  console.log('警告:');
  configResult.warnings.forEach(warn => console.log(`  - ${warn}`));
}

console.log('\n=== 测试完成 ===\n');
