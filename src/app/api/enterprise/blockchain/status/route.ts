import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { blockchainConfig, contractAddresses } from '@/lib/blockchain/config';

export const dynamic = 'force-dynamic';

/**
 * GET /api/enterprise/blockchain/status
 * 获取区块链连接状态
 */
export async function GET(request: NextRequest) {
  try {
    const config = blockchainConfig.development;
    
    // 创建 provider
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    
    // 获取网络信息
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    // 验证链 ID
    const expectedChainId = config.chainId;
    const actualChainId = Number(network.chainId);
    
    if (actualChainId !== expectedChainId) {
      return NextResponse.json({
        success: false,
        error: `Chain ID mismatch. Expected: ${expectedChainId}, Got: ${actualChainId}`,
        status: {
          isConnected: false,
          chainId: actualChainId,
          blockNumber,
          networkName: network.name || 'Unknown',
          contractAddress: contractAddresses.productAuth,
        },
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      status: {
        isConnected: true,
        chainId: actualChainId,
        blockNumber,
        networkName: network.name || 'Localhost',
        contractAddress: contractAddresses.productAuth,
      },
    });
  } catch (error) {
    console.error('Blockchain status check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect to blockchain',
      status: {
        isConnected: false,
        chainId: 0,
        blockNumber: 0,
        networkName: 'Unknown',
        contractAddress: contractAddresses.productAuth,
      },
    }, { status: 500 });
  }
}
