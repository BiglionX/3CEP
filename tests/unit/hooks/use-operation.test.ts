/**
 * 统一操作反馈 Hook 单元测试
 */

import { useBatchOperation, useOperation } from '@/hooks/use-operation';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock toast
vi.mock('@/components/feedback-system', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
  }),
}));

describe('useOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功执行异步操作并显示成功提示', async () => {
    const mockOperation = vi.fn().mockResolvedValue('success');
    const { result } = renderHook(() =>
      useOperation({
        successMessage: '操作成功',
        errorMessage: '操作失败',
      })
    );

    await act(async () => {
      const response = await result.current.execute(mockOperation);
      expect(response).toBe('success');
    });

    expect(result.current.isLoading).toBe(false);
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });

  it('应该在操作失败时显示错误提示', async () => {
    const mockError = new Error('网络错误');
    const mockOperation = vi.fn().mockRejectedValue(mockError);
    const { result } = renderHook(() =>
      useOperation({
        successMessage: '操作成功',
        errorMessage: '操作失败',
      })
    );

    await act(async () => {
      const response = await result.current.execute(mockOperation);
      expect(response).toBeNull();
    });

    expect(result.current.isLoading).toBe(false);
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });

  it('应该正确管理加载状态', async () => {
    const mockOperation = vi
      .fn()
      .mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('success'), 100))
      );

    const { result } = renderHook(() =>
      useOperation({
        successMessage: '操作成功',
      })
    );

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.execute(mockOperation);
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('应该调用成功回调', async () => {
    const onSuccessMock = vi.fn();
    const mockOperation = vi.fn().mockResolvedValue({ id: 1, name: 'test' });

    const { result } = renderHook(() =>
      useOperation({
        successMessage: '成功',
        onSuccess: onSuccessMock,
      })
    );

    await act(async () => {
      await result.current.execute(mockOperation);
    });

    expect(onSuccessMock).toHaveBeenCalledWith({ id: 1, name: 'test' });
  });

  it('应该调用错误回调', async () => {
    const onErrorMock = vi.fn();
    const mockError = new Error('测试错误');
    const mockOperation = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() =>
      useOperation({
        errorMessage: '失败',
        onError: onErrorMock,
      })
    );

    await act(async () => {
      await result.current.execute(mockOperation);
    });

    expect(onErrorMock).toHaveBeenCalledWith(mockError);
  });

  it('当 showToast 为 false 时不应显示提示', async () => {
    const mockOperation = vi.fn().mockResolvedValue('success');
    const { result } = renderHook(() =>
      useOperation({
        showToast: false,
      })
    );

    await act(async () => {
      await result.current.execute(mockOperation);
    });

    expect(mockOperation).toHaveBeenCalled();
  });

  it('应该能够重置加载状态', async () => {
    const { result } = renderHook(() =>
      useOperation({
        successMessage: '成功',
      })
    );

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isLoading).toBe(false);
  });
});

describe('useBatchOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功执行批量操作', async () => {
    const items = [1, 2, 3];
    const mockOperation = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useBatchOperation({
        successMessage: '批量操作完成',
      })
    );

    await act(async () => {
      const results = await result.current.executeBatch(items, mockOperation);
      expect(results).toHaveLength(3);
      results.forEach((r: any) => expect(r.success).toBe(true));
    });

    expect(mockOperation).toHaveBeenCalledTimes(3);
    expect(result.current.isLoading).toBe(false);
  });

  it('应该继续执行即使有单项失败', async () => {
    const items = [1, 2, 3, 4];
    const mockOperation = vi
      .fn()
      .mockImplementationOnce(() => Promise.resolve())
      .mockImplementationOnce(() => Promise.reject(new Error('失败')))
      .mockImplementation(() => Promise.resolve());

    const { result } = renderHook(() =>
      useBatchOperation({
        continueOnError: true,
      })
    );

    await act(async () => {
      const results = await result.current.executeBatch(items, mockOperation);
      expect(results).toHaveLength(4);
      expect(results[1].success).toBe(false);
      expect(results.filter((r: any) => r.success)).toHaveLength(3);
    });
  });

  it('应该在遇到错误时停止执行', async () => {
    const items = [1, 2, 3];
    const mockOperation = vi
      .fn()
      .mockImplementationOnce(() => Promise.resolve())
      .mockImplementationOnce(() => Promise.reject(new Error('失败')));

    const { result } = renderHook(() =>
      useBatchOperation({
        continueOnError: false,
      })
    );

    await expect(
      act(async () => {
        await result.current.executeBatch(items, mockOperation);
      })
    ).rejects.toThrow('失败');

    expect(mockOperation).toHaveBeenCalledTimes(2);
  });

  it('应该正确更新进度', async () => {
    const items = [1, 2, 3, 4];
    const mockOperation = vi.fn().mockResolvedValue(undefined);
    const onProgressMock = vi.fn();

    const { result } = renderHook(() =>
      useBatchOperation({
        onProgress: onProgressMock,
      })
    );

    await act(async () => {
      await result.current.executeBatch(items, mockOperation);
    });

    expect(onProgressMock).toHaveBeenCalledTimes(4);
    expect(onProgressMock).toHaveBeenNthCalledWith(1, 1, 4, expect.anything());
    expect(onProgressMock).toHaveBeenNthCalledWith(2, 2, 4, expect.anything());
    expect(onProgressMock).toHaveBeenNthCalledWith(3, 3, 4, expect.anything());
    expect(onProgressMock).toHaveBeenNthCalledWith(4, 4, 4, expect.anything());
  });

  it('应该显示部分成功的提示', async () => {
    const items = [1, 2, 3];
    const mockOperation = vi
      .fn()
      .mockImplementationOnce(() => Promise.resolve())
      .mockImplementationOnce(() => Promise.reject(new Error('失败')))
      .mockImplementationOnce(() => Promise.resolve());

    const { result } = renderHook(() =>
      useBatchOperation({
        continueOnError: true,
      })
    );

    await act(async () => {
      await result.current.executeBatch(items, mockOperation);
    });

    // 验证显示了部分成功的消息
    expect(result.current.progress.completed).toBe(3);
    expect(result.current.progress.total).toBe(3);
  });
});
