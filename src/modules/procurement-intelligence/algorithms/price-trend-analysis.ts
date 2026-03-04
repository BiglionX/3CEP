/**
 * 价格趋势分析算法
 * 用于分析和预测商品价格走? */

export interface PriceDataPoint {
  timestamp: number; // 时间?  price: number; // 价格
  currency: string; // 货币单位
  region: string; // 地区
  volume?: number; // 交易?  qualityGrade?: string; // 质量等级
}

export interface PriceAnalysisInput {
  commodity: string; // 商品名称
  historicalPrices: PriceDataPoint[];
  analysisPeriod: 'short' | 'medium' | 'long'; // 分析周期
  forecastHorizon: number; // 预测期数
}

export interface TrendAnalysis {
  trend: 'upward' | 'downward' | 'stable' | 'volatile';
  strength: number; // 趋势强度 (0-100)
  slope: number; // 斜率
  volatility: number; // 波动?  seasonality?: {
    period: number;
    amplitude: number;
  };
}

export interface PriceForecast {
  predictedPrice: number;
  confidenceInterval: [number, number]; // 置信区间
  probability: number; // 预测概率
  trendDirection: 'increase' | 'decrease' | 'stable';
}

export interface PriceAnalysisOutput {
  currentPrice: number;
  trendAnalysis: TrendAnalysis;
  forecasts: PriceForecast[];
  marketSignals: {
    supportLevel: number;
    resistanceLevel: number;
    movingAverage: number;
    rsi: number; // 相对强弱指数
  };
  riskAssessment: {
    priceRisk: 'low' | 'medium' | 'high';
    volatilityRisk: 'low' | 'medium' | 'high';
    recommendation: 'buy' | 'hold' | 'sell' | 'wait';
  };
  analysisSummary: string[];
}

export class PriceTrendAnalyzer {
  private readonly MIN_DATA_POINTS = 10;
  private readonly RSI_PERIOD = 14;
  private readonly MOVING_AVERAGE_PERIOD = 20;

  /**
   * 分析价格趋势
   */
  analyzePriceTrend(input: PriceAnalysisInput): PriceAnalysisOutput {
    // 1. 数据预处理和验证
    const validatedData = this.validateAndSortData(input.historicalPrices);

    if (validatedData.length < this.MIN_DATA_POINTS) {
      throw new Error(`数据点不足，至少需?{this.MIN_DATA_POINTS}个数据点`);
    }

    // 2. 计算基本统计指标
    const currentPrice = validatedData[validatedData.length - 1].price;
    const movingAverage = this.calculateMovingAverage(validatedData);
    const rsi = this.calculateRSI(validatedData);

    // 3. 趋势分析
    const trendAnalysis = this.performTrendAnalysis(validatedData);

    // 4. 支撑阻力位分?    const marketSignals = this.analyzeMarketSignals(
      validatedData,
      movingAverage,
      rsi
    );

    // 5. 价格预测
    const forecasts = this.forecastPrices(validatedData, input.forecastHorizon);

    // 6. 风险评估
    const riskAssessment = this.assessPriceRisk(trendAnalysis, marketSignals);

    // 7. 生成分析总结
    const analysisSummary = this.generateAnalysisSummary(
      trendAnalysis,
      marketSignals,
      riskAssessment,
      forecasts
    );

    return {
      currentPrice,
      trendAnalysis,
      forecasts,
      marketSignals,
      riskAssessment,
      analysisSummary,
    };
  }

  /**
   * 数据验证和排?   */
  private validateAndSortData(data: PriceDataPoint[]): PriceDataPoint[] {
    // 按时间排?    const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);

    // 验证数据有效?    for (const point of sortedData) {
      if (point.price <= 0) {
        throw new Error('价格数据必须大于0');
      }
      if (!point.currency) {
        throw new Error('货币单位不能为空');
      }
    }

    return sortedData;
  }

  /**
   * 计算移动平均?   */
  private calculateMovingAverage(data: PriceDataPoint[]): number {
    const recentData = data.slice(-this.MOVING_AVERAGE_PERIOD);
    const sum = recentData.reduce((acc, point) => acc + point.price, 0);
    return sum / recentData.length;
  }

  /**
   * 计算相对强弱指数(RSI)
   */
  private calculateRSI(data: PriceDataPoint[]): number {
    if (data.length < this.RSI_PERIOD + 1) {
      return 50; // 默认?    }

    const recentData = data.slice(-this.RSI_PERIOD - 1);
    const priceChanges: number[] = [];

    // 计算价格变化
    for (let i = 1; i < recentData.length; i++) {
      priceChanges.push(recentData[i].price - recentData[i - 1].price);
    }

    // 分离上涨和下?    const gains = priceChanges.map(change => Math.max(0, change));
    const losses = priceChanges.map(change => Math.abs(Math.min(0, change)));

    // 计算平均上涨和下?    const avgGain = gains.reduce((sum, gain) => sum + gain, 0) / gains.length;
    const avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / losses.length;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  /**
   * 执行趋势分析
   */
  private performTrendAnalysis(data: PriceDataPoint[]): TrendAnalysis {
    const prices = data.map(point => point.price);
    const timestamps = data.map(point => point.timestamp);

    // 线性回归计算斜?    const slope = this.calculateLinearRegressionSlope(timestamps, prices);

    // 计算波动?    const volatility = this.calculateVolatility(prices);

    // 确定趋势方向
    let trend: TrendAnalysis['trend'];
    if (Math.abs(slope) < 0.001) {
      trend = 'stable';
    } else if (slope > 0) {
      trend = volatility > 0.1 ? 'volatile' : 'upward';
    } else {
      trend = volatility > 0.1 ? 'volatile' : 'downward';
    }

    // 计算趋势强度
    const strength = this.calculateTrendStrength(slope, volatility);

    return {
      trend,
      strength,
      slope,
      volatility,
    };
  }

  /**
   * 计算线性回归斜?   */
  private calculateLinearRegressionSlope(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = n * sumXX - sumX * sumX;

    return denominator !== 0 ? numerator / denominator : 0;
  }

  /**
   * 计算波动?   */
  private calculateVolatility(prices: number[]): number {
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const squaredDeviations = prices.map(price => Math.pow(price - mean, 2));
    const variance =
      squaredDeviations.reduce((sum, dev) => sum + dev, 0) / prices.length;
    return Math.sqrt(variance) / mean; // 标准化波动率
  }

  /**
   * 计算趋势强度
   */
  private calculateTrendStrength(slope: number, volatility: number): number {
    const normalizedSlope = Math.abs(slope) * 1000; // 标准化斜?    const inverseVolatility = 1 / (1 + volatility); // 波动率越低强度越?
    const strength = Math.min(100, normalizedSlope * inverseVolatility * 50);
    return parseFloat(strength.toFixed(2));
  }

  /**
   * 分析市场信号
   */
  private analyzeMarketSignals(
    data: PriceDataPoint[],
    movingAverage: number,
    rsi: number
  ) {
    const prices = data.map(point => point.price);
    const currentPrice = prices[prices.length - 1];

    // 计算支撑位和阻力?    const supportLevel = this.calculateSupportLevel(prices);
    const resistanceLevel = this.calculateResistanceLevel(prices);

    return {
      supportLevel,
      resistanceLevel,
      movingAverage,
      rsi: parseFloat(rsi.toFixed(2)),
    };
  }

  /**
   * 计算支撑?   */
  private calculateSupportLevel(prices: number[]): number {
    const recentPrices = prices.slice(-30); // 最?0个数据点
    return Math.min(...recentPrices);
  }

  /**
   * 计算阻力?   */
  private calculateResistanceLevel(prices: number[]): number {
    const recentPrices = prices.slice(-30); // 最?0个数据点
    return Math.max(...recentPrices);
  }

  /**
   * 价格预测
   */
  private forecastPrices(
    data: PriceDataPoint[],
    horizon: number
  ): PriceForecast[] {
    const forecasts: PriceForecast[] = [];
    const prices = data.map(point => point.price);
    const currentPrice = prices[prices.length - 1];

    // 简单的线性预?    const trendAnalysis = this.performTrendAnalysis(data);
    const baseTrend = trendAnalysis.slope;

    for (let i = 1; i <= horizon; i++) {
      const predictedChange = baseTrend * i * currentPrice;
      const predictedPrice = currentPrice + predictedChange;

      // 计算置信区间
      const volatility = trendAnalysis.volatility;
      const confidenceRange = predictedPrice * volatility * 0.5;
      const lowerBound = Math.max(0, predictedPrice - confidenceRange);
      const upperBound = predictedPrice + confidenceRange;

      // 确定趋势方向
      const trendDirection: PriceForecast['trendDirection'] =
        predictedChange > 0
          ? 'increase'
          : predictedChange < 0
            ? 'decrease'
            : 'stable';

      forecasts.push({
        predictedPrice: parseFloat(predictedPrice.toFixed(2)),
        confidenceInterval: [
          parseFloat(lowerBound.toFixed(2)),
          parseFloat(upperBound.toFixed(2)),
        ],
        probability: parseFloat((0.8 - volatility * 0.3).toFixed(2)),
        trendDirection,
      });
    }

    return forecasts;
  }

  /**
   * 价格风险评估
   */
  private assessPriceRisk(
    trendAnalysis: TrendAnalysis,
    marketSignals: PriceAnalysisOutput['marketSignals']
  ) {
    // 价格风险评估
    let priceRisk: 'low' | 'medium' | 'high' = 'low';
    if (trendAnalysis.volatility > 0.2) {
      priceRisk = 'high';
    } else if (trendAnalysis.volatility > 0.1) {
      priceRisk = 'medium';
    }

    // 波动率风险评?    let volatilityRisk: 'low' | 'medium' | 'high' = 'low';
    if (marketSignals.rsi > 70 || marketSignals.rsi < 30) {
      volatilityRisk = 'high';
    } else if (marketSignals.rsi > 60 || marketSignals.rsi < 40) {
      volatilityRisk = 'medium';
    }

    // 投资建议
    let recommendation: 'buy' | 'hold' | 'sell' | 'wait' = 'hold';
    if (trendAnalysis.trend === 'upward' && marketSignals.rsi < 70) {
      recommendation = 'buy';
    } else if (trendAnalysis.trend === 'downward' && marketSignals.rsi > 30) {
      recommendation = 'sell';
    } else if (volatilityRisk === 'high') {
      recommendation = 'wait';
    }

    return {
      priceRisk,
      volatilityRisk,
      recommendation,
    };
  }

  /**
   * 生成分析总结
   */
  private generateAnalysisSummary(
    trendAnalysis: TrendAnalysis,
    marketSignals: PriceAnalysisOutput['marketSignals'],
    riskAssessment: PriceAnalysisOutput['riskAssessment'],
    forecasts: PriceForecast[]
  ): string[] {
    const summary: string[] = [];

    // 趋势分析总结
    summary.push(
      `当前价格趋势?{trendAnalysis.trend}，强?{trendAnalysis.strength}%`
    );

    if (trendAnalysis.volatility > 0.15) {
      summary.push('市场波动较大，建议谨慎操?);
    }

    // 技术指标分?    if (marketSignals.rsi > 70) {
      summary.push('RSI指标显示超买状?);
    } else if (marketSignals.rsi < 30) {
      summary.push('RSI指标显示超卖状?);
    }

    // 风险提示
    if (riskAssessment.priceRisk === 'high') {
      summary.push('价格风险较高，建议分散投?);
    }

    // 预测展望
    if (forecasts.length > 0) {
      const firstForecast = forecasts[0];
      summary.push(
        `短期价格预测: ${firstForecast.predictedPrice} (${firstForecast.trendDirection})`
      );
    }

    return summary;
  }

  /**
   * 批量分析多个商品
   */
  batchAnalyze(inputs: PriceAnalysisInput[]): PriceAnalysisOutput[] {
    return inputs.map(input => this.analyzePriceTrend(input));
  }
}

// 导出默认实例
export const priceTrendAnalyzer = new PriceTrendAnalyzer();

// 使用示例
/*
const sampleData: PriceDataPoint[] = [
  { timestamp: Date.now() - 86400000 * 30, price: 100, currency: 'USD', region: 'US' },
  { timestamp: Date.now() - 86400000 * 25, price: 102, currency: 'USD', region: 'US' },
  { timestamp: Date.now() - 86400000 * 20, price: 98, currency: 'USD', region: 'US' },
  { timestamp: Date.now() - 86400000 * 15, price: 105, currency: 'USD', region: 'US' },
  { timestamp: Date.now() - 86400000 * 10, price: 108, currency: 'USD', region: 'US' },
  { timestamp: Date.now() - 86400000 * 5, price: 110, currency: 'USD', region: 'US' },
  { timestamp: Date.now(), price: 112, currency: 'USD', region: 'US' }
]

const input: PriceAnalysisInput = {
  commodity: 'Steel',
  historicalPrices: sampleData,
  analysisPeriod: 'medium',
  forecastHorizon: 5
}

const result = priceTrendAnalyzer.analyzePriceTrend(input)
// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(result)*/
