/**
 * 智能供应商匹配算? * 基于多维度需求匹配最优供应商
 */

export interface MatchingRequirement {
  // 产品需?  productSpecs: {
    category: string;
    technicalRequirements: string[];
    qualityStandards: string[];
    quantity: number;
    deliveryTimeline: number; // 天数
  };

  // 商务条件
  businessConditions: {
    budgetRange: [number, number]; // 预算范围
    paymentTerms: string;
    deliveryLocation: string;
    currency: string;
  };

  // 风险偏好
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';

  // 优先级权?  priorities: {
    quality: number; // 质量优先?(0-1)
    price: number; // 价格优先?(0-1)
    delivery: number; // 交付优先?(0-1)
    service: number; // 服务优先?(0-1)
    innovation: number; // 创新优先?(0-1)
  };
}

export interface SupplierProfile {
  supplierId: string;
  companyName: string;
  capabilities: {
    productCategories: string[];
    technicalExpertise: string[];
    qualityCertifications: string[];
    productionCapacity: number;
  };
  pricing: {
    basePrice: number;
    bulkDiscount: number;
    currency: string;
  };
  delivery: {
    leadTime: number; // 天数
    deliveryLocations: string[];
    logisticsCapabilities: string[];
  };
  scores: {
    quality: number; // 质量得分 (0-100)
    priceCompetitiveness: number; // 价格竞争?(0-100)
    deliveryReliability: number; // 交付可靠?(0-100)
    serviceLevel: number; // 服务水平 (0-100)
    innovationIndex: number; // 创新指数 (0-100)
  };
  riskProfile: {
    overallRisk: number; // 综合风险得分 (0-100)
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  availability: {
    currentCapacityUtilization: number; // 当前产能利用?(0-100)
    maxCapacity: number;
  };
}

export interface MatchResult {
  supplierId: string;
  supplierName: string;
  matchScore: number; // 匹配得分 (0-100)
  compatibilityDetails: {
    productMatch: number; // 产品匹配?    priceFit: number; // 价格适配?    deliveryFeasibility: number; // 交付可行?    riskAcceptability: number; // 风险可接受度
    overallCompatibility: number; // 综合兼容?  };
  recommendations: string[]; // 匹配建议
  confidenceLevel: 'high' | 'medium' | 'low'; // 匹配置信?}

export interface SmartMatchingOutput {
  topMatches: MatchResult[];
  alternativeOptions: MatchResult[];
  marketInsights: {
    averageMarketPrice: number;
    priceRange: [number, number];
    competitiveLandscape: string;
  };
  negotiationStrategy: {
    suggestedApproach: string;
    keyLeverages: string[];
    potentialRisks: string[];
  };
}

export class SmartSupplierMatcher {
  // 匹配权重配置
  private readonly MATCH_WEIGHTS = {
    productCompatibility: 0.3,
    priceAlignment: 0.25,
    deliveryFeasibility: 0.2,
    riskAcceptability: 0.15,
    serviceQuality: 0.1,
  };

  // 风险容忍度调整因?  private readonly RISK_TOLERANCE_FACTORS = {
    conservative: 0.8,
    moderate: 1.0,
    aggressive: 1.2,
  };

  /**
   * 智能匹配供应?   */
  matchSuppliers(
    requirement: MatchingRequirement,
    suppliers: SupplierProfile[],
    options: { topN?: number; includeAlternatives?: boolean } = {}
  ): SmartMatchingOutput {
    const { topN = 5, includeAlternatives = true } = options;

    // 1. 预筛选符合条件的供应?    const qualifiedSuppliers = this.preScreenSuppliers(requirement, suppliers);

    if (qualifiedSuppliers.length === 0) {
      return this.generateEmptyResult(requirement);
    }

    // 2. 计算每个供应商的匹配得分
    const matchResults = qualifiedSuppliers.map(supplier =>
      this.calculateMatchScore(requirement, supplier)
    );

    // 3. 排序并分组结?    const sortedResults = matchResults.sort(
      (a, b) => b.matchScore - a.matchScore
    );
    const topMatches = sortedResults.slice(0, topN);
    const alternativeOptions = includeAlternatives
      ? sortedResults.slice(topN, topN + 3)
      : [];

    // 4. 生成市场洞察
    const marketInsights = this.generateMarketInsights(
      qualifiedSuppliers,
      requirement
    );

    // 5. 制定谈判策略
    const negotiationStrategy = this.generateNegotiationStrategy(
      topMatches,
      requirement
    );

    return {
      topMatches,
      alternativeOptions,
      marketInsights,
      negotiationStrategy,
    };
  }

  /**
   * 预筛选符合条件的供应?   */
  private preScreenSuppliers(
    requirement: MatchingRequirement,
    suppliers: SupplierProfile[]
  ): SupplierProfile[] {
    return suppliers.filter(supplier => {
      // 产品类别匹配
      const categoryMatch = supplier.capabilities.productCategories.some(
        cat =>
          requirement.productSpecs.category
            .toLowerCase()
            .includes(cat.toLowerCase()) ||
          cat
            .toLowerCase()
            .includes(requirement.productSpecs.category.toLowerCase())
      );

      if (!categoryMatch) return false;

      // 技术要求匹?      const techMatch = requirement.productSpecs.technicalRequirements.every(
        req =>
          supplier.capabilities.technicalExpertise.some(exp =>
            exp.toLowerCase().includes(req.toLowerCase())
          )
      );

      if (!techMatch) return false;

      // 数量能力匹配
      const capacityMatch =
        supplier.availability.maxCapacity >= requirement.productSpecs.quantity;

      if (!capacityMatch) return false;

      // 交付地点匹配
      const locationMatch = supplier.delivery.deliveryLocations.some(loc =>
        loc
          .toLowerCase()
          .includes(
            requirement.businessConditions.deliveryLocation.toLowerCase()
          )
      );

      return locationMatch;
    });
  }

  /**
   * 计算供应商匹配得?   */
  private calculateMatchScore(
    requirement: MatchingRequirement,
    supplier: SupplierProfile
  ): MatchResult {
    // 1. 产品匹配?    const productMatch = this.calculateProductMatch(requirement, supplier);

    // 2. 价格适配?    const priceFit = this.calculatePriceFit(requirement, supplier);

    // 3. 交付可行?    const deliveryFeasibility = this.calculateDeliveryFeasibility(
      requirement,
      supplier
    );

    // 4. 风险可接受度
    const riskAcceptability = this.calculateRiskAcceptability(
      requirement,
      supplier
    );

    // 5. 综合兼容?    const overallCompatibility = this.calculateOverallCompatibility(
      requirement,
      supplier
    );

    // 6. 加权计算最终匹配得?    const matchScore =
      productMatch * this.MATCH_WEIGHTS.productCompatibility +
      priceFit * this.MATCH_WEIGHTS.priceAlignment +
      deliveryFeasibility * this.MATCH_WEIGHTS.deliveryFeasibility +
      riskAcceptability * this.MATCH_WEIGHTS.riskAcceptability +
      overallCompatibility * this.MATCH_WEIGHTS.serviceQuality;

    // 7. 生成匹配建议
    const recommendations = this.generateMatchRecommendations(
      requirement,
      supplier,
      {
        productMatch,
        priceFit,
        deliveryFeasibility,
        riskAcceptability,
        overallCompatibility,
      }
    );

    // 8. 确定置信?    const confidenceLevel = this.determineConfidenceLevel(matchScore);

    return {
      supplierId: supplier.supplierId,
      supplierName: supplier.companyName,
      matchScore: parseFloat(matchScore.toFixed(2)),
      compatibilityDetails: {
        productMatch: parseFloat(productMatch.toFixed(2)),
        priceFit: parseFloat(priceFit.toFixed(2)),
        deliveryFeasibility: parseFloat(deliveryFeasibility.toFixed(2)),
        riskAcceptability: parseFloat(riskAcceptability.toFixed(2)),
        overallCompatibility: parseFloat(overallCompatibility.toFixed(2)),
      },
      recommendations,
      confidenceLevel,
    };
  }

  /**
   * 计算产品匹配?   */
  private calculateProductMatch(
    requirement: MatchingRequirement,
    supplier: SupplierProfile
  ): number {
    let score = 80; // 基础?
    // 质量标准匹配
    const qualityMatch =
      requirement.productSpecs.qualityStandards.filter(std =>
        supplier.capabilities.qualityCertifications.some(cert =>
          cert.toLowerCase().includes(std.toLowerCase())
        )
      ).length / requirement.productSpecs.qualityStandards.length;

    score += qualityMatch * 20;

    return Math.min(100, score);
  }

  /**
   * 计算价格适配?   */
  private calculatePriceFit(
    requirement: MatchingRequirement,
    supplier: SupplierProfile
  ): number {
    const [minBudget, maxBudget] = requirement.businessConditions.budgetRange;
    const supplierPrice = supplier.pricing.basePrice;

    // 考虑批量折扣
    const discountFactor = supplier.pricing.bulkDiscount || 0;
    const effectivePrice = supplierPrice * (1 - discountFactor);

    if (effectivePrice <= maxBudget && effectivePrice >= minBudget) {
      // 在预算范围内，根据接近程度打?      const budgetRange = maxBudget - minBudget;
      const position = (effectivePrice - minBudget) / budgetRange;
      return 90 - Math.abs(position - 0.5) * 40; // 最佳位置在中间
    } else if (effectivePrice < minBudget) {
      // 低于最低预算，可能质量不符
      return 60;
    } else {
      // 超出预算，根据超出程度扣?      const excessRatio = (effectivePrice - maxBudget) / maxBudget;
      return Math.max(20, 80 - excessRatio * 100);
    }
  }

  /**
   * 计算交付可行?   */
  private calculateDeliveryFeasibility(
    requirement: MatchingRequirement,
    supplier: SupplierProfile
  ): number {
    // 时间可行?    const timeFeasibility =
      supplier.delivery.leadTime <= requirement.productSpecs.deliveryTimeline
        ? 100
        : Math.max(
            20,
            100 -
              (supplier.delivery.leadTime -
                requirement.productSpecs.deliveryTimeline) *
                5
          );

    // 产能可用?    const utilizationScore =
      100 - supplier.availability.currentCapacityUtilization;

    return timeFeasibility * 0.7 + utilizationScore * 0.3;
  }

  /**
   * 计算风险可接受度
   */
  private calculateRiskAcceptability(
    requirement: MatchingRequirement,
    supplier: SupplierProfile
  ): number {
    const toleranceFactor =
      this.RISK_TOLERANCE_FACTORS[requirement.riskTolerance];

    // 将风险得分转换为可接受度（风险越低，可接受度越高?    const riskAcceptability = 100 - supplier.riskProfile.overallRisk;

    return Math.min(100, riskAcceptability * toleranceFactor);
  }

  /**
   * 计算综合兼容?   */
  private calculateOverallCompatibility(
    requirement: MatchingRequirement,
    supplier: SupplierProfile
  ): number {
    // 基于优先级权重计算加权得?    const weightedScore =
      supplier.scores.quality * requirement.priorities.quality +
      supplier.scores.priceCompetitiveness * requirement.priorities.price +
      supplier.scores.deliveryReliability * requirement.priorities.delivery +
      supplier.scores.serviceLevel * requirement.priorities.service +
      supplier.scores.innovationIndex * requirement.priorities.innovation;

    // 归一化到0-100范围
    const maxPossibleScore =
      100 * requirement.priorities.quality +
      100 * requirement.priorities.price +
      100 * requirement.priorities.delivery +
      100 * requirement.priorities.service +
      100 * requirement.priorities.innovation;

    return maxPossibleScore > 0 ? (weightedScore / maxPossibleScore) * 100 : 50;
  }

  /**
   * 生成匹配建议
   */
  private generateMatchRecommendations(
    requirement: MatchingRequirement,
    supplier: SupplierProfile,
    compatibility: MatchResult['compatibilityDetails']
  ): string[] {
    const recommendations: string[] = [];

    if (compatibility.productMatch < 80) {
      recommendations.push('建议进一步确认技术规格和质量要求的匹配度');
    }

    if (compatibility.priceFit < 70) {
      recommendations.push('建议协商价格或考虑批量采购以获得更好折?);
    }

    if (compatibility.deliveryFeasibility < 80) {
      recommendations.push('建议确认交付时间和物流安?);
    }

    if (compatibility.riskAcceptability < 70) {
      recommendations.push('建议评估风险缓解措施或寻找备选供应商');
    }

    return recommendations;
  }

  /**
   * 确定匹配置信?   */
  private determineConfidenceLevel(
    matchScore: number
  ): MatchResult['confidenceLevel'] {
    if (matchScore >= 85) return 'high';
    if (matchScore >= 70) return 'medium';
    return 'low';
  }

  /**
   * 生成空结?   */
  private generateEmptyResult(
    requirement: MatchingRequirement
  ): SmartMatchingOutput {
    return {
      topMatches: [],
      alternativeOptions: [],
      marketInsights: {
        averageMarketPrice: 0,
        priceRange: [0, 0],
        competitiveLandscape: '暂无符合条件的供应商',
      },
      negotiationStrategy: {
        suggestedApproach: '扩大搜索范围或调整需求条?,
        keyLeverages: [],
        potentialRisks: ['供应商资源不?],
      },
    };
  }

  /**
   * 生成市场洞察
   */
  private generateMarketInsights(
    suppliers: SupplierProfile[],
    requirement: MatchingRequirement
  ) {
    const prices = suppliers.map(s => s.pricing.basePrice);
    const averagePrice =
      prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const priceRange: [number, number] = [
      Math.min(...prices),
      Math.max(...prices),
    ];

    const competitiveDescription =
      suppliers.length < 3
        ? '市场竞争较少'
        : suppliers.length < 6
          ? '市场竞争适中'
          : '市场竞争激?;

    return {
      averageMarketPrice: parseFloat(averagePrice.toFixed(2)),
      priceRange,
      competitiveLandscape: competitiveDescription,
    };
  }

  /**
   * 生成谈判策略
   */
  private generateNegotiationStrategy(
    topMatches: MatchResult[],
    requirement: MatchingRequirement
  ) {
    if (topMatches.length === 0) {
      return {
        suggestedApproach: '暂无合适的谈判对象',
        keyLeverages: [],
        potentialRisks: ['缺乏竞争压力'],
      };
    }

    const bestMatch = topMatches[0];
    const approach =
      bestMatch.matchScore > 90
        ? '积极谈判'
        : bestMatch.matchScore > 75
          ? '平衡谈判'
          : '谨慎谈判';

    const leverages = [
      '明确的质量和技术要求作为谈判筹?,
      '批量采购的数量优?,
      '多家供应商的竞争态势',
    ];

    const risks = ['过度压价可能影响质量', '交期紧张可能导致履约风险'];

    return {
      suggestedApproach: approach,
      keyLeverages: leverages,
      potentialRisks: risks,
    };
  }

  /**
   * 批量匹配处理
   */
  batchMatch(
    requirements: MatchingRequirement[],
    suppliers: SupplierProfile[]
  ): SmartMatchingOutput[] {
    return requirements.map(req => this.matchSuppliers(req, suppliers));
  }
}

// 导出默认实例
export const smartSupplierMatcher = new SmartSupplierMatcher();

// 使用示例
/*
const requirement: MatchingRequirement = {
  productSpecs: {
    category: '电子元件',
    technicalRequirements: ['RoHS认证', '高温工作'],
    qualityStandards: ['ISO9001', 'CE'],
    quantity: 10000,
    deliveryTimeline: 30
  },
  businessConditions: {
    budgetRange: [50000, 80000],
    paymentTerms: '30天账?,
    deliveryLocation: '上海',
    currency: 'USD'
  },
  riskTolerance: 'moderate',
  priorities: {
    quality: 0.4,
    price: 0.3,
    delivery: 0.2,
    service: 0.05,
    innovation: 0.05
  }
}

const suppliers: SupplierProfile[] = [
  {
    supplierId: 'SUP001',
    companyName: 'ABC电子有限公司',
    capabilities: {
      productCategories: ['电子元件', '半导?],
      technicalExpertise: ['RoHS认证', '高温工作', '表面贴装'],
      qualityCertifications: ['ISO9001', 'CE', 'RoHS'],
      productionCapacity: 50000
    },
    pricing: {
      basePrice: 65000,
      bulkDiscount: 0.05,
      currency: 'USD'
    },
    delivery: {
      leadTime: 25,
      deliveryLocations: ['上海', '深圳', '北京'],
      logisticsCapabilities: ['海运', '空运']
    },
    scores: {
      quality: 92,
      priceCompetitiveness: 78,
      deliveryReliability: 88,
      serviceLevel: 85,
      innovationIndex: 75
    },
    riskProfile: {
      overallRisk: 25,
      riskLevel: 'low'
    },
    availability: {
      currentCapacityUtilization: 65,
      maxCapacity: 100000
    }
  }
  // ... 更多供应?]

const result = smartSupplierMatcher.matchSuppliers(requirement, suppliers)
// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(result)*/
