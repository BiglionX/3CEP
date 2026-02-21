import { NextResponse } from 'next/server';
import { upgradeRecommendationService, UpgradeRecommendation } from '@/services/crowdfunding/upgrade-recommendation.service';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/crowdfunding/recommend?userId=xxx
 * 获取用户机型升级推荐
 * 
 * 查询参数:
 * - userId: 用户ID (必需)
 * - limit: 返回推荐数量，默认5
 * - useCache: 是否使用缓存推荐，默认true
 * 
 * 返回:
 * - success: boolean - 是否成功
 * - data: UpgradeRecommendation[] - 推荐列表
 * - message: string - 结果消息
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '5');
    const useCache = searchParams.get('useCache') !== 'false'; // 默认使用缓存

    // 验证必需参数
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: '缺少userId参数' 
        },
        { status: 400 }
      );
    }

    // 验证用户是否存在
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { 
          success: false, 
          error: '用户不存在' 
        },
        { status: 404 }
      );
    }

    let recommendations: UpgradeRecommendation[] = [];

    // 如果使用缓存，先尝试获取缓存的推荐
    if (useCache) {
      const cachedRecommendations = await upgradeRecommendationService.getCachedRecommendations(userId, limit);
      recommendations = cachedRecommendations;
    }

    // 如果缓存为空或不使用缓存，则生成新的推荐
    if (recommendations.length === 0) {
      const freshRecommendations = await upgradeRecommendationService.generateRecommendations(userId, limit);
      recommendations = freshRecommendations;
    }

    // 准备响应数据
    const responseData = {
      success: true,
      data: recommendations,
      meta: {
        totalCount: recommendations.length,
        userId,
        timestamp: new Date().toISOString(),
        fromCache: useCache && recommendations.some(r => r.isNew === false)
      },
      message: recommendations.length > 0 
        ? `为您找到${recommendations.length}个升级推荐` 
        : '暂无适合的升级推荐'
    };

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('获取升级推荐失败:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: '获取推荐失败',
        message: error.message || '服务器内部错误'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/crowdfunding/recommend
 * 强制刷新用户的推荐（忽略缓存）
 * 
 * 请求体:
 * - userId: string - 用户ID (必需)
 * - limit: number - 返回推荐数量，默认5
 * 
 * 返回:
 * - success: boolean - 是否成功
 * - data: UpgradeRecommendation[] - 新生成的推荐列表
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, limit = 5 } = body;

    // 验证必需参数
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: '缺少userId参数' 
        },
        { status: 400 }
      );
    }

    // 验证用户是否存在
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { 
          success: false, 
          error: '用户不存在' 
        },
        { status: 404 }
      );
    }

    // 直接生成新的推荐（不使用缓存）
    const recommendations = await upgradeRecommendationService.generateRecommendations(userId, limit);

    const responseData = {
      success: true,
      data: recommendations,
      meta: {
        totalCount: recommendations.length,
        userId,
        timestamp: new Date().toISOString(),
        refreshed: true
      },
      message: recommendations.length > 0 
        ? `已为您刷新${recommendations.length}个升级推荐` 
        : '暂无适合的升级推荐'
    };

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('刷新升级推荐失败:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: '刷新推荐失败',
        message: error.message || '服务器内部错误'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/crowdfunding/recommend/click
 * 记录推荐点击
 * 
 * 请求体:
 * - userId: string - 用户ID (必需)
 * - oldModel: string - 旧机型 (必需)
 * - newModel: string - 新机型 (必需)
 * 
 * 返回:
 * - success: boolean - 是否成功
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, oldModel, newModel } = body;

    // 验证必需参数
    if (!userId || !oldModel || !newModel) {
      return NextResponse.json(
        { 
          success: false, 
          error: '缺少必需参数' 
        },
        { status: 400 }
      );
    }

    // 记录点击
    await upgradeRecommendationService.recordRecommendationClick(userId, oldModel, newModel);

    return NextResponse.json({
      success: true,
      message: '点击记录成功'
    });

  } catch (error: any) {
    console.error('记录推荐点击失败:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: '记录点击失败',
        message: error.message || '服务器内部错误'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/crowdfunding/recommend/conversion
 * 记录推荐转化（用户下单）
 * 
 * 请求体:
 * - userId: string - 用户ID (必需)
 * - oldModel: string - 旧机型 (必需)
 * - newModel: string - 新机型 (必需)
 * 
 * 返回:
 * - success: boolean - 是否成功
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, oldModel, newModel } = body;

    // 验证必需参数
    if (!userId || !oldModel || !newModel) {
      return NextResponse.json(
        { 
          success: false, 
          error: '缺少必需参数' 
        },
        { status: 400 }
      );
    }

    // 记录转化
    await upgradeRecommendationService.recordRecommendationConversion(userId, oldModel, newModel);

    return NextResponse.json({
      success: true,
      message: '转化记录成功'
    });

  } catch (error: any) {
    console.error('记录推荐转化失败:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: '记录转化失败',
        message: error.message || '服务器内部错误'
      },
      { status: 500 }
    );
  }
}