/**
 * FCX鏅鸿兘鎺ㄨ崘API鎺ュ彛
 * 鎻愪緵涓€у寲鎺ㄨ崘銆佽涓烘敹闆嗐€佸弽棣堣褰曠瓑鍔熻兘
 */

import { NextResponse } from 'next/server';

import {
  RecommendationContext,
  RecommendationFeedback,
  RecommendationItemType,
  UserActionType,
} from '@/modules/fcx-alliance/models/recommendation.model';
import { HybridRecommenderService } from '@/modules/fcx-alliance/services/hybrid-recommender.service';
import { UserBehaviorCollectorService } from '@/modules/fcx-alliance/services/user-behavior-collector.service';
import { generateUUID } from '@/modules/fcx-alliance/utils/helpers';

// 鍏ㄥ眬鎺ㄨ崘寮曟搸瀹炰緥
let recommender: HybridRecommenderService | null = null;
let behaviorCollector: UserBehaviorCollectorService | null = null;

// 鍒濆鍖栨湇?async function initializeServices() {
  if (!recommender) {
    recommender = new HybridRecommenderService();
    await recommender.initialize();
  }

  if (!behaviorCollector) {
    behaviorCollector = new UserBehaviorCollectorService();
  }
}

// GET - 鑾峰彇鎺ㄨ崘
export async function GET(request: Request) {
  try {
    await initializeServices();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const count = parseInt(searchParams.get('count') || '10');
    const location = searchParams.get('location'); // lat,lng鏍煎紡
    const categories = searchParams.get('categories'); // 閫楀彿鍒嗛殧

    if (!userId) {
      return NextResponse.json({ error: '缂哄皯鐢ㄦ埛ID鍙傛暟' }, { status: 400 });
    }

    // 鏋勫缓鎺ㄨ崘涓婁笅?    const context: RecommendationContext = {
      userId,
      filters: {},
    };

    // 瑙ｆ瀽浣嶇疆淇℃伅
    if (location) {
      const [lat, lng] = location.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        context.location = { lat, lng };
      }
    }

    // 瑙ｆ瀽绫诲埆杩囨护
    if (categories) {
      context.filters!.categories = categories.split(',');
    }

    // 鐢熸垚鎺ㄨ崘
    const result = await recommender!.getRecommendations(context, count);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('鎺ㄨ崘API閿欒:', error);
    return NextResponse.json(
      {
        error: '鎺ㄨ崘鏈嶅姟鏆傛椂涓嶅彲?,
        details: error instanceof Error ? error.message : '鏈煡閿欒',
      },
      { status: 500 }
    );
  }
}

// POST - 澶氱鎿嶄綔锛氭帹鑽愩€佽涓鸿褰曘€佸弽棣堢瓑
export async function POST(request: Request) {
  try {
    await initializeServices();

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'get-recommendations':
        return await handleGetRecommendations(params);

      case 'record-behavior':
        return await handleRecordBehavior(params);

      case 'batch-recommend':
        return await handleBatchRecommend(params);

      case 'record-feedback':
        return await handleRecordFeedback(params);

      case 'health-check':
        return await handleHealthCheck();

      case 'retrain-model':
        return await handleRetrainModel(params);

      default:
        return NextResponse.json(
          { error: `涓嶆敮鎸佺殑鎿嶄綔: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('鎺ㄨ崘API POST閿欒:', error);
    return NextResponse.json(
      {
        error: '璇锋眰澶勭悊澶辫触',
        details: error instanceof Error ? error.message : '鏈煡閿欒',
      },
      { status: 500 }
    );
  }
}

// 澶勭悊鑾峰彇鎺ㄨ崘璇锋眰
async function handleGetRecommendations(params: any) {
  const { userId, context, count = 10 } = params;

  if (!userId) {
    return NextResponse.json({ error: '缂哄皯鐢ㄦ埛ID' }, { status: 400 });
  }

  const recommendationContext: RecommendationContext = {
    userId,
    location: context?.location,
    deviceType: context?.deviceType,
    timeOfDay: context?.timeOfDay,
    filters: context?.filters,
  };

  const result = await recommender!.getRecommendations(
    recommendationContext,
    count
  );

  return NextResponse.json({
    success: true,
    data: result,
    timestamp: new Date().toISOString(),
  });
}

// 澶勭悊琛屼负璁板綍璇锋眰
async function handleRecordBehavior(params: any) {
  const { userId, itemId, itemType, actionType, context, metadata } = params;

  if (!userId || !itemId || !actionType) {
    return NextResponse.json(
      { error: '缂哄皯蹇呰鍙傛暟: userId, itemId, actionType' },
      { status: 400 }
    );
  }

  await behaviorCollector!.recordBehavior({
    id: generateUUID(),
    userId,
    itemId,
    itemType: itemType || RecommendationItemType.REPAIR_SHOP,
    actionType,
    timestamp: new Date().toISOString(),
    score: calculateBehaviorScore(actionType),
    context,
    metadata,
  });

  return NextResponse.json({
    success: true,
    message: '琛屼负璁板綍鎴愬姛',
    timestamp: new Date().toISOString(),
  });
}

// 澶勭悊鎵归噺鎺ㄨ崘璇锋眰
async function handleBatchRecommend(params: any) {
  const { contexts, count = 10 } = params;

  if (!contexts || !Array.isArray(contexts)) {
    return NextResponse.json({ error: 'contexts蹇呴』鏄暟? }, { status: 400 });
  }

  const results = await recommender!.batchRecommend(contexts, count);

  return NextResponse.json({
    success: true,
    data: results,
    count: results.length,
    timestamp: new Date().toISOString(),
  });
}

// 澶勭悊鍙嶉璁板綍璇锋眰
async function handleRecordFeedback(params: any) {
  const { userId, recommendationId, itemId, rating, feedbackType, metadata } =
    params;

  if (!userId || !recommendationId || !itemId || rating === undefined) {
    return NextResponse.json(
      { error: '缂哄皯蹇呰鍙傛暟: userId, recommendationId, itemId, rating' },
      { status: 400 }
    );
  }

  const feedback: RecommendationFeedback = {
    userId,
    recommendationId,
    itemId,
    rating,
    feedbackType: feedbackType || 'explicit',
    timestamp: new Date().toISOString(),
    metadata,
  };

  await recommender!.recordFeedback(feedback);

  return NextResponse.json({
    success: true,
    message: '鍙嶉璁板綍鎴愬姛',
    timestamp: new Date().toISOString(),
  });
}

// 澶勭悊鍋ュ悍妫€鏌ヨ?async function handleHealthCheck() {
  const healthStatus = await recommender!.getHealthStatus();

  return NextResponse.json({
    success: true,
    data: healthStatus,
    timestamp: new Date().toISOString(),
  });
}

// 澶勭悊妯″瀷閲嶆柊璁粌璇锋眰
async function handleRetrainModel(params: any) {
  const { force = false } = params;

  await recommender!.retrainModel(force);

  return NextResponse.json({
    success: true,
    message: '妯″瀷閲嶆柊璁粌鍚姩',
    timestamp: new Date().toISOString(),
  });
}

// PUT - 鏇存柊鐢ㄦ埛鍋忓ソ
export async function PUT(request: Request) {
  try {
    await initializeServices();

    const body = await request.json();
    const { userId, preferences } = body;

    if (!userId || !preferences) {
      return NextResponse.json(
        { error: '缂哄皯蹇呰鍙傛暟: userId, preferences' },
        { status: 400 }
      );
    }

    // 杩欓噷搴旇璋冪敤鐢ㄦ埛鐢诲儚鏈嶅姟鏇存柊鍋忓ソ
    // 鏆傛椂杩斿洖鎴愬姛鍝嶅簲
    console.log(`鏇存柊鐢ㄦ埛鍋忓ソ: ${userId}`, preferences);

    return NextResponse.json({
      success: true,
      message: '鐢ㄦ埛鍋忓ソ鏇存柊鎴愬姛',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('鏇存柊鐢ㄦ埛鍋忓ソ閿欒:', error);
    return NextResponse.json({ error: '鏇存柊澶辫触' }, { status: 500 });
  }
}

// DELETE - 娓呯悊杩囨湡鏁版嵁
export async function DELETE(request: Request) {
  try {
    await initializeServices();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '90');

    const deletedCount = await behaviorCollector!.cleanupOldBehaviors(days);

    return NextResponse.json({
      success: true,
      message: `娓呯悊瀹屾垚锛屽垹?${deletedCount} 鏉¤繃鏈熻褰昤,
      deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('娓呯悊杩囨湡鏁版嵁閿欒:', error);
    return NextResponse.json({ error: '娓呯悊澶辫触' }, { status: 500 });
  }
}

// 杈呭姪鍑芥暟
function calculateBehaviorScore(actionType: UserActionType): number {
  const scoreMap = {
    [UserActionType.VIEW]: 1.0,
    [UserActionType.SEARCH]: 1.2,
    [UserActionType.BOOKMARK]: 1.5,
    [UserActionType.COMPARE]: 1.3,
    [UserActionType.SHARE]: 1.8,
    [UserActionType.COMMENT]: 1.6,
    [UserActionType.PURCHASE]: 2.5,
    [UserActionType.REPAIR]: 2.0,
  };

  return scoreMap[actionType] || 1.0;
}

