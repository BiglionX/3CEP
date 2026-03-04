'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SimpleLoginTest() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 防止闪退的稳定初始化
  useEffect(() => {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('组件初始化完?)// 确保只执行一?    if (typeof window !== 'undefined' && !window.initComplete) {
      window.initComplete = true;
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('首次初始化标记设?)}
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 模拟API调用，避免实际网络请?      await new Promise(resolve => setTimeout(resolve, 1000));

      if (email === 'test@test.com' && password === '123456') {
        setIsLoggedIn(true);
        // 延迟跳转避免闪退
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 500);
      } else {
        setError('邮箱或密码错?);
      }
    } catch (err) {
      setError('登录失败');
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>�?登录成功</h2>
        <p>正在跳转到管理后?..</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>简化版登录测试</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>邮箱:</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>密码:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
          />
        </div>
        {error && (
          <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '登录?..' : '登录'}
        </button>
      </form>
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>测试账号: test@test.com</p>
        <p>测试密码: 123456</p>
      </div>
    </div>
  );
}

