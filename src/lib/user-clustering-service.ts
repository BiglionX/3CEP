// 用户分群服务 - 提供分群管理、查询和应用接口

import {
  IntelligentUserClustering,
  UserFeatureVector,
  UserCluster,
  ClusteringConfig,
} from './intelligent-user-clustering';

export interface ClusterQueryOptions {
  minMembers?: number;
  maxMembers?: number;
  qualityThreshold?: number;
  sortBy?: 'size' | 'quality' | 'recent';
  includeDetails?: boolean;
}

export interface UserAssignment {
  userId: string;
  clusterId: string;
  confidence: number;
  assignmentReason: string;
  lastUpdated: string;
}

export interface ClusterInsights {
  growthTrends: ClusterGrowthTrend[];
  migrationPatterns: ClusterMigration[];
  performanceMetrics: ClusterPerformance[];
  recommendationOpportunities: RecommendationOpportunity[];
}

export interface ClusterGrowthTrend {
  clusterId: string;
  clusterName: string;
  trendData: {
    date: string;
    memberCount: number;
    newMembers: number;
    churnedMembers: number;
  }[];
}

export interface ClusterMigration {
  fromCluster: string;
  toCluster: string;
  userCount: number;
  migrationRate: number;
  timePeriod: string;
}

export interface ClusterPerformance {
  clusterId: string;
  clusterName: string;
  avgEngagement: number;
  conversionRate: number;
  retentionRate: number;
  revenuePerUser: number;
}

export interface RecommendationOpportunity {
  clusterId: string;
  opportunityType: 'upsell' | 'retention' | 'engagement' | 'feature_adoption';
  description: string;
  potentialImpact: number;
  confidence: number;
  targetUsers: string[];
}

export class UserClusteringService {
  private clusteringEngine: IntelligentUserClustering;
  private clusters: UserCluster[] = [];
  private userAssignments: Map<string, UserAssignment>;
  private clusteringHistory: ClusterHistoryEntry[];

  constructor(config?: Partial<ClusteringConfig>) {
    this.clusteringEngine = new IntelligentUserClustering(config);
    this.userAssignments = new Map();
    this.clusteringHistory = [];
  }

  // 执行用户分群分析
  async performUserClustering(
    userData: any[],
    behaviorData: any[]
  ): Promise<UserCluster[]> {
    try {
      // 构建特征向量
      const featureVectors = this.clusteringEngine.buildFeatureVectors(
        userData,
        behaviorData
      );

      if (featureVectors.length === 0) {
        throw new Error('没有足够的用户数据进行分群分?);
      }

      // 执行聚类
      this.clusters = await this.clusteringEngine.performClustering();

      // 记录分群历史
      this.recordClusteringRun(featureVectors.length);

      // 更新用户分配
      this.updateUserAssignments();

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?完成分群分析，生?${this.clusters.length} 个用户群体`)return this.clusters;
    } catch (error) {
      console.error('用户分群分析失败:', error);
      throw error;
    }
  }

  // 获取特定用户的分群信?  getUserClusterInfo(userId: string): {
    cluster: UserCluster | undefined;
    assignment: UserAssignment | undefined;
    similarUsers: { userId: string; similarity: number }[];
  } {
    const cluster = this.clusteringEngine.getUserCluster(userId);
    const assignment = this.userAssignments.get(userId);
    const similarUsers = cluster
      ? this.clusteringEngine.getSimilarUsers(userId, 10)
      : [];

    return { cluster, assignment, similarUsers };
  }

  // 查询分群结果
  queryClusters(options: ClusterQueryOptions = {}): UserCluster[] {
    let filteredClusters = [...this.clusters];

    // 应用过滤条件
    if (options.minMembers) {
      filteredClusters = filteredClusters.filter(
        c => c.memberCount >= options.minMembers!
      );
    }

    if (options.maxMembers) {
      filteredClusters = filteredClusters.filter(
        c => c.memberCount <= options.maxMembers!
      );
    }

    if (options.qualityThreshold) {
      filteredClusters = filteredClusters.filter(
        c => c.qualityMetrics.silhouetteScore >= options.qualityThreshold!
      );
    }

    // 排序
    switch (options.sortBy) {
      case 'size':
        filteredClusters.sort((a, b) => b.memberCount - a.memberCount);
        break;
      case 'quality':
        filteredClusters.sort(
          (a, b) =>
            b.qualityMetrics.silhouetteScore - a.qualityMetrics.silhouetteScore
        );
        break;
      case 'recent':
        filteredClusters.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
      default:
        filteredClusters.sort((a, b) => b.memberCount - a.memberCount);
    }

    // 如果不需要详细信息，移除敏感数据
    if (!options.includeDetails) {
      filteredClusters = filteredClusters.map(cluster => ({
        ...cluster,
        members: [], // 移除具体用户ID
        center: [], // 移除聚类中心坐标
      }));
    }

    return filteredClusters;
  }

  // 获取分群统计信息
  getClusteringStatistics(): {
    totalUsers: number;
    clusteredUsers: number;
    clusterCount: number;
    avgClusterSize: number;
    qualityMetrics: any;
    clusterDistribution: Record<string, number>;
    unclusteredUsers: number;
  } {
    const stats = this.clusteringEngine.getClusteringStatistics();
    const clusteredUsers = stats.totalUsers;
    const unclusteredUsers = 0; // 在DBSCAN等算法中可能有噪声点

    return {
      ...stats,
      clusteredUsers,
      unclusteredUsers,
    };
  }

  // 获取分群洞察
  getClusterInsights(period: '7d' | '30d' | '90d' = '30d'): ClusterInsights {
    // 生成增长趋势数据
    const growthTrends = this.generateGrowthTrends(period);

    // 分析迁移模式
    const migrationPatterns = this.analyzeMigrationPatterns();

    // 计算性能指标
    const performanceMetrics = this.calculatePerformanceMetrics();

    // 识别推荐机会
    const recommendationOpportunities =
      this.identifyRecommendationOpportunities();

    return {
      growthTrends,
      migrationPatterns,
      performanceMetrics,
      recommendationOpportunities,
    };
  }

  // 为营销活动推荐目标群体
  recommendTargetClusters(campaignGoals: {
    goalType: 'acquisition' | 'retention' | 'upsell' | 'engagement';
    targetSize?: number;
    qualityThreshold?: number;
  }): UserCluster[] {
    let candidateClusters = [...this.clusters];

    // 根据目标类型筛?    switch (campaignGoals.goalType) {
      case 'acquisition':
        // 寻找新用户群?        candidateClusters = candidateClusters.filter(
          c =>
            c.characteristics.lifecycleStage === 'new_user' ||
            c.characteristics.lifecycleStage === 'onboarding'
        );
        break;

      case 'retention':
        // 寻找流失风险高的群体
        candidateClusters = candidateClusters.filter(c =>
          c.members.some(userId => {
            const assignment = this.userAssignments.get(userId);
            return assignment && this.estimateChurnRisk(userId) > 0.6;
          })
        );
        break;

      case 'upsell':
        // 寻找高价值潜力群?        candidateClusters = candidateClusters.filter(
          c =>
            c.characteristics.valueProfile.includes('混合') ||
            c.members.some(userId => {
              const profile = this.getUserValueProfile(userId);
              return profile && profile.upsellPotential > 0.7;
            })
        );
        break;

      case 'engagement':
        // 寻找参与度有待提升的群体
        candidateClusters = candidateClusters.filter(
          c => c.qualityMetrics.cohesion < 0.7 // 群体内部分散度较?        );
        break;
    }

    // 应用质量和大小筛?    if (campaignGoals.qualityThreshold) {
      candidateClusters = candidateClusters.filter(
        c => c.qualityMetrics.silhouetteScore >= campaignGoals.qualityThreshold!
      );
    }

    if (campaignGoals.targetSize) {
      candidateClusters = candidateClusters.filter(
        c => c.memberCount >= campaignGoals.targetSize!
      );
    }

    // 按相关性排?    candidateClusters.sort((a, b) => {
      const scoreA = this.calculateCampaignRelevance(a, campaignGoals.goalType);
      const scoreB = this.calculateCampaignRelevance(b, campaignGoals.goalType);
      return scoreB - scoreA;
    });

    return candidateClusters.slice(0, 5); // 返回?个最相关的群?  }

  // 批量更新用户分群
  async updateClustering(userData: any[], behaviorData: any[]): Promise<void> {
    try {
      await this.performUserClustering(userData, behaviorData);
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('�?用户分群更新完成')} catch (error) {
      console.error('用户分群更新失败:', error);
      throw error;
    }
  }

  // 获取历史分群记录
  getClusteringHistory(limit: number = 10): ClusterHistoryEntry[] {
    return this.clusteringHistory
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);
  }

  // 导出分群结果
  exportClusteringResults(format: 'json' | 'csv' = 'json'): string {
    const exportData = {
      metadata: {
        exportTime: new Date().toISOString(),
        clusterCount: this.clusters.length,
        totalUsers: this.clusteringEngine.getClusteringStatistics().totalUsers,
      },
      clusters: this.clusters.map(cluster => ({
        clusterId: cluster.clusterId,
        clusterName: cluster.clusterName,
        memberCount: cluster.memberCount,
        characteristics: cluster.characteristics,
        qualityMetrics: cluster.qualityMetrics,
      })),
    };

    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    } else {
      // CSV格式导出
      return this.convertToCSV(exportData);
    }
  }

  // 私有方法
  private recordClusteringRun(userCount: number): void {
    const entry: ClusterHistoryEntry = {
      runId: `run_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userCount,
      clusterCount: this.clusters.length,
      algorithm: this.clusteringEngine.constructor.name,
      parameters: {}, // 实际应记录具体参?      resultsSummary: {
        avgSilhouette:
          this.clusters.reduce(
            (sum, c) => sum + c.qualityMetrics.silhouetteScore,
            0
          ) / this.clusters.length,
        totalMembers: this.clusters.reduce((sum, c) => sum + c.memberCount, 0),
      },
    };

    this.clusteringHistory.push(entry);

    // 保持历史记录在合理范围内
    if (this.clusteringHistory.length > 50) {
      this.clusteringHistory = this.clusteringHistory.slice(-50);
    }
  }

  private updateUserAssignments(): void {
    this.clusters.forEach(cluster => {
      cluster.members.forEach(userId => {
        this.userAssignments.set(userId, {
          userId,
          clusterId: cluster.clusterId,
          confidence: cluster.qualityMetrics.silhouetteScore,
          assignmentReason: `基于${cluster.characteristics.behavioralPatterns.join(',')}等特征`,
          lastUpdated: new Date().toISOString(),
        });
      });
    });
  }

  private generateGrowthTrends(period: string): ClusterGrowthTrend[] {
    // 模拟增长趋势数据
    return this.clusters.map(cluster => ({
      clusterId: cluster.clusterId,
      clusterName: cluster.clusterName,
      trendData: this.generateTrendData(period, cluster.memberCount),
    }));
  }

  private generateTrendData(period: string, baseCount: number): any[] {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const trendData = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // 模拟数据波动
      const fluctuation = (Math.random() - 0.5) * 0.2;
      const memberCount = Math.max(
        1,
        Math.round(baseCount * (1 + fluctuation))
      );

      trendData.push({
        date: date.toISOString().split('T')[0],
        memberCount,
        newMembers: Math.max(0, Math.round(memberCount * 0.1)),
        churnedMembers: Math.max(0, Math.round(memberCount * 0.05)),
      });
    }

    return trendData;
  }

  private analyzeMigrationPatterns(): ClusterMigration[] {
    // 简化的迁移分析
    const migrations: ClusterMigration[] = [];

    for (let i = 0; i < Math.min(3, this.clusters.length); i++) {
      for (let j = i + 1; j < this.clusters.length; j++) {
        migrations.push({
          fromCluster: this.clusters[i].clusterId,
          toCluster: this.clusters[j].clusterId,
          userCount: Math.floor(Math.random() * 10),
          migrationRate: Math.random() * 0.1,
          timePeriod: 'last_30_days',
        });
      }
    }

    return migrations;
  }

  private calculatePerformanceMetrics(): ClusterPerformance[] {
    return this.clusters.map(cluster => ({
      clusterId: cluster.clusterId,
      clusterName: cluster.clusterName,
      avgEngagement: 75 + Math.random() * 20, // 75-95
      conversionRate: 0.1 + Math.random() * 0.3, // 10%-40%
      retentionRate: 0.6 + Math.random() * 0.3, // 60%-90%
      revenuePerUser: 100 + Math.random() * 400, // 100-500
    }));
  }

  private identifyRecommendationOpportunities(): RecommendationOpportunity[] {
    const opportunities: RecommendationOpportunity[] = [];

    this.clusters.forEach(cluster => {
      // Upsell机会
      if (cluster.characteristics.valueProfile.includes('混合')) {
        opportunities.push({
          clusterId: cluster.clusterId,
          opportunityType: 'upsell',
          description: `集群${cluster.clusterName}包含多种价值层级用户，存在升级潜力`,
          potentialImpact: cluster.memberCount * 50,
          confidence: 0.8,
          targetUsers: cluster.members.slice(
            0,
            Math.min(10, cluster.memberCount)
          ),
        });
      }

      // 留存机会
      if (cluster.qualityMetrics.cohesion < 0.6) {
        opportunities.push({
          clusterId: cluster.clusterId,
          opportunityType: 'retention',
          description: `集群${cluster.clusterName}内部差异较大，需要个性化留存策略`,
          potentialImpact: cluster.memberCount * 30,
          confidence: 0.7,
          targetUsers: cluster.members.slice(
            0,
            Math.min(15, cluster.memberCount)
          ),
        });
      }
    });

    return opportunities;
  }

  private estimateChurnRisk(userId: string): number {
    // 基于用户行为和分群特征估算流失风?    const assignment = this.userAssignments.get(userId);
    if (!assignment) return 0.5;

    const cluster = this.clusters.find(
      c => c.clusterId === assignment.clusterId
    );
    if (!cluster) return 0.5;

    // 基于聚类质量和其他因素计算风?    const qualityFactor = 1 - cluster.qualityMetrics.stabilityScore;
    const sizeFactor = cluster.memberCount < 10 ? 0.3 : 0.1;

    return Math.min(qualityFactor + sizeFactor, 1);
  }

  private getUserValueProfile(
    userId: string
  ): { upsellPotential: number } | null {
    // 简化的用户价值画?    const assignment = this.userAssignments.get(userId);
    if (!assignment) return null;

    const cluster = this.clusters.find(
      c => c.clusterId === assignment.clusterId
    );
    if (!cluster) return null;

    const isMixedValue = cluster.characteristics.valueProfile.includes('混合');
    const upsellPotential = isMixedValue ? 0.8 : 0.4;

    return { upsellPotential };
  }

  private calculateCampaignRelevance(
    cluster: UserCluster,
    goalType: string
  ): number {
    let relevance = 0;

    switch (goalType) {
      case 'acquisition':
        if (cluster.characteristics.lifecycleStage === 'new_user')
          relevance += 0.5;
        if (cluster.memberCount < 50) relevance += 0.3;
        break;
      case 'retention':
        if (cluster.qualityMetrics.stabilityScore < 0.7) relevance += 0.4;
        if (cluster.characteristics.behavioralPatterns.includes('低频访问?))
          relevance += 0.3;
        break;
      case 'upsell':
        if (cluster.characteristics.valueProfile.includes('混合'))
          relevance += 0.5;
        if (cluster.qualityMetrics.cohesion > 0.7) relevance += 0.2;
        break;
      case 'engagement':
        if (cluster.qualityMetrics.cohesion < 0.6) relevance += 0.4;
        if (cluster.characteristics.behavioralPatterns.includes('低度参与'))
          relevance += 0.3;
        break;
    }

    return Math.min(relevance, 1);
  }

  private convertToCSV(data: any): string {
    let csv =
      'Cluster ID,Cluster Name,Member Count,Silhouette Score,Cohesion\n';

    data.clusters.forEach((cluster: any) => {
      csv += `"${cluster.clusterId}","${cluster.clusterName}",${cluster.memberCount},${cluster.qualityMetrics.silhouetteScore.toFixed(3)},${cluster.qualityMetrics.cohesion.toFixed(3)}\n`;
    });

    return csv;
  }
}

interface ClusterHistoryEntry {
  runId: string;
  timestamp: string;
  userCount: number;
  clusterCount: number;
  algorithm: string;
  parameters: Record<string, any>;
  resultsSummary: {
    avgSilhouette: number;
    totalMembers: number;
  };
}
