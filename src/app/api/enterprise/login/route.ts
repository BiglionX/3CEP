import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 参数验证
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '请提供邮箱和密码' },
        { status: 400 }
      );
    }

    // 用户登录
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('登录失败:', error);
      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { success: false, error: '登录失败' },
        { status: 401 }
      );
    }

    // 检查是否为企业用户
    const { data: enterpriseProfile, error: profileError } = await supabase
      .from('enterprise_users')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    if (profileError || !enterpriseProfile) {
      // 不是企业用户，返回错误
      return NextResponse.json(
        { success: false, error: '该账户不是企业账户' },
        { status: 403 }
      );
    }

    // 检查企业账户状态
    if (enterpriseProfile.status !== 'approved') {
      return NextResponse.json(
        { 
          success: false, 
          error: '企业账户未通过审核',
          status: enterpriseProfile.status
        },
        { status: 403 }
      );
    }

    // 设置认证cookie
    const cookieStore = await cookies();
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      cookieStore.set('sb-access-token', session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: session.expires_in,
        path: '/',
        sameSite: 'lax'
      });
      
      cookieStore.set('sb-refresh-token', session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
        sameSite: 'lax'
      });
    }

    // 记录登录日志
    await supabase.from('audit_logs').insert({
      user_id: data.user.id,
      action: 'enterprise_login',
      resource_type: 'enterprise_user',
      resource_id: enterpriseProfile.id,
      details: {
        email: email,
        company_name: enterpriseProfile.company_name
      } as any,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          company_name: enterpriseProfile.company_name,
          contact_person: enterpriseProfile.contact_person
        },
        session: {
          access_token: session?.access_token,
          expires_at: session?.expires_at
        }
      }
    });

  } catch (error: any) {
    console.error('企业登录错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}