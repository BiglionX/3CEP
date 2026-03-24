/**
 * FixCycle 6.0 数据清洗和转换服务
 * Data Cleaning and Transformation Service
 *
 * 功能:
 * - 数据验证和过滤
 * - 格式标准化
 * - 异常值检测
 * - 数据 enrichment（丰富化）
 * - 批量数据处理
 */

import { AnalyticsEvent, DeviceInfo } from './data-collection-sdk';

/**
 * 清洗后的事件数据结构
 */
export interface CleanedEvent extends AnalyticsEvent {
  /** 清洗时间戳 */
  cleanedAt: string;
  /** 数据质量评分 (0-100) */
  qualityScore: number;
  /** 标记位 */
  flags: EventFlags;
  /** 丰富的元数据 */
  enrichedData?: Record<string, any>;
}

/**
 * 事件标记
 */
export interface EventFlags {
  /** 是否为测试数据 */
  isTest: boolean;
  /** 是否重复 */
  isDuplicate: boolean;
  /** 是否异常 */
  isAnomaly: boolean;
  /** 是否无效 */
  isInvalid: boolean;
  /** 是否需要人工审核 */
  needsReview: boolean;
}

/**
 * 数据质量问题
 */
export interface DataQualityIssue {
  /** 问题类型 */
  type:
    | 'missing_field'
    | 'invalid_format'
    | 'out_of_range'
    | 'duplicate'
    | 'anomaly';
  /** 问题描述 */
  description: string;
  /** 严重级别 */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** 字段名 */
  field?: string;
}

/**
 * 数据清洗结果
 */
export interface CleaningResult {
  /** 原始事件 */
  original: AnalyticsEvent;
  /** 清洗后事件 */
  cleaned: CleanedEvent | null;
  /** 质量问题列表 */
  issues: DataQualityIssue[];
  /** 是否通过清洗 */
  passed: boolean;
}

/**
 * 地理位置信息（用于 IP 解析）
 */
interface GeoLocation {
  country: string;
  region: string;
  city: string;
  timezone: string;
}

/**
 * UTM 参数
 */
interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

/**
 * 数据清洗服务主类
 */
export class DataCleaningService {
  private static instance: DataCleaningService;

  // 已知的事件 ID 集合（用于去重）
  private seenEventIds = new Map<string, number>();

  // 地理位置缓存
  private geoCache = new Map<string, GeoLocation>();

  // 配置
  private readonly MAX_EVENT_ID_CACHE_SIZE = 10000;
  private readonly DUPLICATE_WINDOW_MS = 5 * 60 * 1000; // 5 分钟

  private constructor() {}

  static getInstance(): DataCleaningService {
    if (!DataCleaningService.instance) {
      DataCleaningService.instance = new DataCleaningService();
    }
    return DataCleaningService.instance;
  }

  /**
   * 批量清洗事件
   */
  cleanEvents(events: AnalyticsEvent[]): CleaningResult[] {
    return events.map(event => this.cleanEvent(event));
  }

  /**
   * 清洗单个事件
   */
  cleanEvent(event: AnalyticsEvent): CleaningResult {
    const issues: DataQualityIssue[] = [];
    const flags: EventFlags = {
      isTest: false,
      isDuplicate: false,
      isAnomaly: false,
      isInvalid: false,
      needsReview: false,
    };

    // 1. 基础验证
    const validationIssues = this.validateEvent(event);
    issues.push(...validationIssues);

    // 检查是否无效
    if (validationIssues.some(issue => issue.severity === 'critical')) {
      flags.isInvalid = true;
      return {
        original: event,
        cleaned: null,
        issues,
        passed: false,
      };
    }

    // 2. 去重检查
    if (this.isDuplicate(event)) {
      flags.isDuplicate = true;
      issues.push({
        type: 'duplicate',
        description: '事件在 5 分钟内重复出现',
        severity: 'medium',
        field: 'eventId',
      });

      // 重复事件直接丢弃
      return {
        original: event,
        cleaned: null,
        issues,
        passed: false,
      };
    }

    // 3. 创建清洗后的事件
    const cleanedEvent: CleanedEvent = {
      ...event,
      cleanedAt: new Date().toISOString(),
      qualityScore: 100,
      flags,
    };

    // 4. 数据标准化
    this.normalizeEvent(cleanedEvent);

    // 5. 异常检测
    const anomalies = this.detectAnomalies(cleanedEvent);
    if (anomalies.length > 0) {
      cleanedEvent.flags.isAnomaly = true;
      cleanedEvent.flags.needsReview = true;
      issues.push(...anomalies);
    }

    // 6. 数据丰富化
    cleanedEvent.enrichedData = this.enrichEventData(cleanedEvent);

    // 7. 计算质量评分
    cleanedEvent.qualityScore = this.calculateQualityScore(issues);

    return {
      original: event,
      cleaned: cleanedEvent,
      issues,
      passed: true,
    };
  }

  /**
   * 验证事件基础字段
   */
  private validateEvent(event: AnalyticsEvent): DataQualityIssue[] {
    const issues: DataQualityIssue[] = [];

    // 必填字段检查
    const requiredFields: Array<keyof AnalyticsEvent> = [
      'eventId',
      'eventType',
      'eventName',
      'timestamp',
      'sessionId',
    ];

    for (const field of requiredFields) {
      if (!event[field]) {
        issues.push({
          type: 'missing_field',
          description: `缺少必填字段：${field}`,
          severity: 'critical',
          field,
        });
      }
    }

    // 时间戳格式验证
    if (event.timestamp && isNaN(Date.parse(event.timestamp))) {
      issues.push({
        type: 'invalid_format',
        description: '时间戳格式无效',
        severity: 'high',
        field: 'timestamp',
      });
    }

    // 事件类型验证
    const validTypes = ['pageview', 'click', 'custom', 'error', 'performance'];
    if (event.eventType && !validTypes.includes(event.eventType)) {
      issues.push({
        type: 'invalid_format',
        description: `无效的事件类型：${event.eventType}`,
        severity: 'high',
        field: 'eventType',
      });
    }

    // 设备信息验证
    if (event.device) {
      if (
        event.device.screenResolution &&
        !/^\d+x\d+$/.test(event.device.screenResolution)
      ) {
        issues.push({
          type: 'invalid_format',
          description: '屏幕分辨率格式无效',
          severity: 'low',
          field: 'device.screenResolution',
        });
      }
    }

    // 页面信息验证
    if (event.page) {
      try {
        new URL(event.page.url);
      } catch {
        issues.push({
          type: 'invalid_format',
          description: 'URL 格式无效',
          severity: 'medium',
          field: 'page.url',
        });
      }
    }

    return issues;
  }

  /**
   * 检查是否重复
   */
  private isDuplicate(event: AnalyticsEvent): boolean {
    const now = Date.now();

    // 检查是否在缓存中
    const seenTime = this.seenEventIds.get(event.eventId);
    if (seenTime && now - seenTime < this.DUPLICATE_WINDOW_MS) {
      return true;
    }

    // 添加到缓存
    this.seenEventIds.set(event.eventId, now);

    // 清理过期缓存
    if (this.seenEventIds.size > this.MAX_EVENT_ID_CACHE_SIZE) {
      const entries = Array.from(this.seenEventIds.entries());
      const halfSize = Math.floor(entries.length / 2);

      for (let i = 0; i < halfSize; i++) {
        const [eventId, time] = entries[i];
        if (now - time > this.DUPLICATE_WINDOW_MS) {
          this.seenEventIds.delete(eventId);
        }
      }
    }

    return false;
  }

  /**
   * 标准化事件数据
   */
  private normalizeEvent(event: CleanedEvent): void {
    // 标准化设备类型
    if (event.device) {
      const deviceType = event.device.type.toLowerCase();
      if (['mobile', 'tablet', 'desktop'].includes(deviceType)) {
        event.device.type = deviceType as DeviceInfo['type'];
      } else {
        event.device.type = 'desktop'; // 默认
      }
    }

    // 标准化事件名称（转为小写和下划线）
    event.eventName = event.eventName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

    // 标准化 URL（去除锚点和查询参数，除非需要保留）
    if (event.page?.url) {
      try {
        const urlObj = new URL(event.page.url);
        // 可以选择保留或移除某些查询参数
        const keepParams = ['utm_source', 'utm_medium', 'utm_campaign'];
        const currentParams = urlObj.searchParams;

        // 移除所有参数
        urlObj.search = '';

        // 添加需要保留的参数
        keepParams.forEach(param => {
          const value = currentParams.get(param);
          if (value) {
            urlObj.searchParams.set(param, value);
          }
        });

        event.page.url = urlObj.toString();
      } catch {
        // ignore
      }
    }

    // 标准化时间戳（确保 ISO 8601 格式）
    event.timestamp = new Date(event.timestamp).toISOString();
  }

  /**
   * 丰富事件数据
   */
  private enrichEventData(event: CleanedEvent): Record<string, any> {
    const enriched: Record<string, any> = {};

    // 1. 从 URL 提取 UTM 参数
    if (event.page?.url) {
      try {
        const urlObj = new URL(event.page.url);
        const utmParams: UTMParams = {};

        [
          'utm_source',
          'utm_medium',
          'utm_campaign',
          'utm_term',
          'utm_content',
        ].forEach(param => {
          const value = urlObj.searchParams.get(param);
          if (value) {
            utmParams[param] = value;
          }
        });

        if (Object.keys(utmParams).length > 0) {
          enriched.utm = utmParams;
        }
      } catch {
        // ignore
      }
    }

    // 2. 根据 User Agent 推断更多信息
    if (event.device?.userAgent) {
      enriched.isBot = this.detectBot(event.device.userAgent);
      enriched.browserVersion = this.extractBrowserVersion(
        event.device.userAgent
      );
    }

    // 3. 根据页面路径分类
    if (event.page?.path) {
      enriched.pageCategory = this.categorizePage(event.page.path);
    }

    // 4. 时间段分类
    enriched.timeOfDay = this.getTimeOfDay(new Date(event.timestamp));
    enriched.dayOfWeek = new Date(event.timestamp).getDay();

    // 5. 会话时长估算（如果是 pageview 事件）
    if (event.eventType === 'pageview') {
      enriched.sessionStart = true; // 简化处理，实际应该查询之前的记录
    }

    return enriched;
  }

  /**
   * 检测异常
   */
  private detectAnomalies(event: CleanedEvent): DataQualityIssue[] {
    const issues: DataQualityIssue[] = [];

    // 1. 时间戳异常（未来时间或过早的时间）
    const eventTime = new Date(event.timestamp).getTime();
    const now = Date.now();

    if (eventTime > now + 60000) {
      // 未来 1 分钟以上
      issues.push({
        type: 'anomaly',
        description: '事件时间在未来',
        severity: 'high',
        field: 'timestamp',
      });
    } else if (eventTime < now - 365 * 24 * 60 * 60 * 1000) {
      // 1 年前
      issues.push({
        type: 'anomaly',
        description: '事件时间过于久远',
        severity: 'medium',
        field: 'timestamp',
      });
    }

    // 2. 性能指标异常
    if (event.metrics) {
      if (event.metrics.pageLoadTime && event.metrics.pageLoadTime > 30000) {
        // >30s
        issues.push({
          type: 'anomaly',
          description: '页面加载时间过长',
          severity: 'medium',
          field: 'metrics.pageLoadTime',
        });
      }

      if (
        event.metrics.firstInputDelay &&
        event.metrics.firstInputDelay > 500
      ) {
        // >500ms
        issues.push({
          type: 'anomaly',
          description: '首次输入延迟过长',
          severity: 'high',
          field: 'metrics.firstInputDelay',
        });
      }
    }

    // 3. 高频事件检测（同一会话短时间内大量事件）
    // 这里需要查询历史数据，简化处理

    // 4. 地理位置异常（如果有 IP 信息）
    // 可以检测不可能的地理位移

    return issues;
  }

  /**
   * 计算质量评分
   */
  private calculateQualityScore(issues: DataQualityIssue[]): number {
    let score = 100;

    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical':
          score -= 50;
          break;
        case 'high':
          score -= 20;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 检测设备类型
   */
  private categorizePage(path: string): string {
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/api')) return 'api';
    if (path.startsWith('/blog')) return 'content';
    if (path.startsWith('/shop')) return 'commerce';
    if (path.startsWith('/user') || path.startsWith('/profile'))
      return 'user_account';
    if (path.startsWith('/search')) return 'search';
    if (path.startsWith('/checkout')) return 'checkout';
    return 'other';
  }

  /**
   * 获取时间段
   */
  private getTimeOfDay(date: Date): string {
    const hour = date.getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  /**
   * 检测是否为机器人
   */
  private detectBot(userAgent: string): boolean {
    const botPatterns = [
      /bot/i,
      /spider/i,
      /crawler/i,
      /slurp/i,
      /curl/i,
      /wget/i,
      /googlebot/i,
      /bingbot/i,
    ];

    return botPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * 提取浏览器版本
   */
  private extractBrowserVersion(userAgent: string): string {
    const chromeMatch = userAgent.match(/Chrome\/(\d+\.\d+)/);
    if (chromeMatch) return `Chrome ${chromeMatch[1]}`;

    const firefoxMatch = userAgent.match(/Firefox\/(\d+\.\d+)/);
    if (firefoxMatch) return `Firefox ${firefoxMatch[1]}`;

    const safariMatch = userAgent.match(/Version\/(\d+\.\d+).*Safari/);
    if (safariMatch) return `Safari ${safariMatch[1]}`;

    return 'Unknown';
  }
}

/**
 * 创建数据清洗服务实例
 */
export function createDataCleaningService(): DataCleaningService {
  return DataCleaningService.getInstance();
}
