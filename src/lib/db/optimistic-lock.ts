/**
 * 乐观锁并发控制工具类
 *
 * 提供统一的乐观锁检查、冲突处理功能
 * 用于所有需要并发控制的 API 端点
 */

/**
 * 乐观锁检查结果
 */
export interface OptimisticLockResult<T> {
  success: boolean;
  data?: T;
  conflict?: {
    expectedVersion: number;
    currentVersion: number;
    message: string;
  };
}

/**
 * 乐观锁配置选项
 */
export interface OptimisticLockOptions {
  /** 重试次数（默认 0，不重试） */
  retries?: number;
  /** 重试延迟毫秒数（默认 100ms） */
  retryDelay?: number;
  /** 自定义冲突错误消息 */
  conflictMessage?: string;
}

/**
 * 乐观锁工具类
 */
export class OptimisticLockManager {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  /**
   * 执行带乐观锁的更新操作
   *
   * @param table 表名
   * @param id 记录 ID
   * @param updateData 更新数据（不包含 version）
   * @param currentVersion 当前版本号
   * @param options 配置选项
   *
   * @example
   * ```typescript
   * const result = await lockManager.updateWithOptimisticLock(
   *   'agents',
   *   agentId,
   *   { review_status: 'approved' },
   *   currentVersion
   * );
   *
   * if (!result.success) {
   *   throw new Error(result.conflict?.message);
   * }
   * ```
   */
  async updateWithOptimisticLock<T = any>(
    table: string,
    id: string,
    updateData: Record<string, any>,
    currentVersion: number,
    options: OptimisticLockOptions = {}
  ): Promise<OptimisticLockResult<T>> {
    const { retries = 0, retryDelay = 100, conflictMessage } = options;

    // 默认冲突消息
    const defaultMessage = `数据已被其他管理员修改，请刷新后重试`;
    const message = conflictMessage || defaultMessage;

    let lastError: any = null;

    // 尝试执行更新（包括重试）
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // 如果有多次重试，添加延迟
        if (attempt > 0 && retryDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }

        // 执行带乐观锁条件的更新
        const { data, error } = await this.supabase
          .from(table)
          .update({
            ...updateData,
            version: currentVersion + 1,
          })
          .eq('id', id)
          .eq('version', currentVersion) // 乐观锁条件
          .select()
          .single();

        // 检查是否成功
        if (error) {
          lastError = error;
          continue;
        }

        // 如果没有返回数据，说明版本号不匹配（并发冲突）
        if (!data) {
          // 获取当前最新版本号
          const { data: latest } = await this.supabase
            .from(table)
            .select('version')
            .eq('id', id)
            .single();

          return {
            success: false,
            conflict: {
              expectedVersion: currentVersion,
              currentVersion: latest?.version || currentVersion + 1,
              message,
            },
          };
        }

        // 更新成功
        return {
          success: true,
          data: data as T,
        };
      } catch (error: any) {
        lastError = error;
        // 继续下一次重试
      }
    }

    // 所有尝试都失败
    return {
      success: false,
      conflict: {
        expectedVersion: currentVersion,
        currentVersion: -1,
        message: lastError?.message || message,
      },
    };
  }

  /**
   * 检查并获取当前版本号
   *
   * @param table 表名
   * @param id 记录 ID
   *
   * @returns 当前版本号，如果记录不存在返回 null
   */
  async getCurrentVersion(table: string, id: string): Promise<number | null> {
    const { data } = await this.supabase
      .from(table)
      .select('version')
      .eq('id', id)
      .single();

    return data?.version ?? null;
  }

  /**
   * 批量执行带乐观锁的更新（适用于批量操作）
   *
   * @param table 表名
   * @param updates 更新列表 [{ id, version, data }]
   * @param options 配置选项
   *
   * @returns 每个更新的结果数组
   */
  async batchUpdateWithOptimisticLock<T = any>(
    table: string,
    updates: Array<{
      id: string;
      version: number;
      data: Record<string, any>;
    }>,
    options: OptimisticLockOptions = {}
  ): Promise<Array<OptimisticLockResult<T>>> {
    const results: Array<OptimisticLockResult<T>> = [];

    for (const update of updates) {
      const result = await this.updateWithOptimisticLock<T>(
        table,
        update.id,
        update.data,
        update.version,
        options
      );
      results.push(result);
    }

    return results;
  }

  /**
   * 格式化乐观锁冲突错误响应
   *
   * @param conflict 冲突信息
   * @param path API 路径
   * @param requestId 请求 ID
   *
   * @returns 统一的错误响应格式
   */
  formatConflictResponse(
    conflict: {
      expectedVersion: number;
      currentVersion: number;
      message: string;
    },
    path: string,
    requestId: string
  ) {
    return {
      success: false,
      error: {
        code: 'OPTIMISTIC_LOCK_CONFLICT',
        message: conflict.message,
        details: {
          expectedVersion: conflict.expectedVersion,
          currentVersion: conflict.currentVersion,
          hint: '请刷新页面获取最新数据后重试',
        },
        timestamp: new Date().toISOString(),
        path,
        requestId,
      },
    };
  }
}

/**
 * 快捷辅助函数：检查是否为乐观锁冲突错误
 */
export function isOptimisticLockConflict(error: any): boolean {
  return (
    error?.code === 'PGRST119' || // Supabase 乐观锁错误码
    error?.message?.includes('已存在') ||
    error?.details?.code === 'OPTIMISTIC_LOCK_CONFLICT'
  );
}

/**
 * 快捷辅助函数：获取友好的冲突提示消息
 */
export function getConflictMessage(error: any): string {
  if (isOptimisticLockConflict(error)) {
    return (
      error?.details?.message ||
      error?.message ||
      '数据已被其他管理员修改，请刷新后重试'
    );
  }
  return error?.message || '操作失败，请重试';
}
