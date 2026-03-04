/**
 * 用户行为追踪系统核心
 * 负责收集、处理和上报用户行为数据
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// 行为事件类型定义
export type BehaviorEventType =
  | 'page_view' // 页面浏览
  | 'click' // 点击事件
  | 'scroll' // 滚动行为
  | 'form_submit' // 表单提交
  | 'search' // 搜索行为
  | 'navigation' // 导航跳转
  | 'hover' // 悬停行为
  | 'drag_drop' // 拖拽操作
  | 'gesture' // 手势操作
  | 'error' // 错误事件
  | 'custom'; // 自定义事?
// 行为事件数据结构
export interface BehaviorEvent {
  id: string;
  type: BehaviorEventType;
  timestamp: number;
  url: string;
  pageTitle: string;
  userAgent: string;
  screenSize: string;
  viewportSize: string;
  userId?: string;
  sessionId: string;
  element?: string;
  elementId?: string;
  elementClass?: string;
  coordinates?: { x: number; y: number };
  scrollDepth?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

// 追踪配置选项
interface TrackingConfig {
  // 基础配置
  enabled?: boolean;
  batchSize?: number;
  batchInterval?: number;
  samplingRate?: number;

  // 事件过滤
  excludedElements?: string[]; // 排除的元素选择?  excludedPaths?: string[]; // 排除的路?  includedEvents?: BehaviorEventType[]; // 只追踪指定事件类?
  // 数据处理
  autoCapture?: boolean; // 自动捕获常见事件
  captureScroll?: boolean; // 捕获滚动行为
  captureClicks?: boolean; // 捕获点击事件
  captureForms?: boolean; // 捕获表单交互
  captureErrors?: boolean; // 捕获错误信息

  // 隐私保护
  anonymizeIp?: boolean; // IP地址匿名?  respectDNT?: boolean; // 尊重"Do Not Track"
  cookieConsentRequired?: boolean; // 需要Cookie同意

  // 上报配置
  endpoint?: string; // 数据上报地址
  maxRetries?: number; // 最大重试次?  retryDelay?: number; // 重试延迟(ms)
}

// 默认配置
const DEFAULT_CONFIG: Required<TrackingConfig> = {
  enabled: true,
  batchSize: 10,
  batchInterval: 5000,
  samplingRate: 1.0,
  excludedElements: ['.no-track', '[data-no-track]'],
  excludedPaths: ['/admin', '/debug'],
  includedEvents: [],
  autoCapture: true,
  captureScroll: true,
  captureClicks: true,
  captureForms: true,
  captureErrors: true,
  anonymizeIp: true,
  respectDNT: true,
  cookieConsentRequired: false,
  endpoint: '/api/analytics/events',
  maxRetries: 3,
  retryDelay: 1000,
};

// 会话管理器
class SessionManager {
  private static SESSION_KEY = 'behavior_session_id';
  private static SESSION_TIMEOUT = 30 * 60 * 1000; // 30分钟

  static getSessionId(): string {
    const storedSession = localStorage.getItem(this.SESSION_KEY);
    const sessionData = storedSession ? JSON.parse(storedSession) : null;

    if (
      sessionData &&
      Date.now() - sessionData.timestamp < this.SESSION_TIMEOUT
    ) {
      // 更新时间?      sessionData.timestamp = Date.now();
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
      return sessionData.id;
    }

    // 创建新会?    const newSessionId = this.generateSessionId();
    localStorage.setItem(
      this.SESSION_KEY,
      JSON.stringify({
        id: newSessionId,
        timestamp: Date.now(),
      })
    );

    return newSessionId;
  }

  private static generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }
}

// 数据队列管理器
class EventQueue {
  private events: BehaviorEvent[] = [];
  private config: Required<TrackingConfig>;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: Required<TrackingConfig>) {
    this.config = config;
  }

  addEvent(event: BehaviorEvent): void {
    // 采样率控制
    if (Math.random() > this.config.samplingRate) {
      return;
    }

    this.events.push(event);

    // 检查是否需要立即发送
    if (this.events.length >= this.config.batchSize) {
      this.flush();
    } else if (!this.flushTimer) {
      // 设置定时发送
      this.flushTimer = setTimeout(() => {
        this.flush();
      }, this.config.batchInterval);
    }
  }

  flush(): void {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    this.sendEvents(eventsToSend);
  }

  private async sendEvents(events: BehaviorEvent[]): Promise<void> {
    if (!this.config.endpoint) return;

    let retries = 0;
    const maxRetries = this.config.maxRetries;

    while (retries <= maxRetries) {
      try {
        const response = await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            events,
            metadata: {
              userAgent: navigator.userAgent,
              timestamp: Date.now(),
              url: window.location.href,
            },
          }),
        });

        if (response.ok) {
          console.log(
            `[BehaviorTracker] Successfully sent ${events.length} events`
          );
          return;
        }
      } catch (error) {
        console.error(
          `[BehaviorTracker] Failed to send events (attempt ${retries + 1}):`,
          error
        );
      }

      retries++;
      if (retries <= maxRetries) {
        await new Promise(resolve =>
          setTimeout(resolve, this.config.retryDelay * retries)
        );
      }
    }

    console.error(
      `[BehaviorTracker] Failed to send events after ${maxRetries} retries`
    );
  }

  getEventCount(): number {
    return this.events.length;
  }

  clear(): void {
    this.events = [];
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

// 用户行为追踪器主类
export class BehaviorTracker {
  private config: Required<TrackingConfig>;
  private queue: EventQueue;
  private sessionId: string;
  private userId: string | null = null;
  private isInitialized = false;
  private observers: MutationObserver[] = [];

  constructor(config: TrackingConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = SessionManager.getSessionId();
    this.queue = new EventQueue(this.config);
  }

  // 初始化追踪器
  init(): void {
    if (this.isInitialized || !this.config.enabled) return;

    // 检查Do Not Track
    if (this.config.respectDNT && navigator.doNotTrack === '1') {
      console.log('[BehaviorTracker] Respect DNT enabled, tracking disabled');
      return;
    }

    // 检查Cookie同意（如果需要）
    if (this.config.cookieConsentRequired && !this.hasCookieConsent()) {
      console.log('[BehaviorTracker] Cookie consent required but not given');
      return;
    }

    this.setupEventListeners();
    this.setupAutoCapture();
    this.isInitialized = true;

    console.log('[BehaviorTracker] Initialized successfully');
  }

  // 设置事件监听器
  private setupEventListeners(): void {
    // 页面浏览事件
    this.trackPageView();

    // 点击事件
    if (this.config.captureClicks) {
      document.addEventListener('click', this.handleClick.bind(this), true);
    }

    // 表单提交事件
    if (this.config.captureForms) {
      document.addEventListener(
        'submit',
        this.handleFormSubmit.bind(this),
        true
      );
    }

    // 错误事件
    if (this.config.captureErrors) {
      window.addEventListener('error', this.handleError.bind(this));
      window.addEventListener(
        'unhandledrejection',
        this.handleUnhandledRejection.bind(this)
      );
    }

    // 页面卸载时发送剩余数?    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    window.addEventListener('pagehide', this.handlePageHide.bind(this));
  }

  // 自动捕获设置
  private setupAutoCapture(): void {
    if (!this.config.autoCapture) return;

    // 滚动深度追踪
    if (this.config.captureScroll) {
      let scrollTimer: NodeJS.Timeout | null = null;
      window.addEventListener('scroll', () => {
        if (scrollTimer) return;

        scrollTimer = setTimeout(() => {
          this.trackScroll();
          scrollTimer = null;
        }, 100);
      });
    }

    // DOM变化观察
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          // 处理新添加的元素
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.observeNewElements(node as Element);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    this.observers.push(observer);
  }

  // 事件处理方法
  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target || this.shouldExcludeElement(target)) return;

    this.trackEvent('click', {
      element: target.tagName.toLowerCase(),
      elementId: target.id || undefined,
      elementClass: target.className || undefined,
      coordinates: { x: event.clientX, y: event.clientY },
    });
  }

  private handleFormSubmit(event: Event): void {
    const form = event.target as HTMLFormElement;
    if (!form || this.shouldExcludeElement(form)) return;

    this.trackEvent('form_submit', {
      element: 'form',
      elementId: form.id || undefined,
      metadata: {
        formName: form.name,
        action: form.action,
        method: form.method,
      },
    });
  }

  private handleError(event: ErrorEvent): void {
    this.trackEvent('error', {
      metadata: {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    this.trackEvent('error', {
      metadata: {
        message: event?.message || 'Unhandled promise rejection',
        stack: event?.stack,
      },
    });
  }

  private handleBeforeUnload(): void {
    this.queue.flush();
  }

  private handlePageHide(): void {
    this.queue.flush();
  }

  // 核心追踪方法
  trackEvent(type: BehaviorEventType, data: Partial<BehaviorEvent> = {}): void {
    if (!this.isInitialized || !this.config.enabled) return;

    // 检查路径排除
    if (this.shouldExcludePath()) return;

    // 检查事件类型过滤
    if (
      this.config.includedEvents.length > 0 &&
      !this.config.includedEvents.includes(type)
    ) {
      return;
    }

    const event: BehaviorEvent = {
      id: this.generateEventId(),
      type,
      timestamp: Date.now(),
      url: window.location.href,
      pageTitle: document.title,
      userAgent: navigator.userAgent,
      screenSize: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      ...data,
    };

    this.queue.addEvent(event);
  }

  trackPageView(): void {
    this.trackEvent('page_view');
  }

  trackScroll(): void {
    const scrollDepth = Math.round(
      (window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight)) *
        100
    );

    this.trackEvent('scroll', {
      scrollDepth,
    });
  }

  // 工具方法
  private shouldExcludeElement(element: Element): boolean {
    return this.config.excludedElements.some(selector =>
      element.matches?.(selector)
    );
  }

  private shouldExcludePath(): boolean {
    const currentPath = window.location.pathname;
    return this.config.excludedPaths.some(path => currentPath.startsWith(path));
  }

  private observeNewElements(element: Element): void {
    // 为新元素添加必要的事件监听器
    if (element instanceof HTMLElement) {
      // 可以在这里为特定类型的元素添加专门的追踪
    }
  }

  private hasCookieConsent(): boolean {
    // 实现Cookie同意检查逻辑
    return localStorage.getItem('cookie_consent') === 'granted';
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 公共方法
  setUserId(userId: string): void {
    this.userId = userId;
  }

  getUserId(): string | null {
    return this.userId;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  flush(): void {
    this.queue.flush();
  }

  getPendingEventsCount(): number {
    return this.queue.getEventCount();
  }

  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.flush();
    this.isInitialized = false;
  }
}

// React Hook封装
export function useBehaviorTracker(config: TrackingConfig = {}) {
  const trackerRef = useRef<BehaviorTracker | null>(null);

  useEffect(() => {
    if (!trackerRef.current) {
      trackerRef.current = new BehaviorTracker(config);
      trackerRef.current.init();
    }

    return () => {
      if (trackerRef.current) {
        trackerRef.current.destroy();
        trackerRef.current = null;
      }
    };
  }, [config]);

  const trackCustomEvent = useCallback(
    (eventName: string, data?: Record<string, any>) => {
      if (trackerRef.current) {
        trackerRef.current.trackEvent('custom', {
          metadata: {
            eventName,
            ...data,
          },
        });
      }
    },
    []
  );

  const setUser = useCallback((userId: string) => {
    if (trackerRef.current) {
      trackerRef.current.setUserId(userId);
    }
  }, []);

  const flush = useCallback(() => {
    if (trackerRef.current) {
      trackerRef.current.flush();
    }
  }, []);

  return {
    trackEvent: (type: BehaviorEventType, data?: Partial<BehaviorEvent>) => {
      if (trackerRef.current) {
        trackerRef.current.trackEvent(type, data);
      }
    },
    trackCustomEvent,
    setUser,
    flush,
    getPendingEventsCount: () => trackerRef?.getPendingEventsCount() || 0,
  };
}

// 全局实例（可选）
let globalTracker: BehaviorTracker | null = null;

export function getGlobalBehaviorTracker(
  config: TrackingConfig = {}
): BehaviorTracker {
  if (!globalTracker) {
    globalTracker = new BehaviorTracker(config);
    globalTracker.init();
  }
  return globalTracker;
}

// 预设配置
export const BehaviorTrackerPresets = {
  MINIMAL: {
    batchSize: 20,
    batchInterval: 10000,
    samplingRate: 0.1,
    captureScroll: false,
    captureForms: false,
  },

  STANDARD: {
    batchSize: 10,
    batchInterval: 5000,
    samplingRate: 0.5,
  },

  DETAILED: {
    batchSize: 5,
    batchInterval: 2000,
    samplingRate: 1.0,
    captureScroll: true,
    captureForms: true,
    captureErrors: true,
  },
};
