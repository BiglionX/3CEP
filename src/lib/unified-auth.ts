/**
 * 统一认证服务
 * 解决多认证系统冲突问?
 */

import { supabase } from '@/lib/supabase';
import { AuthService } from '@/lib/auth-service';

// 统一的认证状态管?
class UnifiedAuthService {
  private static instance: UnifiedAuthService;
  private listeners: Array<(user: any, isAuthenticated: boolean) => void> = [];

  private constructor() {}

  static getInstance(): UnifiedAuthService {
    if (!UnifiedAuthService.instance) {
      UnifiedAuthService.instance = new UnifiedAuthService();
    }
    return UnifiedAuthService.instance;
  }

  // 获取当前认证状?
  async getCurrentUser() {
    try {
      // 优先检查Supabase会话
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // 检查管理员权限
        const isAdmin = await AuthService.isAdminUser(session.user.id);
        return {
          user: session.user,
          isAuthenticated: true,
          is_admin: isAdmin,
          roles: isAdmin ? ['admin'] : ['viewer'],
          error: null,
        };
      }

      // 备用方案：检查localStorage
      const storedToken = localStorage.getItem('jwt_token');
      if (storedToken) {
        try {
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          return {
            user: {
              id: payload.userId,
              email: payload.email,
            },
            isAuthenticated: true,
            is_admin: payload?.includes('admin') || false,
            roles: payload.roles || ['viewer'],
            error: null,
          };
        } catch (error) {
          // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('JWT token解析失败')localStorage.removeItem('jwt_token');
        }
      }

      // 备用方案：检查mock token
      const mockToken = this.getMockToken();
      if (mockToken) {
        return {
          user: {
            id: mockToken.userId,
            email: 'mock@example.com',
          },
          isAuthenticated: true,
          is_admin: mockToken?.includes('admin') || false,
          roles: mockToken.roles || ['viewer'],
          error: null,
        };
      }

      return {
        user: null,
        isAuthenticated: false,
        is_admin: false,
        roles: [],
        error: null,
      };
    } catch (error: unknown) {
      console.error('获取用户信息失败:', error);
      return {
        user: null,
        isAuthenticated: false,
        is_admin: false,
        roles: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // 监听认证状态变?
  subscribe(listener: (user: any, isAuthenticated: boolean) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // 通知所有监听器
  private notifyListeners(user: any, isAuthenticated: boolean) {
    this.listeners.forEach(listener => listener(user, isAuthenticated));
  }

  // 获取mock token
  private getMockToken() {
    if (typeof document !== 'undefined') {
      const cookieMatch = document.cookie.match(/mock-token=([^;]+)/);
      if (cookieMatch) {
        try {
          return JSON.parse(decodeURIComponent(cookieMatch[1]));
        } catch (error) {
          // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('Mock token解析失败')}
      }
    }
    return null;
  }

  // 登录
  async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const isAdmin = await AuthService.isAdminUser(data.user.id);
      const authState = {
        user: data.user,
        isAuthenticated: true,
        is_admin: isAdmin,
        roles: isAdmin ? ['admin'] : ['viewer'],
      };

      this.notifyListeners(data.user, true);
      return { success: true, ...authState };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // 登出
  async logout() {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('jwt_token');
      this.notifyListeners(null, false);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

// 导出单例实例
export const unifiedAuth = UnifiedAuthService.getInstance();

// React Hook封装
import { useState, useEffect } from 'react';

export function useUnifiedAuth() {
  const [authState, setAuthState] = useState<{
    user: any;
    isAuthenticated: boolean;
    is_admin: boolean;
    roles: string[];
    isLoading: boolean;
    error: string | null;
  }>({
    user: null,
    isAuthenticated: false,
    is_admin: false,
    roles: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const state = await unifiedAuth.getCurrentUser();
        setAuthState({
          ...state,
          isLoading: false,
        });
      } catch (error: unknown) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          is_admin: false,
          roles: [],
          isLoading: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    };

    // 初始化认证状?
    initializeAuth();

    // 监听认证状态变?
    const unsubscribe = unifiedAuth.subscribe((user, isAuthenticated) => {
      setAuthState(prev => ({
        ...prev,
        user,
        isAuthenticated,
        isLoading: false,
      }));
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    const result = await unifiedAuth.login(email, password);
    if (!result.success) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: result.error,
      }));
    }
    return result;
  };

  const logout = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    const result = await unifiedAuth.logout();
    if (!result.success) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: result.error,
      }));
    }
    return result;
  };

  const hasPermission = (permission: string) => {
    if (authState.is_admin) return true;
    // 这里可以添加更细粒度的权限检?
    return false;
  };

  return {
    ...authState,
    login,
    logout,
    hasPermission,
  };
}
