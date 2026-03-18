import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { blockchainConfig, contractAddresses } from '@/lib/blockchain/config';

// 合约 ABI
const PRODUCT_AUTH_ABI = [
  'function addTraceabilityRecord(string productId, string action, string description, string location, string operator, string extraData) returns (bool)',
  'function getTraceabilityHistory(string productId, uint256 startIndex, uint256 limit) view returns (tuple(string productId, string action, string description, string location, string operator, uint256 timestamp, string extraData)[])',
  'function getTraceabilityCount(string productId) view returns (uint256)',
];

export const dynamic = 'force-dynamic';

/**
 * POST /api/enterprise/blockchain/traceability
 * 添加溯源记录
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { records, privateKey } = body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid records array',
      }, { status: 400 });
    }

    if (!privateKey) {
      return NextResponse.json({
        success: false,
        error: 'Private key is required for server-side operation',
      }, { status: 400 });
    }

    const config = blockchainConfig.development;
    
    // 创建 provider 和签名者
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // 创建合约实例
    const contract = new ethers.Contract(
      contractAddresses.productAuth,
      PRODUCT_AUTH_ABI,
      wallet
    );

    const results = [];

    // 逐条添加溯源记录
    for (const record of records) {
      try {
        const tx = await contract.addTraceabilityRecord(
          record.productId,
          record.action,
          record.description,
          record.location,
          record.operator,
          record.extraData || ''
        );

        const receipt = await tx.wait();

        results.push({
          productId: record.productId,
          action: record.action,
          success: true,
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
        });
      } catch (error) {
        results.push({
          productId: record.productId,
          action: record.action,
          success: false,
          error: error instanceof Error ? error.message : 'Failed to add record',
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: successCount > 0,
      message: `Successfully added ${successCount}/${records.length} traceability record(s)`,
      results,
    });
  } catch (error) {
    console.error('Add traceability record failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Operation failed',
    }, { status: 500 });
  }
}

/**
 * GET /api/enterprise/blockchain/traceability?productId=xxx
 * 获取溯源历史
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const startIndex = parseInt(searchParams.get('startIndex') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!productId) {
      return NextResponse.json({
        success: false,
        error: 'Product ID is required',
      }, { status: 400 });
    }

    const config = blockchainConfig.development;
    
    // 创建只读 provider
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    
    // 创建合约实例
    const contract = new ethers.Contract(
      contractAddresses.productAuth,
      PRODUCT_AUTH_ABI,
      provider
    );

    // 获取溯源记录数量
    const totalCount = await contract.getTraceabilityCount(productId);
    
    // 获取溯源历史
    const history = await contract.getTraceabilityHistory(productId, startIndex, limit);

    return NextResponse.json({
      success: true,
      result: {
        productId,
        totalCount: Number(totalCount),
        records: history.map((record: any[]) => ({
          action: record[0],
          description: record[1],
          location: record[2],
          operator: record[3],
          timestamp: Number(record[4]),
          extraData: record[5],
        })),
      },
    });
  } catch (error) {
    console.error('Get traceability history failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Query failed',
    }, { status: 500 });
  }
}
