/**
 * 快速检查和修复 Cookie 问题
 * 在浏览器控制台直接运行此函数
 */
function checkAndFixCookie() {
  console.log('=================================');
  console.log('🔍 开始检查 Cookie 状态...');
  console.log('=================================\n');

  const correctCookieName = 'sb-hrjqzbhqueleszkvnsen-auth-token';

  // 1. 检查所有 cookie
  console.log('📋 当前所有 Cookie:');
  const cookies = document.cookie.split(';').map(c => c.trim());
  const authCookies = cookies.filter(
    c => c.includes('sb-') || c.includes('auth') || c.includes('token')
  );

  if (authCookies.length === 0) {
    console.log('  ❌ 未找到任何认证相关的 Cookie');
  } else {
    authCookies.forEach(cookie => {
      const [name] = cookie.split('=');
      if (name === correctCookieName) {
        console.log(`  ✅ ${name} (正确的 Cookie)`);
      } else {
        console.log(`  ⚠️  ${name} (可能是不正确的 Cookie)`);
      }
    });
  }

  // 2. 检查 localStorage
  console.log('\n📋 检查 LocalStorage:');
  const localStorageKeys = Object.keys(localStorage).filter(
    k => k.includes('sb-') || k.includes('auth') || k.includes('token')
  );

  if (localStorageKeys.length === 0) {
    console.log('  ❌ LocalStorage 中没有认证数据');
  } else {
    localStorageKeys.forEach(key => {
      console.log(`  📦 ${key}`);
    });
  }

  // 3. 查找可用的 token
  console.log('\n📋 查找可用的 Token:');
  let availableToken = null;
  let tokenSource = '';

  // 检查正确的 cookie
  const correctCookie = cookies.find(c =>
    c.startsWith(correctCookieName + '=')
  );
  if (correctCookie) {
    const value = correctCookie.split('=')[1];
    availableToken = decodeURIComponent(value);
    tokenSource = 'Cookie (' + correctCookieName + ')';
    console.log(`  ✅ 从 ${tokenSource} 获取到 Token`);
  }

  // 检查 localStorage
  if (!availableToken) {
    const stored = localStorage.getItem('sb-access-token');
    if (stored) {
      availableToken = stored;
      tokenSource = 'LocalStorage (sb-access-token)';
      console.log(`  ✅ 从 ${tokenSource} 获取到 Token`);
    }
  }

  // 检查其他可能的 cookie
  if (!availableToken) {
    const oldCookie = cookies.find(c => c.includes('sb-access-token='));
    if (oldCookie) {
      availableToken = oldCookie.split('=')[1];
      tokenSource = 'Cookie (旧版 sb-access-token)';
      console.log(`  ⚠️  从 ${tokenSource} 获取到 Token (可能需要迁移)`);
    }
  }

  if (!availableToken) {
    console.log('  ❌ 未找到任何可用的 Token');
    console.log('\n=================================');
    console.log('⚠️  需要重新登录!');
    console.log('=================================');
    console.log('建议操作:');
    console.log('1. 访问 /login 页面登录');
    console.log('2. 或者手动设置 token (如果有备份)');
    return;
  }

  // 4. 验证 token 格式
  console.log('\n📋 Token 格式验证:');
  try {
    const parsed = JSON.parse(availableToken);
    console.log('  ✅ Token 是有效的 JSON 格式');
    console.log('  - Has access_token:', !!parsed.access_token);
    console.log('  - Has refresh_token:', !!parsed.refresh_token);
    if (parsed.expires_at) {
      const expires = new Date(parsed.expires_at * 1000);
      const isExpired = Date.now() > parsed.expires_at * 1000;
      console.log('  - Expires at:', expires.toLocaleString());
      console.log('  - Status:', isExpired ? '❌ 已过期' : '✅ 有效');
    }
  } catch (e) {
    console.log('  ⚠️  Token 不是标准 JSON 格式，可能是简单字符串');
    console.log('  Token 长度:', availableToken.length);
  }

  // 5. 自动修复
  console.log('\n=================================');
  console.log('🔧 开始自动修复...');
  console.log('=================================\n');

  // 清除旧 cookie
  console.log('步骤 1: 清除旧的/错误的 Cookie');
  const oldNames = ['sb-access-token', 'sb-procyc-auth-token', 'mock-token'];
  oldNames.forEach(name => {
    if (document.cookie.includes(name)) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      console.log(`  ✅ 已删除：${name}`);
    }
  });

  // 设置正确的 cookie
  console.log('\n步骤 2: 设置正确的 Cookie');
  let cookieValue = availableToken;

  // 如果不是 JSON 格式，包装成 session 格式
  try {
    JSON.parse(availableToken);
  } catch (e) {
    cookieValue = JSON.stringify({
      access_token: availableToken,
      refresh_token: availableToken,
      expires_in: 86400,
      expires_at: Math.floor(Date.now() / 1000) + 86400,
    });
    console.log('  ℹ️  Token 已包装为标准 session 格式');
  }

  document.cookie = `${correctCookieName}=${encodeURIComponent(cookieValue)}; path=/; max-age=86400; SameSite=Lax`;
  console.log(`  ✅ Cookie 已设置：${correctCookieName}`);

  // 6. 验证结果
  console.log('\n步骤 3: 验证修复结果');
  setTimeout(() => {
    const newCookie = document.cookie.match(
      new RegExp(`${correctCookieName}=([^;]+)`)
    );
    if (newCookie) {
      console.log('  ✅ Cookie 设置成功!');

      // 测试 API
      console.log('\n步骤 4: 测试 /api/session/me 接口');
      fetch('/api/session/me', { credentials: 'include' })
        .then(res => {
          console.log(`  HTTP Status: ${res.status}`);
          if (res.ok) {
            return res.json();
          }
          throw new Error(`HTTP ${res.status}`);
        })
        .then(data => {
          console.log('  ✅ API 调用成功!');
          console.log('  响应数据:', {
            isAuthenticated: data.isAuthenticated,
            hasUser: !!data.user,
            roles: data.roles?.length || 0,
          });

          if (data.isAuthenticated) {
            console.log('\n=================================');
            console.log('🎉 修复成功!');
            console.log('=================================');
            console.log('建议操作:');
            console.log('1. 刷新页面 (F5 或 Ctrl+R)');
            console.log('2. 访问 /admin/agents/execute 测试');
            console.log('3. 如果仍有问题，请查看 AUTH_401_FIX_REPORT.md');
          } else {
            console.log('\n=================================');
            console.log('⚠️  Token 可能无效，需要重新登录');
            console.log('=================================');
          }
        })
        .catch(err => {
          console.error('  ❌ API 测试失败:', err.message);
          console.log('\n=================================');
          console.log('⚠️  Token 可能已过期或无效');
          console.log('=================================');
          console.log('建议操作:');
          console.log('1. 重新登录获取新 token');
          console.log('2. 或者检查 token 是否已过期');
        });
    } else {
      console.log('  ❌ Cookie 设置失败');
      console.log('\n请手动检查:');
      console.log('- Cookie 名称是否正确');
      console.log('- 浏览器是否允许第三方 cookie');
      console.log('- 是否在正确的域名下');
    }
  }, 100);
}

// 立即执行
checkAndFixCookie();
