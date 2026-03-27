import {
  getAuthCookieName,
  parseSessionCookie,
} from '@/lib/utils/cookie-utils';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();

  // 获取 cookie 名称
  const cookieName = getAuthCookieName(process.env.NEXT_PUBLIC_SUPABASE_URL);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 尝试从多种来源获取 token
    let accessToken: string | null = null;
    let sessionData: any = null;

    // 1. 优先从 Cookie 获取
    const sessionCookie = cookieStore.get(cookieName);
    if (sessionCookie?.value) {
      console.log('[Session API] ✅ 从 Cookie 获取到 token');
      try {
        sessionData = parseSessionCookie(sessionCookie.value);
        accessToken = sessionData?.access_token || null;
      } catch (parseError) {
        console.warn('[Session API] Cookie 解析失败:', parseError);
      }
    }

    // 2. 如果 Cookie 没有，尝试从 Authorization Header 获取
    if (!accessToken) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        console.log('[Session API] ✅ 从 Authorization Header 获取到 token');
        accessToken = authHeader.substring(7);
        sessionData = { access_token: accessToken };
      }
    }

    // 3. 如果还是没有，尝试从自定义 Header 获取
    if (!accessToken) {
      const tokenFromHeader = request.headers.get('x-auth-token');
      if (tokenFromHeader) {
        console.log('[Session API] ✅ 从 X-Auth-Token Header 获取到 token');
        accessToken = tokenFromHeader;
        sessionData = { access_token: accessToken };
      }
    }

    // 如果所有方式都没获取到 token
    if (!accessToken) {
      console.warn('[Session API] ❌ 未找到 token (Cookie 或 Header)');
      console.log(
        '[Session API] 所有 cookies:',
        cookieStore.getAll().map(c => c.name)
      );
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

    console.log(
      '[Session API] Token 前缀:',
      `${accessToken.substring(0, 30)}...`
    );

    if (!accessToken) {
      console.error('[Session API] 未找到 access_token');
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

    console.log('[Session API] Supabase auth.getUser result:', {
      hasUser: !!user,
      error: userError?.message,
      userId: user?.id,
    });

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
