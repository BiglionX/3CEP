import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';

// 鍒濆鍖朣upabase瀹㈡埛绔紙浣跨敤鏈嶅姟瑙掕壊瀵嗛挜const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/tutorials - 绠＄悊鍛樿幏鍙栨暀绋嬪垪琛紙鍖呭惈鎵€鏈夌姸鎬侊級
export async function GET(request: Request) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    // 楠岃瘉绠＄悊鍛樻潈    const authHeader = request.headers.get('authorization');
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: '犳晥鐨勮璇佷护 }, { status: 401 });
    }

    // 妫€鏌ョ敤鎴槸鍚︿负绠＄悊    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: '鏉冮檺涓嶈冻' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);

    // 鑾峰彇鏌ヨ鍙傛暟
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const deviceModel = searchParams.get('deviceModel');
    const faultType = searchParams.get('faultType');
    const status = searchParams.get('status'); // 绠＄悊鍛樺彲ユ煡鐪嬫墍鏈夌姸    const search = searchParams.get('search');
    const createdBy = searchParams.get('createdBy');

    // 璁＄畻鍋忕Щ    const offset = (page - 1) * pageSize;

    // 鏋勫缓鏌ヨ
    let query = supabaseAdmin
      .from('repair_tutorials')
      .select('*', { count: 'exact' })
      .range(offset, offset + pageSize - 1)
      .order('created_at', { ascending: false });

    // 娣诲姞杩囨护鏉′欢
    if (status) {
      query = query.eq('status', status);
    }

    if (deviceModel) {
      query = query.eq('device_model', deviceModel);
    }

    if (faultType) {
      query = query.eq('fault_type', faultType);
    }

    if (createdBy) {
      query = query.eq('created_by', createdBy);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('鑾峰彇绠＄悊鍛樻暀绋嬪垪琛ㄥけ', error);
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
    console.error('绠＄悊鍛楢PI閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }

    },
    'content_read'
  );

// POST /api/admin/tutorials - 绠＄悊鍛樺垱寤烘暀export async function POST(request: Request) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    // 楠岃瘉绠＄悊鍛樻潈    const authHeader = request.headers.get('authorization');
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: '犳晥鐨勮璇佷护 }, { status: 401 });
    }

    // 妫€鏌ョ敤鎴槸鍚︿负绠＄悊    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: '鏉冮檺涓嶈冻' }, { status: 403 });
    }

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

    // 璁剧疆榛樿    const tutorial = {
      ...tutorialData,
      steps: tutorialData.steps || [],
      tools: tutorialData.tools || [],
      parts: tutorialData.parts || [],
      view_count: 0,
      like_count: 0,
      status: tutorialData.status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: user.id,
    };

    const { data, error } = await supabaseAdmin
      .from('repair_tutorials')
      .insert(tutorial)
      .select()
      .single();

    if (error) {
      console.error('绠＄悊鍛樺垱寤烘暀绋嬪け', error);
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
    console.error('绠＄悊鍛楢PI閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }

    },
    'content_read'
  );

