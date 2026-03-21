/**
 * 多类型用户管理 API 服务
 */

import { supabase } from '@/lib/supabase';
import type {
  AnyUser,
  EnterpriseUser,
  IndividualUser,
  RepairShopUser,
  UserFilters,
  UserStats,
  UserStatus,
  VerificationStatus,
} from '@/types/user-types';

export class UserManagementService {
  // ============================================================================
  // 获取用户列表（支持筛选和分页）
  // ============================================================================

  /**
   * 获取用户列表
   */
  static async getUsers(
    filters: UserFilters = {},
    page = 1,
    pageSize = 20
  ): Promise<{ users: AnyUser[]; total: number }> {
    try {
      let query = supabase
        .from('user_accounts')
        .select('*', { count: 'exact' });

      // 应用筛选条件
      if (filters.user_type) {
        query = query.eq('user_type', filters.user_type);
      }

      if (filters.account_type) {
        query = query.eq('account_type', filters.account_type);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.verification_status) {
        query = query.eq('verification_status', filters.verification_status);
      }

      if (filters.search) {
        query = query.or(
          `email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
        );
      }

      // 分页
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      query = query.range(start, end).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        users: data as AnyUser[],
        total: count || 0,
      };
    } catch (error) {
      console.error('获取用户列表失败:', error);
      throw error;
    }
  }

  // ============================================================================
  // 获取特定类型的用户详情
  // ============================================================================

  /**
   * 获取个人用户详情
   */
  static async getIndividualUser(
    userId: string
  ): Promise<IndividualUser | null> {
    try {
      const { data, error } = await supabase
        .from('individual_users')
        .select(
          `
          *,
          user_accounts (
            id,
            user_id,
            email,
            phone,
            avatar_url,
            status,
            is_verified,
            verification_status,
            subscription_plan,
            created_at,
            updated_at
          )
        `
        )
        .eq('user_account_id', userId)
        .single();

      if (error) throw error;

      if (!data) return null;

      return {
        ...data.user_accounts,
        user_type: 'individual',
        account_type: 'individual',
        ...data,
      } as IndividualUser;
    } catch (error) {
      console.error('获取个人用户详情失败:', error);
      throw error;
    }
  }

  /**
   * 获取维修店用户详情
   */
  static async getRepairShopUser(
    userId: string
  ): Promise<RepairShopUser | null> {
    try {
      const { data, error } = await supabase
        .from('repair_shop_users_detail')
        .select(
          `
          *,
          user_accounts (
            id,
            user_id,
            email,
            phone,
            avatar_url,
            status,
            is_verified,
            verification_status,
            subscription_plan,
            created_at,
            updated_at
          )
        `
        )
        .eq('user_account_id', userId)
        .single();

      if (error) throw error;

      if (!data) return null;

      return {
        ...data.user_accounts,
        user_type: 'repair_shop',
        account_type: 'repair_shop',
        ...data,
      } as RepairShopUser;
    } catch (error) {
      console.error('获取维修店用户详情失败:', error);
      throw error;
    }
  }

  /**
   * 获取企业用户详情
   */
  static async getEnterpriseUser(
    userId: string
  ): Promise<EnterpriseUser | null> {
    try {
      const { data, error } = await supabase
        .from('enterprise_users_detail')
        .select(
          `
          *,
          user_accounts (
            id,
            user_id,
            email,
            phone,
            avatar_url,
            status,
            is_verified,
            verification_status,
            subscription_plan,
            created_at,
            updated_at
          )
        `
        )
        .eq('user_account_id', userId)
        .single();

      if (error) throw error;

      if (!data) return null;

      return {
        ...data.user_accounts,
        user_type: 'enterprise',
        account_type:
          data.business_type === 'foreign_trade'
            ? 'foreign_trade'
            : 'enterprise',
        ...data,
      } as EnterpriseUser;
    } catch (error) {
      console.error('获取企业用户详情失败:', error);
      throw error;
    }
  }

  // ============================================================================
  // 更新用户状态
  // ============================================================================

  /**
   * 更新用户状态
   */
  static async updateUserStatus(
    userId: string,
    status: UserStatus
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_accounts')
        .update({ status })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('更新用户状态失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户认证状态
   */
  static async updateVerificationStatus(
    userId: string,
    verificationStatus: VerificationStatus,
    verifiedBy?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        verification_status: verificationStatus,
        updated_at: new Date().toISOString(),
      };

      if (verificationStatus === 'verified') {
        updateData.is_verified = true;
        updateData.verified_at = new Date().toISOString();
        if (verifiedBy) {
          updateData.verified_by = verifiedBy;
        }
      }

      const { error } = await supabase
        .from('user_accounts')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('更新认证状态失败:', error);
      throw error;
    }
  }

  // ============================================================================
  // 获取用户统计信息
  // ============================================================================

  /**
   * 获取用户统计信息
   */
  static async getUserStats(): Promise<UserStats> {
    try {
      const { data, error } = await supabase
        .from('user_stats_view')
        .select('*')
        .single();

      if (error) throw error;

      return {
        total_users: data.total_users || 0,
        by_type: {
          individual: data.individual_count || 0,
          repair_shop: data.repair_shop_count || 0,
          enterprise: data.enterprise_count || 0,
          foreign_trade: data.foreign_trade_count || 0,
        },
        by_status: {
          pending: data.pending_count || 0,
          active: data.active_count || 0,
          suspended: data.suspended_count || 0,
          closed: data.closed_count || 0,
        },
        by_verification: {
          verified: data.verified_count || 0,
          under_review: data.under_review_count || 0,
          rejected: data.rejected_count || 0,
        },
      } as UserStats;
    } catch (error) {
      console.error('获取用户统计失败:', error);
      throw error;
    }
  }

  // ============================================================================
  // 批量操作
  // ============================================================================

  /**
   * 批量更新用户状态
   */
  static async batchUpdateStatus(
    userIds: string[],
    status: UserStatus
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_accounts')
        .update({ status })
        .in('id', userIds);

      if (error) throw error;
    } catch (error) {
      console.error('批量更新用户状态失败:', error);
      throw error;
    }
  }

  /**
   * 批量删除用户
   */
  static async batchDeleteUsers(userIds: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_accounts')
        .delete()
        .in('id', userIds);

      if (error) throw error;
    } catch (error) {
      console.error('批量删除用户失败:', error);
      throw error;
    }
  }

  // ============================================================================
  // 导出功能
  // ============================================================================

  /**
   * 导出用户数据
   */
  static async exportUsers(
    filters: UserFilters = {},
    format: 'csv' | 'excel' = 'csv'
  ): Promise<Blob> {
    try {
      // 这里调用后端 API 进行导出
      const params = new URLSearchParams({
        format,
        ...filters,
      });

      const response = await fetch(`/api/admin/users/export?${params}`);

      if (!response.ok) {
        throw new Error('导出失败');
      }

      return await response.blob();
    } catch (error) {
      console.error('导出用户数据失败:', error);
      throw error;
    }
  }
}
