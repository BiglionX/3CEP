/**
 * Cookie 工具函数
 * 提供统一的 cookie 名称生成和解析逻辑
 */

/**
 * 从 Supabase URL 提取项目名称
 * @param supabaseUrl Supabase URL
 * @returns 项目名称，默认为 'procyc'
 */
export function extractProjectName(supabaseUrl?: string): string {
  if (!supabaseUrl) {
    return 'procyc';
  }

  try {
    const url = new URL(supabaseUrl);
    // 从 hostname 提取项目名称
    // 例如：hrjqzbhqueleszkvnsen.supabase.co -> hrjqzbhqueleszkvnsen
    const hostname = url.hostname;
    const parts = hostname.split('.');

    if (parts.length >= 2 && parts[1] === 'supabase') {
      return parts[0];
    }

    // 如果是自定义域名，返回整个 hostname
    return hostname;
  } catch (error) {
    console.warn('[extractProjectName] URL 解析失败:', error);
    return 'procyc';
  }
}

/**
 * 生成 Supabase 认证 cookie 名称
 * @param supabaseUrl Supabase URL（可选）
 * @returns Cookie 名称，格式：sb-{projectName}-auth-token
 */
export function getAuthCookieName(supabaseUrl?: string): string {
  const projectName = extractProjectName(supabaseUrl);
  return `sb-${projectName}-auth-token`;
}

/**
 * 生成 Supabase session cookie 名称
 * @param supabaseUrl Supabase URL（可选）
 * @returns Session cookie 名称，格式：sb-{projectName}-auth-token
 */
export function getSessionCookieName(supabaseUrl?: string): string {
  return getAuthCookieName(supabaseUrl);
}

/**
 * 解析 cookie 中的 session 数据
 * @param cookieValue Cookie 值
 * @returns Session 数据对象
 */
export function parseSessionCookie(cookieValue: string | undefined): {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  user?: any;
} | null {
  if (!cookieValue) {
    return null;
  }

  try {
    const sessionData = JSON.parse(decodeURIComponent(cookieValue));
    return sessionData;
  } catch (error) {
    console.error('[parseSessionCookie] Cookie 解析失败:', error);
    return null;
  }
}

/**
 * 序列化 session 数据为 cookie 值
 * @param session Session 数据
 * @returns Cookie 值
 */
export function serializeSessionCookie(session: any): string {
  return encodeURIComponent(JSON.stringify(session));
}

/**
 * 获取默认的 Supabase URL
 * @returns Supabase URL
 */
export function getDefaultSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

/**
 * 验证环境变量配置是否完整
 * @returns 验证结果
 */
export function validateEnvConfig(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 必需的环境变量
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`缺少必需的环境变量：${varName}`);
    }
  }

  // 可选但推荐的环境变量
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    warnings.push('缺少 SUPABASE_SERVICE_ROLE_KEY，某些管理员功能可能无法使用');
  }

  // 验证 Supabase URL 格式
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      new URL(supabaseUrl);
    } catch (error) {
      errors.push(`NEXT_PUBLIC_SUPABASE_URL 格式不正确：${supabaseUrl}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
