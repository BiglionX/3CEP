import {
  ValuationEngineService,
  DeviceCondition,
  ValuationResult,
} from '@/lib/valuation/valuation-engine.service';
import { marketWeightedEngineService } from '@/services/market-weighted.service';
import { MLModelClient } from '@/services/ml-client.service';
import { DeviceProfile } from '@/lib/constants/lifecycle';

/**
 * 智能决策引擎V2
 * 根据置信度动态选择最优估值策? */

// 策略类型定义
export type ValuationMethod = 'ml' | 'market' | 'rule' | 'hybrid';

// 置信度等?export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'very_low';

// 决策结果
export interface FusionDecision {
  method: ValuationMethod;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
  primaryValue: number;
  alternativeValues: {
    ml?: number;
    market?: number;
    rule?: number;
  };
  rationale: string;
  metadata: Record<string, any>;
}

// 决策配置
interface FusionConfig {
  // 置信度阈?  confidenceThresholds: {
    high: number; // �?0.8
    medium: number; // �?0.6
    low: number; // �?0.4
  };

  // 权重配置
  strategyWeights: {
    ml: number;
    market: number;
    rule: number;
  };

  // 异常检测阈?  outlierThreshold: number; // 价格偏差超过此比例视为异?
  // 最小样本要?  minSamples: {
    ml: number;
    market: number;
  };
}

export class FusionEngineV2Service {
  private static instance: FusionEngineV2Service;
  private config: FusionConfig;
  private valuationService: ValuationEngineService;
  private mlClient: MLModelClient;

  private constructor() {
    this.valuationService = ValuationEngineService.getInstance();
    this.mlClient = new MLModelClient();
    this.config = {
      confidenceThresholds: {
        high: 0.8,
        medium: 0.6,
        low: 0.4,
      },
      strategyWeights: {
        ml: 0.7,
        market: 0.2,
        rule: 0.1,
      },
      outlierThreshold: 0.5, // 50%偏差
      minSamples: {
        ml: 100,
        market: 5,
      },
    };
  }

  public static getInstance(): FusionEngineV2Service {
    if (!FusionEngineV2Service.instance) {
      FusionEngineV2Service.instance = new FusionEngineV2Service();
    }
    return FusionEngineV2Service.instance;
  }

  /**
   * 智能决策主入?   * 根据多种因素动态选择最优估值策?   */
  public async makeIntelligentDecision(
    deviceProfile: DeviceProfile,
    condition?: DeviceCondition,
    marketPrice?: number
  ): Promise<FusionDecision> {
    try {
      // 1. 并行获取各策略估?      const [mlResult, marketResult, ruleResult] = await Promise.all([
        this.getMLValuation(deviceProfile, condition),
        this.getMarketValuation(deviceProfile, condition, marketPrice),
        this.getRuleValuation(deviceProfile, condition, marketPrice),
      ]);

      // 2. 评估各策略置信度
      const confidences = await this.assessConfidences(deviceProfile, {
        ml: mlResult,
        market: marketResult,
        rule: ruleResult,
      });

      // 3. 制定决策
      const decision = this.makeDecision(
        { ml: mlResult, market: marketResult, rule: ruleResult },
        confidences
      );

      // 4. 记录决策日志
      await this.logDecision(deviceProfile, decision);

      return decision;
    } catch (error) {
      console.error('智能决策引擎执行失败:', error);
      // 回退到规则引?      return this.fallbackToRuleEngine(deviceProfile, condition, marketPrice);
    }
  }

  /**
   * 获取ML模型估?   */
  private async getMLValuation(
    deviceProfile: DeviceProfile,
    condition?: DeviceCondition
  ): Promise<{ value: number; confidence: number; available: boolean }> {
    try {
      // 检查ML服务可用?      const healthCheck = await this.mlClient.healthCheck();
      if (healthCheck.status !== 'healthy') {
        return { value: 0, confidence: 0, available: false };
      }

      const features = this.extractMLFeatures(deviceProfile, condition);
      const prediction = await this.mlClient.predictPrice(features);

      if (prediction.success && prediction.data) {
        return {
          value: prediction.data.predictedPrice,
          confidence: prediction.data.confidence,
          available: true,
        };
      } else {
        return { value: 0, confidence: 0, available: false };
      }
    } catch (error) {
      console.warn('ML估值获取失?', error);
      return { value: 0, confidence: 0, available: false };
    }
  }

  /**
   * 获取市场加权估?   */
  private async getMarketValuation(
    deviceProfile: DeviceProfile,
    condition?: DeviceCondition,
    marketPrice?: number
  ): Promise<{ value: number; confidence: number; available: boolean }> {
    try {
      const result =
        await marketWeightedEngineService.calculateMarketWeightedValue(
          deviceProfile,
          condition,
          marketPrice
        );

      // 评估市场数据质量
      const quality =
        await marketWeightedEngineService.analyzeMarketDataQuality(
          deviceProfile.productModel
        );

      return {
        value: result.finalValue,
        confidence: quality.confidence,
        available: quality.hasMarketData,
      };
    } catch (error) {
      console.warn('市场估值获取失?', error);
      return { value: 0, confidence: 0, available: false };
    }
  }

  /**
   * 获取规则引擎估?   */
  private async getRuleValuation(
    deviceProfile: DeviceProfile,
    condition?: DeviceCondition,
    marketPrice?: number
  ): Promise<{ value: number; confidence: number; available: boolean }> {
    try {
      const result = await this.valuationService.calculateBaseValue(
        deviceProfile,
        condition,
        marketPrice
      );

      // 规则引擎置信度基于设备信息完整?      const completeness = this.assessDeviceInfoCompleteness(deviceProfile);
      const confidence = Math.min(0.9, completeness * 0.7 + 0.2);

      return {
        value: result.finalValue,
        confidence,
        available: true,
      };
    } catch (error) {
      console.warn('规则估值获取失?', error);
      return { value: 0, confidence: 0, available: false };
    }
  }

  /**
   * 评估各策略置信度
   */
  private async assessConfidences(
    deviceProfile: DeviceProfile,
    valuations: {
      ml: { value: number; confidence: number; available: boolean };
      market: { value: number; confidence: number; available: boolean };
      rule: { value: number; confidence: number; available: boolean };
    }
  ): Promise<Record<ValuationMethod, number>> {
    const confidences: Record<ValuationMethod, number> = {
      ml: 0,
      market: 0,
      rule: 0,
      hybrid: 0,
    };

    // ML置信度评?    if (valuations.ml.available) {
      confidences.ml = this.adjustMLConfidence(
        valuations.ml.confidence,
        deviceProfile
      );
    }

    // 市场置信度评?    if (valuations.market.available) {
      confidences.market = this.adjustMarketConfidence(
        valuations.market.confidence,
        deviceProfile
      );
    }

    // 规则置信度（总是可用?    confidences.rule = valuations.rule.confidence;

    // 计算混合策略置信?    confidences.hybrid = this.calculateHybridConfidence(confidences);

    return confidences;
  }

  /**
   * 调整ML置信?   */
  private adjustMLConfidence(
    baseConfidence: number,
    deviceProfile: DeviceProfile
  ): number {
    let confidence = baseConfidence;

    // 根据设备类型调整
    if (deviceProfile?.includes('手机')) {
      confidence *= 1.1; // 手机数据更丰?    } else if (deviceProfile?.includes('笔记?)) {
      confidence *= 0.9; // 笔记本数据相对较?    }

    // 根据设备年龄调整
    const ageInMonths = this.calculateDeviceAge(deviceProfile);
    if (ageInMonths > 36) {
      confidence *= 0.8; // 老设备置信度降低
    }

    return Math.min(1, Math.max(0, confidence));
  }

  /**
   * 调整市场置信?   */
  private adjustMarketConfidence(
    baseConfidence: number,
    deviceProfile: DeviceProfile
  ): number {
    let confidence = baseConfidence;

    // 热门设备置信度更?    const popularModels = ['iphone', 'galaxy', 'macbook'];
    const isPopular = popularModels.some(model =>
      deviceProfile.productModel.toLowerCase().includes(model)
    );

    if (isPopular) {
      confidence *= 1.2;
    }

    return Math.min(1, Math.max(0, confidence));
  }

  /**
   * 计算混合策略置信?   */
  private calculateHybridConfidence(
    confidences: Record<ValuationMethod, number>
  ): number {
    const { ml, market, rule } = confidences;
    const weights = this.config.strategyWeights;

    // 加权平均
    const weightedConfidence =
      ml * weights.ml + market * weights.market + rule * weights.rule;

    // 混合策略通常比单一策略更可?    return Math.min(1, weightedConfidence * 1.1);
  }

  /**
   * 制定最终决?   */
  private makeDecision(
    valuations: {
      ml: { value: number; confidence: number; available: boolean };
      market: { value: number; confidence: number; available: boolean };
      rule: { value: number; confidence: number; available: boolean };
    },
    confidences: Record<ValuationMethod, number>
  ): FusionDecision {
    const { ml, market, rule } = valuations;
    const {
      ml: mlConf,
      market: marketConf,
      rule: ruleConf,
      hybrid: hybridConf,
    } = confidences;

    // 确定最佳策?    let selectedMethod: ValuationMethod = 'rule';
    let selectedValue = rule.value;
    let selectedConfidence = ruleConf;

    // 策略选择逻辑
    if (ml.available && mlConf >= this.config.confidenceThresholds.high) {
      // ML置信度很高，优先使用
      selectedMethod = 'ml';
      selectedValue = ml.value;
      selectedConfidence = mlConf;
    } else if (
      market.available &&
      marketConf >= this.config.confidenceThresholds.medium
    ) {
      // 市场数据质量好，使用市场加权
      selectedMethod = 'market';
      selectedValue = market.value;
      selectedConfidence = marketConf;
    } else if (hybridConf > Math.max(mlConf, marketConf, ruleConf)) {
      // 混合策略最?      selectedMethod = 'hybrid';
      selectedValue = this.calculateHybridValue(valuations, confidences);
      selectedConfidence = hybridConf;
    } else {
      // 回退到规则引?      selectedMethod = 'rule';
      selectedValue = rule.value;
      selectedConfidence = ruleConf;
    }

    // 确定置信度等?    const confidenceLevel = this.determineConfidenceLevel(selectedConfidence);

    // 构建决策结果
    const decision: FusionDecision = {
      method: selectedMethod,
      confidenceLevel,
      confidenceScore: selectedConfidence,
      primaryValue: selectedValue,
      alternativeValues: {
        ml: ml.available ? ml.value : undefined,
        market: market.available ? market.value : undefined,
        rule: rule.value,
      },
      rationale: this.generateRationale(
        selectedMethod,
        confidences,
        valuations
      ),
      metadata: {
        timestamp: new Date().toISOString(),
        strategyWeights: this.config.strategyWeights,
        thresholds: this.config.confidenceThresholds,
      },
    };

    return decision;
  }

  /**
   * 计算混合估?   */
  private calculateHybridValue(
    valuations: {
      ml: { value: number; confidence: number; available: boolean };
      market: { value: number; confidence: number; available: boolean };
      rule: { value: number; confidence: number; available: boolean };
    },
    confidences: Record<ValuationMethod, number>
  ): number {
    const { ml, market, rule } = valuations;
    const totalConfidence =
      confidences.ml + confidences.market + confidences.rule;

    if (totalConfidence === 0) return rule.value;

    let hybridValue = 0;

    if (ml.available) {
      hybridValue += ml.value * (confidences.ml / totalConfidence);
    }

    if (market.available) {
      hybridValue += market.value * (confidences.market / totalConfidence);
    }

    hybridValue += rule.value * (confidences.rule / totalConfidence);

    return hybridValue;
  }

  /**
   * 确定置信度等?   */
  private determineConfidenceLevel(confidence: number): ConfidenceLevel {
    if (confidence >= this.config.confidenceThresholds.high) return 'high';
    if (confidence >= this.config.confidenceThresholds.medium) return 'medium';
    if (confidence >= this.config.confidenceThresholds.low) return 'low';
    return 'very_low';
  }

  /**
   * 生成决策理由
   */
  private generateRationale(
    selectedMethod: ValuationMethod,
    confidences: Record<ValuationMethod, number>,
    valuations: any
  ): string {
    const reasons: string[] = [];

    switch (selectedMethod) {
      case 'ml':
        reasons.push(`ML模型置信度高(${(confidences.ml * 100).toFixed(1)}%)`);
        if (valuations.ml.available) {
          reasons.push(`预测? ¥${valuations.ml.value.toFixed(2)}`);
        }
        break;

      case 'market':
        reasons.push(
          `市场数据质量良好(${(confidences.market * 100).toFixed(1)}%)`
        );
        if (valuations.market.available) {
          reasons.push(`市场参考价: ¥${valuations.market.value.toFixed(2)}`);
        }
        break;

      case 'hybrid':
        reasons.push(
          `采用加权混合策略(置信?{(confidences.hybrid * 100).toFixed(1)}%)`
        );
        break;

      case 'rule':
        reasons.push(
          `回退到规则引?置信?{(confidences.rule * 100).toFixed(1)}%)`
        );
        reasons.push(`基础估? ¥${valuations.rule.value.toFixed(2)}`);
        break;
    }

    return reasons.join(', ');
  }

  /**
   * 回退到规则引?   */
  private async fallbackToRuleEngine(
    deviceProfile: DeviceProfile,
    condition?: DeviceCondition,
    marketPrice?: number
  ): Promise<FusionDecision> {
    const result = await this.valuationService.calculateBaseValue(
      deviceProfile,
      condition,
      marketPrice
    );

    return {
      method: 'rule',
      confidenceLevel: 'low',
      confidenceScore: 0.3,
      primaryValue: result.finalValue,
      alternativeValues: { rule: result.finalValue },
      rationale: '系统降级到规则引?,
      metadata: { fallback: true, timestamp: new Date().toISOString() },
    };
  }

  /**
   * 记录决策日志
   */
  private async logDecision(
    deviceProfile: DeviceProfile,
    decision: FusionDecision
  ): Promise<void> {
    try {
      // 这里应该保存到数据库
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('📝 智能决策日志:', {
        deviceId: deviceProfile.id,
        model: deviceProfile.productModel,
        decision: decision.method,
        confidence: decision.confidenceScore,
        value: decision.primaryValue,
      })} catch (error) {
      console.warn('决策日志记录失败:', error);
    }
  }

  // ==================== 辅助方法 ====================

  /**
   * 提取ML特征
   */
  private extractMLFeatures(
    deviceProfile: DeviceProfile,
    condition?: DeviceCondition
  ) {
    return this.valuationService['extractDeviceFeatures'](
      deviceProfile,
      condition
    );
  }

  /**
   * 评估设备信息完整?   */
  private assessDeviceInfoCompleteness(deviceProfile: DeviceProfile): number {
    let score = 0;
    const totalFields = 6;

    if (deviceProfile.brandName) score++;
    if (deviceProfile.productModel) score++;
    if (deviceProfile.productCategory) score++;
    if (deviceProfile.manufacturingDate) score++;
    if (deviceProfile.specifications) score++;
    if (deviceProfile.totalRepairCount !== undefined) score++;

    return score / totalFields;
  }

  /**
   * 计算设备年龄
   */
  private calculateDeviceAge(deviceProfile: DeviceProfile): number {
    if (!deviceProfile.manufacturingDate) return 12;

    const manufactureDate = new Date(deviceProfile.manufacturingDate);
    const monthsOld =
      (Date.now() - manufactureDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return Math.max(0, monthsOld);
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<FusionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('⚙️ 智能决策引擎配置已更?', this.config)}

  /**
   * 获取当前配置
   */
  public getConfig(): FusionConfig {
    return { ...this.config };
  }
}

// 导出单例实例
export const fusionEngineV2Service = FusionEngineV2Service.getInstance();
