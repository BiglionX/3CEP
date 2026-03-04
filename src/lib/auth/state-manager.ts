/**
 * 统一认证状态管理器
 * 解决多认证服务冲突问题，提供单一数据? */

import type { User } from '@supabase/supabase-js';

// 认证状态接口定?export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  roles: string[];
  tenantId: string | null;
}

// 认证状态变更回调类?export type AuthStateListener = (state: AuthState) => void;

// 默认初始状?const INITIAL_STATE: AuthState = {
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
   * 初始化认证状?   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.isInitialized = true;
    this.updateState({ isLoading: true, error: null });

    try {
      // 这里将在后续任务中实现具体的初始化逻辑
      // 暂时使用默认状?      this.updateState({ isLoading: false });
    } catch (error) {
      console.error('认证状态初始化失败:', error);
      this.updateState({
        isLoading: false,
        error: '认证服务初始化失?,
      });
    }
  }

  /**
   * 更新认证状?   * @param newState 部分状态更?   */
  updateState(newState: Partial<AuthState>): void {
    const previousState = { ...this.state };
    this.state = { ...this.state, ...newState };

    // 只有当状态真正发生变化时才通知订阅?    if (this.hasStateChanged(previousState, this.state)) {
      this.notifySubscribers();
    }
  }

  /**
   * 获取当前认证状?   */
  getState(): AuthState {
    return { ...this.state };
  }

  /**
   * 订阅状态变?   * @param listener 状态变更回调函?   * @returns 取消订阅的函?   */
  subscribe(listener: AuthStateListener): () => void {
    this.subscribers.add(listener);
    // 立即通知当前状?    listener(this.getState());

    return () => {
      this.subscribers.delete(listener);
    };
  }

  /**
   * 通知所有订阅者状态变?   */
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
   * 比较两个状态是否相?   */
  private hasStateChanged(oldState: AuthState, newState: AuthState): boolean {
    return (
      oldState?.id !== newState?.id ||
      oldState.isAuthenticated !== newState.isAuthenticated ||
      oldState.isLoading !== newState.isLoading ||
      oldState.error !== newState.error ||
      oldState.isAdmin !== newState.isAdmin ||
      JSON.stringify(oldState.roles) !== JSON.stringify(newState.roles) ||
      oldState.tenantId !== newState.tenantId
    );
  }

  /**
   * 重置状态到初始?   */
  reset(): void {
    this.state = { ...INITIAL_STATE };
    this.notifySubscribers();
  }

  /**
   * 设置认证成功状?   */
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
   * 设置认证失败状?   */
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
   * 设置加载状?   */
  setLoading(isLoading: boolean): void {
    this.updateState({ isLoading });
  }

  /**
   * 检查是否已初始?   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

// 导出单例实例
export const authStateManager = AuthStateManager.getInstance();

// React Hook封装（将在后续任务中完善?export function useAuthState() {
  // 这里将在Task 1.2中实现完整的Hook
  return authStateManager.getState();
}
