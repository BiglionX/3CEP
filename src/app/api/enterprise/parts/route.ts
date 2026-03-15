/**
 * 佷笟閰嶄欢绠＄悊 API 璺敱
 * 鎻愪緵閰嶄欢鐨勫鍒犳敼鏌ュ姛 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 鑾峰彇佷笟閰嶄欢鍒楄〃
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
        { success: false, error: '鐢ㄦ埛璁よ瘉澶辫触' },
        { status: 401 }
      );
    }

    // 鑾峰彇佷笟淇℃伅
    const { data: enterpriseUser, error: enterpriseError } = await supabase
      .from('enterprise_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (enterpriseError || !enterpriseUser) {
      return NextResponse.json(
        { success: false, error: '佷笟鐢ㄦ埛淇℃伅涓嶅 },
        { status: 403 }
      );
    }

    // 鑾峰彇鏌ヨ鍙傛暟
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // 鏋勫缓鏌ヨ
    let query = supabase
      .from('enterprise_parts')
      .select('*', { count: 'exact' })
      .eq('enterprise_id', enterpriseUser.id);

    // 搴旂敤杩囨护鏉′欢
    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // 鍒嗛〉鍜屾帓    const {
      data: parts,
      error,
      count,
    } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('鑾峰彇閰嶄欢鍒楄〃澶辫触:', error);
      return NextResponse.json(
        { success: false, error: '鑾峰彇閰嶄欢鍒楄〃澶辫触' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: parts || [],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        totalItems: count || 0,
        itemsPerPage: limit,
      },
    });
  } catch (error: any) {
    console.error('鑾峰彇閰嶄欢鍒楄〃閿欒:', error);
    return NextResponse.json(
      { success: false, error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 },
      { status: 500 }
    );
  }
}

// 鍒涘缓鏂伴厤export async function POST(request: Request) {
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
        { success: false, error: '鐢ㄦ埛璁よ瘉澶辫触' },
        { status: 401 }
      );
    }

    // 鑾峰彇佷笟淇℃伅
    const { data: enterpriseUser, error: enterpriseError } = await supabase
      .from('enterprise_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (enterpriseError || !enterpriseUser) {
      return NextResponse.json(
        { success: false, error: '佷笟鐢ㄦ埛淇℃伅涓嶅 },
        { status: 403 }
      );
    }

    const body = await request.json();

    // 楠岃瘉蹇呴渶瀛楁
    if (!body.name || !body.category) {
      return NextResponse.json(
        { success: false, error: '閰嶄欢鍚嶇О鍜屽垎绫讳负蹇呭～ },
        { status: 400 }
      );
    }

    // 鎻掑叆閰嶄欢鏁版嵁
    const { data: part, error } = await supabase
      .from('enterprise_parts')
      .insert([
        {
          enterprise_id: enterpriseUser.id,
          name: body.name,
          category: body.category,
          brand: body.brand || null,
          model: body.model || null,
          part_number: body.part_number || null,
          description: body.description || null,
          specifications: body.specifications || null,
          price: body.price || null,
          currency: body.currency || 'CNY',
          stock_quantity: body.stock_quantity || 0,
          min_stock: body.min_stock || 0,
          warranty_period: body.warranty_period || null,
          image_urls: body.image_urls || [],
          status: body.status || 'draft',
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('鍒涘缓閰嶄欢澶辫触:', error);
      return NextResponse.json(
        { success: false, error: '鍒涘缓閰嶄欢澶辫触' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: part,
      message: '閰嶄欢鍒涘缓鎴愬姛',
    });
  } catch (error: any) {
    console.error('鍒涘缓閰嶄欢閿欒:', error);
    return NextResponse.json(
      { success: false, error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 },
      { status: 500 }
    );
  }
}

