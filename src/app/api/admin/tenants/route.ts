/**
 * 绉熸埛绠＄悊 API 璺敱
 * 鎻愪緵绉熸埛鍒涘缓銆佺鐞嗐€佺敤鎴峰垎閰嶇瓑鍔熻兘
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // 楠岃瘉鐢ㄦ埛鏉冮檺
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    // 妫€鏌ユ槸鍚︿负绠＄悊    const isAdmin = await checkAdminUser(user.id, supabase);
    if (!isAdmin) {
      return NextResponse.json({ error: '鏉冮檺涓嶈冻' }, { status: 403 });
    }

    // 鑾峰彇鏌ヨ鍙傛暟
    const { searchParams } = new URL(request.url);
    const includeUsers = searchParams.get('includeUsers') === 'true';
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let query = supabase.from('tenants').select(`
        id,
        name,
        code,
        description,
        is_active,
        created_at,
        updated_at
      `);

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: tenants, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      return NextResponse.json(
        { error: '鑾峰彇绉熸埛鍒楄〃澶辫触', details: error.message },
        { status: 500 }
      );
    }

    // 濡傛灉闇€瑕佸寘鍚敤鎴蜂俊    if (includeUsers && tenants.length > 0) {
      const tenantIds = tenants.map((t: any) => t.id);

      const { data: userTenants, error: userError } = await supabase
        .from('user_tenants')
        .select(
          `
          id,
          user_id,
          tenant_id,
          role,
          is_primary,
          is_active,
          created_at,
          profiles(username, email)
        `
        )
        .in('tenant_id', tenantIds)
        .eq('is_active', true);

      if (!userError) {
        // 灏嗙敤鎴蜂俊鎭叧鑱斿埌绉熸埛
        tenants.forEach((tenant: any) => {
          tenant.users = userTenants
            .filter((ut: any) => ut.tenant_id === tenant.id)
            .map((ut: any) => ({
              id: ut.user_id,
              username: ut.username || '鏈煡鐢ㄦ埛',
              email: ut.email || '鏈煡',
              role: ut.role,
              is_primary: ut.is_primary,
            }));
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: tenants,
      count: tenants.length,
    });
  } catch (error) {
    console.error('绉熸埛鍒楄〃鑾峰彇閿欒:', error);
    return NextResponse.json(
      { error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊, details: (error as Error).message },
      { status: 500 }
    );
  }

    },
    'tenants_read'
  );

export async function POST(request: NextRequest) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // 楠岃瘉鐢ㄦ埛鏉冮檺
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    // 妫€鏌ユ槸鍚︿负绠＄悊    const isAdmin = await checkAdminUser(user.id, supabase);
    if (!isAdmin) {
      return NextResponse.json({ error: '鏉冮檺涓嶈冻' }, { status: 403 });
    }

    // 瑙ｆ瀽璇眰    const body = await request.json();
    const { name, code, description } = body;

    // 楠岃瘉蹇呭～瀛楁
    if (!name || !code) {
      return NextResponse.json(
        { error: '绉熸埛鍚嶇О鍜岀紪鐮佷负蹇呭～ },
        { status: 400 }
      );
    }

    // 妫€鏌ョ紪鐮佸敮涓€    const { data: existingTenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('code', code)
      .single();

    if (existingTenant) {
      return NextResponse.json({ error: '绉熸埛缂栫爜宸插 }, { status: 409 });
    }

    // 鍒涘缓绉熸埛
    const { data: tenant, error } = await supabase
      .from('tenants')
      .insert({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim() || null,
        is_active: true,
      } as any)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: '鍒涘缓绉熸埛澶辫触', details: error.message },
        { status: 500 }
      );
    }

    // 鑷姩灏嗗垱寤鸿€呰涓虹鎴风鐞嗗憳
    const { error: assignError } = await supabase.from('user_tenants').insert({
      user_id: user.id,
      tenant_id: tenant.id,
      role: 'admin',
      is_primary: true,
      is_active: true,
    } as any);

    if (assignError) {
      console.warn('鑷姩鍒嗛厤绉熸埛绠＄悊鍛樺け', assignError);
    }

    // 璁板綍瀹¤ュ織
    await logAuditEvent(
      'tenant_create',
      user.id,
      'tenants',
      { tenant_id: tenant.id, tenant_name: tenant.name },
      supabase
    );

    return NextResponse.json(
      {
        success: true,
        message: '绉熸埛鍒涘缓鎴愬姛',
        data: tenant,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('绉熸埛鍒涘缓閿欒:', error);
    return NextResponse.json(
      { error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊, details: (error as Error).message },
      { status: 500 }
    );
  }

    },
    'tenants_read'
  );

// PUT /api/admin/tenants/[id] - 鏇存柊绉熸埛
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  const supabase = createRouteHandlerClient({ cookies }) as any;
  const tenantId = params.id;

  try {
    // 楠岃瘉鐢ㄦ埛鏉冮檺
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    // 妫€鏌ユ槸鍚︿负绠＄悊    const isAdmin = await checkAdminUser(user.id, supabase);
    if (!isAdmin) {
      return NextResponse.json({ error: '鏉冮檺涓嶈冻' }, { status: 403 });
    }

    // 瑙ｆ瀽璇眰    const body = await request.json();
    const { name, description, is_active } = body;

    // 鏋勫缓鏇存柊鏁版嵁
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined)
      updateData.description = description.trim() || null;
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);

    // 鏇存柊绉熸埛
    const { data: tenant, error } = await supabase
      .from('tenants')
      .update(updateData)
      .eq('id', tenantId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: '鏇存柊绉熸埛澶辫触', details: error.message },
        { status: 500 }
      );
    }

    if (!tenant) {
      return NextResponse.json({ error: '绉熸埛涓嶅 }, { status: 404 });
    }

    // 璁板綍瀹¤ュ織
    await logAuditEvent(
      'tenant_update',
      user.id,
      'tenants',
      { tenant_id: tenantId, changes: updateData },
      supabase
    );

    return NextResponse.json({
      success: true,
      message: '绉熸埛鏇存柊鎴愬姛',
      data: tenant,
    });
  } catch (error) {
    console.error('绉熸埛鏇存柊閿欒:', error);
    return NextResponse.json(
      { error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊, details: error.message },
      { status: 500 }
    );
  }

    },
    'tenants_read'
  );

// DELETE /api/admin/tenants/[id] - 鍒犻櫎绉熸埛
export async function DELETE(request, { params }) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  const supabase = createRouteHandlerClient({ cookies });
  const tenantId = params.id;

  try {
    // 楠岃瘉鐢ㄦ埛鏉冮檺
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    // 妫€鏌ユ槸鍚︿负绠＄悊    const isAdmin = await checkAdminUser(user.id, supabase);
    if (!isAdmin) {
      return NextResponse.json({ error: '鏉冮檺涓嶈冻' }, { status: 403 });
    }

    // 妫€鏌ョ鎴槸鍚﹀    const { data: tenant } = await supabase
      .from('tenants')
      .select('name, code')
      .eq('id', tenantId)
      .single();

    if (!tenant) {
      return NextResponse.json({ error: '绉熸埛涓嶅 }, { status: 404 });
    }

    // 妫€鏌ユ槸鍚︿负涓荤    if (tenant.code === 'MAIN') {
      return NextResponse.json({ error: '涓嶈兘鍒犻櫎涓荤 }, { status: 400 });
    }

    // 妫€鏌ョ鎴槸鍚﹁繕鏈夋椿璺冪敤    const { data: activeUsers } = await supabase
      .from('user_tenants')
      .select('count()', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('is_active', true);

    if (activeUsers && activeUsers.count > 0) {
      return NextResponse.json(
        { error: '绉熸埛嶆湁娲昏穬鐢ㄦ埛锛屼笉鑳藉垹 },
        { status: 400 }
      );
    }

    // 杞垹闄わ細鏍囪涓洪潪娲昏穬
    const { error } = await supabase
      .from('tenants')
      .update({ is_active: false } as any)
      .eq('id', tenantId);

    if (error) {
      return NextResponse.json(
        { error: '鍒犻櫎绉熸埛澶辫触', details: error.message },
        { status: 500 }
      );
    }

    // 璁板綍瀹¤ュ織
    await logAuditEvent(
      'tenant_delete',
      user.id,
      'tenants',
      { tenant_id: tenantId, tenant_name: tenant.name },
      supabase
    );

    return NextResponse.json({
      success: true,
      message: '绉熸埛鍒犻櫎鎴愬姛',
    });
  } catch (error) {
    console.error('绉熸埛鍒犻櫎閿欒:', error);
    return NextResponse.json(
      { error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊, details: error.message },
      { status: 500 }
    );
  }

    },
    'tenants_read'
  );

// 杈呭姪鍑芥暟
async function checkAdminUser(userId, supabase) {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    return !error && data !== null;
  } catch (error) {
    console.error('妫€鏌ョ鐞嗗憳韬唤澶辫触:', error);
    return false;
  }
}

async function logAuditEvent(action, userId, resource, changes, supabase) {
  try {
    // 杩欓噷搴旇璋冪敤瀹¤ュ織绯荤粺
    console.log(`瀹¤ュ織: ${action} by ${userId} on ${resource}`, changes);
  } catch (error) {
    console.error('璁板綍瀹¤ュ織澶辫触:', error);
  }
}

