/**
 * 鐢ㄦ埛绉熸埛 API 绔偣
 * 鎻愪緵鐢ㄦ埛鍙闂殑绉熸埛鍒楄〃鍜岀鎴峰垏鎹㈠姛? */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 鍒涘缓 Supabase 瀹㈡埛?  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 锟?cookies 鑾峰彇浼氳瘽淇℃伅
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('sb-access-token');

  try {
    // 楠岃瘉鐢ㄦ埛璁よ瘉
    if (!sessionCookie) {
      return NextResponse.json({ error: '鏈巿鏉冭? }, { status: 401 });
    }

    // 璁剧疆璁よ瘉浠ょ墝
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json({ error: '鏈巿鏉冭? }, { status: 401 });
    }

    // 鑾峰彇鐢ㄦ埛鍏宠仈鐨勭鎴峰垪?    const { data: userTenants, error: userTenantError } = await supabase
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
      console.error('鑾峰彇鐢ㄦ埛绉熸埛鍏宠仈澶辫触:', userTenantError);
      return NextResponse.json({ error: '鑾峰彇绉熸埛淇℃伅澶辫触' }, { status: 500 });
    }

    // 鏍煎紡鍖栬繑鍥炴暟?    const tenantList: any[] = [];
    if (userTenants) {
      for (const ut of userTenants) {
        // 浣跨敤绱㈠紩璁块棶瑙ｅ喅绫诲瀷鎺ㄦ柇闂
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
    console.error('鐢ㄦ埛绉熸埛 API 閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊? }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // 鍒涘缓 Supabase 瀹㈡埛?  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 锟?cookies 鑾峰彇浼氳瘽淇℃伅
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('sb-access-token');

  try {
    // 楠岃瘉鐢ㄦ埛璁よ瘉
    if (!sessionCookie) {
      return NextResponse.json({ error: '鏈巿鏉冭? }, { status: 401 });
    }

    // 璁剧疆璁よ瘉浠ょ墝
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json({ error: '鏈巿鏉冭? }, { status: 401 });
    }

    // 瑙ｆ瀽璇锋眰?    const { tenantId } = await request.json();

    // 楠岃瘉鐢ㄦ埛鏄惁鏈夋潈璁块棶璇ョ?    const { data: userTenant, error: checkError } = await supabase
      .from('user_tenants')
      .select('id, tenant_id, role, is_active')
      .eq('user_id', user.id)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .single();

    if (checkError || !userTenant) {
      return NextResponse.json({ error: '鏃犳潈璁块棶璇ョ? }, { status: 403 });
    }

    // 璁剧疆绉熸埛 cookie锛堢敤浜庡墠绔爣璇嗗綋鍓嶇鎴凤級
    const response = NextResponse.json({
      success: true,
      message: '绉熸埛鍒囨崲鎴愬姛',
      tenantId: tenantId,
      userRole: userTenant.role,
    });

    // 璁剧疆绉熸埛 cookie锛屾湁鏁堟湡 7 锟?    response.cookies.set('current-tenant-id', tenantId, {
      httpOnly: false, // 鍓嶇闇€瑕佽?      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('绉熸埛鍒囨崲 API 閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊? }, { status: 500 });
  }
}

