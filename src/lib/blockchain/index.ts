/**
 * 区块链模块导出
 */

export { blockchainConfig, contractAddresses, getNetworkConfig, validateChainId } from './config';
export type {
  Product,
  TraceabilityRecord,
  VerificationResult,
  RegistrationResult,
  BatchRegistrationResult,
  TransactionResult,
  BlockchainStatus,
  RegisterProductParams,
  BatchRegisterParams,
  AddTraceabilityParams,
  BatchTraceabilityParams,
} from './types';
export { ProductContract, productContract } from './ProductContract';
