/**
 * 数据库事务管理器单元测试
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

import { TransactionManager } from '../../src/tech/database/transaction.manager';

describe('TransactionManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('execute - 基本功能', () => {
    it('应该成功执行单个操作', async () => {
      const mockOperation = vi.fn().mockResolvedValue({ id: 1, name: 'test' });

      const result = await TransactionManager.execute([mockOperation]);

      expect(mockOperation).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ id: 1, name: 'test' });
    });

    it('应该按顺序执行多个操作', async () => {
      const executionOrder: number[] = [];

      const operations = [
        vi.fn().mockImplementation(() => executionOrder.push(1)),
        vi.fn().mockImplementation(() => executionOrder.push(2)),
        vi.fn().mockImplementation(() => executionOrder.push(3)),
      ];

      await TransactionManager.execute(operations);

      expect(executionOrder).toEqual([1, 2, 3]);
      operations.forEach(op => expect(op).toHaveBeenCalledTimes(1));
    });

    it('应该在操作失败时抛出错误', async () => {
      const error = new Error('操作失败');
      const operations = [
        vi.fn().mockResolvedValue('success'),
        vi.fn().mockRejectedValue(error),
        vi.fn().mockResolvedValue('success'),
      ];

      await expect(TransactionManager.execute(operations)).rejects.toThrow(
        '操作失败'
      );
      expect(operations[0]).toHaveBeenCalledTimes(1);
      expect(operations[1]).toHaveBeenCalledTimes(1);
      expect(operations[2]).not.toHaveBeenCalled();
    });
  });

  describe('execute - 重试机制', () => {
    it('应该在失败时自动重试', async () => {
      let attempts = 0;
      const mockOperation = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error(`临时错误 #${attempts}`);
        }
        return 'success';
      });

      const result = await TransactionManager.execute([mockOperation], {
        retryCount: 3,
        verbose: false,
      });

      expect(attempts).toBe(3);
      expect(result).toBe('success');
    });

    it('应该在超过重试次数后抛出错误', async () => {
      const error = new Error('持久性错误');
      const mockOperation = vi.fn().mockRejectedValue(error);

      await expect(
        TransactionManager.execute([mockOperation], { retryCount: 2 })
      ).rejects.toThrow('持久性错误');

      expect(mockOperation).toHaveBeenCalledTimes(3); // 初始 + 2 次重试
    });
  });

  describe('execute - 超时控制', () => {
    it('应该在超时时抛出错误', async () => {
      const slowOperation = vi
        .fn()
        .mockImplementation(
          () => new Promise(resolve => setTimeout(resolve, 200))
        );

      await expect(
        TransactionManager.execute([slowOperation], { timeout: 50 })
      ).rejects.toThrow(/超时/);
    });

    it('应该在超时前完成操作', async () => {
      const fastOperation = vi.fn().mockResolvedValue('done');

      const result = await TransactionManager.execute([fastOperation], {
        timeout: 1000,
      });

      expect(result).toBe('done');
      expect(fastOperation).toHaveBeenCalledTimes(1);
    });
  });

  describe('executeWithCompensation - 补偿机制', () => {
    it('应该在主操作失败时执行补偿操作', async () => {
      const mainOp = vi.fn().mockRejectedValue(new Error('主操作失败'));
      const compensationOp = vi.fn().mockResolvedValue(undefined);

      await expect(
        TransactionManager.executeWithCompensation([mainOp], [compensationOp])
      ).rejects.toThrow('主操作失败');

      expect(compensationOp).toHaveBeenCalledTimes(1);
    });

    it('应该按倒序执行补偿操作', async () => {
      const executionOrder: number[] = [];

      const mainOp = vi.fn().mockRejectedValue(new Error('失败'));
      const compensations = [
        vi.fn().mockImplementation(() => executionOrder.push(1)),
        vi.fn().mockImplementation(() => executionOrder.push(2)),
        vi.fn().mockImplementation(() => executionOrder.push(3)),
      ];

      await expect(
        TransactionManager.executeWithCompensation([mainOp], compensations)
      ).rejects.toThrow('失败');

      expect(executionOrder).toEqual([3, 2, 1]);
    });

    it('应该在主操作成功时不执行补偿', async () => {
      const mainOp = vi.fn().mockResolvedValue('success');
      const compensationOp = vi.fn();

      const result = await TransactionManager.executeWithCompensation(
        [mainOp],
        [compensationOp]
      );

      expect(result).toBe('success');
      expect(compensationOp).not.toHaveBeenCalled();
    });
  });

  describe('batchInsert - 批量插入', () => {
    it('应该成功批量插入记录', async () => {
      const records = [
        { id: 1, name: 'test1' },
        { id: 2, name: 'test2' },
        { id: 3, name: 'test3' },
      ];

      const mockInsert = vi.fn().mockResolvedValue({
        data: records,
        error: null,
      });

      const result = await TransactionManager.batchInsert('users', records);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(records);
    });

    it('应该在插入失败时返回错误', async () => {
      const records = [{ id: 1, name: 'test' }];
      const error = new Error('插入失败');

      const mockInsert = vi.fn().mockResolvedValue({
        data: null,
        error,
      });

      const result = await TransactionManager.batchInsert('users', records);

      expect(result.success).toBe(false);
      expect(result.error).toEqual(error);
    });
  });

  describe('batchUpdate - 批量更新', () => {
    it('应该成功批量更新记录', async () => {
      const updates = [
        { where: { id: 1 }, data: { name: 'updated1' } },
        { where: { id: 2 }, data: { name: 'updated2' } },
      ];

      const mockUpdate = vi.fn().mockResolvedValue({ error: null });

      const result = await TransactionManager.batchUpdate('users', updates);

      expect(result.success).toBe(true);
    });

    it('应该在部分更新失败时返回错误', async () => {
      const updates = [
        { where: { id: 1 }, data: { name: 'updated1' } },
        { where: { id: 2 }, data: { name: 'updated2' } },
      ];

      const mockUpdate = vi
        .fn()
        .mockResolvedValueOnce({ error: null })
        .mockRejectedValueOnce(new Error('更新失败'));

      const result = await TransactionManager.batchUpdate('users', updates);

      expect(result.success).toBe(false);
    });
  });

  describe('batchDelete - 批量删除', () => {
    it('应该成功批量删除记录', async () => {
      const conditions = [{ id: 1 }, { id: 2 }, { id: 3 }];

      const mockDelete = vi.fn().mockResolvedValue({ error: null });

      const result = await TransactionManager.batchDelete('users', conditions);

      expect(result.success).toBe(true);
    });

    it('应该在删除失败时返回错误', async () => {
      const conditions = [{ id: 1 }];
      const error = new Error('删除失败');

      const mockDelete = vi.fn().mockResolvedValue({ error });

      const result = await TransactionManager.batchDelete('users', conditions);

      expect(result.success).toBe(false);
      expect(result.error).toEqual(error);
    });
  });

  describe('validateLogs - 日志验证', () => {
    it('应该验证成功的事务日志', () => {
      const context = {
        id: 'tx_test',
        startTime: new Date(),
        operations: [
          {
            type: 'operation',
            table: 'users',
            timestamp: new Date(),
            status: 'success' as const,
          },
          {
            type: 'operation',
            table: 'roles',
            timestamp: new Date(),
            status: 'success' as const,
          },
        ],
      };

      const isValid = TransactionManager.validateLogs(context);
      expect(isValid).toBe(true);
    });

    it('应该检测失败的事务日志', () => {
      const context = {
        id: 'tx_test',
        startTime: new Date(),
        operations: [
          {
            type: 'operation',
            table: 'users',
            timestamp: new Date(),
            status: 'success' as const,
          },
          {
            type: 'operation',
            table: 'roles',
            timestamp: new Date(),
            status: 'error' as const,
            error: new Error('失败'),
          },
        ],
      };

      const isValid = TransactionManager.validateLogs(context);
      expect(isValid).toBe(false);
    });
  });

  describe('实际场景模拟', () => {
    it('应该处理用户创建 + 角色分配的事务', async () => {
      const userId = `user_${Date.now()}`;
      const operations = [
        vi.fn().mockImplementation(async (tx: any) => {
          // 模拟创建用户
          return {
            id: userId,
            name: '张三',
            created_at: new Date().toISOString(),
          };
        }),
        vi.fn().mockImplementation(async (tx: any) => {
          // 模拟分配角色
          return {
            user_id: userId,
            role: 'admin',
            assigned_at: new Date().toISOString(),
          };
        }),
      ];

      const result = await TransactionManager.execute<{
        id: string;
        name: string;
      }>(operations);

      expect(result.id).toBe(userId);
      expect(result.name).toBe('张三');
    });

    it('应该处理订单创建 + 库存扣减的事务', async () => {
      const orderId = `order_${Date.now()}`;
      const operations = [
        vi.fn().mockImplementation(async () => ({
          id: orderId,
          status: 'created',
          total: 100,
        })),
        vi.fn().mockImplementation(async () => ({
          product_id: 'product_1',
          stock_before: 10,
          stock_after: 9,
        })),
      ];

      const result: any = await TransactionManager.execute(operations);

      expect(result.status).toBe('created');
    });
  });
});
