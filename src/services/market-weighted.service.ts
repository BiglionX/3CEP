import { marketDataService } from '@/services/market-data.service';
import { depreciationEngineService } from '@/services/depreciation.service';
import { DeviceProfile } from '@/lib/constants/lifecycle';
import { DeviceCondition } from '@/lib/valuation/valuation-engine.service';
import {
  ValuationResult,
  ValuationBreakdown,
} from '@/lib/valuation/valuation-engine.service';
import {
  AggregatedMarketData,
  DEFAULT_FRESHNESS_CONFIG,
} from '@/lib/types/market.types';

// 市场加权配置
interface MarketWeightedConfig {
  freshnessDecayRate: number; // 新鲜度衰减速率
  minFreshnessThreshold: number; // 最低新鲜度阈?  sampleCountThreshold: number; // 最小样本量阈?  weightingStrategy: 'linear' | 'exponential' | 'threshold'; // 加权策略
}

// 市场参考价结果
interface MarketReferencePrice {
  price: number;
  source: 'xianyu' | 'zhuan_turn' | 'aggregate';
  freshnessScore: number;
  sampleCount: number;
  confidence: number;
  daysOld: number;
}

export class MarketWeightedEngineService {
  private config: MarketWeightedConfig;

  constructor(config?: Partial<MarketWeightedConfig>) {
    this.config = {
      freshnessDecayRate: config?.freshnessDecayRate ?? 0.1,
      minFreshnessThreshold: config?.minFreshnessThreshold ?? 0.3,
      sampleCountThreshold: config?.sampleCountThreshold ?? 5,
      weightingStrategy: config?.weightingStrategy ?? 'linear',
    };
  }

  /**
   * 根据市场均价对折旧价进行加权调整
   */
  async calculateMarketWeightedValue(
    deviceProfile: DeviceProfile,
    condition?: DeviceCondition,
    marketPrice?: number
  ): Promise<ValuationResult> {
    try {
      // 1. 获取折旧基线估?      const baselineValuation =
        await depreciationEngineService.calculateBaselineValue(
          deviceProfile,
          condition,
          marketPrice
        );

      // 2. 获取市场参考价
      const marketReference = await this.getMarketReferencePrice(
        deviceProfile.productModel
      );

      // 3. 计算市场调整因子
      const marketAdjustment = this.calculateMarketAdjustment(
        baselineValuation.finalValue,
        marketReference
      );

      // 4. 应用市场加权
      const marketWeightedValue = this.applyMarketWeighting(
        baselineValuation.finalValue,
        marketAdjustment.adjustmentFactor,
        marketReference.confidence
      );

      // 5. 构建最终结?      const finalResult: ValuationResult = {
        ...baselineValuation,
        finalValue: Number(marketWeightedValue.toFixed(2)),
        breakdown: {
          ...baselineValuation.breakdown,
          ageAdjustment: marketAdjustment.adjustmentAmount,
        },
      };

      return finalResult;
    } catch (error) {
      console.error('市场加权引擎计算失败:', error);
      // 回退到纯折旧估?      return depreciationEngineService.calculateBaselineValue(
        deviceProfile,
        condition,
        marketPrice
      );
    }
  }

  /**
   * 获取市场参考价
   */
  private async getMarketReferencePrice(
    deviceModel: string
  ): Promise<MarketReferencePrice> {
    try {
      // 获取最新的市场数据
      const marketData =
        await marketDataService.getLatestMarketData(deviceModel);

      // 确定最佳数据源
      let bestData = marketData.aggregateData;
      let source: 'xianyu' | 'zhuan_turn' | 'aggregate' = 'aggregate';

      if (!bestData) {
        // 如果没有聚合数据，选择最好的单一来源
        const candidates = [
          { data: marketData.xianyuData, source: 'xianyu' as const },
          { data: marketData.zhuanTurnData, source: 'zhuan_turn' as const },
        ].filter(c => c.data !== null);

        if (candidates.length > 0) {
          candidates.sort((a, b) => b.data!.sampleCount - a.data!.sampleCount);
          bestData = candidates[0].data!;
          source = candidates[0].source;
        }
      }

      if (!bestData) {
        // 没有市场数据，返回默认?        return this.getDefaultMarketReference(deviceModel);
      }

      // 计算置信?      const confidence = this.calculateMarketConfidence(bestData);

      // 计算数据新鲜?      const daysOld = Math.ceil(
        (Date.now() - bestData.collectedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        price: bestData.avgPrice,
        source,
        freshnessScore: bestData.freshnessScore,
        sampleCount: bestData.sampleCount,
        confidence,
        daysOld,
      };
    } catch (error) {
      console.warn(`获取市场参考价失败 (${deviceModel}):`, error);
      return this.getDefaultMarketReference(deviceModel);
    }
  }

  /**
   * 计算市场调整因子
   */
  private calculateMarketAdjustment(
    baselineValue: number,
    marketReference: MarketReferencePrice
  ): { adjustmentFactor: number; adjustmentAmount: number } {
    // 计算新鲜度系?    const freshnessCoefficient = this.calculateFreshnessCoefficient(
      marketReference.daysOld
    );

    // 计算市场参考价（考虑新鲜度）
    const adjustedMarketPrice = marketReference.price * freshnessCoefficient;

    // 计算调整幅度
    const adjustmentRatio = adjustedMarketPrice / baselineValue;
    const adjustmentAmount = adjustedMarketPrice - baselineValue;

    // 限制调整幅度，避免过度偏?    const maxAdjustment = 0.3; // 最大?0%调整
    const clampedRatio = Math.max(
      1 - maxAdjustment,
      Math.min(1 + maxAdjustment, adjustmentRatio)
    );
    const clampedAmount = baselineValue * (clampedRatio - 1);

    return {
      adjustmentFactor: clampedRatio,
      adjustmentAmount: Number(clampedAmount.toFixed(2)),
    };
  }

  /**
   * 应用市场加权
   */
  private applyMarketWeighting(
    baselineValue: number,
    marketAdjustmentFactor: number,
    marketConfidence: number
  ): number {
    // 根据置信度确定市场权?    const marketWeight = this.calculateMarketWeight(marketConfidence);
    const baselineWeight = 1 - marketWeight;

    // 加权计算
    const weightedValue =
      baselineValue * baselineWeight +
      baselineValue * marketAdjustmentFactor * marketWeight;

    return weightedValue;
  }

  /**
   * 计算新鲜度系?   */
  private calculateFreshnessCoefficient(daysOld: number): number {
    if (daysOld <= 1) return 1.0; // 1天内完全新鲜

    // 使用指数衰减
    const coefficient = Math.max(
      this.config.minFreshnessThreshold,
      Math.exp(-daysOld * this.config.freshnessDecayRate)
    );

    return Number(coefficient.toFixed(3));
  }

  /**
   * 计算市场置信?   */
  private calculateMarketConfidence(marketData: any): number {
    let confidence = 0;

    // 样本量贡?(0-0.4)
    if (marketData.sampleCount >= 20) confidence += 0.4;
    else if (marketData.sampleCount >= 10) confidence += 0.3;
    else if (marketData.sampleCount >= 5) confidence += 0.2;
    else confidence += 0.1;

    // 新鲜度贡?(0-0.3)
    confidence += marketData.freshnessScore * 0.3;

    // 价格稳定性贡?(0-0.3)
    const priceRange =
      (marketData.maxPrice - marketData.minPrice) / marketData.avgPrice;
    if (priceRange <= 0.2)
      confidence += 0.3; // 价格差异?0%
    else if (priceRange <= 0.4) confidence += 0.2;
    else if (priceRange <= 0.6) confidence += 0.1;

    return Math.min(1, Math.max(0, confidence));
  }

  /**
   * 计算市场权重
   */
  private calculateMarketWeight(confidence: number): number {
    switch (this.config.weightingStrategy) {
      case 'linear':
        // 线性映? 0.3->0.1, 1.0->0.7
        return Math.max(0.1, Math.min(0.7, 0.1 + (confidence - 0.3) * 0.8));

      case 'exponential':
        // 指数增长
        return Math.pow(confidence, 2) * 0.7;

      case 'threshold':
        // 阈值策?        if (confidence >= 0.8) return 0.7;
        if (confidence >= 0.6) return 0.4;
        if (confidence >= 0.4) return 0.2;
        return 0.1;

      default:
        return 0.3; // 默认权重
    }
  }

  /**
   * 获取默认市场参考价
   */
  private getDefaultMarketReference(deviceModel: string): MarketReferencePrice {
    // 基于型号估算市场价格
    const estimatedPrice = this.estimateMarketPrice(deviceModel);

    return {
      price: estimatedPrice,
      source: 'aggregate',
      freshnessScore: 0.5,
      sampleCount: 0,
      confidence: 0.3,
      daysOld: 7,
    };
  }

  /**
   * 估算市场价格
   */
  private estimateMarketPrice(deviceModel: string): number {
    const model = deviceModel.toLowerCase();

    if (model.includes('iphone 14')) return 4500;
    if (model.includes('iphone 13')) return 3200;
    if (model.includes('iphone 12')) return 2500;
    if (model.includes('galaxy s23')) return 3800;
    if (model.includes('galaxy s22')) return 2800;
    if (model.includes('macbook')) return 8000;
    if (model.includes('ipad')) return 2500;

    return 3000; // 默认价格
  }

  /**
   * 获取引擎配置
   */
  getConfig(): MarketWeightedConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<MarketWeightedConfig>): void {
    this.config = { ...this.config, ...newConfig };
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('⚙️ 市场加权引擎配置已更?', this.config)}

  /**
   * 分析市场数据质量
   */
  async analyzeMarketDataQuality(deviceModel: string): Promise<{
    hasMarketData: boolean;
    confidence: number;
    recommendedAction:
      | 'use_market'
      | 'fallback_to_baseline'
      | 'insufficient_data';
    qualityMetrics: any;
  }> {
    try {
      const marketReference = await this.getMarketReferencePrice(deviceModel);

      const hasMarketData = marketReference.sampleCount > 0;
      const confidence = marketReference.confidence;

      let recommendedAction:
        | 'use_market'
        | 'fallback_to_baseline'
        | 'insufficient_data' = 'use_market';

      if (!hasMarketData || confidence < 0.4) {
        recommendedAction = 'insufficient_data';
      } else if (confidence < 0.6) {
        recommendedAction = 'fallback_to_baseline';
      }

      return {
        hasMarketData,
        confidence,
        recommendedAction,
        qualityMetrics: {
          sampleCount: marketReference.sampleCount,
          freshnessScore: marketReference.freshnessScore,
          daysOld: marketReference.daysOld,
          source: marketReference.source,
        },
      };
    } catch (error) {
      return {
        hasMarketData: false,
        confidence: 0,
        recommendedAction: 'insufficient_data',
        qualityMetrics: {},
      };
    }
  }
}

// 导出单例实例
export const marketWeightedEngineService = new MarketWeightedEngineService();
