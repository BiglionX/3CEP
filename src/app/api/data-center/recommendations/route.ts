import { NextRequest, NextResponse } from 'next/server';
import { hybridRecommender, UserBehavior } from '@/data-center/ml/recommendation-engine';

// 模拟用户行为数据（实际应该从数据库获取）
const mockUserData: UserBehavior[] = [
  { userId: 'user_001', itemId: 'iphone_15_pro', actionType: 'view', timestamp: '2024-01-01T10:00:00Z', score: 1.0 },
  { userId: 'user_001', itemId: 'iphone_screen', actionType: 'search', timestamp: '2024-01-01T10:05:00Z', score: 0.8 },
  { userId: 'user_001', itemId: 'battery_pack', actionType: 'purchase', timestamp: '2024-01-01T11:00:00Z', score: 1.5 },
  { userId: 'user_002', itemId: 'galaxy_s24', actionType: 'view', timestamp: '2024-01-01T09:30:00Z', score: 1.0 },
  { userId: 'user_002', itemId: 'galaxy_battery', actionType: 'search', timestamp: '2024-01-01T09:35:00Z', score: 0.8 },
  { userId: 'user_003', itemId: 'iphone_14', actionType: 'view', timestamp: '2024-01-01T14:00:00Z', score: 1.0 },
  { userId: 'user_003', itemId: 'screen_protector', actionType: 'favorite', timestamp: '2024-01-01T14:05:00Z', score: 1.2 }
];

let isTrained = false;

// 初始化推荐模型
async function initializeRecommender() {
  if (isTrained) return;
  
  try {
    console.log('🤖 初始化推荐系统...');
    await hybridRecommender.train(mockUserData);
    isTrained = true;
    console.log('✅ 推荐系统初始化完成');
  } catch (error) {
    console.error('❌ 推荐系统初始化失败:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    await initializeRecommender();
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'recommend';
    const userId = searchParams.get('userId');
    const count = parseInt(searchParams.get('count') || '10');

    switch (action) {
      case 'recommend':
        if (!userId) {
          return NextResponse.json(
            { error: '缺少userId参数' },
            { status: 400 }
          );
        }

        const recommendations = await hybridRecommender.recommend(userId, count);
        
        return NextResponse.json({
          userId,
          recommendations,
          count: recommendations.length,
          modelType: 'hybrid',
          timestamp: new Date().toISOString()
        });

      case 'model-info':
        return NextResponse.json({
          status: isTrained ? 'trained' : 'pending',
          modelTypes: ['collaborative-filter', 'content-based'],
          trainingDataSize: mockUserData.length,
          lastTrained: isTrained ? new Date().toISOString() : null,
          timestamp: new Date().toISOString()
        });

      case 'popular-items':
        // 返回热门物品推荐
        const popularItems = [
          { itemId: 'iphone_15_pro_max', itemType: 'device', score: 95, reason: '本周最热门', confidence: 0.95 },
          { itemId: 'galaxy_s24_ultra', itemType: 'device', score: 92, reason: '热销新品', confidence: 0.92 },
          { itemId: 'premium_screen', itemType: 'part', score: 88, reason: '高性价比', confidence: 0.88 }
        ];
        
        return NextResponse.json({
          items: popularItems,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: '未知的操作类型' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('推荐系统API错误:', error);
    return NextResponse.json(
      { 
        error: error.message || '内部服务器错误',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeRecommender();
    
    const body = await request.json();
    const { action, userId, behavior, retrain } = body;

    switch (action) {
      case 'record-behavior':
        if (!userId || !behavior) {
          return NextResponse.json(
            { error: '缺少必要参数' },
            { status: 400 }
          );
        }

        // 记录用户行为（简化处理）
        const newBehavior: UserBehavior = {
          userId,
          itemId: behavior.itemId,
          actionType: behavior.actionType,
          timestamp: behavior.timestamp || new Date().toISOString(),
          score: behavior.score || 1.0
        };

        // 在实际应用中，这里应该将行为数据存储到数据库
        mockUserData.push(newBehavior);
        
        // 可选：重新训练模型
        if (retrain) {
          await hybridRecommender.train(mockUserData);
        }

        return NextResponse.json({
          message: '用户行为记录成功',
          behavior: newBehavior,
          totalBehaviors: mockUserData.length,
          timestamp: new Date().toISOString()
        });

      case 'batch-recommend':
        if (!body.userIds || !Array.isArray(body.userIds)) {
          return NextResponse.json(
            { error: '缺少userIds数组参数' },
            { status: 400 }
          );
        }

        const count = body.count || 5;
        const batchResults: Record<string, any> = {};

        // 并行生成推荐
        await Promise.all(
          body.userIds.map(async (uid: string) => {
            try {
              const recs = await hybridRecommender.recommend(uid, count);
              batchResults[uid] = {
                success: true,
                recommendations: recs,
                count: recs.length
              };
            } catch (error) {
              batchResults[uid] = {
                success: false,
                error: error instanceof Error ? error.message : '推荐生成失败'
              };
            }
          })
        );

        return NextResponse.json({
          results: batchResults,
          successful: Object.values(batchResults).filter((r: any) => r.success).length,
          failed: Object.values(batchResults).filter((r: any) => !r.success).length,
          timestamp: new Date().toISOString()
        });

      case 'feedback':
        const { recommendationId, rating, feedback } = body;
        
        if (!recommendationId || rating === undefined) {
          return NextResponse.json(
            { error: '缺少推荐ID或评分' },
            { status: 400 }
          );
        }

        // 记录用户反馈（用于模型优化）
        console.log(`📝 用户反馈: ${recommendationId}, 评分: ${rating}, 反馈: ${feedback || '无'}`);
        
        return NextResponse.json({
          message: '反馈记录成功',
          recommendationId,
          rating,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: '未知的操作类型' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('推荐系统API错误:', error);
    return NextResponse.json(
      { 
        error: error.message || '内部服务器错误',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}