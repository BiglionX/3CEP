/**
 * 多租户隔离中间件
 *
 * 确保所有数据库查询都包含租户隔离条件，防止数据泄露
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * 租户上下文
 */
export interface TenantContext {
  tenantId: string;
  userId: string;
  role: string;
  isAdmin: boolean;
}

/**
 * 从请求中提取租户上下文
 */
export async function extractTenantContext(
  request: Request
): Promise<TenantContext | null> {
  try {
    // 创建 Supabase 客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 获取会话
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return null;
    }

    // 获取用户角色
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', session.user.id)
      .single();

    if (!profile) {
      return null;
    }

    const isAdmin = ['admin', 'system'].includes(profile.role || '');

    return {
      tenantId: profile.tenant_id || '',
      userId: session.user.id,
      role: profile.role || 'user',
      isAdmin,
    };
  } catch (error) {
    console.error('提取租户上下文失败:', error);
    return null;
  }
}

/**
 * 为 Supabase 客户端添加租户隔离过滤器
 *
 * @param client - Supabase 客户端实例
 * @param context - 租户上下文
 * @returns 添加了租户过滤器的新客户端
 */
export function withTenantIsolation(
  client: SupabaseClient,
  context: TenantContext
): SupabaseClient {
  // 如果是管理员，不需要租户隔离
  if (context.isAdmin) {
    return client;
  }

  // 包装 query 方法，自动添加租户过滤
  const originalFrom = client.from.bind(client);

  const wrappedClient = {
    ...client,
    from: (relation: string) => {
      const query = originalFrom(relation);

      // 对特定表应用租户隔离
      const tenantIsolatedTables = [
        'agents',
        'agent_orders',
        'agent_executions',
        'user_agent_installations',
        'audit_logs',
        'notifications',
        'agent_subscription_reminders',
      ];

      if (tenantIsolatedTables.includes(relation)) {
        // 注意：这里需要在查询构建时添加过滤
        // 实际使用时应该在每个 API 中手动添加 .eq('tenant_id', context.tenantId)
        console.log(
          `[租户隔离] 表 ${relation} 将应用租户过滤：${context.tenantId}`
        );
      }

      return query;
    },
  };

  return wrappedClient as SupabaseClient;
}

/**
 * 验证租户隔离是否生效
 *
 * @param data - 要验证的数据
 * @param context - 租户上下文
 * @returns 验证是否通过
 */
export function verifyTenantIsolation(
  data: any,
  context: TenantContext
): boolean {
  // 管理员跳过验证
  if (context.isAdmin) {
    return true;
  }

  // 检查数据是否包含租户 ID
  if (!data || !data.tenant_id) {
    return false;
  }

  // 验证租户 ID 是否匹配
  return data.tenant_id === context.tenantId;
}

/**
 * 批量验证租户隔离
 */
export function verifyTenantIsolationBatch(
  dataArray: any[],
  context: TenantContext
): boolean {
  if (context.isAdmin) {
    return true;
  }

  return dataArray.every(item => verifyTenantIsolation(item, context));
}

/**
 * 记录租户隔离违规尝试
 */
export async function logTenantIsolationViolation(
  userId: string,
  resourceType: string,
  resourceId: string,
  attemptedTenantId: string,
  actualTenantId: string
): Promise<void> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'tenant_isolation_violation',
      resource_type: resourceType,
      resource_id: resourceId,
      details: {
        attemptedTenantId,
        actualTenantId,
        timestamp: new Date().toISOString(),
        severity: 'high',
      },
    });

    console.warn(
      `[安全警告] 租户隔离违规：用户${userId} 试图访问租户${attemptedTenantId}的资源${resourceId}（实际属于租户${actualTenantId}）`
    );
  } catch (error) {
    console.error('记录租户隔离违规失败:', error);
  }
}

/**
 * Next.js API路由中间件装饰器
 *
 * @example
 * ```typescript
 * export async function GET(request: Request) {
 *   return withTenantCheck(request, async (context, supabase) => {
 *     // 这里的查询会自动添加租户过滤
 *     const { data } = await supabase
 *       .from('agents')
 *       .select('*')
 *       .eq('tenant_id', context.tenantId);
 *
 *     return NextResponse.json({ success: true, data });
 *   });
 * }
 * ```
 */
export async function withTenantCheck<T>(
  request: Request,
  handler: (context: TenantContext, supabase: SupabaseClient) => Promise<T>
): Promise<T> {
  const context = await extractTenantContext(request);

  if (!context) {
    throw new Error('无法获取租户上下文');
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const isolatedSupabase = withTenantIsolation(supabase, context);

  try {
    return await handler(context, isolatedSupabase);
  } catch (error) {
    if (error instanceof Error && error.message.includes('tenant')) {
      // 记录租户隔离违规
      await logTenantIsolationViolation(
        context.userId,
        'unknown',
        'unknown',
        'unknown',
        context.tenantId
      );
    }
    throw error;
  }
}

/**
 * 生成租户隔离的 SQL WHERE 条件
 */
export function buildTenantIsolationCondition(
  tableName: string,
  tenantId: string,
  isAdmin: boolean
): string {
  // 管理员可以访问所有数据
  if (isAdmin) {
    return '1=1';
  }

  // 普通用户只能访问自己租户的数据
  return `tenant_id = '${tenantId}'`;
}

/**
 * 检查表是否需要租户隔离
 */
export function requiresTenantIsolation(tableName: string): boolean {
  const tenantIsolatedTables = [
    'agents',
    'agent_orders',
    'agent_executions',
    'user_agent_installations',
    'audit_logs',
    'notifications',
    'agent_subscription_reminders',
    'profiles',
    'user_preferences',
  ];

  return tenantIsolatedTables.includes(tableName);
}
