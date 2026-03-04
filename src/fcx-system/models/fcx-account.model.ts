/**
 * FCX账户系统数据模型定义
 * 定义FCX积分账户的核心数据结构和类型
 */

import { AccountType } from '@/lib/database.types';

// FCX账户状态枚?export enum FcxAccountStatus {
  ACTIVE = 'active',
  FROZEN = 'frozen',
  CLOSED = 'closed',
}

// FCX交易类型枚举
export enum FcxTransactionType {
  PURCHASE = 'purchase', // 购买FCX
  REWARD = 'reward', // 奖励发放
  SETTLEMENT = 'settlement', // 工单结算
  FREEZE = 'freeze', // 资金冻结
  UNFREEZE = 'unfreeze', // 资金解冻
  STAKE = 'stake', // 质押
  UNSTAKE = 'unstake', // 解除质押
}

// FCX交易状态枚?export enum FcxTransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// FCX2期权状态枚?export enum Fcx2OptionStatus {
  ACTIVE = 'active',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
}

// FCX账户基础接口
export interface FcxAccount {
  id: string;
  userId: string;
  balance: number; // 可用余额
  frozenBalance: number; // 冻结余额
  accountType: AccountType;
  status: FcxAccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

// FCX交易记录接口
export interface FcxTransaction {
  id: string;
  fromAccountId: string | null;
  toAccountId: string | null;
  amount: number;
  transactionType: FcxTransactionType;
  referenceId: string | null; // 关联的业务ID
  memo: string | null;
  status: FcxTransactionStatus;
  createdAt: Date;
}

// FCX2期权记录接口
export interface Fcx2Option {
  id: string;
  repairShopId: string;
  amount: number;
  earnedFromOrderId: string | null;
  status: Fcx2OptionStatus;
  createdAt: Date;
  expiresAt: Date;
}

// 维修工单接口
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

export interface RepairOrder {
  id: string;
  orderNumber: string; // 工单编号
  consumerId: string | null;
  repairShopId: string | null;
  deviceInfo: Record<string, any> | null;
  faultDescription: string | null;
  fcxAmountLocked: number | null; // 锁定的FCX金额
  status: OrderStatus;
  rating: number | null; // 消费者评?(0.0-5.0)
  factoryId: string | null; // 关联的工厂账?  createdAt: Date;
  confirmedAt: Date | null;
  completedAt: Date | null;
}

// 联盟等级枚举
export enum AllianceLevel {
  BRONZE = 'bronze', // 青铜?(< 1000 FCX2)
  SILVER = 'silver', // 白银?(1000-5000 FCX2)
  GOLD = 'gold', // 黄金?(5000-20000 FCX2)
  DIAMOND = 'diamond', // 钻石?(> 20000 FCX2)
}

// 扩展的维修店铺接?export interface ExtendedRepairShop {
  id: string;
  name: string;
  slug: string;
  contactPerson: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  businessLicense: string | null;
  services: string[] | null;
  specialties: string[] | null;
  rating: number | null;
  reviewCount: number | null;
  serviceCount: number | null;
  certificationLevel: number | null;
  isVerified: boolean | null;
  status: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  // FCX系统扩展字段
  fcxStaked: number | null; // 质押的FCX数量
  fcx2Balance: number | null; // 累计的FCX2期权余额
  allianceLevel: AllianceLevel | null; // 联盟等级
  joinDate: Date | null; // 加入联盟日期
  isAllianceMember: boolean | null; // 是否为联盟成?  userId: string | null; // 关联的用户ID
}

// 创建FCX账户的请求DTO
export interface CreateFcxAccountDTO {
  userId: string;
  accountType: AccountType;
  initialBalance?: number;
}

// FCX转账请求DTO
export interface FcxTransferDTO {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  transactionType: FcxTransactionType;
  referenceId?: string;
  memo?: string;
}

// FCX购买请求DTO
export interface PurchaseFcxDTO {
  userId: string;
  amountUSD: number; // 美元金额
  paymentMethod: string; // 支付方式
}

// 质押FCX请求DTO
export interface StakeFcxDTO {
  accountId: string;
  amount: number;
  shopId: string;
}

// 工单创建请求DTO
export interface CreateRepairOrderDTO {
  consumerId: string;
  repairShopId: string;
  deviceInfo: Record<string, any>;
  faultDescription: string;
  fcxAmount: number;
  factoryId: string;
}

// 工单完成请求DTO
export interface CompleteRepairOrderDTO {
  orderId: string;
  rating: number; // 评分 0.0-5.0
  completionNotes?: string;
}

// FCX2奖励计算结果
export interface Fcx2RewardResult {
  baseReward: number; // 基础奖励
  ratingMultiplier: number; // 评分倍数
  totalReward: number; // 总奖?  levelBonus: number; // 等级加成
  finalAmount: number; // 最终发放数?}

// 账户余额查询结果
export interface AccountBalance {
  accountId: string;
  availableBalance: number;
  frozenBalance: number;
  totalBalance: number;
  accountType: AccountType;
}

// 交易历史查询参数
export interface TransactionQueryParams {
  accountId?: string;
  transactionType?: FcxTransactionType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// 维修店排名信?export interface ShopRankingInfo {
  shopId: string;
  shopName: string;
  allianceLevel: AllianceLevel;
  fcx2Balance: number;
  rating: number;
  completedOrders: number;
  rank: number;
}

// 系统统计信息
export interface FcxSystemStats {
  totalAccounts: number;
  totalTransactions: number;
  totalFcxInCirculation: number;
  activeRepairShops: number;
  totalRepairOrders: number;
  averageOrderRating: number;
  fcx2Distribution: Record<AllianceLevel, number>;
}
