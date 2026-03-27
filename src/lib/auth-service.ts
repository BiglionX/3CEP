import type { User } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from './supabase';

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
      console.log('[AuthService] getCurrentUser 开始执行');

      // 首先尝试从 cookie 获取会话
      if (typeof window === 'undefined') {
        // 服务器端
        const { cookies } = await import('next/headers');
        const cookieStore = cookies();

        // 获取 cookie 中的会话信息
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const projectName = supabaseUrl.split('//')[1].split('.')[0];
        const cookieName = `sb-${projectName}-auth-token`;

        console.log('[AuthService] Cookie 名称:', cookieName);
        const sessionCookie = cookieStore.get(cookieName);
        console.log('[AuthService] Cookie 是否存在:', !!sessionCookie);
        console.log(
          '[AuthService] Cookie value:',
          sessionCookie?.value
            ? `${sessionCookie.value.substring(0, 50)}...`
            : 'null'
        );

        if (sessionCookie?.value) {
          try {
            const sessionData = JSON.parse(
              decodeURIComponent(sessionCookie.value)
            );
            console.log('[AuthService] Session data:', {
              hasToken: !!sessionData.access_token,
            });

            if (sessionData.access_token) {
              const { data, error } = await supabaseAdmin.auth.getUser(
                sessionData.access_token
              );
              console.log('[AuthService] Supabase getUser result:', {
                hasUser: !!data.user,
                error: error?.message,
              });

              if (!error && data.user) {
                console.log('[AuthService] ✅ 返回用户:', data.user.email);
                return data.user;
              }
            }
          } catch (parseError) {
            console.log('[AuthService] Cookie 解析失败:', parseError);
          }
        }
      }

      // 备用方案：使用默认 getSession
      console.log('[AuthService] 尝试使用 getSession 作为备用方案');
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log('[AuthService] getSession result:', {
        hasSession: !!session,
      });

      return session?.user || null;
    } catch (error) {
      console.error('[AuthService] 获取当前用户失败:', error);
      return null;
    }
  }

  // 从 Authorization header 获取当前用户（供 API 路由使用）
  static async getCurrentUserFromHeader(
    authHeader: string | null
  ): Promise<User | null> {
    try {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
      }

      const token = authHeader.replace('Bearer ', '');
      console.log('[AuthService] 从 Header 获取到 Bearer token');

      const { data, error } = await supabaseAdmin.auth.getUser(token);
      console.log('[AuthService] Header Token 验证结果:', {
        hasUser: !!data.user,
        error: error?.message,
      });

      if (!error && data.user) {
        console.log('[AuthService] ✅ Header Token 验证成功:', data.user.email);
        return data.user;
      }

      return null;
    } catch (error) {
      console.error('[AuthService] Header Token 验证失败:', error);
      return null;
    }
  }

  // 获取用户角色
  static async getUserRole(userId: string): Promise<UserRole> {
    try {
      // 优先检查临时管理员权限（强制覆盖）
      if (typeof window !== 'undefined') {
        const tempAdmin = localStorage.getItem('temp-admin-access');
        const isAdmin = localStorage.getItem('is-admin');
        const userRole = localStorage.getItem('user-role');

        if (
          tempAdmin === 'true' ||
          isAdmin === 'true' ||
          userRole === 'admin'
        ) {
          return 'admin';
        }
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('获取用户角色失败:', error);
        return 'viewer'; // 默认角色
      }

      return (data as any)?.role || 'viewer';
    } catch (error) {
      console.error('获取用户角色异常:', error);
      return 'viewer';
    }
  }

  // 检查用户是否为管理员
  static async isAdminUser(userId: string): Promise<boolean> {
    try {
      // 注意：在浏览器端只能使用 supabase（匿名密钥）
      // 如果在服务器端，可以使用 supabaseAdmin
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      // 即使有错误（401等），也返回 false，不阻塞登录
      if (error) {
        console.warn('检查管理员权限返回错误，视为非管理员:', error.message);
        return false;
      }
      return data !== null;
    } catch (error: any) {
      console.warn(
        '检查管理员身份异常，视为非管理员:',
        error?.message || error
      );
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

      // 管理员拥有所有权限
      if (userRole === 'admin') return true;

      const { data, error } = await supabase
        .from('permissions')
        .select('resource, action')
        .eq('role', userRole)
        .eq('resource', resource)
        .eq('action', action);

      return !error && data && (data as any)?.data.length > 0;
    } catch (error) {
      console.error('权限检查失败', error);
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
        console.error('获取管理员信息失败', error);
        return null;
      }

      return data as unknown as AdminUser;
    } catch (error) {
      console.error('获取管理员信息异常', error);
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
        console.error('创建管理员用户失败', error);
        return null;
      }

      return data as unknown as AdminUser;
    } catch (error) {
      console.error('创建管理员用户异常', error);
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

      // 使用 any 类型绕过类型检查问题
      const { error } = await (supabaseAdmin.from('admin_users') as any)
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('更新管理员状态失败', error);
      return false;
    }
  }

  // 获取所有管理员用户（仅限管理员）
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
        console.error('获取管理员用户列表失败', error);
        return [];
      }

      return data as AdminUser[];
    } catch (error) {
      console.error('获取管理员用户列表异常', error);
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

      return data as unknown as Permission[];
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
      admin: '超级管理员',
      content_reviewer: '内容审核员',
      shop_reviewer: '店铺审核员',
      finance: '财务人员',
      viewer: '查看者',
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
