import {
  getAuthCookieName,
  parseSessionCookie,
} from '@/lib/utils/cookie-utils';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();

  // 获取 cookie 名称
  const cookieName = getAuthCookieName(process.env.NEXT_PUBLIC_SUPABASE_URL);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 尝试从 cookie 获取 token
    const sessionCookie = cookieStore.get(cookieName);

    if (!sessionCookie?.value) {
      console.warn('[Session API] Cookie 不存在:', cookieName);
      return NextResponse.json(
        {
          user: null,
          roles: [],
          tenantId: null,
          isAuthenticated: false,
        },
        { status: 401 }
      );
    }

    // 解析 cookie 获取 access_token
    let accessToken: string | null = null;
    try {
      const sessionData = parseSessionCookie(sessionCookie.value);
      accessToken = sessionData?.access_token || null;
    } catch (parseError) {
      console.warn('[Session API] Cookie 解析失败');
      return NextResponse.json(
        {
          user: null,
          roles: [],
          tenantId: null,
          isAuthenticated: false,
        },
        { status: 401 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        {
          user: null,
          roles: [],
          tenantId: null,
          isAuthenticated: false,
        },
        { status: 401 }
      );
    }

    // 使用 token 获取用户信息
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      console.warn('[Session API] Token 无效:', userError?.message);
      return NextResponse.json(
        {
          user: null,
          roles: [],
          tenantId: null,
          isAuthenticated: false,
        },
        { status: 401 }
      );
    }

    // 获取管理员用户信息
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id, user_id, role, is_active, created_at, updated_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    // 获取用户租户信息
    let tenantId = null;
    if (adminUser) {
      const { data: userTenants } = await supabase
        .from('user_tenants')
        .select('tenant_id')
        .eq('user_id', adminUser.user_id)
        .eq('is_active', true)
        .limit(1);

      tenantId = userTenants?.[0]?.tenant_id || null;
    }

    // 确定用户角色
    const roles = adminUser ? [adminUser.role] : ['viewer'];

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        created_at: user.created_at,
      },
      roles,
      tenantId,
      isAuthenticated: true,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Session me 接口错误:', error);
    return NextResponse.json(
      {
        user: null,
        roles: [],
        tenantId: null,
        isAuthenticated: false,
        error: '服务器内部错误',
      },
      { status: 500 }
    );
  }
}
