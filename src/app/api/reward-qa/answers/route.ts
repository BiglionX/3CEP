import { NextRequest, NextResponse } from 'next/server';
import {
  RewardQAService,
  SubmitAnswerData,
} from '@/services/reward-qa.service';

// POST /api/reward-qa/answers - 提交答案
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...answerData } = body as SubmitAnswerData & {
      userId: string;
    };

    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 });
    }

    if (!answerData.activity_id) {
      return NextResponse.json({ error: '缺少活动ID' }, { status: 400 });
    }

    if (!answerData.question_id) {
      return NextResponse.json({ error: '缺少题目ID' }, { status: 400 });
    }

    if (!answerData.user_answer) {
      return NextResponse.json({ error: '答案不能为空' }, { status: 400 });
    }

    const result = await RewardQAService.submitAnswer(answerData, userId);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('提交答案失败:', error);
    return NextResponse.json(
      { error: error.message || '提交答案失败' },
      { status: 500 }
    );
  }
}

// GET /api/reward-qa/answers - 获取用户答题记录
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activityId = searchParams.get('activityId');
    const userId = searchParams.get('userId');

    if (!activityId || !userId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const answers = await RewardQAService.getUserAnswers(activityId, userId);
    return NextResponse.json(answers);
  } catch (error) {
    console.error('获取答题记录失败:', error);
    return NextResponse.json({ error: '获取答题记录失败' }, { status: 500 });
  }
}
