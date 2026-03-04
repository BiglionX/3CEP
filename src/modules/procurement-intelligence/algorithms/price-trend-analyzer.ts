import { createClient } from '@supabase/supabase-js';

// 初始?Supabase 客户?const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PricePoint {
  date: string;
  price: number;
  volume?: number;
  source?: string;
  confidence?: number;
}

interface TrendAnalysis {
  trend: 'upward' | 'downward' | 'stable' | 'volatile';
  strength: number; // 0-100
  slope: number; // 斜率
  r_squared: number; // 决定系数
  volatility: number; // 波动?  prediction_interval?: {
    lower: number;
    upper: number;
  };
}

interface SeasonalPattern {
  seasonality_detected: boolean;
  seasonal_period: number;
  seasonal_strength: number;
  seasonal_components: Array<{
    period: string;
    amplitude: number;
    phase: number;
  }>;
}

interface ForecastResult {
  dates: string[];
  predicted_prices: number[];
  confidence_intervals: Array<{
    lower: number;
    upper: number;
    confidence: number;
  }>;
  trend_analysis: TrendAnalysis;
  seasonal_pattern: SeasonalPattern;
  accuracy_metrics: {
    mae: number; // 平均绝对误差
    rmse: number; // 均方根误?    mape: number; // 平均绝对百分比误?  };
}

interface AnalysisConfig {
  window_size: number; // 分析窗口大小（天数）
  forecast_horizon: number; // 预测天数
  confidence_level: number; // 置信水平 0-1
  algorithm: 'linear_regression' | 'arima' | 'exponential_smoothing' | 'lstm';
  include_seasonality: boolean;
  outlier_detection: boolean;
}

export class PriceTrendAnalyzer {
  private config: AnalysisConfig;

  constructor(config?: Partial<AnalysisConfig>) {
    this.config = {
      window_size: 90, // 默认90�?      forecast_horizon: 30, // 默认预测30�?      confidence_level: 0.95,
      algorithm: 'linear_regression',
      include_seasonality: true,
      outlier_detection: true,
      ...config,
    };
  }

  /**
   * 分析价格趋势
   */
  async analyzePriceTrend(
    commodityId: string,
    historicalData?: PricePoint[]
  ): Promise<{
    commodity_id: string;
    analysis_period: { start: string; end: string };
    current_price: number;
    trend_analysis: TrendAnalysis;
    forecast: ForecastResult;
    risk_indicators: {
      price_volatility: number;
      trend_strength: number;
      prediction_uncertainty: number;
      market_risk_level: 'low' | 'medium' | 'high';
    };
    recommendations: string[];
    generated_at: string;
  }> {
    try {
      // 1. 获取历史价格数据
      const priceData =
        historicalData || (await this.fetchHistoricalPrices(commodityId));

      if (priceData.length < 10) {
        throw new Error('历史数据不足，至少需?0个数据点');
      }

      // 2. 数据预处?      const processedData = this.preprocessData(priceData);

      // 3. 异常值检测和处理
      const cleanedData = this.config.outlier_detection
        ? this.detectAndRemoveOutliers(processedData)
        : processedData;

      // 4. 趋势分析
      const trendAnalysis = this.analyzeTrend(cleanedData);

      // 5. 季节性分?      const seasonalPattern = this.config.include_seasonality
        ? this.analyzeSeasonality(cleanedData)
        : {
            seasonality_detected: false,
            seasonal_period: 0,
            seasonal_strength: 0,
            seasonal_components: [],
          };

      // 6. 价格预测
      const forecast = await this.forecastPrices(
        cleanedData,
        trendAnalysis,
        seasonalPattern
      );

      // 7. 风险评估
      const riskIndicators = this.assessPriceRisk(
        trendAnalysis,
        forecast,
        cleanedData
      );

      // 8. 生成建议
      const recommendations = this.generateRecommendations(
        trendAnalysis,
        riskIndicators,
        forecast
      );

      return {
        commodity_id: commodityId,
        analysis_period: {
          start: cleanedData[0].date,
          end: cleanedData[cleanedData.length - 1].date,
        },
        current_price: cleanedData[cleanedData.length - 1].price,
        trend_analysis: trendAnalysis,
        forecast,
        risk_indicators: riskIndicators,
        recommendations,
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('价格趋势分析失败:', error);
      throw error;
    }
  }

  /**
   * 获取历史价格数据
   */
  private async fetchHistoricalPrices(
    commodityId: string
  ): Promise<PricePoint[]> {
    const { data, error } = await supabase
      .from('international_price_indices')
      .select('price, recorded_at, confidence_level, source')
      .eq('commodity_id', commodityId)
      .order('recorded_at', { ascending: true })
      .limit(this.config.window_size);

    if (error) {
      throw new Error(`获取历史价格数据失败: ${error.message}`);
    }

    return data.map(item => ({
      date: item.recorded_at,
      price: item.price,
      confidence: item.confidence_level,
      source: item.source,
    }));
  }

  /**
   * 数据预处?   */
  private preprocessData(rawData: PricePoint[]): PricePoint[] {
    // 1. 按日期排?    const sortedData = [...rawData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 2. 填充缺失日期
    const filledData = this.fillMissingDates(sortedData);

    // 3. 移除重复数据
    const deduplicatedData = this.removeDuplicates(filledData);

    // 4. 数据平滑（移动平均）
    return this.smoothData(deduplicatedData);
  }

  /**
   * 填充缺失日期
   */
  private fillMissingDates(data: PricePoint[]): PricePoint[] {
    if (data.length < 2) return data;

    const filledData: PricePoint[] = [];
    const startDate = new Date(data[0].date);
    const endDate = new Date(data[data.length - 1].date);

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateString = d.toISOString().split('T')[0];
      const existingPoint = data.find(point =>
        point.date.startsWith(dateString)
      );

      if (existingPoint) {
        filledData.push(existingPoint);
      } else {
        // 线性插值填充缺失?        const prevPoint = filledData[filledData.length - 1];
        if (prevPoint) {
          filledData.push({
            date: dateString,
            price: prevPoint.price,
            confidence: prevPoint.confidence ? prevPoint.confidence * 0.8 : 0.5,
          });
        }
      }
    }

    return filledData;
  }

  /**
   * 移除重复数据
   */
  private removeDuplicates(data: PricePoint[]): PricePoint[] {
    const seen = new Set<string>();
    return data.filter(point => {
      const key = `${point.date}_${point.price}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * 数据平滑
   */
  private smoothData(data: PricePoint[], windowSize: number = 3): PricePoint[] {
    if (data.length < windowSize) return data;

    return data.map((point, index) => {
      if (index < windowSize - 1 || index > data.length - windowSize) {
        return point;
      }

      // 计算移动平均
      const window = data.slice(
        index - Math.floor(windowSize / 2),
        index + Math.ceil(windowSize / 2)
      );
      const avgPrice =
        window.reduce((sum, p) => sum + p.price, 0) / window.length;

      return {
        ...point,
        price: avgPrice,
      };
    });
  }

  /**
   * 异常值检?   */
  private detectAndRemoveOutliers(data: PricePoint[]): PricePoint[] {
    if (data.length < 4) return data;

    // 使用IQR方法检测异常?    const prices = data.map(d => d.price).sort((a, b) => a - b);
    const q1 = this.percentile(prices, 25);
    const q3 = this.percentile(prices, 75);
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return data.filter(
      point => point.price >= lowerBound && point.price <= upperBound
    );
  }

  /**
   * 计算百分位数
   */
  private percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) return sorted[lower];

    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  /**
   * 趋势分析
   */
  private analyzeTrend(data: PricePoint[]): TrendAnalysis {
    const prices = data.map(d => d.price);
    const dates = data.map(d => new Date(d.date).getTime());

    // 线性回归分?    const { slope, intercept, rSquared } = this.linearRegression(dates, prices);

    // 计算波动?    const volatility = this.calculateVolatility(prices);

    // 判断趋势方向
    let trend: 'upward' | 'downward' | 'stable' | 'volatile' = 'stable';
    const trendThreshold = 0.02; // 2% 的变化阈?
    if (Math.abs(slope) > trendThreshold) {
      trend = slope > 0 ? 'upward' : 'downward';
    }

    if (volatility > 0.15) {
      // 高波?      trend = 'volatile';
    }

    // 趋势强度计算
    const strength = Math.min(
      100,
      Math.abs(slope) * 1000 + (1 - volatility) * 50
    );

    return {
      trend,
      strength,
      slope,
      r_squared: rSquared,
      volatility,
      prediction_interval: this.calculatePredictionInterval(
        prices,
        slope,
        intercept
      ),
    };
  }

  /**
   * 线性回?   */
  private linearRegression(
    x: number[],
    y: number[]
  ): { slope: number; intercept: number; rSquared: number } {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // 计算决定系数 R²
    const yMean = sumY / n;
    const totalSumSquares = sumYY - n * yMean * yMean;
    const residualSumSquares = y.reduce((sum, yi, i) => {
      const predicted = slope * x[i] + intercept;
      return sum + (yi - predicted) ** 2;
    }, 0);

    const rSquared = 1 - residualSumSquares / totalSumSquares;

    return { slope, intercept, rSquared };
  }

  /**
   * 计算波动?   */
  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;

    // 计算收益?    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    // 计算标准?    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance =
      returns.reduce((sum, r) => sum + (r - meanReturn) ** 2, 0) /
      (returns.length - 1);

    return Math.sqrt(variance);
  }

  /**
   * 计算预测区间
   */
  private calculatePredictionInterval(
    prices: number[],
    slope: number,
    intercept: number
  ): { lower: number; upper: number } {
    const n = prices.length;
    const xMean = (n - 1) / 2; // 简化的x均?
    // 计算标准误差
    const residuals = prices.map((price, i) => {
      const predicted = slope * i + intercept;
      return price - predicted;
    });

    const mse = residuals.reduce((sum, r) => sum + r * r, 0) / (n - 2);
    const standardError = Math.sqrt(mse);

    // 95% 置信区间
    const tValue = 1.96; // 近似?    const marginOfError = tValue * standardError;

    const lastPrice = prices[prices.length - 1];

    return {
      lower: lastPrice - marginOfError,
      upper: lastPrice + marginOfError,
    };
  }

  /**
   * 季节性分?   */
  private analyzeSeasonality(data: PricePoint[]): SeasonalPattern {
    if (data.length < 30) {
      return {
        seasonality_detected: false,
        seasonal_period: 0,
        seasonal_strength: 0,
        seasonal_components: [],
      };
    }

    const prices = data.map(d => d.price);

    // 简单的季节性检?- 检查是否存在周期性模?    const periods = [7, 30]; // 周期：周、月
    let bestPeriod = 0;
    let bestStrength = 0;
    let bestComponents: any[] = [];

    for (const period of periods) {
      if (data.length < period * 2) continue;

      const strength = this.calculateSeasonalStrength(prices, period);
      if (strength > bestStrength) {
        bestPeriod = period;
        bestStrength = strength;
        bestComponents = this.extractSeasonalComponents(prices, period);
      }
    }

    return {
      seasonality_detected: bestStrength > 0.3,
      seasonal_period: bestPeriod,
      seasonal_strength: bestStrength,
      seasonal_components: bestComponents,
    };
  }

  /**
   * 计算季节性强?   */
  private calculateSeasonalStrength(prices: number[], period: number): number {
    if (prices.length < period * 2) return 0;

    // 计算每个周期的相关?    const correlations: number[] = [];

    for (
      let lag = period;
      lag < Math.min(period * 3, prices.length - period);
      lag += period
    ) {
      const correlation = this.autocorrelation(prices, lag);
      correlations.push(Math.abs(correlation));
    }

    return correlations.length > 0
      ? correlations.reduce((sum, c) => sum + c, 0) / correlations.length
      : 0;
  }

  /**
   * 自相关函?   */
  private autocorrelation(prices: number[], lag: number): number {
    const n = prices.length;
    if (lag >= n) return 0;

    const mean = prices.reduce((sum, p) => sum + p, 0) / n;

    let numerator = 0;
    let denominator1 = 0;
    let denominator2 = 0;

    for (let i = 0; i < n - lag; i++) {
      const diff1 = prices[i] - mean;
      const diff2 = prices[i + lag] - mean;
      numerator += diff1 * diff2;
      denominator1 += diff1 * diff1;
      denominator2 += diff2 * diff2;
    }

    return denominator1 * denominator2 !== 0
      ? numerator / Math.sqrt(denominator1 * denominator2)
      : 0;
  }

  /**
   * 提取季节性成?   */
  private extractSeasonalComponents(prices: number[], period: number): any[] {
    const components: any[] = [];

    // 计算每个季节的平均?    for (let i = 0; i < period; i++) {
      const seasonValues = [];
      for (let j = i; j < prices.length; j += period) {
        seasonValues.push(prices[j]);
      }

      if (seasonValues.length > 0) {
        const mean =
          seasonValues.reduce((sum, val) => sum + val, 0) / seasonValues.length;
        const amplitude = Math.max(...seasonValues) - Math.min(...seasonValues);

        components.push({
          period: `period_${i + 1}`,
          amplitude: amplitude,
          phase: i,
        });
      }
    }

    return components;
  }

  /**
   * 价格预测
   */
  private async forecastPrices(
    data: PricePoint[],
    trendAnalysis: TrendAnalysis,
    seasonalPattern: SeasonalPattern
  ): Promise<ForecastResult> {
    const prices = data.map(d => d.price);
    const lastDate = new Date(data[data.length - 1].date);

    // 生成未来日期
    const futureDates: string[] = [];
    for (let i = 1; i <= this.config.forecast_horizon; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setDate(futureDate.getDate() + i);
      futureDates.push(futureDate.toISOString().split('T')[0]);
    }

    // 基于趋势的预?    const trendForecast = this.forecastBasedOnTrend(
      prices,
      trendAnalysis,
      this.config.forecast_horizon
    );

    // 结合季节性的预测
    let finalForecast = trendForecast;
    if (
      seasonalPattern.seasonality_detected &&
      seasonalPattern.seasonal_components.length > 0
    ) {
      finalForecast = this.adjustForSeasonality(finalForecast, seasonalPattern);
    }

    // 计算置信区间
    const confidenceIntervals = this.calculateConfidenceIntervals(
      prices,
      finalForecast,
      this.config.confidence_level
    );

    // 计算准确性指标（使用历史数据验证?    const accuracyMetrics = await this.calculateAccuracyMetrics(
      data,
      trendAnalysis
    );

    return {
      dates: futureDates,
      predicted_prices: finalForecast,
      confidence_intervals: confidenceIntervals,
      trend_analysis: trendAnalysis,
      seasonal_pattern: seasonalPattern,
      accuracy_metrics: accuracyMetrics,
    };
  }

  /**
   * 基于趋势的预?   */
  private forecastBasedOnTrend(
    prices: number[],
    trendAnalysis: TrendAnalysis,
    horizon: number
  ): number[] {
    const lastPrice = prices[prices.length - 1];
    const forecasts: number[] = [];

    for (let i = 1; i <= horizon; i++) {
      // 线性趋势预?      const predictedPrice = lastPrice + trendAnalysis.slope * i;
      forecasts.push(predictedPrice);
    }

    return forecasts;
  }

  /**
   * 考虑季节性调?   */
  private adjustForSeasonality(
    forecasts: number[],
    seasonalPattern: SeasonalPattern
  ): number[] {
    if (!seasonalPattern.seasonality_detected) return forecasts;

    const period = seasonalPattern.seasonal_period;
    const components = seasonalPattern.seasonal_components;

    return forecasts.map((price, index) => {
      const seasonalIndex = index % period;
      const component = components[seasonalIndex % components.length];

      if (component) {
        // 简单的季节性调?        const adjustment = component.amplitude * 0.1; // 10% 的季节性影?        return price * (1 + Math.sin(component.phase) * adjustment);
      }

      return price;
    });
  }

  /**
   * 计算置信区间
   */
  private calculateConfidenceIntervals(
    historicalPrices: number[],
    forecasts: number[],
    confidenceLevel: number
  ): Array<{ lower: number; upper: number; confidence: number }> {
    // 计算历史残差的标准差
    const residuals = [];
    const historicalLength = Math.min(
      historicalPrices.length,
      forecasts.length
    );

    for (let i = 0; i < historicalLength; i++) {
      residuals.push(
        historicalPrices[historicalPrices.length - historicalLength + i] -
          forecasts[i]
      );
    }

    const residualStd = Math.sqrt(
      residuals.reduce((sum, r) => sum + r * r, 0) / (residuals.length - 1)
    );

    // 计算置信区间（简化版?    const zScore = this.getZScore(confidenceLevel);

    return forecasts.map((forecast, index) => {
      const marginOfError = zScore * residualStd * Math.sqrt(1 + index * 0.1); // 递增不确定?
      return {
        lower: Math.max(0, forecast - marginOfError),
        upper: forecast + marginOfError,
        confidence: confidenceLevel,
      };
    });
  }

  /**
   * 获取Z分数
   */
  private getZScore(confidenceLevel: number): number {
    const zScores: Record<number, number> = {
      0.9: 1.645,
      0.95: 1.96,
      0.99: 2.576,
    };
    return zScores[confidenceLevel] || 1.96;
  }

  /**
   * 计算准确性指?   */
  private async calculateAccuracyMetrics(
    data: PricePoint[],
    trendAnalysis: TrendAnalysis
  ): Promise<{ mae: number; rmse: number; mape: number }> {
    if (data.length < 10) {
      return { mae: 0, rmse: 0, mape: 0 };
    }

    // 使用最?0%的数据作为测试集
    const testSize = Math.floor(data.length * 0.3);
    const testData = data.slice(-testSize);
    const trainData = data.slice(0, -testSize);

    // 重新训练模型
    const trainPrices = trainData.map(d => d.price);
    const trainDates = trainData.map(d => new Date(d.date).getTime());
    const { slope, intercept } = this.linearRegression(trainDates, trainPrices);

    // 预测测试数据
    const predictions: number[] = [];
    testData.forEach((point, index) => {
      const daysFromStart = trainData.length + index;
      predictions.push(slope * daysFromStart + intercept);
    });

    // 计算指标
    const actuals = testData.map(d => d.price);

    const errors = actuals.map((actual, i) => actual - predictions[i]);
    const absErrors = errors.map(e => Math.abs(e));
    const squaredErrors = errors.map(e => e * e);
    const percentageErrors = actuals.map(
      (actual, i) => Math.abs((actual - predictions[i]) / actual) * 100
    );

    const mae = absErrors.reduce((sum, e) => sum + e, 0) / absErrors.length;
    const rmse = Math.sqrt(
      squaredErrors.reduce((sum, e) => sum + e, 0) / squaredErrors.length
    );
    const mape =
      percentageErrors.reduce((sum, e) => sum + e, 0) / percentageErrors.length;

    return { mae, rmse, mape };
  }

  /**
   * 价格风险评估
   */
  private assessPriceRisk(
    trendAnalysis: TrendAnalysis,
    forecast: ForecastResult,
    historicalData: PricePoint[]
  ): {
    price_volatility: number;
    trend_strength: number;
    prediction_uncertainty: number;
    market_risk_level: 'low' | 'medium' | 'high';
  } {
    const volatility = trendAnalysis.volatility;
    const trendStrength = trendAnalysis.strength / 100;

    // 预测不确定性（基于置信区间的宽度）
    const avgIntervalWidth =
      forecast.confidence_intervals.reduce(
        (sum, ci) => sum + (ci.upper - ci.lower),
        0
      ) / forecast.confidence_intervals.length;
    const predictionUncertainty = Math.min(
      1,
      avgIntervalWidth / forecast.predicted_prices[0]
    );

    // 综合风险评分
    const riskScore =
      volatility * 0.4 +
      (1 - trendStrength) * 0.3 +
      predictionUncertainty * 0.3;

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (riskScore > 0.7) riskLevel = 'high';
    else if (riskScore > 0.4) riskLevel = 'medium';

    return {
      price_volatility: volatility,
      trend_strength: trendStrength,
      prediction_uncertainty: predictionUncertainty,
      market_risk_level: riskLevel,
    };
  }

  /**
   * 生成采购建议
   */
  private generateRecommendations(
    trendAnalysis: TrendAnalysis,
    riskIndicators: any,
    forecast: ForecastResult
  ): string[] {
    const recommendations: string[] = [];

    // 基于趋势的建?    switch (trendAnalysis.trend) {
      case 'upward':
        recommendations.push('价格上涨趋势明显，建议提前采购锁定成?);
        break;
      case 'downward':
        recommendations.push('价格呈下降趋势，可适当延后采购时机');
        break;
      case 'volatile':
        recommendations.push('价格波动较大，建议分批采购降低风?);
        break;
      default:
        recommendations.push('价格相对稳定，可根据库存情况正常采购');
    }

    // 基于风险的建?    if (riskIndicators.market_risk_level === 'high') {
      recommendations.push('市场风险较高，建议增加安全库?);
      recommendations.push('考虑多元化供应商以分散风?);
    }

    // 基于预测的建?    const priceChanges = forecast.predicted_prices.map((price, i, arr) =>
      i === 0 ? 0 : ((price - arr[0]) / arr[0]) * 100
    );

    const maxIncrease = Math.max(...priceChanges);
    const maxDecrease = Math.min(...priceChanges);

    if (maxIncrease > 10) {
      recommendations.push(
        `未来${this.config.forecast_horizon}天内价格可能上涨${maxIncrease.toFixed(1)}%，建议尽快决策`
      );
    } else if (maxDecrease < -10) {
      recommendations.push(
        `未来${this.config.forecast_horizon}天内价格可能下跌${Math.abs(maxDecrease).toFixed(1)}%，可等待更好时机`
      );
    }

    // 库存管理建议
    if (trendAnalysis.volatility > 0.1) {
      recommendations.push('高波动环境下，建议保?-3周的安全库存');
    }

    return recommendations;
  }
}

// 导出实例供其他模块使?export const priceTrendAnalyzer = new PriceTrendAnalyzer();

// API 路由处理器示?/*
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commodityId, config } = body;

    const analyzer = new PriceTrendAnalyzer(config);
    const result = await analyzer.analyzePriceTrend(commodityId);

    return Response.json(result);

  } catch (error: any) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
*/
