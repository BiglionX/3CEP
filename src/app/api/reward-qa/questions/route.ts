import { NextRequest, NextResponse } from 'next/server';
import {
  RewardQAService,
  QuestionCreateData,
  QuestionUpdateData,
} from '@/services/reward-qa.service';

// GET /api/reward-qa/questions - 获取题目列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activityId = searchParams.get('activityId');

    if (!activityId) {
      return NextResponse.json({ error: '缺少活动ID' }, { status: 400 });
    }

    const questions = await RewardQAService.getQuestions(activityId);
    return NextResponse.json(questions);
  } catch (error) {
    console.error('获取题目列表失败:', error);
    return NextResponse.json({ error: '获取题目列表失败' }, { status: 500 });
  }
}

// POST /api/reward-qa/questions - 创建题目
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const questionData = body as QuestionCreateData;

    if (!questionData.activity_id) {
      return NextResponse.json({ error: '缺少活动ID' }, { status: 400 });
    }

    if (!questionData.question_text) {
      return NextResponse.json({ error: '题目内容不能为空' }, { status: 400 });
    }

    if (!questionData.correct_answer) {
      return NextResponse.json({ error: '正确答案不能为空' }, { status: 400 });
    }

    const question = await RewardQAService.createQuestion(questionData);
    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error('创建题目失败:', error);
    return NextResponse.json({ error: '创建题目失败' }, { status: 500 });
  }
}

// POST /api/reward-qa/questions/batch - 批量创建题目
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { questions } = body as { questions: QuestionCreateData[] };

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: '题目列表格式错误' }, { status: 400 });
    }

    const result = await RewardQAService.batchCreateQuestions(questions);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('批量创建题目失败:', error);
    return NextResponse.json({ error: '批量创建题目失败' }, { status: 500 });
  }
}
