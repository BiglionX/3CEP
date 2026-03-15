import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// GET /api/enterprise/manuals - 鑾峰彇璇存槑涔﹀垪export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 鑾峰彇璁よ瘉鐢ㄦ埛
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '鏈巿鏉冭 },
        { status: 401 }
      );
    }

    // 鑾峰彇鐢ㄦ埛瀵瑰簲鐨勪紒涓欼D
    const { data: enterpriseUser, error: enterpriseError } = await supabase
      .from('enterprise_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (enterpriseError || !enterpriseUser) {
      return NextResponse.json(
        { success: false, error: '佷笟璐︽埛涓嶅 },
        { status: 404 }
      );
    }

    // 瑙ｆ瀽鏌ヨ鍙傛暟
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const productModel = searchParams.get('product_model') || '';

    // 鏋勫缓鏌ヨ
    let query = supabase
      .from('enterprise_manuals')
      .select('*')
      .eq('enterprise_id', enterpriseUser.id);

    // 娣诲姞鎼滅储鏉′欢
    if (search) {
      query = query.or(
        `product_name.ilike.%${search}%,title->>zh.ilike.%${search}%`
      );
    }

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (productModel) {
      query = query.eq('product_model', productModel);
    }

    // 鎺掑簭
    query = query.order('created_at', { ascending: false });

    const { data: manuals, error } = await query;

    if (error) {
      console.error('鑾峰彇璇存槑涔﹀垪琛ㄩ敊', error);
      return NextResponse.json(
        { success: false, error: '鑾峰彇璇存槑涔﹀垪琛ㄥけ },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: manuals });
  } catch (error) {
    console.error('鏈嶅姟鍣ㄩ敊', error);
    return NextResponse.json(
      { success: false, error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 },
      { status: 500 }
    );
  }
}

// POST /api/enterprise/manuals - 鍒涘缓鏂拌鏄庝功
export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '鏈巿鏉冭 },
        { status: 401 }
      );
    }

    const { data: enterpriseUser, error: enterpriseError } = await supabase
      .from('enterprise_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (enterpriseError || !enterpriseUser) {
      return NextResponse.json(
        { success: false, error: '佷笟璐︽埛涓嶅 },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      product_name,
      product_model,
      title,
      content,
      language_codes,
      cover_image_url,
      attachment_urls,
    } = body;

    // 楠岃瘉蹇呭～瀛楁
    if (!product_name || !title || !content) {
      return NextResponse.json(
        { success: false, error: '缂哄皯蹇呰瀛楁' },
        { status: 400 }
      );
    }

    // 楠岃瘉澶氳瑷€瀛楁鏍煎紡
    if (!title.zh || !content.zh) {
      return NextResponse.json(
        { success: false, error: '鑷冲皯闇€瑕佹彁渚涗腑鏂囨爣棰樺拰鍐呭' },
        { status: 400 }
      );
    }

    const { data: manual, error } = await supabase
      .from('enterprise_manuals')
      .insert({
        enterprise_id: enterpriseUser.id,
        product_name,
        product_model: product_model || '',
        title,
        content,
        language_codes: language_codes || ['zh'],
        cover_image_url: cover_image_url || '',
        attachment_urls: attachment_urls || [],
        created_by: user.id,
        status: 'draft',
      } as any)
      .select()
      .single();

    if (error) {
      console.error('鍒涘缓璇存槑涔﹂敊', error);
      return NextResponse.json(
        { success: false, error: '鍒涘缓璇存槑涔﹀け },
        { status: 500 }
      ) as any;
    }

    return NextResponse.json({ success: true, data: manual });
  } catch (error) {
    console.error('鏈嶅姟鍣ㄩ敊', error);
    return NextResponse.json(
      { success: false, error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 },
      { status: 500 }
    );
  }
}

