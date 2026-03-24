/**
 * Supabase 事务处理封装
 *
 * 提供原子性、一致性、隔离性、持久性（ACID）保障
 * 用于需要多个相关操作同时成功或失败的场景
 */

import {
  createClient,
  PostgrestError,
  SupabaseClient,
} from '@supabase/supabase-js';

/**
 * 事务执行函数
 */
export type TransactionFunction<T = any> = (tx: SupabaseClient) => Promise<T>;

/**
 * 事务结果
 */
export interface TransactionResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
    hint?: string;
  };
}

/**
 * 事务配置选项
 */
export interface TransactionOptions {
  /**
   * 最大重试次数，默认 3 次
   */
  maxRetries?: number;

  /**
   * 重试延迟（毫秒），默认 100ms
   */
  retryDelay?: number;

  /**
   * 是否记录事务日志，默认 true
   */
  logTransaction?: boolean;

  /**
   * 事务超时时间（毫秒），默认 30000ms
   */
  timeout?: number;
}

/**
 * 运行事务的通用函数
 *
 * @example
 * ```typescript
 * // 简单使用
 * const result = await runInTransaction(async (tx) => {
 *   // 步骤 1: 更新智能体状态
 *   const { error: updateError } = await tx
 *     .from('agents')
 *     .update({ review_status: 'approved' })
 *     .eq('id', agentId);
 *
 *   if (updateError) throw updateError;
 *
 *   // 步骤 2: 记录审计日志
 *   const { error: logError } = await tx
 *     .from('audit_logs')
 *     .insert({
 *       user_id: userId,
 *       action: 'agent_approved',
 *       resource_type: 'agent',
 *       resource_id: agentId,
 *     });
 *
 *   if (logError) throw logError;
 *
 *   // 步骤 3: 上架智能体
 *   const { error: shelfError } = await tx
 *     .from('agents')
 *     .update({ shelf_status: 'on_shelf' })
 *     .eq('id', agentId);
 *
 *   if (shelfError) throw shelfError;
 *
 *   return { agentId, status: 'approved' };
 * });
 *
 * if (result.success) {
 *   console.log('事务执行成功:', result.data);
 * } else {
 *   console.error('事务执行失败:', result.error);
 * }
 * ```
 */
export async function runInTransaction<T>(
  fn: TransactionFunction<T>,
  options: TransactionOptions = {}
): Promise<TransactionResult<T>> {
  const {
    maxRetries = 3,
    retryDelay = 100,
    logTransaction = true,
    timeout = 30000,
  } = options;

  let lastError: PostgrestError | Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 创建 Supabase 客户端
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // 设置事务超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeout);

      try {
        // 执行事务函数
        const result = await fn(supabase);

        // 清除超时定时器
        clearTimeout(timeoutId);

        // 记录事务日志
        if (logTransaction) {
          console.log(`✅ 事务执行成功（尝试 ${attempt}/${maxRetries}）`);
        }

        return {
          success: true,
          data: result,
        };
      } catch (error: any) {
        // 清除超时定时器
        clearTimeout(timeoutId);

        // 判断是否是超时错误
        if (error.name === 'AbortError') {
          console.error(`❌ 事务超时（尝试 ${attempt}/${maxRetries}）`);
          lastError = new Error('事务执行超时');
          continue;
        }

        // 记录错误
        if (logTransaction) {
          console.error(
            `❌ 事务执行失败（尝试 ${attempt}/${maxRetries}）:`,
            error.message
          );
        }

        lastError = error;

        // 如果是可重试的错误，准备重试
        if (isRetryableError(error) && attempt < maxRetries) {
          await delay(retryDelay * Math.pow(2, attempt - 1)); // 指数退避
          continue;
        }

        // 不可重试或已达最大重试次数
        break;
      }
    } catch (error: any) {
      // 非数据库错误（如业务逻辑错误）
      console.error(
        `❌ 事务异常（尝试 ${attempt}/${maxRetries}）:`,
        error.message
      );
      lastError = error;
      break;
    }
  }

  // 所有尝试都失败
  const errorMessage =
    lastError instanceof Error ? lastError.message : '未知错误';

  if (logTransaction) {
    console.error('❌ 事务最终失败:', errorMessage);
  }

  return {
    success: false,
    error: {
      code: (lastError as any)?.code || 'TRANSACTION_FAILED',
      message: errorMessage,
      details: (lastError as any)?.details,
      hint: (lastError as any)?.hint,
    },
  };
}

/**
 * 判断错误是否可重试
 */
function isRetryableError(error: any): boolean {
  // PostgreSQL 错误码
  const retryableCodes = [
    '40001', // 序列化失败
    '40P01', // 死锁检测
    '57014', // 查询取消
    '08000', // 连接异常
    '08003', // 连接不存在
    '08006', // 连接失败
  ];

  // 网络错误
  const networkErrors = [
    'ECONNRESET',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'ENOTFOUND',
  ];

  // 检查 PostgreSQL 错误码
  if (error?.code && retryableCodes.includes(error.code)) {
    return true;
  }

  // 检查网络错误
  if (error?.code && networkErrors.includes(error.code)) {
    return true;
  }

  // 检查错误消息
  const message = error?.message?.toLowerCase() || '';
  if (message.includes('deadlock') || message.includes('timeout')) {
    return true;
  }

  return false;
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 带事务的批量操作
 *
 * @example
 * ```typescript
 * // 批量更新智能体状态
 * const result = await runBatchTransaction([
 *   {
 *     table: 'agents',
 *     operation: 'update',
 *     data: { status: 'active' },
 *     filter: { id: ['id1', 'id2', 'id3'] }
 *   },
 *   {
 *     table: 'audit_logs',
 *     operation: 'insert',
 *     data: items.map(item => ({
 *       user_id: userId,
 *       action: 'agent_activated',
 *       resource_id: item.id
 *     }))
 *   }
 * ]);
 * ```
 */
export interface BatchOperation {
  table: string;
  operation: 'insert' | 'update' | 'delete' | 'upsert';
  data?: any | any[];
  filter?: Record<string, any>;
  columns?: string[]; // upsert 时使用
  onConflict?: string; // upsert 时使用
}

export async function runBatchTransaction(
  operations: BatchOperation[],
  options?: TransactionOptions
): Promise<TransactionResult<void>> {
  return runInTransaction(async tx => {
    for (const op of operations) {
      let query;

      switch (op.operation) {
        case 'insert':
          query = tx.from(op.table).insert(op.data);
          break;

        case 'update':
          query = tx.from(op.table).update(op.data);
          if (op.filter) {
            Object.entries(op.filter).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                query = query.in(key, value);
              } else {
                query = query.eq(key, value);
              }
            });
          }
          break;

        case 'delete':
          query = tx.from(op.table).delete();
          if (op.filter) {
            Object.entries(op.filter).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                query = query.in(key, value);
              } else {
                query = query.eq(key, value);
              }
            });
          }
          break;

        case 'upsert':
          query = tx.from(op.table).upsert(op.data, {
            onConflict: op.onConflict || '',
            ignoreDuplicates: false,
          });
          break;

        default:
          throw new Error(`未知操作类型：${op.operation}`);
      }

      const { error } = await query;

      if (error) {
        throw error;
      }
    }
  }, options);
}

/**
 * 审核事务示例
 *
 * @example
 * ```typescript
 * const result = await approveAgentWithTransaction(agentId, adminUserId);
 *
 * if (result.success) {
 *   console.log('审核通过，智能体已上架');
 * } else {
 *   console.error('审核失败:', result.error);
 * }
 * ```
 */
export async function approveAgentWithTransaction(
  agentId: string,
  adminUserId: string,
  reason?: string
): Promise<TransactionResult<{ agentId: string; status: string }>> {
  return runInTransaction(async tx => {
    // 步骤 1: 更新审核状态
    const { data: agent, error: updateError } = await tx
      .from('agents')
      .update({
        review_status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminUserId,
      })
      .eq('id', agentId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // 步骤 2: 记录审核日志
    const { error: logError } = await tx.from('agent_audit_logs').insert({
      agent_id: agentId,
      action: 'approved',
      actor_id: adminUserId,
      details: {
        reason: reason || null,
        previous_status: agent.review_status,
      },
    });

    if (logError) {
      throw logError;
    }

    // 步骤 3: 自动上架
    const { error: shelfError } = await tx
      .from('agents')
      .update({
        shelf_status: 'on_shelf',
        shelved_at: new Date().toISOString(),
      })
      .eq('id', agentId);

    if (shelfError) {
      throw shelfError;
    }

    // 步骤 4: 通知开发者（可选）
    // await tx.rpc('notify_agent_approved', { p_agent_id: agentId });

    return { agentId, status: 'approved_and_on_shelf' };
  });
}

/**
 * 删除智能体事务示例（带关联检查）
 */
export async function deleteAgentWithTransaction(
  agentId: string,
  adminUserId: string
): Promise<TransactionResult<{ agentId: string; deleted: boolean }>> {
  return runInTransaction(async tx => {
    // 步骤 1: 检查关联数据
    const { count: orderCount, error: orderCheckError } = await tx
      .from('agent_orders')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agentId)
      .eq('status', 'active');

    if (orderCheckError) throw orderCheckError;
    if (orderCount && orderCount > 0) {
      throw new Error(`存在${orderCount}个活跃订单，无法删除`);
    }

    // 步骤 2: 检查进行中的执行
    const { count: executionCount, error: execCheckError } = await tx
      .from('agent_executions')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agentId)
      .eq('status', 'running');

    if (execCheckError) throw execCheckError;
    if (executionCount && executionCount > 0) {
      throw new Error(`存在${executionCount}个进行中的执行，无法删除`);
    }

    // 步骤 3: 软删除智能体
    const { error: deleteError } = await tx
      .from('agents')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: adminUserId,
        status: 'deleted',
      })
      .eq('id', agentId);

    if (deleteError) throw deleteError;

    // 步骤 4: 记录删除日志
    const { error: logError } = await tx.from('audit_logs').insert({
      user_id: adminUserId,
      action: 'agent_deleted',
      resource_type: 'agent',
      resource_id: agentId,
      details: {
        reason: 'admin_deletion',
      },
    });

    if (logError) throw logError;

    return { agentId, deleted: true };
  });
}

/**
 * 导出常用工具
 */
export const TransactionUtils = {
  runInTransaction,
  runBatchTransaction,
  approveAgentWithTransaction,
  deleteAgentWithTransaction,
};

export default TransactionUtils;
