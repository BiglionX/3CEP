/**
 * 认证状态管理器测试
 * 验证AuthStateManager的核心功能和状态管理逻辑
 */

import { AuthStateManager, AuthState } from '@/lib/auth/state-manager';
import { AuthErrorCode } from '@/lib/auth/error-handler';

// 重置单例实例以便测试
function resetAuthStateManager() {
  // @ts-ignore - 访问私有属性进行测试重置
  AuthStateManager.instance = undefined;
}

describe('AuthStateManager', () => {
  let authManager: AuthStateManager;

  beforeEach(() => {
    resetAuthStateManager();
    authManager = AuthStateManager.getInstance();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // 清理所有订阅者
    // @ts-ignore - 访问私有属性进行清理
    authManager.subscribers.clear();
  });

  describe('单例模式', () => {
    test('应该返回相同的实例', () => {
      const instance1 = AuthStateManager.getInstance();
      const instance2 = AuthStateManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('状态初始化', () => {
    test('应该正确初始化默认状态', () => {
      const state = authManager.getState();

      expect(state).toEqual({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isAdmin: false,
        roles: [],
        tenantId: null,
      });
    });

    test('应该能够初始化认证状态', async () => {
      await authManager.initialize();

      const state = authManager.getState();
      expect(state.isLoading).toBe(false);
      // isInitialized是私有属性，通过副作用验证初始化完成
    });
  });

  describe('状态更新', () => {
    test('应该能够更新认证状态', () => {
      const newUser = {
        id: 'user123',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: '',
        created_at: '',
      };

      authManager.updateState({
        user: newUser,
        isAuthenticated: true,
        isAdmin: false,
      });

      const state = authManager.getState();
      expect(state.user).toEqual(newUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isAdmin).toBe(false);
    });

    test('应该只在状态真正变化时通知订阅者', () => {
      const subscriber = jest.fn();
      authManager.subscribe(subscriber);

      // 重置调用计数
      subscriber.mockClear();

      // 更新相同的状态
      authManager.updateState({ isAuthenticated: false });

      // 应该不会触发通知（因为状态未真正改变）
      expect(subscriber).toHaveBeenCalledTimes(0);

      // 更新不同的状态
      authManager.updateState({ isAuthenticated: true });

      // 应该触发通知
      expect(subscriber).toHaveBeenCalledTimes(1);
    });

    test('应该正确处理部分状态更新', () => {
      // 先设置初始状态
      authManager.updateState({
        user: {
          id: 'user123',
          email: 'test@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: '',
          created_at: '',
        },
        isAuthenticated: true,
        isAdmin: true,
      });

      // 只更新部分字段
      authManager.updateState({
        isAdmin: false,
        error: 'Some error',
      });

      const state = authManager.getState();
      expect(state.user).toEqual({ id: 'user123', email: 'test@example.com' });
      expect(state.isAuthenticated).toBe(true);
      expect(state.isAdmin).toBe(false);
      expect(state.error).toBe('Some error');
    });
  });

  describe('订阅机制', () => {
    test('应该支持状态订阅', () => {
      const subscriber = jest.fn();
      const unsubscribe = authManager.subscribe(subscriber);

      // 订阅时应该立即收到当前状态
      expect(subscriber).toHaveBeenCalledWith(authManager.getState());

      // 更新状态应该通知订阅者
      authManager.updateState({ isAuthenticated: true });
      expect(subscriber).toHaveBeenCalledTimes(2);

      // 取消订阅后不应该再收到通知
      unsubscribe();
      authManager.updateState({ isAuthenticated: false });
      expect(subscriber).toHaveBeenCalledTimes(2); // 仍然只有2次调用
    });

    test('应该正确处理多个订阅者', () => {
      const subscriber1 = jest.fn();
      const subscriber2 = jest.fn();

      authManager.subscribe(subscriber1);
      authManager.subscribe(subscriber2);

      // 重置调用计数
      subscriber1.mockClear();
      subscriber2.mockClear();

      // 更新状态应该通知所有订阅者
      authManager.updateState({ isAuthenticated: true });

      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledTimes(1);
    });

    test('应该优雅处理订阅者执行错误', () => {
      const failingSubscriber = jest.fn().mockImplementation(() => {
        throw new Error('Subscriber error');
      });
      const normalSubscriber = jest.fn();

      authManager.subscribe(failingSubscriber);
      authManager.subscribe(normalSubscriber);

      // 重置调用计数
      failingSubscriber.mockClear();
      normalSubscriber.mockClear();

      // 即使有订阅者报错，也应该继续通知其他订阅者
      expect(() => {
        authManager.updateState({ isAuthenticated: true });
      }).not.toThrow();

      expect(failingSubscriber).toHaveBeenCalledTimes(1);
      expect(normalSubscriber).toHaveBeenCalledTimes(1);
    });
  });

  describe('状态比较', () => {
    test('应该正确识别用户ID变化', () => {
      // @ts-ignore - 访问私有方法进行测试
      const hasChanged = authManager.hasStateChanged(
        { ...authManager.getState(), user: { id: 'user1' } } as AuthState,
        { ...authManager.getState(), user: { id: 'user2' } } as AuthState
      );

      expect(hasChanged).toBe(true);
    });

    test('应该正确识别认证状态变化', () => {
      // @ts-ignore - 访问私有方法进行测试
      const hasChanged = authManager.hasStateChanged(
        { ...authManager.getState(), isAuthenticated: false } as AuthState,
        { ...authManager.getState(), isAuthenticated: true } as AuthState
      );

      expect(hasChanged).toBe(true);
    });

    test('应该正确识别角色数组变化', () => {
      // @ts-ignore - 访问私有方法进行测试
      const hasChanged = authManager.hasStateChanged(
        { ...authManager.getState(), roles: ['user'] } as AuthState,
        { ...authManager.getState(), roles: ['user', 'admin'] } as AuthState
      );

      expect(hasChanged).toBe(true);
    });

    test('应该正确识别相同状态', () => {
      const currentState = authManager.getState();
      // @ts-ignore - 访问私有方法进行测试
      const hasChanged = authManager.hasStateChanged(
        currentState,
        currentState
      );

      expect(hasChanged).toBe(false);
    });
  });

  describe('状态重置', () => {
    test('应该能够重置到初始状态', () => {
      // 先修改状态
      authManager.updateState({
        user: {
          id: 'user123',
          email: '',
          app_metadata: {},
          user_metadata: {},
          aud: '',
          created_at: '',
        },
        isAuthenticated: true,
        isAdmin: true,
        roles: ['admin'],
      });

      // 重置状态
      authManager.reset();

      const state = authManager.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isAdmin).toBe(false);
      expect(state.roles).toEqual([]);
    });

    test('重置应该通知订阅者', () => {
      const subscriber = jest.fn();
      authManager.subscribe(subscriber);
      subscriber.mockClear();

      authManager.reset();

      expect(subscriber).toHaveBeenCalledWith(authManager.getState());
    });
  });

  describe('辅助方法', () => {
    test('应该正确执行初始化', async () => {
      // 验证初始化前后状态变化
      const initialState = authManager.getState();
      await authManager.initialize();
      const afterState = authManager.getState();

      // 初始化应该完成而不抛出错误
      expect(afterState.isLoading).toBe(false);
    });

    test('应该能够通过状态判断认证状态', () => {
      let state = authManager.getState();
      expect(state.isAuthenticated).toBe(false);

      authManager.updateState({ isAuthenticated: true });

      state = authManager.getState();
      expect(state.isAuthenticated).toBe(true);
    });

    test('应该能够通过状态判断管理员权限', () => {
      let state = authManager.getState();
      expect(state.isAdmin).toBe(false);

      authManager.updateState({ isAdmin: true });

      state = authManager.getState();
      expect(state.isAdmin).toBe(true);
    });

    test('应该能够通过状态获取用户角色', () => {
      let state = authManager.getState();
      expect(state.roles).toEqual([]);

      const roles = ['user', 'editor'];
      authManager.updateState({ roles });

      state = authManager.getState();
      expect(state.roles).toEqual(roles);
    });

    test('应该能够通过状态检查权限', () => {
      // 非管理员用户
      authManager.updateState({
        isAdmin: false,
        roles: ['user'],
      });

      let state = authManager.getState();
      expect(state.roles.includes('user')).toBe(true);
      expect(state.isAdmin).toBe(false);

      // 管理员用户
      authManager.updateState({
        isAdmin: true,
        roles: ['user'],
      });

      state = authManager.getState();
      expect(state.roles.includes('user')).toBe(true);
      expect(state.isAdmin).toBe(true);
    });
  });

  describe('错误处理', () => {
    test('应该优雅处理初始化错误', async () => {
      // 模拟初始化过程中的错误
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // 这里可以通过mock相关依赖来测试错误情况
      // 由于当前实现比较简单，主要是验证不会崩溃

      await expect(authManager.initialize()).resolves.not.toThrow();

      consoleSpy.mockRestore();
    });

    test('应该处理无效的状态更新', () => {
      // 测试各种边界情况
      expect(() => {
        authManager.updateState({} as Partial<AuthState>);
      }).not.toThrow();

      expect(() => {
        // @ts-ignore - 测试无效输入
        authManager.updateState(null);
      }).not.toThrow();

      expect(() => {
        // @ts-ignore - 测试无效输入
        authManager.updateState(undefined);
      }).not.toThrow();
    });
  });
});
