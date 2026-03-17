'use client';

/**
 * 安全认证Hook
 * 解决React组件内存泄漏问题，提供安全的状态更新机制
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { authStateManager, type AuthState } from '@/lib/auth';

// 安全的认证Hook返回类型
interface SafeAuthHook {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  roles: string[];
  tenantId: string | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  hasPermission: (permission: string) => boolean;
}

/**
 * 安全认证Hook
 * 自动处理组件卸载后的状态更新问题
 */
export function useSafeAuth(): SafeAuthHook {
  // 组件挂载状态ref
  const mountedRef = useRef(true);

  // 本地状态
  const [localState, setLocalState] = useState<AuthState>(
    (authStateManager as any).getState()
  );

  // 安全的状态更新函数
  const safeSetState = useCallback((newState: Partial<AuthState>) => {
    if (mountedRef.current) {
      setLocalState((prev: AuthState) => ({ ...prev, ...newState }));
    }
  }, []);

  // 组件挂载时的清理函数
  useEffect(() => {
    // 标记组件已挂载
    mountedRef.current = true;

    // 订阅认证状态变化
    const unsubscribe = authStateManager.subscribe((newState: AuthState) => {
      safeSetState(newState);
    });

    // 组件卸载时的清理
    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [safeSetState]);

  // 安全的登录函数
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        // 设置加载状态
        safeSetState({ isLoading: true, error: null });

        // 这里将在后续任务中连接到具体的认证服务
        // 暂时模拟登录逻辑
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // 更新全局状态管理器
          authStateManager.setAuthenticated(
            result.user,
            result.user.is_admin,
            result.user.roles || ['viewer'],
            null
          );

          return { success: true };
        } else {
          const errorMessage = result.error || '登录失败';
          safeSetState({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      } catch (error: any) {
        const errorMessage = error.message || '网络错误';
        safeSetState({ error: errorMessage, isLoading: false });
        return { success: false, error: errorMessage };
      }
    },
    [safeSetState]
  );

  // 安全的登出函数
  const logout = useCallback(async () => {
    try {
      safeSetState({ isLoading: true, error: null });

      // 调用登出API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      // 重置全局状态
      authStateManager.setUnauthenticated();

      return { success: response.ok };
    } catch (error: any) {
      const errorMessage = error.message || '登出失败';
      safeSetState({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  }, [safeSetState]);

  // 权限检查函数
  const hasPermission = useCallback(
    (_permission: string) => {
      // 管理员拥有所有权限
      if (localState.isAdmin) return true;

      // 这里可以在后续实现更细粒度的权限检查
      return false;
    },
    [localState.isAdmin]
  );

  // 返回安全的Hook接口
  return {
    // 状态属性
    user: localState.user,
    isAuthenticated: localState.isAuthenticated,
    isLoading: localState.isLoading,
    error: localState.error,
    isAdmin: localState.isAdmin,
    roles: localState.roles,
    tenantId: localState.tenantId,

    // 操作函数
    login,
    logout,
    hasPermission,
  };
}

/**
 * 轻量级认证状态Hook
 * 仅用于读取认证状态，不包含操作函数
 */
export function useAuthStatus() {
  const mountedRef = useRef(true);
  const [state, setState] = useState<AuthState>(authStateManager.getState());

  useEffect(() => {
    mountedRef.current = true;

    const unsubscribe = authStateManager.subscribe((newState: AuthState) => {
      if (mountedRef.current) {
        setState(newState);
      }
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, []);

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isAdmin: state.isAdmin,
    roles: state.roles,
    isLoading: state.isLoading,
    error: state.error,
  };
}

/**
 * 认证初始化Hook
 * 用于在应用启动时初始化认证状态
 */
export function useAuthInitialization() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsInitializing(true);
        setInitError(null);

        // 初始化认证状态管理器
        await authStateManager.initialize();

        setIsInitializing(false);
      } catch (error: any) {
        console.error('认证初始化失败', error);
        setInitError(error.message || '认证服务初始化失败');
        setIsInitializing(false);

        // 即使初始化失败也设置为就绪状态，避免阻塞应用
        authStateManager.updateState({ isLoading: false });
      }
    };

    initialize();
  }, []);

  return {
    isInitializing,
    initError,
    isReady: !isInitializing && authStateManager.isReady(),
  };
}
