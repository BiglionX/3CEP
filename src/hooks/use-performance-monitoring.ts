/**
 * 前端性能监控系统
 * 实现页面加载、API响应时间和用户交互性能监控
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Gauge,
  Timer,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Wifi,
  HardDrive,
} from 'lucide-react';

// 性能指标类型
export type PerformanceMetricType =
  | 'navigation_timing' // 导航 timing
  | 'resource_timing' // 资源 timing
  | 'paint_timing' // 绘制 timing
  | 'api_response_time' // API 响应时间
  | 'user_interaction' // 用户交互延迟
  | 'first_contentful_paint' // 首次内容绘制
  | 'largest_contentful_paint' // 最大内容绘?  | 'first_input_delay' // 首次输入延迟
  | 'cumulative_layout_shift' // 累积布局偏移
  | 'time_to_interactive'; // 可交互时?
// 性能指标数据结构
export interface PerformanceMetric {
  id: string;
  type: PerformanceMetricType;
  value: number;
  timestamp: number;
  url: string;
  userAgent: string;
  deviceInfo: {
    type: 'desktop' | 'mobile' | 'tablet';
    screenWidth: number;
    screenHeight: number;
    connection?: string;
  };
  metadata?: Record<string, any>;
}

// 性能监控配置
export interface PerformanceConfig {
  enabled: boolean;
  sampleRate: number; // 采样?(0-1)
  reportWebVitals: boolean; // 是否报告 Web Vitals
  apiMonitoring: boolean; // 是否监控 API 性能
  interactionMonitoring: boolean; // 是否监控用户交互
  resourceTiming: boolean; // 是否收集资源 timing
  bufferSize: number; // 缓冲区大?  flushInterval: number; // 刷新间隔 (ms)
  thresholds: {
    fcp: number; // 首次内容绘制阈?(ms)
    lcp: number; // 最大内容绘制阈?(ms)
    fid: number; // 首次输入延迟阈?(ms)
    cls: number; // 累积布局偏移阈?    tti: number; // 可交互时间阈?(ms)
  };
}

// Web Vitals 接口
export interface WebVitalsMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  tti?: number; // Time to Interactive
}

// 默认配置
const DEFAULT_CONFIG: PerformanceConfig = {
  enabled: true,
  sampleRate: 1.0,
  reportWebVitals: true,
  apiMonitoring: true,
  interactionMonitoring: true,
  resourceTiming: true,
  bufferSize: 50,
  flushInterval: 10000,
  thresholds: {
    fcp: 1800,
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    tti: 5000,
  },
};

// 性能监控Hook
export function usePerformanceMonitoring(
  config: Partial<PerformanceConfig> = {}
) {
  const perfConfig = { ...DEFAULT_CONFIG, ...config };
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [webVitals, setWebVitals] = useState<WebVitalsMetrics>({});
  const metricBuffer = useRef<PerformanceMetric[]>([]);
  const flushTimer = useRef<NodeJS.Timeout | null>(null);

  // 生成唯一ID
  const generateId = useCallback((): string => {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }, []);

  // 获取设备信息
  const getDeviceInfo = useCallback(() => {
    const width = window.innerWidth;
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (width < 768) deviceType = 'mobile';
    else if (width < 1024) deviceType = 'tablet';

    return {
      type: deviceType,
      screenWidth: screen.width,
      screenHeight: screen.height,
      connection: (navigator as any)?.effectiveType || 'unknown',
    };
  }, []);

  // 添加性能指标
  const addMetric = useCallback(
    (
      type: PerformanceMetricType,
      value: number,
      metadata?: Record<string, any>
    ) => {
      // 采样检?      if (Math.random() > perfConfig.sampleRate) return;

      const metric: PerformanceMetric = {
        id: generateId(),
        type,
        value,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        deviceInfo: getDeviceInfo(),
        metadata,
      };

      // 添加到缓冲区
      metricBuffer.current.push(metric);
      setMetrics(prev => [...prev, metric]);

      // 检查缓冲区大小
      if (metricBuffer.current.length >= perfConfig.bufferSize) {
        flushMetrics();
      } else if (!flushTimer.current) {
        // 设置定期刷新
        flushTimer.current = setTimeout(flushMetrics, perfConfig.flushInterval);
      }
    },
    [perfConfig, generateId, getDeviceInfo]
  );

  // 刷新指标数据
  const flushMetrics = useCallback(async () => {
    if (metricBuffer.current.length === 0) return;

    const metricsToSend = [...metricBuffer.current];
    metricBuffer.current = [];

    // 清除定时?    if (flushTimer.current) {
      clearTimeout(flushTimer.current);
      flushTimer.current = null;
    }

    try {
      // 发送到分析服务
      await fetch('/api/performance/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: metricsToSend,
          sessionId: sessionStorage.getItem('perf-session-id') || generateId(),
        }),
      });
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
      // 保留数据以供重试
      metricBuffer.current.unshift(...metricsToSend);
    }
  }, [generateId]);

  // 监控导航 timing
  useEffect(() => {
    if (!perfConfig.enabled) return;

    const handleLoad = () => {
      // 使用 Navigation Timing API
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        addMetric(
          'navigation_timing',
          navigation.loadEventEnd - navigation.startTime,
          {
            dnsLookup:
              navigation.domainLookupEnd - navigation.domainLookupStart,
            tcpConnection: navigation.connectEnd - navigation.connectStart,
            requestTime: navigation.responseEnd - navigation.requestStart,
            domContentLoaded:
              navigation.domContentLoadedEventEnd -
              navigation.domContentLoadedEventStart,
          }
        );
      }
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => window.removeEventListener('load', handleLoad);
  }, [perfConfig.enabled, addMetric]);

  // 监控绘制 timing
  useEffect(() => {
    if (!perfConfig.enabled || !perfConfig.reportWebVitals) return;

    // 监控首次内容绘制 (FCP)
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          addMetric('first_contentful_paint', entry.startTime);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('Performance Observer not supported');
    }

    return () => observer.disconnect();
  }, [perfConfig.enabled, perfConfig.reportWebVitals, addMetric]);

  // 监控最大内容绘?(LCP)
  useEffect(() => {
    if (!perfConfig.enabled || !perfConfig.reportWebVitals) return;

    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      addMetric('largest_contentful_paint', lastEntry.startTime, {
        element: lastEntry?.tagName,
        size: lastEntry.size,
      });
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP Observer not supported');
    }

    return () => observer.disconnect();
  }, [perfConfig.enabled, perfConfig.reportWebVitals, addMetric]);

  // 监控首次输入延迟 (FID)
  useEffect(() => {
    if (!perfConfig.enabled || !perfConfig.reportWebVitals) return;

    const handleFirstInput = (event: PerformanceEventTiming) => {
      const fid = event.processingStart - event.startTime;
      addMetric('first_input_delay', fid, {
        eventType: event.name,
        target: (event.target as Element)?.tagName,
      });
    };

    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if ((entry as PerformanceEventTiming).processingStart) {
          handleFirstInput(entry as PerformanceEventTiming);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID Observer not supported');
    }

    return () => observer.disconnect();
  }, [perfConfig.enabled, perfConfig.reportWebVitals, addMetric]);

  // 监控累积布局偏移 (CLS)
  useEffect(() => {
    if (!perfConfig.enabled || !perfConfig.reportWebVitals) return;

    let clsValue = 0;
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['layout-shift'] });

      // 定期报告 CLS
      const interval = setInterval(() => {
        if (clsValue > 0) {
          addMetric('cumulative_layout_shift', clsValue);
        }
      }, 5000);

      return () => {
        clearInterval(interval);
        observer.disconnect();
      };
    } catch (e) {
      console.warn('CLS Observer not supported');
    }
  }, [perfConfig.enabled, perfConfig.reportWebVitals, addMetric]);

  // API 性能监控
  useEffect(() => {
    if (!perfConfig.enabled || !perfConfig.apiMonitoring) return;

    const originalFetch = window.fetch;
    window.fetch = async function (...args: any[]) {
      const startTime = performance.now();
      try {
        const response = await originalFetch.apply(this as any, args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        // 记录 API 性能
        const url = args[0].toString();
        if (!url.includes('localhost:3000/api/performance')) {
          // 避免监控自身
          addMetric('api_response_time', duration, {
            url,
            status: response.status,
            method: 'FETCH',
          });
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        addMetric('api_response_time', duration, {
          url: args[0].toString(),
          error: (error as Error).message,
          method: 'FETCH',
        });

        throw error;
      }
    } as any;

    // XMLHttpRequest 监控
    const originalXHR = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (...args) {
      const xhr = this;
      const startTime = performance.now();

      xhr.addEventListener('load', () => {
        const endTime = performance.now();
        const duration = endTime - startTime;

        addMetric('api_response_time', duration, {
          url: xhr.responseURL,
          status: xhr.status,
          method: (xhr as any)._method || 'XHR',
        });
      });

      xhr.addEventListener('error', () => {
        const endTime = performance.now();
        const duration = endTime - startTime;

        addMetric('api_response_time', duration, {
          url: xhr.responseURL,
          error: 'Network error',
          method: (xhr as any)._method || 'XHR',
        });
      });

      return originalXHR.apply(this, args as any);
    };

    return () => {
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.send = originalXHR;
    };
  }, [perfConfig.enabled, perfConfig.apiMonitoring, addMetric]);

  // 用户交互监控
  useEffect(() => {
    if (!perfConfig.enabled || !perfConfig.interactionMonitoring) return;

    let lastInteractionTime = 0;

    const handleInteraction = (event: Event) => {
      const now = performance.now();
      if (lastInteractionTime > 0) {
        const delay = now - lastInteractionTime;
        addMetric('user_interaction', delay, {
          eventType: event.type,
          target: (event.target as Element)?.tagName,
        });
      }
      lastInteractionTime = now;
    };

    // 监听主要交互事件
    const events = ['click', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction, true);
      });
    };
  }, [perfConfig.enabled, perfConfig.interactionMonitoring, addMetric]);

  // 资源 timing 监控
  useEffect(() => {
    if (!perfConfig.enabled || !perfConfig.resourceTiming) return;

    const handleLoad = () => {
      setTimeout(() => {
        const resources = performance.getEntriesByType('resource');
        resources.forEach(resource => {
          const res = resource as PerformanceResourceTiming;
          if (res.duration > 100) {
            // 只记录较慢的资源
            addMetric('resource_timing', res.duration, {
              name: res.name,
              type: res.initiatorType,
              transferSize: (res as any).transferSize,
            });
          }
        });
      }, 2000); // 等待资源加载完成
    };

    window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, [perfConfig.enabled, perfConfig.resourceTiming, addMetric]);

  // 组件卸载时清?  useEffect(() => {
    return () => {
      if (flushTimer.current) {
        clearTimeout(flushTimer.current);
      }
      flushMetrics();
    };
  }, [flushMetrics]);

  // 计算性能统计
  const getPerformanceStats = useCallback(() => {
    const recentMetrics = metrics.filter(
      m => Date.now() - m.timestamp < 60000 // 最?分钟的数?    );

    const stats = {
      avgResponseTime: 0,
      slowRequests: 0,
      totalMetrics: recentMetrics.length,
    };

    if (recentMetrics.length > 0) {
      const apiMetrics = recentMetrics.filter(
        m => m.type === 'api_response_time'
      );
      if (apiMetrics.length > 0) {
        const total = apiMetrics.reduce((sum, m) => sum + m.value, 0);
        stats.avgResponseTime = total / apiMetrics.length;
        stats.slowRequests = apiMetrics.filter(m => m.value > 1000).length;
      }
    }

    return stats;
  }, [metrics]);

  return {
    // 当前指标数据
    metrics,
    webVitals,

    // 性能统计
    stats: getPerformanceStats(),

    // 手动添加指标
    recordMetric: addMetric,

    // 立即刷新数据
    flush: flushMetrics,

    // 获取性能评分
    getPerformanceScore: (): number => {
      const stats = getPerformanceStats();
      // 简单的性能评分算法
      let score = 100;
      if (stats.avgResponseTime > 1000) score -= 20;
      if (stats.slowRequests > 5) score -= 30;
      return Math.max(0, score);
    },
  };
}

// 预定义的性能监控Hook
export function useWebVitals() {
  const { webVitals } = usePerformanceMonitoring({ reportWebVitals: true });
  return webVitals;
}

export function useApiPerformance() {
  const { metrics } = usePerformanceMonitoring({ apiMonitoring: true });
  return metrics.filter(m => m.type === 'api_response_time');
}

export function usePageLoadPerformance() {
  const { metrics } = usePerformanceMonitoring({ reportWebVitals: true });
  return metrics.filter(
    m =>
      m.type === 'navigation_timing' ||
      m.type === 'first_contentful_paint' ||
      m.type === 'largest_contentful_paint'
  );
}
