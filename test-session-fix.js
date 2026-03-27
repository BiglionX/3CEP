// 测试 /api/session/me 接口是否可正常访问
const TEST_URL = 'http://localhost:3001/api/session/me';

async function testSessionAPI() {
  console.log('🔍 开始测试 /api/session/me 接口...\n');

  try {
    // 测试 1: 无 Cookie 访问（应该返回 401，但不能再报中间件错误）
    console.log('测试 1: 无认证 Cookie 访问');
    const response1 = await fetch(TEST_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`  状态码：${response1.status}`);
    console.log(`  预期：401 (未授权)`);
    console.log(
      `  结果：${response1.status === 401 ? '✅ 通过' : '❌ 失败'}\n`
    );

    const data1 = await response1.json();
    console.log('  响应数据:', JSON.stringify(data1, null, 2));

    // 测试 2: 检查响应格式是否正确
    console.log('\n测试 2: 检查响应格式');
    const hasRequiredFields =
      'user' in data1 &&
      'roles' in data1 &&
      'tenantId' in data1 &&
      'isAuthenticated' in data1;

    console.log(`  包含必需字段：${hasRequiredFields ? '✅ 通过' : '❌ 失败'}`);
    console.log(`  isAuthenticated: ${data1.isAuthenticated}`);
    console.log(
      `  user: ${data1.user === null ? 'null (正确)' : '对象 (异常)'}`
    );

    console.log('\n✅ 所有测试完成！');
    console.log('\n说明：');
    console.log('- 如果看到 401 是正常的（表示需要登录）');
    console.log('- 关键是不要再看到 "Cookie 不存在" 的错误日志');
    console.log('- API 应该能正常返回 401 状态和标准的响应格式');
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testSessionAPI();
