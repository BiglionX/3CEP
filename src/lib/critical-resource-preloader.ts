// 关键资源预加载器
// 实现首屏关键资源的智能预加载策略

interface PreloadResource {
  url: string;
  type: 'script' | 'style' | 'image' | 'font' | 'fetch';
  priority: 'high' | 'medium' | 'low';
  as?: string;
  crossorigin?: boolean;
}

interface PreloadConfig {
  // 预加载策略配?
  preloadDelay: number; // 预加载延?ms)
  maxConcurrent: number; // 最大并发数
  bandwidthThreshold: number; // 带宽阈?KB/s)
  deviceClass: 'desktop' | 'mobile' | 'tablet'; // 设备类型
  networkType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown'; // 网络类型
}

interface ResourceTiming {
  url: string;
  startTime: number;
  endTime: number;
  duration: number;
  size?: number;
  success: boolean;
}

export class CriticalResourcePreloader {
  private config: PreloadConfig;
  private preloadQueue: PreloadResource[] = [];
  private activePreloads: Set<string> = new Set();
  private timingData: ResourceTiming[] = [];
  private observer: PerformanceObserver | null = null;

  constructor(config: Partial<PreloadConfig> = {}) {
    this.config = {
      preloadDelay: 100,
      maxConcurrent: 6,
      bandwidthThreshold: 500,
      deviceClass: this.detectDevice(),
      networkType: this.detectNetwork(),
      ...config,
    };

    this.initPerformanceObserver();
  }

  // 检测设备类?
  private detectDevice(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);

    if (isTablet) return 'tablet';
    if (isMobile) return 'mobile';
    return 'desktop';
  }

  // 检测网络状?
  private detectNetwork(): '4g' | '3g' | '2g' | 'slow-2g' | 'unknown' {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      return conn.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  // 初始化性能观察?
  private initPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'resource') {
            this.recordResourceTiming(entry as PerformanceResourceTiming);
          }
        });
      });

      this.observer.observe({ entryTypes: ['resource'] });
    }
  }

  // 记录资源加载时间
  private recordResourceTiming(entry: PerformanceResourceTiming) {
    const timing: ResourceTiming = {
      url: entry.name,
      startTime: entry.startTime,
      endTime: entry.responseEnd,
      duration: entry.duration,
      size: entry.transferSize,
      success: entry.responseStatus >= 200 && entry.responseStatus < 400,
    };

    this.timingData.push(timing);
  }

  // 评估是否应该预加?
  private shouldPreload(resource: PreloadResource): boolean {
    // 检查网络状?
    if (
      this.config.networkType === 'slow-2g' ||
      this.config.networkType === '2g'
    ) {
      return resource.priority === 'high';
    }

    // 检查带?
    const averageBandwidth = this.calculateAverageBandwidth();
    if (
      averageBandwidth < this.config.bandwidthThreshold &&
      resource.priority !== 'high'
    ) {
      return false;
    }

    // 检查并发限?
    if (this.activePreloads.size >= this.config.maxConcurrent) {
      return false;
    }

    return true;
  }

  // 计算平均带宽
  private calculateAverageBandwidth(): number {
    const recentTimings = this.timingData.slice(-10); // 最?0个资?
    if (recentTimings.length === 0) return Infinity;

    let totalBytes = 0;
    let totalTime = 0;

    recentTimings.forEach(timing => {
      if (timing.size && timing.duration > 0) {
        totalBytes += timing.size;
        totalTime += timing.duration;
      }
    });

    if (totalTime === 0) return Infinity;

    // KB/s
    return totalBytes / 1024 / (totalTime / 1000);
  }

  // 创建预加载链接元?
  private createPreloadLink(resource: PreloadResource): HTMLLinkElement {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.url;
    link.as = resource.type;

    if (resource.crossorigin) {
      link.crossOrigin = 'anonymous';
    }

    if (resource.as) {
      link.as = resource.as;
    }

    return link;
  }

  // 执行单个资源预加?
  private async preloadResource(resource: PreloadResource): Promise<void> {
    if (this.activePreloads.has(resource.url)) {
      return;
    }

    this.activePreloads.add(resource.url);

    try {
      const startTime = performance.now();

      if (resource.type === 'fetch') {
        // 对于API请求，使用fetch预加?
        await fetch(resource.url, { method: 'HEAD' });
      } else {
        // 对于其他资源，使用link preload
        const link = this.createPreloadLink(resource);
        document.head.appendChild(link);

        // 清理DOM元素
        setTimeout(() => {
          if (link.parentNode) {
            link.parentNode.removeChild(link);
          }
        }, 30000); // 30秒后清理
      }

      const endTime = performance.now();
      this.timingData.push({
        url: resource.url,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: true,
      });
    } catch (error) {
      console.warn(`预加载资源失? ${resource.url}`, error);
      this.timingData.push({
        url: resource.url,
        startTime: performance.now(),
        endTime: performance.now(),
        duration: 0,
        success: false,
      });
    } finally {
      this.activePreloads.delete(resource.url);
    }
  }

  // 智能预加载队列处?
  private async processPreloadQueue(): Promise<void> {
    // 按优先级排序
    const sortedResources = [...this.preloadQueue].sort((a, b) => {
      const priorityMap = { high: 3, medium: 2, low: 1 };
      return priorityMap[b.priority] - priorityMap[a.priority];
    });

    // 分批处理
    for (
      let i = 0;
      i < sortedResources.length;
      i += this.config.maxConcurrent
    ) {
      const batch = sortedResources.slice(i, i + this.config.maxConcurrent);
      const promises = batch
        .filter(resource => this.shouldPreload(resource))
        .map(resource => this.preloadResource(resource));

      await Promise.all(promises);

      // 批次间短暂延?
      if (i + this.config.maxConcurrent < sortedResources.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    this.preloadQueue = [];
  }

  // 公共API方法

  // 添加资源到预加载队列
  addResource(resource: PreloadResource | PreloadResource[]): void {
    const resources = Array.isArray(resource) ? resource : [resource];
    this.preloadQueue.push(...resources);
  }

  // 立即预加载指定资?
  async preloadNow(
    resource: PreloadResource | PreloadResource[]
  ): Promise<void> {
    const resources = Array.isArray(resource) ? resource : [resource];
    const promises = resources
      .filter(res => this.shouldPreload(res))
      .map(res => this.preloadResource(res));

    await Promise.all(promises);
  }

  // 延迟预加载队列中的所有资?
  async preloadDelayed(
    delay: number = this.config.preloadDelay
  ): Promise<void> {
    if (this.preloadQueue.length === 0) return;

    await new Promise(resolve => setTimeout(resolve, delay));
    await this.processPreloadQueue();
  }

  // 获取性能统计数据
  getPerformanceStats() {
    const successfulLoads = this.timingData.filter(t => t.success);
    const failedLoads = this.timingData.filter(t => !t.success);

    return {
      totalRequests: this.timingData.length,
      successfulRequests: successfulLoads.length,
      failedRequests: failedLoads.length,
      averageLoadTime:
        successfulLoads.length > 0
          ? successfulLoads.reduce((sum, t) => sum + t.duration, 0) /
            successfulLoads.length
          : 0,
      totalDataTransferred: successfulLoads.reduce(
        (sum, t) => sum + (t.size || 0),
        0
      ),
      currentBandwidth: this.calculateAverageBandwidth(),
      deviceClass: this.config.deviceClass,
      networkType: this.config.networkType,
    };
  }

  // 清理资源
  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.timingData = [];
    this.activePreloads.clear();
    this.preloadQueue = [];
  }
}

// 默认导出实例
export const criticalResourcePreloader = new CriticalResourcePreloader();

// React Hook封装
export function useCriticalPreloader() {
  const addResources = (resources: PreloadResource | PreloadResource[]) => {
    criticalResourcePreloader.addResource(resources);
  };

  const preloadNow = async (resources: PreloadResource | PreloadResource[]) => {
    await criticalResourcePreloader.preloadNow(resources);
  };

  const preloadDelayed = async (delay?: any: number) => {
    await criticalResourcePreloader.preloadDelayed(delay);
  };

  const getStats = () => criticalResourcePreloader.getPerformanceStats();

  return {
    addResources,
    preloadNow,
    preloadDelayed,
    getStats,
  };
}
