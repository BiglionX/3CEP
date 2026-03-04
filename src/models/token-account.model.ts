// Token账户管理模型定义

export interface TokenAccount {
  id: string;
  userId?: string;
  brandId?: string;
  balance: number;
  totalConsumed: number;
  totalPurchased: number;
  status: 'active' | 'frozen' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface TokenTransaction {
  id: string;
  accountId: string;
  amount: number;
  transactionType: 'purchase' | 'consumption' | 'refund' | 'bonus';
  referenceId?: string;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export interface TokenPackage {
  id: string;
  name: Record<string, string>;
  tokens: number;
  priceUsd: number;
  priceCny: number;
  bonusPercentage: number;
  popular: boolean;
  featured: boolean;
  status: 'active' | 'inactive';
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BillingRule {
  id: string;
  serviceType: 'diagnosis' | 'manual_view' | 'advanced_feature';
  costPerUnit: number;
  unitType: 'per_request' | 'per_minute' | 'per_mb';
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosisSession {
  id: string;
  userId: string;
  deviceId?: string;
  tokenAccountId: string;
  status: 'active' | 'completed' | 'expired';
  tokensConsumed: number;
  startedAt: string;
  endedAt?: string;
  createdAt: string;
}

export interface DiagnosisMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  tokensUsed?: number;
  createdAt: string;
}

// DTO定义
export interface CreateTokenAccountDTO {
  userId?: string;
  brandId?: string;
}

export interface TokenTransactionDTO {
  accountId: string;
  amount: number;
  transactionType: 'purchase' | 'consumption' | 'refund' | 'bonus';
  referenceId?: string;
  description: string;
}

export interface PurchaseTokensDTO {
  userId: string;
  packageId: string;
  paymentMethod: 'stripe' | 'wechat_pay' | 'alipay';
}

export interface ConsumeTokensDTO {
  accountId: string;
  serviceType: string;
  usageAmount: number;
  description: string;
}

// 查询参数
export interface TokenTransactionQuery {
  accountId?: string;
  userId?: string;
  brandId?: string;
  transactionType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface AccountBalanceResponse {
  accountId: string;
  currentBalance: number;
  totalConsumed: number;
  totalPurchased: number;
  recentTransactions: TokenTransaction[];
}
