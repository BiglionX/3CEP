/**
 * 统一操作反馈 Hook
 * 封装常用的异步操作反馈逻辑，包括加载状态、成功/错误提示
 */

'use client';

import { useToast } from '@/components/feedback-system';
import { useCallback, useState } from 'react';

export interface UseOperationOptions {
  /** 成功消息 */
  successMessage?: string;
  /** 错误消息 */
  errorMessage?: string;
  /** 是否显示 Toast 提示 */
  showToast?: boolean;
  /** 自定义成功回调 */
  onSuccess?: (result: any) => void;
  /** 自定义错误回调 */
  onError?: (error: Error) => void;
}

export interface UseOperationReturn<T = any> {
  /** 执行操作的函数 */
  execute: (operation: () => Promise<T>) => Promise<T | null>;
  /** 是否在加载中 */
  isLoading: boolean;
  /** 重置加载状态 */
  reset: () => void;
  /** 手动设置加载状态 */
  setLoading: (loading: boolean) => void;
}

/**
 * 统一操作反馈 Hook
 * @param options - 配置选项
 * @returns 操作执行器和状态
 */
export function useOperation<T = any>(
  options: UseOperationOptions = {}
): UseOperationReturn<T> {
  const {
    successMessage = '操作成功',
    errorMessage = '操作失败',
    showToast = true,
    onSuccess,
    onError,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  /**
   * 执行异步操作
   * @param operation - 返回 Promise 的操作函数
   * @returns 操作结果，如果失败则返回 null
   */
  const execute = useCallback(
    async (operation: () => Promise<T>): Promise<T | null> => {
      setIsLoading(true);

      try {
        const result = await operation();

        // 显示成功提示
        if (showToast) {
          toast.success(successMessage);
        }

        // 调用成功回调
        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : errorMessage;

        // 显示错误提示
        if (showToast) {
          toast.error(errorMsg || errorMessage);
        }

        // 调用错误回调
        if (onError) {
          onError(error as Error);
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [successMessage, errorMessage, showToast, onSuccess, onError, toast]
  );

  /**
   * 重置加载状态
   */
  const reset = useCallback(() => {
    setIsLoading(false);
  }, []);

  /**
   * 手动设置加载状态
   */
  const setLoadingState = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return {
    execute,
    isLoading,
    reset,
    setLoading: setLoadingState,
  };
}

/**
 * 批量操作 Hook
 * 用于处理批量操作的反馈
 */
export interface UseBatchOperationOptions extends UseOperationOptions {
  /** 单项失败时是否继续 */
  continueOnError?: boolean;
  /** 进度更新回调 */
  onProgress?: (completed: number, total: number, currentResult: any) => void;
}

export interface BatchOperationResult<T> {
  item: T;
  success: boolean;
  error?: Error;
}

export function useBatchOperation<T = any>(
  options: UseBatchOperationOptions = {}
) {
  const {
    successMessage = '批量操作完成',
    errorMessage = '批量操作失败',
    showToast = true,
    continueOnError = true,
    onProgress,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const toast = useToast();

  const executeBatch = useCallback(
    async (
      items: T[],
      operation: (item: T, index: number) => Promise<any>
    ): Promise<BatchOperationResult<T>[]> => {
      setIsLoading(true);
      setProgress({ completed: 0, total: items.length });

      const results: BatchOperationResult<T>[] = [];
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < items.length; i++) {
        try {
          await operation(items[i], i);
          results.push({ item: items[i], success: true });
          successCount++;
        } catch (error) {
          results.push({
            item: items[i],
            success: false,
            error: error as Error,
          });
          errorCount++;

          // 如果不继续，则抛出错误
          if (!continueOnError) {
            throw error;
          }
        }

        // 更新进度
        const newCompleted = i + 1;
        setProgress({ completed: newCompleted, total: items.length });

        if (onProgress) {
          onProgress(newCompleted, items.length, results[results.length - 1]);
        }
      }

      // 显示总结提示
      if (showToast) {
        if (errorCount === 0) {
          toast.success(`${successMessage} (${successCount}/${items.length})`);
        } else if (successCount > 0) {
          toast.warning(
            `部分成功：成功 ${successCount} 项，失败 ${errorCount} 项`,
            {
              duration: 8000,
            }
          );
        } else {
          toast.error(`${errorMessage} (${errorCount}/${items.length})`);
        }
      }

      setIsLoading(false);
      return results;
    },
    [
      successMessage,
      errorMessage,
      showToast,
      continueOnError,
      onProgress,
      toast,
    ]
  );

  return {
    executeBatch,
    isLoading,
    progress,
    reset: () => {
      setIsLoading(false);
      setProgress({ completed: 0, total: 0 });
    },
  };
}
