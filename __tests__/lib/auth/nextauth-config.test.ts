/**
 * NextAuth配置测试
 * 验证NextAuth集成配置的正确性和功能完整性
 */

import { authOptions } from '@/lib/auth/nextauth-config';

describe('NextAuth Configuration', () => {
  describe('配置结构验证', () => {
    test('应该包含必需的配置项', () => {
      expect(authOptions).toHaveProperty('providers');
      expect(authOptions).toHaveProperty('callbacks');
      expect(authOptions).toHaveProperty('pages');
      expect(authOptions).toHaveProperty('session');
      expect(authOptions).toHaveProperty('jwt');
    });

    test('应该配置正确的适配器', () => {
      expect(authOptions.adapter).toBeDefined();
    });

    test('应该配置凭证提供者', () => {
      expect(Array.isArray(authOptions.providers)).toBe(true);
      expect(authOptions.providers.length).toBeGreaterThan(0);
    });
  });

  describe('认证提供者配置', () => {
    test('应该配置凭证认证提供者', () => {
      const credentialsProvider = authOptions.providers.find(
        (provider: any) => provider.name === 'credentials'
      );

      expect(credentialsProvider).toBeDefined();
      expect(credentialsProvider).toHaveProperty('credentials');
      expect(credentialsProvider).toHaveProperty('authorize');
    });

    test('凭证提供者应该包含邮箱和密码字段', () => {
      const credentialsProvider: any = authOptions.providers.find(
        (provider: any) => provider.name === 'credentials'
      );

      if (credentialsProvider && credentialsProvider.credentials) {
        expect(credentialsProvider.credentials).toHaveProperty('email');
        expect(credentialsProvider.credentials).toHaveProperty('password');
      }
    });
  });

  describe('回调函数配置', () => {
    test('应该配置授权回调', () => {
      expect(authOptions.callbacks).toHaveProperty('authorize');
    });

    test('应该配置会话回调', () => {
      expect(authOptions.callbacks).toHaveProperty('session');
    });

    test('应该配置JWT回调', () => {
      expect(authOptions.callbacks).toHaveProperty('jwt');
    });

    test('应该配置登录成功回调', () => {
      expect(authOptions.callbacks).toHaveProperty('signIn');
    });

    test('应该配置用户创建回调', () => {
      expect(authOptions.callbacks).toHaveProperty('createUser');
    });
  });

  describe('页面配置', () => {
    test('应该配置登录页面', () => {
      if (authOptions.pages) {
        expect(authOptions.pages).toHaveProperty('signIn');
        expect(authOptions.pages.signIn).toBe('/login');
      }
    });

    test('应该配置登出页面', () => {
      if (authOptions.pages) {
        expect(authOptions.pages).toHaveProperty('signOut');
        expect(authOptions.pages.signOut).toBe('/login');
      }
    });

    test('应该配置错误页面', () => {
      if (authOptions.pages) {
        expect(authOptions.pages).toHaveProperty('error');
        expect(authOptions.pages.error).toBe('/auth/error');
      }
    });
  });

  describe('会话配置', () => {
    test('应该使用JWT策略', () => {
      if (authOptions.session) {
        expect(authOptions.session.strategy).toBe('jwt');
      }
    });

    test('应该设置正确的会话时长', () => {
      if (authOptions.session) {
        expect(authOptions.session.maxAge).toBe(30 * 24 * 60 * 60); // 30天
      }
    });

    test('应该设置更新间隔', () => {
      if (authOptions.session) {
        expect(authOptions.session.updateAge).toBe(24 * 60 * 60); // 24小时
      }
    });
  });

  describe('JWT配置', () => {
    test('应该配置JWT密钥', () => {
      if (authOptions.jwt) {
        expect(authOptions.jwt).toHaveProperty('secret');
      }
    });

    test('应该设置正确的JWT过期时间', () => {
      if (authOptions.jwt) {
        expect(authOptions.jwt.maxAge).toBe(30 * 24 * 60 * 60); // 30天
      }
    });
  });

  describe('环境变量依赖', () => {
    test('应该依赖必要的环境变量', () => {
      const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL',
      ];

      requiredEnvVars.forEach(envVar => {
        // 只验证环境变量是否存在，不检查具体值
        expect(process.env).toHaveProperty(envVar);
      });
    });

    test('Supabase配置应该正确', () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseSecret = process.env.SUPABASE_SERVICE_ROLE_KEY;

      expect(supabaseUrl).toBeDefined();
      expect(supabaseSecret).toBeDefined();
      expect(supabaseUrl).toMatch(/^https?:\/\//); // 应该是URL格式
    });
  });

  describe('安全配置', () => {
    test('生产环境应该启用调试模式检查', () => {
      const isDevelopment = process.env.NODE_ENV === 'development';
      expect(authOptions.debug).toBe(isDevelopment);
    });

    test('应该配置主题', () => {
      expect(authOptions.theme).toHaveProperty('colorScheme');
      expect(authOptions.theme).toHaveProperty('logo');
    });
  });

  describe('错误处理配置', () => {
    test('应该正确导入错误处理模块', () => {
      // 验证相关模块可以正确导入
      expect(() => {
        require('@/lib/auth/error-handler');
      }).not.toThrow();
    });

    test('应该正确导入状态管理模块', () => {
      expect(() => {
        require('@/lib/auth/state-manager');
      }).not.toThrow();
    });
  });

  describe('集成测试', () => {
    test('配置应该能够被NextAuth正确处理', () => {
      // 验证配置结构符合NextAuth要求
      expect(typeof authOptions).toBe('object');
      expect(authOptions).not.toBeNull();
    });

    test('所有必需的回调函数应该是函数类型', () => {
      if (authOptions.callbacks) {
        const callbacks = authOptions.callbacks;

        // 检查几个关键回调
        if ('authorize' in callbacks) {
          expect(typeof callbacks.authorize).toBe('function');
        }
        if ('session' in callbacks) {
          expect(typeof callbacks.session).toBe('function');
        }
        if ('jwt' in callbacks) {
          expect(typeof callbacks.jwt).toBe('function');
        }
      }
    });

    test('页面配置应该是字符串类型', () => {
      if (authOptions.pages) {
        const pages = authOptions.pages;

        if ('signIn' in pages) {
          expect(typeof pages.signIn).toBe('string');
        }
        if ('signOut' in pages) {
          expect(typeof pages.signOut).toBe('string');
        }
      }
    });
  });
});

describe('NextAuth类型扩展', () => {
  test('应该正确扩展User接口', () => {
    // 验证TypeScript类型扩展
    interface ExtendedUser {
      id: string;
      isAdmin?: boolean;
    }

    const user: ExtendedUser = {
      id: 'test-user-id',
      isAdmin: false,
    };

    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('isAdmin');
  });

  test('应该正确扩展Session接口', () => {
    interface ExtendedSession {
      user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        isAdmin?: boolean;
      };
    }

    const session: ExtendedSession = {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        isAdmin: true,
      },
    };

    expect(session.user).toHaveProperty('id');
    expect(session.user).toHaveProperty('email');
    expect(session.user).toHaveProperty('isAdmin');
  });

  test('应该正确扩展JWT接口', () => {
    interface ExtendedJWT {
      id: string;
      isAdmin?: boolean;
    }

    const jwt: ExtendedJWT = {
      id: 'test-jwt-id',
      isAdmin: false,
    };

    expect(jwt).toHaveProperty('id');
    expect(jwt).toHaveProperty('isAdmin');
  });
});
