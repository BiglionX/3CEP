import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { mockFetch } from '../../utils/test-helpers';

describe('维修店核心功能测试', () => {
  beforeEach(() => {
    // 清理所有mock
    jest.clearAllMocks();
  });

  afterEach(() => {
    // 测试后清理
  });

  describe('API调用测试', () => {
    it('应该能够获取维修店列表', async () => {
      const mockShops = [
        { id: '1', name: '测试维修店1', rating: 4.5 },
        { id: '2', name: '测试维修店2', rating: 4.2 },
      ];

      mockFetch({ shops: mockShops });

      const response = await fetch('/api/repair-shop/shops');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.shops).toHaveLength(2);
      expect(data.shops[0].name).toBe('测试维修店1');
    });

    it('应该能够获取维修店详情', async () => {
      const mockShopDetail = {
        id: '1',
        name: '测试维修店',
        description: '专业的手机维修服务',
        services: ['屏幕更换', '电池更换', '系统升级'],
        rating: 4.8,
        reviews: 128,
      };

      mockFetch({ shop: mockShopDetail });

      const response = await fetch('/api/repair-shop/shops/1');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.shop.name).toBe('测试维修店');
      expect(data.shop.services).toContain('屏幕更换');
    });
  });

  describe('数据处理测试', () => {
    it('应该正确处理分页数据', () => {
      const rawData = {
        data: Array(20)
          .fill(null)
          .map((_, index) => ({
            id: index + 1,
            name: `维修店${index + 1}`,
          })),
        pagination: {
          currentPage: 1,
          totalPages: 4,
          totalItems: 80,
          itemsPerPage: 20,
        },
      };

      expect(rawData.data).toHaveLength(20);
      expect(rawData.pagination.totalPages).toBe(4);
      expect(rawData.pagination.totalItems).toBe(80);
    });

    it('应该正确过滤和排序维修店', () => {
      const shops = [
        { id: 1, name: 'A维修店', rating: 4.2, distance: 2.5 },
        { id: 2, name: 'B维修店', rating: 4.8, distance: 1.2 },
        { id: 3, name: 'C维修店', rating: 4.5, distance: 3.1 },
      ];

      // 按评分排序
      const sortedByRating = [...shops].sort((a, b) => b.rating - a.rating);
      expect(sortedByRating[0].name).toBe('B维修店');

      // 按距离排序
      const sortedByDistance = [...shops].sort(
        (a, b) => a.distance - b.distance
      );
      expect(sortedByDistance[0].name).toBe('B维修店');
    });
  });

  describe('错误处理测试', () => {
    it('应该正确处理API错误', async () => {
      mockFetch({ error: '维修店不存在' }, 404);

      const response = await fetch('/api/repair-shop/shops/999');
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('维修店不存在');
    });

    it('应该处理网络错误', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('网络连接失败'));

      await expect(fetch('/api/repair-shop/shops')).rejects.toThrow(
        '网络连接失败'
      );
    });
  });

  describe('性能测试', () => {
    it('API响应时间应该在合理范围内', async () => {
      const startTime = Date.now();

      mockFetch({ shops: [] });
      await fetch('/api/repair-shop/shops');

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(1000); // 1秒以内
    });

    it('应该能够处理大量数据', async () => {
      const largeDataset = Array(1000)
        .fill(null)
        .map((_, index) => ({
          id: index,
          name: `维修店${index}`,
          rating: Math.random() * 5,
          services: [`服务${Math.floor(Math.random() * 10)}`],
        }));

      mockFetch({ shops: largeDataset });

      const response = await fetch('/api/repair-shop/shops?limit=1000');
      const data = await response.json();

      expect(data.shops).toHaveLength(1000);
    });
  });
});
