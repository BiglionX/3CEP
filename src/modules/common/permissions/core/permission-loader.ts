/**
 * 权限加载器
 * 实现权限配置的动态加载、缓存和热更新机制
 */

import {
  DEFAULT_PERMISSION_CONFIG,
  PermissionConfig,
  PermissionConfigManager,
} from '../config/permission-config';

export interface LoadOptions {
  /** 是否强制刷新缓存 */
  forceRefresh?: boolean;
  /** 缓存过期时间(毫秒) */
  cacheTTL?: number;
  /** 重试次数 */
  retryAttempts?: number;
  /** 重试间隔(毫秒) */
  retryDelay?: number;
}

export interface LoadResult {
  /** 是否成功加载 */
  success: boolean;
  /** 权限配置 */
  config?: PermissionConfig;
  /** 错误信息 */
  error?: string;
  /** 来源 */
  source: 'cache' | 'remote' | 'default' | 'fallback';
  /** 加载时间 */
  loadTime: number;
}

export class PermissionLoader {
  private static instance: PermissionLoader;
  private configManager: PermissionConfigManager;
  private cache: Map<string, { config: PermissionConfig; timestamp: number }> =
    new Map();
  private isLoading: boolean = false;
  private subscribers: Array<(config: PermissionConfig) => void> = [];
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly CACHE_KEY = 'permission_config';
  private readonly DEFAULT_CACHE_TTL = 300000; // 5分钟

  private constructor() {
    this.configManager = PermissionConfigManager.getInstance();
    // 不在构造函数中启动自动更新，改为按需启动
    // this.startAutoUpdate();
  }

  static getInstance(): PermissionLoader {
    if (!PermissionLoader.instance) {
      PermissionLoader.instance = new PermissionLoader();
    }
    return PermissionLoader.instance;
  }

  /**
   * 加载权限配置
   */
  async loadPermissions(options: LoadOptions = {}): Promise<LoadResult> {
    const startTime = Date.now();
    const cacheTTL = options.cacheTTL ?? this.DEFAULT_CACHE_TTL;

    try {
      // 检查缓存
      if (!options.forceRefresh) {
        const cached = this.getCachedConfig(cacheTTL);
        if (cached) {
          return {
            success: true,
            config: cached,
            source: 'cache',
            loadTime: Date.now() - startTime,
          };
        }
      }

      // 防止并发加载
      if (this.isLoading) {
        // 等待当前加载完成
        await this.waitForLoading();
        const cached = this.getCachedConfig(cacheTTL);
        if (cached) {
          return {
            success: true,
            config: cached,
            source: 'cache',
            loadTime: Date.now() - startTime,
          };
        }
      }

      this.isLoading = true;

      // 尝试从远程加载
      const remoteResult = await this.loadFromRemote(options);
      if (remoteResult.success && remoteResult.config) {
        this.cacheConfig(remoteResult.config);
        this.isLoading = false;
        return {
          ...remoteResult,
          loadTime: Date.now() - startTime,
        };
      }

      // 降级到默认配置
      this.cacheConfig(DEFAULT_PERMISSION_CONFIG);
      this.isLoading = false;

      return {
        success: true,
        config: DEFAULT_PERMISSION_CONFIG,
        source: 'default',
        loadTime: Date.now() - startTime,
      };
    } catch (error) {
      this.isLoading = false;

      // 最后的降级方案
      const fallbackConfig = this.configManager.getConfig();
      this.cacheConfig(fallbackConfig);

      return {
        success: true,
        config: fallbackConfig,
        source: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown error',
        loadTime: Date.now() - startTime,
      };
    }
  }

  /**
   * 从远程API加载权限配置
   */
  private async loadFromRemote(options: LoadOptions): Promise<LoadResult> {
    const maxAttempts = options.retryAttempts ?? 3;
    const retryDelay = options.retryDelay ?? 1000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await this.fetchPermissionConfig();

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const configData = await response.json();
        const config = this.normalizeConfig(configData);
        const validationResult = this.configManager.validateConfig(config);

        if (!validationResult.isValid) {
          throw new Error(
            `配置验证失败: ${validationResult.errors.join(', ')}`
          );
        }

        // 更新配置管理器
        this.configManager.updateConfig(config);

        return {
          success: true,
          config,
          source: 'remote',
          loadTime: 0, // 将在调用处设置实际时间
        };
      } catch (error) {
        console.warn(`权限配置加载尝试 ${attempt}/${maxAttempts} 失败:`, error);

        if (attempt < maxAttempts) {
          await this.delay(retryDelay * attempt); // 指数退避
        } else {
          throw error;
        }
      }
    }

    throw new Error('所有重试尝试都失败');
  }

  /**
   * 获取缓存的配置
   */
  private getCachedConfig(cacheTTL: number): PermissionConfig | null {
    const cached = this.cache.get(this.CACHE_KEY);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > cacheTTL) {
      this.cache.delete(this.CACHE_KEY);
      return null;
    }

    return cached.config;
  }

  /**
   * 缓存配置
   */
  private cacheConfig(config: PermissionConfig): void {
    this.cache.set(this.CACHE_KEY, {
      config: { ...config },
      timestamp: Date.now(),
    });
    // 通知配置变更
    this.notifyConfigChange(config);
  }

  /**
   * 等待当前加载完成
   */
  private waitForLoading(): Promise<void> {
    return new Promise(resolve => {
      const check = () => {
        if (!this.isLoading) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  /**
   * 发起HTTP请求获取权限配置
   */
  private async fetchPermissionConfig(): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
    try {
      // 构建完整的 URL，支持服务器端和客户端
      const baseUrl =
        typeof window !== 'undefined'
          ? '' // 客户端使用相对路径
          : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // 服务器端使用绝对路径

      const url = `${baseUrl}/api/permissions/config`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 标准化配置数据   */
  private normalizeConfig(data: any): PermissionConfig {
    return {
      version: data.version || '1.0.0',
      lastUpdated: data.lastUpdated || new Date().toISOString(),
      roles: data.roles || {},
      permissions: data.permissions || {},
      rolePermissions: data.rolePermissions || {},
      tenantIsolation: {
        enabled: data?.enabled ?? true,
        mode: data?.mode || 'strict',
        defaultTenantField: data?.defaultTenantField || 'tenant_id',
        resourcesWithTenant: data?.resourcesWithTenant || [],
      },
      auditSettings: {
        enabled: data?.enabled ?? true,
        sensitiveOperations: data?.sensitiveOperations || [],
        logRetentionDays: data?.logRetentionDays || 90,
        logPath: data?.logPath || 'logs/audit',
        logDetailedData: data?.logDetailedData ?? true,
      },
      cacheSettings: {
        enabled: data?.enabled ?? true,
        ttl: data?.ttl || 300000,
        maxItems: data?.maxItems || 1000,
        updateInterval: data?.updateInterval || 30000,
      },
    };
  }

  /**
   * 启动自动更新机制
   */
  private startAutoUpdate(): void {
    const config = this.configManager.getConfig();
    const updateInterval = config.cacheSettings.updateInterval;

    if (updateInterval > 0 && !this.updateInterval) {
      this.updateInterval = setInterval(async () => {
        try {
          await this.loadPermissions({ forceRefresh: true });
        } catch (error) {
          console.error('自动更新权限配置失败:', error);
        }
      }, updateInterval);
    }
  }

  /**
   * 启用自动更新（公开方法）
   */
  enableAutoUpdate(): void {
    this.startAutoUpdate();
  }

  /**
   * 停止自动更新
   */
  stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * 手动触发配置更新
   */
  async refreshConfig(): Promise<LoadResult> {
    return await this.loadPermissions({ forceRefresh: true });
  }

  /**
   * 订阅配置变更
   */
  subscribe(callback: (config: PermissionConfig) => void): () => void {
    this.subscribers.push(callback);

    // 立即发送当前配置
    const currentConfig = this.configManager.getConfig();
    callback(currentConfig);

    // 返回取消订阅函数
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * 通知配置变更
   */
  private notifyConfigChange(config: PermissionConfig): void {
    this.subscribers.forEach(callback => {
      try {
        callback(config);
      } catch (error) {
        console.error('Permission loader subscriber error:', error);
      }
    });
  }

  /**
   * 获取加载器状态   */
  getStatus(): {
    isLoaded: boolean;
    isLoading: boolean;
    cacheSize: number;
    lastUpdate: number | null;
    autoUpdateEnabled: boolean;
  } {
    const cached = this.cache.get(this.CACHE_KEY);

    return {
      isLoaded: !!cached,
      isLoading: this.isLoading,
      cacheSize: this.cache.size,
      lastUpdate: cached ? cached.timestamp : null,
      autoUpdateEnabled: !!this.updateInterval,
    };
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 销毁加载器实例
   */
  destroy(): void {
    this.stopAutoUpdate();
    this.clearCache();
    this.subscribers = [];
  }
}
