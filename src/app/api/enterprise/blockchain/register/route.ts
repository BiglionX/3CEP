import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { blockchainConfig, contractAddresses } from '@/lib/blockchain/config';

// 合约 ABI
const PRODUCT_AUTH_ABI = [
  'function registerProduct(string productId, string internalCode, string productName, string productModel, string category, uint256 batchId) returns (bool)',
  'function batchRegisterProducts(string[] productIds, string[] internalCodes, string[] productNames, string[] productModels, string[] categories, uint256 batchId) returns (bool)',
];

export const dynamic = 'force-dynamic';

/**
 * POST /api/enterprise/blockchain/register
 * 注册产品到区块链
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products, privateKey } = body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid products array',
      }, { status: 400 });
    }

    // 检查是否提供了私钥（用于服务器端签名）
    if (!privateKey) {
      return NextResponse.json({
        success: false,
        error: 'Private key is required for server-side registration',
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

    // 准备批量注册数据
    const productIds: string[] = [];
    const internalCodes: string[] = [];
    const productNames: string[] = [];
    const productModels: string[] = [];
    const categories: string[] = [];
    let batchId = 0;

    for (const product of products) {
      productIds.push(product.productId);
      internalCodes.push(product.internalCode);
      productNames.push(product.productName);
      productModels.push(product.productModel || '');
      categories.push(product.category || '');
      batchId = product.batchId || 0;
    }

    // 执行批量注册
    let tx;
    if (products.length === 1) {
      // 单个产品注册
      tx = await contract.registerProduct(
        productIds[0],
        internalCodes[0],
        productNames[0],
        productModels[0],
        categories[0],
        batchId
      );
    } else {
      // 批量注册
      tx = await contract.batchRegisterProducts(
        productIds,
        internalCodes,
        productNames,
        productModels,
        categories,
        batchId
      );
    }

    // 等待交易确认
    const receipt = await tx.wait();

    return NextResponse.json({
      success: true,
      message: `Successfully registered ${products.length} product(s)`,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed?.toString(),
      products: products.map((p: any) => ({
        productId: p.productId,
        status: 'registered',
      })),
    });
  } catch (error) {
    console.error('Product registration failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    }, { status: 500 });
  }
}
