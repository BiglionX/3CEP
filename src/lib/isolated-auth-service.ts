'use client';

import React from 'react';

/**
 * 隔离认证服务 - 避免任何循环依赖
 */
class IsolatedAuthService {
  isAuthenticated: boolean;
  user: any;
  isAdmin: boolean;
  listeners: Set<Function>;
  initialized: boolean;
  pendingOperations: Set<number>;

  constructor() {
    this.isAuthenticated = false;
    this.user = null;
    this.isAdmin = false;
    this.listeners = new Set();
    this.initialized = false;
    this.pendingOperations = new Set();
  }

  // 初始化认证状?
  async initialize() {
    if (this.initialized) return;
    
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🔒 初始化隔离认证服?)this.initialized = true;
    
    try {
      // 检查现有会话（只检查一次）
      const session = this.getStoredSession();
      if (session) {
        await this.restoreSession(session);
      } else {
        this.setUnauthenticated();
      }
    } catch (error) {
      console.error('认证初始化失?', error);
      this.setUnauthenticated();
    }
  }

  // 获取存储的会?
  getStoredSession() {
    // 检查多种存储方?
    const storages = [
      () => {
        if (typeof window === 'undefined') return null;
        const cookieMatch = document.cookie.match(/sb-[^;]+-auth-token=([^;]+)/);
        return cookieMatch ? JSON.parse(decodeURIComponent(cookieMatch[1])) : null;
      },
      () => localStorage.getItem('jwt_token'),
      () => sessionStorage.getItem('auth_session')
    ];

    for (const storage of storages) {
      try {
        const session = storage();
        if (session) return session;
      } catch (error) {
        continue;
      }
    }
    return null;
  }

  // 恢复会话
  async restoreSession(session: any) {
    try {
      // 验证会话有效?
      const isValid = await this.validateSession(session);
      if (isValid) {
        this.user = {
          id: session?.id || session.sub,
          email: session?.email || session.email
        };
        this.isAuthenticated = true;
        this.isAdmin = await this.checkAdminPermission(this.user.id);
        this.notifyListeners();
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('�?会话恢复成功')} else {
        this.clearStorage();
        this.setUnauthenticated();
      }
    } catch (error) {
      console.error('会话恢复失败:', error);
      this.clearStorage();
      this.setUnauthenticated();
    }
  }

  // 验证会话
  async validateSession(session: any) {
    // 简单的时间验证
    if (session.exp) {
      return Date.now() < session.exp * 1000;
    }
    return true; // 如果没有过期时间，默认认为有?
  }

  // 检查管理员权限
  async checkAdminPermission(userId: string) {
    // 使用缓存避免重复检?
    const cacheKey = `admin_${userId}`;
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached !== null) {
      return cached === 'true';
    }

    try {
      // 简化的管理员检?
      const isAdmin = userId === '6c83c463-bd84-4f3a-9e61-383b00bc3cfb'; // 硬编码管理员ID
      sessionStorage.setItem(cacheKey, isAdmin.toString());
      return isAdmin;
    } catch (error) {
      console.warn('管理员权限检查失?', error);
      return false;
    }
  }

  // 设置未认证状?
  setUnauthenticated() {
    this.user = null;
    this.isAuthenticated = false;
    this.isAdmin = false;
    this.notifyListeners();
  }

  // 清除存储
  clearStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwt_token');
      sessionStorage.removeItem('auth_session');
      // 清除所有admin缓存
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('admin_')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  }

  // 登录
  async login(email: string, password: string) {
    const operationId = Date.now();
    this.pendingOperations.add(operationId);
    
    try {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🔐 执行登录操作')// 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 简化的验证逻辑
      if (email === '1055603323@qq.com' && password === '12345678') {
        this.user = {
          id: '6c83c463-bd84-4f3a-9e61-383b00bc3cfb',
          email: email
        };
        this.isAuthenticated = true;
        this.isAdmin = true;
        
        // 存储会话
        const session = {
          user: this.user,
          exp: Math.floor(Date.now() / 1000) + 3600 // 1小时过期
        };
        sessionStorage.setItem('auth_session', JSON.stringify(session));
        
        this.notifyListeners();
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('�?登录成功')return { success: true, user: this.user };
      } else {
        throw new Error('邮箱或密码错?);
      }
    } catch (error: any) {
      console.error('登录失败:', error);
      return { success: false, error: error.message };
    } finally {
      this.pendingOperations.delete(operationId);
    }
  }

  // 登出
  async logout() {
    const operationId = Date.now();
    this.pendingOperations.add(operationId);
    
    try {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🚪 执行登出操作')// 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.clearStorage();
      this.setUnauthenticated();
      
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('�?登出成功')return { success: true };
    } catch (error: any) {
      console.error('登出失败:', error);
      return { success: false, error: error.message };
    } finally {
      this.pendingOperations.delete(operationId);
    }
  }

  // 通知监听?
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback({
          user: this.user,
          isAuthenticated: this.isAuthenticated,
          isAdmin: this.isAdmin
        });
      } catch (error) {
        console.error('监听器执行错?', error);
      }
    });
  }

  // 添加监听?
  subscribe(callback: Function) {
    this.listeners.add(callback);
    // 立即发送当前状?
    callback({
      user: this.user,
      isAuthenticated: this.isAuthenticated,
      isAdmin: this.isAdmin
    });
    
    // 返回取消订阅函数
    return () => {
      this.listeners.delete(callback);
    };
  }

  // 获取当前状?
  getState() {
    return {
      user: this.user,
      isAuthenticated: this.isAuthenticated,
      isAdmin: this.isAdmin,
      isInitializing: !this.initialized,
      hasPendingOperations: this.pendingOperations.size > 0
    };
  }
}

// 创建单例实例
const isolatedAuth = new IsolatedAuthService();

// 导出React Hook
export function useIsolatedAuth() {
  const [authState, setAuthState] = React.useState(isolatedAuth.getState());

  React.useEffect(() => {
    // 防止重复订阅
    let isSubscribed = true;
    
    const unsubscribe = isolatedAuth.subscribe((state: any) => {
      if (isSubscribed) {
        setAuthState(state);
      }
    });

    // 初始化认证服?
    if (!isolatedAuth.initialized) {
      isolatedAuth.initialize();
    }

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    return await isolatedAuth.login(email, password);
  };

  const logout = async () => {
    return await isolatedAuth.logout();
  };

  const hasPermission = (permission: string) => {
    return authState.isAdmin;
  };

  return {
    ...authState,
    login,
    logout,
    hasPermission
  };
}

// 为兼容性导?
export { isolatedAuth };
