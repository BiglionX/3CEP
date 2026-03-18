import { NextRequest, NextResponse } from 'next/server';
import { traceabilityService } from '@/lib/blockchain/TraceabilityService';

export const dynamic = 'force-dynamic';

/**
 * POST /api/enterprise/blockchain/sync
 * 同步批次到区块链
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { batchId } = body;

    if (!batchId) {
      return NextResponse.json({
        success: false,
        error: 'Batch ID is required',
      }, { status: 400 });
    }

    const result = await traceabilityService.syncBatchToBlockchain(batchId);

    return NextResponse.json({
      success: result.success,
      result: {
        databaseUpdated: result.databaseUpdated,
        blockchainUpdated: result.blockchainUpdated,
        transactionHash: result.transactionHash,
        error: result.error,
      },
    });
  } catch (error) {
    console.error('Blockchain sync failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Sync failed',
    }, { status: 500 });
  }
}

/**
 * GET /api/enterprise/blockchain/sync?productId=xxx
 * 获取产品双轨验证结果
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({
        success: false,
        error: 'Product ID is required',
      }, { status: 400 });
    }

    const result = await traceabilityService.verifyProduct(productId);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Product verification failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    }, { status: 500 });
  }
}
