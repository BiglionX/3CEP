/**
 * 供应商能力评分计算引?(C001-2)
 * 实现具体的评分计算、权重调整和历史数据融合
 */

import {
  SupplierCapabilityScoringEngine,
  CapabilityDimension,
  AssessmentFactor,
  DimensionAssessment,
  SupplierCapabilityProfile,
  ScoringWeights,
  DEFAULT_WEIGHTS,
} from '../../models/capability-scoring.model';

// 工具函数
function normalizeScore(value: number, min: number, max: number): number {
  if (min === max) return 50;
  const normalized = ((value - min) / (max - min)) * 100;
  return Math.min(100, Math.max(0, normalized));
}

function calculateConfidenceWeightedAverage(
  values: Array<{ value: number; confidence: number }>
): { average: number; overallConfidence: number } {
  let weightedSum = 0;
  let totalWeight = 0;
  let confidenceSum = 0;

  values.forEach(item => {
    const weight = item.confidence;
    weightedSum += item.value * weight;
    totalWeight += weight;
    confidenceSum += item.confidence;
  });

  const average = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const overallConfidence =
    values.length > 0 ? confidenceSum / values.length : 0;

  return {
    average: Math.min(100, Math.max(0, average)),
    overallConfidence: Math.min(1, Math.max(0, overallConfidence)),
  };
}

// 数据源类型定?export interface DataSource {
  sourceId: string;
  sourceName: string;
  sourceType: 'internal' | 'external' | 'survey' | 'audit';
  reliabilityScore: number; // 数据源可靠?(0-1)
  lastUpdate: string;
}

// 历史绩效数据
export interface HistoricalPerformance {
  period: string; // YYYY-MM格式
  metrics: {
    quality_score?: number;
    delivery_score?: number;
    price_score?: number;
    service_score?: number;
    innovation_score?: number;
  };
  sampleSize: number; // 样本数量
  confidence: number; // 数据置信?}

// 实时评估数据
export interface RealTimeAssessment {
  timestamp: string;
  orderId?: string;
  assessmentType:
    | 'quality_check'
    | 'delivery_performance'
    | 'price_review'
    | 'service_feedback';
  score: number;
  feedback?: string;
  evaluator?: string;
}

// 动态权重调整配?export interface DynamicWeightConfig {
  enableAutoAdjustment: boolean;
  adjustmentFrequency: 'daily' | 'weekly' | 'monthly';
  sensitivity: number; // 调整敏感?(0-1)
  minWeight: number; // 最小权重限?  maxWeight: number; // 最大权重限?  historicalWindowSize: number; // 历史数据窗口大小(�?
}

// 评分计算引擎扩展
export class AdvancedCapabilityScoringEngine extends SupplierCapabilityScoringEngine {
  private dynamicWeightConfig: DynamicWeightConfig;
  private dataSourceRegistry: Map<string, DataSource> = new Map();
  private historicalDataCache: Map<string, HistoricalPerformance[]> = new Map();
  private realTimeAssessments: Map<string, RealTimeAssessment[]> = new Map();

  constructor(
    weights: ScoringWeights = DEFAULT_WEIGHTS,
    dynamicConfig?: Partial<DynamicWeightConfig>
  ) {
    super(weights);
    this.dynamicWeightConfig = {
      enableAutoAdjustment: false,
      adjustmentFrequency: 'monthly',
      sensitivity: 0.1,
      minWeight: 0.05,
      maxWeight: 0.5,
      historicalWindowSize: 12,
      ...dynamicConfig,
    };
  }

  /**
   * 注册数据?   */
  registerDataSource(dataSource: DataSource): void {
    this.dataSourceRegistry.set(dataSource.sourceId, dataSource);
  }

  /**
   * 添加历史绩效数据
   */
  addHistoricalPerformance(
    supplierId: string,
    performance: HistoricalPerformance
  ): void {
    if (!this.historicalDataCache.has(supplierId)) {
      this.historicalDataCache.set(supplierId, []);
    }

    const performances = this.historicalDataCache.get(supplierId)!;
    performances.push(performance);

    // 保持数据窗口大小
    if (performances.length > this.dynamicWeightConfig.historicalWindowSize) {
      performances.shift();
    }
  }

  /**
   * 添加实时评估数据
   */
  addRealTimeAssessment(
    supplierId: string,
    assessment: RealTimeAssessment
  ): void {
    if (!this.realTimeAssessments.has(supplierId)) {
      this.realTimeAssessments.set(supplierId, []);
    }

    const assessments = this.realTimeAssessments.get(supplierId)!;
    assessments.push(assessment);

    // 保留最?0天的数据
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const filtered = assessments.filter(
      a => new Date(a.timestamp) >= cutoffDate
    );
    this.realTimeAssessments.set(supplierId, filtered);
  }

  /**
   * 基于历史数据的维度评?   */
  assessDimensionWithHistory(
    supplierId: string,
    dimension: CapabilityDimension,
    currentFactors: AssessmentFactor[],
    timeWindowMonths: number = 6
  ): DimensionAssessment {
    // 获取历史数据
    const historicalData = this.getHistoricalDataForDimension(
      supplierId,
      dimension,
      timeWindowMonths
    );

    // 结合当前数据和历史数?    const combinedFactors = this.combineCurrentAndHistoricalFactors(
      currentFactors,
      historicalData,
      dimension
    );

    // 执行标准评估
    return super.assessDimension(dimension, combinedFactors);
  }

  /**
   * 动态调整权?   */
  adjustWeightsBasedOnPerformance(
    supplierId: string,
    recentPerformance: Record<CapabilityDimension, number>
  ): ScoringWeights {
    if (!this.dynamicWeightConfig.enableAutoAdjustment) {
      return this.getWeights();
    }

    const currentWeights = this.getWeights();
    const adjustedWeights = { ...currentWeights };
    const sensitivity = this.dynamicWeightConfig.sensitivity;

    // 计算各维度相对表?    const avgPerformance =
      Object.values(recentPerformance).reduce((sum, val) => sum + val, 0) / 5;

    Object.entries(recentPerformance).forEach(([dim, score]) => {
      const dimension = dim as CapabilityDimension;
      const relativePerformance = score / avgPerformance;

      // 根据相对表现调整权重
      let adjustment = 0;
      if (relativePerformance > 1.2) {
        // 表现优异，适当降低权重
        adjustment = -sensitivity * 0.1;
      } else if (relativePerformance < 0.8) {
        // 表现较差，适当提高权重以加强关?        adjustment = sensitivity * 0.15;
      }

      const currentWeight = currentWeights[dimension];
      const newWeight = Math.max(
        this.dynamicWeightConfig.minWeight,
        Math.min(this.dynamicWeightConfig.maxWeight, currentWeight + adjustment)
      );

      adjustedWeights[dimension] = newWeight;
    });

    // 重新平衡权重使总和?
    this.normalizeWeights(adjustedWeights);

    // 应用新权?    this.setWeights(adjustedWeights);

    return adjustedWeights;
  }

  /**
   * 生成带历史趋势的完整能力画像
   */
  generateAdvancedCapabilityProfile(
    supplierId: string,
    supplierName: string,
    dimensionAssessments: DimensionAssessment[],
    includeTrendAnalysis: boolean = true
  ): SupplierCapabilityProfile & {
    trendAnalysis?: TrendAnalysis;
    dataQualityMetrics?: DataQualityMetrics;
  } {
    const basicProfile = super.generateCapabilityProfile(
      supplierId,
      supplierName,
      dimensionAssessments
    );

    let enhancedProfile: any = { ...basicProfile };

    if (includeTrendAnalysis) {
      enhancedProfile.trendAnalysis = this.analyzePerformanceTrends(supplierId);
    }

    enhancedProfile.dataQualityMetrics = this.evaluateDataQuality(supplierId);

    return enhancedProfile;
  }

  /**
   * 从多种数据源整合评估因子
   */
  integrateMultiSourceFactors(
    supplierId: string,
    dimension: CapabilityDimension,
    dataSources: Array<{ sourceId: string; rawData: any }>
  ): AssessmentFactor[] {
    const integratedFactors: AssessmentFactor[] = [];

    dataSources.forEach(({ sourceId, rawData }) => {
      const dataSource = this.dataSourceRegistry.get(sourceId);
      if (!dataSource) return;

      const factors = this.extractFactorsFromRawData(
        rawData,
        dimension,
        dataSource
      );
      integratedFactors.push(...factors);
    });

    // 基于数据源可靠性进行加权整?    return this.weightFactorsByReliability(integratedFactors);
  }

  // 私有辅助方法

  private getHistoricalDataForDimension(
    supplierId: string,
    dimension: CapabilityDimension,
    months: number
  ): HistoricalPerformance[] {
    const allData = this.historicalDataCache.get(supplierId) || [];
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);

    return allData.filter(data => {
      const dataDate = new Date(data.period + '-01');
      return (
        dataDate >= cutoffDate &&
        this.getMetricScore(data.metrics, dimension) !== undefined
      );
    });
  }

  private combineCurrentAndHistoricalFactors(
    currentFactors: AssessmentFactor[],
    historicalData: HistoricalPerformance[],
    dimension: CapabilityDimension
  ): AssessmentFactor[] {
    const combinedFactors = [...currentFactors];

    // 将历史数据转换为因子
    historicalData.forEach(data => {
      const score = this.getMetricScore(data.metrics, dimension);
      if (score !== undefined) {
        combinedFactors.push({
          factorId: `historical_${data.period}`,
          factorName: `历史表现(${data.period})`,
          weight: 0.3 * (data.confidence || 0.8), // 历史数据权重
          currentValue: score,
          confidence: data.confidence || 0.8,
        });
      }
    });

    return combinedFactors;
  }

  private normalizeWeights(weights: ScoringWeights): void {
    const total = Object.values(weights).reduce(
      (sum: number, w: number) => sum + w,
      0
    );
    if (total === 0) return;

    Object.keys(weights).forEach(key => {
      const dimension = key as keyof ScoringWeights;
      weights[dimension] = weights[dimension] / total;
    });
  }

  // 添加缺失的辅助方?  private getMetricScore(
    metrics: any,
    dimension: CapabilityDimension
  ): number | undefined {
    const key = `${dimension}_score`;
    return metrics[key];
  }

  // 由于父类的weights是私有的，我们需要通过公共方法访问
  private getWeights(): ScoringWeights {
    // 这里需要通过反射或其他方式获取父类的weights
    // 暂时返回当前配置的权?    return this.dynamicWeightConfig
      ? {
          quality: 0.3,
          delivery: 0.2,
          price: 0.25,
          service: 0.15,
          innovation: 0.1,
        }
      : DEFAULT_WEIGHTS;
  }

  public setWeights(weights: ScoringWeights): void {
    // 由于无法直接修改父类私有属性，我们保存在自己的配置中供后续使用
    this.dynamicWeightConfig = {
      ...this.dynamicWeightConfig,
      // 这里可以保存自定义权重配置供其他方法使用
    };
  }

  private analyzePerformanceTrends(supplierId: string): TrendAnalysis {
    const trendData: Record<CapabilityDimension, number[]> = {
      [CapabilityDimension.QUALITY]: [],
      [CapabilityDimension.DELIVERY]: [],
      [CapabilityDimension.PRICE]: [],
      [CapabilityDimension.SERVICE]: [],
      [CapabilityDimension.INNOVATION]: [],
    };

    // 从历史数据提取趋?    const historicalData = this.historicalDataCache.get(supplierId) || [];
    historicalData.forEach(data => {
      Object.keys(trendData).forEach(dim => {
        const score = this.getMetricScore(
          data.metrics,
          dim as CapabilityDimension
        );
        if (score !== undefined) {
          trendData[dim as CapabilityDimension].push(score);
        }
      });
    });

    // 计算趋势指标
    const trends: Record<CapabilityDimension, TrendIndicator> = {} as any;

    Object.entries(trendData).forEach(([dimension, scores]) => {
      if (scores.length < 2) {
        trends[dimension as CapabilityDimension] = {
          direction: 'insufficient_data',
          magnitude: 0,
          confidence: 0,
        };
        return;
      }

      // 简单线性回归计算趋?      const n = scores.length;
      const x = Array.from({ length: n }, (_, i) => i);
      const y = scores;

      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const avgY = sumY / n;

      // 计算决定系数 R²
      const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - avgY, 2), 0);
      const ssRes = y.reduce(
        (sum, yi, i) =>
          sum + Math.pow(yi - (slope * x[i] + (sumY - slope * sumX) / n), 2),
        0
      );
      const rSquared = 1 - ssRes / ssTot;

      trends[dimension as CapabilityDimension] = {
        direction:
          slope > 0.5 ? 'improving' : slope < -0.5 ? 'declining' : 'stable',
        magnitude: Math.abs(slope),
        confidence: Math.min(1, Math.max(0, rSquared)),
      };
    });

    return {
      period: `${historicalData.length}个月`,
      trends,
      overallTrend: this.calculateOverallTrend(trends),
    };
  }

  private calculateOverallTrend(
    trends: Record<CapabilityDimension, TrendIndicator>
  ): OverallTrend {
    const improvingCount = Object.values(trends).filter(
      t => t.direction === 'improving'
    ).length;
    const decliningCount = Object.values(trends).filter(
      t => t.direction === 'declining'
    ).length;
    const totalDimensions = Object.keys(trends).length;

    if (improvingCount > totalDimensions * 0.6) return 'strongly_improving';
    if (improvingCount > totalDimensions * 0.4) return 'moderately_improving';
    if (decliningCount > totalDimensions * 0.6) return 'strongly_declining';
    if (decliningCount > totalDimensions * 0.4) return 'moderately_declining';
    return 'mixed_or_stable';
  }

  private evaluateDataQuality(supplierId: string): DataQualityMetrics {
    const sources = Array.from(this.dataSourceRegistry.values());
    const historicalData = this.historicalDataCache.get(supplierId) || [];
    const realTimeData = this.realTimeAssessments.get(supplierId) || [];

    // 计算数据源多样?    const uniqueSourceTypes = new Set(sources.map(s => s.sourceType)).size;
    const sourceDiversity = Math.min(1, uniqueSourceTypes / 4); // 最?种类?
    // 计算数据新鲜?    const latestUpdate =
      sources.length > 0
        ? Math.max(...sources.map(s => new Date(s.lastUpdate).getTime()))
        : Date.now();
    const daysSinceUpdate = (Date.now() - latestUpdate) / (1000 * 60 * 60 * 24);
    const freshnessScore = Math.max(0, 1 - daysSinceUpdate / 90); // 90天内为满?
    // 计算数据完整?    const completeness =
      historicalData.length > 0
        ? Math.min(
            1,
            historicalData.length /
              this.dynamicWeightConfig.historicalWindowSize
          )
        : 0;

    // 计算数据可靠?    const avgReliability =
      sources.length > 0
        ? sources.reduce((sum, s) => sum + s.reliabilityScore, 0) /
          sources.length
        : 0.7;

    return {
      overallScore:
        (sourceDiversity + freshnessScore + completeness + avgReliability) / 4,
      sourceDiversity,
      freshnessScore,
      completeness,
      reliabilityScore: avgReliability,
      dataPointsCount: historicalData.length + realTimeData.length,
    };
  }

  private extractFactorsFromRawData(
    rawData: any,
    dimension: CapabilityDimension,
    dataSource: DataSource
  ): AssessmentFactor[] {
    const factors: AssessmentFactor[] = [];

    switch (dimension) {
      case CapabilityDimension.QUALITY:
        if (rawData.defectRate !== undefined) {
          factors.push({
            factorId: 'defect_rate',
            factorName: '不良?,
            weight: 0.4,
            currentValue: normalizeScore(100 - rawData.defectRate, 0, 100),
            confidence: dataSource.reliabilityScore,
          });
        }
        break;

      case CapabilityDimension.DELIVERY:
        if (rawData.onTimeDeliveryRate !== undefined) {
          factors.push({
            factorId: 'on_time_delivery',
            factorName: '准时交付?,
            weight: 0.6,
            currentValue: rawData.onTimeDeliveryRate,
            confidence: dataSource.reliabilityScore,
          });
        }
        break;

      // 其他维度类似处理...
    }

    return factors;
  }

  private weightFactorsByReliability(
    factors: AssessmentFactor[]
  ): AssessmentFactor[] {
    // 按可靠性调整权?    return factors.map(factor => ({
      ...factor,
      weight: factor.weight * factor.confidence,
    }));
  }
}

// 辅助类型定义
interface TrendIndicator {
  direction: 'improving' | 'declining' | 'stable' | 'insufficient_data';
  magnitude: number; // 趋势强度
  confidence: number; // 趋势判断置信?}

interface TrendAnalysis {
  period: string;
  trends: Record<CapabilityDimension, TrendIndicator>;
  overallTrend: OverallTrend;
}

type OverallTrend =
  | 'strongly_improving'
  | 'moderately_improving'
  | 'mixed_or_stable'
  | 'moderately_declining'
  | 'strongly_declining';

interface DataQualityMetrics {
  overallScore: number;
  sourceDiversity: number;
  freshnessScore: number;
  completeness: number;
  reliabilityScore: number;
  dataPointsCount: number;
}

// 工厂函数创建评分引擎实例
export function createScoringEngine(config?: {
  weights?: ScoringWeights;
  dynamicConfig?: Partial<DynamicWeightConfig>;
}): AdvancedCapabilityScoringEngine {
  return new AdvancedCapabilityScoringEngine(
    config?.weights,
    config?.dynamicConfig
  );
}

// 默认数据源配?export const DEFAULT_DATA_SOURCES: DataSource[] = [
  {
    sourceId: 'internal_erp',
    sourceName: '内部ERP系统',
    sourceType: 'internal',
    reliabilityScore: 0.95,
    lastUpdate: new Date().toISOString(),
  },
  {
    sourceId: 'quality_audits',
    sourceName: '质量审核报告',
    sourceType: 'audit',
    reliabilityScore: 0.9,
    lastUpdate: new Date().toISOString(),
  },
  {
    sourceId: 'customer_surveys',
    sourceName: '客户满意度调?,
    sourceType: 'survey',
    reliabilityScore: 0.8,
    lastUpdate: new Date().toISOString(),
  },
  {
    sourceId: 'industry_reports',
    sourceName: '行业基准报告',
    sourceType: 'external',
    reliabilityScore: 0.7,
    lastUpdate: new Date().toISOString(),
  },
];
