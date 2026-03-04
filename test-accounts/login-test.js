// 测试管理员登录的前端代码示例
const testAdminLogin = async () => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: '1055603323@qq.com',
      password: '12345678',
    }),
  });

  const result = await response.json();
  console.log('登录结果:', result);
  return result;
};

// 使用示例
testAdminLogin().then(result => {
  if (result.success) {
    console.log('✅ 管理员登录成功');
    window.location.href = '/admin';
  } else {
    console.log('❌ 登录失败:', result.error);
  }
});
