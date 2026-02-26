import { marketDataService } from '@/services/market-data.service';
import { DeviceProfile } from '@/lib/constants/lifecycle';
import { 
  AggregatedMarketData 
} from '@/lib/types/market.types';

// 置信度评估配置
interface ConfidenceConfig {
  minSampleCount: number;        // 最小样本量
  maxDataAgeDays: number;        // 最大数据年龄（天）
  minFreshnessScore: number;     // 最低新鲜度分数
  priceStabilityThreshold: number; // 价格稳定性阈值
  weightSampleCount: number;     // 样本量权重
  weightFreshness: number;       // 新鲜度权重
  weightStability: number;       // 稳定性权重
}

// 置信度评估结果
interface ConfidenceAssessment {
  overallConfidence: number;     // 总体置信度 (0-1)
  breakdown: {
    sampleCountScore: number;    // 样本量得分
    freshnessScore: number;      // 新鲜度得分
    stabilityScore: number;      // 稳定性得分
    sourceReliability: number;   // 数据源可靠性
  };
  recommendations: string[];     // 建议
  shouldFallback: boolean;       // 是否应回退到规则引擎
  fallbackReason?: string;       // 回退原因
}

// 回退策略
type FallbackStrategy = 'rule_engine' | 'depreciation_only' | 'market_estimate';

export class ConfidenceService {
  private config: ConfidenceConfig;

  constructor(config?: Partial<ConfidenceConfig>) {
    this.config = {
      minSampleCount: config?.minSampleCount ?? 5,
      maxDataAgeDays: config?.maxDataAgeDays ?? 7,
      minFreshnessScore: config?.minFreshnessScore ?? 0.5,
      priceStabilityThreshold: config?.priceStabilityThreshold ?? 0.3,
      weightSampleCount: config?.weightSampleCount ?? 0.3,
      weightFreshness: config?.weightFreshness ?? 0.4,
      weightStability: config?.weightStability ?? 0.3
    };
  }

  /**
   * 根据市场数据样本量和新鲜度计算置信度
   */
  async assessConfidence(deviceModel: string): Promise<ConfidenceAssessment> {
    try {
      // 获取市场数据
      const marketData = await marketDataService.getLatestMarketData(deviceModel);
      
      // 评估各项指标
      const sampleCountScore = this.calculateSampleCountScore(marketData);
      const freshnessScore = this.calculateFreshnessScore(marketData);
      const stabilityScore = this.calculateStabilityScore(marketData);
      const sourceReliability = this.calculateSourceReliability(marketData);
      
      // 计算总体置信度
      const overallConfidence = this.calculateOverallConfidence({
        sampleCountScore,
        freshnessScore,
        stabilityScore,
        sourceReliability
      });
      
      // 生成建议
      const recommendations = this.generateRecommendations({
        sampleCountScore,
        freshnessScore,
        stabilityScore,
        overallConfidence
      });
      
      // 判断是否需要回退
      const { shouldFallback, fallbackReason } = this.shouldFallbackToRuleEngine(
        overallConfidence,
        sampleCountScore,
        freshnessScore
      );
      
      return {
        overallConfidence: Number(overallConfidence.toFixed(3)),
        breakdown: {
          sampleCountScore: Number(sampleCountScore.toFixed(3)),
          freshnessScore: Number(freshnessScore.toFixed(3)),
          stabilityScore: Number(stabilityScore.toFixed(3)),
          sourceReliability: Number(sourceReliability.toFixed(3))
        },
        recommendations,
        shouldFallback,
        fallbackReason
      };
      
    } catch (error) {
      console.error('置信度评估失败:', error);
      // 出错时保守回退
      return {
        overallConfidence: 0.2,
        breakdown: {
          sampleCountScore: 0,
          freshnessScore: 0,
          stabilityScore: 0,
          sourceReliability: 0
        },
        recommendations: ['数据获取失败，建议使用规则引擎'],
        shouldFallback: true,
        fallbackReason: '数据获取异常'
      };
    }
  }

  /**
   * 计算样本量得分
   */
  private calculateSampleCountScore(marketData: AggregatedMarketData): number {
    const sampleCounts = [
      marketData.xianyuData?.sampleCount || 0,
      marketData.zhuanTurnData?.sampleCount || 0,
      marketData.aggregateData?.sampleCount || 0
    ].filter(count => count > 0);
    
    if (sampleCounts.length === 0) return 0;
    
    const maxCount = Math.max(...sampleCounts);
    
    if (maxCount >= 20) return 1.0;
    if (maxCount >= 10) return 0.8;
    if (maxCount >= this.config.minSampleCount) return 0.6;
    return 0.3;
  }

  /**
   * 计算新鲜度得分
   */
  private calculateFreshnessScore(marketData: AggregatedMarketData): number {
    const freshnessScores = [
      marketData.xianyuData?.freshnessScore || 0,
      marketData.zhuanTurnData?.freshnessScore || 0,
      marketData.aggregateData?.freshnessScore || 0
    ].filter(score => score > 0);
    
    if (freshnessScores.length === 0) return 0;
    
    const avgFreshness = freshnessScores.reduce((sum, score) => sum + score, 0) / freshnessScores.length;
    return Math.min(1, Math.max(0, avgFreshness));
  }

  /**
   * 计算价格稳定性得分
   */
  private calculateStabilityScore(marketData: AggregatedMarketData): number {
    const priceRanges: number[] = [];
    
    // 计算各数据源的价格区间
    [marketData.xianyuData, marketData.zhuanTurnData, marketData.aggregateData]
      .filter(Boolean)
      .forEach(data => {
        if (data && data.maxPrice > 0 && data.minPrice > 0) {
          const range = (data.maxPrice - data.minPrice) / data.avgPrice;
          priceRanges.push(range);
        }
      });
    
    if (priceRanges.length === 0) return 0.5; // 默认中等稳定性
    
    const avgRange = priceRanges.reduce((sum, range) => sum + range, 0) / priceRanges.length;
    
    // 价格区间越小越稳定
    if (avgRange <= 0.1) return 1.0;      // 非常稳定
    if (avgRange <= 0.2) return 0.8;      // 稳定
    if (avgRange <= this.config.priceStabilityThreshold) return 0.6; // 一般
    if (avgRange <= 0.5) return 0.3;      // 不稳定
    return 0.1;                           // 非常不稳定
  }

  /**
   * 计算数据源可靠性
   */
  private calculateSourceReliability(marketData: AggregatedMarketData): number {
    let reliability = 0;
    let sourceCount = 0;
    
    if (marketData.xianyuData) {
      reliability += 0.9; // 闲鱼数据相对可靠
      sourceCount++;
    }
    
    if (marketData.zhuanTurnData) {
      reliability += 0.8; // 转转数据较可靠
      sourceCount++;
    }
    
    if (marketData.aggregateData) {
      reliability += 1.0; // 聚合数据最可靠
      sourceCount++;
    }
    
    return sourceCount > 0 ? reliability / sourceCount : 0;
  }

  /**
   * 计算总体置信度
   */
  private calculateOverallConfidence(scores: {
    sampleCountScore: number;
    freshnessScore: number;
    stabilityScore: number;
    sourceReliability: number;
  }): number {
    return (
      scores.sampleCountScore * this.config.weightSampleCount +
      scores.freshnessScore * this.config.weightFreshness +
      scores.stabilityScore * this.config.weightStability +
      scores.sourceReliability * 0.1 // 数据源可靠性权重较小
    );
  }

  /**
   * 判断是否需要回退到规则引擎
   */
  private shouldFallbackToRuleEngine(
    overallConfidence: number,
    sampleCountScore: number,
    freshnessScore: number
  ): { shouldFallback: boolean; fallbackReason?: string } {
    // 置信度太低
    if (overallConfidence < 0.4) {
      return {
        shouldFallback: true,
        fallbackReason: '总体置信度过低'
      };
    }
    
    // 样本量不足
    if (sampleCountScore < 0.4) {
      return {
        shouldFallback: true,
        fallbackReason: '市场样本量不足'
      };
    }
    
    // 数据过期
    if (freshnessScore < this.config.minFreshnessScore) {
      return {
        shouldFallback: true,
        fallbackReason: '市场数据过期'
      };
    }
    
    return { shouldFallback: false };
  }

  /**
   * 生成建议
   */
  private generateRecommendations(scores: {
    sampleCountScore: number;
    freshnessScore: number;
    stabilityScore: number;
    overallConfidence: number;
  }): string[] {
    const recommendations: string[] = [];
    
    if (scores.sampleCountScore < 0.5) {
      recommendations.push('建议增加数据采集频次以提高样本量');
    }
    
    if (scores.freshnessScore < 0.6) {
      recommendations.push('建议缩短数据更新周期以保证新鲜度');
    }
    
    if (scores.stabilityScore < 0.5) {
      recommendations.push('市场价格波动较大，建议谨慎使用市场数据');
    }
    
    if (scores.overallConfidence > 0.8) {
      recommendations.push('置信度较高，可放心使用估值结果');
    } else if (scores.overallConfidence > 0.6) {
      recommendations.push('置信度中等，建议结合其他信息综合判断');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('当前估值基于充足且新鲜的市场数据');
    }
    
    return recommendations;
  }

  /**
   * 获取推荐的回退策略
   */
  getFallbackStrategy(assessment: ConfidenceAssessment): FallbackStrategy {
    if (assessment.overallConfidence < 0.3) {
      return 'rule_engine'; // 置信度很低，完全回退
    } else if (assessment.overallConfidence < 0.5) {
      return 'depreciation_only'; // 中等置信度，使用折旧估值
    } else {
      return 'market_estimate'; // 较高置信度，仍可使用市场估值
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<ConfidenceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ 置信度评估配置已更新:', this.config);
  }

  /**
   * 获取当前配置
   */
  getConfig(): ConfidenceConfig {
    return { ...this.config };
  }

  /**
   * 批量评估置信度
   */
  async batchAssessConfidence(deviceModels: string[]): Promise<
    Array<{ deviceModel: string; assessment: ConfidenceAssessment }>
  > {
    const results: Array<{ deviceModel: string; assessment: ConfidenceAssessment }> = [];
    
    for (const model of deviceModels) {
      try {
        const assessment = await this.assessConfidence(model);
        results.push({ deviceModel: model, assessment });
      } catch (error) {
        console.warn(`评估设备型号 ${model} 置信度失败:`, error);
        results.push({
          deviceModel: model,
          assessment: {
            overallConfidence: 0,
            breakdown: {
              sampleCountScore: 0,
              freshnessScore: 0,
              stabilityScore: 0,
              sourceReliability: 0
            },
            recommendations: ['评估失败'],
            shouldFallback: true,
            fallbackReason: '评估过程异常'
          }
        });
      }
    }
    
    return results;
  }

  /**
   * 获取置信度统计报告
   */
  async getConfidenceReport(deviceModels: string[]): Promise<{
    summary: {
      totalModels: number;
      highConfidence: number;    // 置信度 > 0.8
      mediumConfidence: number;  // 置信度 0.5-0.8
      lowConfidence: number;     // 置信度 < 0.5
      avgConfidence: number;
    };
    details: Array<{ deviceModel: string; confidence: number; status: string }>;
  }> {
    const assessments = await this.batchAssessConfidence(deviceModels);
    
    const highConfidence = assessments.filter(a => a.assessment.overallConfidence > 0.8).length;
    const mediumConfidence = assessments.filter(a => 
      a.assessment.overallConfidence >= 0.5 && a.assessment.overallConfidence <= 0.8
    ).length;
    const lowConfidence = assessments.filter(a => a.assessment.overallConfidence < 0.5).length;
    
    const totalConfidence = assessments.reduce((sum, a) => sum + a.assessment.overallConfidence, 0);
    const avgConfidence = assessments.length > 0 ? totalConfidence / assessments.length : 0;
    
    const details = assessments.map(a => ({
      deviceModel: a.deviceModel,
      confidence: a.assessment.overallConfidence,
      status: a.assessment.overallConfidence > 0.8 ? 'high' : 
              a.assessment.overallConfidence > 0.5 ? 'medium' : 'low'
    }));
    
    return {
      summary: {
        totalModels: deviceModels.length,
        highConfidence,
        mediumConfidence,
        lowConfidence,
        avgConfidence: Number(avgConfidence.toFixed(3))
      },
      details
    };
  }
}

// 导出单例实例
export const confidenceService = new ConfidenceService();