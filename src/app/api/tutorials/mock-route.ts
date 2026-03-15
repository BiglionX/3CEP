import { NextResponse } from 'next/server';

// Mock鏁版嵁 - 鐢ㄤ簬寮€鍙戝拰娴嬭瘯
const mockTutorials = [
  {
    id: '1',
    device_model: 'iPhone 14 Pro',
    fault_type: 'screen_broken',
    title: 'iPhone 14 Pro 灞忓箷鏇存崲璇︾粏鏁欑▼',
    description:
      '庢媶鏈哄埌瀹夎鐨勫畬鏁磇Phone 14 Pro灞忓箷鏇存崲鎸囧崡锛屽寘鍚墍闇€宸ュ叿鍜屾敞鎰忎簨,
    steps: [
      {
        id: 'step1',
        title: '鍑嗗宸ヤ綔',
        description: '鍏抽棴璁惧鐢垫簮锛屽噯澶囧ソ鎵€鏈夊繀瑕佸伐,
        image_url: 'https://example.com/step1.jpg',
        estimated_time: 5,
      },
      {
        id: 'step2',
        title: '鎷嗗嵏灞忓箷',
        description: '浣跨敤鍚哥洏鍜屾挰妫掑皬蹇冨垎绂诲睆骞曠粍,
        image_url: 'https://example.com/step2.jpg',
        estimated_time: 15,
      },
      {
        id: 'step3',
        title: '鏂紑杩炴帴',
        description: '鏂紑灞忓箷鎺掔嚎杩炴帴,
        image_url: 'https://example.com/step3.jpg',
        estimated_time: 10,
      },
      {
        id: 'step4',
        title: '瀹夎鏂板睆,
        description: '杩炴帴鏂板睆骞曟帓绾垮苟娴嬭瘯鏄剧ず鍔熻兘',
        image_url: 'https://example.com/step4.jpg',
        estimated_time: 20,
      },
      {
        id: 'step5',
        title: '鏈€缁堢粍,
        description: '閲嶆柊缁勮璁惧骞惰繘琛屽叏闈㈡祴,
        image_url: 'https://example.com/step5.jpg',
        estimated_time: 10,
      },
    ],
    video_url: 'https://www.youtube.com/watchv=screen_repair_demo',
    tools: ['铻轰笣鍒€濂楄', '鍚哥洏', '鎾', '闀婂瓙', '鐑],
    parts: ['iPhone 14 Pro鍘熻灞忓箷', '灞忓箷],
    cover_image: 'https://example.com/iphone14pro-screen-cover.jpg',
    difficulty_level: 4,
    estimated_time: 60,
    view_count: 1250,
    like_count: 89,
    status: 'published',
    created_at: '2026-02-15T10:00:00Z',
    updated_at: '2026-02-15T10:00:00Z',
  },
  {
    id: '2',
    device_model: 'Samsung Galaxy S23',
    fault_type: 'battery_issue',
    title: '涓夋槦Galaxy S23 鐢垫睜鏇存崲鎸囧崡',
    description: '璇︾粏鐨勪笁鏄烥alaxy S23鐢垫睜鏇存崲姝ラ锛岄€傚悎鏈変竴瀹氬姩鎵嬭兘鍔涚殑鐢ㄦ埛',
    steps: [
      {
        id: 'step1',
        title: '鍏虫満骞跺噯澶囧伐,
        description: '瀹屽叏鍏抽棴鎵嬫満鐢垫簮锛屽噯澶囩簿瀵嗚灪涓濆垁鍜屾挰,
        image_url: 'https://example.com/s23_step1.jpg',
        estimated_time: 3,
      },
      {
        id: 'step2',
        title: '鎷嗗嵏鍚庣洊',
        description: '鍔犵儹鍚庣洊杈圭紭浣垮叾杞寲锛岀劧鍚庡皬蹇冩挰寮€',
        image_url: 'https://example.com/s23_step2.jpg',
        estimated_time: 12,
      },
      {
        id: 'step3',
        title: '绉婚櫎х數,
        description: '鏂紑鐢垫睜杩炴帴鍣紝灏忓績鍙栧嚭х數,
        image_url: 'https://example.com/s23_step3.jpg',
        estimated_time: 8,
      },
      {
        id: 'step4',
        title: '瀹夎鏂扮數,
        description: '鏀惧叆鏂扮數姹犲苟閲嶆柊杩炴帴鐢垫睜鎺掔嚎',
        image_url: 'https://example.com/s23_step4.jpg',
        estimated_time: 10,
      },
      {
        id: 'step5',
        title: '娴嬭瘯鍜岀粍,
        description: '寮€鏈烘祴璇曠數姹犲姛鑳斤紝閲嶆柊瀹夎鍚庣洊',
        image_url: 'https://example.com/s23_step5.jpg',
        estimated_time: 7,
      },
    ],
    video_url: 'https://www.bilibili.com/video/BV123456789',
    tools: ['绮惧瘑铻轰笣鍒€', '濉戞枡鎾', '鐑, '鍚哥洏'],
    parts: ['涓夋槦S23鍘熻鐢垫睜', '鍚庣洊],
    cover_image: 'https://example.com/s23-battery-cover.jpg',
    difficulty_level: 3,
    estimated_time: 40,
    view_count: 890,
    like_count: 67,
    status: 'published',
    created_at: '2026-02-14T14:30:00Z',
    updated_at: '2026-02-14T14:30:00Z',
  },
  {
    id: '3',
    device_model: 'Huawei Mate 50',
    fault_type: 'water_damage',
    title: '鍗庝负Mate 50 杩涙按搴旀€ュ鐞嗘柟,
    description: '鎵嬫満鎰忓杩涙按鍚庣殑绱ф€ュ鐞嗘楠ゅ拰涓撲笟缁翠慨寤鸿',
    steps: [
      {
        id: 'step1',
        title: '绔嬪嵆鏂數',
        description: '绗竴堕棿鍏抽棴鎵嬫満鐢垫簮锛岄伩鍏嶇煭璺崯,
        image_url: 'https://example.com/mate50_step1.jpg',
        estimated_time: 1,
      },
      {
        id: 'step2',
        title: '鍙栧嚭SIM鍗″拰瀛樺偍,
        description: '灏藉揩鍙栧嚭鎵€鏈夊彲鎷嗗嵏閮ㄤ欢',
        image_url: 'https://example.com/mate50_step2.jpg',
        estimated_time: 2,
      },
      {
        id: 'step3',
        title: '娓呮磥琛ㄩ潰姘村垎',
        description: '鐢ㄥ共鍑€甯冩枡杞昏交鎿︽嫮琛ㄩ潰姘村垎',
        image_url: 'https://example.com/mate50_step3.jpg',
        estimated_time: 3,
      },
      {
        id: 'step4',
        title: '骞茬嚗澶勭悊',
        description: '鏀剧疆鍦ㄥ共鐕ラ€氶澶勮嚜鐒舵櫨骞茶嚦8灏忔椂',
        image_url: 'https://example.com/mate50_step4.jpg',
        estimated_time: 2880,
      },
      {
        id: 'step5',
        title: '涓撲笟妫€,
        description: '鑱旂郴涓撲笟缁翠慨搴楄繘琛屽叏闈㈡,
        image_url: 'https://example.com/mate50_step5.jpg',
        estimated_time: 30,
      },
    ],
    video_url: null,
    tools: ['骞插噣姣涘肪', '骞茬嚗, '鍚归鍐烽)'],
    parts: [],
    cover_image: 'https://example.com/mate50-water-cover.jpg',
    difficulty_level: 2,
    estimated_time: 30,
    view_count: 2100,
    like_count: 156,
    status: 'published',
    created_at: '2026-02-13T09:15:00Z',
    updated_at: '2026-02-13T09:15:00Z',
  },
  {
    id: '4',
    device_model: 'Xiaomi Redmi Note 12',
    fault_type: 'charging_issue',
    title: '绾㈢背Note 12 鍏呯數闂瑙ｅ喅鏂规',
    description: '璇︾粏瑙ｅ喅绾㈢背Note 12鍏呯數鎱€佹棤娉曞厖鐢电瓑闂',
    steps: [
      {
        id: 'step1',
        title: '妫€鏌ュ厖鐢电嚎鍜屽厖鐢靛櫒',
        description: '棣栧厛妫€鏌ヤ娇鐢ㄧ殑鍏呯數绾垮拰鍏呯數鍣ㄦ槸鍚︽甯稿伐,
        image_url: 'https://example.com/redmi_step1.jpg',
        estimated_time: 5,
      },
      {
        id: 'step2',
        title: '娓呮磥鍏呯數,
        description: '浣跨敤杞瘺鍒竻娲佹墜鏈哄厖鐢靛彛鍐呯殑鐏板皹鍜屾潅,
        image_url: 'https://example.com/redmi_step2.jpg',
        estimated_time: 10,
      },
      {
        id: 'step3',
        title: '妫€鏌ヨ蒋惰,
        description: '鏌ョ湅鎵嬫満鍏呯數鐩稿叧璁剧疆鏄惁姝ｅ父',
        image_url: 'https://example.com/redmi_step3.jpg',
        estimated_time: 8,
      },
    ],
    video_url: 'https://www.youtube.com/watchv=redmi_charging',
    tools: ['杞瘺, '鏀惧ぇ],
    parts: [],
    cover_image: 'https://example.com/redmi-charging-cover.jpg',
    difficulty_level: 2,
    estimated_time: 25,
    view_count: 654,
    like_count: 42,
    status: 'published',
    created_at: '2026-02-12T16:45:00Z',
    updated_at: '2026-02-12T16:45:00Z',
  },
];

// GET /api/tutorials - 鑾峰彇鏁欑▼鍒楄〃锛圡ock鐗堟湰export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // 鑾峰彇鏌ヨ鍙傛暟
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const deviceModel = searchParams.get('deviceModel');
    const faultType = searchParams.get('faultType');
    const status = searchParams.get('status') || 'published';
    const search = searchParams.get('search');

    // 璁＄畻鍋忕Щ    const offset = (page - 1) * pageSize;

    // 杩囨护鏁版嵁
    let filteredTutorials = mockTutorials.filter(
      tutorial => tutorial.status === status
    );

    // 娣诲姞杩囨护鏉′欢
    if (deviceModel) {
      filteredTutorials = filteredTutorials.filter(
        t => t.device_model === deviceModel
      );
    }

    if (faultType) {
      filteredTutorials = filteredTutorials.filter(
        t => t.fault_type === faultType
      );
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      filteredTutorials = filteredTutorials.filter(
        t =>
          t.title.toLowerCase().includes(searchTerm) ||
          t.description.toLowerCase().includes(searchTerm) ||
          t.device_model.toLowerCase().includes(searchTerm)
      );
    }

    // 璁＄畻鍒嗛〉淇℃伅
    const totalCount = filteredTutorials.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedTutorials = filteredTutorials.slice(
      offset,
      offset + pageSize
    );

    return NextResponse.json({
      tutorials: paginatedTutorials,
      pagination: {
        currentPage: page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('API閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }
}

// GET /api/tutorials/[id] - 鑾峰彇鍗曚釜鏁欑▼璇︽儏锛圡ock鐗堟湰export async function GET_BY_ID(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 鏌ユ壘鏁欑▼
    const tutorial = mockTutorials.find(
      t => t.id === id && t.status === 'published'
    );

    if (!tutorial) {
      return NextResponse.json(
        { error: '鏁欑▼涓嶅鍦ㄦ垨鏈彂 },
        { status: 404 }
      );
    }

    // 妯℃嫙澧炲姞娴忚娆℃暟
    const tutorialWithViews = {
      ...tutorial,
      view_count: tutorial.view_count + 1,
    };

    return NextResponse.json({
      tutorial: tutorialWithViews,
    });
  } catch (error) {
    console.error('API閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }
}

