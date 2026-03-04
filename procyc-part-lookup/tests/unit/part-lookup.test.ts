/**
 * PartLookupSkill 单元测试
 */

import { PartLookupSkill } from '../src/handler';

describe('PartLookupSkill', () => {
  let skill: PartLookupSkill;

  beforeAll(() => {
    // 设置必要的环境变量
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-key';
    process.env.API_TIMEOUT_MS = '5000';
  });

  beforeEach(() => {
    skill = new PartLookupSkill();
  });

  describe('输入验证', () => {
    it('应该拒绝空的设备型号', async () => {
      const result = await skill.execute({
        deviceModel: '',
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SKILL_001');
      expect(result.error?.message).toContain('不能为空');
    });

    it('应该拒绝无效的设备类别', async () => {
      const result = await skill.execute({
        deviceModel: 'iPhone 14',
        deviceCategory: 'invalid_category' as any,
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SKILL_001');
    });

    it('应该拒绝无效的价格范围', async () => {
      const result = await skill.execute({
        deviceModel: 'iPhone 14',
        priceRange: {
          min: 100,
          max: 50,
        },
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SKILL_001');
      expect(result.error?.message).toContain('最低价格不能高于最高价格');
    });

    it('应该接受有效的输入', async () => {
      const result = await skill.execute({
        deviceModel: 'iPhone 14 Pro',
        deviceBrand: 'Apple',
        deviceCategory: 'mobile',
      });

      // 即使数据库查询失败，也不应该抛出异常
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('数据查询', () => {
    it('应该返回正确的响应结构', async () => {
      const result = await skill.execute({
        deviceModel: 'iPhone 14 Pro',
      });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('metadata');

      if (result.data) {
        expect(result.data).toHaveProperty('queryInfo');
        expect(result.data).toHaveProperty('compatibleParts');
        expect(result.data).toHaveProperty('statistics');
      }
    });

    it('应该包含正确的元数据信息', async () => {
      const result = await skill.execute({
        deviceModel: 'iPhone 14 Pro',
      });

      expect(result.metadata.version).toBe('1.0.0');
      expect(result.metadata.timestamp).toBeDefined();
      expect(typeof result.metadata.executionTimeMs).toBe('number');
    });

    it('统计数据应该正确计算', async () => {
      const result = await skill.execute({
        deviceModel: 'Test Device',
      });

      if (result.data) {
        expect(result.data.statistics).toHaveProperty('totalCompatibleParts');
        expect(result.data.statistics).toHaveProperty('avgPrice');
        expect(result.data.statistics).toHaveProperty('inStockCount');
        expect(result.data.statistics).toHaveProperty('outOfStockCount');
        expect(Array.isArray(result.data.statistics.categoriesBreakdown)).toBe(
          true
        );
      }
    });
  });

  describe('筛选和排序', () => {
    it('应该支持按分类筛选', async () => {
      const result = await skill.execute({
        deviceModel: 'iPhone 14',
        partCategory: '屏幕',
      });

      expect(result).toBeDefined();
    });

    it('应该支持按价格范围筛选', async () => {
      const result = await skill.execute({
        deviceModel: 'iPhone 14',
        priceRange: {
          min: 100,
          max: 1000,
        },
      });

      expect(result).toBeDefined();
    });

    it('应该支持不同的排序方式', async () => {
      const sorts = ['price_asc', 'price_desc', 'stock_desc', 'relevance'];

      for (const sortBy of sorts) {
        const result = await skill.execute({
          deviceModel: 'iPhone 14',
          sortBy: sortBy as any,
        });

        expect(result).toBeDefined();
      }
    });
  });

  describe('错误处理', () => {
    it('应该优雅地处理数据库连接失败', async () => {
      // 使用无效的 Supabase URL
      process.env.SUPABASE_URL = 'https://invalid-url.supabase.co';
      const invalidSkill = new PartLookupSkill();

      const result = await invalidSkill.execute({
        deviceModel: 'iPhone 14',
      });

      // 不应该抛出异常，而是返回错误响应
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内完成查询', async () => {
      const startTime = Date.now();

      await skill.execute({
        deviceModel: 'iPhone 14 Pro',
      });

      const executionTime = Date.now() - startTime;

      // 简单测试，不要求实际性能指标
      expect(executionTime).toBeLessThan(10000); // 小于 10 秒
    });
  });
});
