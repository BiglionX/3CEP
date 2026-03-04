/**
 * 异常行为分析模块
 * 基于机器学习和统计分析的用户行为异常检? */

import {
  SecurityEvent,
  SecurityEventType,
  ThreatLevel,
} from './security-event-detector';

// 用户行为特征向量
export interface UserBehaviorVector {
  userId: string;
  timestamp: Date;
  features: {
    // 时间特征
    hourOfDay: number;
    dayOfWeek: number;
    isWeekend: boolean;
    isHoliday: boolean;

    // 地理特征
    country: string;
    region: string;
    city: string;
    latitude?: number;
    longitude?: number;

    // 设备特征
    deviceType: string;
    os: string;
    browser: string;
    userAgentHash: string;

    // 行为特征
    sessionDuration: number;
    pagesVisited: number;
    actionsPerformed: number;
    dataAccessed: number;
    errorRate: number;

    // 网络特征
    ipAddress: string;
    connectionType: string;
    isp: string;

    // 访问模式特征
    accessFrequency: number; // 单位时间内访问次?    typicalResources: string[]; // 常访问资?    unusualPaths: string[]; // 不常见访问路?  };
}

// 异常检测模型配?export interface AnomalyModelConfig {
  algorithm:
    | 'isolation_forest'
    | 'one_class_svm'
    | 'autoencoder'
    | 'statistical';
  contamination: number; // 异常比例预期 (0-1)
  featureWeights: Record<string, number>; // 特征权重
  sensitivity: number; // 敏感?(0-1)
  learningRate: number; // 学习?  windowSize: number; // 滑动窗口大小
}

// 异常检测结?export interface BehaviorAnomalyResult {
  userId: string;
  timestamp: Date;
  isAnomalous: boolean;
  anomalyScore: number; // 0-1的异常分?  confidence: number; // 置信?  contributingFeatures: Array<{
    feature: string;
    value: any;
    contribution: number;
    deviation: number; // 与基线的偏差
  }>;
  clusterId?: string; // 所属聚类ID
  nearestNeighbors?: string[]; // 最近邻用户
  explanation: string;
  recommendations: string[];
  severity: ThreatLevel;
}

// 用户行为集群
export interface UserBehaviorCluster {
  clusterId: string;
  centroid: Record<string, number>;
  memberCount: number;
  characteristics: string[];
  typicalBehaviors: string[];
  outlierThreshold: number;
}

export class AnomalyBehaviorAnalyzer {
  private behaviorVectors: Map<string, UserBehaviorVector[]> = new Map();
  private clusters: Map<string, UserBehaviorCluster> = new Map();
  private baselines: Map<string, UserBehaviorVector> = new Map();
  private modelConfigs: Map<string, AnomalyModelConfig> = new Map();
  private readonly MAX_HISTORY_SIZE = 1000;
  private readonly CLUSTER_UPDATE_INTERVAL = 3600000; // 1小时

  constructor() {
    this.initializeModelConfigs();
    this.loadHistoricalData();
  }

  /**
   * 初始化模型配?   */
  private initializeModelConfigs(): void {
    // 为不同类型的行为设置不同的检测模?    this.modelConfigs.set('login_behavior', {
      algorithm: 'isolation_forest',
      contamination: 0.1,
      featureWeights: {
        hourOfDay: 0.2,
        country: 0.3,
        deviceType: 0.2,
        userAgentHash: 0.15,
        sessionDuration: 0.15,
      },
      sensitivity: 0.8,
      learningRate: 0.01,
      windowSize: 50,
    });

    this.modelConfigs.set('data_access', {
      algorithm: 'statistical',
      contamination: 0.05,
      featureWeights: {
        accessFrequency: 0.4,
        unusualPaths: 0.3,
        dataAccessed: 0.2,
        errorRate: 0.1,
      },
      sensitivity: 0.7,
      learningRate: 0.02,
      windowSize: 100,
    });

    this.modelConfigs.set('session_behavior', {
      algorithm: 'one_class_svm',
      contamination: 0.15,
      featureWeights: {
        sessionDuration: 0.3,
        pagesVisited: 0.25,
        actionsPerformed: 0.25,
        errorRate: 0.2,
      },
      sensitivity: 0.75,
      learningRate: 0.015,
      windowSize: 30,
    });
  }

  /**
   * 加载历史数据
   */
  private async loadHistoricalData(): Promise<void> {
    try {
      // 从数据库加载用户行为历史数据
      // 这里应该是异步数据库查询
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('加载历史行为数据...')} catch (error) {
      console.error('加载历史数据失败:', error);
    }
  }

  /**
   * 分析用户行为向量
   */
  async analyzeUserBehavior(
    event: SecurityEvent
  ): Promise<BehaviorAnomalyResult> {
    const behaviorVector = this.extractBehaviorVector(event);

    // 更新用户历史行为
    this.updateUserHistory(behaviorVector);

    // 选择合适的检测模?    const modelType = this.getModelTypeForEvent(event.eventType);
    const config = this.modelConfigs.get(modelType) || this.getDefaultConfig();

    // 执行异常检?    const result = await this.detectAnomaly(behaviorVector, config);

    // 丰富结果信息
    return this.enrichAnomalyResult(result, behaviorVector, event);
  }

  /**
   * 提取行为特征向量
   */
  private extractBehaviorVector(event: SecurityEvent): UserBehaviorVector {
    const timestamp = event.timestamp;

    return {
      userId: event.userId || 'anonymous',
      timestamp,
      features: {
        // 时间特征
        hourOfDay: timestamp.getHours(),
        dayOfWeek: timestamp.getDay(),
        isWeekend: timestamp.getDay() === 0 || timestamp.getDay() === 6,
        isHoliday: this.isHoliday(timestamp),

        // 地理特征
        country: event?.country || 'unknown',
        region: event?.region || 'unknown',
        city: event?.city || 'unknown',
        latitude: event?.coordinates?.[0],
        longitude: event?.coordinates?.[1],

        // 设备特征
        deviceType: this.extractDeviceType(event.userAgent),
        os: this.extractOS(event.userAgent),
        browser: this.extractBrowser(event.userAgent),
        userAgentHash: this.hashString(event.userAgent),

        // 行为特征（从事件详情中提取）
        sessionDuration: event.details.sessionDuration || 0,
        pagesVisited: event.details.pagesVisited || 0,
        actionsPerformed: event.details.actionsPerformed || 0,
        dataAccessed: event.details.dataAccessed || 0,
        errorRate: event.details.errorRate || 0,

        // 网络特征
        ipAddress: event.ipAddress,
        connectionType: event.details.connectionType || 'unknown',
        isp: event.details.isp || 'unknown',

        // 访问模式特征
        accessFrequency: this.calculateAccessFrequency(
          event.userId!,
          timestamp
        ),
        typicalResources: this.getTypicalResources(event.userId!),
        unusualPaths: this.detectUnusualPaths(event.details.resourcePath),
      },
    };
  }

  /**
   * 更新用户历史行为
   */
  private updateUserHistory(vector: UserBehaviorVector): void {
    const userId = vector.userId;

    if (!this.behaviorVectors.has(userId)) {
      this.behaviorVectors.set(userId, []);
    }

    const userHistory = this.behaviorVectors.get(userId)!;
    userHistory.push(vector);

    // 维护历史记录大小
    if (userHistory.length > this.MAX_HISTORY_SIZE) {
      userHistory.shift();
    }

    // 更新用户基线
    this.updateUserBaseline(userId);

    // 定期更新聚类
    if (Date.now() % this.CLUSTER_UPDATE_INTERVAL === 0) {
      this.updateClusters();
    }
  }

  /**
   * 更新用户行为基线
   */
  private updateUserBaseline(userId: string): void {
    const history = this.behaviorVectors.get(userId);
    if (!history || history.length < 10) return; // 需要足够的历史数据

    // 计算数值特征的统计基线
    const numericFeatures = [
      'hourOfDay',
      'sessionDuration',
      'pagesVisited',
      'actionsPerformed',
      'dataAccessed',
      'errorRate',
      'accessFrequency',
    ];

    const baseline: Partial<UserBehaviorVector['features']> = {};

    numericFeatures.forEach(feature => {
      const values = history
        .map(h => h.features[feature as keyof typeof h.features])
        .filter(val => typeof val === 'number') as number[];

      if (values.length > 0) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const stdDev = Math.sqrt(
          values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) /
            values.length
        );

        baseline[feature as keyof typeof baseline] = {
          mean,
          stdDev,
          min: Math.min(...values),
          max: Math.max(...values),
        } as any;
      }
    });

    // 对于分类特征，计算最常见的?    const categoricalFeatures = ['country', 'deviceType', 'os', 'browser'];
    categoricalFeatures.forEach(feature => {
      const counts: Record<string, number> = {};
      history.forEach(h => {
        const value = h.features[feature as keyof typeof h.features] as string;
        counts[value] = (counts[value] || 0) + 1;
      });

      const mostCommon =
        Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
        'unknown';

      baseline[feature as keyof typeof baseline] = mostCommon as any;
    });

    // 保存基线
    this.baselines.set(userId, {
      userId,
      timestamp: new Date(),
      features: baseline as UserBehaviorVector['features'],
    } as UserBehaviorVector);
  }

  /**
   * 检测异常行?   */
  private async detectAnomaly(
    vector: UserBehaviorVector,
    config: AnomalyModelConfig
  ): Promise<
    Omit<BehaviorAnomalyResult, 'explanation' | 'recommendations' | 'severity'>
  > {
    const userId = vector.userId;
    const baseline = this.baselines.get(userId);

    if (!baseline) {
      // 没有基线数据，使用默认阈?      return {
        userId,
        timestamp: vector.timestamp,
        isAnomalous: false,
        anomalyScore: 0.1,
        confidence: 0.3,
        contributingFeatures: [],
      };
    }

    // 计算各特征的偏离程度
    const deviations: Array<{
      feature: string;
      value: any;
      contribution: number;
      deviation: number;
    }> = [];

    let totalWeightedDeviation = 0;
    let totalWeight = 0;

    // 分析数值特?    const numericFeatures = [
      'hourOfDay',
      'sessionDuration',
      'pagesVisited',
      'actionsPerformed',
    ];
    numericFeatures.forEach(feature => {
      const weight = config.featureWeights[feature] || 0.1;
      const currentValue = vector.features[
        feature as keyof typeof vector.features
      ] as number;
      const baselineStats = baseline.features[
        feature as keyof typeof baseline.features
      ] as any;

      if (baselineStats && typeof baselineStats === 'object') {
        const deviation =
          Math.abs(currentValue - baselineStats.mean) /
          (baselineStats.stdDev || 1);
        const normalizedDeviation = Math.min(deviation / 3, 1); // 标准化到0-1

        deviations.push({
          feature,
          value: currentValue,
          contribution: weight * normalizedDeviation,
          deviation: normalizedDeviation,
        });

        totalWeightedDeviation += weight * normalizedDeviation;
        totalWeight += weight;
      }
    });

    // 分析分类特征
    const categoricalFeatures = ['country', 'deviceType', 'os'];
    categoricalFeatures.forEach(feature => {
      const weight = config.featureWeights[feature] || 0.1;
      const currentValue = vector.features[
        feature as keyof typeof vector.features
      ] as string;
      const baselineValue = baseline.features[
        feature as keyof typeof baseline.features
      ] as string;

      const deviation = currentValue === baselineValue ? 0 : 1;

      deviations.push({
        feature,
        value: currentValue,
        contribution: weight * deviation,
        deviation,
      });

      totalWeightedDeviation += weight * deviation;
      totalWeight += weight;
    });

    const anomalyScore =
      totalWeight > 0 ? totalWeightedDeviation / totalWeight : 0;
    const isAnomalous = anomalyScore > 1 - config.sensitivity;
    const confidence = Math.min(0.95, anomalyScore + 0.1);

    return {
      userId,
      timestamp: vector.timestamp,
      isAnomalous,
      anomalyScore,
      confidence,
      contributingFeatures: deviations
        .sort((a, b) => b.contribution - a.contribution)
        .slice(0, 5), // 取贡献最大的5个特?    };
  }

  /**
   * 丰富异常检测结?   */
  private enrichAnomalyResult(
    result: Omit<
      BehaviorAnomalyResult,
      'explanation' | 'recommendations' | 'severity'
    >,
    vector: UserBehaviorVector,
    event: SecurityEvent
  ): BehaviorAnomalyResult {
    let explanation = '';
    const recommendations: string[] = [];
    let severity = ThreatLevel.LOW;

    if (result.isAnomalous) {
      const topContributors = result.contributingFeatures
        .slice(0, 3)
        .map(f => `${f.feature}(${f.value})`)
        .join(', ');

      explanation = `检测到异常行为模式: ${topContributors} 显著偏离正常行为`;

      // 根据异常分数确定严重程度
      if (result.anomalyScore > 0.8) {
        severity = ThreatLevel.CRITICAL;
        recommendations.push('立即阻止用户访问');
        recommendations.push('通知安全团队紧急响?);
      } else if (result.anomalyScore > 0.6) {
        severity = ThreatLevel.HIGH;
        recommendations.push('要求用户重新验证身份');
        recommendations.push('临时限制敏感操作权限');
      } else if (result.anomalyScore > 0.4) {
        severity = ThreatLevel.MEDIUM;
        recommendations.push('记录详细行为日志');
        recommendations.push('发送安全提醒给用户');
      } else {
        severity = ThreatLevel.LOW;
        recommendations.push('持续监控用户行为');
        recommendations.push('收集更多行为数据以优化模?);
      }

      // 根据具体事件类型添加针对性建?      switch (event.eventType) {
        case SecurityEventType.LOGIN_ATTEMPT:
          recommendations.push('检查登录时间和地理位置');
          break;
        case SecurityEventType.DATA_ACCESS:
          recommendations.push('审查数据访问权限');
          recommendations.push('监控敏感数据操作');
          break;
        case SecurityEventType.PRIVILEGE_ESCALATION:
          recommendations.push('严格审查权限提升请求');
          recommendations.push('实施最小权限原?);
          break;
      }
    } else {
      explanation = '用户行为符合历史模式，在正常范围?;
      severity = ThreatLevel.LOW;
      recommendations.push('继续保持当前监控级别');
    }

    return {
      ...result,
      explanation,
      recommendations,
      severity,
    };
  }

  /**
   * 更新用户聚类
   */
  private updateClusters(): void {
    // 实现用户行为聚类算法
    // 这里使用简化的聚类逻辑
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('更新用户行为聚类...')// 基于相似行为模式对用户进行分?    const allVectors = Array.from(this.behaviorVectors.values()).flat();

    // 简单的聚类实现（实际应用中应使用更复杂的算法如K-means�?    const clusters = new Map<string, UserBehaviorVector[]>();

    allVectors.forEach(vector => {
      const clusterKey = this.generateClusterKey(vector);
      if (!clusters.has(clusterKey)) {
        clusters.set(clusterKey, []);
      }
      clusters.get(clusterKey)!.push(vector);
    });

    // 更新聚类信息
    clusters.forEach((members, clusterId) => {
      if (members.length >= 5) {
        // 至少5个成员才形成有效聚类
        const centroid = this.calculateCentroid(members);
        this.clusters.set(clusterId, {
          clusterId,
          centroid,
          memberCount: members.length,
          characteristics: this.extractClusterCharacteristics(members),
          typicalBehaviors: this.extractTypicalBehaviors(members),
          outlierThreshold: this.calculateOutlierThreshold(members),
        });
      }
    });
  }

  // 辅助方法实现
  private getModelTypeForEvent(eventType: SecurityEventType): string {
    switch (eventType) {
      case SecurityEventType.LOGIN_ATTEMPT:
      case SecurityEventType.FAILED_LOGIN:
      case SecurityEventType.SUCCESSFUL_LOGIN:
        return 'login_behavior';
      case SecurityEventType.DATA_ACCESS:
      case SecurityEventType.UNAUTHORIZED_ACCESS:
        return 'data_access';
      case SecurityEventType.SESSION_HIJACKING:
      case SecurityEventType.ACCOUNT_LOCKOUT:
        return 'session_behavior';
      default:
        return 'general_behavior';
    }
  }

  private getDefaultConfig(): AnomalyModelConfig {
    return {
      algorithm: 'statistical',
      contamination: 0.1,
      featureWeights: {
        hourOfDay: 0.2,
        country: 0.2,
        deviceType: 0.2,
        sessionDuration: 0.2,
        errorRate: 0.2,
      },
      sensitivity: 0.7,
      learningRate: 0.01,
      windowSize: 50,
    };
  }

  private extractDeviceType(userAgent: string): string {
    if (/mobile|android|iphone|ipad/i.test(userAgent)) return 'mobile';
    if (/tablet|ipad/i.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  private extractOS(userAgent: string): string {
    if (/windows/i.test(userAgent)) return 'windows';
    if (/macintosh|mac os/i.test(userAgent)) return 'macos';
    if (/linux/i.test(userAgent)) return 'linux';
    if (/android/i.test(userAgent)) return 'android';
    if (/iphone|ipad/i.test(userAgent)) return 'ios';
    return 'unknown';
  }

  private extractBrowser(userAgent: string): string {
    if (/chrome/i.test(userAgent)) return 'chrome';
    if (/firefox/i.test(userAgent)) return 'firefox';
    if (/safari/i.test(userAgent)) return 'safari';
    if (/edge/i.test(userAgent)) return 'edge';
    return 'other';
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换?2位整?    }
    return hash.toString();
  }

  private isHoliday(date: Date): boolean {
    // 简化的节假日判?    const holidays = [
      '01-01', // 元旦
      '10-01', // 国庆?      // 可以扩展更多节假?    ];

    const monthDay = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    return holidays.includes(monthDay);
  }

  private calculateAccessFrequency(userId: string, timestamp: Date): number {
    const history = this.behaviorVectors.get(userId) || [];
    const oneHourAgo = new Date(timestamp.getTime() - 3600000);

    const recentAccesses = history.filter(v => v.timestamp > oneHourAgo);
    return recentAccesses.length;
  }

  private getTypicalResources(userId: string): string[] {
    // 基于历史数据返回用户常访问的资源
    return ['/dashboard', '/profile', '/settings'];
  }

  private detectUnusualPaths(currentPath?: string): string[] {
    const unusualPatterns = [
      /\.\./, // 路径遍历
      /etc\/passwd/, // 敏感文件访问
      /admin/i, // 管理路径
      /config/i, // 配置文件
    ];

    if (!currentPath) return [];

    return unusualPatterns
      .filter(pattern => pattern.test(currentPath))
      .map(() => currentPath);
  }

  private generateClusterKey(vector: UserBehaviorVector): string {
    // 基于主要特征生成聚类?    return `${vector.features.country}_${vector.features.deviceType}_${vector.features.os}`;
  }

  private calculateCentroid(
    vectors: UserBehaviorVector[]
  ): Record<string, number> {
    // 计算数值特征的中心?    const centroid: Record<string, number> = {};
    const numericFeatures = ['hourOfDay', 'sessionDuration', 'pagesVisited'];

    numericFeatures.forEach(feature => {
      const values = vectors
        .map(v => v.features[feature as keyof typeof v.features])
        .filter(val => typeof val === 'number') as number[];

      if (values.length > 0) {
        centroid[feature] = values.reduce((a, b) => a + b, 0) / values.length;
      }
    });

    return centroid;
  }

  private extractClusterCharacteristics(
    vectors: UserBehaviorVector[]
  ): string[] {
    // 提取聚类的主要特?    const characteristics: string[] = [];

    // 分析最常见的时间段
    const hours = vectors.map(v => v.features.hourOfDay);
    const commonHour = this.getMostCommon(hours);
    characteristics.push(`主要活跃时间: ${commonHour}点`);

    // 分析最常见的设备类?    const devices = vectors.map(v => v.features.deviceType);
    const commonDevice = this.getMostCommon(devices);
    characteristics.push(`主要设备: ${commonDevice}`);

    return characteristics;
  }

  private extractTypicalBehaviors(vectors: UserBehaviorVector[]): string[] {
    // 提取典型行为模式
    return ['工作时间活跃', '使用桌面设备', '访问管理功能', '长时间会?];
  }

  private calculateOutlierThreshold(vectors: UserBehaviorVector[]): number {
    // 计算异常值阈?    const scores = vectors.map(v => {
      // 简化的评分计算
      return v.features.hourOfDay > 8 && v.features.hourOfDay < 18 ? 0.2 : 0.8;
    });

    // 使用IQR方法计算阈?    scores.sort((a, b) => a - b);
    const q1 = scores[Math.floor(scores.length * 0.25)];
    const q3 = scores[Math.floor(scores.length * 0.75)];
    return q3 + 1.5 * (q3 - q1);
  }

  private getMostCommon<T>(array: T[]): T {
    const counts: Record<string, number> = {};
    array.forEach(item => {
      const key = String(item);
      counts[key] = (counts[key] || 0) + 1;
    });

    return (
      (Object.entries(counts).sort(
        ([, a], [, b]) => b - a
      )[0]?.[0] as unknown as T) || array[0]
    );
  }

  // 公共接口方法
  getUserBehaviorProfile(userId: string): {
    baseline?: UserBehaviorVector;
    recentBehaviors: UserBehaviorVector[];
    clusterInfo?: UserBehaviorCluster;
  } {
    return {
      baseline: this.baselines.get(userId),
      recentBehaviors: this.behaviorVectors.get(userId)?.slice(-10) || [],
      clusterInfo: this.getUserCluster(userId),
    };
  }

  private getUserCluster(userId: string): UserBehaviorCluster | undefined {
    const userVector = this.behaviorVectors.get(userId)?.[0];
    if (!userVector) return undefined;

    const clusterKey = this.generateClusterKey(userVector);
    return this.clusters.get(clusterKey);
  }

  getSystemWideAnomalies(
    timeWindowMinutes: number = 60
  ): BehaviorAnomalyResult[] {
    // 获取系统范围内的异常行为
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60000);

    // 这里应该查询数据库获取近期异常事?    return [];
  }
}
