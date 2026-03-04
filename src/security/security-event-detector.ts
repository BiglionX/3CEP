/**
 * 安全事件检测引? * 实现实时安全威胁检测和异常行为识别
 */

import { createClient } from '@supabase/supabase-js';

// 安全事件类型枚举
export enum SecurityEventType {
  LOGIN_ATTEMPT = 'login_attempt',
  FAILED_LOGIN = 'failed_login',
  SUCCESSFUL_LOGIN = 'successful_login',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  DATA_ACCESS = 'data_access',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  BRUTE_FORCE = 'brute_force',
  SQL_INJECTION = 'sql_injection',
  XSS_ATTACK = 'xss_attack',
  CSRF_ATTEMPT = 'csrf_attempt',
  ACCOUNT_LOCKOUT = 'account_lockout',
  SESSION_HIJACKING = 'session_hijacking',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_EXFILTRATION = 'data_exfiltration',
  MALWARE_DETECTED = 'malware_detected',
}

// 威胁等级枚举
export enum ThreatLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// 安全事件接口
export interface SecurityEvent {
  id: string;
  eventType: SecurityEventType;
  threatLevel: ThreatLevel;
  userId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details: Record<string, any>;
  location?: {
    country: string;
    region: string;
    city: string;
    coordinates?: [number, number];
  };
  riskScore: number; // 0-100的风险评?  correlationId?: string; // 关联ID，用于关联相关事?}

// 检测规则接?export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  eventType: SecurityEventType;
  condition: (event: SecurityEvent) => boolean;
  threatLevel: ThreatLevel;
  confidence: number; // 0-1的置信度
  remediationSteps: string[];
  enabled: boolean;
}

// 行为基线接口
export interface BehavioralBaseline {
  userId: string;
  normalLoginTimes: number[]; // 正常登录时间段（小时?  normalLocations: string[]; // 正常登录地点
  normalDevices: string[]; // 正常设备类型
  averageSessionDuration: number; // 平均会话时长
  typicalAccessPatterns: string[]; // 典型访问模式
  lastUpdated: Date;
}

// 异常检测结果接?export interface AnomalyDetectionResult {
  eventId: string;
  isAnomalous: boolean;
  anomalyScore: number; // 0-1的异常分?  detectedPatterns: string[];
  confidence: number;
  explanation: string;
  recommendations: string[];
}

export class SecurityEventDetector {
  private supabase: any;
  private detectionRules: Map<string, DetectionRule> = new Map();
  private behavioralBaselines: Map<string, BehavioralBaseline> = new Map();
  private eventBuffer: SecurityEvent[] = [];
  private readonly BUFFER_SIZE = 1000;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    this.initializeDetectionRules();
    this.loadBehavioralBaselines();
  }

  /**
   * 初始化检测规?   */
  private initializeDetectionRules(): void {
    const rules: DetectionRule[] = [
      {
        id: 'brute_force_login',
        name: '暴力破解检?,
        description: '检测短时间内大量失败登录尝?,
        eventType: SecurityEventType.FAILED_LOGIN,
        condition: (event: SecurityEvent) => {
          // 检查同一IP在短时间内失败次?          const recentEvents = this.getRecentEvents(
            event.ipAddress,
            SecurityEventType.FAILED_LOGIN,
            300000 // 5分钟
          );
          return recentEvents.length >= 5;
        },
        threatLevel: ThreatLevel.HIGH,
        confidence: 0.9,
        remediationSteps: [
          '临时封禁该IP地址',
          '通知安全团队',
          '检查账户锁定策?,
          '审查登录日志',
        ],
        enabled: true,
      },
      {
        id: 'suspicious_location',
        name: '异地登录检?,
        description: '检测与用户常规位置不符的登录行?,
        eventType: SecurityEventType.LOGIN_ATTEMPT,
        condition: (event: SecurityEvent) => {
          if (!event.userId) return false;

          const baseline = this.behavioralBaselines.get(event.userId);
          if (!baseline || !event.location) return false;

          // 检查是否在常规地点之外登录
          return !baseline.normalLocations.includes(event.location.country);
        },
        threatLevel: ThreatLevel.MEDIUM,
        confidence: 0.7,
        remediationSteps: [
          '验证用户身份',
          '发送安全提?,
          '记录异常登录',
          '考虑二次验证',
        ],
        enabled: true,
      },
      {
        id: 'unusual_time_access',
        name: '异常时间访问',
        description: '检测非正常工作时间的敏感操?,
        eventType: SecurityEventType.DATA_ACCESS,
        condition: (event: SecurityEvent) => {
          const hour = event.timestamp.getHours();
          // 非工作时间（晚上9点到早上7点）
          return hour < 7 || hour > 21;
        },
        threatLevel: ThreatLevel.MEDIUM,
        confidence: 0.6,
        remediationSteps: [
          '记录详细访问日志',
          '通知相关人员',
          '审查访问权限',
          '加强监控',
        ],
        enabled: true,
      },
      {
        id: 'sql_injection_pattern',
        name: 'SQL注入检?,
        description: '检测包含SQL注入特征的输?,
        eventType: SecurityEventType.SQL_INJECTION,
        condition: (event: SecurityEvent) => {
          const suspiciousPatterns = [
            /('|(\\')|(;)|(\\;))/i,
            /(union|select|insert|delete|update|drop|create|alter)/i,
            /(\b(UNION|SELECT|INSERT|DELETE|UPDATE|DROP|CREATE|ALTER)\b)/i,
          ];

          const input = event.details.input || '';
          return suspiciousPatterns.some(pattern => pattern.test(input));
        },
        threatLevel: ThreatLevel.CRITICAL,
        confidence: 0.95,
        remediationSteps: [
          '立即阻断请求',
          '记录攻击详情',
          '通知安全团队',
          '审查输入验证',
          '更新WAF规则',
        ],
        enabled: true,
      },
      {
        id: 'xss_detection',
        name: '跨站脚本攻击检?,
        description: '检测包含XSS攻击特征的输?,
        eventType: SecurityEventType.XSS_ATTACK,
        condition: (event: SecurityEvent) => {
          const xssPatterns = [
            /(<script|<\/script|<iframe|<\/iframe|javascript:|on\w+=)/i,
            /(%3C|%3E|&lt;|&gt;)/i,
            /(document\.|window\.|eval\(|alert\(|prompt\()/i,
          ];

          const input = event.details.input || '';
          return xssPatterns.some(pattern => pattern.test(input));
        },
        threatLevel: ThreatLevel.HIGH,
        confidence: 0.9,
        remediationSteps: [
          '过滤恶意脚本',
          '编码输出内容',
          '更新内容安全策略',
          '审查前端验证',
        ],
        enabled: true,
      },
    ];

    rules.forEach(rule => {
      this.detectionRules.set(rule.id, rule);
    });
  }

  /**
   * 加载用户行为基线
   */
  private async loadBehavioralBaselines(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('user_behavior_baselines')
        .select('*');

      if (error) {
        console.warn('加载行为基线失败:', error);
        return;
      }

      data?.forEach((baseline: any) => {
        this.behavioralBaselines.set(baseline.user_id, {
          userId: baseline.user_id,
          normalLoginTimes: baseline.normal_login_times || [],
          normalLocations: baseline.normal_locations || [],
          normalDevices: baseline.normal_devices || [],
          averageSessionDuration: baseline.average_session_duration || 0,
          typicalAccessPatterns: baseline.typical_access_patterns || [],
          lastUpdated: new Date(baseline.updated_at),
        });
      });
    } catch (error) {
      console.error('加载行为基线异常:', error);
    }
  }

  /**
   * 检测安全事?   */
  async detectSecurityEvent(
    event: SecurityEvent
  ): Promise<SecurityEvent | null> {
    // 将事件添加到缓冲?    this.addToEventBuffer(event);

    // 应用检测规?    for (const [ruleId, rule] of this.detectionRules.entries()) {
      if (!rule.enabled) continue;

      if (rule.eventType === event.eventType && rule.condition(event)) {
        // 检测到安全威胁
        const enrichedEvent = this.enrichEventWithThreatInfo(event, rule);
        await this.persistSecurityEvent(enrichedEvent);
        return enrichedEvent;
      }
    }

    // 如果是登录事件，进行异常行为分析
    if (event.eventType === SecurityEventType.LOGIN_ATTEMPT) {
      const anomalyResult = await this.analyzeBehavioralAnomaly(event);
      if (anomalyResult.isAnomalous) {
        const anomalousEvent = this.createAnomalyEvent(event, anomalyResult);
        await this.persistSecurityEvent(anomalousEvent);
        return anomalousEvent;
      }
    }

    return null;
  }

  /**
   * 丰富事件的威胁信?   */
  private enrichEventWithThreatInfo(
    event: SecurityEvent,
    rule: DetectionRule
  ): SecurityEvent {
    return {
      ...event,
      threatLevel: rule.threatLevel,
      riskScore: this.calculateRiskScore(event, rule),
      correlationId: this.generateCorrelationId(),
      details: {
        ...event.details,
        detectionRule: rule.id,
        confidence: rule.confidence,
        remediationSteps: rule.remediationSteps,
      },
    };
  }

  /**
   * 计算风险评分
   */
  private calculateRiskScore(
    event: SecurityEvent,
    rule: DetectionRule
  ): number {
    let baseScore = 0;

    // 根据威胁等级设置基础分数
    switch (rule.threatLevel) {
      case ThreatLevel.LOW:
        baseScore = 25;
        break;
      case ThreatLevel.MEDIUM:
        baseScore = 50;
        break;
      case ThreatLevel.HIGH:
        baseScore = 75;
        break;
      case ThreatLevel.CRITICAL:
        baseScore = 95;
        break;
    }

    // 根据置信度调?    baseScore *= rule.confidence;

    // 根据事件特征调整
    if (event.ipAddress && this.isKnownMaliciousIP(event.ipAddress)) {
      baseScore += 20;
    }

    if (event.location && this.isHighRiskLocation(event.location.country)) {
      baseScore += 15;
    }

    return Math.min(100, Math.max(0, Math.round(baseScore)));
  }

  /**
   * 分析行为异常
   */
  private async analyzeBehavioralAnomaly(
    event: SecurityEvent
  ): Promise<AnomalyDetectionResult> {
    if (!event.userId) {
      return {
        eventId: event.id,
        isAnomalous: false,
        anomalyScore: 0,
        detectedPatterns: [],
        confidence: 0,
        explanation: '无用户ID，无法进行行为分?,
        recommendations: [],
      };
    }

    const baseline = this.behavioralBaselines.get(event.userId);
    if (!baseline) {
      return {
        eventId: event.id,
        isAnomalous: false,
        anomalyScore: 0,
        detectedPatterns: [],
        confidence: 0,
        explanation: '用户无行为基线数?,
        recommendations: ['建立用户行为基线'],
      };
    }

    const detectedPatterns: string[] = [];
    let anomalyScore = 0;

    // 时间异常检?    const loginHour = event.timestamp.getHours();
    if (!baseline.normalLoginTimes.includes(loginHour)) {
      detectedPatterns.push('异常登录时间');
      anomalyScore += 0.3;
    }

    // 地理位置异常检?    if (
      event.location &&
      !baseline.normalLocations.includes(event.location.country)
    ) {
      detectedPatterns.push('异常登录地点');
      anomalyScore += 0.4;
    }

    // 设备异常检?    const userAgent = event.userAgent.toLowerCase();
    const isNormalDevice = baseline.normalDevices.some(device =>
      userAgent.includes(device.toLowerCase())
    );
    if (!isNormalDevice) {
      detectedPatterns.push('异常设备类型');
      anomalyScore += 0.3;
    }

    const isAnomalous = anomalyScore > 0.5;
    const confidence = Math.min(0.95, anomalyScore + 0.2);

    return {
      eventId: event.id,
      isAnomalous,
      anomalyScore,
      detectedPatterns,
      confidence,
      explanation: isAnomalous
        ? `检测到${detectedPatterns.join('�?)}等异常行为模式`
        : '行为模式符合基线',
      recommendations: isAnomalous
        ? ['验证用户身份', '发送安全提?, '加强监控']
        : [],
    };
  }

  /**
   * 创建异常事件
   */
  private createAnomalyEvent(
    event: SecurityEvent,
    result: AnomalyDetectionResult
  ): SecurityEvent {
    return {
      ...event,
      eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
      threatLevel:
        result.anomalyScore > 0.8 ? ThreatLevel.HIGH : ThreatLevel.MEDIUM,
      riskScore: Math.round(result.anomalyScore * 100),
      correlationId: this.generateCorrelationId(),
      details: {
        ...event.details,
        anomalyDetection: result,
        behavioralAnalysis: true,
      },
    };
  }

  /**
   * 获取近期事件
   */
  private getRecentEvents(
    ipAddress: string,
    eventType: SecurityEventType,
    timeWindow: number
  ): SecurityEvent[] {
    const cutoffTime = Date.now() - timeWindow;

    return this.eventBuffer.filter(
      event =>
        event.ipAddress === ipAddress &&
        event.eventType === eventType &&
        event.timestamp.getTime() > cutoffTime
    );
  }

  /**
   * 添加事件到缓冲区
   */
  private addToEventBuffer(event: SecurityEvent): void {
    this.eventBuffer.push(event);

    // 维护缓冲区大?    if (this.eventBuffer.length > this.BUFFER_SIZE) {
      this.eventBuffer.shift();
    }

    // 定期清理过期事件
    this.cleanupExpiredEvents();
  }

  /**
   * 清理过期事件
   */
  private cleanupExpiredEvents(): void {
    const oneHourAgo = Date.now() - 3600000; // 1小时?    this.eventBuffer = this.eventBuffer.filter(
      event => event.timestamp.getTime() > oneHourAgo
    );
  }

  /**
   * 持久化安全事?   */
  private async persistSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      (await this.supabase.from('security_events').insert({
        id: event.id,
        event_type: event.eventType,
        threat_level: event.threatLevel,
        user_id: event.userId,
        session_id: event.sessionId,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        timestamp: event.timestamp.toISOString(),
        details: event.details,
        location: event.location,
        risk_score: event.riskScore,
        correlation_id: event.correlationId,
      })) as any;
    } catch (error) {
      console.error('保存安全事件失败:', error);
    }
  }

  /**
   * 辅助方法：检查恶意IP
   */
  private isKnownMaliciousIP(ip: string): boolean {
    // 这里应该集成IP黑名单服?    const knownMaliciousIPs = [
      // 示例恶意IP列表
      '192.168.1.100',
      '10.0.0.1',
    ];
    return knownMaliciousIPs.includes(ip);
  }

  /**
   * 辅助方法：检查高风险地区
   */
  private isHighRiskLocation(country: string): boolean {
    const highRiskCountries = ['XX', 'YY']; // 示例高风险国家代?    return highRiskCountries.includes(country);
  }

  /**
   * 生成关联ID
   */
  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取活动检测规?   */
  getActiveRules(): DetectionRule[] {
    return Array.from(this.detectionRules.values()).filter(
      rule => rule.enabled
    );
  }

  /**
   * 更新检测规?   */
  updateRule(ruleId: string, updates: Partial<DetectionRule>): void {
    const rule = this.detectionRules.get(ruleId);
    if (rule) {
      this.detectionRules.set(ruleId, { ...rule, ...updates });
    }
  }
}
