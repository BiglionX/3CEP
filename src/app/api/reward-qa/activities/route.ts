import { NextRequest, NextResponse } from 'next/server';
import {
  RewardQAService,
  ActivityCreateData,
  ActivityUpdateData,
} from '@/services/reward-qa.service';

// GET /api/reward-qa/activities - 获取问答活动列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const enterpriseId = searchParams.get('enterpriseId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!enterpriseId) {
      return NextResponse.json({ error: '缺少企业ID' }, { status: 400 });
    }

    const result = await RewardQAService.getActivities(
      enterpriseId,
      page,
      limit
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error('获取问答活动列表失败:', error);
    return NextResponse.json(
      { error: '获取问答活动列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/reward-qa/activities - 创建问答活动
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enterpriseId, ...activityData } = body as ActivityCreateData & {
      enterpriseId: string;
    };

    if (!enterpriseId) {
      return NextResponse.json({ error: '缺少企业ID' }, { status: 400 });
    }

    if (!activityData.title) {
      return NextResponse.json({ error: '活动标题不能为空' }, { status: 400 });
    }

    const activity = await RewardQAService.createActivity(
      activityData,
      enterpriseId
    );
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('创建问答活动失败:', error);
    return NextResponse.json({ error: '创建问答活动失败' }, { status: 500 });
  }
}
