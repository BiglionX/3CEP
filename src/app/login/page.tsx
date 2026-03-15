'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import { UnifiedLogin } from '@/components/auth/UnifiedLogin';

// 扩展 Window 接口以包含 loginRedirectProcessed 属性
declare global {
  interface Window {
    loginRedirectProcessed: boolean;
  }
}

interface User {
  email: string;
  id: string;
  is_admin: boolean;
  [key: string]: any;
}

export default function EnhancedLoginPage() {
  const { isAuthenticated, is_admin } = useUnifiedAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get('redirect') || undefined;
  const redirectProcessedRef = useRef(false);

  useEffect(() => {
    // 检查是否已经登录（添加防抖动避免闪烁）
    if (isAuthenticated && !redirectProcessedRef.current) {
      redirectProcessedRef.current = true;
      window.loginRedirectProcessed = true;

      // 微延迟执行跳转，避免页面闪烁
      setTimeout(() => {
        if (redirect.startsWith('/admin')) {
          router.push(redirect);
        } else if (is_admin) {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      }, 50);
    }
  }, [isAuthenticated, is_admin, redirect, router]);

  const handleLoginSuccess = (user: User) => {
    // 登录成功后的处理已在UnifiedLogin组件中处理
    console.debug('登录成功:', user);
  };

  return (
    <UnifiedLogin
      isOpen={true}
      onClose={() => router.push('/')}
      onLoginSuccess={handleLoginSuccess}
      redirectUrl={redirect}
      mode="page"
    />
  );
}
