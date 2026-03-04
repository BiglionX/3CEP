import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 鍒濆鍖朣upabase瀹㈡埛?const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 瀵煎叆mock鏁版嵁鐗堟湰
import { GET as MOCK_GET } from './mock-route';

// 濡傛灉鏁版嵁搴撹〃涓嶅瓨鍦紝鍒欎娇鐢╩ock鏁版嵁
let useMock = false;

// 妫€鏌ユ槸鍚﹀彲浠ヨ繛鎺ュ埌鐪熷疄鏁版嵁?async function checkDatabaseConnection() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/repair_tutorials?select=*&limit=1`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          Authorization: `Bearer ${
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
          }`,
        },
      }
    );
    useMock = !response.ok;
  } catch (error) {
    useMock = true;
  }
}

// GET /api/tutorials
export async function GET(request: Request) {
  await checkDatabaseConnection();
  if (useMock) {
    return MOCK_GET(request);
  }

  // 鍘熸湁鐨勭湡瀹炴暟鎹簱閫昏緫
  try {
    const { searchParams } = new URL(request.url);

    // 鑾峰彇鏌ヨ鍙傛暟
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const deviceModel = searchParams.get('deviceModel');
    const faultType = searchParams.get('faultType');
    const status = searchParams.get('status') || 'published';
    const search = searchParams.get('search');

    // 璁＄畻鍋忕Щ?    const offset = (page - 1) * pageSize;

    // 鏋勫缓鏌ヨ
    let query = supabase
      .from('repair_tutorials')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .range(offset, offset + pageSize - 1)
      .order('created_at', { ascending: false });

    // 娣诲姞杩囨护鏉′欢
    if (deviceModel) {
      query = query.eq('device_model', deviceModel);
    }

    if (faultType) {
      query = query.eq('fault_type', faultType);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('鑾峰彇鏁欑▼鍒楄〃澶辫触:', error);
      return NextResponse.json(
        { error: '鑾峰彇鏁欑▼鍒楄〃澶辫触', details: error.message },
        { status: 500 }
      );
    }

    // 璁＄畻鍒嗛〉淇℃伅
    const totalPages = Math.ceil((count || 0) / pageSize);

    return NextResponse.json({
      tutorials: data,
      pagination: {
        currentPage: page,
        pageSize,
        totalCount: count || 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('API閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊? }, { status: 500 });
  }
}

// POST /api/tutorials - 鍒涘缓鏂版暀绋嬶紙闇€瑕佽璇侊級
export async function POST(request: Request) {
  try {
    // 杩欓噷搴旇娣诲姞璁よ瘉妫€?    // 鏆傛椂鍏佽鎵€鏈夎姹傦紝鍚庣画娣诲姞JWT楠岃瘉

    const tutorialData = await request.json();

    // 楠岃瘉蹇呴渶瀛楁
    if (
      !tutorialData.title ||
      !tutorialData.device_model ||
      !tutorialData.fault_type
    ) {
      return NextResponse.json(
        { error: '缂哄皯蹇呴渶瀛楁: title, device_model, fault_type' },
        { status: 400 }
      );
    }

    // 璁剧疆榛樿?    const tutorial = {
      ...tutorialData,
      steps: tutorialData.steps || [],
      tools: tutorialData.tools || [],
      parts: tutorialData.parts || [],
      view_count: 0,
      like_count: 0,
      status: tutorialData.status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('repair_tutorials')
      .insert(tutorial)
      .select()
      .single();

    if (error) {
      console.error('鍒涘缓鏁欑▼澶辫触:', error);
      return NextResponse.json(
        { error: '鍒涘缓鏁欑▼澶辫触', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: '鏁欑▼鍒涘缓鎴愬姛',
        tutorial: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊? }, { status: 500 });
  }
}

