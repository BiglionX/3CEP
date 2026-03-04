/**
 * 智能合同条款推荐算法
 * 基于采购场景和风险评估推荐最优合同条? */

export interface ContractContext {
  // 采购信息
  procurementType: 'goods' | 'services' | 'construction';
  contractValue: number;
  currency: string;
  duration: number; // 合同期限（月?
  // 供应商信?  supplierRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  supplierPerformanceHistory: {
    qualityScore: number; // 0-100
    deliveryScore: number; // 0-100
    serviceScore: number; // 0-100
  };

  // 采购方要?  qualityRequirements: string[];
  deliveryRequirements: string[];
  paymentPreferences: {
    paymentMethod: 'advance' | 'installment' | 'delivery' | 'credit';
    paymentTerm: number; // 天数
  };

  // 风险偏好
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';

  // 行业特?  industryType: string;
  regulatoryRequirements: string[];
}

export interface ContractClause {
  clauseType: string;
  clauseText: string;
  importance: 'critical' | 'important' | 'optional';
  riskMitigation: string;
  alternatives: string[];
}

export interface ClauseRecommendation {
  clause: ContractClause;
  recommendationScore: number; // 推荐得分 (0-100)
  applicability: number; // 适用性得?(0-100)
  modificationSuggestions: string[];
}

export interface ContractRecommendationOutput {
  recommendedClauses: ClauseRecommendation[];
  contractStructure: {
    essentialClauses: ContractClause[];
    conditionalClauses: ContractClause[];
    optionalClauses: ContractClause[];
  };
  riskAssessment: {
    identifiedRisks: string[];
    mitigationMeasures: string[];
    overallRiskLevel: 'low' | 'medium' | 'high';
  };
  negotiationGuidance: {
    keyPoints: string[];
    leverageAreas: string[];
    redLines: string[];
  };
}

export class IntelligentContractAdvisor {
  // 条款?  private readonly CLAUSE_LIBRARY: Record<string, ContractClause[]> = {
    quality: [
      {
        clauseType: '质量标准',
        clauseText:
          '供应商应确保所提供产品/服务符合[具体标准]要求，并提供相应的质量证明文件?,
        importance: 'critical',
        riskMitigation: '明确质量标准，降低质量风?,
        alternatives: ['采用行业标准', '双方协商确定', '参考样品标?],
      },
      {
        clauseType: '质量检?,
        clauseText:
          '买方有权在交付前后对产品/服务进行质量检验，检验费用由[责任方]承担?,
        importance: 'important',
        riskMitigation: '建立检验机制，确保质量符合要求',
        alternatives: ['第三方检?, '抽样检?, '全检'],
      },
    ],

    delivery: [
      {
        clauseType: '交付期限',
        clauseText:
          '供应商应在合同签订后[具体天数]内完成交付，每延迟一天需支付合同金额[百分比]%的违约金?,
        importance: 'critical',
        riskMitigation: '设定明确交付时间，约束供应商按时交付',
        alternatives: ['分期交付', '弹性交付时?, '按里程碑交付'],
      },
      {
        clauseType: '交付地点',
        clauseText: '交付地点为[具体地址]，运输费用及风险由[责任方]承担?,
        importance: 'important',
        riskMitigation: '明确交付责任，避免争?,
        alternatives: ['买方指定地点', '供应商工?, '第三方仓?],
      },
    ],

    payment: [
      {
        clauseType: '付款方式',
        clauseText:
          '采用[付款方式]，具体为：合同签订后支付[百分比]%预付款，验收合格后支付[百分比]%尾款?,
        importance: 'critical',
        riskMitigation: '合理分配付款节奏，平衡双方风?,
        alternatives: ['一次性付?, '分期付款', '信用证付?],
      },
      {
        clauseType: '发票要求',
        clauseText:
          '供应商应在收到款项后[天数]日内提供合法有效的增值税专用发票?,
        importance: 'important',
        riskMitigation: '确保税务合规，避免财务风?,
        alternatives: ['普通发?, '电子发票', '分期开?],
      },
    ],

    liability: [
      {
        clauseType: '违约责任',
        clauseText:
          '如一方违约，应向另一方支付合同总金额[百分比]%的违约金，违约金不足以弥补损失的，还应赔偿实际损失?,
        importance: 'critical',
        riskMitigation: '明确违约后果，约束合同履?,
        alternatives: ['定额违约?, '损失赔偿', '继续履行'],
      },
      {
        clauseType: '免责条款',
        clauseText:
          '因不可抗力导致无法履行合同的，双方互不承担责任，但应及时通知对方并提供证明?,
        importance: 'important',
        riskMitigation: '合理分配不可抗力风险',
        alternatives: ['部分免责', '延期履行', '解除合同'],
      },
    ],

    intellectualProperty: [
      {
        clauseType: '知识产权归属',
        clauseText:
          '在履行合同过程中产生的知识产权归[归属方]所有，另一方不得擅自使用或转让?,
        importance: 'important',
        riskMitigation: '明确知识产权归属，避免纠?,
        alternatives: ['共同所?, '各自所?, '授权使用'],
      },
    ],
  };

  // 风险权重配置
  private readonly RISK_WEIGHTS = {
    quality: 0.3,
    delivery: 0.25,
    payment: 0.2,
    liability: 0.15,
    ip: 0.1,
  };

  /**
   * 智能推荐合同条款
   */
  recommendContractClauses(
    context: ContractContext
  ): ContractRecommendationOutput {
    // 1. 分析合同上下?    const contextAnalysis = this.analyzeContractContext(context);

    // 2. 生成条款推荐
    const clauseRecommendations = this.generateClauseRecommendations(
      context,
      contextAnalysis
    );

    // 3. 构建合同结构
    const contractStructure = this.buildContractStructure(
      clauseRecommendations
    );

    // 4. 评估风险
    const riskAssessment = this.assessContractRisk(
      context,
      clauseRecommendations
    );

    // 5. 提供谈判指导
    const negotiationGuidance = this.generateNegotiationGuidance(
      context,
      clauseRecommendations
    );

    return {
      recommendedClauses: clauseRecommendations,
      contractStructure,
      riskAssessment,
      negotiationGuidance,
    };
  }

  /**
   * 分析合同上下?   */
  private analyzeContractContext(context: ContractContext) {
    const analysis = {
      qualityRisk: this.assessQualityRisk(context),
      deliveryRisk: this.assessDeliveryRisk(context),
      paymentRisk: this.assessPaymentRisk(context),
      overallRisk: this.calculateOverallRisk(context),
    };

    return analysis;
  }

  /**
   * 评估质量风险
   */
  private assessQualityRisk(context: ContractContext): number {
    let riskScore = 50; // 基础风险?
    // 供应商历史表?    const avgPerformance =
      (context.supplierPerformanceHistory.qualityScore +
        context.supplierPerformanceHistory.deliveryScore +
        context.supplierPerformanceHistory.serviceScore) /
      3;

    riskScore -= (avgPerformance - 50) * 0.5; // 表现越好风险越低

    // 供应商风险等?    const riskMultipliers = {
      low: 0.7,
      medium: 1.0,
      high: 1.5,
      critical: 2.0,
    };
    riskScore *= riskMultipliers[context.supplierRiskLevel];

    // 质量要求复杂?    riskScore += context.qualityRequirements.length * 2;

    return Math.min(100, Math.max(0, riskScore));
  }

  /**
   * 评估交付风险
   */
  private assessDeliveryRisk(context: ContractContext): number {
    let riskScore = 40; // 基础风险?
    // 交付期限压力
    if (context.duration < 30) {
      riskScore += 30; // 短期合同风险?    } else if (context.duration > 365) {
      riskScore += 10; // 长期合同适度风险
    }

    // 供应商交付历?    riskScore -= (context.supplierPerformanceHistory.deliveryScore - 50) * 0.4;

    return Math.min(100, Math.max(0, riskScore));
  }

  /**
   * 评估付款风险
   */
  private assessPaymentRisk(context: ContractContext): number {
    let riskScore = 30; // 基础风险?
    // 付款方式风险
    const paymentRiskMap = {
      advance: 20, // 预付款风险最?      installment: 10, // 分期付款适中
      delivery: 5, // 到货付款较低
      credit: 30, // 赊账风险很高
    };
    riskScore += paymentRiskMap[context.paymentPreferences.paymentMethod];

    // 付款期限
    if (context.paymentPreferences.paymentTerm > 90) {
      riskScore += 15;
    } else if (context.paymentPreferences.paymentTerm > 60) {
      riskScore += 10;
    }

    // 合同金额大小
    if (context.contractValue > 1000000) {
      riskScore += 10; // 大额合同风险较高
    }

    return Math.min(100, Math.max(0, riskScore));
  }

  /**
   * 计算综合风险
   */
  private calculateOverallRisk(context: ContractContext): number {
    const contextAnalysis = this.analyzeContractContext(context);
    return (
      contextAnalysis.qualityRisk * 0.4 +
      contextAnalysis.deliveryRisk * 0.3 +
      contextAnalysis.paymentRisk * 0.3
    );
  }

  /**
   * 生成条款推荐
   */
  private generateClauseRecommendations(
    context: ContractContext,
    contextAnalysis: ReturnType<typeof this.analyzeContractContext>
  ): ClauseRecommendation[] {
    const recommendations: ClauseRecommendation[] = [];

    // 根据不同风险维度推荐条款
    const riskDimensions = [
      { name: 'quality', riskScore: contextAnalysis.qualityRisk },
      { name: 'delivery', riskScore: contextAnalysis.deliveryRisk },
      { name: 'payment', riskScore: contextAnalysis.paymentRisk },
    ];

    for (const dimension of riskDimensions) {
      const clauses = this.CLAUSE_LIBRARY[dimension.name] || [];

      for (const clause of clauses) {
        const recommendation = this.evaluateClause(
          clause,
          context,
          dimension.riskScore
        );
        recommendations.push(recommendation);
      }
    }

    // 根据合同类型添加特定条款
    this.addProcurementTypeClauses(recommendations, context);

    // 根据行业特性添加条?    this.addIndustrySpecificClauses(recommendations, context);

    return recommendations.sort(
      (a, b) => b.recommendationScore - a.recommendationScore
    );
  }

  /**
   * 评估单个条款
   */
  private evaluateClause(
    clause: ContractClause,
    context: ContractContext,
    riskScore: number
  ): ClauseRecommendation {
    // 基础推荐得分
    let recommendationScore = 70;

    // 根据风险程度调整得分
    if (riskScore > 70) {
      recommendationScore = clause.importance === 'critical' ? 95 : 85;
    } else if (riskScore > 40) {
      recommendationScore = clause.importance === 'critical' ? 85 : 75;
    } else {
      recommendationScore = clause.importance === 'critical' ? 75 : 65;
    }

    // 适用性评?    const applicability = this.calculateApplicability(clause, context);

    // 修改建议
    const modificationSuggestions = this.generateModificationSuggestions(
      clause,
      context
    );

    return {
      clause,
      recommendationScore: parseFloat(recommendationScore.toFixed(2)),
      applicability: parseFloat(applicability.toFixed(2)),
      modificationSuggestions,
    };
  }

  /**
   * 计算条款适用?   */
  private calculateApplicability(
    clause: ContractClause,
    context: ContractContext
  ): number {
    let score = 80; // 基础适用性分

    // 根据条款类型和合同特征调?    switch (clause.clauseType) {
      case '质量标准':
        score += context.qualityRequirements.length * 2;
        break;
      case '交付期限':
        if (context.duration < 60) score += 15;
        break;
      case '付款方式':
        if (context.contractValue > 500000) score += 10;
        break;
    }

    return Math.min(100, score);
  }

  /**
   * 生成修改建议
   */
  private generateModificationSuggestions(
    clause: ContractClause,
    context: ContractContext
  ): string[] {
    const suggestions: string[] = [];

    // 根据供应商风险等级调?    if (
      context.supplierRiskLevel === 'high' ||
      context.supplierRiskLevel === 'critical'
    ) {
      suggestions.push('建议加强违约责任条款');
      suggestions.push('考虑增加担保或保证金要求');
    }

    // 根据风险偏好调整
    if (context.riskTolerance === 'conservative') {
      suggestions.push('建议选择更严格的条款版本');
    } else if (context.riskTolerance === 'aggressive') {
      suggestions.push('可以考虑适当放宽某些条款要求');
    }

    // 根据付款方式调整
    if (context.paymentPreferences.paymentMethod === 'advance') {
      suggestions.push('建议增加质量保证条款');
    }

    return suggestions;
  }

  /**
   * 添加采购类型特定条款
   */
  private addProcurementTypeClauses(
    recommendations: ClauseRecommendation[],
    context: ContractContext
  ) {
    const typeSpecificClauses: Record<string, ContractClause[]> = {
      goods: [
        {
          clauseType: '验收标准',
          clauseText:
            '货物到达指定地点后，买方应在[天数]日内进行验收，验收标准为[具体标准]�?,
          importance: 'critical',
          riskMitigation: '明确验收程序和标?,
          alternatives: [],
        },
      ],
      services: [
        {
          clauseType: '服务标准',
          clauseText:
            '服务应达到[具体标准]要求，服务商应提供服务过程记录和成果报告?,
          importance: 'critical',
          riskMitigation: '确保服务质量可控',
          alternatives: [],
        },
      ],
      construction: [
        {
          clauseType: '工程验收',
          clauseText:
            '工程竣工后应按照[标准]进行验收，验收合格后方可办理结算手续?,
          importance: 'critical',
          riskMitigation: '确保工程质量符合要求',
          alternatives: [],
        },
      ],
    };

    const specificClauses = typeSpecificClauses[context.procurementType] || [];
    for (const clause of specificClauses) {
      const recommendation = this.evaluateClause(clause, context, 60);
      recommendations.push(recommendation);
    }
  }

  /**
   * 添加行业特定条款
   */
  private addIndustrySpecificClauses(
    recommendations: ClauseRecommendation[],
    context: ContractContext
  ) {
    // 根据行业类型添加相关条款
    if (
      context.industryType.includes('软件') ||
      context.industryType.includes('IT')
    ) {
      const ipClause: ContractClause = {
        clauseType: '源代码托?,
        clauseText:
          '对于定制开发的软件，供应商应在[平台]上托管源代码，确保项目可持续性?,
        importance: 'important',
        riskMitigation: '保障技术资产安?,
        alternatives: ['本地备份', '第三方托?],
      };
      recommendations.push(this.evaluateClause(ipClause, context, 50));
    }
  }

  /**
   * 构建合同结构
   */
  private buildContractStructure(recommendations: ClauseRecommendation[]) {
    const essentialClauses: ContractClause[] = [];
    const conditionalClauses: ContractClause[] = [];
    const optionalClauses: ContractClause[] = [];

    recommendations.forEach(rec => {
      if (rec.applicability > 80) {
        essentialClauses.push(rec.clause);
      } else if (rec.applicability > 60) {
        conditionalClauses.push(rec.clause);
      } else {
        optionalClauses.push(rec.clause);
      }
    });

    return { essentialClauses, conditionalClauses, optionalClauses };
  }

  /**
   * 评估合同风险
   */
  private assessContractRisk(
    context: ContractContext,
    recommendations: ClauseRecommendation[]
  ) {
    const identifiedRisks: string[] = [];
    const mitigationMeasures: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // 分析主要风险?    const criticalClauses = recommendations.filter(
      r => r.clause.importance === 'critical' && r.applicability > 70
    );

    if (criticalClauses.length < 3) {
      identifiedRisks.push('关键保护条款不足');
      mitigationMeasures.push('补充重要风险防范条款');
      riskLevel = 'high';
    }

    // 根据供应商风险等级调?    if (
      context.supplierRiskLevel === 'high' ||
      context.supplierRiskLevel === 'critical'
    ) {
      identifiedRisks.push('供应商本身存在较高风?);
      mitigationMeasures.push('加强履约担保措施');
      riskLevel = riskLevel === 'low' ? 'medium' : 'high';
    }

    return { identifiedRisks, mitigationMeasures, overallRiskLevel: riskLevel };
  }

  /**
   * 生成谈判指导
   */
  private generateNegotiationGuidance(
    context: ContractContext,
    recommendations: ClauseRecommendation[]
  ) {
    const keyPoints: string[] = [];
    const leverageAreas: string[] = [];
    const redLines: string[] = [];

    // 关键谈判要点
    keyPoints.push('明确质量标准和技术要?);
    keyPoints.push('设定合理的交付时间节?);
    keyPoints.push('平衡付款条件与风险承?);

    // 谈判筹码
    if (context.contractValue > 100000) {
      leverageAreas.push('利用订单规模争取优惠条件');
    }

    if (context.supplierRiskLevel !== 'critical') {
      leverageAreas.push('多家供应商对比的竞争优势');
    }

    // 底线条款
    redLines.push('质量不合格的退货和赔偿权利');
    redLines.push('严重违约的合同解除权');
    redLines.push('知识产权归属的明确约?);

    return { keyPoints, leverageAreas, redLines };
  }

  /**
   * 批量处理多个合同场景
   */
  batchRecommend(inputs: ContractContext[]): ContractRecommendationOutput[] {
    return inputs.map(input => this.recommendContractClauses(input));
  }
}

// 导出默认实例
export const contractAdvisor = new IntelligentContractAdvisor();

// 使用示例
/*
const context: ContractContext = {
  procurementType: 'goods',
  contractValue: 500000,
  currency: 'USD',
  duration: 180,
  supplierRiskLevel: 'medium',
  supplierPerformanceHistory: {
    qualityScore: 85,
    deliveryScore: 90,
    serviceScore: 88
  },
  qualityRequirements: ['ISO9001', 'RoHS'],
  deliveryRequirements: ['准时交付', '包装完好'],
  paymentPreferences: {
    paymentMethod: 'installment',
    paymentTerm: 30
  },
  riskTolerance: 'moderate',
  industryType: '电子制?,
  regulatoryRequirements: ['环保法规', '安全生产']
}

const result = contractAdvisor.recommendContractClauses(context)
// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(result)*/
