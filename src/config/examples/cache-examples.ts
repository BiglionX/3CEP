/**
 * 缓存配置中心使用示例
 */

import {
  CacheConfig,
  generateKey,
  getStrategy,
  shouldInvalidate,
} from '@/config/cache.config';
import {
  cache,
  configCache,
  hotDataCache,
  sessionCache,
} from '@/lib/cache-manager';

/**
 * 示例 1: 基本缓存操作
 */
export async function basicCacheExample() {
  // 设置缓存
  await cache.set(
    'user:123',
    { name: '张三', email: 'zhangsan@example.com' },
    { ttl: 300000 }
  );

  // 获取缓存
  const user = await cache.get('user:123');
  console.log('用户数据:', user);

  // 检查是否存在
  if (cache.has('user:123')) {
    console.log('缓存存在');
  }

  // 删除缓存
  await cache.delete('user:123');
}

/**
 * 示例 2: 使用预定义策略
 */
export async function useStrategyExample() {
  const strategy = getStrategy('HOT_DATA');
  console.log('热点数据策略:', strategy);

  // 使用热点数据缓存
  await hotDataCache.set('product:456', { name: 'iPhone 15', price: 7999 });
  const product = await hotDataCache.get('product:456');
  console.log('商品数据:', product);
}

/**
 * 示例 3: 生成命名空间键
 */
export function generateKeyExample() {
  const key1 = generateKey('user', 123, 'profile');
  console.log('生成的键:', key1); // cache:user:123:profile

  const key2 = generateKey('order', '202401001');
  console.log('生成的键:', key2); // cache:order:202401001
}

/**
 * 示例 4: 缓存失效规则
 */
export function invalidationExample() {
  // 检查是否需要失效
  if (shouldInvalidate('user:123', 'update')) {
    console.log('需要失效 user:123 的缓存');
  }

  // 获取级联失效的键
  const cascadeKeys = CacheConfig.getCascadeKeys('user:123');
  console.log('级联失效的键:', cascadeKeys);
  // 输出：['user:123', 'user_session:123', 'user_profile:123']
}

/**
 * 示例 5: 批量操作
 */
export async function batchOperationsExample() {
  // 批量设置
  await cache.setMany([
    {
      key: 'config:app',
      value: { name: 'MyApp', version: '1.0.0' },
      ttl: 3600000,
    },
    {
      key: 'config:db',
      value: { host: 'localhost', port: 5432 },
      ttl: 3600000,
    },
  ]);

  // 批量获取
  const configs = await cache.getMany(['config:app', 'config:db']);
  console.log('配置数据:', Object.fromEntries(configs));
}

/**
 * 示例 6: 统计信息监控
 */
export function statsMonitoringExample() {
  const stats = cache.getStats();
  console.log('缓存统计:', stats);
  /*
  {
    hits: 100,
    misses: 20,
    sets: 150,
    deletes: 10,
    evictions: 5,
    size: 135,
    hitRate: 0.833
  }
  */

  // 命中率低于阈值时告警
  if (stats.hitRate < 0.5) {
    console.warn('⚠️ 缓存命中率过低！');
  }
}

/**
 * 示例 7: 不同用途的缓存实例
 */
export async function multipleCachesExample() {
  // 热点数据缓存（5 分钟 TTL）
  await hotDataCache.set('home:banners', ['banner1', 'banner2']);

  // 配置数据缓存（1 小时 TTL）
  await configCache.set('system:settings', {
    theme: 'dark',
    language: 'zh-CN',
  });

  // 会话缓存（30 分钟 TTL）
  await sessionCache.set('session:token_abc', { userId: 123, role: 'admin' });
}

/**
 * 示例 8: 动态更新配置
 */
export function updateConfigExample() {
  // 导入新配置
  CacheConfig.importConfig({
    strategies: {
      CUSTOM_STRATEGY: {
        ttl: 10 * 60 * 1000,
        maxSize: 200,
        eviction: 'LFU',
      },
    },
  });

  // 获取所有策略名称
  const strategies = CacheConfig.getStrategyNames();
  console.log('所有策略:', strategies);
}

/**
 * 示例 9: 缓存导出和导入（用于持久化）
 */
export async function exportImportExample() {
  // 导出当前缓存数据
  const exported = cache.export();
  console.log('导出的数据:', exported.length, '项');

  // 保存到文件或数据库
  // await fs.writeFile('cache-backup.json', JSON.stringify(exported));

  // 从备份恢复
  // const backup = JSON.parse(await fs.readFile('cache-backup.json'));
  // cache.import(backup);
}

/**
 * 示例 10: 在 API 中使用缓存
 */
export async function apiCacheExample(userId: string) {
  const cacheKey = `user:${userId}:profile`;

  // 尝试从缓存获取
  let userProfile = await cache.get(cacheKey);

  if (!userProfile) {
    // 缓存未命中，从数据库查询
    console.log('缓存未命中，查询数据库...');
    // userProfile = await db.users.findById(userId);

    // 模拟数据库查询
    userProfile = { id: userId, name: '测试用户', email: 'test@example.com' };

    // 写入缓存
    await cache.set(cacheKey, userProfile, { ttl: 300000 });
  } else {
    console.log('✅ 从缓存获取数据');
  }

  return userProfile;
}

/**
 * 示例 11: 缓存更新时的失效处理
 */
export async function cacheInvalidationExample(userId: string, newData: any) {
  // 更新数据库
  // await db.users.update(userId, newData);

  const cacheKey = `user:${userId}`;

  // 检查是否需要失效
  if (shouldInvalidate(cacheKey, 'update')) {
    // 获取所有需要失效的键
    const keysToInvalidate = CacheConfig.getCascadeKeys(cacheKey);

    // 批量删除
    for (const key of keysToInvalidate) {
      await cache.delete(key);
      console.log(`已失效缓存：${key}`);
    }
  }
}

/**
 * 示例 12: 性能优化 - 使用压缩
 */
export async function compressionExample() {
  const largeData = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: '这是一个很长的描述文本...'.repeat(10),
  }));

  // 带压缩的缓存（需要在配置中启用 compression: true）
  await cache.set('large:data', largeData, { ttl: 600000 });

  const data = await cache.get('large:data');
  console.log('获取大数据:', data?.length, '项');
}

// 导出所有示例
export default {
  basicCacheExample,
  useStrategyExample,
  generateKeyExample,
  invalidationExample,
  batchOperationsExample,
  statsMonitoringExample,
  multipleCachesExample,
  updateConfigExample,
  exportImportExample,
  apiCacheExample,
  cacheInvalidationExample,
  compressionExample,
};
