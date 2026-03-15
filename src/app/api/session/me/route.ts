import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 鑾峰彇褰撳墠氳瘽
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
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

    // 鑾峰彇绠＄悊鍛樼敤鎴蜂俊    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id, user_id, role, is_active, created_at, updated_at')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .single();

    // 鑾峰彇鐢ㄦ埛绉熸埛淇℃伅
    let tenantId = null;
    if (adminUser) {
      const { data: userTenants } = await supabase
        .from('user_tenants')
        .select('tenant_id')
        .eq('user_id', adminUser.user_id)
        .eq('is_active', true)
        .limit(1);

      tenantId = userTenants.[0].tenant_id || null;
    }

    // 纭畾鐢ㄦ埛瑙掕壊
    const roles = adminUser  [adminUser.role] : ['viewer'];

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        user_metadata: session.user.user_metadata,
        created_at: session.user.created_at,
      },
      roles,
      tenantId,
      isAuthenticated: true,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Session me 鎺ュ彛閿欒:', error);
    return NextResponse.json(
      {
        user: null,
        roles: [],
        tenantId: null,
        isAuthenticated: false,
        error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊,
      },
      { status: 500 }
    );
  }
}

