/**
 * FCX系统服务接口定义
 * 定义各个核心服务的接口规范
 */

import {
  AccountBalance,
  AllianceLevel,
  CompleteRepairOrderDTO,
  CreateFcxAccountDTO,
  CreateRepairOrderDTO,
  ExtendedRepairShop,
  Fcx2Option,
  Fcx2RewardResult,
  FcxAccount,
  FcxAccountStatus,
  FcxSystemStats,
  FcxTransaction,
  FcxTransactionType,
  FcxTransferDTO,
  OrderStatus,
  PurchaseFcxDTO,
  RepairOrder,
  ShopRankingInfo,
  TransactionQueryParams,
} from '../models/fcx-account.model';

// FCX账户服务接口
export interface IFcxAccountService {
  /**
   * 创建FCX账户
   */
  createAccount(dto: CreateFcxAccountDTO): Promise<FcxAccount>;

  /**
   * 获取账户信息
   */
  getAccount(accountId: string): Promise<FcxAccount | null>;

  /**
   * 根据用户ID获取账户
   */
  getAccountByUserId(userId: string): Promise<FcxAccount | null>;

  /**
   * 查询账户余额
   */
  getBalance(accountId: string): Promise<AccountBalance>;

  /**
   * FCX转账
   */
  transfer(dto: FcxTransferDTO): Promise<FcxTransaction>;

  /**
   * 冻结资金
   */
  freeze(accountId: string, amount: number): Promise<void>;

  /**
   * 解冻资金
   */
  unfreeze(accountId: string, amount: number): Promise<void>;

  /**
   * 更新账户状态
   */
  updateAccountStatus(
    accountId: string,
    status: FcxAccountStatus
  ): Promise<void>;

  /**
   * 获取账户交易历史
   */
  getTransactionHistory(
    params: TransactionQueryParams
  ): Promise<FcxTransaction[]>;
}

// FCX交易服务接口
export interface IFcxTransactionService {
  /**
   * 创建交易记录
   */
  createTransaction(dto: FcxTransferDTO): Promise<FcxTransaction>;

  /**
   * 获取交易详情
   */
  getTransaction(transactionId: string): Promise<FcxTransaction | null>;

  /**
   * 查询交易列表
   */
  listTransactions(params: TransactionQueryParams): Promise<FcxTransaction[]>;

  /**
   * 验证交易合法性
   */
  validateTransaction(dto: FcxTransferDTO): Promise<boolean>;
}

// FCX2期权服务接口
export interface IFcx2OptionService {
  /**
   * 发放FCX2期权奖励
   */
  grantOption(
    shopId: string,
    amount: number,
    orderId?: string
  ): Promise<Fcx2Option>;

  /**
   * 获取店铺的FCX2期权余额
   */
  getShopFcx2Balance(shopId: string): Promise<number>;

  /**
   * 兑换FCX2期权
   */
  redeemOptions(shopId: string, amount: number): Promise<void>;

  /**
   * 查询店铺期权记录
   */
  listShopOptions(shopId: string): Promise<Fcx2Option[]>;

  /**
   * 清理过期期权
   */
  cleanupExpiredOptions(): Promise<number>;
}

// 维修工单服务接口
export interface IRepairOrderService {
  /**
   * 创建维修工单
   */
  createOrder(dto: CreateRepairOrderDTO): Promise<RepairOrder>;

  /**
   * 获取工单详情
   */
  getOrder(orderId: string): Promise<RepairOrder | null>;

  /**
   * 确认工单
   */
  confirmOrder(orderId: string, shopId: string): Promise<RepairOrder>;

  /**
   * 完成工单并结算
   */
  completeOrder(dto: CompleteRepairOrderDTO): Promise<RepairOrder>;

  /**
   * 取消工单
   */
  cancelOrder(orderId: string, reason: string): Promise<RepairOrder>;

  /**
   * 查询工单列表
   */
  listOrders(filters: {
    consumerId?: string;
    shopId?: string;
    status?: OrderStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<RepairOrder[]>;

  /**
   * 生成唯一工单编号
   */
  generateOrderNumber(): Promise<string>;

  /**
   * 记录配件更换事件
   */
  recordPartReplacement(
    order: RepairOrder,
    partInfo: {
      partId: string;
      partName: string;
      partType: string;
      oldPartSerial?: string;
      newPartSerial?: string;
      cost?: number;
    },
    userId?: string
  ): Promise<void>;
}

// 联盟管理服务接口
export interface IAllianceService {
  /**
   * 维修店加入联盟
   */
  joinAlliance(
    shopId: string,
    stakingAmount: number
  ): Promise<ExtendedRepairShop>;

  /**
   * 维修店退出联盟
   */
  leaveAlliance(shopId: string): Promise<ExtendedRepairShop>;

  /**
   * 更新联盟等级
   */
  updateAllianceLevel(shopId: string): Promise<AllianceLevel>;

  /**
   * 获取联盟成员列表
   */
  listAllianceMembers(level?: AllianceLevel): Promise<ExtendedRepairShop[]>;

  /**
   * 获取联盟排行榜
   */
  getRankings(limit?: number): Promise<ShopRankingInfo[]>;

  /**
   * 验证店铺联盟资格
   */
  validateAllianceQualification(shopId: string): Promise<boolean>;
}

// FCX2奖励计算服务接口
export interface IFcx2RewardService {
  /**
   * 计算工单完成奖励
   */
  calculateOrderReward(
    order: RepairOrder,
    rating: number
  ): Promise<Fcx2RewardResult>;

  /**
   * 计算等级加成
   */
  calculateLevelBonus(
    currentLevel: AllianceLevel,
    baseAmount: number
  ): Promise<number>;

  /**
   * 获取评分倍数
   */
  getRatingMultiplier(rating: number): number;

  /**
   * 验证奖励发放条件
   */
  validateRewardConditions(
    order: RepairOrder,
    rating: number
  ): Promise<boolean>;
}

// 系统统计服务接口
export interface ISystemStatsService {
  /**
   * 获取FCX系统统计数据
   */
  getSystemStats(): Promise<FcxSystemStats>;

  /**
   * 获取账户统计
   */
  getAccountStats(): Promise<{
    totalAccounts: number;
    activeAccounts: number;
    accountTypeDistribution: Record<string, number>;
  }>;

  /**
   * 获取交易统计
   */
  getTransactionStats(period?: 'day' | 'week' | 'month'): Promise<{
    totalTransactions: number;
    transactionVolume: number;
    transactionTypeDistribution: Record<FcxTransactionType, number>;
  }>;

  /**
   * 获取工单统计
   */
  getOrderStats(): Promise<{
    totalOrders: number;
    completedOrders: number;
    averageCompletionTime: number;
    ratingDistribution: Record<string, number>;
  }>;
}

// 支付集成服务接口
export interface IPaymentService {
  /**
   * 处理FCX购买支付
   */
  processFcxPurchase(dto: PurchaseFcxDTO): Promise<{
    success: boolean;
    transactionId?: string;
    fcxAmount: number;
    errorMessage?: string;
  }>;

  /**
   * 验证支付结果
   */
  verifyPayment(paymentId: string): Promise<boolean>;

  /**
   * 退款处理
   */
  processRefund(transactionId: string, amount: number): Promise<boolean>;
}

// 风控服务接口
export interface IRiskControlService {
  /**
   * 检测异常交易
   */
  detectSuspiciousTransactions(accountId: string): Promise<boolean>;

  /**
   * 验证账户风险等级
   */
  assessAccountRisk(accountId: string): Promise<'low' | 'medium' | 'high'>;

  /**
   * 冻结高风险账户
   */
  freezeHighRiskAccount(accountId: string, reason: string): Promise<void>;

  /**
   * 反欺诈检测
   */
  fraudDetection(transaction: FcxTransferDTO): Promise<{
    isFraud: boolean;
    riskScore: number;
    reasons: string[];
  }>;
}
