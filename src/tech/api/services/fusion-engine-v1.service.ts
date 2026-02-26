import { marketWeightedEngineService } from '@/services/market-weighted.service';
import { depreciationEngineService } from '@/services/depreciation.service';
import { DeviceProfile, DeviceCondition } from '@/lib/constants/lifecycle';
import { 
  ValuationResult, 
  ValuationBreakdown 
} from '@/lib/valuation/valuation-engine.service';

// 融合引擎配置
interface FusionEngineConfig {
  depreciationWeight: number;     // 折旧价权重
  marketWeight: number;           // 市场价权重
  autoWeightAdjustment: boolean;  // 是否自动调整权重
  confidenceThreshold: number;    // 置信度阈值
  fallbackStrategy: 'depreciation_only' | 'market_only' | 'equal_weight'; // 回退策略
}

// 融合结果扩展
interface FusionValuationResult extends ValuationResult {
  fusionDetails: {
    depreciationValue: number;
    marketValue: number;
    weights: {
      depreciation: number;
      market: number;
    };
    confidence: number;
    strategy: 'fused' | 'depreciation_only' | 'market_only';
  };
}

export class FusionEngineV1Service {
  private config: FusionEngineConfig;

  constructor(config?: Partial<FusionEngineConfig>) {
    this.config = {
      depreciationWeight: config?.depreciationWeight ?? 0.5,
      marketWeight: config?.marketWeight ?? 0.5,
      autoWeightAdjustment: config?.autoWeightAdjustment ?? true,
      confidenceThreshold: config?.confidenceThreshold ?? 0.6,
      fallbackStrategy: config?.fallbackStrategy ?? 'depreciation_only'
    };
    
    // 确保权重总和为1
    this.normalizeWeights();
  }

  /**
   * 融合折旧价和市场参考价，输出最终估值
   */
  async calculateFusedValue(
    deviceProfile: DeviceProfile,
    condition?: DeviceCondition,
    marketPrice?: number
  ): Promise<FusionValuationResult> {
    try {
      // 1. 计算折旧基线估值
      const depreciationResult = await depreciationEngineService.calculateBaselineValue(
        deviceProfile,
        condition,
        marketPrice
      );
      
      // 2. 计算市场加权估值
      const marketResult = await marketWeightedEngineService.calculateMarketWeightedValue(
        deviceProfile,
        condition,
        marketPrice
      );
      
      // 3. 分析市场数据质量
      const qualityAnalysis = await marketWeightedEngineService.analyzeMarketDataQuality(
        deviceProfile.productModel
      );
      
      // 4. 确定融合策略和权重
      const { weights, strategy } = this.determineFusionStrategy(
        qualityAnalysis.confidence,
        qualityAnalysis.recommendedAction
      );
      
      // 5. 执行融合计算
      const fusedValue = this.fuseValues(
        depreciationResult.finalValue,
        marketResult.finalValue,
        weights
      );
      
      // 6. 构建融合结果
      const fusionResult: FusionValuationResult = {
        ...depreciationResult,
        finalValue: Number(fusedValue.toFixed(2)),
        fusionDetails: {
          depreciationValue: depreciationResult.finalValue,
          marketValue: marketResult.finalValue,
          weights: {
            depreciation: weights.depreciation,
            market: weights.market
          },
          confidence: qualityAnalysis.confidence,
          strategy
        }
      };
      
      return fusionResult;
      
    } catch (error) {
      console.error('融合引擎计算失败:', error);
      // 根据回退策略处理
      return this.handleFallback(deviceProfile, condition, marketPrice);
    }
  }

  /**
   * 确定融合策略和权重
   */
  private determineFusionStrategy(
    marketConfidence: number,
    recommendedAction: 'use_market' | 'fallback_to_baseline' | 'insufficient_data'
  ): {
    weights: { depreciation: number; market: number };
    strategy: 'fused' | 'depreciation_only' | 'market_only';
  } {
    // 自动权重调整
    if (this.config.autoWeightAdjustment) {
      if (recommendedAction === 'use_market' && marketConfidence >= this.config.confidenceThreshold) {
        // 高置信度市场数据：增加市场权重
        return {
          weights: { depreciation: 0.3, market: 0.7 },
          strategy: 'fused'
        };
      } else if (recommendedAction === 'fallback_to_baseline' || marketConfidence < 0.4) {
        // 低置信度：增加折旧权重
        return {
          weights: { depreciation: 0.8, market: 0.2 },
          strategy: 'fused'
        };
      }
    }
    
    // 使用配置的固定权重
    if (recommendedAction === 'insufficient_data') {
      // 数据不足时根据回退策略处理
      switch (this.config.fallbackStrategy) {
        case 'depreciation_only':
          return {
            weights: { depreciation: 1.0, market: 0 },
            strategy: 'depreciation_only'
          };
        case 'market_only':
          return {
            weights: { depreciation: 0, market: 1.0 },
            strategy: 'market_only'
          };
        case 'equal_weight':
        default:
          return {
            weights: { depreciation: 0.5, market: 0.5 },
            strategy: 'fused'
          };
      }
    }
    
    // 正常情况下使用配置权重
    return {
      weights: {
        depreciation: this.config.depreciationWeight,
        market: this.config.marketWeight
      },
      strategy: 'fused'
    };
  }

  /**
   * 执行价值融合计算
   */
  private fuseValues(
    depreciationValue: number,
    marketValue: number,
    weights: { depreciation: number; market: number }
  ): number {
    // 加权平均融合
    const fusedValue = (depreciationValue * weights.depreciation) + 
                       (marketValue * weights.market);
    
    // 确保融合值在合理范围内
    const minValue = Math.min(depreciationValue, marketValue) * 0.8;
    const maxValue = Math.max(depreciationValue, marketValue) * 1.2;
    
    return Math.max(minValue, Math.min(maxValue, fusedValue));
  }

  /**
   * 处理回退情况
   */
  private async handleFallback(
    deviceProfile: DeviceProfile,
    condition?: DeviceCondition,
    marketPrice?: number
  ): Promise<FusionValuationResult> {
    switch (this.config.fallbackStrategy) {
      case 'depreciation_only':
        const depResult = await depreciationEngineService.calculateBaselineValue(
          deviceProfile, condition, marketPrice
        );
        return {
          ...depResult,
          fusionDetails: {
            depreciationValue: depResult.finalValue,
            marketValue: depResult.finalValue,
            weights: { depreciation: 1.0, market: 0 },
            confidence: 0.5,
            strategy: 'depreciation_only'
          }
        };
        
      case 'market_only':
        const marketResult = await marketWeightedEngineService.calculateMarketWeightedValue(
          deviceProfile, condition, marketPrice
        );
        return {
          ...marketResult,
          fusionDetails: {
            depreciationValue: marketResult.finalValue,
            marketValue: marketResult.finalValue,
            weights: { depreciation: 0, market: 1.0 },
            confidence: 0.5,
            strategy: 'market_only'
          }
        };
        
      case 'equal_weight':
      default:
        // 使用相等权重的融合
        const depRes = await depreciationEngineService.calculateBaselineValue(
          deviceProfile, condition, marketPrice
        );
        const mktRes = await marketWeightedEngineService.calculateMarketWeightedValue(
          deviceProfile, condition, marketPrice
        );
        const equalFused = (depRes.finalValue + mktRes.finalValue) / 2;
        
        return {
          ...depRes,
          finalValue: Number(equalFused.toFixed(2)),
          fusionDetails: {
            depreciationValue: depRes.finalValue,
            marketValue: mktRes.finalValue,
            weights: { depreciation: 0.5, market: 0.5 },
            confidence: 0.3,
            strategy: 'fused'
          }
        };
    }
  }

  /**
   * 标准化权重确保总和为1
   */
  private normalizeWeights(): void {
    const total = this.config.depreciationWeight + this.config.marketWeight;
    if (total !== 1) {
      this.config.depreciationWeight = this.config.depreciationWeight / total;
      this.config.marketWeight = this.config.marketWeight / total;
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<FusionEngineConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.normalizeWeights();
    console.log('⚙️ 融合引擎配置已更新:', {
      depreciationWeight: this.config.depreciationWeight,
      marketWeight: this.config.marketWeight,
      autoWeightAdjustment: this.config.autoWeightAdjustment
    });
  }

  /**
   * 获取当前配置
   */
  getConfig(): FusionEngineConfig {
    return { ...this.config };
  }

  /**
   * 分析融合效果
   */
  async analyzeFusionEffect(
    deviceProfile: DeviceProfile,
    condition?: DeviceCondition,
    marketPrice?: number
  ): Promise<{
    individualValues: {
      depreciation: number;
      market: number;
    };
    fusedValue: number;
    variance: number;
    recommendation: string;
  }> {
    try {
      const depResult = await depreciationEngineService.calculateBaselineValue(
        deviceProfile, condition, marketPrice
      );
      
      const marketResult = await marketWeightedEngineService.calculateMarketWeightedValue(
        deviceProfile, condition, marketPrice
      );
      
      const fusedResult = await this.calculateFusedValue(deviceProfile, condition, marketPrice);
      
      const values = [
        depResult.finalValue,
        marketResult.finalValue,
        fusedResult.finalValue
      ];
      
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      
      let recommendation = '';
      if (variance < 100) {
        recommendation = '估值结果较为一致，融合效果良好';
      } else if (variance < 500) {
        recommendation = '估值存在一定差异，建议关注市场数据质量';
      } else {
        recommendation = '估值差异较大，建议人工复核';
      }
      
      return {
        individualValues: {
          depreciation: depResult.finalValue,
          market: marketResult.finalValue
        },
        fusedValue: fusedResult.finalValue,
        variance: Number(variance.toFixed(2)),
        recommendation
      };
      
    } catch (error) {
      throw new Error(`融合效果分析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 批量估值处理
   */
  async batchCalculateFusedValues(
    devices: Array<{ profile: DeviceProfile; condition?: DeviceCondition; marketPrice?: number }>
  ): Promise<Array<FusionValuationResult & { deviceId: string }>> {
    const results: Array<FusionValuationResult & { deviceId: string }> = [];
    
    for (const device of devices) {
      try {
        const result = await this.calculateFusedValue(
          device.profile,
          device.condition,
          device.marketPrice
        );
        
        results.push({
          ...result,
          deviceId: device.profile.id
        });
        
      } catch (error) {
        console.warn(`设备 ${device.profile.id} 估值失败:`, error);
        // 添加失败记录
        results.push({
          deviceId: device.profile.id,
          baseValue: 0,
          componentScore: 0,
          conditionMultiplier: 0,
          finalValue: 0,
          currency: 'CNY',
          breakdown: {
            originalPrice: 0,
            depreciation: 0,
            componentAdjustment: 0,
            conditionAdjustment: 0,
            brandAdjustment: 0,
            ageAdjustment: 0,
            repairAdjustment: 0
          },
          fusionDetails: {
            depreciationValue: 0,
            marketValue: 0,
            weights: { depreciation: 1, market: 0 },
            confidence: 0,
            strategy: 'depreciation_only'
          }
        } as any);
      }
    }
    
    return results;
  }
}

// 导出单例实例
export const fusionEngineV1Service = new FusionEngineV1Service();