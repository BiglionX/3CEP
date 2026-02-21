import { NextResponse } from 'next/server';

// 模拟审核API端点
export async function GET() {
  try {
    // 模拟待审核文档数据
    const pendingReviews = [
      {
        id: 'review_1',
        document_id: 'doc_1',
        status: 'pending',
        created_at: '2024-01-15T10:00:00Z',
        document: {
          title: '待审核的说明书',
          language: 'zh-CN',
          category: '手机'
        }
      }
    ];

    return NextResponse.json({
      success: true,
      data: pendingReviews
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取审核列表失败' },
      { status: 500 }
    );
  }
}