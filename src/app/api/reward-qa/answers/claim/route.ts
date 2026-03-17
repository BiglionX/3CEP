import { NextRequest, NextResponse } from 'next/server';
import { RewardQAService } from '@/services/reward-qa.service';

// POST /api/reward-qa/answers/claim - 领取奖励
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answerId, userId } = body;

    if (!answerId) {
      return NextResponse.json({ error: '缺少答题记录ID' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 });
    }

    const result = await RewardQAService.claimReward(answerId, userId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('领取奖励失败:', error);
    return NextResponse.json(
      { error: error.message || '领取奖励失败' },
      { status: 500 }
    );
  }
}
