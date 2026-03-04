import { NextRequest, NextResponse } from 'next/server';

// 妯℃嫙鍐呭鏁版嵁
const mockContents = [
  {
    id: 'content_001',
    title: '鎵嬫満缁翠慨鍩虹鐭ヨ瘑鏁欑▼',
    type: 'tutorial',
    author: '鎶€鏈儴',
    status: 'published',
    category: '缁翠慨鏁欑▼',
    tags: ['鎵嬫満缁翠慨', '鍩虹鐭ヨ瘑', 'DIY'],
    views: 1250,
    likes: 89,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-02-20T14:22:00Z',
    content: '鏈暀绋嬪皢涓烘偍璇︾粏浠嬬粛鎵嬫満缁翠慨鐨勫熀纭€鐭ヨ瘑...',
  },
  {
    id: 'content_002',
    title: '2024骞存暟鐮佷骇鍝佺淮淇涓氳秼鍔垮垎?,
    type: 'article',
    author: '甯傚満?,
    status: 'published',
    category: '琛屼笟鍒嗘瀽',
    tags: ['琛屼笟瓒嬪娍', '甯傚満鍒嗘瀽', '2024'],
    views: 890,
    likes: 67,
    created_at: '2024-01-20T09:15:00Z',
    updated_at: '2024-02-18T16:45:00Z',
    content: '闅忕潃绉戞妧鐨勫彂灞曪紝鏁扮爜浜у搧缁翠慨琛屼笟姝ｉ潰涓存柊鐨勬満閬囧拰鎸戞垬...',
  },
  {
    id: 'content_003',
    title: '甯歌鎵嬫満鏁呴殰鎺掓煡鎸囧崡',
    type: 'faq',
    author: '瀹㈡湇?,
    status: 'draft',
    category: '鏁呴殰鎺掗櫎',
    tags: ['鏁呴殰鎺掓煡', '鎵嬫満闂', '鑷姪缁翠慨'],
    views: 0,
    likes: 0,
    created_at: '2024-02-01T11:20:00Z',
    updated_at: '2024-02-25T09:30:00Z',
    content: 'Q: 鎵嬫満鏃犳硶寮€鏈烘€庝箞鍔烇紵\nA: 璇峰厛妫€鏌ョ數姹犵數?..',
  },
  {
    id: 'content_004',
    title: '鏈€鏂癷Phone缁翠慨鏀跨瓥瑙ｈ',
    type: 'news',
    author: '娉曞姟?,
    status: 'published',
    category: '鏀跨瓥娉曡',
    tags: ['鑻规灉', '缁翠慨鏀跨瓥', '娉曞緥瑙ｈ'],
    views: 2100,
    likes: 156,
    created_at: '2024-01-10T08:45:00Z',
    updated_at: '2024-02-22T13:15:00Z',
    content: '鑻规灉鍏徃杩戞湡鍙戝竷浜嗘柊鐨勭淮淇斂绛栵紝瀵规秷璐硅€呭拰缁翠慨鍟嗛兘鏈夐噸瑕佸奖?..',
  },
  {
    id: 'content_005',
    title: '绗旇鏈數鑴戝睆骞曟洿鎹㈡暀?,
    type: 'tutorial',
    author: '鎶€鏈儴',
    status: 'archived',
    category: '缁翠慨鏁欑▼',
    tags: ['绗旇?, '灞忓箷鏇存崲', '纭欢缁翠慨'],
    views: 650,
    likes: 42,
    created_at: '2024-02-10T14:30:00Z',
    updated_at: '2024-02-28T11:20:00Z',
    content: '鏈暀绋嬪皢鎸囧鎮ㄥ浣曞畨鍏ㄥ湴鏇存崲绗旇鏈數鑴戝睆?..',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';

    // 杩囨护鏁版嵁
    let filteredContents = [...mockContents];

    // 鎼滅储杩囨护
    if (search) {
      filteredContents = filteredContents.filter(
        content =>
          content.title.toLowerCase().includes(search.toLowerCase()) ||
          content.author.toLowerCase().includes(search.toLowerCase()) ||
          content.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 绫诲瀷杩囨护
    if (type && type !== 'all') {
      filteredContents = filteredContents.filter(
        content => content.type === type
      );
    }

    // 鐘舵€佽繃?    if (status && status !== 'all') {
      filteredContents = filteredContents.filter(
        content => content.status === status
      );
    }

    // 鍒嗛〉
    const total = filteredContents.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedContents = filteredContents.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedContents,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('鑾峰彇鍐呭鍒楄〃澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鑾峰彇鍐呭鍒楄〃澶辫触',
        data: [],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0,
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 鐢熸垚鏂癐D
    const newId = `content_${String(mockContents.length + 1).padStart(3, '0')}`;

    // 鍒涘缓鏂板唴?    const newContent = {
      id: newId,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views: 0,
      likes: 0,
    };

    mockContents.push(newContent);

    return NextResponse.json({
      success: true,
      data: newContent,
      message: '鍐呭鍒涘缓鎴愬姛',
    });
  } catch (error) {
    console.error('鍒涘缓鍐呭澶辫触:', error);
    return NextResponse.json(
      { success: false, error: '鍒涘缓鍐呭澶辫触' },
      { status: 500 }
    );
  }
}

