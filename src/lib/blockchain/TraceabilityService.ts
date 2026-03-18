/**
 * 双轨溯源服务
 * 整合数据库溯源和区块链溯源
 */

import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { blockchainConfig, contractAddresses } from '@/lib/blockchain/config';

// 初始化 Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 合约 ABI
const PRODUCT_AUTH_ABI = [
  'function registerProduct(string productId, string internalCode, string productName, string productModel, string category, uint256 batchId) returns (bool)',
  'function addTraceabilityRecord(string productId, string action, string description, string location, string operator, string extraData) returns (bool)',
  'function verifyProduct(string productId) view returns (bool isValid, tuple(string productId, string internalCode, string productName, string productModel, string category, uint256 createdAt, uint256 batchId, bool isRegistered, address registrant) productInfo)',
  'function getTraceabilityHistory(string productId, uint256 startIndex, uint256 limit) view returns (tuple(string productId, string action, string description, string location, string operator, uint256 timestamp, string extraData)[])',
];

export interface SyncResult {
  success: boolean;
  databaseUpdated: boolean;
  blockchainUpdated: boolean;
  transactionHash?: string;
  error?: string;
}

/**
 * 双轨溯源服务类
 */
export class TraceabilityService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private privateKey: string;

  constructor() {
    const config = blockchainConfig.development;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    
    // 从环境变量获取私钥
    this.privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY || '';
    
    this.contract = new ethers.Contract(
      contractAddresses.productAuth,
      PRODUCT_AUTH_ABI,
      this.provider
    );
  }

  /**
   * 同步批次产品到区块链
   */
  async syncBatchToBlockchain(batchId: string): Promise<SyncResult> {
    try {
      // 1. 从数据库获取批次信息
      const { data: batch, error: batchError } = await supabase
        .from('enterprise_qr_batches')
        .select('*')
        .eq('batch_id', batchId)
        .single();

      if (batchError || !batch) {
        return {
          success: false,
          databaseUpdated: false,
          blockchainUpdated: false,
          error: '批次不存在',
        };
      }

      // 2. 获取批次下的所有二维码
      const { data: qrCodes, error: qrError } = await supabase
        .from('enterprise_qr_codes')
        .select('product_id, internal_code')
        .eq('batch_id', batchId);

      if (qrError || !qrCodes) {
        return {
          success: false,
          databaseUpdated: false,
          blockchainUpdated: false,
          error: '获取二维码失败',
        };
      }

      // 3. 准备批量上链数据
      const productIds = qrCodes.map(qr => qr.product_id);
      const internalCodes = qrCodes.map(qr => qr.internal_code);
      const productNames = qrCodes.map(() => batch.product_name);
      const productModels = qrCodes.map(() => batch.product_model || '');
      const categories = qrCodes.map(() => batch.product_category || '');

      // 4. 签名并上链
      let tx;
      if (!this.privateKey) {
        return {
          success: false,
          databaseUpdated: true,
          blockchainUpdated: false,
          error: '未配置区块链私钥',
        };
      }

      const wallet = new ethers.Wallet(this.privateKey, this.provider);
      const contractWithSigner = this.contract.connect(wallet);

      // 分批上链（每批100个）
      const batchSize = 100;
      const totalBatches = Math.ceil(productIds.length / batchSize);

      for (let i = 0; i < totalBatches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, productIds.length);
        
        const batchProductIds = productIds.slice(start, end);
        const batchInternalCodes = internalCodes.slice(start, end);
        const batchProductNames = productNames.slice(start, end);
        const batchProductModels = productModels.slice(start, end);
        const batchCategories = categories.slice(start, end);

        tx = await contractWithSigner.batchRegisterProducts(
          batchProductIds,
          batchInternalCodes,
          batchProductNames,
          batchProductModels,
          batchCategories,
          parseInt(batchId.replace('batch_', '')) || i
        );

        await tx.wait();
      }

      // 5. 更新数据库状态
      const { error: updateError } = await supabase
        .from('enterprise_qr_batches')
        .update({
          config: {
            ...batch.config,
            blockchain_synced: true,
            blockchain_tx_hash: tx?.hash,
            blockchain_synced_at: new Date().toISOString(),
          },
        } as any)
        .eq('batch_id', batchId);

      return {
        success: true,
        databaseUpdated: !updateError,
        blockchainUpdated: true,
        transactionHash: tx?.hash,
      };
    } catch (error) {
      console.error('同步到区块链失败:', error);
      return {
        success: false,
        databaseUpdated: false,
        blockchainUpdated: false,
        error: error instanceof Error ? error.message : '同步失败',
      };
    }
  }

  /**
   * 添加溯源记录（双轨）
   */
  async addTraceabilityRecord(
    productId: string,
    action: string,
    description: string,
    location: string,
    operator: string
  ): Promise<SyncResult> {
    try {
      // 1. 保存到数据库
      const { error: dbError } = await supabase
        .from('enterprise_qr_scan_logs')
        .insert({
          product_id: productId,
          region: location,
          scanned_at: new Date().toISOString(),
        } as any);

      if (dbError) {
        console.error('数据库记录失败:', dbError);
      }

      // 2. 上链
      if (!this.privateKey) {
        return {
          success: true,
          databaseUpdated: !dbError,
          blockchainUpdated: false,
          error: '未配置区块链私钥，仅保存在数据库',
        };
      }

      const wallet = new ethers.Wallet(this.privateKey, this.provider);
      const contractWithSigner = this.contract.connect(wallet);

      const tx = await contractWithSigner.addTraceabilityRecord(
        productId,
        action,
        description,
        location,
        operator,
        ''
      );

      const receipt = await tx.wait();

      return {
        success: true,
        databaseUpdated: true,
        blockchainUpdated: true,
        transactionHash: receipt.hash,
      };
    } catch (error) {
      console.error('添加溯源记录失败:', error);
      return {
        success: false,
        databaseUpdated: false,
        blockchainUpdated: false,
        error: error instanceof Error ? error.message : '操作失败',
      };
    }
  }

  /**
   * 验证产品（双轨查询）
   */
  async verifyProduct(productId: string) {
    try {
      // 1. 查询数据库
      const { data: qrCode, error: qrError } = await supabase
        .from('enterprise_qr_codes')
        .select('*, enterprise_qr_batches(*)')
        .eq('product_id', productId)
        .single();

      const dbResult = {
        found: !qrError && !!qrCode,
        data: qrCode,
      };

      // 2. 查询区块链
      let blockchainResult = {
        isValid: false,
        product: null as any,
      };

      try {
        const [isValid, productInfo] = await this.contract.verifyProduct(productId);
        blockchainResult = {
          isValid,
          product: isValid ? {
            productId: productInfo[0],
            internalCode: productInfo[1],
            productName: productInfo[2],
            productModel: productInfo[3],
            category: productInfo[4],
            createdAt: Number(productInfo[5]),
            batchId: Number(productInfo[6]),
          } : null,
        };
      } catch (error) {
        console.error('区块链查询失败:', error);
      }

      // 综合判断
      const isAuthentic = dbResult.found && blockchainResult.isValid;

      return {
        isValid: isAuthentic,
        database: dbResult,
        blockchain: blockchainResult,
        message: isAuthentic
          ? '产品验证通过（数据库+区块链双轨确认）'
          : blockchainResult.isValid
            ? '产品验证通过（区块链确认）'
            : dbResult.found
              ? '产品存在于数据库，但区块链状态异常'
              : '产品未找到',
      };
    } catch (error) {
      console.error('验证产品失败:', error);
      return {
        isValid: false,
        error: error instanceof Error ? error.message : '验证失败',
      };
    }
  }
}

// 导出单例
export const traceabilityService = new TraceabilityService();
