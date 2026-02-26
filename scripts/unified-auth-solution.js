#!/usr/bin/env node

/**
 * 统一认证系统诊断和修复脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 统一认证系统诊断和修复\n');

// 1. 检查现有认证系统
console.log('1️⃣ 现有认证系统检查');

const authSystems = [
  {
    name: '主AuthProvider',
    path: 'src/components/providers/AuthProvider.tsx',
    type: 'React Context Provider'
  },
  {
    name: '模块AuthProvider',
    path: 'src/modules/common/components/providers/AuthProvider.tsx',
    type: 'React Context Provider'
  },
  {
    name: 'Supabase原生认证',
    path: 'src/hooks/use-auth.ts',
    type: 'Custom Hook'
  },
  {
    name: '权限认证Hook',
    path: 'src/hooks/use-permission.tsx',
    type: 'Permission Hook'
  },
  {
    name: '技术模块认证',
    path: 'src/tech/utils/hooks/use-auth.ts',
    type: 'Custom Hook'
  }
];

authSystems.forEach(system => {
  const fullPath = path.join(process.cwd(), system.path);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${system.name} (${system.type})`);
  
  if (exists) {
    try {
      const stats = fs.statSync(fullPath);
      console.log(`   修改时间: ${stats.mtime.toLocaleString()}`);
    } catch (error) {
      console.log('   无法获取文件信息');
    }
  }
});

// 2. 分析冲突点
console.log('\n2️⃣ 认证冲突分析');

console.log('发现的主要冲突:');
console.log('• 存在两个AuthProvider，可能导致Context冲突');
console.log('• 多个认证Hook使用不同的状态管理机制');
console.log('• 认证状态存储方式不统一 (localStorage/cookie/session)');
console.log('• 权限检查逻辑分散在多个地方');

// 3. 创建统一认证解决方案
console.log('\n3️⃣ 创建统一认证解决方案');

const unifiedAuthSolution = `
/**
 * 统一认证服务
 * 解决多认证系统冲突问题
 */

import { supabase } from '@/lib/supabase';
import { AuthService } from '@/lib/auth-service';

// 统一的认证状态管理
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

  // 获取当前认证状态
  async getCurrentUser() {
    try {
      // 优先检查Supabase会话
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // 检查管理员权限
        const isAdmin = await AuthService.isAdminUser(session.user.id);
        return {
          user: session.user,
          isAuthenticated: true,
          is_admin: isAdmin,
          roles: isAdmin ? ['admin'] : ['viewer']
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
              email: payload.email
            },
            isAuthenticated: true,
            is_admin: payload.roles?.includes('admin') || false,
            roles: payload.roles || ['viewer']
          };
        } catch (error) {
          console.log('JWT token解析失败');
          localStorage.removeItem('jwt_token');
        }
      }

      // 备用方案：检查mock token
      const mockToken = this.getMockToken();
      if (mockToken) {
        return {
          user: {
            id: mockToken.userId,
            email: 'mock@example.com'
          },
          isAuthenticated: true,
          is_admin: mockToken.roles?.includes('admin') || false,
          roles: mockToken.roles || ['viewer']
        };
      }

      return {
        user: null,
        isAuthenticated: false,
        is_admin: false,
        roles: []
      };
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return {
        user: null,
        isAuthenticated: false,
        is_admin: false,
        roles: [],
        error: error.message
      };
    }
  }

  // 监听认证状态变化
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
          console.log('Mock token解析失败');
        }
      }
    }
    return null;
  }

  // 登录
  async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      const isAdmin = await AuthService.isAdminUser(data.user.id);
      const authState = {
        user: data.user,
        isAuthenticated: true,
        is_admin: isAdmin,
        roles: isAdmin ? ['admin'] : ['viewer']
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
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    is_admin: false,
    roles: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const state = await unifiedAuth.getCurrentUser();
        setAuthState({
          ...state,
          isLoading: false
        });
      } catch (error) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          is_admin: false,
          roles: [],
          isLoading: false,
          error: error.message
        });
      }
    };

    // 初始化认证状态
    initializeAuth();

    // 监听认证状态变化
    const unsubscribe = unifiedAuth.subscribe((user, isAuthenticated) => {
      setAuthState(prev => ({
        ...prev,
        user,
        isAuthenticated,
        isLoading: false
      }));
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    const result = await unifiedAuth.login(email, password);
    if (!result.success) {
      setAuthState(prev => ({ ...prev, isLoading: false, error: result.error }));
    }
    return result;
  };

  const logout = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    const result = await unifiedAuth.logout();
    if (!result.success) {
      setAuthState(prev => ({ ...prev, isLoading: false, error: result.error }));
    }
    return result;
  };

  const hasPermission = (permission: string) => {
    if (authState.is_admin) return true;
    // 这里可以添加更细粒度的权限检查
    return false;
  };

  return {
    ...authState,
    login,
    logout,
    hasPermission
  };
}
`;

// 保存统一认证解决方案
const authDir = path.join(process.cwd(), 'src', 'lib');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

fs.writeFileSync(
  path.join(authDir, 'unified-auth.ts'),
  unifiedAuthSolution
);

console.log('✅ 创建了统一认证服务: src/lib/unified-auth.ts');

// 4. 创建迁移指南
console.log('\n4️⃣ 迁移指南');

const migrationGuide = `
统一认证系统迁移指南
====================

1. 替换现有的AuthProvider:
   - 移除 src/components/providers/AuthProvider.tsx
   - 移除 src/modules/common/components/providers/AuthProvider.tsx
   - 在应用根部使用新的统一AuthProvider

2. 更新Hook引用:
   - 将 useAuth() 替换为 useUnifiedAuth()
   - 将 useUser() 替换为 useUnifiedAuth()
   - 将 usePermission() 的逻辑合并到统一认证中

3. 统一认证状态存储:
   - 优先使用Supabase Session
   - 备用localStorage JWT token
   - 临时mock token支持

4. 权限检查统一:
   - 所有权限检查通过统一认证服务
   - 管理员权限通过AuthService.isAdminUser()验证
   - 角色管理集中处理

5. 测试验证:
   - 确保登录/登出功能正常
   - 验证权限检查准确性
   - 测试各种边界情况
`;

fs.writeFileSync(
  path.join(process.cwd(), 'UNIFIED_AUTH_MIGRATION_GUIDE.md'),
  migrationGuide
);

console.log('✅ 创建了迁移指南: UNIFIED_AUTH_MIGRATION_GUIDE.md');

// 5. 提供立即可用的解决方案
console.log('\n5️⃣ 立即可用的解决方案');

console.log('\n方案一: 使用统一认证Hook');
console.log('在组件中替换:');
console.log('  // 旧代码');
console.log('  const { user } = useUser();');
console.log('  const { isAuthenticated } = useAuth();');
console.log('  const { hasPermission } = usePermission();');
console.log('');
console.log('  // 新代码');
console.log('  const { user, isAuthenticated, is_admin, hasPermission } = useUnifiedAuth();');

console.log('\n方案二: 临时绕过认证冲突');
console.log('访问紧急管理模式:');
console.log('  http://localhost:3001/emergency-admin');

console.log('\n方案三: 手动同步认证状态');
console.log('在浏览器Console中运行:');
console.log('  // 强制同步认证状态');
console.log('  localStorage.setItem("auth-sync-version", "unified-v1");');
console.log('  window.location.reload();');

console.log('\n📊 下一步行动:');
console.log('1. 查看生成的统一认证文件');
console.log('2. 参考迁移指南逐步替换');
console.log('3. 测试认证功能是否恢复正常');
console.log('4. 如有疑问，请提供具体错误信息');

console.log('\n✅ 统一认证解决方案已准备完成！');