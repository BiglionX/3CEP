/**
 * 多因子评分算法服务
 * 实现品类匹配度、价格竞争力、可靠性等多维度评分
 */

import { Supplier } from "../../supply-chain/models/supplier.model";
import {
  ParsedProcurementRequest,
  ProcurementItem,
} from "../models/procurement.model";
import {
  DEFAULT_SCORING_WEIGHTS,
  ProcurementRequestVector,
  ScoringWeights,
  SupplierMatchResult,
  SupplierVector,
} from "../models/supplier-vector.model";

export class MultiFactorScoringService {
  /**
   * 计算供应商匹配结果的综合评分
   */
  calculateMatchScores(
    request: ParsedProcurementRequest,
    suppliers: Supplier[],
    supplierVectors: Map<string, SupplierVector>,
    requestVector: ProcurementRequestVector,
    vectorMatches: Array<{ supplierId: string; similarity: number }>,
    weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
  ): SupplierMatchResult[] {
    const results: SupplierMatchResult[] = [];

    for (const vectorMatch of vectorMatches) {
      const supplier = suppliers.find((s) => s.id === vectorMatch.supplierId);
      const supplierVector = supplierVectors.get(vectorMatch.supplierId);

      if (!supplier || !supplierVector) continue;

      const matchResult = this.calculateSingleMatchScore(
        request,
        supplier,
        supplierVector,
        requestVector,
        vectorMatch.similarity,
        weights
      );

      results.push(matchResult);
    }

    // 按匹配分数降序排列
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * 计算单个供应商的匹配分数
   */
  private calculateSingleMatchScore(
    request: ParsedProcurementRequest,
    supplier: Supplier,
    supplierVector: SupplierVector,
    requestVector: ProcurementRequestVector,
    vectorSimilarity: number,
    weights: ScoringWeights
  ): SupplierMatchResult {
    // 1. 品类匹配度评分 (0-100)
    const categoryMatchScore = this.calculateCategoryMatchScore(
      request,
      supplier
    );

    // 2. 价格竞争力评分 (0-100)
    const priceCompetitiveness = this.calculatePriceCompetitiveness(
      request,
      supplier
    );

    // 3. 可靠性评分 (0-100)
    const reliabilityScore = this.calculateReliabilityScore(supplier);

    // 4. 质量评分 (0-100)
    const qualityScore = this.calculateQualityScore(supplier);

    // 5. 服务评分 (0-100)
    const serviceScore = this.calculateServiceScore(supplier);

    // 6. 综合匹配度计算
    const matchScore = this.calculateWeightedScore(
      {
        vectorSimilarity,
        categoryMatch: categoryMatchScore / 100,
        priceCompetitiveness: priceCompetitiveness / 100,
        reliability: reliabilityScore / 100,
        quality: qualityScore / 100,
        service: serviceScore / 100,
      },
      weights
    );

    // 7. 置信度计算
    const confidence = this.calculateConfidence(
      vectorSimilarity,
      categoryMatchScore,
      priceCompetitiveness,
      reliabilityScore
    );

    // 8. 匹配条件分析
    const { matchingCriteria, mismatchedCriteria } =
      this.analyzeMatchingCriteria(
        request,
        supplier,
        categoryMatchScore,
        priceCompetitiveness
      );

    // 9. 预估信息
    const estimatedInfo = this.estimateSupplierInfo(request, supplier);

    return {
      requestId: request.id,
      supplierId: supplier.id,
      supplierName: supplier.name,
      vectorSimilarity,
      categoryMatchScore,
      priceCompetitiveness,
      reliabilityScore,
      qualityScore,
      serviceScore,
      matchScore,
      confidence,
      riskLevel: (supplier.riskAssessment?.overallRisk as any) || "low",
      matchingCriteria,
      mismatchedCriteria,
      estimatedPrice: estimatedInfo.estimatedPrice,
      estimatedDeliveryTime: estimatedInfo.estimatedDeliveryTime,
      priceDeviation: estimatedInfo.priceDeviation,
      matchedAt: new Date(),
    };
  }

  /**
   * 计算品类匹配度评分
   */
  private calculateCategoryMatchScore(
    request: ParsedProcurementRequest,
    supplier: Supplier
  ): number {
    const requestCategories = new Set(
      request.items.map((item) => item.category.toLowerCase())
    );
    const supplierCategories = new Set(
      supplier.products?.map((p) => p.productCategory.toLowerCase()) || []
    );

    if (supplierCategories.size === 0) {
      return 30; // 没有明确产品分类，给基础分
    }

    let matchCount = 0;
    let totalCount = requestCategories.size;

    requestCategories.forEach((category) => {
      if (supplierCategories.has(category)) {
        matchCount++;
      }
    });

    // 计算匹配度 (考虑部分匹配和完全匹配)
    const baseScore = (matchCount / totalCount) * 100;

    // 如果供应商经营范围也匹配，额外加分
    const businessScope = supplier.businessScope.toLowerCase();
    let bonus = 0;
    requestCategories.forEach((category) => {
      if (businessScope.includes(category)) {
        bonus += 5;
      }
    });

    return Math.min(baseScore + bonus, 100);
  }

  /**
   * 计算价格竞争力评分
   */
  private calculatePriceCompetitiveness(
    request: ParsedProcurementRequest,
    supplier: Supplier
  ): number {
    if (!supplier.products || supplier.products.length === 0) {
      return 50; // 缺少价格信息，给中等分数
    }

    let totalScore = 0;
    let itemCount = 0;

    for (const requestItem of request.items) {
      const matchingProducts = supplier.products.filter(
        (p) =>
          p.productCategory.toLowerCase() === requestItem.category.toLowerCase()
      );

      if (matchingProducts.length === 0) {
        // 没有匹配的产品，给予较低分数
        totalScore += 30;
        itemCount++;
        continue;
      }

      // 找到最接近的数量和规格的产品
      const bestMatch = this.findBestPriceMatch(requestItem, matchingProducts);

      if (bestMatch && requestItem.estimatedUnitPrice) {
        // 基于价格差异计算竞争力分数
        const priceDiffPercent = Math.abs(
          ((bestMatch.unitPrice - requestItem.estimatedUnitPrice) /
            requestItem.estimatedUnitPrice) *
            100
        );

        let priceScore: number;
        if (priceDiffPercent <= 10) {
          priceScore = 100; // 价格差异在10%以内，满分
        } else if (priceDiffPercent <= 20) {
          priceScore = 80; // 价格差异在20%以内
        } else if (priceDiffPercent <= 30) {
          priceScore = 60; // 价格差异在30%以内
        } else if (priceDiffPercent <= 50) {
          priceScore = 40; // 价格差异在50%以内
        } else {
          priceScore = 20; // 价格差异超过50%
        }

        // 如果供应商报价更低，额外加分
        if (bestMatch.unitPrice < requestItem.estimatedUnitPrice) {
          priceScore = Math.min(priceScore + 20, 100);
        }

        totalScore += priceScore;
      } else {
        // 没有价格参考，给中等分数
        totalScore += 50;
      }

      itemCount++;
    }

    return itemCount > 0 ? totalScore / itemCount : 50;
  }

  /**
   * 寻找最佳价格匹配的产品
   */
  private findBestPriceMatch(
    requestItem: ProcurementItem,
    supplierProducts: any[]
  ): any | null {
    // 简化版本：找到同一品类的第一个产品
    // 实际应用中可以考虑规格、数量等因素进行更精确匹配
    return supplierProducts.length > 0 ? supplierProducts[0] : null;
  }

  /**
   * 计算可靠性评分
   */
  private calculateReliabilityScore(supplier: Supplier): number {
    let score = 0;
    let factorCount = 0;

    // 1. 信用评分 (权重: 30%)
    if (supplier.creditScore !== undefined) {
      score += supplier.creditScore * 0.3;
      factorCount += 0.3;
    }

    // 2. 准时交货率 (权重: 25%)
    if (supplier.performanceMetrics?.deliveryRate !== undefined) {
      score += supplier.performanceMetrics.deliveryRate * 0.25;
      factorCount += 0.25;
    }

    // 3. 合作年限 (权重: 15%)
    if (supplier.cooperationYears !== undefined) {
      // 合作年限越长，可靠性越高，最多加15分
      const yearsScore = Math.min(supplier.cooperationYears * 3, 15);
      score += yearsScore * 0.15;
      factorCount += 0.15;
    }

    // 4. 供应商状态 (权重: 15%)
    const statusScore = this.getStatusScore(supplier.status);
    score += statusScore * 0.15;
    factorCount += 0.15;

    // 5. 资质认证 (权重: 15%)
    if (supplier.certifications) {
      const certScore = Math.min(supplier.certifications.length * 5, 15);
      score += certScore * 0.15;
      factorCount += 0.15;
    }

    return factorCount > 0 ? score / factorCount : 50;
  }

  /**
   * 根据供应商状态给出分数
   */
  private getStatusScore(status: string): number {
    switch (status) {
      case "approved":
        return 100;
      case "pending_review":
        return 60;
      case "suspended":
        return 30;
      case "blacklisted":
        return 0;
      default:
        return 50;
    }
  }

  /**
   * 计算质量评分
   */
  private calculateQualityScore(supplier: Supplier): number {
    let score = 0;
    let factorCount = 0;

    // 1. 产品质量合格率 (权重: 40%)
    if (supplier.performanceMetrics?.qualityRate !== undefined) {
      score += supplier.performanceMetrics.qualityRate * 0.4;
      factorCount += 0.4;
    }

    // 2. 综合评分 (权重: 30%)
    if (supplier.rating !== undefined) {
      score += (supplier.rating / 5) * 100 * 0.3;
      factorCount += 0.3;
    }

    // 3. 投诉次数 (权重: 20%)
    if (supplier.performanceMetrics?.complaintCount !== undefined) {
      // 投诉越少，质量分数越高
      const complaintPenalty = Math.min(
        supplier.performanceMetrics.complaintCount * 5,
        20
      );
      const complaintScore = Math.max(100 - complaintPenalty, 0);
      score += complaintScore * 0.2;
      factorCount += 0.2;
    }

    // 4. 资质认证质量 (权重: 10%)
    if (supplier.certifications) {
      const qualityCerts = supplier.certifications.filter(
        (cert) => cert.type.includes("quality") || cert.type.includes("iso")
      ).length;
      const certScore = Math.min(qualityCerts * 10, 10);
      score += certScore * 0.1;
      factorCount += 0.1;
    }

    return factorCount > 0 ? score / factorCount : 70;
  }

  /**
   * 计算服务评分
   */
  private calculateServiceScore(supplier: Supplier): number {
    let score = 0;
    let factorCount = 0;

    // 1. 服务评分 (权重: 50%)
    if (supplier.performanceMetrics?.serviceScore !== undefined) {
      score += (supplier.performanceMetrics.serviceScore / 5) * 100 * 0.5;
      factorCount += 0.5;
    }

    // 2. 响应时间 (权重: 30%)
    if (supplier.performanceMetrics?.responseTime !== undefined) {
      // 响应时间越短，服务分数越高
      let responseScore: number;
      const responseHours = supplier.performanceMetrics.responseTime;
      if (responseHours <= 2) {
        responseScore = 100;
      } else if (responseHours <= 8) {
        responseScore = 80;
      } else if (responseHours <= 24) {
        responseScore = 60;
      } else if (responseHours <= 48) {
        responseScore = 40;
      } else {
        responseScore = 20;
      }
      score += responseScore * 0.3;
      factorCount += 0.3;
    }

    // 3. 退货率 (权重: 20%)
    if (supplier.performanceMetrics?.returnRate !== undefined) {
      // 退货率越低，服务分数越高
      const returnScore = Math.max(
        100 - supplier.performanceMetrics.returnRate * 2,
        0
      );
      score += returnScore * 0.2;
      factorCount += 0.2;
    }

    return factorCount > 0 ? score / factorCount : 60;
  }

  /**
   * 计算加权综合分数
   */
  private calculateWeightedScore(
    scores: {
      vectorSimilarity: number;
      categoryMatch: number;
      priceCompetitiveness: number;
      reliability: number;
      quality: number;
      service: number;
    },
    weights: ScoringWeights
  ): number {
    const weightedSum =
      scores.vectorSimilarity * weights.vectorSimilarity +
      scores.categoryMatch * weights.categoryMatch +
      scores.priceCompetitiveness * weights.priceCompetitiveness +
      scores.reliability * weights.reliability +
      scores.quality * weights.quality +
      scores.service * weights.service;

    // 权重总和用于归一化
    const weightSum =
      weights.vectorSimilarity +
      weights.categoryMatch +
      weights.priceCompetitiveness +
      weights.reliability +
      weights.quality +
      weights.service;

    return weightSum > 0 ? (weightedSum / weightSum) * 100 : 0;
  }

  /**
   * 计算推荐置信度
   */
  private calculateConfidence(
    vectorSimilarity: number,
    categoryMatch: number,
    priceCompetitiveness: number,
    reliability: number
  ): number {
    // 基于关键因子计算置信度
    const confidence =
      vectorSimilarity * 40 + // 向量相似度占40%
      (categoryMatch / 100) * 25 + // 品类匹配占25%
      (priceCompetitiveness / 100) * 20 + // 价格竞争力占20%
      (reliability / 100) * 15; // 可靠性占15%

    return Math.round(confidence);
  }

  /**
   * 分析匹配条件
   */
  private analyzeMatchingCriteria(
    request: ParsedProcurementRequest,
    supplier: Supplier,
    categoryMatch: number,
    priceCompetitiveness: number
  ): { matchingCriteria: string[]; mismatchedCriteria: string[] } {
    const matching: string[] = [];
    const mismatched: string[] = [];

    // 品类匹配分析
    if (categoryMatch >= 80) {
      matching.push("品类高度匹配");
    } else if (categoryMatch >= 50) {
      matching.push("品类基本匹配");
    } else {
      mismatched.push("品类匹配度较低");
    }

    // 价格竞争力分析
    if (priceCompetitiveness >= 80) {
      matching.push("价格具有竞争优势");
    } else if (priceCompetitiveness >= 60) {
      matching.push("价格合理");
    } else {
      mismatched.push("价格偏高");
    }

    // 供应商资质分析
    if (supplier.status === "approved") {
      matching.push("供应商资质良好");
    } else {
      mismatched.push("供应商资质待审核");
    }

    // 信用等级分析
    if (supplier.creditScore && supplier.creditScore >= 80) {
      matching.push("信用等级优秀");
    } else if (supplier.creditScore && supplier.creditScore >= 70) {
      matching.push("信用等级良好");
    } else if (supplier.creditScore) {
      mismatched.push("信用等级一般");
    }

    // 交货能力分析
    if (
      supplier.performanceMetrics?.deliveryRate &&
      supplier.performanceMetrics.deliveryRate >= 95
    ) {
      matching.push("交货准时率高");
    }

    return { matchingCriteria: matching, mismatchedCriteria: mismatched };
  }

  /**
   * 预估供应商信息
   */
  private estimateSupplierInfo(
    request: ParsedProcurementRequest,
    supplier: Supplier
  ): {
    estimatedPrice?: number;
    estimatedDeliveryTime?: number;
    priceDeviation?: number;
  } {
    let estimatedPrice: number | undefined;
    let estimatedDeliveryTime: number | undefined;
    let priceDeviation: number | undefined;

    if (supplier.products && supplier.products.length > 0) {
      // 简化的价格预估逻辑
      let totalEstimated = 0;
      let itemCount = 0;

      for (const item of request.items) {
        const matchingProduct = supplier.products.find(
          (p) => p.productCategory.toLowerCase() === item.category.toLowerCase()
        );

        if (matchingProduct) {
          totalEstimated += matchingProduct.unitPrice * item.quantity;
          itemCount += item.quantity;
        }
      }

      if (itemCount > 0 && request.items.length > 0) {
        estimatedPrice = totalEstimated;

        // 计算价格偏差
        const totalRequestValue = request.items.reduce(
          (sum, item) => sum + (item.estimatedUnitPrice || 0) * item.quantity,
          0
        );

        if (totalRequestValue > 0) {
          priceDeviation = Math.abs(
            ((estimatedPrice - totalRequestValue) / totalRequestValue) * 100
          );
        }
      }

      // 预估交货时间
      const avgLeadTime =
        supplier.products.reduce((sum, p) => sum + p.leadTime, 0) /
        supplier.products.length;

      estimatedDeliveryTime = Math.round(avgLeadTime);
    }

    return { estimatedPrice, estimatedDeliveryTime, priceDeviation };
  }

  /**
   * 根据紧急程度调整评分权重
   */
  adjustWeightsForUrgency(
    baseWeights: ScoringWeights,
    urgency: "low" | "medium" | "high" | "urgent"
  ): ScoringWeights {
    const adjustedWeights = { ...baseWeights };

    switch (urgency) {
      case "urgent":
        // 紧急情况下更重视可靠性和服务，降低价格权重
        adjustedWeights.reliability += 0.1;
        adjustedWeights.service += 0.05;
        adjustedWeights.priceCompetitiveness -= 0.15;
        break;
      case "high":
        // 高紧急程度适度调整
        adjustedWeights.reliability += 0.05;
        adjustedWeights.service += 0.03;
        adjustedWeights.priceCompetitiveness -= 0.08;
        break;
      case "low":
        // 低紧急程度可以更注重价格
        adjustedWeights.priceCompetitiveness += 0.05;
        adjustedWeights.reliability -= 0.02;
        break;
    }

    return this.normalizeWeights(adjustedWeights);
  }

  /**
   * 标准化权重，确保总和为1
   */
  private normalizeWeights(weights: ScoringWeights): ScoringWeights {
    const sum = Object.values(weights).reduce((acc, val) => acc + val, 0);
    if (sum === 0) return weights;

    return {
      vectorSimilarity: weights.vectorSimilarity / sum,
      categoryMatch: weights.categoryMatch / sum,
      priceCompetitiveness: weights.priceCompetitiveness / sum,
      reliability: weights.reliability / sum,
      quality: weights.quality / sum,
      service: weights.service / sum,
    };
  }
}
