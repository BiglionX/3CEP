import {
  getAuthCookieName,
  serializeSessionCookie,
} from '@/lib/utils/cookie-utils';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 验证输入参数
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }

    // 使用 Supabase 进行邮箱密码登录
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('登录失败:', error);

      // 处理具体错误信息
      let errorMessage = '登录失败';
      if (error.code === 'invalid_credentials') {
        errorMessage = '邮箱或密码错误';
      } else if (error.code === 'over_email_send_rate_limit') {
        errorMessage = '邮件发送过于频繁，请稍后重试或检查垃圾邮件';
      } else if (error.code === 'email_address_invalid') {
        errorMessage = '邮箱格式不正确';
      } else if (error.code) {
        errorMessage = `登录失败：${error.code}`;
      }

      return NextResponse.json({ error: errorMessage }, { status: 401 });
    }

    // 检查是否为管理员用户
    let isAdmin = false;
    if (data.user) {
      console.log('用户登录成功:', data.user.email);

      // 首先检查用户元数据中的管理员标识
      if ((data.user as any).isAdmin === true) {
        isAdmin = true;
        console.log('通过用户元数据验证为管理员');
      } else {
        // 备用方案：检查数据库中的管理员记录
        try {
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('id, role, is_active')
            .eq('user_id', data.user.id)
            .eq('is_active', true)
            .single();

          isAdmin = !!adminData;
          if (isAdmin) {
            console.log('通过数据库验证为管理员');
          }
        } catch (dbError) {
          // 数据库表不存在或查询失败，使用用户元数据作为判断依据
          console.log('数据库管理员检查失败，使用用户元数据判断');
        }
      }

      console.log('最终管理员状态', isAdmin);
    }

    // 设置认证 cookie
    const cookieName = getAuthCookieName(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const cookieValue = serializeSessionCookie(data.session);

    console.log('[Login API] 设置 cookie:', {
      name: cookieName,
      valueLength: cookieValue?.length || 0,
      hasSession: !!data.session,
      hasAccessToken: !!data.session?.access_token,
      environment: process.env.NODE_ENV,
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        is_admin: isAdmin,
      },
      session: data.session,
      message: '登录成功',
    });

    // 设置 cookie - 使用更宽松的配置
    response.cookies.set(cookieName, cookieValue, {
      httpOnly: true,
      secure: false, // 开发环境使用 HTTP
      sameSite: 'lax',
      maxAge: 3600, // 1 小时
      path: '/',
      domain: undefined, // 不指定 domain，使用当前域名
    });

    console.log('[Login API] Cookie 设置完成，验证是否生效...');

    // 立即读取验证
    const verifyCookie = response.cookies.get(cookieName);
    console.log(
      '[Login API] Cookie 验证结果:',
      verifyCookie ? '✅ 设置成功' : '❌ 设置失败'
    );

    return response;
  } catch (error) {
    console.error('登录接口错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
