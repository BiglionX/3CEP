/**
 * 供应商能力评分算? * 基于多维度指标对供应商进行综合能力评? */

export interface CapabilityScoreInput {
  // 基础信息
  supplierId: string;
  historicalPerformance: {
    qualityScore: number; // 质量得分 (0-100)
    deliveryScore: number; // 交付得分 (0-100)
    priceScore: number; // 价格得分 (0-100)
    serviceScore: number; // 服务得分 (0-100)
  };

  // 业务指标
  businessMetrics: {
    annualRevenue: number; // 年营业额
    employeeCount: number; // 员工数量
    yearsInBusiness: number; // 经营年限
    marketShare?: number; // 市场份额
  };

  // 合规认证
  certifications: string[];

  // 交易历史
  transactionHistory: {
    totalOrders: number;
    successfulDeliveries: number;
    averageOrderValue: number;
    customerFeedbackScore: number;
  };
}

export interface CapabilityScoreOutput {
  overallScore: number; // 综合得分 (0-100)
  dimensionScores: {
    quality: number; // 质量能力
    delivery: number; // 交付能力
    price: number; // 价格竞争?    service: number; // 服务能力
    innovation: number; // 创新能力
  };
  scoreDetails: {
    weights: Record<string, number>;
    factors: Record<string, number>;
    recommendations: string[];
  };
  supplierLevel: 'A' | 'B' | 'C' | 'D'; // 供应商等?}

export class SupplierCapabilityScoringAlgorithm {
  // 权重配置
  private readonly WEIGHTS = {
    quality: 0.3,
    delivery: 0.25,
    price: 0.2,
    service: 0.15,
    innovation: 0.1,
  };

  // 认证加分?  private readonly CERTIFICATION_BONUSES: Record<string, number> = {
    ISO9001: 5,
    ISO14001: 3,
    ISO45001: 2,
    CE: 4,
    FDA: 6,
    CCC: 3,
  };

  /**
   * 计算供应商综合能力评?   */
  calculateCapabilityScore(input: CapabilityScoreInput): CapabilityScoreOutput {
    // 1. 计算各维度基础得分
    const dimensionScores = this.calculateDimensionScores(input);

    // 2. 应用权重计算综合得分
    const weightedScore = this.calculateWeightedScore(dimensionScores);

    // 3. 应用认证加分
    const certificationBonus = this.calculateCertificationBonus(
      input.certifications
    );
    const finalScore = Math.min(100, weightedScore + certificationBonus);

    // 4. 确定供应商等?    const supplierLevel = this.determineSupplierLevel(finalScore);

    // 5. 生成建议
    const recommendations = this.generateRecommendations(
      input,
      dimensionScores
    );

    return {
      overallScore: parseFloat(finalScore.toFixed(2)),
      dimensionScores,
      scoreDetails: {
        weights: { ...this.WEIGHTS },
        factors: {
          certificationBonus,
          baseScore: weightedScore,
        },
        recommendations,
      },
      supplierLevel,
    };
  }

  /**
   * 计算各维度得?   */
  private calculateDimensionScores(
    input: CapabilityScoreInput
  ): CapabilityScoreOutput['dimensionScores'] {
    const { historicalPerformance, businessMetrics, transactionHistory } =
      input;

    // 质量能力 (30%)
    const qualityScore = this.calculateQualityScore(
      historicalPerformance.qualityScore,
      transactionHistory
    );

    // 交付能力 (25%)
    const deliveryScore = this.calculateDeliveryScore(
      historicalPerformance.deliveryScore,
      transactionHistory.successfulDeliveries,
      transactionHistory.totalOrders
    );

    // 价格竞争?(20%)
    const priceScore = this.calculatePriceScore(
      historicalPerformance.priceScore,
      businessMetrics
    );

    // 服务能力 (15%)
    const serviceScore = this.calculateServiceScore(
      historicalPerformance.serviceScore,
      transactionHistory.customerFeedbackScore
    );

    // 创新能力 (10%)
    const innovationScore = this.calculateInnovationScore(
      businessMetrics,
      input.certifications
    );

    return {
      quality: parseFloat(qualityScore.toFixed(2)),
      delivery: parseFloat(deliveryScore.toFixed(2)),
      price: parseFloat(priceScore.toFixed(2)),
      service: parseFloat(serviceScore.toFixed(2)),
      innovation: parseFloat(innovationScore.toFixed(2)),
    };
  }

  /**
   * 计算质量得分
   */
  private calculateQualityScore(
    baseQuality: number,
    transactionHistory: CapabilityScoreInput['transactionHistory']
  ): number {
    // 基础质量得分?0%，历史表现占30%
    const baseComponent = baseQuality * 0.7;
    const historyComponent = transactionHistory.customerFeedbackScore * 0.3;

    return Math.min(100, baseComponent + historyComponent);
  }

  /**
   * 计算交付得分
   */
  private calculateDeliveryScore(
    baseDelivery: number,
    successfulDeliveries: number,
    totalOrders: number
  ): number {
    // 基础交付得分?0%，准时交付率?0%
    const baseComponent = baseDelivery * 0.6;
    const onTimeRate =
      totalOrders > 0 ? (successfulDeliveries / totalOrders) * 100 : 100;
    const rateComponent = onTimeRate * 0.4;

    return Math.min(100, baseComponent + rateComponent);
  }

  /**
   * 计算价格竞争力得?   */
  private calculatePriceScore(
    basePrice: number,
    businessMetrics: CapabilityScoreInput['businessMetrics']
  ): number {
    // 基础价格得分?0%，规模效应占20%
    const baseComponent = basePrice * 0.8;

    // 规模效应加分：大型企业通常有更好的议价能力
    let scaleBonus = 0;
    if (businessMetrics.annualRevenue > 100000000) {
      scaleBonus = 5; // 超大型企?    } else if (businessMetrics.annualRevenue > 50000000) {
      scaleBonus = 3; // 大型企业
    } else if (businessMetrics.annualRevenue > 10000000) {
      scaleBonus = 1; // 中型企业
    }

    return Math.min(100, baseComponent + scaleBonus);
  }

  /**
   * 计算服务得分
   */
  private calculateServiceScore(
    baseService: number,
    customerFeedback: number
  ): number {
    // 基础服务得分?0%，客户反馈占30%
    const baseComponent = baseService * 0.7;
    const feedbackComponent = customerFeedback * 0.3;

    return Math.min(100, baseComponent + feedbackComponent);
  }

  /**
   * 计算创新能力得分
   */
  private calculateInnovationScore(
    businessMetrics: CapabilityScoreInput['businessMetrics'],
    certifications: string[]
  ): number {
    let score = 60; // 基础?
    // 经营年限加分
    if (businessMetrics.yearsInBusiness > 20) {
      score += 10;
    } else if (businessMetrics.yearsInBusiness > 10) {
      score += 5;
    }

    // 员工规模加分
    if (businessMetrics.employeeCount > 1000) {
      score += 10;
    } else if (businessMetrics.employeeCount > 500) {
      score += 5;
    }

    // R&D相关认证加分
    const innovationCerts = certifications.filter(cert =>
      ['ISO9001', 'ISO14001', 'CE', 'FDA'].includes(cert)
    );
    score += innovationCerts.length * 3;

    return Math.min(100, score);
  }

  /**
   * 计算加权综合得分
   */
  private calculateWeightedScore(
    dimensionScores: CapabilityScoreOutput['dimensionScores']
  ): number {
    return (
      dimensionScores.quality * this.WEIGHTS.quality +
      dimensionScores.delivery * this.WEIGHTS.delivery +
      dimensionScores.price * this.WEIGHTS.price +
      dimensionScores.service * this.WEIGHTS.service +
      dimensionScores.innovation * this.WEIGHTS.innovation
    );
  }

  /**
   * 计算认证加分
   */
  private calculateCertificationBonus(certifications: string[]): number {
    return certifications.reduce((bonus, cert) => {
      return bonus + (this.CERTIFICATION_BONUSES[cert] || 1);
    }, 0);
  }

  /**
   * 确定供应商等?   */
  private determineSupplierLevel(
    score: number
  ): CapabilityScoreOutput['supplierLevel'] {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    return 'D';
  }

  /**
   * 生成改进建议
   */
  private generateRecommendations(
    input: CapabilityScoreInput,
    dimensionScores: CapabilityScoreOutput['dimensionScores']
  ): string[] {
    const recommendations: string[] = [];

    // 质量方面建议
    if (dimensionScores.quality < 80) {
      recommendations.push('建议加强质量管理体系建设，提高产品质量稳定?);
    }

    // 交付方面建议
    if (dimensionScores.delivery < 80) {
      recommendations.push('建议优化供应链管理，提高交付准时?);
    }

    // 价格方面建议
    if (dimensionScores.price < 80) {
      recommendations.push('建议优化成本结构，提高价格竞争力');
    }

    // 服务方面建议
    if (dimensionScores.service < 80) {
      recommendations.push('建议加强客户服务团队建设，提升客户满意度');
    }

    // 创新方面建议
    if (dimensionScores.innovation < 70) {
      recommendations.push('建议加大研发投入，提升技术创新能?);
    }

    // 认证建议
    const missingCertifications = Object.keys(
      this.CERTIFICATION_BONUSES
    ).filter(cert => !input.certifications.includes(cert));

    if (missingCertifications.length > 0) {
      recommendations.push(
        `建议获取相关认证: ${missingCertifications.slice(0, 3).join(', ')}`
      );
    }

    return recommendations;
  }

  /**
   * 批量计算多个供应商得?   */
  batchCalculate(inputs: CapabilityScoreInput[]): CapabilityScoreOutput[] {
    return inputs.map(input => this.calculateCapabilityScore(input));
  }

  /**
   * 获取算法配置信息
   */
  getConfig() {
    return {
      weights: { ...this.WEIGHTS },
      certificationBonuses: { ...this.CERTIFICATION_BONUSES },
      version: '1.0.0',
    };
  }
}

// 导出默认实例
export const supplierCapabilityScoring =
  new SupplierCapabilityScoringAlgorithm();

// 使用示例
/*
const input: CapabilityScoreInput = {
  supplierId: 'SUP001',
  historicalPerformance: {
    qualityScore: 85,
    deliveryScore: 90,
    priceScore: 75,
    serviceScore: 88
  },
  businessMetrics: {
    annualRevenue: 50000000,
    employeeCount: 200,
    yearsInBusiness: 15,
    marketShare: 5
  },
  certifications: ['ISO9001', 'CE'],
  transactionHistory: {
    totalOrders: 100,
    successfulDeliveries: 95,
    averageOrderValue: 50000,
    customerFeedbackScore: 92
  }
}

const result = supplierCapabilityScoring.calculateCapabilityScore(input)
// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(result)*/
