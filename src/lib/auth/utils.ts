/**
 * 服务端认证工具函数
 * 用于 API 路由中获取和验证用户信息
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
  user_metadata?: Record<string, any>;
}

/**
 * 从请求中获取认证用户信息
 * @param request Next.js 请求对象
 * @returns 认证用户信息，未登录返回 null
 */
export async function getAuthUser(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    // 获取 Cookie 名称
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const projectName = supabaseUrl.split('//')[1]?.split('.')[0] || 'procyc';
    const cookieName = `sb-${projectName}-auth-token`;

    // 获取认证 cookie
    const sessionCookie = request.cookies.get(cookieName)?.value;

    if (!sessionCookie) {
      console.warn('[getAuthUser] Cookie 不存在:', cookieName);
      return null;
    }

    // 解析 cookie 获取 session 数据
    let accessToken: string | null = null;
    try {
      const sessionData = JSON.parse(decodeURIComponent(sessionCookie));
      accessToken = sessionData.access_token;
    } catch (parseError) {
      console.warn('[getAuthUser] Cookie 解析失败');
      return null;
    }

    if (!accessToken) {
      console.warn('[getAuthUser] Access Token 不存在');
      return null;
    }

    // 创建 Supabase 客户端
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseAnonKey) {
      console.warn('[getAuthUser] Supabase 未配置');
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 验证令牌并获取用户信息
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.warn('[getAuthUser] 用户认证失败:', error?.message);
      return null;
    }

    // 返回用户信息
    return {
      id: user.id,
      email: user.email || '',
      role: user.user_metadata?.role,
      user_metadata: user.user_metadata,
    };
  } catch (error) {
    console.error('[getAuthUser] 获取用户信息异常:', error);
    return null;
  }
}
