import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const redirect = url.searchParams.get('redirect') || '/';
  
  if (!code) {
    return new Response('Missing code parameter', { status: 400 });
  }

  // 创建Supabase客户端
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  let adminUser = null;

  try {
    // 使用Supabase进行Google登录
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/google`,
        queryParams: {
          code,
        },
      },
    });

    if (error) {
      console.error('Google login error:', error);
      return new Response(`Login failed: ${error.message}`, { status: 500 });
    }
    
    // 登录成功后的处理
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // 检查是否为管理员并设置相应cookie
      const { data } = await supabase
        .from('admin_users')
        .select('id, role, is_active')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .single();
      
      adminUser = data;
      
      // 设置管理员状态cookie
      if (adminUser) {
        const cookieStore = await cookies();
        cookieStore.set('is_admin', 'true', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // 7天
          path: '/'
        });
      }
    }
    
    // 根据redirect参数决定跳转位置
    let redirectUrl = redirect;
    if (redirect.startsWith('/admin')) {
      // 如果是管理后台路径，但用户不是管理员，则重定向到未授权页面
      if (!adminUser) {
        redirectUrl = '/unauthorized';
      }
    }
    
    return new Response('Login successful', { 
      status: 302,
      headers: {
        'Location': `${process.env.NEXT_PUBLIC_SITE_URL}${redirectUrl}`
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}