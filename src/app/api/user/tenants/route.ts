/**
 * 用户租户 API 端点
 * 提供用户可访问的租户列表和租户切换功能
 */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 创建 Supabase 客户端
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 从 cookies 获取会话信息
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('sb-access-token');

  try {
    // 验证用户认证
    if (!sessionCookie) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 设置认证令牌
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 获取用户关联的租户列表
    const { data: userTenants, error: userTenantError } = await supabase
      .from('user_tenants')
      .select(
        `
        id,
        tenant_id,
        role,
        is_primary,
        is_active,
        created_at,
        tenants (
          id,
          name,
          code,
          description,
          is_active
        )
      `
      )
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('is_primary', { ascending: false });

    if (userTenantError) {
      console.error('获取用户租户关联失败:', userTenantError);
      return NextResponse.json({ error: '获取租户信息失败' }, { status: 500 });
    }

    // 格式化返回数据
    const tenantList: any[] = [];
    if (userTenants) {
      for (const ut of userTenants) {
        // 使用索引访问解决类型推断问题
        const tenantObj = Array.isArray(ut.tenants)
          ? ut.tenants[0]
          : ut.tenants;

        tenantList.push({
          id: tenantObj?.id,
          name: tenantObj?.name,
          code: tenantObj?.code,
          description: tenantObj?.description,
          isActive: tenantObj?.is_active,
          userRole: ut.role,
          isPrimary: ut.is_primary,
          joinedAt: ut.created_at,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: tenantList,
      count: tenantList.length,
      currentUserId: user.id,
    });
  } catch (error: any) {
    console.error('用户租户 API 错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // 创建 Supabase 客户端
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 从 cookies 获取会话信息
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('sb-access-token');

  try {
    // 验证用户认证
    if (!sessionCookie) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 设置认证令牌
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 解析请求体
    const { tenantId } = await request.json();

    // 验证用户是否有权访问该租户
    const { data: userTenant, error: checkError } = await supabase
      .from('user_tenants')
      .select('id, tenant_id, role, is_active')
      .eq('user_id', user.id)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .single();

    if (checkError || !userTenant) {
      return NextResponse.json({ error: '无权访问该租户' }, { status: 403 });
    }

    // 设置租户 cookie（用于前端标识当前租户）
    const response = NextResponse.json({
      success: true,
      message: '租户切换成功',
      tenantId: tenantId,
      userRole: userTenant.role,
    });

    // 设置租户 cookie，有效期 7 天
    response.cookies.set('current-tenant-id', tenantId, {
      httpOnly: false, // 前端需要读取
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('租户切换 API 错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
