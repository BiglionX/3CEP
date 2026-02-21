'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GoogleLoginButton from '@/components/GoogleLoginButton';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get('redirect');

  useEffect(() => {
    // 检查是否已经登录
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check-session');
        if (response.ok) {
          // 已登录，根据redirect参数决定跳转位置
          if (redirect?.startsWith('/admin')) {
            router.push(redirect);
          } else {
            router.push('/');
          }
        }
      } catch (error) {
        console.log('未登录状态');
      }
    };
    
    checkAuth();
  }, [router, redirect]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">欢迎登录</h1>
          <p className="text-gray-600 mt-2">
            {redirect?.startsWith('/admin') 
              ? '管理后台登录' 
              : '使用Google账号快速登录'
            }
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <GoogleLoginButton redirect={redirect || '/'} />
          </div>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">或</span>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            <p>登录即表示您同意我们的服务条款和隐私政策</p>
          </div>
        </div>
      </div>
    </div>
  );
}