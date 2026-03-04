/**
 * 鎬ц兘浼樺寲鐨勯噰璐櫤鑳戒綋API绀轰緥
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  cacheMiddleware,
  generateCacheKey,
} from '@/middleware/cache.middleware';

// 妯℃嫙浼樺寲鍚庣殑鏈嶅姟
class OptimizedProcurementService {
  // 浣跨敤棰勮绠楀拰缂撳瓨鐨勪緵搴斿晢璇勫垎
  private supplierScoresCache = new Map<
    string,
    { score: number; timestamp: number }
  >();

  async getSupplierProfileOptimized(supplierId: string) {
    // 1. 棣栧厛妫€鏌ュ唴瀛樼紦?    const cached = this.supplierScoresCache.get(supplierId);
    if (cached && Date.now() - cached.timestamp < 300000) {
      // 5鍒嗛挓缂撳瓨
      console.log('Memory cache hit for supplier:', supplierId);
      return { supplierId, score: cached.score, fromCache: true };
    }

    // 2. 妯℃嫙浼樺寲鍚庣殑鏁版嵁搴撴煡璇紙姣斿師鏉ュ揩30%锟?    await new Promise(resolve => setTimeout(resolve, 70)); // 浼樺寲?00ms -> 浼樺寲?0ms

    const score = Math.floor(Math.random() * 40) + 60;

    // 3. 鏇存柊鍐呭瓨缂撳瓨
    this.supplierScoresCache.set(supplierId, {
      score,
      timestamp: Date.now(),
    });

    return { supplierId, score, fromCache: false };
  }

  // 鎵归噺澶勭悊浼樺寲
  async getMultipleSupplierProfiles(supplierIds: string[]) {
    // 骞惰澶勭悊澶氫釜璇锋眰
    const promises = supplierIds.map(id =>
      this.getSupplierProfileOptimized(id)
    );
    return Promise.all(promises);
  }

  // 寮傛澶勭悊鑰楁椂鎿嶄綔
  async processRiskAssessmentAsync(data: any) {
    // 绔嬪嵆杩斿洖鎺ユ敹纭
    const taskId = `task_${Date.now()}`;

    // 寮傛澶勭悊
    setImmediate(async () => {
      try {
        // 妯℃嫙鑰楁椂鐨勯闄╄瘎浼拌?        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(`Risk assessment completed for task: ${taskId}`);
      } catch (error) {
        console.error(`Risk assessment failed for task: ${taskId}`, error);
      }
    });

    return { taskId, status: 'processing', message: 'Risk assessment started' };
  }
}

const optimizedService = new OptimizedProcurementService();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const supplierId = searchParams.get('supplierId');
  const action = searchParams.get('action') || 'profile';

  if (!supplierId) {
    return NextResponse.json({ error: 'Missing supplierId' }, { status: 400 });
  }

  try {
    // 鐢熸垚缂撳瓨?    const cacheKey = generateCacheKey('supplier-profile', {
      supplierId,
      action,
    });

    // 浣跨敤缂撳瓨涓棿?    return await cacheMiddleware(
      request,
      async () => {
        const result =
          await optimizedService.getSupplierProfileOptimized(supplierId);
        return NextResponse.json({
          success: true,
          data: result,
          timestamp: new Date().toISOString(),
          optimization: 'Response time reduced by ~30%',
        });
      },
      cacheKey,
      1800 // 30鍒嗛挓缂撳瓨
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'batch_profile':
        const profiles = await optimizedService.getMultipleSupplierProfiles(
          data.supplierIds || []
        );
        return NextResponse.json({
          success: true,
          data: profiles,
          optimization: 'Batch processing reduced response time by ~40%',
        });

      case 'async_risk_assessment':
        const result = await optimizedService.processRiskAssessmentAsync(data);
        return NextResponse.json({
          success: true,
          data: result,
          optimization: 'Asynchronous processing enabled',
        });

      default:
        return NextResponse.json(
          { error: 'Unsupported action' },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

