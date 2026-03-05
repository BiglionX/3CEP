/**
 * V-ML-07: ML模型置信度评估服? * 计算和管理机器学习预测的置信? */

interface ConfidenceFactors {
  featureCompleteness: number; // 特征完整?(0-1)
  priceReasonableness: number; // 价格合理?(0-1)
  modelConfidence: number; // 模型自身置信?(0-1)
  marketDataQuality: number; // 市场数据质量 (0-1)
  historicalAccuracy: number; // 历史准确?(0-1)
}

interface PredictionResult {
  predictedPrice: number;
  confidence: number;
  confidenceFactors: ConfidenceFactors;
  confidenceLevel: 'high' | 'medium' | 'low';
  recommendations: string[];
}

class MLConfidenceService {
  private historicalAccuracy: number = 0.85; // 初始历史准确?  private accuracyWindow: Array<{ predicted: number; actual: number }> = [];
  private readonly MAX_HISTORY_SIZE = 1000;

  /**
   * 计算综合置信?   */
  calculateConfidence(
    predictedPrice: number,
    features: Record<string, any>,
    modelOutput?: any
  ): PredictionResult {
    // 计算各个置信因子
    const factors: ConfidenceFactors = {
      featureCompleteness: this.calculateFeatureCompleteness(features),
      priceReasonableness: this.calculatePriceReasonableness(
        predictedPrice,
        features
      ),
      modelConfidence: this.extractModelConfidence(modelOutput),
      marketDataQuality: this.calculateMarketDataQuality(features),
      historicalAccuracy: this.historicalAccuracy,
    };

    // 加权计算综合置信?    const confidence = this.calculateWeightedConfidence(factors);

    // 确定置信级别
    const confidenceLevel = this.determineConfidenceLevel(confidence);

    // 生成建议
    const recommendations = this.generateRecommendations(
      factors,
      confidenceLevel
    );

    return {
      predictedPrice,
      confidence,
      confidenceFactors: factors,
      confidenceLevel,
      recommendations,
    };
  }

  /**
   * 计算特征完整性置信因?   */
  private calculateFeatureCompleteness(features: Record<string, any>): number {
    const requiredFeatures = [
      'deviceAgeMonths',
      'brandEncoded',
      'storageGb',
      'ramGb',
      'screenConditionEncoded',
      'batteryHealthPercent',
      'appearanceGradeEncoded',
      'repairCount',
      'partReplacementCount',
      'transferCount',
    ];

    const availableFeatures = requiredFeatures.filter(
      feature => features[feature] !== undefined&& features[feature] !== null
    );

    const completeness = availableFeatures.length / requiredFeatures.length;

    // 对关键缺失特征进行惩?    if (features.batteryHealthPercent === undefined {
      return Math.max(0, completeness - 0.2);
    }

    if (features.screenConditionEncoded === undefined {
      return Math.max(0, completeness - 0.15);
    }

    return completeness;
  }

  /**
   * 计算价格合理性置信因?   */
  private calculatePriceReasonableness(
    price: number,
    features: Record<string, any>
  ): number {
    // 基于设备特征的价格范围判?    const basePrice = this.estimateBasePrice(features);
    const priceRatio = price / basePrice;

    // 价格偏离度评?    if (priceRatio < 0.1 || priceRatio > 5) {
      return 0.3; // 价格严重偏离预期
    } else if (priceRatio < 0.3 || priceRatio > 3) {
      return 0.6; // 价格中度偏离
    } else if (priceRatio < 0.5 || priceRatio > 2) {
      return 0.8; // 价格轻微偏离
    } else {
      return 0.95; // 价格合理
    }
  }

  /**
   * 估算基准价格
   */
  private estimateBasePrice(features: Record<string, any>): number {
    const brand = features.brandEncoded;
    const age = features.deviceAgeMonths || 24;
    const storage = features.storageGb || 128;

    // 基础价格映射（简化版本）
    let basePrice = 3000;

    // 品牌调整
    switch (brand) {
      case 0:
        basePrice = 5000;
        break; // Apple
      case 1:
        basePrice = 4000;
        break; // Samsung
      case 2:
        basePrice = 3000;
        break; // Huawei
      default:
        basePrice = 2500;
    }

    // 年龄折旧（线性折旧）
    const depreciationRate = 0.02; // 每月2%折旧
    basePrice *= Math.max(0.1, 1 - age * depreciationRate);

    // 存储容量调整
    if (storage >= 256) basePrice *= 1.3;
    else if (storage >= 128) basePrice *= 1.0;
    else basePrice *= 0.8;

    return Math.max(100, basePrice);
  }

  /**
   * 提取模型自身置信?   */
  private extractModelConfidence(modelOutput: any): number {
    if (!modelOutput) return 0.7; // 默认置信?
    // 如果模型提供了标准差或预测区?    if (modelOutput.stdDev) {
      // 基于标准差计算置信度（简化）
      const coefficientOfVariation =
        modelOutput.stdDev / modelOutput.predictedPrice;
      return Math.max(0.1, 1 - coefficientOfVariation);
    }

    // 如果模型提供了分位数
    if (modelOutput.quantiles) {
      const intervalWidth =
        modelOutput.quantiles.q90 - modelOutput.quantiles.q10;
      const relativeWidth = intervalWidth / modelOutput.predictedPrice;
      return Math.max(0.1, 1 - relativeWidth);
    }

    return 0.7; // 默认?  }

  /**
   * 计算市场数据质量置信因子
   */
  private calculateMarketDataQuality(features: Record<string, any>): number {
    const marketSampleCount = features.marketSampleCount || 0;
    const marketFreshness = features.marketFreshnessScore || 0.5;

    // 样本量评?    let sampleScore = 0;
    if (marketSampleCount >= 50) sampleScore = 1.0;
    else if (marketSampleCount >= 20) sampleScore = 0.8;
    else if (marketSampleCount >= 10) sampleScore = 0.6;
    else if (marketSampleCount >= 5) sampleScore = 0.4;
    else sampleScore = 0.2;

    // 新鲜度评?    const freshnessScore = marketFreshness;

    // 综合评分
    return sampleScore * 0.6 + freshnessScore * 0.4;
  }

  /**
   * 加权计算综合置信?   */
  private calculateWeightedConfidence(factors: ConfidenceFactors): number {
    return (
      factors.featureCompleteness * 0.25 +
      factors.priceReasonableness * 0.25 +
      factors.modelConfidence * 0.2 +
      factors.marketDataQuality * 0.2 +
      factors.historicalAccuracy * 0.1
    );
  }

  /**
   * 确定置信级别
   */
  private determineConfidenceLevel(
    confidence: number
  ): 'high' | 'medium' | 'low' {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  }

  /**
   * 生成建议
   */
  private generateRecommendations(
    factors: ConfidenceFactors,
    confidenceLevel: 'high' | 'medium' | 'low'
  ): string[] {
    const recommendations: string[] = [];

    // 基于置信级别的通用建议
    switch (confidenceLevel) {
      case 'high':
        recommendations.push('预测结果可信度高，可直接使用');
        break;
      case 'medium':
        recommendations.push('建议结合人工审核');
        recommendations.push('考虑获取更多设备信息');
        break;
      case 'low':
        recommendations.push('预测结果可信度较?);
        recommendations.push('强烈建议人工审核');
        recommendations.push('建议补充电池健康度等关键信息');
        break;
    }

    // 基于具体因子的针对性建?    if (factors.featureCompleteness < 0.7) {
      recommendations.push('设备信息不完整，建议补充缺失特征');
    }

    if (factors.priceReasonableness < 0.6) {
      recommendations.push('预测价格偏离正常范围，建议复?);
    }

    if (factors.marketDataQuality < 0.5) {
      recommendations.push('市场数据质量较低，建议更新市场参考价');
    }

    return recommendations;
  }

  /**
   * 更新历史准确?   */
  updateHistoricalAccuracy(predictedPrice: number, actualPrice: number): void {
    // 添加到历史记?    this.accuracyWindow.push({
      predicted: predictedPrice,
      actual: actualPrice,
    });

    // 保持窗口大小
    if (this.accuracyWindow.length > this.MAX_HISTORY_SIZE) {
      this.accuracyWindow.shift();
    }

    // 计算新的历史准确?    if (this.accuracyWindow.length >= 10) {
      const recentRecords = this.accuracyWindow.slice(-50); // 最?0条记?      const accuracies = recentRecords.map(record => {
        const error =
          Math.abs(record.predicted - record.actual) / record.actual;
        return Math.max(0, 1 - error); // 误差越小，准确率越高
      });

      this.historicalAccuracy =
        accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    }
  }

  /**
   * 获取置信度统计信?   */
  getConfidenceStats(): {
    currentAccuracy: number;
    sampleSize: number;
    averageConfidence: number;
  } {
    return {
      currentAccuracy: this.historicalAccuracy,
      sampleSize: this.accuracyWindow.length,
      averageConfidence:
        this.accuracyWindow.length > 0
          ? this.accuracyWindow.reduce((sum, record) => {
              const error =
                Math.abs(record.predicted - record.actual) / record.actual;
              return sum + Math.max(0, 1 - error);
            }, 0) / this.accuracyWindow.length
          : 0,
    };
  }
}

// 导出服务实例
const mlConfidenceService = new MLConfidenceService();

export { MLConfidenceService, mlConfidenceService };
export default mlConfidenceService;
