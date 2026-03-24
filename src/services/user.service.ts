/**
 * 用户服务示例 - 展示如何集成数据权限过滤器
 *
 * @file src/services/user.service.ts
 */

import { UserInfo } from '@/modules/common/permissions/core/api-interceptor';
import {
  DataPermissionFilter,
  QueryFilters,
} from '@/modules/common/permissions/core/data-permission.filter';
import { createClient } from '@supabase/supabase-js';

/**
 * 用户查询参数接口
 */
export interface UserQueryFilters extends QueryFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'suspended';
  role?: string;
}

/**
 * 用户服务类
 */
export class UserService {
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * 获取用户列表（带数据权限过滤）
   */
  async getUsers(
    filters: UserQueryFilters = {},
    user: UserInfo
  ): Promise<{
    data: any[];
    count: number;
    error: any;
  }> {
    // 应用数据权限过滤
    const filteredFilters = DataPermissionFilter.applyDataScope(
      filters,
      user,
      'users'
    );

    // 构建基础查询
    let query = this.supabase
      .from('users')
      .select('*', { count: 'exact', head: false });

    // 应用租户隔离（自动添加 tenant_id 过滤）
    if (filteredFilters.tenant_id) {
      query = query.eq('tenant_id', filteredFilters.tenant_id);
    }

    // 应用搜索条件
    if (filters.search) {
      query = query.or(
        `email.ilike.%${filters.search}%,name.ilike.%${filters.search}%`
      );
    }

    // 应用状态过滤
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // 应用角色过滤
    if (filters.role) {
      query = query.contains('roles', [filters.role]);
    }

    try {
      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        data: data || [],
        count: count || 0,
        error: null,
      };
    } catch (error) {
      console.error('获取用户列表失败:', error);
      return {
        data: [],
        count: 0,
        error,
      };
    }
  }

  /**
   * 获取单个用户（带权限验证）
   */
  async getUserById(
    userId: string,
    currentUser: UserInfo
  ): Promise<{
    data: any;
    error: any;
  }> {
    try {
      // 如果是超级管理员，直接查询
      if (currentUser.roles?.includes('admin')) {
        const { data, error } = await this.supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        return { data, error: null };
      }

      // 普通用户需要验证权限
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('tenant_id', currentUser.tenantId)
        .single();

      if (error) throw error;

      // 验证是否是本人或下属
      if (
        data.id !== currentUser.id &&
        !this.isSubordinate(data, currentUser)
      ) {
        return {
          data: null,
          error: new Error('无权访问此用户信息'),
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('获取用户详情失败:', error);
      return {
        data: null,
        error,
      };
    }
  }

  /**
   * 创建用户（自动注入租户 ID）
   */
  async createUser(
    userData: Partial<any>,
    creator: UserInfo
  ): Promise<{
    data: any;
    error: any;
  }> {
    try {
      // 注入租户 ID 和创建者信息
      const userWithMetadata = {
        ...userData,
        tenant_id: creator.tenantId,
        created_by: creator.id,
      };

      const { data, error } = await this.supabase
        .from('users')
        .insert(userWithMetadata)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('创建用户失败:', error);
      return {
        data: null,
        error,
      };
    }
  }

  /**
   * 更新用户（带权限验证）
   */
  async updateUser(
    userId: string,
    updates: Partial<any>,
    updater: UserInfo
  ): Promise<{
    data: any;
    error: any;
  }> {
    try {
      // 检查是否有更新权限
      const hasPermission = await this.hasUpdatePermission(userId, updater);

      if (!hasPermission) {
        return {
          data: null,
          error: new Error('无权修改此用户信息'),
        };
      }

      const { data, error } = await this.supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('更新用户失败:', error);
      return {
        data: null,
        error,
      };
    }
  }

  /**
   * 删除用户（带权限验证）
   */
  async deleteUser(
    userId: string,
    deleter: UserInfo
  ): Promise<{
    success: boolean;
    error: any;
  }> {
    try {
      // 只有管理员可以删除用户
      if (!deleter.roles?.includes('admin')) {
        return {
          success: false,
          error: new Error('只有管理员可以删除用户'),
        };
      }

      const { error } = await this.supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('删除用户失败:', error);
      return {
        success: false,
        error,
      };
    }
  }

  /**
   * 检查是否有更新权限
   */
  private async hasUpdatePermission(
    userId: string,
    user: UserInfo
  ): Promise<boolean> {
    // 管理员可以更新任何用户
    if (user.roles?.includes('admin')) {
      return true;
    }

    // 用户只能更新自己的信息
    if (userId === user.id) {
      return true;
    }

    // 经理可以更新本部门用户
    if (user.roles?.includes('manager') && user.departmentId) {
      const { data } = await this.supabase
        .from('users')
        .select('department_id')
        .eq('id', userId)
        .single();

      return data?.department_id === user.departmentId;
    }

    return false;
  }

  /**
   * 判断是否是下属
   */
  private isSubordinate(userData: any, manager: UserInfo): boolean {
    // 如果有部门 ID，检查是否在同一部门
    if (userData.department_id && manager.departmentId) {
      return userData.department_id === manager.departmentId;
    }

    // 如果有租户 ID，检查是否在同一租户
    if (userData.tenant_id && manager.tenantId) {
      return userData.tenant_id === manager.tenantId;
    }

    return false;
  }
}
