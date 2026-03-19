'use client';

import { UnifiedLogin } from '@/components/auth/UnifiedLogin';
import { useSearchParams, useRouter } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get('redirect') || '/repair-shop/dashboard';

  const handleLoginSuccess = (user: any) => {
    // 登录成功处理逻辑
    // eslint-disable-next-line no-console
    console.log('登录成功:', user);

    if (redirect.startsWith('/admin') && !user.is_admin) {
      router.push('/unauthorized');
      return;
    }

    router.push(redirect);
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

