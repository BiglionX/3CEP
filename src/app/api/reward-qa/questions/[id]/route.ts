import { NextRequest, NextResponse } from 'next/server';
import {
  RewardQAService,
  QuestionUpdateData,
} from '@/services/reward-qa.service';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/reward-qa/questions/[id] - 获取题目详情
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const question = await RewardQAService.getQuestionById(params.id);

    if (!question) {
      return NextResponse.json({ error: '题目不存在' }, { status: 404 });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('获取题目详情失败:', error);
    return NextResponse.json({ error: '获取题目详情失败' }, { status: 500 });
  }
}

// PUT /api/reward-qa/questions/[id] - 更新题目
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const questionData = body as QuestionUpdateData;

    const question = await RewardQAService.updateQuestion(
      params.id,
      questionData
    );
    return NextResponse.json(question);
  } catch (error) {
    console.error('更新题目失败:', error);
    return NextResponse.json({ error: '更新题目失败' }, { status: 500 });
  }
}

// DELETE /api/reward-qa/questions/[id] - 删除题目
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await RewardQAService.deleteQuestion(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除题目失败:', error);
    return NextResponse.json({ error: '删除题目失败' }, { status: 500 });
  }
}
