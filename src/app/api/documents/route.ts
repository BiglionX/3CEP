import { NextResponse } from 'next/server';

// 妯℃嫙鏂囨。API绔偣
export async function GET() {
  try {
    // 妯℃嫙鏂囨。鏁版嵁
    const documents = [
      {
        id: '1',
        title: 'iPhone 15 Pro 浣跨敤璇存槑,
        content: '娆㈣繋浣跨敤 iPhone 15 Pro...',
        language: 'zh-CN',
        category: '鎵嬫満',
        views: 1234,
        likes: 89,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        status: 'published',
      },
    ];

    return NextResponse.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '鑾峰彇鏂囨。澶辫触' },
      { status: 500 }
    );
  }
}

