/**
 * 供应商风险评估模? * 综合评估供应商的各类风险因素
 */

export interface RiskFactor {
  factorName: string;
  weight: number; // 权重 (0-1)
  score: number; // 风险得分 (0-100，分数越高风险越?
  description: string;
}

export interface RiskAssessmentInput {
  supplierId: string;
  basicInfo: {
    companyAge: number; // 公司成立年限
    employeeCount: number;
    annualRevenue: number;
    creditRating: string; // 信用评级
    legalStatus: string; // 法律状?  };
  financialMetrics: {
    debtRatio: number; // 负债比?    cashFlow: number; // 现金流状?    profitability: number; // 盈利能力
    liquidity: number; // 流动?  };
  operationalMetrics: {
    deliveryPerformance: number; // 交付表现
    qualityIssues: number; // 质量问题次数
    complianceViolations: number; // 合规违规次数
    supplierConcentration: number; // 供应商集中度
  };
  externalFactors: {
    industryRisk: number; // 行业风险
    geographicRisk: number; // 地理风险
    politicalRisk: number; // 政治风险
    economicRisk: number; // 经济风险
  };
  historicalData: {
    pastIncidents: number; // 历史事故次数
    disputeRecords: number; // 争议记录
    contractTerminations: number; // 合同终止次数
  };
}

export interface RiskAssessmentOutput {
  overallRiskScore: number; // 综合风险得分 (0-100)
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskCategories: {
    financial: number; // 财务风险
    operational: number; // 运营风险
    compliance: number; // 合规风险
    geopolitical: number; // 地缘政治风险
    supplyChain: number; // 供应链风?  };
  detailedFactors: RiskFactor[];
  riskMitigation: string[]; // 风险缓解建议
  monitoringFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
}

export class SupplierRiskAssessmentModel {
  // 风险类别权重配置
  private readonly CATEGORY_WEIGHTS = {
    financial: 0.3,
    operational: 0.25,
    compliance: 0.2,
    geopolitical: 0.15,
    supplyChain: 0.1,
  };

  // 风险阈值配?  private readonly RISK_THRESHOLDS = {
    low: 30,
    medium: 60,
    high: 80,
  };

  /**
   * 评估供应商综合风?   */
  assessRisk(input: RiskAssessmentInput): RiskAssessmentOutput {
    // 1. 计算各风险类别得?    const riskCategories = this.calculateCategoryRisks(input);

    // 2. 计算综合风险得分
    const overallRiskScore = this.calculateOverallRisk(riskCategories);

    // 3. 确定风险等级
    const riskLevel = this.determineRiskLevel(overallRiskScore);

    // 4. 识别关键风险因素
    const detailedFactors = this.identifyRiskFactors(input);

    // 5. 生成风险缓解建议
    const riskMitigation = this.generateRiskMitigationStrategies(
      input,
      riskCategories
    );

    // 6. 确定监控频率
    const monitoringFrequency = this.determineMonitoringFrequency(
      riskLevel,
      overallRiskScore
    );

    return {
      overallRiskScore: parseFloat(overallRiskScore.toFixed(2)),
      riskLevel,
      riskCategories,
      detailedFactors,
      riskMitigation,
      monitoringFrequency,
    };
  }

  /**
   * 计算各风险类别得?   */
  private calculateCategoryRisks(
    input: RiskAssessmentInput
  ): RiskAssessmentOutput['riskCategories'] {
    return {
      financial: this.calculateFinancialRisk(input),
      operational: this.calculateOperationalRisk(input),
      compliance: this.calculateComplianceRisk(input),
      geopolitical: this.calculateGeopoliticalRisk(input),
      supplyChain: this.calculateSupplyChainRisk(input),
    };
  }

  /**
   * 计算财务风险
   */
  private calculateFinancialRisk(input: RiskAssessmentInput): number {
    const { financialMetrics, basicInfo } = input;

    // 负债比率风?(权重40%)
    let debtRisk = 0;
    if (financialMetrics.debtRatio > 0.7) {
      debtRisk = 90;
    } else if (financialMetrics.debtRatio > 0.5) {
      debtRisk = 60;
    } else if (financialMetrics.debtRatio > 0.3) {
      debtRisk = 30;
    } else {
      debtRisk = 10;
    }

    // 现金流风?(权重30%)
    let cashFlowRisk = 0;
    if (financialMetrics.cashFlow < 0) {
      cashFlowRisk = 80;
    } else if (financialMetrics.cashFlow < basicInfo.annualRevenue * 0.05) {
      cashFlowRisk = 50;
    } else {
      cashFlowRisk = 20;
    }

    // 盈利能力风险 (权重20%)
    let profitRisk =
      financialMetrics.profitability < 0
        ? 70
        : financialMetrics.profitability < 0.05
          ? 40
          : 15;

    // 流动性风?(权重10%)
    let liquidityRisk =
      financialMetrics.liquidity < 1
        ? 60
        : financialMetrics.liquidity < 2
          ? 30
          : 10;

    return (
      debtRisk * 0.4 +
      cashFlowRisk * 0.3 +
      profitRisk * 0.2 +
      liquidityRisk * 0.1
    );
  }

  /**
   * 计算运营风险
   */
  private calculateOperationalRisk(input: RiskAssessmentInput): number {
    const { operationalMetrics, basicInfo } = input;

    // 交付表现风险
    let deliveryRisk = 100 - operationalMetrics.deliveryPerformance;

    // 质量问题风险
    let qualityRisk = Math.min(100, operationalMetrics.qualityIssues * 15);

    // 合规违规风险
    let complianceRisk = Math.min(
      100,
      operationalMetrics.complianceViolations * 25
    );

    // 供应商集中度风险
    let concentrationRisk =
      operationalMetrics.supplierConcentration > 0.8
        ? 70
        : operationalMetrics.supplierConcentration > 0.6
          ? 40
          : 20;

    // 公司规模调整因子
    const sizeAdjustment =
      basicInfo.employeeCount > 1000
        ? 0.8
        : basicInfo.employeeCount > 500
          ? 0.9
          : 1.0;

    return (
      (deliveryRisk * 0.4 +
        qualityRisk * 0.3 +
        complianceRisk * 0.2 +
        concentrationRisk * 0.1) *
      sizeAdjustment
    );
  }

  /**
   * 计算合规风险
   */
  private calculateComplianceRisk(input: RiskAssessmentInput): number {
    const { basicInfo, historicalData } = input;

    // 信用评级风险
    let creditRisk = 0;
    switch (basicInfo.creditRating.toUpperCase()) {
      case 'AAA':
        creditRisk = 5;
        break;
      case 'AA':
        creditRisk = 15;
        break;
      case 'A':
        creditRisk = 30;
        break;
      case 'BBB':
        creditRisk = 50;
        break;
      case 'BB':
        creditRisk = 70;
        break;
      case 'B':
        creditRisk = 85;
        break;
      default:
        creditRisk = 95;
        break;
    }

    // 法律状态风?    let legalRisk = basicInfo.legalStatus === 'normal' ? 10 : 60;

    // 历史争议风险
    let disputeRisk = Math.min(100, historicalData.disputeRecords * 20);

    // 合同终止风险
    let terminationRisk = Math.min(
      100,
      historicalData.contractTerminations * 30
    );

    return (
      creditRisk * 0.4 +
      legalRisk * 0.3 +
      disputeRisk * 0.2 +
      terminationRisk * 0.1
    );
  }

  /**
   * 计算地缘政治风险
   */
  private calculateGeopoliticalRisk(input: RiskAssessmentInput): number {
    const { externalFactors, basicInfo } = input;

    // 地理风险
    let geographicRisk = externalFactors.geographicRisk;

    // 政治风险
    let politicalRisk = externalFactors.politicalRisk;

    // 经济风险
    let economicRisk = externalFactors.economicRisk;

    // 行业风险调整
    let industryAdjustment = 1.0;
    if (externalFactors.industryRisk > 70) {
      industryAdjustment = 1.3;
    } else if (externalFactors.industryRisk > 50) {
      industryAdjustment = 1.1;
    }

    // 公司年龄调整因子（老公司风险相对较低）
    const ageAdjustment = Math.max(0.7, 1 - basicInfo.companyAge / 50);

    const baseRisk =
      geographicRisk * 0.4 + politicalRisk * 0.3 + economicRisk * 0.3;
    return Math.min(100, baseRisk * industryAdjustment * ageAdjustment);
  }

  /**
   * 计算供应链风?   */
  private calculateSupplyChainRisk(input: RiskAssessmentInput): number {
    const { operationalMetrics, historicalData, externalFactors } = input;

    // 供应商集中度风险
    let concentrationRisk =
      operationalMetrics.supplierConcentration > 0.8
        ? 80
        : operationalMetrics.supplierConcentration > 0.6
          ? 50
          : operationalMetrics.supplierConcentration > 0.4
            ? 30
            : 15;

    // 历史事故风险
    let incidentRisk = Math.min(100, historicalData.pastIncidents * 15);

    // 行业风险传导
    let industryRiskImpact = externalFactors.industryRisk * 0.3;

    // 地理分布风险
    let geographicRisk = externalFactors.geographicRisk * 0.2;

    return (
      concentrationRisk * 0.4 +
      incidentRisk * 0.3 +
      industryRiskImpact * 0.2 +
      geographicRisk * 0.1
    );
  }

  /**
   * 计算综合风险得分
   */
  private calculateOverallRisk(
    riskCategories: RiskAssessmentOutput['riskCategories']
  ): number {
    return (
      riskCategories.financial * this.CATEGORY_WEIGHTS.financial +
      riskCategories.operational * this.CATEGORY_WEIGHTS.operational +
      riskCategories.compliance * this.CATEGORY_WEIGHTS.compliance +
      riskCategories.geopolitical * this.CATEGORY_WEIGHTS.geopolitical +
      riskCategories.supplyChain * this.CATEGORY_WEIGHTS.supplyChain
    );
  }

  /**
   * 确定风险等级
   */
  private determineRiskLevel(
    overallScore: number
  ): RiskAssessmentOutput['riskLevel'] {
    if (overallScore >= this.RISK_THRESHOLDS.high) return 'critical';
    if (overallScore >= this.RISK_THRESHOLDS.medium) return 'high';
    if (overallScore >= this.RISK_THRESHOLDS.low) return 'medium';
    return 'low';
  }

  /**
   * 识别关键风险因素
   */
  private identifyRiskFactors(input: RiskAssessmentInput): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // 财务风险因素
    factors.push({
      factorName: '负债比率过?,
      weight: 0.4,
      score: input.financialMetrics.debtRatio > 0.5 ? 80 : 30,
      description: `当前负债比率为${(input.financialMetrics.debtRatio * 100).toFixed(1)}%`,
    });

    // 运营风险因素
    factors.push({
      factorName: '质量问题频发',
      weight: 0.3,
      score: Math.min(100, input.operationalMetrics.qualityIssues * 20),
      description: `历史质量问题${input.operationalMetrics.qualityIssues}次`,
    });

    // 合规风险因素
    factors.push({
      factorName: '信用评级偏低',
      weight: 0.4,
      score:
        input.basicInfo.creditRating === 'BB' ||
        input.basicInfo.creditRating === 'B'
          ? 80
          : 30,
      description: `当前信用评级?{input.basicInfo.creditRating}`,
    });

    // 地缘政治风险因素
    factors.push({
      factorName: '地缘政治不稳?,
      weight: 0.3,
      score: input.externalFactors.politicalRisk,
      description: '所在地区政治环境不稳定',
    });

    return factors.sort((a, b) => b.score * b.weight - a.score * a.weight);
  }

  /**
   * 生成风险缓解策略
   */
  private generateRiskMitigationStrategies(
    input: RiskAssessmentInput,
    riskCategories: RiskAssessmentOutput['riskCategories']
  ): string[] {
    const strategies: string[] = [];

    // 财务风险缓解
    if (riskCategories.financial > 60) {
      strategies.push('建议要求供应商提供财务担保或银行保函');
      strategies.push('考虑缩短付款周期以降低财务风?);
    }

    // 运营风险缓解
    if (riskCategories.operational > 60) {
      strategies.push('建议增加质量检验频次和严格?);
      strategies.push('要求供应商提供备用产能保?);
    }

    // 合规风险缓解
    if (riskCategories.compliance > 60) {
      strategies.push('加强合同条款中的违约责任约定');
      strategies.push('定期进行合规审计');
    }

    // 地缘政治风险缓解
    if (riskCategories.geopolitical > 60) {
      strategies.push('考虑寻找替代供应商以分散地理风险');
      strategies.push('购买政治风险保险');
    }

    // 供应链风险缓?    if (riskCategories.supplyChain > 60) {
      strategies.push('要求供应商提供多元化供应方案');
      strategies.push('建立应急库存机?);
    }

    return strategies;
  }

  /**
   * 确定监控频率
   */
  private determineMonitoringFrequency(
    riskLevel: RiskAssessmentOutput['riskLevel'],
    overallScore: number
  ): RiskAssessmentOutput['monitoringFrequency'] {
    switch (riskLevel) {
      case 'critical':
        return 'daily';
      case 'high':
        return overallScore > 85 ? 'daily' : 'weekly';
      case 'medium':
        return 'monthly';
      case 'low':
        return 'quarterly';
    }
  }

  /**
   * 批量风险评估
   */
  batchAssess(inputs: RiskAssessmentInput[]): RiskAssessmentOutput[] {
    return inputs.map(input => this.assessRisk(input));
  }

  /**
   * 获取模型配置
   */
  getConfig() {
    return {
      categoryWeights: { ...this.CATEGORY_WEIGHTS },
      riskThresholds: { ...this.RISK_THRESHOLDS },
      version: '1.0.0',
    };
  }
}

// 导出默认实例
export const supplierRiskAssessment = new SupplierRiskAssessmentModel();

// 使用示例
/*
const input: RiskAssessmentInput = {
  supplierId: 'SUP001',
  basicInfo: {
    companyAge: 15,
    employeeCount: 500,
    annualRevenue: 50000000,
    creditRating: 'A',
    legalStatus: 'normal'
  },
  financialMetrics: {
    debtRatio: 0.4,
    cashFlow: 5000000,
    profitability: 0.12,
    liquidity: 1.8
  },
  operationalMetrics: {
    deliveryPerformance: 92,
    qualityIssues: 2,
    complianceViolations: 0,
    supplierConcentration: 0.6
  },
  externalFactors: {
    industryRisk: 45,
    geographicRisk: 30,
    politicalRisk: 25,
    economicRisk: 35
  },
  historicalData: {
    pastIncidents: 1,
    disputeRecords: 0,
    contractTerminations: 0
  }
}

const result = supplierRiskAssessment.assessRisk(input)
// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(result)*/
