import { NextRequest, NextResponse } from 'next/server';
import { hybridRecommender, UserBehavior } from '@/modules/data-center/ml/recommendation-engine';

// 妯℃嫙鐢ㄦ埛琛屼负鏁版嵁锛堝疄闄呭簲璇ヤ粠鏁版嵁搴撹幏鍙栵級
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

// 鍒濆鍖栨帹鑽愭ā?
async function initializeRecommender() {
  if (isTrained) return;
  
  try {
    console.log('馃 鍒濆鍖栨帹鑽愮郴?..');
    await hybridRecommender.train(mockUserData);
    isTrained = true;
    console.log('锟?鎺ㄨ崘绯荤粺鍒濆鍖栧畬?);
  } catch (error) {
    console.error('锟?鎺ㄨ崘绯荤粺鍒濆鍖栧け?', error);
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
            { error: '缂哄皯userId鍙傛暟' },
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
        // 杩斿洖鐑棬鐗╁搧鎺ㄨ崘
        const popularItems = [
          { itemId: 'iphone_15_pro_max', itemType: 'device', score: 95, reason: '鏈懆鏈€鐑棬', confidence: 0.95 },
          { itemId: 'galaxy_s24_ultra', itemType: 'device', score: 92, reason: '鐑攢鏂板搧', confidence: 0.92 },
          { itemId: 'premium_screen', itemType: 'part', score: 88, reason: '楂樻€т环?, confidence: 0.88 }
        ];
        
        return NextResponse.json({
          items: popularItems,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: '鏈煡鐨勬搷浣滅被? },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('鎺ㄨ崘绯荤粺API閿欒:', error);
    return NextResponse.json(
      { 
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊?,
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
            { error: '缂哄皯蹇呰鍙傛暟' },
            { status: 400 }
          );
        }

        // 璁板綍鐢ㄦ埛琛屼负锛堢畝鍖栧鐞嗭級
        const newBehavior: UserBehavior = {
          userId,
          itemId: behavior.itemId,
          actionType: behavior.actionType,
          timestamp: behavior.timestamp || new Date().toISOString(),
          score: behavior.score || 1.0
        };

        // 鍦ㄥ疄闄呭簲鐢ㄤ腑锛岃繖閲屽簲璇ュ皢琛屼负鏁版嵁瀛樺偍鍒版暟鎹簱
        mockUserData.push(newBehavior);
        
        // 鍙€夛細閲嶆柊璁粌妯″瀷
        if (retrain) {
          await hybridRecommender.train(mockUserData);
        }

        return NextResponse.json({
          message: '鐢ㄦ埛琛屼负璁板綍鎴愬姛',
          behavior: newBehavior,
          totalBehaviors: mockUserData.length,
          timestamp: new Date().toISOString()
        });

      case 'batch-recommend':
        if (!body.userIds || !Array.isArray(body.userIds)) {
          return NextResponse.json(
            { error: '缂哄皯userIds鏁扮粍鍙傛暟' },
            { status: 400 }
          );
        }

        const count = body.count || 5;
        const batchResults: Record<string, any> = {};

        // 骞惰鐢熸垚鎺ㄨ崘
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
                error: error instanceof Error ? error.message : '鎺ㄨ崘鐢熸垚澶辫触'
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
            { error: '缂哄皯鎺ㄨ崘ID鎴栬瘎? },
            { status: 400 }
          );
        }

        // 璁板綍鐢ㄦ埛鍙嶉锛堢敤浜庢ā鍨嬩紭鍖栵級
        console.log(`馃摑 鐢ㄦ埛鍙嶉: ${recommendationId}, 璇勫垎: ${rating}, 鍙嶉: ${feedback || '锟?}`);
        
        return NextResponse.json({
          message: '鍙嶉璁板綍鎴愬姛',
          recommendationId,
          rating,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: '鏈煡鐨勬搷浣滅被? },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('鎺ㄨ崘绯荤粺API閿欒:', error);
    return NextResponse.json(
      { 
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊?,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
