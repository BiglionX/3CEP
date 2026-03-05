import { supabase, supabaseAdmin } from './supabase';
import type { User } from '@supabase/supabase-js';

// 角色类型定义
export type UserRole =
  | 'admin'
  | 'content_reviewer'
  | 'shop_reviewer'
  | 'finance'
  | 'viewer';

// 管理员用户接口
export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// 权限接口
export interface Permission {
  id: string;
  role: UserRole;
  resource: string;
  action: string;
  description?: string;
  created_at: string;
}

export class AuthService {
  // 获取当前用户信息
  static async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.user || null;
    } catch (error) {
      console.error('获取当前用户失败:', error);
      return null;
    }
  }

  // 获取用户角色
  static async getUserRole(userId: string): Promise<UserRole> {
    try {
      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .select('role')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('获取用户角色失败:', error);
        return 'viewer'; // 默认角色
      }

      return data?.role || 'viewer';
    } catch (error) {
      console.error('获取用户角色异常:', error);
      return 'viewer';
    }
  }

  // 检查用户是否为管理员
  static async isAdminUser(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      return !error && data !== null;
    } catch (error) {
      console.error('检查管理员身份失败:', error);
      return false;
    }
  }

  // 检查权限
  static async checkPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    try {
      // 首先检查是否为管理员
      const isAdmin = await this.isAdminUser(userId);
      if (!isAdmin) {
        return false;
      }

      const userRole = await this.getUserRole(userId);

      // 管理员拥有所有权
      if (userRole === 'admin') return true;

      const { data, error } = await supabase
        .from('permissions')
        .select('resource, action')
        .eq('role', userRole)
        .eq('resource', resource)
        .eq('action', action);

      return !error && data && (data as any)?.data.length > 0;
    } catch (error) {
      console.error('权限检查失败:', error);
      return false;
    }
  }

  // 管理员登录检查
  static async isAdminAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) return false;

    return await this.isAdminUser(user.id);
  }

  // 获取用户完整信息
  static async getAdminUserInfo(userId: string): Promise<AdminUser | null> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('获取管理员信息失?', error);
        return null;
      }

      return data as AdminUser;
    } catch (error) {
      console.error('获取管理员信息异?', error);
      return null;
    }
  }

  // 创建管理员用户（仅限超级管理员）
  static async createAdminUser(userData: {
    email: string;
    role: UserRole;
    user_id?: string;
    created_by?: string;
  }): Promise<AdminUser | null> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('未登录用户无法创建管理员');
      }

      // 检查当前用户是否有权限
      const currentRole = await this.getUserRole(currentUser.id);
      if (currentRole !== 'admin') {
        throw new Error('只有超级管理员可以创建管理员用户');
      }

      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .insert({
          user_id: userData.user_id || null, // 可以先创建记录，后续关联
          email: userData.email,
          role: userData.role,
          created_by: userData.created_by || currentUser.id,
          is_active: true,
        } as any)
        .select()
        .single();

      if (error) {
        console.error('创建管理员用户失?', error);
        return null;
      }

      return data as AdminUser;
    } catch (error) {
      console.error('创建管理员用户异?', error);
      return null;
    }
  }

  // 更新管理员用户状态
  static async updateAdminUserStatus(
    userId: string,
    isActive: boolean
  ): Promise<boolean> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) return false;
  
      const currentRole = await this.getUserRole(currentUser.id);
      if (currentRole !== 'admin') {
        throw new Error('只有超级管理员可以更新用户状态');
      }

      const { error } = await supabaseAdmin
        .from('admin_users')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('更新管理员状态失败:', error);
      return false;
    }
  }

  // 获取所有管理员用户 (仅限管理员)
  static async getAllAdminUsers(): Promise<AdminUser[]> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) return [];

      const currentRole = await this.getUserRole(currentUser.id);
      if (currentRole !== 'admin') {
        throw new Error('只有管理员可以查看用户列表');
      }

      const { data, error } = (await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false })) as any;

      if (error) {
        console.error('获取管理员用户列表失败:', error);
        return [];
      }

      return data as AdminUser[];
    } catch (error) {
      console.error('获取管理员用户列表异常:', error);
      return [];
    }
  }

  // 获取用户权限列表
  static async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const userRole = await this.getUserRole(userId);

      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .eq('role', userRole)
        .order('resource');

      if (error) {
        console.error('获取用户权限失败:', error);
        return [];
      }

      return data as Permission[];
    } catch (error) {
      console.error('获取用户权限异常:', error);
      return [];
    }
  }

  // 用户登出
  static async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('登出失败:', error);
    }
  }

  // 获取角色显示名称
  static getRoleDisplayName(role: UserRole): string {
    const roleNames: Record<UserRole, string> = {
      admin: '超级管理?',
      content_reviewer: '内容审核?',
      shop_reviewer: '店铺审核?',
      finance: '财务人员',
      viewer: '查看?',
    };
    return roleNames[role] || role;
  }

  // 检查是否具有特定角色
  static async hasRole(
    userId: string,
    requiredRole: UserRole
  ): Promise<boolean> {
    const userRole = await this.getUserRole(userId);
    const roleHierarchy: Record<UserRole, number> = {
      admin: 5,
      content_reviewer: 3,
      shop_reviewer: 3,
      finance: 3,
      viewer: 1,
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }
}
