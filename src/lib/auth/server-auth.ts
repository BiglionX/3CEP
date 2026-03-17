/**
 * 服务端认证工具
 * 提供服务端获取当前用户信息的功能
 */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';

/**
 * 获取服务端当前用户信息
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-access-token');

    if (!sessionCookie?.value) {
      return null;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (error || !user) {
      console.error('获取用户信息失败:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('获取当前用户异常:', error);
    return null;
  }
}

/**
 * 获取用户角色
 */
export async function getUserRoles(userId?: string): Promise<string[]> {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const userMetadata = user.user_metadata || {};
  const roles = userMetadata.roles || [];

  // 如果没有设置角色，默认为普通用户
  if (roles.length === 0) {
    return ['user'];
  }

  return Array.isArray(roles) ? roles : [roles];
}

/**
 * 检查用户是否为管理员
 */
export async function isAdminUser(): Promise<boolean> {
  const roles = await getUserRoles();
  return roles.includes('admin') || roles.includes('superadmin');
}

/**
 * 获取用户租户ID
 */
export async function getUserTenantId(): Promise<string | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const userMetadata = user.user_metadata || {};
  return userMetadata.tenant_id || null;
}

/**
 * 验证用户认证并返回详细信息
 */
export async function requireAuth(): Promise<{
  user: User;
  roles: string[];
  tenantId: string | null;
  isAdmin: boolean;
}> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('未登录');
  }

  const roles = await getUserRoles(user.id);
  const tenantId = await getUserTenantId();
  const isAdmin = roles.includes('admin') || roles.includes('superadmin');

  return {
    user,
    roles,
    tenantId,
    isAdmin,
  };
}
