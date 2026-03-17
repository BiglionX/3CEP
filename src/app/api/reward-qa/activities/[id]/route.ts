import { NextRequest, NextResponse } from 'next/server';
import {
  RewardQAService,
  ActivityUpdateData,
} from '@/services/reward-qa.service';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/reward-qa/activities/[id] - 获取活动详情
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const activity = await RewardQAService.getActivityById(params.id);

    if (!activity) {
      return NextResponse.json({ error: '活动不存在' }, { status: 404 });
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error('获取活动详情失败:', error);
    return NextResponse.json({ error: '获取活动详情失败' }, { status: 500 });
  }
}

// PUT /api/reward-qa/activities/[id] - 更新活动
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const activityData = body as ActivityUpdateData;

    const activity = await RewardQAService.updateActivity(
      params.id,
      activityData
    );
    return NextResponse.json(activity);
  } catch (error) {
    console.error('更新问答活动失败:', error);
    return NextResponse.json({ error: '更新问答活动失败' }, { status: 500 });
  }
}

// DELETE /api/reward-qa/activities/[id] - 删除活动
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await RewardQAService.deleteActivity(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除问答活动失败:', error);
    return NextResponse.json({ error: '删除问答活动失败' }, { status: 500 });
  }
}

// POST /api/reward-qa/activities/[id]/publish - 发布活动
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const action = body.action;

    let activity;
    if (action === 'publish') {
      activity = await RewardQAService.publishActivity(params.id);
    } else if (action === 'end') {
      activity = await RewardQAService.endActivity(params.id);
    } else {
      return NextResponse.json({ error: '无效的操作' }, { status: 400 });
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error('操作问答活动失败:', error);
    return NextResponse.json({ error: '操作问答活动失败' }, { status: 500 });
  }
}
