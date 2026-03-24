/**
 * API 权限验证中间件
 *
 * 提供统一的 API 层权限验证和租户隔离功能
 *
 * @module tech/middleware/api-permission.middleware
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 用户信息接口
 */
interface UserInfo {
  id: string;
  email: string;
  roles: string[];
  tenantId?: string;
  [key: string]: any;
}

/**
 * 从 JWT Token 中获取当前用户信息
 *
 * @param req - Next.js 请求对象
 * @returns 用户信息，未认证则返回 null
 */
async function getCurrentUser(req: NextRequest): Promise<UserInfo | null> {
  try {
    // 从 Authorization header 获取 token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');

    // 使用 Supabase 验证 token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    // 提取用户信息和角色
    const roles = user.user_metadata?.roles || ['user'];
    const tenantId = user.user_metadata?.tenant_id || 'default-tenant';

    return {
      id: user.id,
      email: user.email || '',
      roles,
      tenantId,
      ...user.user_metadata,
    };
  } catch (error) {
    console.error('获取当前用户失败:', error);
    return null;
  }
}

/**
 * 标准化的错误响应
 *
 * @param message - 错误消息
 * @param code - 错误代码
 * @param status - HTTP 状态码
 * @returns NextResponse 对象
 */
function createErrorResponse(
  message: string,
  code: string,
  status: number
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
    },
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * API 权限验证中间件主函数
 *
 * 使用方式:
 * ```typescript
 * export async function GET(req: NextRequest) {
 *   return apiPermissionMiddleware(req, async () => {
 *     // 你的业务逻辑
 *     return NextResponse.json({ data: [] });
 *   }, 'resource_read');
 * }
 * ```
 *
 * @param req - Next.js 请求对象
 * @param next - 下一个处理函数
 * @param requiredPermission - 需要的权限标识（可选）
 * @returns NextResponse 响应对象
 */
export async function apiPermissionMiddleware(
  req: NextRequest,
  next: () => Promise<NextResponse>,
  requiredPermission?: string
): Promise<NextResponse> {
  // 1. 获取并验证用户身份
  const user = await getCurrentUser(req);

  if (!user) {
    return createErrorResponse('未授权访问', 'UNAUTHORIZED', 401);
  }

  // 2. 如果需要权限检查
  if (requiredPermission) {
    // 超级管理员拥有所有权限
    if (!user.roles.includes('admin')) {
      // TODO: 这里应该调用权限管理器验证具体权限
      // 暂时简化处理：只要有角色就允许访问
      // 后续需要集成 PermissionManager

      // 从 RBAC 配置文件加载权限映射
      const rbacConfig = await loadRbacConfig();
      const hasPermission = checkPermission(
        user.roles,
        requiredPermission,
        rbacConfig
      );

      if (!hasPermission) {
        return createErrorResponse('权限不足', 'FORBIDDEN', 403);
      }
    }
  }

  // 3. 执行下一个处理函数
  try {
    const response = await next();

    // 4. 注入租户 ID 到响应头
    if (user.tenantId) {
      response.headers.set('X-Tenant-ID', user.tenantId);
    }

    // 5. 添加 CORS 头（如果是跨域请求）
    const origin = req.headers.get('origin');
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    return response;
  } catch (error) {
    console.error('中间件处理错误:', error);

    return createErrorResponse(
      error instanceof Error ? error.message : '服务器内部错误',
      'INTERNAL_ERROR',
      500
    );
  }
}

/**
 * 加载 RBAC 配置
 *
 * @returns RBAC 配置对象
 */
async function loadRbacConfig(): Promise<any> {
  try {
    // 优先从 API 加载
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ''}/api/rbac/config`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );

    if (response.ok) {
      return await response.json();
    }

    // 降级到本地文件
    const configPath = path.resolve(process.cwd(), 'config/rbac.json');
    const fs = require('fs');
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    console.error('加载 RBAC 配置失败:', error);
    // 返回空配置
    return { role_permissions: {} };
  }
}

/**
 * 检查用户是否有指定权限
 *
 * @param roles - 用户角色列表
 * @param permission - 权限标识
 * @param rbacConfig - RBAC 配置
 * @returns 是否有权限
 */
function checkPermission(
  roles: string[],
  permission: string,
  rbacConfig: any
): boolean {
  // 检查每个角色的权限
  for (const role of roles) {
    const rolePermissions = rbacConfig.role_permissions?.[role] || [];

    // 直接匹配
    if (rolePermissions.includes(permission)) {
      return true;
    }

    // 通配符匹配
    if (rolePermissions.includes('*')) {
      return true;
    }

    // 分类匹配 (例如 users_* 匹配 users_read, users_write 等)
    const wildcardPermissions = rolePermissions.filter((p: string) =>
      p.endsWith('_*')
    );
    for (const wildcard of wildcardPermissions) {
      const prefix = wildcard.slice(0, -1); // 去掉 *
      if (permission.startsWith(prefix)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 导出工具函数
 */
export { checkPermission, createErrorResponse, getCurrentUser };
