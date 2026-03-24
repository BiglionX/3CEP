'use client';

import { useAuth } from '@/hooks/use-auth';
import { AuthService, UserRole as AuthUserRole } from '@/lib/auth-service';
import { supabase } from '@/lib/supabase';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

interface UserContextType {
  user: any;
  roles: AuthUserRole[];
  tenantId: string | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    user: supabaseUser,
    isLoading: authLoading,
    error: authError,
  } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<AuthUserRole[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从 cookie 或 localStorage 读取 mock token
  const getMockToken = () => {
    // 检查 cookie
    if (typeof document !== 'undefined') {
      const cookieMatch = document.cookie.match(/mock-token=([^;]+)/);
      if (cookieMatch) {
        return cookieMatch[1];
      }

      // 检查 localStorage
      const localStorageToken = localStorage.getItem('mock-token');
      if (localStorageToken) {
        return localStorageToken;
      }
    }

    return null;
  };

  // 解析 mock token 获取用户信息
  const parseMockToken = (token: string) => {
    try {
      // 简单的 token 解析（实际项目中应该使用 JWT 解析）
      const parts = token.split('_');
      if (parts.length >= 3) {
        return {
          id: parts[1],
          role: parts[2] as AuthUserRole,
          tenantId: parts[3] || null,
        };
      }
      return null;
    } catch (error) {
      console.error('解析 mock token 失败:', error);
      return null;
    }
  };

  // 加载用户信息
  const loadUserInfo = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 优先调用新的 session/me 接口
      const sessionResponse = await fetch('/api/session/me');

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();

        if (sessionData.isAuthenticated) {
          // 使用 session/me 接口返回的数据
          setUser(sessionData.user);
          setRoles(sessionData.roles);
          setTenantId(sessionData.tenantId);
          return;
        }
      }

      // fallback 到原有逻辑
      if (supabaseUser) {
        const adminUserInfo = await AuthService.getAdminUserInfo(
          supabaseUser.id
        );
        if (adminUserInfo) {
          setUser({
            ...supabaseUser,
            ...adminUserInfo,
          });
          setRoles([adminUserInfo.role as AuthUserRole]);
          // 从 user_tenants 表获取租户信息
          const { data: userTenants } = await supabase
            .from('user_tenants')
            .select('tenant_id')
            .eq('user_id', adminUserInfo.user_id)
            .eq('is_active', true)
            .limit(1);

          setTenantId(userTenants?.[0]?.tenant_id || null);
        } else {
          // 普通用户
          setUser(supabaseUser);
          setRoles(['viewer']);
          setTenantId(null);
        }
      } else {
        // 检查 mock token
        const mockToken = getMockToken();
        if (mockToken) {
          const mockUser = parseMockToken(mockToken);
          if (mockUser) {
            setUser({
              id: mockUser.id,
              email: `mock-${mockUser.id}@example.com`,
              role: mockUser.role,
            });
            setRoles([mockUser.role]);
            setTenantId(mockUser.tenantId);
          }
        }
      }
    } catch (err: any) {
      console.error('加载用户信息失败:', err);
      setError(err.message || '加载用户信息失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 权限检查方法 - 与 rbac.json 保持一致
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // 管理员拥有所有权
    if (roles.includes('admin')) return true;

    // 使用标准 RBAC 权限映射
    const rolePermissions: Record<string, string[]> = {
      admin: [
        'dashboard_read',
        'users_read',
        'users_create',
        'users_update',
        'users_delete',
        'content_read',
        'content_create',
        'content_update',
        'content_delete',
        'content_approve',
        'shops_read',
        'shops_create',
        'shops_update',
        'shops_approve',
        'payments_read',
        'payments_refund',
        'reports_read',
        'reports_export',
        'settings_read',
        'settings_update',
        'procurement_read',
        'procurement_create',
        'procurement_approve',
        'inventory_read',
        'inventory_update',
        'agents_execute',
        'agents_monitor',
        'n8n_workflows_read',
        'n8n_workflows_manage',
      ],
      manager: [
        'dashboard_read',
        'users_read',
        'users_create',
        'users_update',
        'content_read',
        'content_create',
        'content_update',
        'content_approve',
        'shops_read',
        'shops_create',
        'shops_update',
        'shops_approve',
        'payments_read',
        'reports_read',
        'reports_export',
        'settings_read',
        'procurement_read',
        'procurement_create',
        'procurement_approve',
      ],
      content_manager: [
        'dashboard_read',
        'content_read',
        'content_create',
        'content_update',
        'content_approve',
        'reports_read',
      ],
      shop_manager: [
        'dashboard_read',
        'shops_read',
        'shops_create',
        'shops_update',
        'shops_approve',
        'reports_read',
      ],
      finance_manager: [
        'dashboard_read',
        'payments_read',
        'payments_refund',
        'reports_read',
        'reports_export',
      ],
      procurement_specialist: [
        'dashboard_read',
        'procurement_read',
        'procurement_create',
        'procurement_approve',
        'reports_read',
      ],
      warehouse_operator: [
        'dashboard_read',
        'inventory_read',
        'inventory_update',
        'reports_read',
      ],
      agent_operator: [
        'dashboard_read',
        'agents_execute',
        'agents_monitor',
        'reports_read',
      ],
      viewer: ['dashboard_read', 'reports_read'],
      external_partner: ['dashboard_read'],
    };

    const userPermissions = roles.flatMap(role => rolePermissions[role] || []);
    return (
      userPermissions.includes('*') || userPermissions.includes(permission)
    );
  };

  // 刷新用户信息
  const refreshUser = async () => {
    await loadUserInfo();
  };

  // 监听认证状态变化
  useEffect(() => {
    loadUserInfo();
  }, [supabaseUser]);

  const contextValue: UserContextType = {
    user: user || supabaseUser,
    roles,
    tenantId,
    isLoading: isLoading || authLoading,
    error: error || authError,
    hasPermission,
    refreshUser,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}

// 自定义 Hook
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within an AuthProvider');
  }
  return context;
}

// Mock token 设置工具函数
export const setMockToken = (
  userId: string,
  role: AuthUserRole,
  tenantId?: string
) => {
  const token = `mock_${userId}_${role}_${tenantId || 'default'}`;

  // 设置 cookie
  if (typeof document !== 'undefined') {
    document.cookie = `mock-token=${token}; path=/; max-age=3600`;

    // 设置 localStorage
    localStorage.setItem('mock-token', token);
  }
};

// 清除 mock token
export const clearMockToken = () => {
  if (typeof document !== 'undefined') {
    document.cookie =
      'mock-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('mock-token');
  }
};
