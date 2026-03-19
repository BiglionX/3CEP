'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UltimateMinimalLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('1055603323@qq.com');
  const [password, setPassword] = useState('12345678');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      // 最简化的验证逻辑 - 直接硬编码
      if (email === '1055603323@qq.com' && password === '12345678') {
        // 直接设置登录状态，不使用任何Hook或复杂逻辑
        setLoggedIn(true);

        // 简单的延迟跳转
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1000);
      }
    } catch (error) {
      console.error('登录错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 登录成功显示
  if (loggedIn) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f0f2f5',
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✓</div>
          <h2 style={{ color: '#2d3748', marginBottom: '10px' }}>登录成功</h2>
          <p style={{ color: '#718096' }}>正在跳转到管理后台...</p>
        </div>
      </div>
    );
  }

  // 登录表单
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1
            style={{
              color: '#2d3748',
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '10px',
            }}
          >
            系统登录
          </h1>
          <p style={{ color: '#718096', fontSize: '16px' }}>
            请输入您的账户信息
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#2d3748',
              }}
            >
              邮箱地址
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
              disabled={loading}
              required
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#2d3748',
              }}
            >
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#a0aec0' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div
          style={{
            marginTop: '25px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#718096',
          }}
        >
          <p>测试账号: 1055603323@qq.com</p>
          <p>测试密码: 12345678</p>
        </div>
      </div>
    </div>
  );
}
