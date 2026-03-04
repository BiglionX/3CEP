/**
 * 供应商能力评分算法设?(C001-1)
 * 多维度供应商能力评估框架
 */

// 评估维度定义
export enum CapabilityDimension {
  QUALITY = 'quality', // 质量能力
  DELIVERY = 'delivery', // 交付能力
  PRICE = 'price', // 价格竞争?  SERVICE = 'service', // 服务能力
  INNOVATION = 'innovation', // 创新能力
}

// 评估因子接口
export interface AssessmentFactor {
  factorId: string;
  factorName: string;
  weight: number; // 因子权重 (0-1)
  currentValue: number; // 当前?(通常0-100)
  benchmarkValue?: number; // 基准?  trend?: 'improving' | 'declining' | 'stable'; // 趋势
  confidence: number; // 置信?(0-1)
}

// 质量能力因子
export interface QualityFactor extends AssessmentFactor {
  defectRate?: number; // 不良?(%)
  returnRate?: number; // 退货率 (%)
  certificationScore?: number; // 认证得分 (0-100)
  auditResults?: Array<{
    date: string;
    auditor: string;
    score: number;
    findings: string[];
  }>;
}

// 交付能力因子
export interface DeliveryFactor extends AssessmentFactor {
  onTimeDeliveryRate?: number; // 准时交付?(%)
  leadTimeAverage?: number; // 平均交货天数
  deliveryAccuracy?: number; // 交付准确?(%)
  capacityUtilization?: number; // 产能利用?(%)
  flexibilityScore?: number; // 灵活度评?(0-100)
}

// 价格竞争力因?export interface PriceFactor extends AssessmentFactor {
  priceCompetitiveness?: number; // 价格竞争力指?(0-100)
  costStability?: number; // 成本稳定?(0-100)
  paymentTerms?: number; // 付款条件评分 (0-100)
  volumeDiscounts?: number; // 批量折扣潜力 (0-100)
  priceTrend?: 'increasing' | 'decreasing' | 'stable';
}

// 服务能力因子
export interface ServiceFactor extends AssessmentFactor {
  responseTime?: number; // 响应时间 (小时)
  communicationQuality?: number; // 沟通质?(0-100)
  problemResolution?: number; // 问题解决能力 (0-100)
  technicalSupport?: number; // 技术支持水?(0-100)
  relationshipManagement?: number; // 关系管理水平 (0-100)
}

// 创新能力因子
export interface InnovationFactor extends AssessmentFactor {
  rdInvestmentRatio?: number; // 研发投入占比 (%)
  patentCount?: number; // 专利数量
  newProductLaunch?: number; // 新产品推出频?  technologyAdoption?: number; // 技术采纳水?(0-100)
  sustainabilityInitiatives?: number; // 可持续发展举?(0-100)
}

// 维度评估结果
export interface DimensionAssessment {
  dimension: CapabilityDimension;
  score: number; // 维度综合得分 (0-100)
  weight: number; // 维度权重 (0-1)
  factors: AssessmentFactor[]; // 包含的评估因?  confidence: number; // 维度评估置信?(0-1)
  trend?: 'improving' | 'declining' | 'stable'; // 整体趋势
  lastAssessmentDate: string; // 最后评估日?}

// 供应商能力画?export interface SupplierCapabilityProfile {
  supplierId: string;
  supplierName: string;
  overallScore: number; // 综合能力得分 (0-100)
  dimensions: DimensionAssessment[];
  tier: 'premium' | 'standard' | 'basic' | 'risky'; // 供应商等?  tierConfidence: number; // 等级判定置信?  lastUpdated: string; // 最后更新时?  assessmentPeriod: string; // 评估周期
  recommendations: string[]; // 改进建议
  strengths: string[]; // 优势领域
  weaknesses: string[]; // 待改进领?}

// 评分权重配置
export interface ScoringWeights {
  quality: number; // 质量权重
  delivery: number; // 交付权重
  price: number; // 价格权重
  service: number; // 服务权重
  innovation: number; // 创新权重
}

// 默认权重配置
export const DEFAULT_WEIGHTS: ScoringWeights = {
  quality: 0.3, // 30% - 质量最重要
  delivery: 0.2, // 20% - 交付能力
  price: 0.25, // 25% - 价格竞争?  service: 0.15, // 15% - 服务能力
  innovation: 0.1, // 10% - 创新能力
};

// 行业特定权重配置
export const INDUSTRY_WEIGHTS: Record<string, ScoringWeights> = {
  electronics: {
    quality: 0.35,
    delivery: 0.2,
    price: 0.2,
    service: 0.15,
    innovation: 0.1,
  },
  automotive: {
    quality: 0.4,
    delivery: 0.25,
    price: 0.15,
    service: 0.1,
    innovation: 0.1,
  },
  consumer_goods: {
    quality: 0.25,
    delivery: 0.2,
    price: 0.3,
    service: 0.15,
    innovation: 0.1,
  },
  industrial_equipment: {
    quality: 0.3,
    delivery: 0.25,
    price: 0.2,
    service: 0.15,
    innovation: 0.1,
  },
};

// 评估标准配置
export interface EvaluationCriteria {
  // 质量标准
  qualityThresholds: {
    excellent: number; // >= 90�?    good: number; // >= 75�?    acceptable: number; // >= 60�?    poor: number; // < 60�?  };

  // 交付标准
  deliveryThresholds: {
    excellent: number; // >= 95% 准时?    good: number; // >= 85% 准时?    acceptable: number; // >= 75% 准时?    poor: number; // < 75% 准时?  };

  // 价格标准
  priceThresholds: {
    competitive: number; // >= 85�?(有竞争力)
    reasonable: number; // >= 70�?(合理)
    expensive: number; // >= 50�?(偏贵)
    overpriced: number; // < 50�?(过高)
  };
}

// 评分算法核心?export class SupplierCapabilityScoringEngine {
  private weights: ScoringWeights;
  private criteria: EvaluationCriteria;

  constructor(weights: ScoringWeights = DEFAULT_WEIGHTS) {
    this.weights = weights;
    this.criteria = this.getDefaultCriteria();
  }

  /**
   * 设置评估权重
   */
  setWeights(weights: ScoringWeights): void {
    // 验证权重总和?
    const totalWeight = Object.values(weights).reduce(
      (sum, weight) => sum + weight,
      0
    );
    if (Math.abs(totalWeight - 1) > 0.001) {
      throw new Error('权重总和必须等于1');
    }
    this.weights = weights;
  }

  /**
   * 根据行业设置权重
   */
  setIndustryWeights(industry: string): void {
    if (INDUSTRY_WEIGHTS[industry]) {
      this.setWeights(INDUSTRY_WEIGHTS[industry]);
    }
  }

  /**
   * 评估单个维度
   */
  assessDimension(
    dimension: CapabilityDimension,
    factors: AssessmentFactor[]
  ): DimensionAssessment {
    // 计算加权平均得分
    let weightedSum = 0;
    let totalWeight = 0;
    let confidenceSum = 0;

    factors.forEach(factor => {
      weightedSum += factor.currentValue * factor.weight;
      totalWeight += factor.weight;
      confidenceSum += factor.confidence * factor.weight;
    });

    const dimensionScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
    const dimensionConfidence =
      totalWeight > 0 ? confidenceSum / totalWeight : 0;

    // 确定趋势
    const trend = this.analyzeTrend(factors);

    return {
      dimension,
      score: Math.min(100, Math.max(0, dimensionScore)),
      weight: this.weights[dimension],
      factors,
      confidence: Math.min(1, Math.max(0, dimensionConfidence)),
      trend,
      lastAssessmentDate: new Date().toISOString(),
    };
  }

  /**
   * 生成完整的供应商能力画像
   */
  generateCapabilityProfile(
    supplierId: string,
    supplierName: string,
    dimensionAssessments: DimensionAssessment[]
  ): SupplierCapabilityProfile {
    // 计算综合得分
    let overallScore = 0;
    let totalWeight = 0;
    let confidenceSum = 0;

    dimensionAssessments.forEach(assessment => {
      overallScore += assessment.score * assessment.weight;
      totalWeight += assessment.weight;
      confidenceSum += assessment.confidence * assessment.weight;
    });

    const finalScore = totalWeight > 0 ? overallScore / totalWeight : 0;
    const finalConfidence = totalWeight > 0 ? confidenceSum / totalWeight : 0;

    // 确定供应商等?    const tier = this.determineSupplierTier(finalScore);

    // 生成分析和建?    const { strengths, weaknesses, recommendations } =
      this.generateAnalysis(dimensionAssessments);

    return {
      supplierId,
      supplierName,
      overallScore: Math.min(100, Math.max(0, finalScore)),
      dimensions: dimensionAssessments,
      tier,
      tierConfidence: Math.min(1, Math.max(0, finalConfidence)),
      lastUpdated: new Date().toISOString(),
      assessmentPeriod: this.getCurrentAssessmentPeriod(),
      recommendations,
      strengths,
      weaknesses,
    };
  }

  /**
   * 确定供应商等?   */
  private determineSupplierTier(
    score: number
  ): SupplierCapabilityProfile['tier'] {
    if (score >= 90) return 'premium';
    if (score >= 70) return 'standard';
    if (score >= 50) return 'basic';
    return 'risky';
  }

  /**
   * 分析趋势
   */
  private analyzeTrend(
    factors: AssessmentFactor[]
  ): 'improving' | 'declining' | 'stable' {
    const trends = factors
      .filter(factor => factor.trend)
      .map(factor => factor.trend);

    if (trends.length === 0) return 'stable';

    const improvingCount = trends.filter(t => t === 'improving').length;
    const decliningCount = trends.filter(t => t === 'declining').length;

    if (improvingCount > decliningCount) return 'improving';
    if (decliningCount > improvingCount) return 'declining';
    return 'stable';
  }

  /**
   * 生成分析和建?   */
  private generateAnalysis(dimensionAssessments: DimensionAssessment[]): {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    dimensionAssessments.forEach(assessment => {
      const dimensionName = this.getDimensionDisplayName(assessment.dimension);

      if (assessment.score >= 85) {
        strengths.push(
          `${dimensionName}表现优秀 (${assessment.score.toFixed(1)}�?`
        );
      } else if (assessment.score >= 70) {
        // 表现良好，但可能有提升空?        if (assessment.score < 75) {
          recommendations.push(`适度提升${dimensionName}能力`);
        }
      } else if (assessment.score >= 50) {
        weaknesses.push(
          `${dimensionName}有待改善 (${assessment.score.toFixed(1)}�?`
        );
        recommendations.push(`重点关注${dimensionName}能力提升`);
      } else {
        weaknesses.push(
          `${dimensionName}表现较差 (${assessment.score.toFixed(1)}�?`
        );
        recommendations.push(`紧急改?{dimensionName}相关问题`);
      }

      // 基于置信度的建议
      if (assessment.confidence < 0.7) {
        recommendations.push(
          `收集更多${dimensionName}相关数据以提高评估准确性`
        );
      }
    });

    return { strengths, weaknesses, recommendations };
  }

  /**
   * 获取维度显示名称
   */
  private getDimensionDisplayName(dimension: CapabilityDimension): string {
    const names = {
      [CapabilityDimension.QUALITY]: '质量能力',
      [CapabilityDimension.DELIVERY]: '交付能力',
      [CapabilityDimension.PRICE]: '价格竞争?,
      [CapabilityDimension.SERVICE]: '服务能力',
      [CapabilityDimension.INNOVATION]: '创新能力',
    };
    return names[dimension];
  }

  /**
   * 获取默认评估标准
   */
  private getDefaultCriteria(): EvaluationCriteria {
    return {
      qualityThresholds: {
        excellent: 90,
        good: 75,
        acceptable: 60,
        poor: 0,
      },
      deliveryThresholds: {
        excellent: 95,
        good: 85,
        acceptable: 75,
        poor: 0,
      },
      priceThresholds: {
        competitive: 85,
        reasonable: 70,
        expensive: 50,
        overpriced: 0,
      },
    };
  }

  /**
   * 获取当前评估周期
   */
  private getCurrentAssessmentPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}

// 工具函数：标准化分数?-100范围
export function normalizeScore(
  value: number,
  min: number,
  max: number
): number {
  if (min === max) return 50; // 避免除零
  const normalized = ((value - min) / (max - min)) * 100;
  return Math.min(100, Math.max(0, normalized));
}

// 工具函数：计算置信度加权平均
export function calculateConfidenceWeightedAverage(
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

// 类型已经在前面通过interface关键字导出，这里不需要重复导?