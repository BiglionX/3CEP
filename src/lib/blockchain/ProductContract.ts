/**
 * ProductAuth 智能合约交互封装
 * 使用 ethers.js v6 与区块链交互
 */

import { ethers, BrowserProvider, Contract, formatUnits } from 'ethers';
import { blockchainConfig, contractAddresses } from './config';
import type {
  Product,
  TraceabilityRecord,
  VerificationResult,
  RegistrationResult,
  TransactionResult,
  BlockchainStatus,
  RegisterProductParams,
  BatchRegisterParams,
  AddTraceabilityParams,
  BatchTraceabilityParams,
} from './types';

// 合约 ABI（精简版，包含主要方法）
const PRODUCT_AUTH_ABI = [
  // 产品注册
  'function registerProduct(string productId, string internalCode, string productName, string productModel, string category, uint256 batchId) returns (bool)',
  'function batchRegisterProducts(string[] productIds, string[] internalCodes, string[] productNames, string[] productModels, string[] categories, uint256 batchId) returns (bool)',
  
  // 产品验证
  'function verifyProduct(string productId) returns (bool isValid, tuple(string productId, string internalCode, string productName, string productModel, string category, uint256 createdAt, uint256 batchId, bool isRegistered, address registrant) productInfo)',
  'function isProductRegistered(string productId) view returns (bool)',
  
  // 溯源记录
  'function addTraceabilityRecord(string productId, string action, string description, string location, string operator, string extraData) returns (bool)',
  'function batchAddTraceability(string[] productIds, string[] actions, string[] descriptions, string[] locations, string[] operators) returns (bool)',
  'function getTraceabilityHistory(string productId, uint256 startIndex, uint256 limit) view returns (tuple(string productId, string action, string description, string location, string operator, uint256 timestamp, string extraData)[])',
  'function getTraceabilityCount(string productId) view returns (uint256)',
  
  // 查询
  'function getProductInfo(string productId) view returns (tuple(string productId, string internalCode, string productName, string productModel, string category, uint256 createdAt, uint256 batchId, bool isRegistered, address registrant))',
  'function getBatchProductCount(uint256 batchId) view returns (uint256)',
  'function getVersion() pure returns (string)',
  
  // 事件
  'event ProductRegistered(string indexed productId, string internalCode, string productName, address indexed registrant, uint256 timestamp)',
  'event TraceabilityAdded(string indexed productId, string action, string location, uint256 timestamp)',
  'event ProductVerified(string indexed productId, bool isValid, address indexed verifier, uint256 timestamp)',
];

export class ProductContract {
  private provider: BrowserProvider | ethers.Provider;
  private contract: Contract;
  private signer: ethers.Signer | null = null;
  private contractAddress: string;

  constructor() {
    const config = blockchainConfig.development;
    this.contractAddress = contractAddresses.productAuth;
    
    // 创建 provider
    this.provider = new ethers.BrowserProvider(window.ethereum);
    
    // 创建合约实例
    this.contract = new Contract(
      this.contractAddress,
      PRODUCT_AUTH_ABI,
      this.provider
    );
  }

  /**
   * 初始化并连接钱包
   */
  async connect(): Promise<boolean> {
    try {
      this.signer = await this.provider.getSigner();
      this.contract = this.contract.connect(this.signer);
      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  }

  /**
   * 获取区块链连接状态
   */
  async getStatus(): Promise<BlockchainStatus> {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      
      return {
        isConnected: true,
        chainId: Number(network.chainId),
        blockNumber,
        networkName: network.name || 'Unknown',
        contractAddress: this.contractAddress,
      };
    } catch (error) {
      console.error('Failed to get blockchain status:', error);
      return {
        isConnected: false,
        chainId: 0,
        blockNumber: 0,
        networkName: 'Unknown',
        contractAddress: this.contractAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 注册单个产品
   */
  async registerProduct(params: RegisterProductParams): Promise<RegistrationResult> {
    if (!this.signer) {
      await this.connect();
    }

    try {
      const tx = await this.contract.registerProduct(
        params.productId,
        params.internalCode,
        params.productName,
        params.productModel,
        params.category,
        params.batchId
      );

      const receipt = await tx.wait();

      return {
        success: true,
        productId: params.productId,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('Failed to register product:', error);
      return {
        success: false,
        productId: params.productId,
        transactionHash: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 批量注册产品
   */
  async batchRegisterProducts(params: BatchRegisterParams): Promise<RegistrationResult[]> {
    if (!this.signer) {
      await this.connect();
    }

    try {
      const tx = await this.contract.batchRegisterProducts(
        params.productIds,
        params.internalCodes,
        params.productNames,
        params.productModels,
        params.categories,
        params.batchId
      );

      const receipt = await tx.wait();

      return params.productIds.map((productId) => ({
        success: true,
        productId,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      }));
    } catch (error) {
      console.error('Failed to batch register products:', error);
      return params.productIds.map((productId) => ({
        success: false,
        productId,
        transactionHash: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }

  /**
   * 验证产品真伪
   */
  async verifyProduct(productId: string): Promise<VerificationResult> {
    try {
      const [isValid, productInfo] = await this.contract.verifyProduct(productId);

      return {
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
        message: isValid ? 'Product is authentic' : 'Product not found or not registered',
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Failed to verify product:', error);
      return {
        isValid: false,
        product: null,
        message: error instanceof Error ? error.message : 'Verification failed',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 检查产品是否已注册（简化版）
   */
  async isProductRegistered(productId: string): Promise<boolean> {
    try {
      return await this.contract.isProductRegistered(productId);
    } catch (error) {
      console.error('Failed to check product registration:', error);
      return false;
    }
  }

  /**
   * 添加溯源记录
   */
  async addTraceabilityRecord(params: AddTraceabilityParams): Promise<TransactionResult> {
    if (!this.signer) {
      await this.connect();
    }

    try {
      const tx = await this.contract.addTraceabilityRecord(
        params.productId,
        params.action,
        params.description,
        params.location,
        params.operator,
        params.extraData || ''
      );

      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('Failed to add traceability record:', error);
      return {
        success: false,
        transactionHash: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 批量添加溯源记录
   */
  async batchAddTraceability(params: BatchTraceabilityParams): Promise<TransactionResult> {
    if (!this.signer) {
      await this.connect();
    }

    try {
      const tx = await this.contract.batchAddTraceability(
        params.productIds,
        params.actions,
        params.descriptions,
        params.locations,
        params.operators
      );

      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('Failed to batch add traceability:', error);
      return {
        success: false,
        transactionHash: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 获取溯源历史记录
   */
  async getTraceabilityHistory(
    productId: string,
    startIndex: number = 0,
    limit: number = 10
  ): Promise<TraceabilityRecord[]> {
    try {
      const records = await this.contract.getTraceabilityHistory(productId, startIndex, limit);

      return records.map((record: any[]) => ({
        productId: record[0],
        action: record[1],
        description: record[2],
        location: record[3],
        operator: record[4],
        timestamp: Number(record[5]),
        extraData: record[6],
      }));
    } catch (error) {
      console.error('Failed to get traceability history:', error);
      return [];
    }
  }

  /**
   * 获取溯源记录数量
   */
  async getTraceabilityCount(productId: string): Promise<number> {
    try {
      return await this.contract.getTraceabilityCount(productId);
    } catch (error) {
      console.error('Failed to get traceability count:', error);
      return 0;
    }
  }

  /**
   * 获取产品信息
   */
  async getProductInfo(productId: string): Promise<Product | null> {
    try {
      const info = await this.contract.getProductInfo(productId);

      return {
        productId: info[0],
        internalCode: info[1],
        productName: info[2],
        productModel: info[3],
        category: info[4],
        createdAt: Number(info[5]),
        batchId: Number(info[6]),
        isRegistered: info[7],
        registrant: info[8],
      };
    } catch (error) {
      console.error('Failed to get product info:', error);
      return null;
    }
  }

  /**
   * 获取批次产品数量
   */
  async getBatchProductCount(batchId: number): Promise<number> {
    try {
      return await this.contract.getBatchProductCount(batchId);
    } catch (error) {
      console.error('Failed to get batch product count:', error);
      return 0;
    }
  }

  /**
   * 获取合约版本
   */
  async getVersion(): Promise<string> {
    try {
      return await this.contract.getVersion();
    } catch (error) {
      console.error('Failed to get contract version:', error);
      return 'Unknown';
    }
  }
}

// 导出单例
export const productContract = new ProductContract();
