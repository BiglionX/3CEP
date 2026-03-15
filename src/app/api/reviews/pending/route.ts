import { NextResponse } from 'next/server';

// 妯℃嫙瀹℃牳API绔偣
export async function GET() {
  try {
    // 妯℃嫙寰呭鏍告枃妗ｆ暟    const pendingReviews = [
      {
        id: 'review_1',
        document_id: 'doc_1',
        status: 'pending',
        created_at: '2024-01-15T10:00:00Z',
        document: {
          title: '寰呭鏍哥殑璇存槑,
          language: 'zh-CN',
          category: '鎵嬫満',
        },
      },
    ];

    return NextResponse.json({
      success: true,
      data: pendingReviews,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '鑾峰彇瀹℃牳鍒楄〃澶辫触' },
      { status: 500 }
    );
  }
}

