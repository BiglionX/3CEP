'use client';

interface GoogleLoginButtonProps {
  redirect?: string;
}

export default function GoogleLoginButton({
  redirect = '/',
}: GoogleLoginButtonProps) {
  const handleGoogleLogin = () => {
    // 构建完整的Google OAuth URL，包含redirect参数
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
    const redirectParam = redirect
      ? `&redirect=${encodeURIComponent(redirect)}`
      : '';
    const googleAuthUrl = `${baseUrl}/api/auth/callback/google?origin=login${redirectParam}`;

    // 重定向到Google OAuth
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(googleAuthUrl)}&response_type=code&scope=email profile`;
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      aria-label="使用Google账号登录"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.11v4.09h6.85c-.23 1.08-1.05 1.92-2.04 2.25v4.09c2.08-.83 3.78-2.15 4.9-3.78z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-6.85-4.09c-.23 1.08-1.05 1.92-2.04 2.25v4.09c2.08-.83 3.78-2.15 4.9-3.78z"
        />
        <path
          fill="#FBBC05"
          d="M5.26 14.09c-.25-.86-.39-1.76-.39-2.69 0-.93.14-1.83.39-2.69V4.09C3.2 5.39 1.75 7.15 1.75 9.17c0 2.02 1.45 3.78 3.51 5.07L5.26 14.09z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.3-5.5C17.45 2.08 14.97 1 12 1 7.47 1 3.44 3.97 1.75 8.54L5.26 14.09c1.25-1.08 2.7-1.74 4.21-1.74 1.39 0 2.68.52 3.82 1.47z"
        />
      </svg>
      <span>使用Google账号登录</span>
    </button>
  );
}
