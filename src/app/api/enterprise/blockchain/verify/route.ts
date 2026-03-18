import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { blockchainConfig, contractAddresses } from '@/lib/blockchain/config';

// 合约 ABI
const PRODUCT_AUTH_ABI = [
  'function verifyProduct(string productId) view returns (bool isValid, tuple(string productId, string internalCode, string productName, string productModel, string category, uint256 createdAt, uint256 batchId, bool isRegistered, address registrant) productInfo)',
  'function getTraceabilityHistory(string productId, uint256 startIndex, uint256 limit) view returns (tuple(string productId, string action, string description, string location, string operator, uint256 timestamp, string extraData)[])',
];

export const dynamic = 'force-dynamic';

/**
 * GET /api/enterprise/blockchain/verify?productId=xxx
 * 验证产品真伪
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

    const config = blockchainConfig.development;
    
    // 创建只读 provider
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    
    // 创建合约实例（只读）
    const contract = new ethers.Contract(
      contractAddresses.productAuth,
      PRODUCT_AUTH_ABI,
      provider
    );

    // 验证产品
    const [isValid, productInfo] = await contract.verifyProduct(productId);

    // 如果产品有效，获取溯源历史
    let traceabilityHistory = [];
    if (isValid) {
      try {
        traceabilityHistory = await contract.getTraceabilityHistory(productId, 0, 10);
      } catch {
        // 溯源记录可能为空
        traceabilityHistory = [];
      }
    }

    return NextResponse.json({
      success: true,
      result: {
        isValid,
        product: isValid ? {
          productId: productInfo[0],
          internalCode: productInfo[1],
          productName: productInfo[2],
          productModel: productInfo[3],
          category: productInfo[4],
          createdAt: Number(productInfo[5]),
          batchId: Number(productInfo[6]),
          isRegistered: productInfo[7],
          registrant: productInfo[8],
        } : null,
        traceabilityHistory: traceabilityHistory.map((record: any[]) => ({
          action: record[0],
          description: record[1],
          location: record[2],
          operator: record[3],
          timestamp: Number(record[4]),
          extraData: record[5],
        })),
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Product verification failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    }, { status: 500 });
  }
}
