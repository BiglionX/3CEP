/**
 * 智能体缓存服务
 *
 * 缓存策略：
 * - 智能体列表：5 分钟 TTL
 * - 智能体详情：2 分钟 TTL
 * - 统计数据：10 分钟 TTL
 * - 用户权限：30 分钟 TTL
 */

import { cache } from './redis-client';

/**
 * 缓存键前缀
 */
const KEYS = {
  AGENT_LIST: 'agent:list:',
  AGENT_DETAIL: 'agent:detail:',
  AGENT_STATS: 'agent:stats:',
  USER_PERMISSIONS: 'user:permissions:',
} as const;

/**
 * 默认 TTL（秒）
 */
const TTL = {
  LIST: 300, // 5 分钟
  DETAIL: 120, // 2 分钟
  STATS: 600, // 10 分钟
  PERMISSIONS: 1800, // 30 分钟
} as const;

/**
 * 智能体列表缓存参数
 */
interface AgentListParams {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
}

/**
 * 智能体缓存服务类
 */
export class AgentCache {
  /**
   * 生成列表缓存键
   */
  private static getListKey(params: AgentListParams): string {
    const keyData = JSON.stringify({
      page: params.page || 1,
      limit: params.limit || 20,
      status: params.status,
      category: params.category,
      search: params.search,
    });
    return `${KEYS.AGENT_LIST}${Buffer.from(keyData).toString('base64')}`;
  }

  /**
   * 生成详情缓存键
   */
  private static getDetailKey(agentId: string): string {
    return `${KEYS.AGENT_DETAIL}${agentId}`;
  }

  /**
   * 生成统计缓存键
   */
  private static getStatsKey(agentId: string): string {
    return `${KEYS.AGENT_STATS}${agentId}`;
  }

  /**
   * 生成用户权限缓存键
   */
  private static getPermissionsKey(userId: string): string {
    return `${KEYS.USER_PERMISSIONS}${userId}`;
  }

  /**
   * 获取智能体列表（带缓存）
   */
  static async getAgentList(
    params: AgentListParams,
    fetcher: () => Promise<any>
  ): Promise<any> {
    const cacheKey = this.getListKey(params);

    // 尝试从缓存获取
    const cached = await cache.get(cacheKey);
    if (cached) {
      console.log(`[AgentCache] 列表命中：${cacheKey}`);
      return cached;
    }

    // 缓存未命中，执行查询
    console.log(`[AgentCache] 列表未命中：${cacheKey}`);
    const data = await fetcher();

    // 写入缓存
    await cache.set(cacheKey, data, TTL.LIST);

    return data;
  }

  /**
   * 获取智能体详情（带缓存）
   */
  static async getAgentDetail(
    agentId: string,
    fetcher: () => Promise<any>
  ): Promise<any> {
    const cacheKey = this.getDetailKey(agentId);

    // 尝试从缓存获取
    const cached = await cache.get(cacheKey);
    if (cached) {
      console.log(`[AgentCache] 详情命中：${cacheKey}`);
      return cached;
    }

    // 缓存未命中，执行查询
    console.log(`[AgentCache] 详情未命中：${cacheKey}`);
    const data = await fetcher();

    // 写入缓存
    await cache.set(cacheKey, data, TTL.DETAIL);

    return data;
  }

  /**
   * 获取智能体统计（带缓存）
   */
  static async getAgentStats(
    agentId: string,
    fetcher: () => Promise<any>
  ): Promise<any> {
    const cacheKey = this.getStatsKey(agentId);

    // 尝试从缓存获取
    const cached = await cache.get(cacheKey);
    if (cached) {
      console.log(`[AgentCache] 统计命中：${cacheKey}`);
      return cached;
    }

    // 缓存未命中，执行查询
    console.log(`[AgentCache] 统计未命中：${cacheKey}`);
    const data = await fetcher();

    // 写入缓存
    await cache.set(cacheKey, data, TTL.STATS);

    return data;
  }

  /**
   * 获取用户权限（带缓存）
   */
  static async getUserPermissions(
    userId: string,
    fetcher: () => Promise<any>
  ): Promise<any> {
    const cacheKey = this.getPermissionsKey(userId);

    // 尝试从缓存获取
    const cached = await cache.get(cacheKey);
    if (cached) {
      console.log(`[AgentCache] 权限命中：${cacheKey}`);
      return cached;
    }

    // 缓存未命中，执行查询
    console.log(`[AgentCache] 权限未命中：${cacheKey}`);
    const data = await fetcher();

    // 写入缓存
    await cache.set(cacheKey, data, TTL.PERMISSIONS);

    return data;
  }

  /**
   * 清除智能体列表缓存
   */
  static async invalidateAgentList(params?: AgentListParams): Promise<void> {
    if (params) {
      const cacheKey = this.getListKey(params);
      await cache.del(cacheKey);
      console.log(`[AgentCache] 清除列表缓存：${cacheKey}`);
    } else {
      // 清除所有列表缓存（通配符）
      const keys = await this.getKeysByPattern(`${KEYS.AGENT_LIST}*`);
      for (const key of keys) {
        await cache.del(key);
      }
      console.log(`[AgentCache] 清除所有列表缓存，共 ${keys.length} 个`);
    }
  }

  /**
   * 清除智能体详情缓存
   */
  static async invalidateAgentDetail(agentId: string): Promise<void> {
    const cacheKey = this.getDetailKey(agentId);
    await cache.del(cacheKey);
    console.log(`[AgentCache] 清除详情缓存：${cacheKey}`);
  }

  /**
   * 清除智能体统计缓存
   */
  static async invalidateAgentStats(agentId: string): Promise<void> {
    const cacheKey = this.getStatsKey(agentId);
    await cache.del(cacheKey);
    console.log(`[AgentCache] 清除统计缓存：${cacheKey}`);
  }

  /**
   * 清除用户权限缓存
   */
  static async invalidateUserPermissions(userId: string): Promise<void> {
    const cacheKey = this.getPermissionsKey(userId);
    await cache.del(cacheKey);
    console.log(`[AgentCache] 清除权限缓存：${cacheKey}`);
  }

  /**
   * 按模式获取缓存键（用于批量删除）
   */
  private static async getKeysByPattern(pattern: string): Promise<string[]> {
    // 注意：这里需要直接访问 Redis 客户端
    // 由于我们封装了 cache 接口，暂时返回空数组
    // 实际应用中应该扩展 cache 接口支持 keys 命令
    return [];
  }
}

/**
 * 便捷函数
 */
export const agentCache = AgentCache;
