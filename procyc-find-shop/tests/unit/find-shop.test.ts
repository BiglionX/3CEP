import skill from '../src/index';
import { calculateDistance } from '../src/handler';

describe('procyc-find-shop', () => {
  describe('输入验证', () => {
    it('应该拒绝缺少纬度的请求', async () => {
      const result = await skill.execute({
        longitude: 116.4074,
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SKILL_001');
      expect(result.error?.message).toContain('latitude');
    });

    it('应该拒绝缺少经度的请求', async () => {
      const result = await skill.execute({
        latitude: 39.9042,
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SKILL_001');
      expect(result.error?.message).toContain('longitude');
    });

    it('应该拒绝纬度超出范围的请求', async () => {
      const result = await skill.execute({
        latitude: 100,
        longitude: 116.4074,
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SKILL_001');
      expect(result.error?.message).toContain('-90 到 90');
    });

    it('应该拒绝经度超出范围的请求', async () => {
      const result = await skill.execute({
        latitude: 39.9042,
        longitude: 200,
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SKILL_001');
      expect(result.error?.message).toContain('-180 到 180');
    });

    it('应该接受有效的坐标参数', async () => {
      const result = await skill.execute({
        latitude: 39.9042,
        longitude: 116.4074,
      });

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('店铺查询功能', () => {
    it('应该返回上海附近的店铺', async () => {
      const result = await skill.execute({
        latitude: 31.2304,
        longitude: 121.4737,
        radius: 10,
        limit: 5,
      });

      expect(result.success).toBe(true);
      expect(result.data?.shops).toBeDefined();
      expect(Array.isArray(result.data?.shops)).toBe(true);

      if (result.data?.shops.length > 0) {
        const shop = result.data.shops[0];
        expect(shop).toHaveProperty('id');
        expect(shop).toHaveProperty('name');
        expect(shop).toHaveProperty('address');
        expect(shop).toHaveProperty('distance');
        expect(shop.distance).toBeGreaterThanOrEqual(0);
      }
    });

    it('应该按距离排序返回结果', async () => {
      const result = await skill.execute({
        latitude: 23.1291,
        longitude: 113.2644,
        radius: 1000,
        limit: 10,
      });

      expect(result.success).toBe(true);

      const shops = result.data?.shops || [];
      if (shops.length > 1) {
        for (let i = 1; i < shops.length; i++) {
          expect(shops[i - 1].distance).toBeLessThanOrEqual(shops[i].distance);
        }
      }
    });

    it('应该遵守半径限制', async () => {
      const result = await skill.execute({
        latitude: 31.2304,
        longitude: 121.4737,
        radius: 1,
        limit: 10,
      });

      expect(result.success).toBe(true);

      const shops = result.data?.shops || [];
      shops.forEach(shop => {
        expect(shop.distance).toBeLessThanOrEqual(1);
      });
    });

    it('应该遵守数量限制', async () => {
      const result = await skill.execute({
        latitude: 31.2304,
        longitude: 121.4737,
        radius: 1000,
        limit: 2,
      });

      expect(result.success).toBe(true);
      expect(result.data?.shops.length).toBeLessThanOrEqual(2);
    });
  });

  describe('性能测试', () => {
    it('应该在 100ms 内完成查询', async () => {
      const startTime = Date.now();

      await skill.execute({
        latitude: 39.9042,
        longitude: 116.4074,
        radius: 50,
        limit: 100,
      });

      const executionTime = Date.now() - startTime;
      expect(executionTime).toBeLessThan(100);
    });
  });

  describe('元数据验证', () => {
    it('应该包含执行时间元数据', async () => {
      const result = await skill.execute({
        latitude: 39.9042,
        longitude: 116.4074,
      });

      expect(result.metadata).toBeDefined();
      expect(result.metadata.executionTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.metadata.timestamp).toBeDefined();
      expect(result.metadata.version).toBe('1.0.0');
    });
  });
});

describe('距离计算工具函数', () => {
  it('应该正确计算北京到上海的距离', () => {
    // 北京：39.9042, 116.4074
    // 上海：31.2304, 121.4737
    const distance = calculateDistance(39.9042, 116.4074, 31.2304, 121.4737);

    // 实际距离约 1068 公里，允许一定误差
    expect(distance).toBeGreaterThan(1000);
    expect(distance).toBeLessThan(1200);
  });

  it('相同点的距离应该为 0', () => {
    const distance = calculateDistance(39.9042, 116.4074, 39.9042, 116.4074);
    expect(distance).toBe(0);
  });

  it('应该计算短距离', () => {
    // 非常接近的两个点
    const distance = calculateDistance(39.9042, 116.4074, 39.905, 116.408);
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(1); // 小于 1 公里
  });
});
