'use client';

/**
 * 紧急替代认证Hook - 避免无限循环问题
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthService } from '@/lib/auth-service';

interface EmergencyAuthState {
  user: any;
  isAuthenticated: boolean;
  is_admin: boolean;
  roles: string[];
  isLoading: boolean;
  error: string | null;
}

// 全局缓存避免重复检?const authCache = new Map();
const adminCache = new Map();

export function useEmergencyAuth() {
  const [authState, setAuthState] = useState<EmergencyAuthState>({
    user: null,
    isAuthenticated: false,
    is_admin: false,
    roles: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        // 检查缓?        const cacheKey = 'current_session';
        const cached = authCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < 5000) {
          // 使用缓存数据
          if (isMounted) {
            setAuthState(cached.data);
          }
          return;
        }
        
        // 获取当前会话
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user && isMounted) {
          // 检查管理员权限（带缓存?          let isAdmin = adminCache.get(session.user.id);
          if (isAdmin === undefined) {
            try {
              isAdmin = await AuthService.isAdminUser(session.user.id);
              adminCache.set(session.user.id, isAdmin);
            } catch (adminError) {
              console.warn('管理员检查失?', adminError);
              isAdmin = false;
            }
          }
          
          const newState = {
            user: session.user,
            isAuthenticated: true,
            is_admin: isAdmin,
            roles: isAdmin ? ['admin'] : ['viewer'],
            isLoading: false,
            error: null
          };
          
          // 缓存结果
          authCache.set(cacheKey, {
            data: newState,
            timestamp: Date.now()
          });
          
          setAuthState(newState);
        } else if (isMounted) {
          setAuthState({
            user: null,
            isAuthenticated: false,
            is_admin: false,
            roles: [],
            isLoading: false,
            error: null
          });
        }
      } catch (error: any) {
        if (isMounted) {
          setAuthState({
            user: null,
            isAuthenticated: false,
            is_admin: false,
            roles: [],
            isLoading: false,
            error: error.message || '认证检查失?
          });
        }
      }
    };
    
    checkAuth();
    
    // 监听认证变化（简化版?    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      if (isMounted) {
        // 清除缓存并重新检?        authCache.clear();
        checkAuth();
      }
    });
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // 清除相关缓存
      authCache.clear();
      adminCache.delete(data.user.id);
      
      // 重新检查管理员权限
      const isAdmin = await AuthService.isAdminUser(data.user.id);
      adminCache.set(data.user.id, isAdmin);
      
      const newState = {
        user: data.user,
        isAuthenticated: true,
        is_admin: isAdmin,
        roles: isAdmin ? ['admin'] : ['viewer'],
        isLoading: false,
        error: null
      };
      
      setAuthState(newState);
      return { success: true, user: data.user };
    } catch (error: any) {
      const errorMessage = error.message || '登录失败';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await supabase.auth.signOut();
      localStorage.removeItem('jwt_token');
      
      // 清除所有缓?      authCache.clear();
      adminCache.clear();
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        is_admin: false,
        roles: [],
        isLoading: false,
        error: null
      });
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || '登出失败';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const hasPermission = (permission: string) => {
    return authState.is_admin;
  };

  return {
    ...authState,
    login,
    logout,
    hasPermission
  };
}