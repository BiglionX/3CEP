/**
 * FCX智能推荐API接口
 * 提供个性化推荐、行为收集、反馈记录等功能
 */

import { NextResponse } from "next/server";

import {
  RecommendationContext,
  RecommendationFeedback,
  RecommendationItemType,
  UserActionType,
} from "@/fcx-system/models/recommendation.model";
import { HybridRecommenderService } from "@/fcx-system/services/hybrid-recommender.service";
import { UserBehaviorCollectorService } from "@/fcx-system/services/user-behavior-collector.service";
import { generateUUID } from "@/fcx-system/utils/helpers";

// 全局推荐引擎实例
let recommender: HybridRecommenderService | null = null;
let behaviorCollector: UserBehaviorCollectorService | null = null;

// 初始化服务
async function initializeServices() {
  if (!recommender) {
    recommender = new HybridRecommenderService();
    await recommender.initialize();
  }

  if (!behaviorCollector) {
    behaviorCollector = new UserBehaviorCollectorService();
  }
}

// GET - 获取推荐
export async function GET(request: Request) {
  try {
    await initializeServices();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const count = parseInt(searchParams.get("count") || "10");
    const location = searchParams.get("location"); // lat,lng格式
    const categories = searchParams.get("categories"); // 逗号分隔

    if (!userId) {
      return NextResponse.json({ error: "缺少用户ID参数" }, { status: 400 });
    }

    // 构建推荐上下文
    const context: RecommendationContext = {
      userId,
      filters: {},
    };

    // 解析位置信息
    if (location) {
      const [lat, lng] = location.split(",").map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        context.location = { lat, lng };
      }
    }

    // 解析类别过滤
    if (categories) {
      context.filters!.categories = categories.split(",");
    }

    // 生成推荐
    const result = await recommender!.getRecommendations(context, count);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("推荐API错误:", error);
    return NextResponse.json(
      {
        error: "推荐服务暂时不可用",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    );
  }
}

// POST - 多种操作：推荐、行为记录、反馈等
export async function POST(request: Request) {
  try {
    await initializeServices();

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case "get-recommendations":
        return await handleGetRecommendations(params);

      case "record-behavior":
        return await handleRecordBehavior(params);

      case "batch-recommend":
        return await handleBatchRecommend(params);

      case "record-feedback":
        return await handleRecordFeedback(params);

      case "health-check":
        return await handleHealthCheck();

      case "retrain-model":
        return await handleRetrainModel(params);

      default:
        return NextResponse.json(
          { error: `不支持的操作: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("推荐API POST错误:", error);
    return NextResponse.json(
      {
        error: "请求处理失败",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    );
  }
}

// 处理获取推荐请求
async function handleGetRecommendations(params: any) {
  const { userId, context, count = 10 } = params;

  if (!userId) {
    return NextResponse.json({ error: "缺少用户ID" }, { status: 400 });
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

// 处理行为记录请求
async function handleRecordBehavior(params: any) {
  const { userId, itemId, itemType, actionType, context, metadata } = params;

  if (!userId || !itemId || !actionType) {
    return NextResponse.json(
      { error: "缺少必要参数: userId, itemId, actionType" },
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
    message: "行为记录成功",
    timestamp: new Date().toISOString(),
  });
}

// 处理批量推荐请求
async function handleBatchRecommend(params: any) {
  const { contexts, count = 10 } = params;

  if (!contexts || !Array.isArray(contexts)) {
    return NextResponse.json({ error: "contexts必须是数组" }, { status: 400 });
  }

  const results = await recommender!.batchRecommend(contexts, count);

  return NextResponse.json({
    success: true,
    data: results,
    count: results.length,
    timestamp: new Date().toISOString(),
  });
}

// 处理反馈记录请求
async function handleRecordFeedback(params: any) {
  const { userId, recommendationId, itemId, rating, feedbackType, metadata } =
    params;

  if (!userId || !recommendationId || !itemId || rating === undefined) {
    return NextResponse.json(
      { error: "缺少必要参数: userId, recommendationId, itemId, rating" },
      { status: 400 }
    );
  }

  const feedback: RecommendationFeedback = {
    userId,
    recommendationId,
    itemId,
    rating,
    feedbackType: feedbackType || "explicit",
    timestamp: new Date().toISOString(),
    metadata,
  };

  await recommender!.recordFeedback(feedback);

  return NextResponse.json({
    success: true,
    message: "反馈记录成功",
    timestamp: new Date().toISOString(),
  });
}

// 处理健康检查请求
async function handleHealthCheck() {
  const healthStatus = await recommender!.getHealthStatus();

  return NextResponse.json({
    success: true,
    data: healthStatus,
    timestamp: new Date().toISOString(),
  });
}

// 处理模型重新训练请求
async function handleRetrainModel(params: any) {
  const { force = false } = params;

  await recommender!.retrainModel(force);

  return NextResponse.json({
    success: true,
    message: "模型重新训练启动",
    timestamp: new Date().toISOString(),
  });
}

// PUT - 更新用户偏好
export async function PUT(request: Request) {
  try {
    await initializeServices();

    const body = await request.json();
    const { userId, preferences } = body;

    if (!userId || !preferences) {
      return NextResponse.json(
        { error: "缺少必要参数: userId, preferences" },
        { status: 400 }
      );
    }

    // 这里应该调用用户画像服务更新偏好
    // 暂时返回成功响应
    console.log(`更新用户偏好: ${userId}`, preferences);

    return NextResponse.json({
      success: true,
      message: "用户偏好更新成功",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("更新用户偏好错误:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

// DELETE - 清理过期数据
export async function DELETE(request: Request) {
  try {
    await initializeServices();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "90");

    const deletedCount = await behaviorCollector!.cleanupOldBehaviors(days);

    return NextResponse.json({
      success: true,
      message: `清理完成，删除 ${deletedCount} 条过期记录`,
      deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("清理过期数据错误:", error);
    return NextResponse.json({ error: "清理失败" }, { status: 500 });
  }
}

// 辅助函数
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
