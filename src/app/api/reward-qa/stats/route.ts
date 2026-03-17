import { NextRequest, NextResponse } from 'next/server';
import { RewardQAService } from '@/services/reward-qa.service';

// GET /api/reward-qa/stats - 获取活动统计信息
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activityId = searchParams.get('activityId');

    if (!activityId) {
      return NextResponse.json({ error: '缺少活动ID' }, { status: 400 });
    }

    const stats = await RewardQAService.getActivityStats(activityId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('获取活动统计失败:', error);
    return NextResponse.json({ error: '获取活动统计失败' }, { status: 500 });
  }
}
