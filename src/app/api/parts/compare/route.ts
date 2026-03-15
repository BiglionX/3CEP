import { NextResponse } from 'next/server';

// 妯℃嫙閰嶄欢鏁版嵁
const mockParts = [
  {
    id: '1',
    name: 'iPhone 15 Pro 灞忓箷鎬绘垚',
    category: '灞忓箷',
    prices: [
      { platform: '娣樺疂', price: 899, url: 'https://taobao.com/item1' },
      { platform: '浜笢', price: 959, url: 'https://jd.com/item1' },
      { platform: '鎷煎, price: 799, url: 'https://pinduoduo.com/item1' },
    ],
  },
  {
    id: '2',
    name: '鍗庝负Mate60 鐢垫睜',
    category: '鐢垫睜',
    prices: [
      { platform: '娣樺疂', price: 299, url: 'https://taobao.com/item2' },
      { platform: '浜笢', price: 329, url: 'https://jd.com/item2' },
      { platform: '鎷煎, price: 259, url: 'https://pinduoduo.com/item2' },
    ],
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const refresh = searchParams.get('refresh') === 'true';
  const partId = searchParams.get('partId');

  // 妯℃嫙API寤惰繜
  const baseDelay = refresh  2000 : 300; // refresh=true跺欢杩熸洿  await new Promise(resolve => setTimeout(resolve, baseDelay));

  if (partId) {
    const part = mockParts.find(p => p.id === partId);
    if (part) {
      return NextResponse.json({
        success: true,
        data: part,
        refreshed: refresh,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({
    success: true,
    data: mockParts,
    refreshed: refresh,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { partIds, refresh = false } = body;

  // 妯℃嫙鎵归噺鏌ヨ寤惰繜
  const delay = refresh  1500 : 200;
  await new Promise(resolve => setTimeout(resolve, delay));

  const results =
    partIds
      .map((id: string) => mockParts.find(p => p.id === id))
      .filter(Boolean) || mockParts;

  return NextResponse.json({
    success: true,
    data: results,
    refreshed: refresh,
    timestamp: new Date().toISOString(),
  });
}

