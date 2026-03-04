// 用户行为跟踪器核心SDK

export interface TrackingEvent {
  // 基础信息
  eventId: string;
  eventType: string;
  timestamp: string;
  userId?: string;

  // 页面信息
  pageName?: string;
  pagePath?: string;
  referrer?: string;

  // 设备信息
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';

  // 自定义数?  data?: Record<string, any>;
}

export interface TrackerConfig {
  appId: string;
  apiUrl: string;
  batchSize?: number;
  flushInterval?: number;
  autoTrack?: boolean;
  debug?: boolean;
}

export class UserBehaviorTracker {
  private config: TrackerConfig;
  private eventQueue: TrackingEvent[] = [];
  private sessionId: string;
  private flushTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor(config: TrackerConfig) {
    this.config = {
      batchSize: 10,
      flushInterval: 5000,
      autoTrack: true,
      debug: false,
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.setupAutoTracking();
  }

  // 初始化跟踪器
  init(): void {
    if (this.isInitialized) return;

    this.isInitialized = true;

    // 设置全局错误监听
    this.setupErrorTracking();

    // 设置页面可见性监?    this.setupVisibilityTracking();

    // 启动定时刷新
    this.startFlushTimer();

    this.debugLog('Tracker initialized');
  }

  // 记录页面浏览事件
  trackPageView(pageName?: string, additionalData?: Record<string, any>): void {
    const event: TrackingEvent = {
      eventId: this.generateEventId(),
      eventType: 'page_view',
      timestamp: new Date().toISOString(),
      userId: this.getUserId(),
      pageName: pageName || document.title,
      pagePath: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      deviceType: this.getDeviceType(),
      data: {
        url: window.location.href,
        title: document.title,
        ...additionalData,
      },
    };

    this.enqueueEvent(event);
    this.debugLog('Page view tracked:', event);
  }

  // 记录点击事件
  trackClick(element: HTMLElement, additionalData?: Record<string, any>): void {
    const event: TrackingEvent = {
      eventId: this.generateEventId(),
      eventType: 'click',
      timestamp: new Date().toISOString(),
      userId: this.getUserId(),
      pageName: document.title,
      pagePath: window.location.pathname,
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      deviceType: this.getDeviceType(),
      data: {
        elementId: element.id || undefined,
        elementClass: element.className || undefined,
        elementTag: element.tagName.toLowerCase(),
        elementText: this.getElementText(element),
        ...additionalData,
      },
    };

    this.enqueueEvent(event);
    this.debugLog('Click tracked:', event);
  }

  // 记录表单交互事件
  trackFormInteraction(
    formName: string,
    fieldName: string,
    action: 'focus' | 'blur' | 'change' | 'submit',
    additionalData?: Record<string, any>
  ): void {
    const event: TrackingEvent = {
      eventId: this.generateEventId(),
      eventType: 'form_interaction',
      timestamp: new Date().toISOString(),
      userId: this.getUserId(),
      pageName: document.title,
      pagePath: window.location.pathname,
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      deviceType: this.getDeviceType(),
      data: {
        formName,
        fieldName,
        action,
        ...additionalData,
      },
    };

    this.enqueueEvent(event);
    this.debugLog('Form interaction tracked:', event);
  }

  // 记录搜索事件
  trackSearch(
    query: string,
    searchType: string,
    resultsCount: number,
    additionalData?: Record<string, any>
  ): void {
    const event: TrackingEvent = {
      eventId: this.generateEventId(),
      eventType: 'search',
      timestamp: new Date().toISOString(),
      userId: this.getUserId(),
      pageName: document.title,
      pagePath: window.location.pathname,
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      deviceType: this.getDeviceType(),
      data: {
        query,
        searchType,
        resultsCount,
        ...additionalData,
      },
    };

    this.enqueueEvent(event);
    this.debugLog('Search tracked:', event);
  }

  // 记录自定义事?  trackCustomEvent(eventName: string, data?: Record<string, any>): void {
    const event: TrackingEvent = {
      eventId: this.generateEventId(),
      eventType: eventName,
      timestamp: new Date().toISOString(),
      userId: this.getUserId(),
      pageName: document.title,
      pagePath: window.location.pathname,
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      deviceType: this.getDeviceType(),
      data,
    };

    this.enqueueEvent(event);
    this.debugLog('Custom event tracked:', event);
  }

  // 手动刷新事件队列
  flush(): Promise<void> {
    return this.processEvents();
  }

  // 获取当前会话ID
  getSessionId(): string {
    return this.sessionId;
  }

  // 设置用户ID
  setUserId(userId: string): void {
    localStorage.setItem('tracker_user_id', userId);
  }

  // 获取用户ID
  getUserId(): string | undefined {
    return localStorage.getItem('tracker_user_id') || undefined;
  }

  // 私有方法
  private enqueueEvent(event: TrackingEvent): void {
    this.eventQueue.push(event);

    // 如果队列达到批处理大小，立即发?    if (this.eventQueue.length >= this.config.batchSize!) {
      this.flush();
    }
  }

  private async processEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId: this.config.appId,
          sessionId: this.sessionId,
          events: eventsToSend,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.debugLog(`Sent ${eventsToSend.length} events successfully`);
    } catch (error) {
      console.error('Failed to send tracking events:', error);
      // 发送失败时重新加入队列
      this.eventQueue.unshift(...eventsToSend);
    }
  }

  private setupAutoTracking(): void {
    if (!this.config.autoTrack) return;

    // 页面加载完成后记录页面浏?    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.trackPageView();
      });
    } else {
      this.trackPageView();
    }

    // 点击事件自动捕获
    document.addEventListener(
      'click',
      event => {
        const target = event.target as HTMLElement;
        if (target) {
          this.trackClick(target);
        }
      },
      true
    );

    // 表单交互自动捕获
    document.addEventListener(
      'focus',
      event => {
        this.handleFormEvent(event, 'focus');
      },
      true
    );

    document.addEventListener(
      'blur',
      event => {
        this.handleFormEvent(event, 'blur');
      },
      true
    );

    document.addEventListener(
      'change',
      event => {
        this.handleFormEvent(event, 'change');
      },
      true
    );

    document.addEventListener(
      'submit',
      event => {
        this.handleFormEvent(event, 'submit');
      },
      true
    );
  }

  private handleFormEvent(event: Event, action: string): void {
    const target = event.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;

    if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
      const form = target.closest('form');
      const formName =
        form?.getAttribute('data-tracking-name') ||
        form?.name ||
        'unnamed_form';

      this.trackFormInteraction(
        formName,
        target.name || target.id || 'unnamed_field',
        action as any,
        {
          fieldType: target.type || target.tagName.toLowerCase(),
          valueLength: target?.length || 0,
        }
      );
    }
  }

  private setupErrorTracking(): void {
    window.addEventListener('error', event => {
      this.trackCustomEvent('js_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event?.stack,
      });
    });

    window.addEventListener('unhandledrejection', event => {
      this.trackCustomEvent('promise_rejection', {
        reason: event?.message || String(event.reason),
      });
    });
  }

  private setupVisibilityTracking(): void {
    let hiddenStartTime: number | null = null;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        hiddenStartTime = Date.now();
        this.trackCustomEvent('page_hidden');
      } else {
        if (hiddenStartTime) {
          const hiddenDuration = Date.now() - hiddenStartTime;
          this.trackCustomEvent('page_visible', {
            hiddenDuration,
          });
          hiddenStartTime = null;
        }
      }
    });
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    const storedSession = sessionStorage.getItem('tracker_session_id');
    if (storedSession) {
      return storedSession;
    }

    const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('tracker_session_id', newSessionId);
    return newSessionId;
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }

  private getElementText(element: HTMLElement): string {
    const text = element?.trim() || '';
    return text.length > 50 ? text.substring(0, 50) + '...' : text;
  }

  private debugLog(...args: any[]): void {
    if (this.config.debug) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('[Tracker]', ...args)}
  }
}

// 全局实例
let globalTracker: UserBehaviorTracker | null = null;

export function initTracker(config: TrackerConfig): UserBehaviorTracker {
  if (!globalTracker) {
    globalTracker = new UserBehaviorTracker(config);
    globalTracker.init();
  }
  return globalTracker;
}

export function getTracker(): UserBehaviorTracker | null {
  return globalTracker;
}
