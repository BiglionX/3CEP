/**
 * 用户行为分析服务
 * 提供用户行为追踪、分析和洞察功能
 */

// 用户行为事件接口
export interface UserBehaviorEvent {
  userId: string;
  sessionId: string;
  eventType:
    | 'page_view'
    | 'click'
    | 'form_submit'
    | 'search'
    | 'navigation'
    | 'api_call'
    | 'error';
  eventName: string;
  timestamp: Date;
  pageUrl?: string;
  elementId?: string;
  elementClass?: string;
  elementText?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  deviceInfo?: DeviceInfo;
  context?: Record<string, any>;
  duration?: number; // 事件持续时间（毫秒）
  metadata?: Record<string, any>;
}

// 设备信息接口
export interface DeviceInfo {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  screenSize?: string;
  viewportSize?: string;
}

// 用户会话接口
export interface UserSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  pageCount: number;
  events: UserBehaviorEvent[];
  conversionEvents: string[];
  exitPage?: string;
}

// 用户行为分析结果接口
export interface BehaviorAnalysisResult {
  userId: string;
  period: { start: Date; end: Date };
  sessionCount: number;
  totalEvents: number;
  eventTypes: Record<string, number>;
  popularPages: Array<{ url: string; count: number; avgDuration?: number }>;
  conversionRate: number;
  bounceRate: number;
  avgSessionDuration: number;
  userJourney: UserJourneyStep[];
  behavioralPatterns: BehavioralPattern[];
  recommendations: string[];
}

// 用户旅程步骤接口
export interface UserJourneyStep {
  step: number;
  pageUrl: string;
  entryCount: number;
  exitCount: number;
  avgTimeOnPage: number;
  nextSteps: Array<{ url: string; probability: number }>;
}

// 行为模式接口
export interface BehavioralPattern {
  patternId: string;
  name: string;
  description: string;
  frequency: number;
  users: string[];
  confidence: number;
  insights: string[];
}

// 行为分析配置接口
export interface BehaviorAnalysisConfig {
  retentionDays: number;
  sessionTimeout: number; // 会话超时时间（毫秒）
  batchSize: number;
  enableRealTime: boolean;
  trackConversionEvents: string[];
}

export class UserBehaviorAnalyzer {
  private static instance: UserBehaviorAnalyzer;
  private config: BehaviorAnalysisConfig;
  private sessions: Map<string, UserSession> = new Map();
  private userEvents: Map<string, UserBehaviorEvent[]> = new Map();
  private conversionEvents: Set<string> = new Set();
  private readonly MAX_SESSION_DURATION = 30 * 60 * 1000; // 30分钟

  private constructor(config?: Partial<BehaviorAnalysisConfig>) {
    this.config = {
      retentionDays: 30,
      sessionTimeout: 30 * 60 * 1000, // 30分钟
      batchSize: 100,
      enableRealTime: true,
      trackConversionEvents: ['purchase', 'signup', 'form_submit'],
      ...config,
    };

    // 初始化转化事?    this.config.trackConversionEvents.forEach(event =>
      this.conversionEvents.add(event)
    );
  }

  static getInstance(
    config?: Partial<BehaviorAnalysisConfig>
  ): UserBehaviorAnalyzer {
    if (!UserBehaviorAnalyzer.instance) {
      UserBehaviorAnalyzer.instance = new UserBehaviorAnalyzer(config);
    }
    return UserBehaviorAnalyzer.instance;
  }

  /**
   * 记录用户行为事件
   */
  recordEvent(event: Omit<UserBehaviorEvent, 'timestamp'>): void {
    const fullEvent: UserBehaviorEvent = {
      ...event,
      timestamp: new Date(),
    };

    // 存储事件
    if (!this.userEvents.has(event.userId)) {
      this.userEvents.set(event.userId, []);
    }
    this.userEvents.get(event.userId)!.push(fullEvent);

    // 更新会话信息
    this.updateSession(fullEvent);

    // 实时分析（如果启用）
    if (this.config.enableRealTime) {
      this.performRealTimeAnalysis(fullEvent);
    }
  }

  /**
   * 更新用户会话
   */
  private updateSession(event: UserBehaviorEvent): void {
    let session = this.sessions.get(event.sessionId);

    if (!session) {
      // 创建新会?      session = {
        sessionId: event.sessionId,
        userId: event.userId,
        startTime: event.timestamp,
        pageCount: 0,
        events: [],
        conversionEvents: [],
      };
      this.sessions.set(event.sessionId, session);
    }

    // 更新会话信息
    session.events.push(event);
    session.endTime = event.timestamp;
    session.duration = session.endTime.getTime() - session.startTime.getTime();

    // 更新页面计数
    if (event.eventType === 'page_view') {
      session.pageCount++;

      // 记录退出页?      if (session.events.length > 1) {
        const previousEvent = session.events[session.events.length - 2];
        if (previousEvent.eventType === 'page_view') {
          session.exitPage = previousEvent.pageUrl;
        }
      }
    }

    // 检查是否为转化事件
    if (this.conversionEvents.has(event.eventName)) {
      if (!session.conversionEvents.includes(event.eventName)) {
        session.conversionEvents.push(event.eventName);
      }
    }

    // 清理会话超时
    this.cleanupExpiredSessions();
  }

  /**
   * 清理会话超时
   */
  private cleanupExpiredSessions(): void {
    const cutoffTime = new Date(Date.now() - this.config.sessionTimeout);

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.endTime && session.endTime < cutoffTime) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * 实时分析
   */
  private performRealTimeAnalysis(event: UserBehaviorEvent): void {
    // 这里可以实现实时分析逻辑
    // 例如：异常行为检测、实时推荐等
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`实时分析事件: ${event.userId} - ${event.eventName}`)}

  /**
   * 分析用户行为
   */
  async analyzeUserBehavior(
    userId: string,
    days: number = 7
  ): Promise<BehaviorAnalysisResult> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - days * 24 * 60 * 60 * 1000);

    const userEvents = this.getUserEvents(userId, startTime, endTime);
    const userSessions = this.getUserSessions(userId, startTime, endTime);

    // 计算基本统计
    const sessionCount = userSessions.length;
    const totalEvents = userEvents.length;

    // 事件类型统计
    const eventTypes: Record<string, number> = {};
    userEvents.forEach(event => {
      eventTypes[event.eventType] = (eventTypes[event.eventType] || 0) + 1;
    });

    // 热门页面分析
    const pageViews = userEvents.filter(e => e.eventType === 'page_view');
    const popularPages = this.analyzePopularPages(pageViews);

    // 转化率计?    const conversionSessions = userSessions.filter(
      s => s.conversionEvents.length > 0
    );
    const conversionRate =
      sessionCount > 0 ? conversionSessions.length / sessionCount : 0;

    // 跳出率计?    const bounceSessions = userSessions.filter(s => s.pageCount <= 1);
    const bounceRate =
      sessionCount > 0 ? bounceSessions.length / sessionCount : 0;

    // 平均会话时长
    const avgSessionDuration =
      sessionCount > 0
        ? userSessions.reduce((sum, s) => sum + (s.duration || 0), 0) /
          sessionCount
        : 0;

    // 用户旅程分析
    const userJourney = this.analyzeUserJourney(userSessions);

    // 行为模式识别
    const behavioralPatterns = this.identifyBehavioralPatterns(
      userId,
      userEvents
    );

    // 生成推荐
    const recommendations = this.generateRecommendations(
      conversionRate,
      bounceRate,
      avgSessionDuration,
      popularPages,
      behavioralPatterns
    );

    return {
      userId,
      period: { start: startTime, end: endTime },
      sessionCount,
      totalEvents,
      eventTypes,
      popularPages,
      conversionRate,
      bounceRate,
      avgSessionDuration,
      userJourney,
      behavioralPatterns,
      recommendations,
    };
  }

  /**
   * 获取用户事件
   */
  private getUserEvents(
    userId: string,
    startTime: Date,
    endTime: Date
  ): UserBehaviorEvent[] {
    const allEvents = this.userEvents.get(userId) || [];
    return allEvents.filter(
      event => event.timestamp >= startTime && event.timestamp <= endTime
    );
  }

  /**
   * 获取用户会话
   */
  private getUserSessions(
    userId: string,
    startTime: Date,
    endTime: Date
  ): UserSession[] {
    return Array.from(this.sessions.values()).filter(
      session =>
        session.userId === userId &&
        session.startTime >= startTime &&
        session.startTime <= endTime
    );
  }

  /**
   * 分析热门页面
   */
  private analyzePopularPages(
    pageViews: UserBehaviorEvent[]
  ): Array<{ url: string; count: number; avgDuration?: number }> {
    const pageStats: Record<string, { count: number; durations: number[] }> =
      {};

    pageViews.forEach((event, index) => {
      if (!event.pageUrl) return;

      if (!pageStats[event.pageUrl]) {
        pageStats[event.pageUrl] = { count: 0, durations: [] };
      }

      pageStats[event.pageUrl].count++;

      // 计算页面停留时间
      if (index < pageViews.length - 1) {
        const nextEvent = pageViews[index + 1];
        if (nextEvent.pageUrl !== event.pageUrl) {
          const duration =
            nextEvent.timestamp.getTime() - event.timestamp.getTime();
          if (duration > 0 && duration < 30 * 60 * 1000) {
            // 最?0分钟
            pageStats[event.pageUrl].durations.push(duration);
          }
        }
      }
    });

    return Object.entries(pageStats)
      .map(([url, stats]) => ({
        url,
        count: stats.count,
        avgDuration:
          stats.durations.length > 0
            ? stats.durations.reduce((a, b) => a + b, 0) /
              stats.durations.length
            : undefined,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * 分析用户旅程
   */
  private analyzeUserJourney(sessions: UserSession[]): UserJourneyStep[] {
    const journeyMap: Record<
      string,
      {
        entryCount: number;
        exitCount: number;
        totalTime: number;
        transitions: Record<string, number>;
      }
    > = {};

    sessions.forEach(session => {
      const pageViews = session.events.filter(e => e.eventType === 'page_view');

      pageViews.forEach((event, index) => {
        if (!event.pageUrl) return;

        if (!journeyMap[event.pageUrl]) {
          journeyMap[event.pageUrl] = {
            entryCount: 0,
            exitCount: 0,
            totalTime: 0,
            transitions: {},
          };
        }

        // 统计入口页面
        if (index === 0) {
          journeyMap[event.pageUrl].entryCount++;
        }

        // 统计出口页面
        if (index === pageViews.length - 1) {
          journeyMap[event.pageUrl].exitCount++;
        }

        // 统计页面转换
        if (index < pageViews.length - 1) {
          const nextPage = pageViews[index + 1].pageUrl;
          if (nextPage) {
            journeyMap[event.pageUrl].transitions[nextPage] =
              (journeyMap[event.pageUrl].transitions[nextPage] || 0) + 1;
          }

          // 计算页面停留时间
          const nextEvent = pageViews[index + 1];
          const duration =
            nextEvent.timestamp.getTime() - event.timestamp.getTime();
          if (duration > 0 && duration < 30 * 60 * 1000) {
            journeyMap[event.pageUrl].totalTime += duration;
          }
        }
      });
    });

    // 转换为旅程步?    return Object.entries(journeyMap)
      .map(([pageUrl, stats], index) => {
        const totalTransitions = Object.values(stats.transitions).reduce(
          (a, b) => a + b,
          0
        );
        const nextSteps = Object.entries(stats.transitions)
          .map(([nextUrl, count]) => ({
            url: nextUrl,
            probability: totalTransitions > 0 ? count / totalTransitions : 0,
          }))
          .sort((a, b) => b.probability - a.probability)
          .slice(0, 3);

        return {
          step: index + 1,
          pageUrl,
          entryCount: stats.entryCount,
          exitCount: stats.exitCount,
          avgTimeOnPage:
            stats.entryCount > 0 ? stats.totalTime / stats.entryCount : 0,
          nextSteps,
        };
      })
      .sort((a, b) => b.entryCount - a.entryCount);
  }

  /**
   * 识别行为模式
   */
  private identifyBehavioralPatterns(
    userId: string,
    events: UserBehaviorEvent[]
  ): BehavioralPattern[] {
    const patterns: BehavioralPattern[] = [];

    // 识别高频访问模式
    const hourlyActivity: number[] = new Array(24).fill(0);
    events.forEach(event => {
      const hour = event.timestamp.getHours();
      hourlyActivity[hour]++;
    });

    const peakHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));
    if (hourlyActivity[peakHour] > events.length * 0.3) {
      // 超过30%的活动集中在某个小时
      patterns.push({
        patternId: 'time_concentration',
        name: '时间集中模式',
        description: `用户主要?{peakHour}点活跃`,
        frequency: hourlyActivity[peakHour] / events.length,
        users: [userId],
        confidence: 0.8,
        insights: [`建议?{peakHour}点推送相关内容`],
      });
    }

    // 识别页面浏览深度
    const pageViews = events.filter(e => e.eventType === 'page_view');
    const avgPagesPerSession =
      this.getUserSessions(userId, new Date(0), new Date()).reduce(
        (sum, session) => sum + session.pageCount,
        0
      ) / this.getUserSessions(userId, new Date(0), new Date()).length;

    if (avgPagesPerSession > 5) {
      patterns.push({
        patternId: 'deep_browsing',
        name: '深度浏览模式',
        description: '用户喜欢深度浏览网站内容',
        frequency: 1,
        users: [userId],
        confidence: 0.9,
        insights: ['适合推荐相关内容', '可以增加内容层级'],
      });
    }

    return patterns;
  }

  /**
   * 生成推荐建议
   */
  private generateRecommendations(
    conversionRate: number,
    bounceRate: number,
    avgSessionDuration: number,
    popularPages: Array<{ url: string; count: number }>,
    patterns: BehavioralPattern[]
  ): string[] {
    const recommendations: string[] = [];

    if (conversionRate < 0.02) {
      recommendations.push('转化率较低，建议优化转化漏斗');
    }

    if (bounceRate > 0.7) {
      recommendations.push('跳出率较高，建议优化着陆页体验');
    }

    if (avgSessionDuration < 60000) {
      // 少于1分钟
      recommendations.push('平均会话时长较短，建议增加内容吸引力');
    }

    if (popularPages.length > 0) {
      const topPage = popularPages[0];
      recommendations.push(
        `最受欢迎页? ${topPage.url}，建议以此为基础优化其他页面`
      );
    }

    patterns.forEach(pattern => {
      recommendations.push(...pattern.insights);
    });

    return recommendations.slice(0, 5); // 限制建议数量
  }

  /**
   * 获取会话统计
   */
  getSessionStats(days: number = 7): Record<string, any> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - days * 24 * 60 * 60 * 1000);

    const recentSessions = Array.from(this.sessions.values()).filter(
      session => session.startTime >= startTime && session.startTime <= endTime
    );

    const totalSessions = recentSessions.length;
    const convertedSessions = recentSessions.filter(
      s => s.conversionEvents.length > 0
    ).length;
    const bouncedSessions = recentSessions.filter(s => s.pageCount <= 1).length;

    const avgDuration =
      totalSessions > 0
        ? recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0) /
          totalSessions
        : 0;

    return {
      totalSessions,
      conversionRate: totalSessions > 0 ? convertedSessions / totalSessions : 0,
      bounceRate: totalSessions > 0 ? bouncedSessions / totalSessions : 0,
      avgSessionDuration: avgDuration,
      avgPagesPerSession:
        totalSessions > 0
          ? recentSessions.reduce((sum, s) => sum + s.pageCount, 0) /
            totalSessions
          : 0,
    };
  }

  /**
   * 清理过期数据
   */
  cleanupOldData(): void {
    const cutoffDate = new Date(
      Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000
    );

    // 清理过期事件
    for (const [userId, events] of this.userEvents.entries()) {
      const filteredEvents = events.filter(
        event => event.timestamp > cutoffDate
      );
      this.userEvents.set(userId, filteredEvents);
    }

    // 清理过期会话
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.startTime < cutoffDate) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * 导出用户行为报告
   */
  async exportBehaviorReport(
    userId: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    const analysis = await this.analyzeUserBehavior(userId);

    if (format === 'json') {
      return JSON.stringify(analysis, null, 2);
    } else {
      // CSV格式导出（简化版本）
      return this.convertToCSV(analysis);
    }
  }

  private convertToCSV(data: any): string {
    // 简化的CSV转换逻辑
    return JSON.stringify(data, null, 2);
  }

  /**
   * 设置配置
   */
  setConfig(config: Partial<BehaviorAnalysisConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): BehaviorAnalysisConfig {
    return { ...this.config };
  }
}

// 导出默认实例
export const userBehaviorAnalyzer = UserBehaviorAnalyzer.getInstance();
