/**
 * 区块链相关类型定义
 */

/**
 * 产品信息（对应智能合约 Product 结构）
 */
export interface Product {
  productId: string;
  internalCode: string;
  productName: string;
  productModel: string;
  category: string;
  createdAt: number;
  batchId: number;
  isRegistered: boolean;
  registrant: string;
}

/**
 * 溯源记录（对应智能合约 TraceabilityRecord 结构）
 */
export interface TraceabilityRecord {
  productId: string;
  action: string;
  description: string;
  location: string;
  operator: string;
  timestamp: number;
  extraData: string;
}

/**
 * 验证结果
 */
export interface VerificationResult {
  isValid: boolean;
  product: Product | null;
  message: string;
  timestamp: number;
}

/**
 * 注册结果
 */
export interface RegistrationResult {
  success: boolean;
  productId: string;
  transactionHash: string;
  blockNumber?: number;
  error?: string;
}

/**
 * 批量注册结果
 */
export interface BatchRegistrationResult {
  success: number;
  failed: number;
  total: number;
  results: RegistrationResult[];
}

/**
 * 交易结果
 */
export interface TransactionResult {
  success: boolean;
  transactionHash: string;
  blockNumber?: number;
  error?: string;
}

/**
 * 区块链状态
 */
export interface BlockchainStatus {
  isConnected: boolean;
  chainId: number;
  blockNumber: number;
  networkName: string;
  contractAddress: string;
  error?: string;
}

/**
 * 产品注册参数
 */
export interface RegisterProductParams {
  productId: string;
  internalCode: string;
  productName: string;
  productModel: string;
  category: string;
  batchId: number;
}

/**
 * 批量注册参数
 */
export interface BatchRegisterParams {
  productIds: string[];
  internalCodes: string[];
  productNames: string[];
  productModels: string[];
  categories: string[];
  batchId: number;
}

/**
 * 添加溯源记录参数
 */
export interface AddTraceabilityParams {
  productId: string;
  action: string;
  description: string;
  location: string;
  operator: string;
  extraData?: string;
}

/**
 * 批量添加溯源参数
 */
export interface BatchTraceabilityParams {
  productIds: string[];
  actions: string[];
  descriptions: string[];
  locations: string[];
  operators: string[];
}
