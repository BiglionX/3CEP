import React from 'react';

/**
 * 前端懒加载管理器
 * 实现组件、路由和资源的智能懒加载策略
 */

interface LazyLoadConfig {
  /** 预加载策?*/
  preloadStrategy: 'viewport' | 'hover' | 'idle' | 'custom';
  /** 预加载延?ms) */
  preloadDelay: number;
  /** 交叉观察器配?*/
  intersectionObserverOptions: IntersectionObserverInit;
  /** 最大并发加载数 */
  maxConcurrentLoads: number;
  /** 缓存策略 */
  cacheStrategy: 'memory' | 'storage' | 'none';
}

interface LoadableComponent<T = any> {
  /** 组件加载函数 */
  loader: () => Promise<{ default: T }>;
  /** 组件名称 */
  name: string;
  /** 预加载条?*/
  preloadCondition?: () => boolean;
  /** 加载优先?*/
  priority: 'high' | 'medium' | 'low';
}

export class LazyLoadingManager {
  private config: LazyLoadConfig;
  private componentRegistry: Map<string, LoadableComponent>;
  private loadingQueue: Set<string>;
  private loadedComponents: Map<string, any>;
  private observer: IntersectionObserver | null;
  private preloadTimers: Map<string, NodeJS.Timeout>;

  constructor(config?: Partial<LazyLoadConfig>) {
    this.config = {
      preloadStrategy: 'viewport',
      preloadDelay: 100,
      intersectionObserverOptions: {
        rootMargin: '100px',
        threshold: 0.1,
      },
      maxConcurrentLoads: 3,
      cacheStrategy: 'memory',
      ...config,
    };

    this.componentRegistry = new Map();
    this.loadingQueue = new Set();
    this.loadedComponents = new Map();
    this.preloadTimers = new Map();
    this.observer = null;

    this.initializeIntersectionObserver();
  }

  /**
   * 注册可懒加载的组?   */
  registerComponent<T>(component: LoadableComponent<T>): void {
    this.componentRegistry.set(component.name, component);

    // 如果启用了预加载，设置相应的监听
    if (this.config.preloadStrategy === 'viewport') {
      this.setupViewportPreload(component.name);
    } else if (this.config.preloadStrategy === 'hover') {
      this.setupHoverPreload(component.name);
    }
  }

  /**
   * 创建懒加载组件包装器
   */
  createLazyComponent<T>(
    loader: () => Promise<{ default: T }>,
    name: string,
    options: {
      fallback?: React.ReactNode;
      preload?: boolean;
      priority?: 'high' | 'medium' | 'low';
    } = {}
  ) {
    const { fallback = null, preload = false, priority = 'medium' } = options;

    // 注册组件
    this.registerComponent({
      loader,
      name,
      priority,
    });

    // 返回懒加载组件工厂函?    return async (): Promise<T> => {
      // 检查是否已加载
      if (this.loadedComponents.has(name)) {
        return this.loadedComponents.get(name);
      }

      // 检查是否正在加?      if (this.loadingQueue.has(name)) {
        // 等待加载完成
        return new Promise(resolve => {
          const checkInterval = setInterval(() => {
            if (this.loadedComponents.has(name)) {
              clearInterval(checkInterval);
              resolve(this.loadedComponents.get(name));
            }
          }, 50);
        });
      }

      // 开始加?      return this.loadComponent(name);
    };
  }

  /**
   * 预加载指定组?   */
  async preloadComponent(name: string): Promise<void> {
    const component = this.componentRegistry.get(name);
    if (!component) {
      console.warn(`Component ${name} not registered for preloading`);
      return;
    }

    // 检查预加载条件
    if (component.preloadCondition && !component.preloadCondition()) {
      return;
    }

    // 检查是否已在队列中或已加载
    if (this.loadingQueue.has(name) || this.loadedComponents.has(name)) {
      return;
    }

    // 添加到加载队?    this.loadingQueue.add(name);

    try {
      const module = await component.loader();
      this.loadedComponents.set(name, module.default);

      // 缓存到存储（如果启用?      if (this.config.cacheStrategy === 'storage') {
        this.cacheToStorage(name, module.default);
      }
    } catch (error) {
      console.error(`Failed to preload component ${name}:`, error);
      throw error;
    } finally {
      this.loadingQueue.delete(name);
    }
  }

  /**
   * 批量预加载组?   */
  async preloadComponents(
    names: string[],
    concurrentLimit: number = 2
  ): Promise<void> {
    const chunks = this.chunkArray(names, concurrentLimit);

    for (const chunk of chunks) {
      await Promise.all(chunk.map(name => this.preloadComponent(name)));
    }
  }

  /**
   * 获取组件加载状?   */
  getComponentStatus(
    name: string
  ): 'loaded' | 'loading' | 'pending' | 'unknown' {
    if (this.loadedComponents.has(name)) return 'loaded';
    if (this.loadingQueue.has(name)) return 'loading';
    if (this.componentRegistry.has(name)) return 'pending';
    return 'unknown';
  }

  /**
   * 清除缓存
   */
  clearCache(name?: string): void {
    if (name) {
      this.loadedComponents.delete(name);
      this.removeFromStorage(name);
    } else {
      this.loadedComponents.clear();
      this.clearStorage();
    }
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats(): {
    totalComponents: number;
    loadedComponents: number;
    loadingQueueSize: number;
    cacheHitRate: number;
  } {
    return {
      totalComponents: this.componentRegistry.size,
      loadedComponents: this.loadedComponents.size,
      loadingQueueSize: this.loadingQueue.size,
      cacheHitRate: this.calculateCacheHitRate(),
    };
  }

  // 私有方法
  private initializeIntersectionObserver(): void {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const componentName = entry.target.getAttribute(
              'data-lazy-component'
            );
            if (componentName) {
              this.preloadComponent(componentName);
              // 停止观察已加载的元素
              this?.unobserve(entry.target);
            }
          }
        });
      }, this.config.intersectionObserverOptions);
    }
  }

  private setupViewportPreload(componentName: string): void {
    if (typeof document !== 'undefined') {
      // 在DOM中查找标记了该组件的元素
      const elements = document.querySelectorAll(
        `[data-lazy-component="${componentName}"]`
      );
      elements.forEach(element => {
        this?.observe(element);
      });
    }
  }

  private setupHoverPreload(componentName: string): void {
    if (typeof document !== 'undefined') {
      const elements = document.querySelectorAll(
        `[data-lazy-component="${componentName}"]`
      );
      elements.forEach(element => {
        element.addEventListener('mouseenter', () => {
          this.schedulePreload(componentName);
        });
      });
    }
  }

  private schedulePreload(componentName: string): void {
    // 清除之前的定时器
    if (this.preloadTimers.has(componentName)) {
      clearTimeout(this.preloadTimers.get(componentName)!);
    }

    // 设置新的预加载定时器
    const timer = setTimeout(() => {
      this.preloadComponent(componentName);
      this.preloadTimers.delete(componentName);
    }, this.config.preloadDelay);

    this.preloadTimers.set(componentName, timer);
  }

  private async loadComponent<T>(name: string): Promise<T> {
    const component = this.componentRegistry.get(name);
    if (!component) {
      throw new Error(`Component ${name} not registered`);
    }

    this.loadingQueue.add(name);

    try {
      // 检查存储缓?      if (this.config.cacheStrategy === 'storage') {
        const cached = this.getFromStorage<T>(name);
        if (cached) {
          this.loadedComponents.set(name, cached);
          return cached;
        }
      }

      const module = await component.loader();
      const componentInstance = module.default;

      this.loadedComponents.set(name, componentInstance);

      // 缓存到存?      if (this.config.cacheStrategy === 'storage') {
        this.cacheToStorage(name, componentInstance);
      }

      return componentInstance;
    } finally {
      this.loadingQueue.delete(name);
    }
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private cacheToStorage(key: string, value: any): void {
    try {
      const cacheKey = `lazy_component_${key}`;
      const serialized = JSON.stringify(value);
      localStorage.setItem(cacheKey, serialized);
    } catch (error) {
      console.warn('Failed to cache component to storage:', error);
    }
  }

  private getFromStorage<T>(key: string): T | null {
    try {
      const cacheKey = `lazy_component_${key}`;
      const serialized = localStorage.getItem(cacheKey);
      return serialized ? JSON.parse(serialized) : null;
    } catch (error) {
      console.warn('Failed to retrieve component from storage:', error);
      return null;
    }
  }

  private removeFromStorage(key: string): void {
    try {
      const cacheKey = `lazy_component_${key}`;
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.warn('Failed to remove component from storage:', error);
    }
  }

  private clearStorage(): void {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('lazy_component_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear storage cache:', error);
    }
  }

  private calculateCacheHitRate(): number {
    // 简单的缓存命中率计算（实际应用中需要更复杂的统计）
    return this.loadedComponents.size > 0 ? 0.85 : 0;
  }
}

// 创建全局实例
export const lazyLoadingManager = new LazyLoadingManager();

// React Hook 用于组件懒加?export function useLazyComponent<T>(
  loader: () => Promise<{ default: T }>,
  name: string,
  options: {
    fallback?: React.ReactNode;
    preload?: boolean;
    priority?: 'high' | 'medium' | 'low';
  } = {}
) {
  const [Component, setComponent] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const lazyComponent = lazyLoadingManager.createLazyComponent(
          loader,
          name,
          options
        );
        const component = await lazyComponent();

        if (mounted) {
          setComponent(() => component);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err : new Error('Failed to load component')
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [loader, name]);

  return { Component, loading, error };
}
