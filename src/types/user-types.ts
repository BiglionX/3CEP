/**
 * 多类型用户管理 - 类型定义
 */

// ============================================================================
// 用户实体类型
// ============================================================================

/** C 端个人用户 */
export type IndividualUserType = 'individual';

/** 维修店类型 */
export type RepairShopType =
  | 'authorized_dealer' // 授权经销商
  | 'independent' // 独立维修店
  | 'franchise' // 加盟店
  | 'mobile_service'; // 上门服务

/** 贸易公司/企业类型 */
export type BusinessType =
  | 'manufacturer' // 制造商/工厂
  | 'supplier' // 供应商
  | 'distributor' // 分销商
  | 'retailer' // 零售商
  | 'foreign_trade' // 外贸公司
  | 'government'; // 政府机构

/** 企业用户类型 */
export type EnterpriseUserType =
  | 'enterprise' // 一般企业
  | 'repair_shop' // 维修店
  | 'foreign_trade_company'; // 外贸公司

/** 统一的用户类型 */
export type UserType =
  | IndividualUserType
  | RepairShopType
  | BusinessType
  | EnterpriseUserType;

// ============================================================================
// 用户账户类型（与数据库保持一致）
// ============================================================================

export type AccountType =
  | 'individual' // 个人用户
  | 'repair_shop' // 维修店
  | 'factory' // 工厂
  | 'supplier' // 供应商
  | 'enterprise' // 企业
  | 'foreign_trade'; // 外贸公司

// ============================================================================
// 用户状态
// ============================================================================

export type UserStatus =
  | 'pending' // 待审核
  | 'active' // 活跃
  | 'suspended' // 已暂停
  | 'closed' // 已关闭
  | 'rejected'; // 已拒绝

// ============================================================================
// 订阅计划类型
// ============================================================================

export type SubscriptionPlan =
  | 'free' // 免费版
  | 'basic' // 基础版
  | 'professional' // 专业版
  | 'enterprise'; // 企业版

// ============================================================================
// 认证状态
// ============================================================================

export type VerificationStatus =
  | 'pending' // 待审核
  | 'under_review' // 审核中
  | 'verified' // 已认证
  | 'rejected'; // 已拒绝

// ============================================================================
// 用户角色（系统级别）
// ============================================================================

export type UserRole =
  | 'admin' // 超级管理员
  | 'manager' // 管理员
  | 'content_manager' // 内容管理员
  | 'shop_manager' // 店铺管理员
  | 'finance_manager' // 财务管理员
  | 'procurement_specialist' // 采购专员
  | 'warehouse_operator' // 仓库操作员
  | 'agent_operator' // 智能体操作员
  | 'viewer'; // 查看者

// ============================================================================
// 用户基础接口
// ============================================================================

export interface BaseUser {
  id: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// C 端个人用户
// ============================================================================

export interface IndividualUser extends BaseUser {
  user_type: 'individual';
  account_type: 'individual';

  // 个人信息
  first_name?: string | null;
  last_name?: string | null;
  nickname?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  birthday?: string | null;

  // 地址信息
  address?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  postal_code?: string | null;

  // 会员信息
  membership_level?: number;
  membership_points?: number;
}

// ============================================================================
// 维修店用户
// ============================================================================

export interface RepairShopUser extends BaseUser {
  user_type: 'repair_shop';
  account_type: 'repair_shop';

  // 店铺信息
  shop_name: string;
  shop_type: RepairShopType;
  registration_number?: string | null;
  tax_id?: string | null;

  // 订阅信息
  subscription_plan: SubscriptionPlan;
  subscription_start_at?: string | null;
  subscription_end_at?: string | null;

  // 店铺详情
  shop_description?: string | null;
  specialties?: string[] | null;
  services?: string[] | null;

  // 联系信息
  contact_email?: string | null;
  contact_phone?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  postal_code?: string | null;

  // 认证信息
  logo_url?: string | null;
  cover_image_url?: string | null;
  business_license_url?: string | null;
  qualification_cert_url?: string | null;
  is_verified: boolean;
  verification_status: VerificationStatus;
  certification_level?: number;
}

// ============================================================================
// 企业用户（包含贸易公司、工厂、供应商等）
// ============================================================================

export interface EnterpriseUser extends BaseUser {
  user_type: 'enterprise';
  account_type: AccountType;

  // 企业信息
  company_name: string;
  business_type: BusinessType;
  registration_number?: string | null;
  tax_id?: string | null;
  company_license?: string | null;

  // 订阅信息
  subscription_plan: SubscriptionPlan;
  subscription_start_at?: string | null;
  subscription_end_at?: string | null;

  // 企业详情
  company_description?: string | null;
  industry?: string | null;
  employee_count?: string | null;
  annual_revenue?: string | null;

  // 业务信息
  procurement_categories?: string[] | null;
  main_products?: string[] | null;
  target_markets?: string[] | null;

  // 联系信息
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_person?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  postal_code?: string | null;

  // 认证信息
  logo_url?: string | null;
  cover_image_url?: string | null;
  business_license_url?: string | null;
  is_verified: boolean;
  verification_status: VerificationStatus;
}

// ============================================================================
// 联合类型
// ============================================================================

export type AnyUser = IndividualUser | RepairShopUser | EnterpriseUser;

// ============================================================================
// 用户筛选和查询
// ============================================================================

export interface UserFilters {
  user_type?: UserType;
  account_type?: AccountType;
  status?: UserStatus;
  verification_status?: VerificationStatus;
  subscription_plan?: SubscriptionPlan;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface UserStats {
  total_users: number;
  by_type: {
    individual: number;
    repair_shop: number;
    enterprise: number;
    foreign_trade: number;
  };
  by_status: {
    pending: number;
    active: number;
    suspended: number;
    closed: number;
  };
  by_verification: {
    verified: number;
    under_review: number;
    rejected: number;
  };
}
