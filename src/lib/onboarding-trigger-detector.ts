// 引导触发器和检测器

export interface TriggerEvent {
  type: TriggerEventType;
  timestamp: number;
  data: any;
  userId?: string;
}

export type TriggerEventType =
  | 'first_login'
  | 'page_visit'
  | 'feature_interaction'
  | 'idle_time'
  | 'session_duration'
  | 'user_action'
  | 'system_event';

export interface TriggerRule {
  id: string;
  name: string;
  eventType: TriggerEventType;
  conditions: TriggerCondition[];
  cooldownPeriod?: number; // 冷却时间(毫秒)
  priority: number; // 优先级，数字越小优先级越?  targetAudience?: AudienceFilter;
}

export interface TriggerCondition {
  field: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'greater_than'
    | 'less_than'
    | 'between';
  value: any;
  valueType: 'string' | 'number' | 'boolean' | 'array';
}

export interface AudienceFilter {
  userTypes?: string[]; // 'new_user' | 'returning_user' | 'premium_user' �?  behaviorPatterns?: string[]; // 'explorer' | 'goal_oriented' | 'casual' �?  deviceTypes?: string[]; // 'mobile' | 'desktop' | 'tablet'
  timeConstraints?: TimeConstraint[];
}

export interface TimeConstraint {
  daysOfWeek?: number[]; // 0-6, 0表示周日
  hoursOfDay?: number[]; // 0-23
  dateRange?: {
    start: string; // ISO日期字符?    end: string;
  };
}

export interface TriggerResult {
  ruleId: string;
  matched: boolean;
  confidence: number; // 匹配置信?0-1
  triggeredAt: number;
  eventData: TriggerEvent;
}

export class OnboardingTriggerDetector {
  private rules: TriggerRule[] = [];
  private eventHistory: Map<string, TriggerEvent[]> = new Map();
  private lastTriggerTimes: Map<string, number> = new Map();
  private callbacks: Map<string, ((result: TriggerResult) => void)[]> =
    new Map();

  // 注册触发规则
  registerRule(rule: TriggerRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => a.priority - b.priority);
  }

  // 注册回调函数
  onTrigger(ruleId: string, callback: (result: TriggerResult) => void): void {
    if (!this.callbacks.has(ruleId)) {
      this.callbacks.set(ruleId, []);
    }
    this.callbacks.get(ruleId)!.push(callback);
  }

  // 处理触发事件
  processEvent(event: TriggerEvent): void {
    // 存储事件历史
    const userId = event.userId || 'anonymous';
    if (!this.eventHistory.has(userId)) {
      this.eventHistory.set(userId, []);
    }
    this.eventHistory.get(userId)!.push(event);

    // 清理旧事?保留最?00个事?
    const events = this.eventHistory.get(userId)!;
    if (events.length > 100) {
      this.eventHistory.set(userId, events.slice(-100));
    }

    // 检查所有规?    for (const rule of this.rules) {
      this.evaluateRule(rule, event, userId);
    }
  }

  // 评估单个规则
  private evaluateRule(
    rule: TriggerRule,
    event: TriggerEvent,
    userId: string
  ): void {
    // 检查事件类型匹?    if (rule.eventType !== event.type) return;

    // 检查冷却期
    const now = Date.now();
    const lastTrigger = this.lastTriggerTimes.get(rule.id);
    if (
      lastTrigger &&
      rule.cooldownPeriod &&
      now - lastTrigger < rule.cooldownPeriod
    ) {
      return;
    }

    // 检查受众过滤器
    if (
      rule.targetAudience &&
      !this.matchesAudience(rule.targetAudience, userId, event)
    ) {
      return;
    }

    // 评估条件
    let matchCount = 0;
    let totalConditions = rule.conditions.length;

    for (const condition of rule.conditions) {
      if (this.evaluateCondition(condition, event.data)) {
        matchCount++;
      }
    }

    // 计算匹配置信?    const confidence = totalConditions > 0 ? matchCount / totalConditions : 0;

    // 如果满足所有条?置信?=0.8视为完全匹配)
    if (confidence >= 0.8) {
      const result: TriggerResult = {
        ruleId: rule.id,
        matched: true,
        confidence,
        triggeredAt: now,
        eventData: event,
      };

      // 更新最后触发时?      this.lastTriggerTimes.set(rule.id, now);

      // 执行回调
      const callbacks = this.callbacks.get(rule.id);
      if (callbacks) {
        callbacks.forEach(callback => callback(result));
      }
    }
  }

  // 评估单个条件
  private evaluateCondition(condition: TriggerCondition, data: any): boolean {
    const fieldValue = this.getFieldValue(data, condition.field);

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(condition.value);
        }
        if (typeof fieldValue === 'string') {
          return fieldValue.includes(condition.value);
        }
        return false;
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'between':
        if (Array.isArray(condition.value) && condition.value.length === 2) {
          const numValue = Number(fieldValue);
          return (
            numValue >= Number(condition.value[0]) &&
            numValue <= Number(condition.value[1])
          );
        }
        return false;
      default:
        return false;
    }
  }

  // 获取嵌套字段?  private getFieldValue(obj: any, fieldPath: string): any {
    return fieldPath.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  // 检查受众匹?  private matchesAudience(
    filter: AudienceFilter,
    userId: string,
    event: TriggerEvent
  ): boolean {
    // 这里应该集成用户画像服务来获取详细用户信?    // 当前实现简化处?
    if (filter.userTypes) {
      // 基于用户ID或其他标识判断用户类?      const userType = this.getUserType(userId, event);
      if (!filter.userTypes.includes(userType)) {
        return false;
      }
    }

    if (filter.deviceTypes) {
      const deviceType = this.getDeviceType(event);
      if (!filter.deviceTypes.includes(deviceType)) {
        return false;
      }
    }

    if (filter.timeConstraints) {
      const now = new Date();
      if (!this.matchesTimeConstraints(filter.timeConstraints, now)) {
        return false;
      }
    }

    return true;
  }

  // 获取用户类型(简化实?
  private getUserType(userId: string, event: TriggerEvent): string {
    // 实际实现应该查询用户数据?    if (userId.startsWith('new_')) return 'new_user';
    if (userId.startsWith('premium_')) return 'premium_user';
    return 'returning_user';
  }

  // 获取设备类型(简化实?
  private getDeviceType(event: TriggerEvent): string {
    const userAgent = event.data.userAgent || '';

    if (/mobile|android|iphone|ipad/i.test(userAgent)) {
      return 'mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  // 检查时间约?  private matchesTimeConstraints(
    constraints: TimeConstraint[],
    date: Date
  ): boolean {
    return constraints.every(constraint => {
      // 检查星期几
      if (
        constraint.daysOfWeek &&
        !constraint.daysOfWeek.includes(date.getDay())
      ) {
        return false;
      }

      // 检查小?      if (
        constraint.hoursOfDay &&
        !constraint.hoursOfDay.includes(date.getHours())
      ) {
        return false;
      }

      // 检查日期范?      if (constraint.dateRange) {
        const currentDate = date.toISOString().split('T')[0];
        return (
          currentDate >= constraint.dateRange.start &&
          currentDate <= constraint.dateRange.end
        );
      }

      return true;
    });
  }

  // 获取事件历史
  getEventHistory(
    userId: string,
    eventType?: TriggerEventType
  ): TriggerEvent[] {
    const events = this.eventHistory.get(userId) || [];
    if (eventType) {
      return events.filter(event => event.type === eventType);
    }
    return events;
  }

  // 清理事件历史
  clearEventHistory(userId: string): void {
    this.eventHistory.delete(userId);
  }

  // 获取统计信息
  getStatistics(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    recentTriggers: number;
  } {
    let totalEvents = 0;
    const eventsByType: Record<string, number> = {};
    let recentTriggers = 0;

    const oneHourAgo = Date.now() - 3600000;

    for (const events of this.eventHistory.values()) {
      totalEvents += events.length;
      events.forEach(event => {
        eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
        if (event.timestamp > oneHourAgo) {
          recentTriggers++;
        }
      });
    }

    return { totalEvents, eventsByType, recentTriggers };
  }
}

// 预定义的触发规则
export class PredefinedTriggers {
  static getCommonTriggers(): TriggerRule[] {
    return [
      {
        id: 'new_user_first_login',
        name: '新用户首次登?,
        eventType: 'first_login',
        conditions: [
          {
            field: 'isNewUser',
            operator: 'equals',
            value: true,
            valueType: 'boolean',
          },
        ],
        priority: 1,
      },
      {
        id: 'dashboard_visit_after_login',
        name: '登录后访问仪表板',
        eventType: 'page_visit',
        conditions: [
          {
            field: 'page',
            operator: 'equals',
            value: '/dashboard',
            valueType: 'string',
          },
          {
            field: 'timeSinceLogin',
            operator: 'less_than',
            value: 300000,
            valueType: 'number',
          }, // 5分钟?        ],
        priority: 2,
      },
      {
        id: 'feature_exploration',
        name: '功能探索行为',
        eventType: 'feature_interaction',
        conditions: [
          {
            field: 'uniqueFeaturesVisited',
            operator: 'greater_than',
            value: 3,
            valueType: 'number',
          },
          {
            field: 'sessionDuration',
            operator: 'greater_than',
            value: 180000,
            valueType: 'number',
          }, // 3分钟以上
        ],
        priority: 3,
      },
      {
        id: 'idle_user_engagement',
        name: '闲置用户重新激?,
        eventType: 'idle_time',
        conditions: [
          {
            field: 'idleDuration',
            operator: 'greater_than',
            value: 300000,
            valueType: 'number',
          }, // 5分钟闲置
          {
            field: 'returnEngagement',
            operator: 'equals',
            value: true,
            valueType: 'boolean',
          },
        ],
        priority: 2,
        cooldownPeriod: 3600000, // 1小时冷却?      },
      {
        id: 'mobile_user_welcome',
        name: '移动端用户欢?,
        eventType: 'page_visit',
        conditions: [
          {
            field: 'page',
            operator: 'equals',
            value: '/',
            valueType: 'string',
          },
        ],
        targetAudience: {
          deviceTypes: ['mobile'],
        },
        priority: 1,
      },
    ];
  }
}

// 浏览器事件监听器
export class BrowserEventListener {
  private detector: OnboardingTriggerDetector;
  private userId: string;

  constructor(detector: OnboardingTriggerDetector, userId: string) {
    this.detector = detector;
    this.userId = userId;
    this.setupListeners();
  }

  private setupListeners(): void {
    // 页面可见性变?    document.addEventListener('visibilitychange', () => {
      this.detector.processEvent({
        type: 'idle_time',
        timestamp: Date.now(),
        data: {
          idleDuration: document.hidden ? Date.now() : 0,
          returnEngagement: !document.hidden,
          userAgent: navigator.userAgent,
        },
        userId: this.userId,
      });
    });

    // 页面访问
    const sendPageVisit = () => {
      this.detector.processEvent({
        type: 'page_visit',
        timestamp: Date.now(),
        data: {
          page: window.location.pathname,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
        },
        userId: this.userId,
      });
    };

    // 页面加载时发?    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', sendPageVisit);
    } else {
      sendPageVisit();
    }

    // 路由变化监听(适用于SPA)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      sendPageVisit();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      sendPageVisit();
    };

    // 点击事件监听
    document.addEventListener('click', event => {
      const target = event.target as HTMLElement;
      const featureId =
        target.dataset.featureId ||
        target.closest('[data-feature-id]')?.getAttribute('data-feature-id');

      if (featureId) {
        this.detector.processEvent({
          type: 'feature_interaction',
          timestamp: Date.now(),
          data: {
            featureId,
            elementType: target.tagName,
            userAgent: navigator.userAgent,
          },
          userId: this.userId,
        });
      }
    });

    // 首次登录检?    this.detectFirstLogin();
  }

  private detectFirstLogin(): void {
    const loginTimestamp = localStorage.getItem('firstLoginTimestamp');

    if (!loginTimestamp) {
      // 首次登录
      localStorage.setItem('firstLoginTimestamp', Date.now().toString());

      this.detector.processEvent({
        type: 'first_login',
        timestamp: Date.now(),
        data: {
          isNewUser: true,
          userAgent: navigator.userAgent,
        },
        userId: this.userId,
      });
    }
  }

  // 手动触发事件
  triggerEvent(type: TriggerEventType, data: any): void {
    this.detector.processEvent({
      type,
      timestamp: Date.now(),
      data: { ...data, userAgent: navigator.userAgent },
      userId: this.userId,
    });
  }
}
