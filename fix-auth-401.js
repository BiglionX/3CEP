/**
 * 一键修复 401 认证问题
 * 使用方法：在浏览器控制台运行此脚本
 */

(function fixAuth401() {
  console.log('=================================');
  console.log('🔧 开始修复 401 认证问题...');
  console.log('=================================\n');

  const projectName = 'hrjqzbhqueleszkvnsen';
  const correctCookieName = `sb-${projectName}-auth-token`;

  // 步骤 1: 检查当前 Cookie 状态
  console.log('📋 步骤 1: 检查当前 Cookie 状态');
  const allCookies = document.cookie.split(';').map(c => c.trim());
  console.log('当前所有 Cookies:');
  allCookies.forEach(cookie => {
    if (cookie.includes('sb-') || cookie.includes('token')) {
      console.log('  ✅', cookie.substring(0, 50) + '...');
    }
  });

  // 步骤 2: 查找可能的认证 token
  console.log('\n📋 步骤 2: 查找可能的认证 token');
  let foundToken = null;
  let foundCookieName = null;

  // 检查 localStorage
  const localStorageKeys = [
    'sb-access-token',
    `sb-${projectName}-auth-token`,
    'mock-token',
    'auth-token',
  ];

  for (const key of localStorageKeys) {
    const token = localStorage.getItem(key);
    if (token) {
      console.log(`  ✅ 在 localStorage 中找到: ${key}`);
      foundToken = token;
      break;
    }
  }

  // 检查 cookie
  for (const cookie of allCookies) {
    const [name, value] = cookie.split('=');
    if (name.includes('sb-') && name.includes('auth') && value) {
      console.log(`  ✅ 在 cookie 中找到: ${name.trim()}`);
      if (!foundToken) {
        foundToken = decodeURIComponent(value);
        foundCookieName = name.trim();
      }
    }
  }

  if (!foundToken) {
    console.log('  ❌ 未找到任何认证 token，请先登录！');
    console.log('\n=================================');
    console.log('⚠️  建议操作:');
    console.log('1. 访问 /login 页面重新登录');
    console.log('2. 登录后再次运行此脚本');
    console.log('=================================');
    return;
  }

  // 步骤 3: 设置正确的 Cookie
  console.log('\n📋 步骤 3: 设置正确的 Cookie');
  console.log(`  Cookie 名称：${correctCookieName}`);

  // 删除旧的/错误的 cookie
  console.log('  🗑️  清除旧 cookie...');
  const oldCookieNames = [
    'sb-access-token',
    'sb-procyc-auth-token',
    'mock-token',
  ];

  oldCookieNames.forEach(name => {
    if (document.cookie.includes(name)) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      console.log(`    ✅ 已删除：${name}`);
    }
  });

  // 设置正确的 cookie
  console.log('  ✨ 设置新 cookie...');
  try {
    // 如果是 JSON 字符串，直接使用；否则包装成 session 格式
    let cookieValue = foundToken;
    try {
      const parsed = JSON.parse(foundToken);
      if (!parsed.access_token) {
        // 如果不是 session 格式，包装一下
        cookieValue = JSON.stringify({
          access_token: foundToken,
          refresh_token: foundToken,
          expires_in: 86400,
          expires_at: Math.floor(Date.now() / 1000) + 86400,
        });
      }
    } catch (e) {
      // 不是 JSON，直接包装
      cookieValue = JSON.stringify({
        access_token: foundToken,
        refresh_token: foundToken,
        expires_in: 86400,
        expires_at: Math.floor(Date.now() / 1000) + 86400,
      });
    }

    document.cookie = `${correctCookieName}=${encodeURIComponent(cookieValue)}; path=/; max-age=86400; SameSite=Lax`;
    console.log(`    ✅ Cookie 已设置`);
  } catch (error) {
    console.error('    ❌ 设置失败:', error);
  }

  // 步骤 4: 验证结果
  console.log('\n📋 步骤 4: 验证结果');
  const newCookie = document.cookie.match(
    new RegExp(`${correctCookieName}=([^;]+)`)
  );
  if (newCookie) {
    console.log('  ✅ Cookie 设置成功!');
    console.log(`  Cookie 名称：${correctCookieName}`);

    try {
      const sessionData = JSON.parse(decodeURIComponent(newCookie[1]));
      console.log('  Token 信息:');
      console.log('    - Has Access Token:', !!sessionData.access_token);
      console.log('    - Has Refresh Token:', !!sessionData.refresh_token);
      if (sessionData.expires_at) {
        const expiresDate = new Date(sessionData.expires_at * 1000);
        console.log('    - Expires At:', expiresDate.toLocaleString());
      }
    } catch (e) {
      console.log('  ⚠️  Cookie 值格式可能不正确');
    }
  } else {
    console.log('  ❌ Cookie 设置失败，请手动检查');
  }

  // 步骤 5: 测试 API
  console.log('\n📋 步骤 5: 测试 /api/session/me 接口');
  fetch('/api/session/me', { credentials: 'include' })
    .then(res => {
      if (res.ok) {
        console.log('  ✅ API 调用成功!');
        return res.json();
      } else {
        console.log(`  ❌ API 返回错误: ${res.status}`);
        return null;
      }
    })
    .then(data => {
      if (data) {
        console.log('  用户信息:', {
          isAuthenticated: data.isAuthenticated,
          hasUser: !!data.user,
          roles: data.roles,
        });

        if (data.isAuthenticated) {
          console.log('\n=================================');
          console.log('🎉 修复成功！请刷新页面重试');
          console.log('=================================');
          console.log('\n建议操作:');
          console.log('1. 刷新页面 (F5)');
          console.log('2. 访问 /admin/agents/execute 测试');
        } else {
          console.log('\n=================================');
          console.log('⚠️  Token 可能已过期，请重新登录');
          console.log('=================================');
        }
      }
    })
    .catch(err => {
      console.error('  ❌ API 测试失败:', err);
    });

  console.log('\n=================================');
  console.log('✨ 自动修复完成');
  console.log('=================================\n');
})();
