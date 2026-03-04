'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import { UnifiedLogin } from '@/components/auth/UnifiedLogin';

export default function EnhancedLoginPage() {
  const { isAuthenticated, is_admin } = useUnifiedAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get('redirect') || undefined;

  useEffect(() => {
    // 检查是否已经登录（添加防抖动避免闪烁）
    if (isAuthenticated && !window.loginRedirectProcessed) {
      window.loginRedirectProcessed = true;

      // 微延迟执行跳转，避免页面闪烁
      setTimeout(() => {
        if (redirect?.startsWith('/admin')) {
          router.push(redirect);
        } else if (is_admin) {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      }, 50);
    }
  }, [isAuthenticated, is_admin, redirect, router]);

  const handleLoginSuccess = (user: any) => {
    // 登录成功后的处理已在UnifiedLogin组件中处?    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('登录成功:', user)};

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

