import { NextResponse } from 'next/server';

// 模拟配件数据
const mockParts = [
  {
    id: '1',
    name: 'iPhone 15 Pro 屏幕总成',
    category: '屏幕',
    prices: [
      { platform: '淘宝', price: 899, url: 'https://taobao.com/item1' },
      { platform: '京东', price: 959, url: 'https://jd.com/item1' },
      { platform: '拼多多', price: 799, url: 'https://pinduoduo.com/item1' }
    ]
  },
  {
    id: '2', 
    name: '华为Mate60 电池',
    category: '电池',
    prices: [
      { platform: '淘宝', price: 299, url: 'https://taobao.com/item2' },
      { platform: '京东', price: 329, url: 'https://jd.com/item2' },
      { platform: '拼多多', price: 259, url: 'https://pinduoduo.com/item2' }
    ]
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const refresh = searchParams.get('refresh') === 'true';
  const partId = searchParams.get('partId');
  
  // 模拟API延迟
  const baseDelay = refresh ? 2000 : 300; // refresh=true时延迟更高
  await new Promise(resolve => setTimeout(resolve, baseDelay));

  if (partId) {
    const part = mockParts.find(p => p.id === partId);
    if (part) {
      return NextResponse.json({
        success: true,
        data: part,
        refreshed: refresh,
        timestamp: new Date().toISOString()
      });
    }
  }

  return NextResponse.json({
    success: true,
    data: mockParts,
    refreshed: refresh,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { partIds, refresh = false } = body;
  
  // 模拟批量查询延迟
  const delay = refresh ? 1500 : 200;
  await new Promise(resolve => setTimeout(resolve, delay));

  const results = partIds?.map((id: string) => 
    mockParts.find(p => p.id === id)
  ).filter(Boolean) || mockParts;

  return NextResponse.json({
    success: true,
    data: results,
    refreshed: refresh,
    timestamp: new Date().toISOString()
  });
}