import { supabase } from '@/lib/supabase';
import { CrowdfundingProjectService } from '@/services/crowdfunding/project-service';
import { NextResponse } from 'next/server';

// GET /api/crowdfunding/projects - 鑾峰彇椤圭洰鍒楄〃
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    let result;

    if (search) {
      // 鎼滅储椤圭洰
      result = await CrowdfundingProjectService.searchProjects(
        search,
        page,
        limit
      );
    } else if (category) {
      // 鎸夊垎绫昏幏鍙栭」?      result = await CrowdfundingProjectService.getProjectsByCategory(
        category,
        page,
        limit
      );
    } else {
      // 鑾峰彇鎵€鏈夋椿璺冮」?      result = await CrowdfundingProjectService.getActiveProjects(page, limit);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('鑾峰彇椤圭洰鍒楄〃澶辫触:', error);
    return NextResponse.json(
      { error: error.message || '鑾峰彇椤圭洰鍒楄〃澶辫触' },
      { status: 500 }
    );
  }
}

// POST /api/crowdfunding/projects - 鍒涘缓鏂伴」?export async function POST(request: Request) {
  try {
    // 楠岃瘉鐢ㄦ埛璁よ瘉
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '鏈巿鏉冭? }, { status: 401 });
    }

    // 楠岃瘉JWT浠ょ墝
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: '鏃犳晥鐨勮璇佷护? }, { status: 401 });
    }

    const body = await request.json();

    // 楠岃瘉蹇呴渶瀛楁
    const requiredFields = [
      'title',
      'description',
      'product_model',
      'target_amount',
      'start_date',
      'end_date',
      'category',
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缂哄皯蹇呴渶瀛楁: ${field}` },
          { status: 400 }
        );
      }
    }

    // 楠岃瘉閲戦
    if (body.target_amount <= 0) {
      return NextResponse.json({ error: '鐩爣閲戦蹇呴』澶т簬0' }, { status: 400 });
    }

    // 楠岃瘉鏃ユ湡
    const startDate = new Date(body.start_date);
    const endDate = new Date(body.end_date);
    if (endDate <= startDate) {
      return NextResponse.json(
        { error: '缁撴潫鏃堕棿蹇呴』鏅氫簬寮€濮嬫椂? },
        { status: 400 }
      );
    }

    const project = await CrowdfundingProjectService.createProject(
      body,
      user.id
    );

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error('鍒涘缓椤圭洰澶辫触:', error);
    return NextResponse.json(
      { error: error.message || '鍒涘缓椤圭洰澶辫触' },
      { status: 500 }
    );
  }
}

