/**
 * 统一认证Hook - 简化版
 * 解决认证系统冲突问题
 */

'use client';
import { AuthService } from '@/lib/auth-service';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface AuthState {
  user: { id?: string; email?: string } | null;
  isAuthenticated: boolean;
  is_admin: boolean;
  roles: string[];
  isLoading: boolean;
  error: string | null;
}
// 管理员权限缓存
declare global {
  interface Window {
    __adminCache?: Record<string, boolean>;
  }
}

export function useUnifiedAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    is_admin: false,
    roles: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // 状态缓存变量 - 使用ref模式避免闭包问题
    let lastUserId: string | null = null;
    let lastAuthState: string | null = null;

    const initializeAuth = async () => {
      try {
        // 只在客户端检查Supabase会话
        if (typeof window === 'undefined') {
          setAuthState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // 检查管理员权限
          const isAdmin = await (AuthService as any).isAdminUser(
            session.user.id
          );
          setAuthState({
            user: session.user,
            isAuthenticated: true,
            is_admin: isAdmin,
            roles: isAdmin ? ['admin'] : ['viewer'],
            isLoading: false,
            error: null,
          });
          return;
        }

        // 备用方案：检查localStorage
        const storedToken = localStorage.getItem('jwt_token');
        if (storedToken) {
          try {
            const payload = JSON.parse(atob(storedToken.split('.')[1]));
            setAuthState({
              user: {
                id: payload.userId,
                email: payload.email,
              },
              isAuthenticated: true,
              is_admin: payload.roles?.includes('admin') || false,
              roles: payload.roles || ['viewer'],
              isLoading: false,
              error: null,
            });
            return;
          } catch (error) {
            // TODO: 移除调试日志 - console.log('JWT token解析失败')
            localStorage.removeItem('jwt_token');
          }
        }

        // 默认未认证状态
        setAuthState({
          user: null,
          isAuthenticated: false,
          is_admin: false,
          roles: [],
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        console.error('认证初始化失败', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          is_admin: false,
          roles: [],
          isLoading: false,
          error: error.message || '认证初始化失败',
        });
      }
    };

    initializeAuth();

    // 只在客户端设置认证监听器
    if (typeof window !== 'undefined') {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
        const currentUserId = session?.user?.id || null;
        const currentAuthState = session ? 'authenticated' : 'unauthenticated';

        // 只有当用户真正发生变化时才更新状态
        if (
          currentUserId !== lastUserId ||
          currentAuthState !== lastAuthState
        ) {
          lastUserId = currentUserId;
          lastAuthState = currentAuthState;

          if (session?.user) {
            // 使用缓存避免重复的管理员检查
            const cachedIsAdmin: boolean | undefined =
              window.__adminCache?.[currentUserId || ''];
            if (cachedIsAdmin !== undefined) {
              setAuthState({
                user: session.user,
                isAuthenticated: true,
                is_admin: cachedIsAdmin,
                roles: cachedIsAdmin ? ['admin'] : ['viewer'],
                isLoading: false,
                error: null,
              });
            } else {
              // 首次检查并缓存结果
              (AuthService as any)
                .isAdminUser(session.user.id)
                .then((isAdmin: boolean) => {
                  // 缓存结果
                  if (!window.__adminCache) window.__adminCache = {};
                  window.__adminCache[currentUserId || ''] = isAdmin;

                  setAuthState({
                    user: session.user,
                    isAuthenticated: true,
                    is_admin: isAdmin,
                    roles: isAdmin ? ['admin'] : ['viewer'],
                    isLoading: false,
                    error: null,
                  });
                })
                .catch((error: any) => {
                  console.warn('管理员权限检查失败', error);
                  // 失败时默认为非管理员
                  setAuthState({
                    user: session.user,
                    isAuthenticated: true,
                    is_admin: false,
                    roles: ['viewer'],
                    isLoading: false,
                    error: null,
                  });
                });
            }
          } else {
            setAuthState({
              user: null,
              isAuthenticated: false,
              is_admin: false,
              roles: [],
              isLoading: false,
              error: null,
            });
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    return () => {};
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const isAdmin: boolean = await (AuthService as any).isAdminUser(
        data.user.id
      );
      setAuthState({
        user: data.user,
        isAuthenticated: true,
        is_admin: isAdmin,
        roles: isAdmin ? ['admin'] : ['viewer'],
        isLoading: false,
        error: null,
      });

      return { success: true, user: data.user };
    } catch (error: any) {
      const errorMessage = error.message || '登录失败';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await supabase.auth.signOut();
      localStorage.removeItem('jwt_token');

      setAuthState({
        user: null,
        isAuthenticated: false,
        is_admin: false,
        roles: [],
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || '登出失败';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  const hasPermission = (_permission: string) => {
    // 管理员拥有所有权限
    if (authState.is_admin) return true;
    // 可以在这里添加更细粒度的权限检查
    return false;
  };

  return {
    ...authState,
    login,
    logout,
    hasPermission,
  };
}
