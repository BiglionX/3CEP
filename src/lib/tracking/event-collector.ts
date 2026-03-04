// 事件收集?- 负责事件的收集、验证和预处?
export interface CollectedEvent {
  eventId: string;
  eventType: string;
  timestamp: string;
  userId?: string;
  sessionId: string;
  pageContext: PageContext;
  deviceInfo: DeviceInfo;
  eventData: Record<string, any>;
  metadata: EventMetadata;
}

export interface PageContext {
  pageName: string;
  pagePath: string;
  referrer: string;
  url: string;
  title: string;
}

export interface DeviceInfo {
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
}

export interface EventMetadata {
  collectorVersion: string;
  collectedAt: string;
  processingTime: number;
  isValid: boolean;
  validationErrors?: string[];
}

export class EventCollector {
  private collectedEvents: CollectedEvent[] = [];
  private readonly VERSION = '1.0.0';

  // 收集事件
  collect(rawEvent: any, sessionId: string): CollectedEvent | null {
    try {
      const startTime = Date.now();

      // 验证和标准化事件
      const validatedEvent = this.validateAndStandardize(rawEvent, sessionId);

      if (!validatedEvent) {
        return null;
      }

      // 添加元数?      const collectedEvent: CollectedEvent = {
        ...validatedEvent,
        metadata: {
          collectorVersion: this.VERSION,
          collectedAt: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          isValid: true,
        },
      };

      this.collectedEvents.push(collectedEvent);
      return collectedEvent;
    } catch (error) {
      console.error('Event collection failed:', error);
      return null;
    }
  }

  // 获取收集的事?  getCollectedEvents(): CollectedEvent[] {
    return [...this.collectedEvents];
  }

  // 清空已收集的事件
  clearCollectedEvents(): void {
    this.collectedEvents = [];
  }

  // 获取收集统计信息
  getCollectionStats(): {
    totalEvents: number;
    eventTypeDistribution: Record<string, number>;
    validEvents: number;
    invalidEvents: number;
  } {
    const stats = {
      totalEvents: this.collectedEvents.length,
      eventTypeDistribution: {} as Record<string, number>,
      validEvents: 0,
      invalidEvents: 0,
    };

    this.collectedEvents.forEach(event => {
      // 统计事件类型分布
      stats.eventTypeDistribution[event.eventType] =
        (stats.eventTypeDistribution[event.eventType] || 0) + 1;

      // 统计有效/无效事件
      if (event.metadata.isValid) {
        stats.validEvents++;
      } else {
        stats.invalidEvents++;
      }
    });

    return stats;
  }

  // 私有方法：验证和标准化事?  private validateAndStandardize(
    rawEvent: any,
    sessionId: string
  ): CollectedEvent | null {
    const errors: string[] = [];

    // 基础字段验证
    if (!rawEvent.eventType) {
      errors.push('eventType is required');
    }

    if (!rawEvent.timestamp || isNaN(Date.parse(rawEvent.timestamp))) {
      errors.push('valid timestamp is required');
    }

    // 页面上下文验?    const pageContext = this.extractPageContext(rawEvent);
    if (!pageContext.pageName) {
      errors.push('pageName is required');
    }

    // 设备信息验证
    const deviceInfo = this.extractDeviceInfo(rawEvent);

    if (errors.length > 0) {
      return {
        eventId: rawEvent.eventId || this.generateEventId(),
        eventType: rawEvent.eventType || 'unknown',
        timestamp: rawEvent.timestamp || new Date().toISOString(),
        sessionId,
        pageContext,
        deviceInfo,
        eventData: rawEvent.data || {},
        metadata: {
          collectorVersion: this.VERSION,
          collectedAt: new Date().toISOString(),
          processingTime: 0,
          isValid: false,
          validationErrors: errors,
        },
      };
    }

    // 标准化事件数?    const standardizedEvent: CollectedEvent = {
      eventId: rawEvent.eventId || this.generateEventId(),
      eventType: rawEvent.eventType,
      timestamp: rawEvent.timestamp,
      userId: rawEvent.userId,
      sessionId,
      pageContext,
      deviceInfo,
      eventData: this.sanitizeEventData(rawEvent.data || {}),
      metadata: {
        collectorVersion: this.VERSION,
        collectedAt: new Date().toISOString(),
        processingTime: 0,
        isValid: true,
      },
    };

    return standardizedEvent;
  }

  // 提取页面上下?  private extractPageContext(rawEvent: any): PageContext {
    return {
      pageName: rawEvent.pageName || 'Unknown',
      pagePath: rawEvent.pagePath || window.location.pathname,
      referrer: rawEvent.referrer || document.referrer,
      url: rawEvent?.url || window.location.href,
      title: rawEvent?.title || document.title,
    };
  }

  // 提取设备信息
  private extractDeviceInfo(rawEvent: any): DeviceInfo {
    const userAgent = rawEvent.userAgent || navigator.userAgent;

    return {
      userAgent,
      screenWidth: rawEvent.screenWidth || window.screen.width,
      screenHeight: rawEvent.screenHeight || window.screen.height,
      deviceType: rawEvent.deviceType || this.detectDeviceType(),
      browser: this.detectBrowser(userAgent),
      os: this.detectOS(userAgent),
    };
  }

  // 检测设备类?  private detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }

  // 检测浏览器
  private detectBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  // 检测操作系?  private detectOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  // 数据净?- 移除敏感信息
  private sanitizeEventData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'key',
      'credit',
      'card',
    ];

    for (const [key, value] of Object.entries(data)) {
      // 检查是否包含敏感信?      const isSensitive = sensitiveKeys.some(sensitiveKey =>
        key.toLowerCase().includes(sensitiveKey)
      );

      if (!isSensitive) {
        // 对值也进行简单检?        if (typeof value === 'string' && value.length < 1000) {
          sanitized[key] = value;
        } else if (typeof value !== 'string') {
          sanitized[key] = value;
        }
      } else {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  // 生成事件ID
  private generateEventId(): string {
    return `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
