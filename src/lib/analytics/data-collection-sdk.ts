/**
 * FixCycle 6.0 数据收集 SDK
 * Data Collection SDK for Analytics Platform
 *
 * 功能:
 * - 自动采集用户行为事件
 * - 性能指标监控
 * - 错误追踪
 * - 页面浏览统计
 * - 自定义事件上报
 */

import { fetchWithTimeout } from '@/lib/utils/fetch-with-timeout';
import { v4 as uuidv4 } from 'uuid';

/**
 * 配置选项
 */
export interface DataCollectionConfig {
  /** 应用 ID */
  appId: string;
  /** 环境 (development/staging/production) */
  environment: string;
  /** API 端点 */
  apiEndpoint: string;
  /** 批量上报大小（默认 50） */
  batchSize?: number;
  /** 批量上报间隔（毫秒，默认 30s） */
  flushInterval?: number;
  /** 是否启用调试模式 */
  debug?: boolean;
  /** 采样率 (0-1，默认 1 表示 100%) */
  sampleRate?: number;
  /** 是否自动采集页面浏览 */
  autoTrackPageviews?: boolean;
  /** 是否自动采集点击事件 */
  autoTrackClicks?: boolean;
  /** 是否自动采集性能指标 */
  autoTrackPerformance?: boolean;
}

/**
 * 事件数据结构
 */
export interface AnalyticsEvent {
  /** 事件唯一标识 */
  eventId: string;
  /** 事件类型 */
  eventType: 'pageview' | 'click' | 'custom' | 'error' | 'performance';
  /** 事件名称 */
  eventName: string;
  /** 事件时间戳 */
  timestamp: string;
  /** 用户 ID */
  userId?: string;
  /** 会话 ID */
  sessionId: string;
  /** 设备信息 */
  device: DeviceInfo;
  /** 页面信息 */
  page: PageInfo;
  /** 事件属性 */
  properties?: Record<string, any>;
  /** 性能指标（仅 performance 类型） */
  metrics?: PerformanceMetrics;
}

/**
 * 设备信息
 */
export interface DeviceInfo {
  /** 设备类型 */
  type: 'mobile' | 'tablet' | 'desktop';
  /** 操作系统 */
  os: string;
  /** 浏览器 */
  browser: string;
  /** 屏幕分辨率 */
  screenResolution: string;
  /** 语言 */
  language: string;
  /** User Agent */
  userAgent: string;
}

/**
 * 页面信息
 */
export interface PageInfo {
  /** URL */
  url: string;
  /** 路径 */
  path: string;
  /** 标题 */
  title: string;
  /** Referrer */
  referrer: string;
  /** Canonical URL */
  canonicalUrl?: string;
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 页面加载时间 */
  pageLoadTime?: number;
  /** DOM 就绪时间 */
  domContentLoaded?: number;
  /** 首次绘制时间 */
  firstPaint?: number;
  /** 首次内容绘制时间 */
  firstContentfulPaint?: number;
  /** 最大内容绘制时间 */
  largestContentfulPaint?: number;
  /** 首次输入延迟 */
  firstInputDelay?: number;
  /** 累积布局偏移分数 */
  cumulativeLayoutShift?: number;
  /** API 响应时间 */
  apiResponseTime?: number;
  /** 网络请求耗时 */
  networkRequestTime?: number;
}

/**
 * 批处理队列项
 */
interface QueueItem {
  event: AnalyticsEvent;
  retryCount: number;
}

/**
 * 数据收集器主类
 */
export class DataCollector {
  private static instance: DataCollector;
  private config: Required<DataCollectionConfig>;
  private queue: QueueItem[] = [];
  private sessionId: string;
  private userId?: string;
  private flushTimer?: NodeJS.Timeout;
  private isOnline: boolean = true;

  private constructor(config: DataCollectionConfig) {
    this.config = {
      batchSize: 50,
      flushInterval: 30000,
      debug: false,
      sampleRate: 1,
      autoTrackPageviews: true,
      autoTrackClicks: true,
      autoTrackPerformance: true,
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.initDeviceInfo();
    this.setupAutoTracking();
    this.startFlushTimer();
    this.handleNetworkStatus();

    if (this.config.debug) {
      // eslint-disable-next-line no-console
      console.log('[DataCollector] 初始化完成', this.config);
    }
  }

  /**
   * 获取单例实例
   */
  static getInstance(config: DataCollectionConfig): DataCollector {
    if (!DataCollector.instance) {
      DataCollector.instance = new DataCollector(config);
    }
    return DataCollector.instance;
  }

  /**
   * 设置用户 ID
   */
  setUserId(userId: string) {
    this.userId = userId;
    if (this.config.debug) {
      // eslint-disable-next-line no-console
      console.log('[DataCollector] 用户 ID 已设置:', userId);
    }
  }

  /**
   * 清除用户 ID
   */
  clearUserId() {
    this.userId = undefined;
    if (this.config.debug) {
      // eslint-disable-next-line no-console
      console.log('[DataCollector] 用户 ID 已清除');
    }
  }

  /**
   * 追踪自定义事件
   */
  track(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      eventId: uuidv4(),
      eventType: 'custom',
      eventName,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      device: this.getDeviceInfo(),
      page: this.getPageInfo(),
      properties,
    };

    this.addToQueue(event);
  }

  /**
   * 追踪页面浏览
   */
  trackPageview(url?: string, title?: string) {
    const pageInfo = this.getPageInfo(url, title);

    const event: AnalyticsEvent = {
      eventId: uuidv4(),
      eventType: 'pageview',
      eventName: 'page_view',
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      device: this.getDeviceInfo(),
      page: pageInfo,
      properties: {
        referrer: document.referrer,
        entryTime: performance.now(),
      },
    };

    this.addToQueue(event);
  }

  /**
   * 追踪错误
   */
  trackError(error: Error, context?: Record<string, any>) {
    const event: AnalyticsEvent = {
      eventId: uuidv4(),
      eventType: 'error',
      eventName: 'error',
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      device: this.getDeviceInfo(),
      page: this.getPageInfo(),
      properties: {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...context,
      },
    };

    this.addToQueue(event);
  }

  /**
   * 追踪性能指标
   */
  trackPerformance(metrics: PerformanceMetrics) {
    const event: AnalyticsEvent = {
      eventId: uuidv4(),
      eventType: 'performance',
      eventName: 'performance_metrics',
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      device: this.getDeviceInfo(),
      page: this.getPageInfo(),
      metrics,
    };

    this.addToQueue(event);
  }

  /**
   * 手动刷新队列（立即上报）
   */
  async flush() {
    if (this.queue.length === 0) {
      return;
    }

    if (!this.isOnline) {
      if (this.config.debug) {
        // eslint-disable-next-line no-console
        console.log('[DataCollector] 网络离线，跳过上报');
      }
      return;
    }

    const itemsToSend = this.queue.splice(0, this.config.batchSize);
    const events = itemsToSend.map(item => item.event);

    try {
      await this.sendEvents(events);
      if (this.config.debug) {
        // eslint-disable-next-line no-console
        console.log(`[DataCollector] 成功上报 ${events.length} 个事件`);
      }
    } catch (error) {
      console.error('[DataCollector] 上报失败:', error);
      // 失败重试：将事件加回队列
      itemsToSend.forEach(item => {
        if (item.retryCount < 3) {
          item.retryCount++;
          this.queue.push(item);
        }
      });
    }
  }

  /**
   * 销毁实例（清理定时器）
   */
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    // 最后一次上报
    this.flush();
  }

  // ==================== 私有方法 ====================

  /**
   * 生成会话 ID
   */
  private generateSessionId(): string {
    const storedSessionId = sessionStorage.getItem('dc_session_id');
    if (storedSessionId) {
      return storedSessionId;
    }

    const newSessionId = uuidv4();
    sessionStorage.setItem('dc_session_id', newSessionId);
    return newSessionId;
  }

  /**
   * 初始化设备信息
   */
  private initDeviceInfo() {
    // 缓存设备信息到 localStorage
    const deviceInfo = this.getDeviceInfo();
    localStorage.setItem('dc_device_info', JSON.stringify(deviceInfo));
  }

  /**
   * 获取设备信息
   */
  private getDeviceInfo(): DeviceInfo {
    const cached = localStorage.getItem('dc_device_info');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // ignore
      }
    }

    const ua = navigator.userAgent;
    const screen = window.screen;

    return {
      type: this.detectDeviceType(),
      os: this.detectOS(),
      browser: this.detectBrowser(),
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      userAgent: ua,
    };
  }

  /**
   * 检测设备类型
   */
  private detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const ua = navigator.userAgent.toLowerCase();
    if (/mobile|android|phone|iemobile|webos/i.test(ua)) {
      return 'mobile';
    }
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet';
    }
    return 'desktop';
  }

  /**
   * 检测操作系统
   */
  private detectOS(): string {
    const ua = navigator.userAgent;
    if (/Windows NT/i.test(ua)) return 'Windows';
    if (/Mac OS X/i.test(ua)) return 'macOS';
    if (/Android/i.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
    if (/Linux/i.test(ua)) return 'Linux';
    return 'Unknown';
  }

  /**
   * 检测浏览器
   */
  private detectBrowser(): string {
    const ua = navigator.userAgent;
    if (/Chrome/i.test(ua) && /Google Inc/i.test(navigator.vendor)) {
      return 'Chrome';
    }
    if (/Firefox/i.test(ua)) {
      return 'Firefox';
    }
    if (/Safari/i.test(ua) && /Apple Computer/i.test(navigator.vendor)) {
      return 'Safari';
    }
    if (/Edge/i.test(ua)) {
      return 'Edge';
    }
    return 'Unknown';
  }

  /**
   * 获取页面信息
   */
  private getPageInfo(url?: string, title?: string): PageInfo {
    const canonicalElement = document.querySelector('link[rel="canonical"]');
    return {
      url: url || window.location.href,
      path: url ? new URL(url).pathname : window.location.pathname,
      title: title || document.title,
      referrer: document.referrer,
      canonicalUrl: canonicalElement?.getAttribute('href') || undefined,
    };
  }

  /**
   * 添加到队列
   */
  private addToQueue(event: AnalyticsEvent) {
    // 采样检查
    if (this.config.sampleRate < 1 && Math.random() > this.config.sampleRate) {
      return;
    }

    this.queue.push({
      event,
      retryCount: 0,
    });

    if (this.config.debug) {
      // eslint-disable-next-line no-console
      console.log(`[DataCollector] 事件已入队：${event.eventName}`, event);
    }

    // 达到批量大小时立即上报
    if (this.queue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * 启动定时上报
   */
  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * 设置自动追踪
   */
  private setupAutoTracking() {
    if (typeof window === 'undefined') {
      return;
    }

    // 自动追踪页面浏览
    if (this.config.autoTrackPageviews) {
      this.trackPageview();

      // 监听路由变化（SPA）
      this.setupHistoryTracking();
    }

    // 自动追踪点击
    if (this.config.autoTrackClicks) {
      this.setupClickTracking();
    }

    // 自动追踪性能
    if (this.config.autoTrackPerformance) {
      this.setupPerformanceTracking();
    }

    // 全局错误监听
    this.setupErrorTracking();
  }

  /**
   * 设置历史路由追踪（SPA）
   */
  private setupHistoryTracking() {
    // 重写 pushState
    const originalPushState = history.pushState;
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      setTimeout(() => this.trackPageview(), 0);
    };

    // 重写 replaceState
    const originalReplaceState = history.replaceState;
    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      setTimeout(() => this.trackPageview(), 0);
    };

    // 监听 popstate
    window.addEventListener('popstate', () => {
      setTimeout(() => this.trackPageview(), 0);
    });
  }

  /**
   * 设置点击追踪
   */
  private setupClickTracking() {
    document.addEventListener(
      'click',
      event => {
        const target = event.target as HTMLElement;

        // 只追踪带有 data-track 属性的元素
        const trackElement = target.closest('[data-track]');
        if (!trackElement) {
          return;
        }

        const trackName = trackElement.getAttribute('data-track');
        const trackData = trackElement.getAttribute('data-track-data');

        let properties = {};
        if (trackData) {
          try {
            properties = JSON.parse(trackData);
          } catch (e) {
            properties = { rawData: trackData };
          }
        }

        this.track(trackName || 'click', {
          element: trackElement.tagName,
          text: trackElement.textContent?.trim(),
          ...properties,
        });
      },
      true
    );
  }

  /**
   * 设置性能追踪
   */
  private setupPerformanceTracking() {
    if (typeof performance === 'undefined') {
      return;
    }

    // 页面加载完成后上报性能数据
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;

        const metrics: PerformanceMetrics = {
          pageLoadTime: perfData.loadEventEnd - perfData.startTime,
          domContentLoaded:
            perfData.domContentLoadedEventEnd - perfData.startTime,
          firstPaint: this.getPaintTime('first-paint'),
          firstContentfulPaint: this.getPaintTime('first-contentful-paint'),
          networkRequestTime: perfData.responseEnd - perfData.requestStart,
        };

        this.trackPerformance(metrics);
      }, 0);
    });

    // Web Vitals 监控
    this.observeWebVitals();
  }

  /**
   * 获取绘制时间
   */
  private getPaintTime(entryName: string): number {
    const entries = performance.getEntriesByName(entryName);
    if (entries.length > 0) {
      return (entries[0] as PerformancePaintTiming).startTime;
    }
    return 0;
  }

  /**
   * 观察 Web Vitals
   */
  private observeWebVitals() {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver(entryList => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];

          this.trackPerformance({
            largestContentfulPaint: lastEntry.startTime,
          });
        });

        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // CLS (Cumulative Layout Shift)
        const clsObserver = new PerformanceObserver(entryList => {
          let clsValue = 0;
          entryList.getEntries().forEach(entry => {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          });

          this.trackPerformance({
            cumulativeLayoutShift: clsValue,
          });
        });

        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // FID (First Input Delay) - 简化版本
        const fidObserver = new PerformanceObserver(entryList => {
          entryList.getEntries().forEach(entry => {
            this.trackPerformance({
              firstInputDelay:
                (entry as PerformanceEventTiming).processingStart -
                (entry as PerformanceEventTiming).startTime,
            });
          });
        });

        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('[DataCollector] Web Vitals 观察失败:', e);
      }
    }
  }

  /**
   * 设置错误追踪
   */
  private setupErrorTracking() {
    // JavaScript 错误
    window.addEventListener('error', event => {
      this.trackError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Promise 错误
    window.addEventListener('unhandledrejection', event => {
      this.trackError(
        new Error(`Unhandled promise rejection: ${event.reason}`),
        {
          reason: String(event.reason),
        }
      );
    });
  }

  /**
   * 处理网络状态
   */
  private handleNetworkStatus() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      if (this.config.debug) {
        // eslint-disable-next-line no-console
        console.log('[DataCollector] 网络已连接');
      }
      // 尝试上报积压的事件
      this.flush();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      if (this.config.debug) {
        // eslint-disable-next-line no-console
        console.log('[DataCollector] 网络已断开');
      }
    });
  }

  /**
   * 发送事件到服务器
   */
  private async sendEvents(events: AnalyticsEvent[]) {
    const payload = {
      appId: this.config.appId,
      environment: this.config.environment,
      timestamp: new Date().toISOString(),
      events,
    };

    try {
      const response = await fetchWithTimeout(this.config.apiEndpoint, {
        timeout: 15000,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('[DataCollector] 上报失败:', error);
      throw error;
    }
  }
}

/**
 * 创建数据收集器实例（便捷函数）
 */
export function createDataCollector(
  config: DataCollectionConfig
): DataCollector {
  return DataCollector.getInstance(config);
}
