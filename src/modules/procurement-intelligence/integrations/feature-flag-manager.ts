// 功能开关管理器
// 控制采购智能体各项功能的开?关闭状?
import { createClient } from '@supabase/supabase-js';

interface FeatureConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rollout_percentage: number; // 0-100
  target_users?: string[]; // 特定用户群体
  start_time?: string;
  end_time?: string;
  dependencies?: string[]; // 依赖的其他功?  metadata?: Record<string, any>;
}

interface FeatureToggle {
  feature_id: string;
  user_id?: string;
  tenant_id?: string;
  enabled: boolean;
  override_reason?: string;
  created_at: string;
  updated_at: string;
}

export class FeatureFlagManager {
  private supabase: any;
  private cache: Map<string, FeatureConfig> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * 检查功能是否启?   */
  async isFeatureEnabled(
    featureId: string,
    userId?: string,
    tenantId?: string
  ): Promise<boolean> {
    try {
      // 1. 检查缓?      const cachedResult = this.getCachedResult(featureId, userId, tenantId);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // 2. 获取功能配置
      const featureConfig = await this.getFeatureConfig(featureId);
      if (!featureConfig) {
        return false;
      }

      // 3. 检查基础启用状?      if (!featureConfig.enabled) {
        this.cacheResult(featureId, userId, tenantId, false);
        return false;
      }

      // 4. 检查依赖功?      if (featureConfig.dependencies && featureConfig.dependencies.length > 0) {
        const dependencyChecks = await Promise.all(
          featureConfig.dependencies.map(depId =>
            this.isFeatureEnabled(depId, userId, tenantId)
          )
        );

        if (dependencyChecks.some(enabled => !enabled)) {
          this.cacheResult(featureId, userId, tenantId, false);
          return false;
        }
      }

      // 5. 检查灰度发?      if (featureConfig.rollout_percentage < 100) {
        const isInRollout = this.checkRollout(
          featureId,
          userId,
          featureConfig.rollout_percentage
        );
        if (!isInRollout) {
          this.cacheResult(featureId, userId, tenantId, false);
          return false;
        }
      }

      // 6. 检查时间窗?      if (featureConfig.start_time || featureConfig.end_time) {
        const now = new Date();
        if (
          featureConfig.start_time &&
          now < new Date(featureConfig.start_time)
        ) {
          this.cacheResult(featureId, userId, tenantId, false);
          return false;
        }
        if (featureConfig.end_time && now > new Date(featureConfig.end_time)) {
          this.cacheResult(featureId, userId, tenantId, false);
          return false;
        }
      }

      // 7. 检查用?租户特定配置
      const override = await this.getUserOverride(featureId, userId, tenantId);
      if (override !== null) {
        this.cacheResult(featureId, userId, tenantId, override);
        return override;
      }

      // 8. 检查目标用户群?      if (featureConfig.target_users && userId) {
        const isTargetUser = featureConfig.target_users.includes(userId);
        this.cacheResult(featureId, userId, tenantId, isTargetUser);
        return isTargetUser;
      }

      // 默认启用
      this.cacheResult(featureId, userId, tenantId, true);
      return true;
    } catch (error) {
      console.error(`检查功能开关失?${featureId}:`, error);
      return false;
    }
  }

  /**
   * 获取功能配置
   */
  private async getFeatureConfig(
    featureId: string
  ): Promise<FeatureConfig | null> {
    // 检查缓?    if (this.cache.has(featureId)) {
      const expiry = this.cacheExpiry.get(featureId);
      if (expiry && Date.now() < expiry) {
        return this.cache.get(featureId)!;
      }
    }

    try {
      // 从数据库查询
      const { data, error } = await this.supabase
        .from('feature_flags')
        .select('*')
        .eq('id', featureId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 记录未找到的功能
          console.warn(`功能开关未找到: ${featureId}`);
          return null;
        }
        throw error;
      }

      const config: FeatureConfig = {
        id: data.id,
        name: data.name,
        description: data.description,
        enabled: data.enabled,
        rollout_percentage: data.rollout_percentage || 0,
        target_users: data.target_users || [],
        start_time: data.start_time,
        end_time: data.end_time,
        dependencies: data.dependencies || [],
        metadata: data.metadata || {},
      };

      // 缓存结果
      this.cache.set(featureId, config);
      this.cacheExpiry.set(featureId, Date.now() + this.CACHE_TTL);

      return config;
    } catch (error) {
      console.error(`获取功能配置失败 ${featureId}:`, error);
      return null;
    }
  }

  /**
   * 检查灰度发?   */
  private checkRollout(
    featureId: string,
    userId: string | undefined,
    percentage: number
  ): boolean {
    if (!userId) return percentage >= 100;

    // 使用用户ID的哈希值决定是否在灰度范围?    const hash = this.simpleHash(`${featureId}:${userId}`);
    const userPercentage = (hash % 100) + 1;

    return userPercentage <= percentage;
  }

  /**
   * 获取用户特定配置
   */
  private async getUserOverride(
    featureId: string,
    userId?: string,
    tenantId?: string
  ): Promise<boolean | null> {
    if (!userId && !tenantId) return null;

    try {
      let query = this.supabase
        .from('feature_toggles')
        .select('enabled')
        .eq('feature_id', featureId);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        if (error.code !== 'PGRST116') {
          // 忽略未找到的错误
          console.error('查询用户配置失败:', error);
        }
        return null;
      }

      return data ? data.enabled : null;
    } catch (error) {
      console.error('获取用户配置异常:', error);
      return null;
    }
  }

  /**
   * 简单哈希函?   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换?2位整?    }
    return Math.abs(hash);
  }

  /**
   * 缓存结果
   */
  private cacheResult(
    featureId: string,
    userId: string | undefined,
    tenantId: string | undefined,
    result: boolean
  ): void {
    const cacheKey = `${featureId}:${userId || 'global'}:${tenantId || 'global'}`;
    this.cache.set(cacheKey, {
      id: featureId,
      name: featureId,
      description: '',
      enabled: result,
      rollout_percentage: result ? 100 : 0,
    } as FeatureConfig);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);
  }

  /**
   * 获取缓存结果
   */
  private getCachedResult(
    featureId: string,
    userId: string | undefined,
    tenantId: string | undefined
  ): boolean | null {
    const cacheKey = `${featureId}:${userId || 'global'}:${tenantId || 'global'}`;
    const expiry = this.cacheExpiry.get(cacheKey);

    if (expiry && Date.now() < expiry) {
      const config = this.cache.get(cacheKey);
      return config ? config.enabled : null;
    }

    return null;
  }

  /**
   * 批量检查多个功?   */
  async checkFeatures(
    featureIds: string[],
    userId?: string,
    tenantId?: string
  ): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    await Promise.all(
      featureIds.map(async featureId => {
        results[featureId] = await this.isFeatureEnabled(
          featureId,
          userId,
          tenantId
        );
      })
    );

    return results;
  }

  /**
   * 获取所有可用功能列?   */
  async getAllFeatures(): Promise<FeatureConfig[]> {
    try {
      const { data, error } = await this.supabase
        .from('feature_flags')
        .select('*')
        .order('name');

      if (error) throw error;

      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        enabled: item.enabled,
        rollout_percentage: item.rollout_percentage || 0,
        target_users: item.target_users || [],
        start_time: item.start_time,
        end_time: item.end_time,
        dependencies: item.dependencies || [],
        metadata: item.metadata || {},
      }));
    } catch (error) {
      console.error('获取功能列表失败:', error);
      return [];
    }
  }

  /**
   * 创建新功能开?   */
  async createFeature(config: Omit<FeatureConfig, 'id'>): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('feature_flags')
        .insert([
          {
            name: config.name,
            description: config.description,
            enabled: config.enabled,
            rollout_percentage: config.rollout_percentage,
            target_users: config.target_users,
            start_time: config.start_time,
            end_time: config.end_time,
            dependencies: config.dependencies,
            metadata: config.metadata,
          },
        ])
        .select('id')
        .single();

      if (error) throw error;

      // 清除缓存
      this.clearCache();

      return data.id;
    } catch (error) {
      console.error('创建功能开关失?', error);
      throw error;
    }
  }

  /**
   * 更新功能开?   */
  async updateFeature(
    featureId: string,
    updates: Partial<FeatureConfig>
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('feature_flags')
        .update({
          name: updates.name,
          description: updates.description,
          enabled: updates.enabled,
          rollout_percentage: updates.rollout_percentage,
          target_users: updates.target_users,
          start_time: updates.start_time,
          end_time: updates.end_time,
          dependencies: updates.dependencies,
          metadata: updates.metadata,
        })
        .eq('id', featureId);

      if (error) throw error;

      // 清除缓存
      this.clearCache();
    } catch (error) {
      console.error('更新功能开关失?', error);
      throw error;
    }
  }

  /**
   * 设置用户特定配置
   */
  async setUserOverride(
    featureId: string,
    enabled: boolean,
    userId?: string,
    tenantId?: string,
    reason?: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase.from('feature_toggles').upsert(
        {
          feature_id: featureId,
          user_id: userId,
          tenant_id: tenantId,
          enabled: enabled,
          override_reason: reason,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'feature_id,user_id,tenant_id',
        }
      );

      if (error) throw error;

      // 清除相关缓存
      const cacheKey = `${featureId}:${userId || 'global'}:${tenantId || 'global'}`;
      this.cache.delete(cacheKey);
      this.cacheExpiry.delete(cacheKey);
    } catch (error) {
      console.error('设置用户配置失败:', error);
      throw error;
    }
  }

  /**
   * 清除缓存
   */
  private clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * 预热常用功能缓存
   */
  async warmupCache(featureIds: string[]): Promise<void> {
    await Promise.all(featureIds.map(id => this.getFeatureConfig(id)));
  }
}

// 导出实例
export const featureFlagManager = new FeatureFlagManager();

// 功能开关使用示?/*
// 在服务中使用功能开?if (await featureFlagManager.isFeatureEnabled('smart_matching', userId)) {
  // 执行智能匹配逻辑
}

// 批量检查多个功?const features = await featureFlagManager.checkFeatures([
  'supplier_profiling',
  'market_intelligence',
  'risk_analysis'
], userId)
*/
