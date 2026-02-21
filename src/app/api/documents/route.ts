import { NextResponse } from 'next/server';

// 模拟文档API端点
export async function GET() {
  try {
    // 模拟文档数据
    const documents = [
      {
        id: '1',
        title: 'iPhone 15 Pro 使用说明书',
        content: '欢迎使用 iPhone 15 Pro...',
        language: 'zh-CN',
        category: '手机',
        views: 1234,
        likes: 89,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        status: 'published'
      }
    ];

    return NextResponse.json({
      success: true,
      data: documents
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取文档失败' },
      { status: 500 }
    );
  }
}