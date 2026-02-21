import { NextResponse } from 'next/server';
import { AIDiagnosisService } from '@/services/ai-diagnosis-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, sessionId, productId } = body;

    // 验证输入
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: '消息内容不能为空' },
        { status: 400 }
      );
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: '会话ID不能为空' },
        { status: 400 }
      );
    }

    // 处理诊断请求
    const result = await AIDiagnosisService.processDiagnosis(
      sessionId,
      message,
      productId
    );

    return NextResponse.json({
      success: true,
      data: {
        response: result.response,
        suggestions: result.suggestions,
        sessionId: sessionId
      }
    });

  } catch (error) {
    console.error('AI诊断API错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '服务器内部错误' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: '缺少会话ID参数' },
        { status: 400 }
      );
    }

    // 获取会话摘要
    const summary = AIDiagnosisService.getSessionSummary(sessionId);

    return NextResponse.json({
      success: true,
      data: summary || { messageCount: 0, duration: '0秒' }
    });

  } catch (error) {
    console.error('获取会话信息错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '服务器内部错误' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: '缺少会话ID参数' },
        { status: 400 }
      );
    }

    // 清理会话
    AIDiagnosisService.clearSession(sessionId);

    return NextResponse.json({
      success: true,
      message: '会话已清除'
    });

  } catch (error) {
    console.error('清除会话错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '服务器内部错误' 
      },
      { status: 500 }
    );
  }
}