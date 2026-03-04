// 数据质量趋势分析和预测引?import { QualityCheckResult } from './data-quality-service';
import { monitoringService } from './monitoring-service';

// 趋势分析数据?export interface TrendDataPoint {
  timestamp: string;
  value: number;
  metadata?: Record<string, any>;
}

// 趋势分析结果
export interface TrendAnalysisResult {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  slope: number; // 趋势斜率
  correlation: number; // 相关性系?(-1�?)
  volatility: number; // 波动性指?  seasonality?: {
    period: number;
    strength: number;
  };
  forecast?: TrendForecast;
  confidence: number; // 置信?0-1
  analysisPeriod: {
    start: string;
    end: string;
  };
}

// 趋势预测结果
export interface TrendForecast {
  predictions: {
    timestamp: string;
    predictedValue: number;
    confidenceInterval: {
      lower: number;
      upper: number;
    };
  }[];
  predictionHorizon: number; // 预测时间范围(�?
  modelType: 'linear' | 'polynomial' | 'exponential' | 'arima' | 'lstm';
  accuracy: number; // 预测准确?}

// 异常检测结?export interface AnomalyDetectionResult {
  metric: string;
  anomalies: {
    timestamp: string;
    value: number;
    deviation: number; // 偏离程度
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: 'spike' | 'drop' | 'persistent' | 'seasonal';
  }[];
  detectionMethod: 'statistical' | 'ml_based' | 'rule_based';
  threshold: number;
}

// 趋势分析配置
export interface TrendAnalysisConfig {
  analysisPeriod: number; // 分析周期(�?
  sampleFrequency: 'hourly' | 'daily' | 'weekly';
  minimumDataPoints: number;
  algorithms: {
    trend: ('linear' | 'polynomial' | 'exponential')[];
    forecasting: ('linear' | 'arima' | 'lstm')[];
    anomaly: ('statistical' | 'ml_based')[];
  };
  thresholds: {
    trendSignificance: number; // 趋势显著性阈?    anomalyDetection: number; // 异常检测阈?    volatilityAlert: number; // 波动性告警阈?  };
}

// 时间序列数据处理?export class TimeSeriesProcessor {
  private config: TrendAnalysisConfig;

  constructor(config?: Partial<TrendAnalysisConfig>) {
    this.config = {
      analysisPeriod: 30,
      sampleFrequency: 'daily',
      minimumDataPoints: 10,
      algorithms: {
        trend: ['linear', 'polynomial'],
        forecasting: ['linear', 'arima'],
        anomaly: ['statistical', 'ml_based'],
      },
      thresholds: {
        trendSignificance: 0.7,
        anomalyDetection: 2.0,
        volatilityAlert: 15.0,
      },
      ...config,
    };
  }

  // 计算移动平均
  calculateMovingAverage(data: number[], window: number): number[] {
    if (data.length < window) return [];

    const result: number[] = [];
    for (let i = window - 1; i < data.length; i++) {
      const windowData = data.slice(i - window + 1, i + 1);
      const average = windowData.reduce((sum, val) => sum + val, 0) / window;
      result.push(average);
    }
    return result;
  }

  // 计算指数移动平均
  calculateEMA(data: number[], alpha: number): number[] {
    if (data.length === 0) return [];

    const ema: number[] = [data[0]];
    for (let i = 1; i < data.length; i++) {
      ema[i] = alpha * data[i] + (1 - alpha) * ema[i - 1];
    }
    return ema;
  }

  // 计算标准?  calculateStandardDeviation(data: number[]): number {
    if (data.length === 0) return 0;

    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
    const variance =
      squaredDiffs.reduce((sum, val) => sum + val, 0) / data.length;
    return Math.sqrt(variance);
  }

  // 线性回归分?  linearRegression(
    x: number[],
    y: number[]
  ): {
    slope: number;
    intercept: number;
    rSquared: number;
  } {
    const n = x.length;
    if (n === 0) return { slope: 0, intercept: 0, rSquared: 0 };

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);
    const sumXX = x.map(xi => xi * xi).reduce((a, b) => a + b, 0);
    const sumYY = y.map(yi => yi * yi).reduce((a, b) => a + b, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // 计算R²
    const yMean = sumY / n;
    const totalSumSquares = sumYY - n * yMean * yMean;
    const residualSumSquares = y.reduce((sum, yi, i) => {
      const predicted = slope * x[i] + intercept;
      return sum + Math.pow(yi - predicted, 2);
    }, 0);

    const rSquared = 1 - residualSumSquares / totalSumSquares;

    return { slope, intercept, rSquared };
  }

  // 检测季节?  detectSeasonality(
    data: number[],
    maxPeriod: number = 30
  ): {
    period: number;
    strength: number;
  } {
    if (data.length < maxPeriod * 2) {
      return { period: 0, strength: 0 };
    }

    let bestPeriod = 0;
    let bestStrength = 0;

    // 尝试不同的周?    for (
      let period = 2;
      period <= Math.min(maxPeriod, Math.floor(data.length / 2));
      period++
    ) {
      const autocorrelations: number[] = [];

      // 计算自相?      for (let lag = 0; lag < period; lag++) {
        let sum = 0;
        let count = 0;

        for (let i = 0; i < data.length - period; i++) {
          if (i + lag < data.length && i + period < data.length) {
            sum += (data[i + lag] - data[i]) * (data[i + period] - data[i]);
            count++;
          }
        }

        if (count > 0) {
          autocorrelations.push(sum / count);
        }
      }

      const avgCorrelation =
        autocorrelations.reduce((a, b) => a + b, 0) / autocorrelations.length;
      const strength = Math.abs(avgCorrelation);

      if (strength > bestStrength) {
        bestStrength = strength;
        bestPeriod = period;
      }
    }

    return {
      period: bestPeriod,
      strength: bestStrength,
    };
  }
}

// 趋势分析引擎
export class TrendAnalysisEngine {
  private processor: TimeSeriesProcessor;
  private trendHistory: Map<string, TrendDataPoint[]> = new Map();
  private config: TrendAnalysisConfig;

  constructor(config?: Partial<TrendAnalysisConfig>) {
    this.config = {
      analysisPeriod: 30,
      sampleFrequency: 'daily',
      minimumDataPoints: 10,
      algorithms: {
        trend: ['linear', 'polynomial'],
        forecasting: ['linear', 'arima'],
        anomaly: ['statistical', 'ml_based'],
      },
      thresholds: {
        trendSignificance: 0.7,
        anomalyDetection: 2.0,
        volatilityAlert: 15.0,
      },
      ...config,
    };

    this.processor = new TimeSeriesProcessor(this.config);
  }

  // 添加趋势数据?  addDataPoint(
    metric: string,
    value: number,
    timestamp?: string,
    metadata?: Record<string, any>
  ): void {
    const dataPoint: TrendDataPoint = {
      timestamp: timestamp || new Date().toISOString(),
      value,
      metadata,
    };

    if (!this.trendHistory.has(metric)) {
      this.trendHistory.set(metric, []);
    }

    const history = this.trendHistory.get(metric)!;
    history.push(dataPoint);

    // 保持历史数据在合理范围内
    if (history.length > 365) {
      // 最多保留一年数?      history.shift();
    }

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
      `📈 添加趋势数据? ${metric} = ${value} at ${dataPoint.timestamp}`
    )}

  // 分析数据质量趋势
  analyzeTrend(metric: string): TrendAnalysisResult | null {
    const history = this.trendHistory.get(metric);
    if (!history || history.length < this.config.minimumDataPoints) {
      console.warn(
        `⚠️ 数据不足进行趋势分析: ${metric} (${history?.length || 0} �?`
      );
      return null;
    }

    // 准备时间序列数据
    const timestamps = history.map(point =>
      new Date(point.timestamp).getTime()
    );
    const values = history.map(point => point.value);

    // 标准化时间戳（转换为天数?    const startTime = Math.min(...timestamps);
    const timeDays = timestamps.map(
      ts => (ts - startTime) / (1000 * 60 * 60 * 24)
    );

    // 线性趋势分?    const linearResult = this.processor.linearRegression(timeDays, values);

    // 计算波动?    const stdDev = this.processor.calculateStandardDeviation(values);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const volatility = (stdDev / mean) * 100;

    // 检测季节?    const seasonality = this.processor.detectSeasonality(values);

    // 确定趋势方向
    let trend: 'increasing' | 'decreasing' | 'stable' | 'volatile' = 'stable';
    if (Math.abs(linearResult.slope) > 0.1) {
      trend = linearResult.slope > 0 ? 'increasing' : 'decreasing';
    } else if (volatility > this.config.thresholds.volatilityAlert) {
      trend = 'volatile';
    }

    const result: TrendAnalysisResult = {
      metric,
      trend,
      slope: linearResult.slope,
      correlation: Math.sqrt(Math.abs(linearResult.rSquared)),
      volatility,
      seasonality: seasonality.period > 0 ? seasonality : undefined,
      confidence: Math.min(1, linearResult.rSquared * 2),
      analysisPeriod: {
        start: history[0].timestamp,
        end: history[history.length - 1].timestamp,
      },
    };

    // 生成预测
    result.forecast = this.generateForecast(metric, values, timeDays);

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
      `📊 趋势分析完成: ${metric} -> ${trend} (置信? ${(result.confidence * 100).toFixed(1)}%)`
    );
    return result;
  }

  // 生成预测
  private generateForecast(
    metric: string,
    values: number[],
    timeDays: number[]
  ): TrendForecast {
    // 简单线性预?    const linearResult = this.processor.linearRegression(timeDays, values);

    const predictions: TrendForecast['predictions'] = [];
    const horizon = 7; // 预测未来7�?
    const lastTime = Math.max(...timeDays);
    const lastValue = values[values.length - 1];

    for (let i = 1; i <= horizon; i++) {
      const futureTime = lastTime + i;
      const predictedValue =
        linearResult.slope * futureTime + linearResult.intercept;

      // 简单的置信区间计算
      const stdDev = this.processor.calculateStandardDeviation(values);
      const margin = stdDev * 1.96; // 95%置信区间

      predictions.push({
        timestamp: new Date(
          (lastTime + i) * 1000 * 60 * 60 * 24 + new Date().getTime()
        ).toISOString(),
        predictedValue: Math.max(0, predictedValue), // 确保非负
        confidenceInterval: {
          lower: Math.max(0, predictedValue - margin),
          upper: predictedValue + margin,
        },
      });
    }

    return {
      predictions,
      predictionHorizon: horizon,
      modelType: 'linear',
      accuracy: Math.min(1, Math.abs(linearResult.rSquared)),
    };
  }

  // 检测异?  detectAnomalies(metric: string): AnomalyDetectionResult | null {
    const history = this.trendHistory.get(metric);
    if (!history || history.length < this.config.minimumDataPoints) {
      return null;
    }

    const values = history.map(point => point.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = this.processor.calculateStandardDeviation(values);

    const anomalies: AnomalyDetectionResult['anomalies'] = [];

    history.forEach((point, index) => {
      const deviation = Math.abs(point.value - mean) / stdDev;

      if (deviation > this.config.thresholds.anomalyDetection) {
        const severity: 'low' | 'medium' | 'high' | 'critical' =
          deviation > 4
            ? 'critical'
            : deviation > 3
              ? 'high'
              : deviation > 2
                ? 'medium'
                : 'low';

        const type: 'spike' | 'drop' | 'persistent' | 'seasonal' =
          point.value > mean ? 'spike' : 'drop';

        anomalies.push({
          timestamp: point.timestamp,
          value: point.value,
          deviation,
          severity,
          type,
        });
      }
    });

    return {
      metric,
      anomalies,
      detectionMethod: 'statistical',
      threshold: this.config.thresholds.anomalyDetection,
    };
  }

  // 获取多个指标的趋势分?  analyzeMultipleMetrics(metrics: string[]): {
    trends: (TrendAnalysisResult | null)[];
    anomalies: (AnomalyDetectionResult | null)[];
  } {
    const trends = metrics.map(metric => this.analyzeTrend(metric));
    const anomalies = metrics.map(metric => this.detectAnomalies(metric));

    return { trends, anomalies };
  }

  // 生成趋势报告
  generateTrendReport(metrics: string[]): {
    summary: {
      totalMetrics: number;
      improvingMetrics: number;
      decliningMetrics: number;
      stableMetrics: number;
      volatileMetrics: number;
      detectedAnomalies: number;
    };
    detailedAnalysis: {
      trends: (TrendAnalysisResult | null)[];
      anomalies: (AnomalyDetectionResult | null)[];
    };
    recommendations: string[];
  } {
    const { trends, anomalies } = this.analyzeMultipleMetrics(metrics);

    const summary = {
      totalMetrics: metrics.length,
      improvingMetrics: trends.filter(t => t?.trend === 'increasing').length,
      decliningMetrics: trends.filter(t => t?.trend === 'decreasing').length,
      stableMetrics: trends.filter(t => t?.trend === 'stable').length,
      volatileMetrics: trends.filter(t => t?.trend === 'volatile').length,
      detectedAnomalies: anomalies.reduce(
        (sum, a) => sum + (a?.anomalies.length || 0),
        0
      ),
    };

    const recommendations: string[] = [];

    // 基于分析结果生成建议
    if (summary.decliningMetrics > 0) {
      recommendations.push(
        `发现 ${summary.decliningMetrics} 个指标呈下降趋势，建议重点关注`
      );
    }

    if (summary.volatileMetrics > 0) {
      recommendations.push(
        `发现 ${summary.volatileMetrics} 个指标波动较大，建议加强监控`
      );
    }

    if (summary.detectedAnomalies > 0) {
      recommendations.push(
        `检测到 ${summary.detectedAnomalies} 个异常点，建议立即调查`
      );
    }

    if (summary.improvingMetrics > summary.decliningMetrics) {
      recommendations.push('整体数据质量呈现改善趋势，继续保?);
    } else {
      recommendations.push('建议制定数据质量改进计划');
    }

    return {
      summary,
      detailedAnalysis: { trends, anomalies },
      recommendations,
    };
  }

  // 获取历史数据
  getHistoricalData(metric: string, days?: number): TrendDataPoint[] {
    const history = this.trendHistory.get(metric) || [];

    if (!days) return [...history];

    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    return history.filter(
      point => new Date(point.timestamp).getTime() > cutoffTime
    );
  }

  // 清理过期数据
  cleanupOldData(maxAgeDays: number = 90): void {
    const cutoffTime = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;

    for (const [metric, history] of this.trendHistory.entries()) {
      const filteredHistory = history.filter(
        point => new Date(point.timestamp).getTime() > cutoffTime
      );

      if (filteredHistory.length !== history.length) {
        this.trendHistory.set(metric, filteredHistory);
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
          `🧹 清理?${metric} �?${history.length - filteredHistory.length} 个过期数据点`
        )}
    }
  }
}

// 导出实例
export const trendAnalysisEngine = new TrendAnalysisEngine();
