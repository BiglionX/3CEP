import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const redirect = url.searchParams.get('redirect') || '/';

  if (!code) {
    return new Response('Missing code parameter', { status: 400 });
  }

  // 鍒涘缓Supabase瀹㈡埛  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let adminUser = null;

  try {
    // 浣跨敤Supabase杩涜Google鐧诲綍
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

    // 鐧诲綍鎴愬姛鍚庣殑澶勭悊
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session.user) {
      // 妫€鏌ユ槸鍚︿负绠＄悊鍛樺苟璁剧疆鐩稿簲cookie
      const { data } = await supabase
        .from('admin_users')
        .select('id, role, is_active')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .single();

      adminUser = data;

      // 璁剧疆绠＄悊鍛樼姸鎬乧ookie
      if (adminUser) {
        const cookieStore = await cookies();
        cookieStore.set('is_admin', 'true', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // 7          path: '/',
        });
      }
    }

    // 鏍规嵁redirect鍙傛暟鍐冲畾璺宠浆浣嶇疆
    let redirectUrl = redirect;
    if (redirect.startsWith('/admin')) {
      // 濡傛灉鏄鐞嗗悗鍙拌矾寰勶紝浣嗙敤鎴蜂笉鏄鐞嗗憳锛屽垯閲嶅畾鍚戝埌鏈巿鏉冮〉      if (!adminUser) {
        redirectUrl = '/unauthorized';
      }
    }

    return new Response('Login successful', {
      status: 302,
      headers: {
        Location: `${process.env.NEXT_PUBLIC_SITE_URL}${redirectUrl}`,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}


