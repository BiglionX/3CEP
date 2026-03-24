/**
 * NextAuth.js 配置文件
 * 适用于Next.js App Router
 */

import { AuthErrorCode, AuthErrorHandler } from '@/lib/auth/error-handler';
import { authStateManager } from '@/lib/auth/state-manager';
import { fetchWithTimeout } from '@/lib/utils/fetch-with-timeout';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// 扩展NextAuth用户类型
declare module 'next-auth' {
  interface User {
    id: string;
    isAdmin?: boolean;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin?: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    isAdmin?: boolean;
  }
}

// Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseSecret = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const authOptions: NextAuthOptions = {
  // 使用Supabase适配器
  adapter: SupabaseAdapter({
    url: supabaseUrl,
    secret: supabaseSecret,
  }),

  // 认证提供者配置
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: '邮箱', type: 'email' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error(AuthErrorCode.INVALID_CREDENTIALS);
        }

        try {
          // 验证邮箱格式
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(credentials.email)) {
            throw new Error(AuthErrorCode.INVALID_CREDENTIALS);
          }

          // 使用带超时控制的 fetch 调用
          const response = await fetchWithTimeout(
            `${supabaseUrl}/auth/v1/token?grant_type=password`,
            {
              timeout: 10000, // 10 秒超时（认证应该快速响应）
              method: 'POST',
              headers: {
                apikey: supabaseSecret,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok || data.error) {
            // 映射Supabase错误到标准错误码
            const errorCode = data?.code || AuthErrorCode.INVALID_CREDENTIALS;
            throw new Error(errorCode);
          }

          // 返回用户信息
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user?.name || data.user.email,
            isAdmin: data.user?.isAdmin || false,
          };
        } catch (error: any) {
          // 使用错误处理器标准化错误
          const standardizedError = AuthErrorHandler.mapError(error);
          throw new Error(standardizedError.code);
        }
      },
    }),
  ],

  // 回调函数配置
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 初始登录时设置用户信息
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.isAdmin = (user as any).isAdmin || false;
      }

      // 会话更新时的处理
      if (trigger === 'update' && session) {
        token.isAdmin = session.isAdmin;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        (session.user as any).isAdmin = token.isAdmin as boolean;

        // 同步到全局状态管理器
        if (token.isAdmin) {
          authStateManager.setAuthenticated(
            {
              id: token.id as string,
              email: token.email as string,
            } as any,
            true,
            ['admin'],
            null
          );
        }
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // 允许相对路径重定向
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // 允许回调URL重定向
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  // 事件处理
  events: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async signIn({ user, account, profile, isNewUser }) {
      console.info('用户登录:', user.email);
      // 可以在这里记录登录事件或执行其他逻辑
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async signOut({ session, token }) {
      console.info('用户登出:', token?.email);
      // 清理全局状态
      authStateManager.setUnauthenticated();
    },

    async createUser({ user }) {
      console.info('新用户创建', user.email);
    },
  },

  // 页面配置
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/auth/error', // 错误页面
  },

  // 会话配置
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30天
    updateAge: 24 * 60 * 60, // 24小时更新一次
  },

  // JWT配置
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30天
  },

  // 调试模式
  debug: process.env.NODE_ENV === 'development',

  // 主题配置
  theme: {
    colorScheme: 'auto',
    logo: '/logo.png', // 如果有logo的话
  },
};

// 导出配置给API路由使用
export default NextAuth(authOptions);
