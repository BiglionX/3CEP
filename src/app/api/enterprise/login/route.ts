import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// 鍒濆鍖朣upabase瀹㈡埛?const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 鍙傛暟楠岃瘉
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '璇锋彁渚涢偖绠卞拰瀵嗙爜' },
        { status: 400 }
      );
    }

    // 鐢ㄦ埛鐧诲綍
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('鐧诲綍澶辫触:', error);
      return NextResponse.json(
        { success: false, error: '閭鎴栧瘑鐮侀敊? },
        { status: 401 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { success: false, error: '鐧诲綍澶辫触' },
        { status: 401 }
      );
    }

    // 妫€鏌ユ槸鍚︿负浼佷笟鐢ㄦ埛
    const { data: enterpriseProfile, error: profileError } = await supabase
      .from('enterprise_users')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    if (profileError || !enterpriseProfile) {
      // 涓嶆槸浼佷笟鐢ㄦ埛锛岃繑鍥為敊?      return NextResponse.json(
        { success: false, error: '璇ヨ处鎴蜂笉鏄紒涓氳处? },
        { status: 403 }
      );
    }

    // 妫€鏌ヤ紒涓氳处鎴风姸?    if (enterpriseProfile.status !== 'approved') {
      return NextResponse.json(
        {
          success: false,
          error: '浼佷笟璐︽埛鏈€氳繃瀹℃牳',
          status: enterpriseProfile.status,
        },
        { status: 403 }
      );
    }

    // 璁剧疆璁よ瘉cookie
    const cookieStore = await cookies();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      cookieStore.set('sb-access-token', session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: session.expires_in,
        path: '/',
        sameSite: 'lax',
      });

      cookieStore.set('sb-refresh-token', session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
        sameSite: 'lax',
      });
    }

    // 璁板綍鐧诲綍鏃ュ織
    (await supabase.from('audit_logs').insert({
      user_id: data.user.id,
      action: 'enterprise_login',
      resource_type: 'enterprise_user',
      resource_id: enterpriseProfile.id,
      details: {
        email: email,
        company_name: enterpriseProfile.company_name,
      } as any,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    })) as any;

    return NextResponse.json({
      success: true,
      message: '鐧诲綍鎴愬姛',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          company_name: enterpriseProfile.company_name,
          contact_person: enterpriseProfile.contact_person,
        },
        session: {
          access_token: session?.access_token,
          expires_at: session?.expires_at,
        },
      },
    });
  } catch (error: any) {
    console.error('浼佷笟鐧诲綍閿欒:', error);
    return NextResponse.json(
      { success: false, error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊? },
      { status: 500 }
    );
  }
}

