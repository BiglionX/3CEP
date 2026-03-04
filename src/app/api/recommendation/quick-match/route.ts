import { NextResponse } from 'next/server';
import {
  QuickMatchRecommender,
  QuickMatchPresets,
  UserFeatures,
} from '@/lib/quick-match-recommender';

// 鍏ㄥ眬鎺ㄨ崘鍣ㄥ疄?let recommender: QuickMatchRecommender | null = null;

// 鍒濆鍖栨帹鑽愬櫒
function getRecommender(): QuickMatchRecommender {
  if (!recommender) {
    // 浣跨敤鍐峰惎鍔ㄤ紭鍖栭厤?    const config = QuickMatchPresets.getColdStartOptimized();
    recommender = new QuickMatchRecommender(config);

    // 鍒濆鍖栦竴浜涚ず渚嬬敤鎴锋暟鎹敤浜庢祴?    initializeSampleData(recommender);
  }
  return recommender;
}

// 鍒濆鍖栫ず渚嬫暟?function initializeSampleData(recommender: QuickMatchRecommender): void {
  const sampleUsers: UserFeatures[] = [
    {
      userId: 'user_001',
      demographics: {
        ageGroup: '25-35',
        gender: 'male',
        location: '鍖椾含',
        occupation: '宸ョ▼?,
        membershipLevel: 'gold',
      },
      behavior: {
        activityLevel: 0.8,
        featureUsage: ['device_management', 'repair_scheduling', 'analytics'],
        visitFrequency: 15,
        sessionDuration: 1800,
        interactionDepth: 0.7,
      },
      preferences: {
        favoriteCategories: ['鏅鸿兘鎵嬫満', '绗旇鏈數?],
        preferredBrands: ['Apple', '鍗庝负'],
        contentTypes: ['鏁欑▼', '鏂伴椈'],
        interactionStyles: ['detail_oriented', 'efficiency_focused'],
      },
      context: {
        deviceType: 'desktop',
        timeOfDay: 14,
        dayOfWeek: 3,
        season: 'spring',
      },
    },
    {
      userId: 'user_002',
      demographics: {
        ageGroup: '25-35',
        gender: 'male',
        location: '鍖椾含',
        occupation: '璁捐?,
        membershipLevel: 'silver',
      },
      behavior: {
        activityLevel: 0.6,
        featureUsage: ['device_management', 'inventory_tracking'],
        visitFrequency: 8,
        sessionDuration: 1200,
        interactionDepth: 0.5,
      },
      preferences: {
        favoriteCategories: ['鏅鸿兘鎵嬫満', '骞虫澘鐢佃剳'],
        preferredBrands: ['Apple', '灏忕背'],
        contentTypes: ['鏁欑▼', '璇勬祴'],
        interactionStyles: ['visual_oriented', 'creative_focused'],
      },
      context: {
        deviceType: 'mobile',
        timeOfDay: 20,
        dayOfWeek: 3,
        season: 'spring',
      },
    },
    {
      userId: 'user_003',
      demographics: {
        ageGroup: '35-45',
        gender: 'female',
        location: '涓婃捣',
        occupation: '缁忕悊',
        membershipLevel: 'gold',
      },
      behavior: {
        activityLevel: 0.9,
        featureUsage: ['analytics', 'reporting', 'team_management'],
        visitFrequency: 20,
        sessionDuration: 2400,
        interactionDepth: 0.8,
      },
      preferences: {
        favoriteCategories: ['鏈嶅姟?, '缃戠粶璁惧'],
        preferredBrands: ['鍗庝负', '鎬濈'],
        contentTypes: ['琛屼笟鎶ュ憡', '鏈€浣冲疄?],
        interactionStyles: ['data_driven', 'strategic_thinking'],
      },
      context: {
        deviceType: 'desktop',
        timeOfDay: 10,
        dayOfWeek: 2,
        season: 'spring',
      },
    },
    {
      userId: 'user_004',
      demographics: {
        ageGroup: '18-25',
        gender: 'female',
        location: '骞垮窞',
        occupation: '瀛︾敓',
        membershipLevel: 'bronze',
      },
      behavior: {
        activityLevel: 0.4,
        featureUsage: ['device_basics', 'troubleshooting'],
        visitFrequency: 3,
        sessionDuration: 600,
        interactionDepth: 0.3,
      },
      preferences: {
        favoriteCategories: ['鏅鸿兘鎵嬫満', '鑰虫満'],
        preferredBrands: ['灏忕背', 'OPPO'],
        contentTypes: ['鍏ラ棬鎸囧崡', '鎶€宸у垎?],
        interactionStyles: ['learning_focused', 'community_oriented'],
      },
      context: {
        deviceType: 'mobile',
        timeOfDay: 19,
        dayOfWeek: 6,
        season: 'spring',
      },
    },
    {
      userId: 'user_005',
      demographics: {
        ageGroup: '45-55',
        gender: 'male',
        location: '娣卞湷',
        occupation: 'CTO',
        membershipLevel: 'diamond',
      },
      behavior: {
        activityLevel: 0.7,
        featureUsage: ['enterprise_management', 'security', 'compliance'],
        visitFrequency: 12,
        sessionDuration: 1500,
        interactionDepth: 0.6,
      },
      preferences: {
        favoriteCategories: ['浼佷笟绾ц?, '瀹夊叏瑙ｅ喅鏂规'],
        preferredBrands: ['IBM', '寰蒋'],
        contentTypes: ['鐧界毊?, '鎶€鏈?],
        interactionStyles: ['security_focused', 'compliance_driven'],
      },
      context: {
        deviceType: 'desktop',
        timeOfDay: 16,
        dayOfWeek: 4,
        season: 'spring',
      },
    },
  ];

  recommender.addUsersBatch(sampleUsers);
}

// GET /api/recommendation/quick-match?userId=user_123&maxResults=10
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const maxResults = parseInt(searchParams.get('maxResults') || '10');
    const includeMetadata = searchParams.get('includeMetadata') === 'true';

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯鐢ㄦ埛ID鍙傛暟',
        },
        { status: 400 }
      );
    }

    const recommender = getRecommender();
    const recommendation = await recommender.quickMatchRecommendation(userId, {
      maxResults,
      includeMetadata,
    });

    return NextResponse.json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    console.error('蹇€熷尮閰嶆帹鑽怉PI閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鎺ㄨ崘鏈嶅姟鏆傛椂涓嶅彲?,
      },
      { status: 500 }
    );
  }
}

// POST /api/recommendation/quick-match
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      userFeatures,
      maxResults = 10,
      includeMetadata = true,
      strategy = 'auto',
    } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯鐢ㄦ埛ID',
        },
        { status: 400 }
      );
    }

    const recommender = getRecommender();

    // 濡傛灉鎻愪緵浜嗙敤鎴风壒寰佹暟鎹紝鍒欏厛娣诲姞鍒扮郴缁熶腑
    if (userFeatures) {
      recommender.addUserFeatures({
        userId,
        ...userFeatures,
      });
    }

    const recommendation = await recommender.quickMatchRecommendation(userId, {
      maxResults,
      includeMetadata,
    });

    return NextResponse.json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    console.error('蹇€熷尮閰嶆帹鑽怉PI閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鎺ㄨ崘鏈嶅姟澶勭悊澶辫触',
      },
      { status: 500 }
    );
  }
}

// PUT /api/recommendation/quick-match/batch
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { users } = body;

    if (!Array.isArray(users)) {
      return NextResponse.json(
        {
          success: false,
          error: '鐢ㄦ埛鏁版嵁蹇呴』鏄暟缁勬牸?,
        },
        { status: 400 }
      );
    }

    const recommender = getRecommender();
    recommender.addUsersBatch(users);

    return NextResponse.json({
      success: true,
      message: `鎴愬姛娣诲姞 ${users.length} 涓敤鎴锋暟鎹甡,
      data: {
        totalUsers: recommender.getSystemStats().totalUsers,
      },
    });
  } catch (error) {
    console.error('鎵归噺娣诲姞鐢ㄦ埛鏁版嵁澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鎵归噺鏁版嵁澶勭悊澶辫触',
      },
      { status: 500 }
    );
  }
}

// GET /api/recommendation/quick-match/stats
export async function PATCH(request: Request) {
  try {
    const recommender = getRecommender();
    const stats = recommender.getSystemStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('鑾峰彇鎺ㄨ崘绯荤粺缁熻澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏃犳硶鑾峰彇绯荤粺缁熻淇℃伅',
      },
      { status: 500 }
    );
  }
}

