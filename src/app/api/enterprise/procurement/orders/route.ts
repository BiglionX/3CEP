import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// 鍒濆鍖朣upabase瀹㈡埛const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token').value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: '鏈巿鏉冭 },
        { status: 401 }
      );
    }

    // 楠岃瘉鐢ㄦ埛韬唤
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '韬唤楠岃瘉澶辫触' },
        { status: 401 }
      );
    }

    // 鑾峰彇佷笟鐢ㄦ埛淇℃伅
    const { data: enterpriseUser, error: enterpriseError } = await supabase
      .from('enterprise_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (enterpriseError || !enterpriseUser) {
      return NextResponse.json(
        { success: false, error: '闈炰紒涓氱敤 },
        { status: 403 }
      );
    }

    // 鏌ヨ璇ヤ紒涓氱殑閲囪喘璁㈠崟
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('enterprise_procurement_orders')
      .select(
        `
        id,
        title,
        status,
        supplier,
        amount,
        items,
        created_at,
        expected_delivery,
        priority,
        description
      `
      )
      .eq('enterprise_id', enterpriseUser.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      console.error('鑾峰彇閲囪喘璁㈠崟澶辫触:', ordersError);
      return NextResponse.json(
        { success: false, error: '鑾峰彇閲囪喘璁㈠崟澶辫触' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: orders || [],
    });
  } catch (error: any) {
    console.error('鑾峰彇閲囪喘璁㈠崟閿欒:', error);
    return NextResponse.json(
      { success: false, error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token').value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: '鏈巿鏉冭 },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, items, expected_delivery, priority, supplier } =
      body;

    // 鍙傛暟楠岃瘉
    if (!title) {
      return NextResponse.json(
        { success: false, error: '璇彁渚涢噰璐鍗曟爣 },
        { status: 400 }
      );
    }

    // 楠岃瘉鐢ㄦ埛韬唤
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '韬唤楠岃瘉澶辫触' },
        { status: 401 }
      );
    }

    // 鑾峰彇佷笟鐢ㄦ埛淇℃伅
    const { data: enterpriseUser, error: enterpriseError } = await supabase
      .from('enterprise_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (enterpriseError || !enterpriseUser) {
      return NextResponse.json(
        { success: false, error: '闈炰紒涓氱敤 },
        { status: 403 }
      );
    }

    // 鍒涘缓閲囪喘璁㈠崟
    const { data: order, error: createError } = await supabase
      .from('enterprise_procurement_orders')
      .insert({
        enterprise_id: enterpriseUser.id,
        title,
        description: description || '',
        items: items || 1,
        expected_delivery: expected_delivery || null,
        priority: priority || 'medium',
        supplier: supplier || '寰呯‘,
        status: 'pending',
        amount: 0, // 鍒濆閲戦锛屽緟鎶ヤ环鍚庢洿      } as any)
      .select()
      .single();

    if (createError) {
      console.error('鍒涘缓閲囪喘璁㈠崟澶辫触:', createError);
      return NextResponse.json(
        { success: false, error: '鍒涘缓閲囪喘璁㈠崟澶辫触' },
        { status: 500 }
      );
    }

    // 璁板綍鎿嶄綔ュ織
    (await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'create_procurement_order',
      resource_type: 'enterprise_procurement_order',
      resource_id: order.id,
      details: {
        order_title: title,
        enterprise_id: enterpriseUser.id,
      } as any,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    })) as any;

    return NextResponse.json(
      {
        success: true,
        message: '閲囪喘璁㈠崟鍒涘缓鎴愬姛',
        data: order,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('鍒涘缓閲囪喘璁㈠崟閿欒:', error);
    return NextResponse.json(
      { success: false, error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 },
      { status: 500 }
    );
  }
}

