// 智能用户分群算法系统

export interface UserFeatureVector {
  userId: string;
  features: {
    // 行为特征
    visitFrequency: number; // 访问频率 (0-1)
    sessionDuration: number; // 平均会话时长 (分钟)
    featureAdoption: number; // 功能采用?(0-1)
    engagementScore: number; // 参与度分?(0-100)
    activityConsistency: number; // 活动一致?(0-1)

    // 偏好特征
    preferredFeatures: string[]; // 偏好功能列表
    contentPreferences: string[]; // 内容偏好
    uiPreferences: string[]; // 界面偏好

    // 人口统计特征
    ageGroup?: string; // 年龄?    location?: string; // 地理位置
    deviceType: string; // 设备类型
    valueTier: string; // 价值层?
    // 生命周期特征
    accountAge: number; // 账户年龄(�?
    lifecycleStage: string; // 生命周期阶段
    growthTrajectory: number; // 成长轨迹 (-1�?)

    // 预测特征
    churnRisk: number; // 流失风险 (0-1)
    upsellPotential: number; // 升级潜力 (0-1)
    supportNeeds: number; // 支持需?(0-1)
  };
  timestamp: string;
}

export interface UserCluster {
  clusterId: string;
  clusterName: string;
  center: number[]; // 聚类中心?  members: string[]; // 用户ID列表
  memberCount: number;
  characteristics: ClusterCharacteristics;
  qualityMetrics: ClusterQualityMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface ClusterCharacteristics {
  behavioralPatterns: string[]; // 行为模式描述
  preferenceTrends: string[]; // 偏好趋势
  demographicTraits: string[]; // 人口统计特征
  lifecycleStage: string; // 主要生命周期阶段
  valueProfile: string; // 价值画?}

export interface ClusterQualityMetrics {
  silhouetteScore: number; // 轮廓系数 (-1�?)
  withinClusterSumSquares: number; // 簇内平方?  betweenClusterDistance: number; // 簇间距离
  stabilityScore: number; // 稳定性分?(0-1)
  cohesion: number; // 内聚?(0-1)
  separation: number; // 分离?(0-1)
}

export interface ClusteringConfig {
  algorithm: 'kmeans' | 'hierarchical' | 'dbscan' | 'gmm';
  maxClusters: number;
  minClusterSize: number;
  featureWeights: Record<string, number>;
  normalizationMethod: 'minmax' | 'zscore' | 'robust';
  autoOptimize: boolean;
}

export class IntelligentUserClustering {
  private config: ClusteringConfig;
  private featureVectors: UserFeatureVector[] = [];
  private clusters: UserCluster[] = [];
  private featureNames: string[] = [];

  constructor(config: Partial<ClusteringConfig> = {}) {
    this.config = {
      algorithm: 'kmeans',
      maxClusters: 10,
      minClusterSize: 5,
      featureWeights: {
        visitFrequency: 1.0,
        sessionDuration: 0.8,
        featureAdoption: 1.2,
        engagementScore: 1.5,
        activityConsistency: 0.9,
        churnRisk: 1.3,
        upsellPotential: 1.1,
      },
      normalizationMethod: 'minmax',
      autoOptimize: true,
      ...config,
    };

    this.initializeFeatureNames();
  }

  // 从原始数据构建用户特征向?  buildFeatureVectors(
    userData: any[],
    behaviorData: any[]
  ): UserFeatureVector[] {
    const vectors: UserFeatureVector[] = [];

    userData.forEach(user => {
      const userId = user.userId || user.id;
      const userBehaviors = behaviorData.filter(b => b.userId === userId);

      if (userBehaviors.length > 0) {
        const vector = this.constructFeatureVector(user, userBehaviors);
        vectors.push(vector);
      }
    });

    this.featureVectors = vectors;
    return vectors;
  }

  // 执行聚类分析
  async performClustering(): Promise<UserCluster[]> {
    if (this.featureVectors.length === 0) {
      throw new Error('没有可用的特征向量数?);
    }

    // 准备数值特征矩?    const featureMatrix = this.prepareFeatureMatrix();

    // 标准化特?    const normalizedMatrix = this.normalizeFeatures(featureMatrix);

    // 执行聚类
    let clusterLabels: number[];

    switch (this.config.algorithm) {
      case 'kmeans':
        clusterLabels = await this.performKMeansClustering(normalizedMatrix);
        break;
      case 'hierarchical':
        clusterLabels =
          await this.performHierarchicalClustering(normalizedMatrix);
        break;
      case 'dbscan':
        clusterLabels = await this.performDBSCANClustering(normalizedMatrix);
        break;
      case 'gmm':
        clusterLabels = await this.performGMMClustering(normalizedMatrix);
        break;
      default:
        throw new Error(`不支持的聚类算法: ${this.config.algorithm}`);
    }

    // 构建聚类结果
    this.clusters = this.buildClusters(clusterLabels, normalizedMatrix);

    // 优化聚类质量
    if (this.config.autoOptimize) {
      await this.optimizeClusters();
    }

    return this.clusters;
  }

  // 获取用户所属聚?  getUserCluster(userId: string): UserCluster | undefined {
    return this.clusters.find(cluster => cluster.members.includes(userId));
  }

  // 获取相似用户
  getSimilarUsers(
    userId: string,
    maxResults: number = 10
  ): { userId: string; similarity: number }[] {
    const userCluster = this.getUserCluster(userId);
    if (!userCluster) return [];

    const userVector = this.featureVectors.find(v => v.userId === userId);
    if (!userVector) return [];

    const userFeatures = this.vectorToNumericArray(userVector);

    return userCluster.members
      .filter(memberId => memberId !== userId)
      .map(memberId => {
        const memberVector = this.featureVectors.find(
          v => v.userId === memberId
        );
        if (!memberVector) return { userId: memberId, similarity: 0 };

        const memberFeatures = this.vectorToNumericArray(memberVector);
        const similarity = this.cosineSimilarity(userFeatures, memberFeatures);

        return { userId: memberId, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxResults);
  }

  // 获取聚类统计信息
  getClusteringStatistics(): {
    totalUsers: number;
    clusterCount: number;
    avgClusterSize: number;
    qualityMetrics: {
      avgSilhouette: number;
      avgCohesion: number;
      avgSeparation: number;
    };
    clusterDistribution: Record<string, number>;
  } {
    const totalUsers = this.featureVectors.length;
    const clusterCount = this.clusters.length;
    const avgClusterSize = clusterCount > 0 ? totalUsers / clusterCount : 0;

    const avgSilhouette =
      this.clusters.reduce(
        (sum, c) => sum + c.qualityMetrics.silhouetteScore,
        0
      ) / clusterCount;
    const avgCohesion =
      this.clusters.reduce((sum, c) => sum + c.qualityMetrics.cohesion, 0) /
      clusterCount;
    const avgSeparation =
      this.clusters.reduce((sum, c) => sum + c.qualityMetrics.separation, 0) /
      clusterCount;

    const clusterDistribution: Record<string, number> = {};
    this.clusters.forEach(cluster => {
      clusterDistribution[cluster.clusterName] = cluster.memberCount;
    });

    return {
      totalUsers,
      clusterCount,
      avgClusterSize,
      qualityMetrics: {
        avgSilhouette,
        avgCohesion,
        avgSeparation,
      },
      clusterDistribution,
    };
  }

  // 私有方法
  private initializeFeatureNames(): void {
    this.featureNames = [
      'visitFrequency',
      'sessionDuration',
      'featureAdoption',
      'engagementScore',
      'activityConsistency',
      'churnRisk',
      'upsellPotential',
      'supportNeeds',
    ];
  }

  private constructFeatureVector(
    user: any,
    behaviors: any[]
  ): UserFeatureVector {
    // 计算行为特征
    const visitFrequency = this.calculateVisitFrequency(behaviors);
    const sessionDuration = this.calculateAvgSessionDuration(behaviors);
    const featureAdoption = this.calculateFeatureAdoption(behaviors);
    const engagementScore = this.calculateEngagementScore(behaviors);
    const activityConsistency = this.calculateActivityConsistency(behaviors);

    // 提取偏好特征
    const preferredFeatures = this.extractPreferredFeatures(behaviors);
    const contentPreferences = this.extractContentPreferences(behaviors);
    const uiPreferences = this.extractUIPreferences(user);

    // 人口统计特征
    const ageGroup = user?.ageGroup;
    const location = user?.location;
    const deviceType = this.inferDeviceType(behaviors);
    const valueTier = user.valueTier || 'bronze';

    // 生命周期特征
    const accountAge = this.calculateAccountAge(user.createdAt);
    const lifecycleStage = user.lifecycleStage || 'new_user';
    const growthTrajectory = this.calculateGrowthTrajectory(behaviors);

    // 预测特征
    const churnRisk = this.predictChurnRisk(behaviors, engagementScore);
    const upsellPotential = this.predictUpsellPotential(user, behaviors);
    const supportNeeds = this.estimateSupportNeeds(behaviors);

    return {
      userId: user.userId || user.id,
      features: {
        visitFrequency,
        sessionDuration,
        featureAdoption,
        engagementScore,
        activityConsistency,
        preferredFeatures,
        contentPreferences,
        uiPreferences,
        ageGroup,
        location,
        deviceType,
        valueTier,
        accountAge,
        lifecycleStage,
        growthTrajectory,
        churnRisk,
        upsellPotential,
        supportNeeds,
      },
      timestamp: new Date().toISOString(),
    };
  }

  private prepareFeatureMatrix(): number[][] {
    return this.featureVectors.map(vector => this.vectorToNumericArray(vector));
  }

  private vectorToNumericArray(vector: UserFeatureVector): number[] {
    const numericFeatures = [
      vector.features.visitFrequency,
      vector.features.sessionDuration,
      vector.features.featureAdoption,
      vector.features.engagementScore / 100, // 标准化到0-1
      vector.features.activityConsistency,
      vector.features.churnRisk,
      vector.features.upsellPotential,
      vector.features.supportNeeds,
    ];

    // 应用特征权重
    return numericFeatures.map(
      (value, index) =>
        value * (this.config.featureWeights[this.featureNames[index]] || 1.0)
    );
  }

  private normalizeFeatures(matrix: number[][]): number[][] {
    switch (this.config.normalizationMethod) {
      case 'minmax':
        return this.minMaxNormalization(matrix);
      case 'zscore':
        return this.zScoreNormalization(matrix);
      case 'robust':
        return this.robustNormalization(matrix);
      default:
        return matrix;
    }
  }

  private minMaxNormalization(matrix: number[][]): number[][] {
    const normalized: number[][] = [];
    const dimensions = matrix[0].length;

    for (let dim = 0; dim < dimensions; dim++) {
      const values = matrix.map(row => row[dim]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min || 1;

      if (dim === 0) {
        for (let i = 0; i < matrix.length; i++) {
          normalized[i] = [];
        }
      }

      for (let i = 0; i < matrix.length; i++) {
        normalized[i][dim] = (matrix[i][dim] - min) / range;
      }
    }

    return normalized;
  }

  private zScoreNormalization(matrix: number[][]): number[][] {
    const normalized: number[][] = [];
    const dimensions = matrix[0].length;

    for (let dim = 0; dim < dimensions; dim++) {
      const values = matrix.map(row => row[dim]);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const std = Math.sqrt(
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
          values.length
      );

      if (dim === 0) {
        for (let i = 0; i < matrix.length; i++) {
          normalized[i] = [];
        }
      }

      for (let i = 0; i < matrix.length; i++) {
        normalized[i][dim] = std > 0 ? (matrix[i][dim] - mean) / std : 0;
      }
    }

    return normalized;
  }

  private robustNormalization(matrix: number[][]): number[][] {
    // 使用中位数和四分位距进行鲁棒标准?    const normalized: number[][] = [];
    const dimensions = matrix[0].length;

    for (let dim = 0; dim < dimensions; dim++) {
      const values = [...matrix.map(row => row[dim])].sort((a, b) => a - b);
      const median = values[Math.floor(values.length / 2)];
      const q1 = values[Math.floor(values.length * 0.25)];
      const q3 = values[Math.floor(values.length * 0.75)];
      const iqr = q3 - q1 || 1;

      if (dim === 0) {
        for (let i = 0; i < matrix.length; i++) {
          normalized[i] = [];
        }
      }

      for (let i = 0; i < matrix.length; i++) {
        normalized[i][dim] = (matrix[i][dim] - median) / iqr;
      }
    }

    return normalized;
  }

  // K-means聚类实现
  private async performKMeansClustering(matrix: number[][]): Promise<number[]> {
    const k = Math.min(
      this.config.maxClusters,
      Math.floor(matrix.length / this.config.minClusterSize)
    );

    if (k <= 1) return matrix.map(() => 0);

    // 初始化聚类中心（使用k-means++�?    let centroids = this.initializeCentroids(matrix, k);

    let iterations = 0;
    const maxIterations = 100;
    let previousLabels: number[] = [];

    while (iterations < maxIterations) {
      // 分配点到最近的聚类中心
      const labels = matrix.map(point =>
        this.findClosestCentroid(point, centroids)
      );

      // 检查收?      if (this.arraysEqual(labels, previousLabels)) {
        break;
      }

      // 更新聚类中心
      centroids = this.updateCentroids(matrix, labels, k);
      previousLabels = [...labels];
      iterations++;
    }

    return previousLabels;
  }

  private initializeCentroids(matrix: number[][], k: number): number[][] {
    const centroids: number[][] = [];
    const firstIndex = Math.floor(Math.random() * matrix.length);
    centroids.push([...matrix[firstIndex]]);

    for (let i = 1; i < k; i++) {
      const distances = matrix.map(point => {
        const minDist = Math.min(
          ...centroids.map(centroid => this.euclideanDistance(point, centroid))
        );
        return minDist * minDist; // 平方距离作为概率权重
      });

      const totalDistance = distances.reduce((a, b) => a + b, 0);
      const probabilities = distances.map(d => d / totalDistance);

      // 轮盘赌选择下一个中心点
      let cumulativeProb = 0;
      const rand = Math.random();
      let selectedIndex = 0;

      for (let j = 0; j < probabilities.length; j++) {
        cumulativeProb += probabilities[j];
        if (rand <= cumulativeProb) {
          selectedIndex = j;
          break;
        }
      }

      centroids.push([...matrix[selectedIndex]]);
    }

    return centroids;
  }

  private findClosestCentroid(point: number[], centroids: number[][]): number {
    let minDistance = Infinity;
    let closestIndex = 0;

    centroids.forEach((centroid, index) => {
      const distance = this.euclideanDistance(point, centroid);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }

  private updateCentroids(
    matrix: number[][],
    labels: number[],
    k: number
  ): number[][] {
    const centroids: number[][] = Array(k)
      .fill(null)
      .map(() => Array(matrix[0].length).fill(0));

    const counts = Array(k).fill(0);

    matrix.forEach((point, index) => {
      const clusterId = labels[index];
      counts[clusterId]++;

      point.forEach((value, dim) => {
        centroids[clusterId][dim] += value;
      });
    });

    // 计算平均?    centroids.forEach((centroid, i) => {
      if (counts[i] > 0) {
        centroid.forEach((_, dim) => {
          centroid[dim] /= counts[i];
        });
      }
    });

    return centroids;
  }

  // 层次聚类实现
  private async performHierarchicalClustering(
    matrix: number[][]
  ): Promise<number[]> {
    // 简化的层次聚类实现
    const distances = this.computeDistanceMatrix(matrix);
    const n = matrix.length;
    let clusters = Array(n)
      .fill(0)
      .map((_, i) => [i]);

    // 合并最相似的聚类直到达到目标数?    const targetClusters = Math.min(
      this.config.maxClusters,
      Math.floor(n / this.config.minClusterSize)
    );

    while (clusters.length > targetClusters) {
      let minDistance = Infinity;
      let mergeI = 0,
        mergeJ = 1;

      // 找到距离最近的两个聚类
      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          const distance = this.clusterDistance(
            clusters[i],
            clusters[j],
            distances
          );
          if (distance < minDistance) {
            minDistance = distance;
            mergeI = i;
            mergeJ = j;
          }
        }
      }

      // 合并聚类
      clusters[mergeI] = [...clusters[mergeI], ...clusters[mergeJ]];
      clusters.splice(mergeJ, 1);
    }

    // 生成标签
    const labels = Array(n).fill(0);
    clusters.forEach((cluster, clusterId) => {
      cluster.forEach(pointIndex => {
        labels[pointIndex] = clusterId;
      });
    });

    return labels;
  }

  // DBSCAN聚类实现
  private async performDBSCANClustering(matrix: number[][]): Promise<number[]> {
    const eps = 0.5; // 邻域半径
    const minPts = 3; // 最小点?    const labels = Array(matrix.length).fill(-1); // -1表示噪声?    let clusterId = 0;

    for (let i = 0; i < matrix.length; i++) {
      if (labels[i] !== -1) continue; // 已经被标?
      const neighbors = this.getNeighbors(matrix, i, eps);

      if (neighbors.length < minPts) {
        labels[i] = -1; // 标记为噪?        continue;
      }

      // 创建新聚?      labels[i] = clusterId;
      const seeds = [...neighbors];

      let j = 0;
      while (j < seeds.length) {
        const pointIndex = seeds[j];

        if (labels[pointIndex] === -1) {
          labels[pointIndex] = clusterId;
        }

        if (labels[pointIndex] === -1) {
          // 未被标记
          labels[pointIndex] = clusterId;
          const pointNeighbors = this.getNeighbors(matrix, pointIndex, eps);

          if (pointNeighbors.length >= minPts) {
            pointNeighbors.forEach(n => {
              if (!seeds.includes(n)) {
                seeds.push(n);
              }
            });
          }
        }
        j++;
      }

      clusterId++;
    }

    return labels;
  }

  // 高斯混合模型聚类实现
  private async performGMMClustering(matrix: number[][]): Promise<number[]> {
    // 简化的GMM实现
    const k = Math.min(
      this.config.maxClusters,
      Math.floor(matrix.length / this.config.minClusterSize)
    );

    // 使用期望最大化算法
    // 这里使用简化的实现，实际应用中应使用成熟的ML�?    return await this.performKMeansClustering(matrix); // 临时使用k-means
  }

  // 构建聚类结果
  private buildClusters(
    labels: number[],
    normalizedMatrix: number[][]
  ): UserCluster[] {
    const clusterMap = new Map<
      number,
      { indices: number[]; center: number[] }
    >();

    // 按标签分?    labels.forEach((label, index) => {
      if (!clusterMap.has(label)) {
        clusterMap.set(label, {
          indices: [],
          center: Array(normalizedMatrix[0].length).fill(0),
        });
      }
      clusterMap.get(label)!.indices.push(index);
    });

    // 移除噪声点聚类（DBSCAN�?    clusterMap.forEach((_, label) => {
      if (label === -1) clusterMap.delete(label);
    });

    const clusters: UserCluster[] = [];
    let clusterId = 1;

    clusterMap.forEach((clusterData, label) => {
      if (clusterData.indices.length < this.config.minClusterSize) return;

      // 计算聚类中心
      const center = this.calculateClusterCenter(
        clusterData.indices,
        normalizedMatrix
      );

      // 提取用户ID
      const members = clusterData.indices.map(
        index => this.featureVectors[index].userId
      );

      // 分析聚类特征
      const characteristics = this.analyzeClusterCharacteristics(
        clusterData.indices
      );

      // 计算质量指标
      const qualityMetrics = this.calculateClusterQuality(
        clusterData.indices,
        center,
        normalizedMatrix
      );

      clusters.push({
        clusterId: `cluster_${clusterId}`,
        clusterName: this.generateClusterName(
          characteristics,
          clusterData.indices.length
        ),
        center,
        members,
        memberCount: members.length,
        characteristics,
        qualityMetrics,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      clusterId++;
    });

    return clusters.sort((a, b) => b.memberCount - a.memberCount);
  }

  // 聚类优化
  private async optimizeClusters(): Promise<void> {
    // 移除低质量聚?    this.clusters = this.clusters.filter(
      cluster =>
        cluster.qualityMetrics.silhouetteScore > 0.3 &&
        cluster.memberCount >= this.config.minClusterSize
    );

    // 合并相似聚类
    for (let i = 0; i < this.clusters.length; i++) {
      for (let j = i + 1; j < this.clusters.length; j++) {
        const similarity = this.calculateClusterSimilarity(
          this.clusters[i],
          this.clusters[j]
        );
        if (similarity > 0.8) {
          // 合并聚类
          this.mergeClusters(i, j);
          this.clusters.splice(j, 1);
          j--; // 调整索引
        }
      }
    }
  }

  // 辅助计算方法
  private calculateVisitFrequency(behaviors: any[]): number {
    const uniqueDays = new Set(
      behaviors.map(b => new Date(b.timestamp).toDateString())
    );
    return Math.min(uniqueDays.size / 30, 1); // 30天标准化
  }

  private calculateAvgSessionDuration(behaviors: any[]): number {
    // 简化实现，实际应基于会话分?    return Math.min(behaviors.length * 2, 120); // 假设每次行为2分钟，最?20分钟
  }

  private calculateFeatureAdoption(behaviors: any[]): number {
    const uniqueFeatures = new Set(
      behaviors.map(b => b.featureName || b.action)
    );
    return Math.min(uniqueFeatures.size / 20, 1); // 假设总共20个功?  }

  private calculateEngagementScore(behaviors: any[]): number {
    const baseScore = Math.min(behaviors.length * 2, 100);
    const timeBonus = Math.min(behaviors.length / 10, 20);
    return Math.min(baseScore + timeBonus, 100);
  }

  private calculateActivityConsistency(behaviors: any[]): number {
    if (behaviors.length <= 1) return behaviors.length;

    const dates = behaviors.map(b => new Date(b.timestamp).toDateString());
    const uniqueDays = new Set(dates);
    return uniqueDays.size / dates.length;
  }

  private extractPreferredFeatures(behaviors: any[]): string[] {
    const featureCounts: Record<string, number> = {};
    behaviors.forEach(b => {
      const feature = b.featureName || b.action || 'unknown';
      featureCounts[feature] = (featureCounts[feature] || 0) + 1;
    });

    return Object.entries(featureCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([feature]) => feature);
  }

  private extractContentPreferences(behaviors: any[]): string[] {
    // 基于页面访问和搜索行为推断内容偏?    const preferences = new Set<string>();

    behaviors.forEach(b => {
      if (b.pageName) {
        if (b.pageName.includes('设备')) preferences.add('设备管理');
        if (b.pageName.includes('维修')) preferences.add('维修服务');
        if (b.pageName.includes('配件')) preferences.add('配件采购');
      }
      if (b.eventType === 'search' && b?.query) {
        const query = b.value.query.toLowerCase();
        if (query.includes('维修') || query.includes('故障'))
          preferences.add('维修相关');
        if (query.includes('配件') || query.includes('采购'))
          preferences.add('采购相关');
      }
    });

    return Array.from(preferences);
  }

  private extractUIPreferences(user: any): string[] {
    const preferences: string[] = [];
    const uiPrefs = user?.uiPreferences;

    if (uiPrefs) {
      if (uiPrefs.theme === 'dark') preferences.push('深色主题');
      if (uiPrefs.layout === 'compact') preferences.push('紧凑布局');
    }

    return preferences;
  }

  private inferDeviceType(behaviors: any[]): string {
    // 基于用户代理推断设备类型
    const userAgent = behaviors[0]?.userAgent || '';
    if (userAgent.includes('Mobile')) return 'mobile';
    if (userAgent.includes('Tablet')) return 'tablet';
    return 'desktop';
  }

  private calculateAccountAge(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    return Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  private calculateGrowthTrajectory(behaviors: any[]): number {
    // 简化实现：基于近期行为增长趋势
    const recentBehaviors = behaviors.filter(b => {
      const daysAgo =
        (Date.now() - new Date(b.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7; // 最?�?    });

    const olderBehaviors = behaviors.filter(b => {
      const daysAgo =
        (Date.now() - new Date(b.timestamp).getTime()) /
        (1000 * 60 * 60 * 60 * 24);
      return daysAgo > 7 && daysAgo <= 14; // 7-14天前
    });

    const recentCount = recentBehaviors.length;
    const olderCount = olderBehaviors.length;

    if (olderCount === 0) return 0;
    return Math.min(Math.max((recentCount - olderCount) / olderCount, -1), 1);
  }

  private predictChurnRisk(behaviors: any[], engagementScore: number): number {
    // 基于不活跃天数和参与度预测流失风?    const lastActivity = new Date(
      Math.max(...behaviors.map(b => new Date(b.timestamp).getTime()))
    );
    const daysSinceLastActivity =
      (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);

    const activityRisk = Math.min(daysSinceLastActivity / 30, 1); // 30天不活跃为高风险
    const engagementRisk = 1 - engagementScore / 100;

    return activityRisk * 0.6 + engagementRisk * 0.4;
  }

  private predictUpsellPotential(user: any, behaviors: any[]): number {
    const valueTier = user.valueTier || 'bronze';
    const tierMultipliers: Record<string, number> = {
      bronze: 0.3,
      silver: 0.6,
      gold: 0.8,
      platinum: 0.9,
    };

    const tierScore = tierMultipliers[valueTier] || 0.3;
    const adoptionScore = this.calculateFeatureAdoption(behaviors);

    return Math.min(tierScore + adoptionScore * 0.5, 1);
  }

  private estimateSupportNeeds(behaviors: any[]): number {
    // 基于错误行为和帮助请求估计支持需?    const errorBehaviors = behaviors.filter(
      b => b.eventType === 'error' || b?.includes('help')
    );

    return Math.min((errorBehaviors.length / behaviors.length) * 2, 1);
  }

  private euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(
      a.reduce((sum, _, i) => sum + Math.pow(a[i] - b[i], 2), 0)
    );
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, _, i) => sum + a[i] * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private arraysEqual(a: any[], b: any[]): boolean {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  }

  private computeDistanceMatrix(matrix: number[][]): number[][] {
    const n = matrix.length;
    const distances: number[][] = Array(n)
      .fill(null)
      .map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dist = this.euclideanDistance(matrix[i], matrix[j]);
        distances[i][j] = dist;
        distances[j][i] = dist;
      }
    }

    return distances;
  }

  private clusterDistance(
    cluster1: number[],
    cluster2: number[],
    distances: number[][]
  ): number {
    // 使用平均连锁距离
    let totalDistance = 0;
    let count = 0;

    cluster1.forEach(i => {
      cluster2.forEach(j => {
        totalDistance += distances[i][j];
        count++;
      });
    });

    return count > 0 ? totalDistance / count : Infinity;
  }

  private getNeighbors(
    matrix: number[][],
    pointIndex: number,
    eps: number
  ): number[] {
    const neighbors: number[] = [];

    matrix.forEach((point, index) => {
      if (
        index !== pointIndex &&
        this.euclideanDistance(matrix[pointIndex], point) <= eps
      ) {
        neighbors.push(index);
      }
    });

    return neighbors;
  }

  private calculateClusterCenter(
    indices: number[],
    matrix: number[][]
  ): number[] {
    const dimensions = matrix[0].length;
    const center = Array(dimensions).fill(0);

    indices.forEach(index => {
      for (let dim = 0; dim < dimensions; dim++) {
        center[dim] += matrix[index][dim];
      }
    });

    return center.map(val => val / indices.length);
  }

  private analyzeClusterCharacteristics(
    indices: number[]
  ): ClusterCharacteristics {
    const behaviors = indices.map(i => this.featureVectors[i]);

    // 行为模式分析
    const behavioralPatterns: string[] = [];
    const avgVisitFreq =
      behaviors.reduce((sum, b) => sum + b.features.visitFrequency, 0) /
      behaviors.length;
    const avgEngagement =
      behaviors.reduce((sum, b) => sum + b.features.engagementScore, 0) /
      behaviors.length;

    if (avgVisitFreq > 0.7) behavioralPatterns.push('高频访问?);
    else if (avgVisitFreq > 0.3) behavioralPatterns.push('中频访问?);
    else behavioralPatterns.push('低频访问?);

    if (avgEngagement > 80) behavioralPatterns.push('高度参与用户');
    else if (avgEngagement > 50) behavioralPatterns.push('中度参与用户');
    else behavioralPatterns.push('低度参与用户');

    // 偏好趋势
    const allPreferences = behaviors.flatMap(b => b.features.preferredFeatures);
    const preferenceCounts: Record<string, number> = {};
    allPreferences.forEach(pref => {
      preferenceCounts[pref] = (preferenceCounts[pref] || 0) + 1;
    });

    const topPreferences = Object.entries(preferenceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([pref]) => pref);

    const preferenceTrends =
      topPreferences.length > 0
        ? [`偏好功能: ${topPreferences.join(', ')}`]
        : ['功能偏好分散'];

    // 人口统计特征
    const demographicTraits: string[] = [];
    const deviceTypes = new Set(behaviors.map(b => b.features.deviceType));
    if (deviceTypes.size === 1) {
      demographicTraits.push(`主要使用${Array.from(deviceTypes)[0]}设备`);
    }

    // 生命周期阶段
    const lifecycleStages = new Set(
      behaviors.map(b => b.features.lifecycleStage)
    );
    const dominantStage = Array.from(lifecycleStages)[0] || 'new_user';

    // 价值画?    const valueTiers = new Set(behaviors.map(b => b.features.valueTier));
    const valueProfile =
      valueTiers.size === 1
        ? `�?{Array.from(valueTiers)[0]}用户群体`
        : '混合价值层级用户群?;

    return {
      behavioralPatterns,
      preferenceTrends,
      demographicTraits,
      lifecycleStage: dominantStage,
      valueProfile,
    };
  }

  private calculateClusterQuality(
    indices: number[],
    center: number[],
    matrix: number[][]
  ): ClusterQualityMetrics {
    // 计算轮廓系数
    const silhouetteScore = this.calculateSilhouetteScore(indices, matrix);

    // 计算簇内平方?    const withinClusterSumSquares = indices.reduce(
      (sum, index) =>
        sum + Math.pow(this.euclideanDistance(matrix[index], center), 2),
      0
    );

    // 简化的簇间距离和稳定性分?    const betweenClusterDistance = 1.0; // 简化处?    const stabilityScore = 0.8; // 简化处?    const cohesion = Math.max(
      0,
      1 - withinClusterSumSquares / indices.length / 100
    );
    const separation = 0.7; // 简化处?
    return {
      silhouetteScore,
      withinClusterSumSquares,
      betweenClusterDistance,
      stabilityScore,
      cohesion,
      separation,
    };
  }

  private calculateSilhouetteScore(
    indices: number[],
    matrix: number[][]
  ): number {
    if (indices.length <= 1) return 0;

    let totalSilhouette = 0;

    indices.forEach(index => {
      const point = matrix[index];

      // 计算簇内平均距离
      const intraClusterDist =
        indices
          .filter(i => i !== index)
          .reduce(
            (sum, i) => sum + this.euclideanDistance(point, matrix[i]),
            0
          ) /
        (indices.length - 1);

      // 计算最近的其他簇距离（简化）
      const nearestClusterDist = 1.0; // 简化处?
      const silhouette =
        (nearestClusterDist - intraClusterDist) /
        Math.max(nearestClusterDist, intraClusterDist);
      totalSilhouette += silhouette;
    });

    return totalSilhouette / indices.length;
  }

  private calculateClusterSimilarity(
    cluster1: UserCluster,
    cluster2: UserCluster
  ): number {
    // 基于聚类中心计算相似?    return this.cosineSimilarity(cluster1.center, cluster2.center);
  }

  private mergeClusters(index1: number, index2: number): void {
    const cluster1 = this.clusters[index1];
    const cluster2 = this.clusters[index2];

    // 合并成员
    cluster1.members = [...new Set([...cluster1.members, ...cluster2.members])];
    cluster1.memberCount = cluster1.members.length;

    // 更新中心?    cluster1.center = cluster1.center.map(
      (val, i) =>
        (val * (cluster1.memberCount - cluster2.memberCount) +
          cluster2.center[i] * cluster2.memberCount) /
        cluster1.memberCount
    );

    // 合并特征描述
    cluster1.characteristics = {
      behavioralPatterns: [
        ...new Set([
          ...cluster1.characteristics.behavioralPatterns,
          ...cluster2.characteristics.behavioralPatterns,
        ]),
      ],
      preferenceTrends: [
        ...new Set([
          ...cluster1.characteristics.preferenceTrends,
          ...cluster2.characteristics.preferenceTrends,
        ]),
      ],
      demographicTraits: [
        ...new Set([
          ...cluster1.characteristics.demographicTraits,
          ...cluster2.characteristics.demographicTraits,
        ]),
      ],
      lifecycleStage: cluster1.characteristics.lifecycleStage,
      valueProfile: `${cluster1.characteristics.valueProfile} + ${cluster2.characteristics.valueProfile}`,
    };
  }

  private generateClusterName(
    characteristics: ClusterCharacteristics,
    memberCount: number
  ): string {
    const behaviorDesc = characteristics.behavioralPatterns[0] || '普?;
    const lifecycleDesc =
      {
        new_user: '新用?,
        onboarding: '体验期用?,
        active: '活跃用户',
        loyal: '忠实用户',
      }[characteristics.lifecycleStage] || '用户';

    return `${behaviorDesc}${lifecycleDesc}(${memberCount}�?`;
  }
}
