/**
 * 租户验证中间? * 确保用户只能访问自己所属租户的数据
 */

import { createClient } from '@supabase/supabase-js';

// 创建 Supabase 客户端（用于中间件验证）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * 租户权限验证中间? * @param options 配置选项
 */
export function requireTenant(
  options: {
    tenantField?: string;
    errorCode?: number;
    errorMessage?: string;
  } = {}
) {
  const {
    tenantField = 'tenant_id',
    errorCode = 403,
    errorMessage = '租户访问受限',
  } = options;

  return async function (req: Request, res: Response) {
    try {
      // 从请求头?cookie 获取认证信息
      const authHeader = req.headers.get('authorization');
      const cookieHeader = req.headers.get('cookie');

      if (!authHeader && !cookieHeader) {
        return {
          success: false,
          error: '用户未认?,
          status: 401,
        };
      }

      // 验证用户身份（简化实现）
      let userId: string | null = null;

      // �?cookie 中提取用户信息（实际项目中应该更安全地处理）
      if (cookieHeader) {
        const sessionMatch = cookieHeader.match(/sb-access-token=([^;]+)/);
        if (sessionMatch) {
          try {
            const {
              data: { user },
              error,
            } = await supabase.auth.getUser(sessionMatch[1]);
            if (!error && user) {
              userId = user.id;
            }
          } catch (authError) {
            console.error('认证验证失败:', authError);
          }
        }
      }

      if (!userId) {
        return {
          success: false,
          error: '用户身份验证失败',
          status: 401,
        };
      }

      // 从请求中获取目标租户ID
      let targetTenantId: string | null = null;

      // 从不同来源获取租户ID
      if (req.method === 'GET') {
        const url = new URL(req.url);
        targetTenantId = url.searchParams.get(tenantField);
      } else {
        try {
          const body = await req.json();
          targetTenantId = body[tenantField];
        } catch (parseError) {
          // 如果无法解析 JSON，继续处?        }
      }

      // 如果没有指定租户ID，尝试从 cookie 获取当前租户
      if (!targetTenantId) {
        const cookieHeader = req.headers.get('cookie');
        if (cookieHeader) {
          const tenantMatch = cookieHeader.match(/current-tenant-id=([^;]+)/);
          if (tenantMatch) {
            targetTenantId = tenantMatch[1];
          }
        }
      }

      // 如果仍然没有租户ID，拒绝访?      if (!targetTenantId) {
        return {
          success: false,
          error: '未指定租户信?,
          status: errorCode,
        };
      }

      // 验证用户是否属于该租?      const { data: userTenant, error: tenantError } = await supabase
        .from('user_tenants')
        .select('id, tenant_id, role, is_active')
        .eq('user_id', userId)
        .eq('tenant_id', targetTenantId)
        .eq('is_active', true)
        .single();

      if (tenantError || !userTenant) {
        return {
          success: false,
          error: errorMessage,
          status: errorCode,
          details: {
            user_id: userId,
            requested_tenant: targetTenantId,
            reason: '用户不属于该租户或租户关联已停用',
          },
        };
      }

      // 验证通过，返回用户租户信?      return {
        success: true,
        userTenant: {
          userId,
          tenantId: targetTenantId,
          role: userTenant.role,
          isActive: userTenant.is_active,
        },
      };
    } catch (error: any) {
      console.error('租户验证中间件错?', error);
      return {
        success: false,
        error: '服务器内部错?,
        status: 500,
        details: error.message,
      };
    }
  };
}

/**
 * 应用租户过滤到查询条? * @param queryOptions 原始查询条件
 * @param tenantField 租户字段? * @param tenantId 租户ID
 */
export function applyTenantFilter(
  queryOptions: any = {},
  tenantField: string = 'tenant_id',
  tenantId: string
): any {
  return {
    ...queryOptions,
    where: {
      ...(queryOptions.where || {}),
      [tenantField]: tenantId,
    },
  };
}

/**
 * 获取当前用户的租户上下文
 * @param req 请求对象
 */
export async function getUserTenantContext(req: Request): Promise<{
  success: boolean;
  userId?: string;
  tenantId?: string;
  role?: string;
  error?: string;
}> {
  try {
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) {
      return { success: false, error: '未找到认证信? };
    }

    // 获取用户ID
    const sessionMatch = cookieHeader.match(/sb-access-token=([^;]+)/);
    if (!sessionMatch) {
      return { success: false, error: '未找到会话信? };
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionMatch[1]);
    if (authError || !user) {
      return { success: false, error: '用户认证失败' };
    }

    // 获取租户ID
    const tenantMatch = cookieHeader.match(/current-tenant-id=([^;]+)/);
    if (!tenantMatch) {
      return { success: false, error: '未找到租户信? };
    }

    const tenantId = tenantMatch[1];

    // 验证租户关联
    const { data: userTenant, error: tenantError } = await supabase
      .from('user_tenants')
      .select('role, is_active')
      .eq('user_id', user.id)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .single();

    if (tenantError || !userTenant) {
      return { success: false, error: '用户与租户关联验证失? };
    }

    return {
      success: true,
      userId: user.id,
      tenantId,
      role: userTenant.role,
    };
  } catch (error: any) {
    return {
      success: false,
      error: `获取租户上下文失? ${error.message}`,
    };
  }
}

// 导出类型定义
export interface TenantContext {
  userId: string;
  tenantId: string;
  role: string;
  isActive: boolean;
}

export interface TenantValidationResult {
  success: boolean;
  userTenant?: TenantContext;
  error?: string;
  status?: number;
  details?: any;
}
