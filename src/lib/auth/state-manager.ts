/**
 * 统一认证状态管理器
 * 解决多认证服务冲突问题，提供单一数据源
 */

'use client';

import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';

// 认证状态接口定义
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  roles: string[];
  tenantId: string | null;
}

// 认证状态变更回调类型
export type AuthStateListener = (state: AuthState) => void;

// 默认初始状态
const INITIAL_STATE: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isAdmin: false,
  roles: [],
  tenantId: null,
};

/**
 * 统一认证状态管理器
 * 单例模式，确保全局唯一的状态源
 */
export class AuthStateManager {
  private static instance: AuthStateManager;
  private state: AuthState = { ...INITIAL_STATE };
  private subscribers: Set<AuthStateListener> = new Set();
  private isInitialized: boolean = false;

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): AuthStateManager {
    if (!AuthStateManager.instance) {
      AuthStateManager.instance = new AuthStateManager();
    }
    return AuthStateManager.instance;
  }

  /**
   * 初始化认证状态
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.isInitialized = true;
    this.updateState({ isLoading: true, error: null });

    try {
      // 这里将在后续任务中实现具体的初始化逻辑
      // 暂时使用默认状态
      this.updateState({ isLoading: false });
    } catch (error) {
      console.error('认证状态初始化失败:', error);
      this.updateState({
        isLoading: false,
        error: '认证服务初始化失败',
      });
    }
  }

  /**
   * 更新认证状态
   * @param newState 部分状态更新
   */
  updateState(newState: Partial<AuthState>): void {
    const previousState = { ...this.state };
    this.state = { ...this.state, ...newState };

    // 只有当状态真正发生变化时才通知订阅者
    if (this.hasStateChanged(previousState, this.state)) {
      this.notifySubscribers();
    }
  }

  /**
   * 获取当前认证状态
   */
  getState(): AuthState {
    return { ...this.state };
  }

  /**
   * 订阅状态变化
   * @param listener 状态变更回调函数
   * @returns 取消订阅的函数
   */
  subscribe(listener: AuthStateListener): () => void {
    this.subscribers.add(listener);
    // 立即通知当前状态
    listener(this.getState());

    return () => {
      this.subscribers.delete(listener);
    };
  }

  /**
   * 通知所有订阅者状态变化
   */
  private notifySubscribers(): void {
    const currentState = this.getState();
    this.subscribers.forEach(listener => {
      try {
        listener(currentState);
      } catch (error) {
        console.error('认证状态监听器执行错误:', error);
      }
    });
  }

  /**
   * 比较两个状态是否相同
   */
  private hasStateChanged(oldState: AuthState, newState: AuthState): boolean {
    return (
      oldState?.user?.id !== newState?.user?.id ||
      oldState.isAuthenticated !== newState.isAuthenticated ||
      oldState.isLoading !== newState.isLoading ||
      oldState.error !== newState.error ||
      oldState.isAdmin !== newState.isAdmin ||
      JSON.stringify(oldState.roles) !== JSON.stringify(newState.roles) ||
      oldState.tenantId !== newState.tenantId
    );
  }

  /**
   * 重置状态到初始值
   */
  reset(): void {
    this.state = { ...INITIAL_STATE };
    this.notifySubscribers();
  }

  /**
   * 设置认证成功状态
   */
  setAuthenticated(
    user: User,
    isAdmin: boolean = false,
    roles: string[] = [],
    tenantId: string | null = null
  ): void {
    this.updateState({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      isAdmin,
      roles,
      tenantId,
    });
  }

  /**
   * 设置认证失败状态
   */
  setUnauthenticated(error: string | null = null): void {
    this.updateState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error,
      isAdmin: false,
      roles: [],
      tenantId: null,
    });
  }

  /**
   * 设置加载状态
   */
  setLoading(isLoading: boolean): void {
    this.updateState({ isLoading });
  }

  /**
   * 检查是否已初始化
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

// 导出单例实例
export const authStateManager = AuthStateManager.getInstance();

// React Hook封装
export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>(() =>
    authStateManager.getState()
  );

  useEffect(() => {
    // 订阅状态变化
    const unsubscribe = authStateManager.subscribe(newState => {
      setState(newState);
    });

    // 组件卸载时取消订阅
    return () => {
      unsubscribe();
    };
  }, []);

  return state;
}

// 便捷Hook：获取当前用户
export function useCurrentUser() {
  const { user } = useAuthState();
  return user;
}

// 便捷Hook：获取认证状态
export function useIsAuthenticated() {
  const { isAuthenticated } = useAuthState();
  return isAuthenticated;
}

// 便捷Hook：获取加载状态
export function useAuthLoading() {
  const { isLoading } = useAuthState();
  return isLoading;
}

// 便捷Hook：获取用户角色
export function useUserRoles() {
  const { roles, isAdmin } = useAuthState();
  return { roles, isAdmin };
}
