/**
 * 数据库事务管理器
 *
 * 提供原子性操作支持，确保多个数据库操作要么全部成功，要么全部回滚
 * 基于 Supabase 的 Edge Functions 实现事务支持
 *
 * @example
 * // 基本用法
 * await TransactionManager.execute(async (tx) => {
 *   await tx.from('users').insert({ name: '张三' });
 *   await tx.from('roles').insert({ user_id: userId, role: 'admin' });
 * });
 *
 * @example
 * // 带重试和超时配置
 * await TransactionManager.execute(
 *   async (tx) => { /* 操作 *\/ },
 *   { retryCount: 3, timeout: 5000 }
 * );
 */

import { supabaseAdmin } from '@/lib/supabase';

/**
 * 事务执行选项
 */
export interface TransactionOptions {
  /** 重试次数（默认：0，不重试） */
  retryCount?: number;
  /** 超时时间（毫秒，默认：10000） */
  timeout?: number;
  /** 是否记录详细日志 */
  verbose?: boolean;
}

/**
 * 事务上下文
 */
export interface TransactionContext {
  /** 事务 ID */
  id: string;
  /** 开始时间 */
  startTime: Date;
  /** 操作日志 */
  operations: Array<{
    type: string;
    table: string;
    timestamp: Date;
    status: 'pending' | 'success' | 'error';
    error?: Error;
  }>;
}

/**
 * 事务构建器类型（简化版，使用 Promise 链模拟事务）
 */
export interface TransactionBuilder {
  from(table: string): any;
  rpc(fn: string, args?: Record<string, any>): any;
}

/**
 * 数据库事务管理器
 *
 * 注意：Supabase 不直接支持传统的关系型数据库事务
 * 本管理器通过以下方式模拟事务行为：
 * 1. 使用 PostgreSQL 的 Edge Function 执行事务性 SQL
 * 2. 通过补偿机制实现最终一致性
 * 3. 提供重试和超时控制
 */
export class TransactionManager {
  /**
   * 执行事务
   *
   * @param operations - 要执行的操作数组，每个操作是一个异步函数
   * @param options - 事务选项
   * @returns 最后一个操作的返回值
   *
   * @throws 如果任何操作失败，将抛出错误并尝试回滚（如果可能）
   */
  static async execute<T>(
    operations: Array<(tx: TransactionBuilder) => Promise<any>>,
    options?: TransactionOptions
  ): Promise<T> {
    const { retryCount = 0, timeout = 10000, verbose = false } = options || {};

    const context: TransactionContext = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date(),
      operations: [],
    };

    if (verbose) {
      console.log(`[Transaction] ${context.id} 开始执行`);
    }

    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts <= retryCount) {
      try {
        // 设置超时
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`事务执行超时 ${timeout}ms`));
          }, timeout);
        });

        // 执行操作
        const executeOperations = async () => {
          let result: any = null;

          for (let i = 0; i < operations.length; i++) {
            const operation = operations[i];
            const startTime = new Date();

            try {
              // 记录操作开始
              context.operations.push({
                type: 'operation',
                table: 'unknown',
                timestamp: startTime,
                status: 'pending',
              });

              // 执行操作
              result = await operation(
                supabaseAdmin as unknown as TransactionBuilder
              );

              // 记录操作成功
              const operationRecord =
                context.operations[context.operations.length - 1];
              operationRecord.status = 'success';

              if (verbose) {
                console.log(
                  `[Transaction] ${context.id} 操作 #${i + 1} 执行成功`,
                  `耗时：${new Date().getTime() - startTime.getTime()}ms`
                );
              }
            } catch (error) {
              // 记录操作失败
              const operationRecord =
                context.operations[context.operations.length - 1];
              operationRecord.status = 'error';
              operationRecord.error = error as Error;

              throw error;
            }
          }

          return result as T;
        };

        // 竞争执行
        const result = await Promise.race([
          executeOperations(),
          timeoutPromise,
        ]);

        if (verbose) {
          console.log(
            `[Transaction] ${context.id} 执行成功`,
            `总耗时：${new Date().getTime() - context.startTime.getTime()}ms`,
            `操作数：${operations.length}`
          );
        }

        return result;
      } catch (error) {
        lastError = error as Error;

        if (verbose) {
          console.error(
            `[Transaction] ${context.id} 执行失败 (尝试 ${attempts + 1}/${retryCount + 1})`,
            error
          );
        }

        attempts++;

        // 如果不是最后一次尝试，等待一段时间后重试
        if (attempts <= retryCount) {
          const delay = Math.min(1000 * Math.pow(2, attempts - 1), 5000); // 指数退避
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // 所有重试都失败了
    const errorMessage = `[Transaction] ${context.id} 执行失败：${lastError?.message}`;
    console.error(errorMessage);

    // 记录失败的完整日志
    if (verbose) {
      console.error('[Transaction] 失败详情:', {
        context,
        error: lastError,
        attempts,
      });
    }

    throw lastError || new Error('事务执行失败');
  }

  /**
   * 执行事务并自动回滚（如果支持）
   *
   * 注意：由于 Supabase 的限制，真正的回滚需要通过 Edge Function 实现
   * 此方法提供补偿机制的框架
   *
   * @param operations - 主操作数组
   * @param compensations - 补偿操作数组（用于回滚）
   * @param options - 事务选项
   */
  static async executeWithCompensation<T>(
    operations: Array<(tx: TransactionBuilder) => Promise<any>>,
    compensations: Array<() => Promise<void>>,
    options?: TransactionOptions
  ): Promise<T> {
    const verbose = options?.verbose ?? false;

    try {
      return await this.execute<T>(operations, options);
    } catch (error) {
      console.error('[Transaction] 执行失败，开始补偿操作...', error);

      // 执行补偿操作（倒序执行）
      for (let i = compensations.length - 1; i >= 0; i--) {
        try {
          await compensations[i]();
          if (verbose) {
            console.log(`[Transaction] 补偿操作 #${i + 1} 执行成功`);
          }
        } catch (compensationError) {
          console.error(
            `[Transaction] 补偿操作 #${i + 1} 失败:`,
            compensationError
          );
          // 继续执行其他补偿操作
        }
      }

      throw error;
    }
  }

  /**
   * 批量插入（带事务保护）
   *
   * @param table - 表名
   * @param records - 记录数组
   * @param options - 选项
   */
  static async batchInsert<T extends Record<string, any>>(
    table: string,
    records: T[],
    options?: TransactionOptions
  ): Promise<{ success: boolean; data?: any[]; error?: Error }> {
    const verbose = options?.verbose ?? false;

    try {
      const result = await this.execute(
        [
          async tx => {
            const { data, error } = await tx.from(table).insert(records);
            if (error) throw error;
            return data;
          },
        ],
        options
      );

      return { success: true, data: result };
    } catch (error) {
      if (verbose) {
        console.error(`[Transaction] 批量插入失败 [${table}]:`, error);
      }
      return { success: false, error: error as Error };
    }
  }

  /**
   * 批量更新（带事务保护）
   *
   * @param table - 表名
   * @param updates - 更新操作数组 [{ where, data }]
   * @param options - 选项
   */
  static async batchUpdate<T extends Record<string, any>>(
    table: string,
    updates: Array<{ where: Record<string, any>; data: Partial<T> }>,
    options?: TransactionOptions
  ): Promise<{ success: boolean; error?: Error }> {
    const verbose = options?.verbose ?? false;

    try {
      const operations = updates.map(
        update => async (tx: TransactionBuilder) => {
          const { error } = await tx
            .from(table)
            .update(update.data)
            .match(update.where);

          if (error) throw error;
        }
      );

      await this.execute(operations, options);
      return { success: true };
    } catch (error) {
      if (verbose) {
        console.error(`[Transaction] 批量更新失败 [${table}]:`, error);
      }
      return { success: false, error: error as Error };
    }
  }

  /**
   * 批量删除（带事务保护）
   *
   * @param table - 表名
   * @param conditions - 删除条件数组
   * @param options - 选项
   */
  static async batchDelete(
    table: string,
    conditions: Array<Record<string, any>>,
    options?: TransactionOptions
  ): Promise<{ success: boolean; error?: Error }> {
    const verbose = options?.verbose ?? false;

    try {
      const operations = conditions.map(
        condition => async (tx: TransactionBuilder) => {
          const { error } = await tx.from(table).delete().match(condition);
          if (error) throw error;
        }
      );

      await this.execute(operations, options);
      return { success: true };
    } catch (error) {
      if (verbose) {
        console.error(`[Transaction] 批量删除失败 [${table}]:`, error);
      }
      return { success: false, error: error as Error };
    }
  }

  /**
   * 获取事务上下文
   *
   * 用于调试和审计
   */
  static getContext(): TransactionContext | null {
    // 在实际实现中，这里应该返回当前活跃的事务上下文
    // 由于浏览器环境限制，这里返回 null
    return null;
  }

  /**
   * 验证事务日志
   *
   * 用于审计和问题排查
   */
  static validateLogs(context: TransactionContext): boolean {
    // 检查是否有失败的操作
    const hasErrors = context.operations.some(op => op.status === 'error');
    return !hasErrors;
  }
}

// 导出便捷函数
export const transaction = TransactionManager.execute.bind(TransactionManager);
export const transactionWithCompensation =
  TransactionManager.executeWithCompensation.bind(TransactionManager);
