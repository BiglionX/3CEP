'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useIsolatedAuth } from '@/lib/isolated-auth-service';

export default function FreshLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin/dashboard';

  const {
    isAuthenticated,
    isAdmin,
    isInitializing,
    hasPendingOperations,
    login,
    logout,
  } = useIsolatedAuth();

  const [email, setEmail] = useState('1055603323@qq.com');
  const [password, setPassword] = useState('12345678');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // 处理已认证用?  useEffect(() => {
    if (isAuthenticated && !isInitializing) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('用户已认证，执行跳转')const timer = setTimeout(() => {
        if (redirect?.startsWith('/admin') || isAdmin) {
          router.push(redirect);
        } else {
          router.push('/');
        }
      }, 300); // 短暂延迟确保状态稳?
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isAdmin, redirect, router, isInitializing]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (isSubmitting || hasPendingOperations) return;

    setIsSubmitting(true);
    setError('');
    setLoginSuccess(false);

    try {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('开始登录流?)const result = await login(email, password);

      if (result.success) {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('登录成功，准备跳?)setLoginSuccess(true);

        // 延迟跳转确保状态同?        setTimeout(() => {
          if (redirect?.startsWith('/admin') || result?.isAdmin) {
            router.push(redirect);
          } else {
            router.push('/');
          }
        }, 1000);
      } else {
        setError(result.error || '登录失败');
        console.error('登录失败:', result.error);
      }
    } catch (err) {
      setError('登录过程中发生错?);
      console.error('登录异常:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 如果正在初始化或已认证，显示加载状?  if (isInitializing || (isAuthenticated && !loginSuccess)) {
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
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px',
            }}
          ></div>
          <p style={{ color: '#4a5568', fontSize: '18px' }}>
            {isInitializing ? '初始化认证系?..' : '验证用户身份...'}
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
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
            欢迎回来
          </h1>
          <p style={{ color: '#718096', fontSize: '16px' }}>登录您的账户</p>
        </div>

        {loginSuccess && (
          <div
            style={{
              background: '#d4edda',
              border: '1px solid #c3e6cb',
              color: '#155724',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>�?/div>
            <strong>登录成功?/strong>
            <p>正在为您跳转...</p>
          </div>
        )}

        {error && (
          <div
            style={{
              background: '#f8d7da',
              border: '1px solid #f5c6cb',
              color: '#721c24',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

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
              disabled={isSubmitting || hasPendingOperations}
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
              disabled={isSubmitting || hasPendingOperations}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || hasPendingOperations}
            style={{
              width: '100%',
              padding: '14px',
              background:
                isSubmitting || hasPendingOperations ? '#a0aec0' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor:
                isSubmitting || hasPendingOperations
                  ? 'not-allowed'
                  : 'pointer',
              transition: 'all 0.3s',
            }}
          >
            {isSubmitting || hasPendingOperations ? '登录?..' : '登录'}
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

