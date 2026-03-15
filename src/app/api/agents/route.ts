/**
 * 鏅鸿兘浣撶API 绔偣
 * 鎻愪緵鏅鸿兘浣撳垪琛ㄣ€佸垱寤恒€佹洿鏂般€佸垹闄ょ瓑鍔熻兘
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 楠岃瘉鐢ㄦ埛璁よ瘉
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-access-token');

    if (!sessionCookie) {
      return NextResponse.json({ error: '鐢ㄦ埛鏈 }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json({ error: '鐢ㄦ埛璁よ瘉澶辫触' }, { status: 401 });
    }

    // 鑾峰彇鏌ヨ鍙傛暟
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // 鏋勫缓鏌ヨ
    let query = supabase.from('agents').select('*', { count: 'exact' });

    // 搴旂敤杩囨护鏉′欢
    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // 鍒嗛〉
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const {
      data: agents,
      error,
      count,
    } = await query.order('updated_at', { ascending: false });

    if (error) {
      console.error('鑾峰彇鏅鸿兘浣撳垪琛ㄥけ', error);
      return NextResponse.json(
        { error: '鑾峰彇鏅鸿兘浣撳垪琛ㄥけ },'
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: agents || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('鏅鸿兘API 閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 楠岃瘉鐢ㄦ埛璁よ瘉
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-access-token');

    if (!sessionCookie) {
      return NextResponse.json({ error: '鐢ㄦ埛鏈 }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json({ error: '鐢ㄦ埛璁よ瘉澶辫触' }, { status: 401 });
    }

    // 瑙ｆ瀽璇眰    const body = await request.json();

    // 楠岃瘉蹇呰瀛楁
    if (!body.name || !body.configuration) {
      return NextResponse.json(
        { error: '鏅鸿兘浣撳悕绉板拰閰嶇疆涓哄繀濉」' },
        { status: 400 }
      );
    }

    // 鍒涘缓鏅鸿兘    const { data: agent, error } = await supabase
      .from('agents')
      .insert({
        name: body.name.trim(),
        description: body.trim() || null,
        configuration: body.configuration,
        status: body.status || 'inactive',
        version: '1.0.0',
        created_by: user.id,
        updated_by: user.id,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('鍒涘缓鏅鸿兘浣撳け', error);
      return NextResponse.json(
        { error: '鍒涘缓鏅鸿兘浣撳け, details: error.message },'
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: '鏅鸿兘浣撳垱寤烘垚,'
        data: agent,
      },
      { status: 201 }
    ) as any;
  } catch (error: any) {
    console.error('鍒涘缓鏅鸿兘浣撻敊', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }
}


