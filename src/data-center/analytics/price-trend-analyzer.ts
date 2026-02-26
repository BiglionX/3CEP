// 价格趋势分析服务
// 提供配件价格历史分析、趋势预测和统计功能

// 价格数据点接口
export interface PriceDataPoint {
  timestamp: string;
  price: number;
  platform: string;
  volume?: number;
  sellerCount?: number;
}

// 价格趋势分析结果
export interface PriceTrendAnalysis {
  partId: string;
  partName: string;
  timeRange: {
    start: string;
    end: string;
  };
  statistics: {
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    priceVolatility: number; // 价格波动率
    priceChangePercent: number; // 价格变化百分比
    dataPoints: number;
  };
  trends: {
    daily: PriceTrendSegment[];
    weekly: PriceTrendSegment[];
    monthly: PriceTrendSegment[];
  };
  platforms: PlatformPriceAnalysis[];
  forecast?: PriceForecast;
  lastUpdated: string;
}

// 价格趋势片段
export interface PriceTrendSegment {
  period: string;
  avgPrice: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  volume?: number;
}

// 平台价格分析
export interface PlatformPriceAnalysis {
  platform: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  priceRange: number;
  dataPoints: number;
  reliabilityScore: number; // 0-100
}

// 价格预测结果
export interface PriceForecast {
  predictedPrices: {
    date: string;
    predictedPrice: number;
    confidence: number; // 置信度 0-1
    lowerBound: number;
    upperBound: number;
  }[];
  forecastPeriod: number; // 预测天数
  modelAccuracy: number; // 模型准确率
  methodology: string; // 预测方法
}

// 分析选项
export interface AnalysisOptions {
  timeRange?: '7d' | '30d' | '90d' | '1y' | 'all';
  platforms?: string[];
  includeForecast?: boolean;
  forecastDays?: number;
  granularity?: 'hourly' | 'daily' | 'weekly';
}

// 价格趋势分析服务
export class PriceTrendAnalyzer {
  // 分析配件价格趋势
  async analyzePriceTrend(
    partId: string, 
    options: AnalysisOptions = {}
  ): Promise<PriceTrendAnalysis> {
    // 设置默认选项
    const opts = {
      timeRange: options.timeRange || '30d',
      platforms: options.platforms || [],
      includeForecast: options.includeForecast ?? true,
      forecastDays: options.forecastDays || 7,
      granularity: options.granularity || 'daily'
    };

    // 获取价格历史数据
    const priceHistory = await this.getPriceHistory(partId, opts.timeRange);
    
    // 计算基础统计信息
    const statistics = this.calculateStatistics(priceHistory);
    
    // 分析趋势
    const trends = this.analyzeTrends(priceHistory, opts.granularity);
    
    // 平台分析
    const platforms = this.analyzeByPlatform(priceHistory);
    
    // 生成预测（如果启用）
    const forecast = opts.includeForecast 
      ? await this.generateForecast(priceHistory, opts.forecastDays)
      : undefined;

    return {
      partId,
      partName: await this.getPartName(partId),
      timeRange: this.getTimeRange(opts.timeRange),
      statistics,
      trends,
      platforms,
      forecast,
      lastUpdated: new Date().toISOString()
    };
  }

  // 获取价格历史数据
  private async getPriceHistory(partId: string, timeRange: string): Promise<PriceDataPoint[]> {
    // 这里应该调用实际的数据源
    // 模拟数据用于演示
    const days = this.parseTimeRange(timeRange);
    const dataPoints: PriceDataPoint[] = [];
    
    const basePrice = 100 + Math.random() * 200;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // 模拟价格波动
      const fluctuation = (Math.random() - 0.5) * 20;
      const price = basePrice + fluctuation + (i * 0.5); // 轻微上涨趋势
      
      dataPoints.push({
        timestamp: date.toISOString(),
        price: Math.round(price * 100) / 100,
        platform: ['taobao', 'jd', 'tmall'][Math.floor(Math.random() * 3)],
        volume: Math.floor(Math.random() * 100) + 10,
        sellerCount: Math.floor(Math.random() * 20) + 5
      });
    }
    
    return dataPoints;
  }

  // 计算统计信息
  private calculateStatistics(data: PriceDataPoint[]): PriceTrendAnalysis['statistics'] {
    if ((data as any)?.data.length === 0) {
      return {
        avgPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        priceVolatility: 0,
        priceChangePercent: 0,
        dataPoints: 0
      };
    }

    const prices = data.map(d => d.price);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // 计算价格波动率（标准差/平均值）
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length;
    const priceVolatility = Math.sqrt(variance) / avgPrice;
    
    // 计算价格变化百分比
    const firstPrice = data[0].price;
    const lastPrice = data[(data as any)?.data.length - 1].price;
    const priceChangePercent = ((lastPrice - firstPrice) / firstPrice) * 100;

    return {
      avgPrice: Math.round(avgPrice * 100) / 100,
      minPrice: Math.round(minPrice * 100) / 100,
      maxPrice: Math.round(maxPrice * 100) / 100,
      priceVolatility: Math.round(priceVolatility * 10000) / 100,
      priceChangePercent: Math.round(priceChangePercent * 100) / 100,
      dataPoints: (data as any)?.data.length
    };
  }

  // 分析趋势
  private analyzeTrends(data: PriceDataPoint[], granularity: string): PriceTrendAnalysis['trends'] {
    // 简化的趋势分析实现
    const dailySegments: PriceTrendSegment[] = [];
    const weeklySegments: PriceTrendSegment[] = [];
    const monthlySegments: PriceTrendSegment[] = [];

    // 按天分组分析
    const dailyGroups = this.groupByPeriod(data, 'day');
    Object.entries(dailyGroups).forEach(([date, points]) => {
      if (points.length > 0) {
        const avgPrice = points.reduce((sum, p) => sum + p.price, 0) / points.length;
        dailySegments.push({
          period: date,
          avgPrice: Math.round(avgPrice * 100) / 100,
          trend: 'stable',
          changePercent: 0
        });
      }
    });

    return {
      daily: dailySegments.slice(-30), // 最近30天
      weekly: weeklySegments,
      monthly: monthlySegments
    };
  }

  // 按平台分析
  private analyzeByPlatform(data: PriceDataPoint[]): PlatformPriceAnalysis[] {
    const platformGroups: Record<string, PriceDataPoint[]> = {};
    
    data.forEach(point => {
      if (!platformGroups[point.platform]) {
        platformGroups[point.platform] = [];
      }
      platformGroups[point.platform].push(point);
    });

    return Object.entries(platformGroups).map(([platform, points]) => {
      const prices = points.map(p => p.price);
      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      return {
        platform,
        avgPrice: Math.round(avgPrice * 100) / 100,
        minPrice: Math.round(minPrice * 100) / 100,
        maxPrice: Math.round(maxPrice * 100) / 100,
        priceRange: Math.round((maxPrice - minPrice) * 100) / 100,
        dataPoints: points.length,
        reliabilityScore: Math.min(100, 50 + points.length) // 简单的可靠性评分
      };
    });
  }

  // 生成价格预测
  private async generateForecast(
    data: PriceDataPoint[], 
    days: number
  ): Promise<PriceForecast> {
    if ((data as any)?.data.length < 10) {
      throw new Error('数据点不足，无法生成预测');
    }

    // 简单的线性回归预测
    const prices = data.map(d => d.price);
    const timestamps = data.map(d => new Date(d.timestamp).getTime());
    
    // 计算线性回归参数
    const n = prices.length;
    const sumX = timestamps.reduce((sum, t) => sum + t, 0);
    const sumY = prices.reduce((sum, p) => sum + p, 0);
    const sumXY = timestamps.reduce((sum, t, i) => sum + t * prices[i], 0);
    const sumXX = timestamps.reduce((sum, t) => sum + t * t, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const predictedPrices = [];
    const lastTimestamp = timestamps[timestamps.length - 1];
    
    for (let i = 1; i <= days; i++) {
      const futureTimestamp = lastTimestamp + (i * 24 * 60 * 60 * 1000); // 每天
      const predictedPrice = slope * futureTimestamp + intercept;
      
      predictedPrices.push({
        date: new Date(futureTimestamp).toISOString().split('T')[0],
        predictedPrice: Math.round(predictedPrice * 100) / 100,
        confidence: 0.85 - (i * 0.05), // 置信度随时间递减
        lowerBound: Math.round((predictedPrice * 0.95) * 100) / 100,
        upperBound: Math.round((predictedPrice * 1.05) * 100) / 100
      });
    }

    return {
      predictedPrices,
      forecastPeriod: days,
      modelAccuracy: 0.75, // 模拟准确率
      methodology: 'linear_regression'
    };
  }

  // 辅助方法
  private async getPartName(partId: string): Promise<string> {
    // 这里应该查询实际的配件名称
    return `配件-${partId.substring(0, 8)}`;
  }

  private getTimeRange(range: string): { start: string; end: string } {
    const end = new Date();
    const start = new Date();
    
    switch (range) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setFullYear(2020);
    }
    
    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  }

  private parseTimeRange(range: string): number {
    switch (range) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  }

  private groupByPeriod(data: PriceDataPoint[], period: 'day' | 'week' | 'month'): Record<string, PriceDataPoint[]> {
    const groups: Record<string, PriceDataPoint[]> = {};
    
    data.forEach(point => {
      const date = new Date(point.timestamp);
      let key: string;
      
      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const week = Math.floor(date.getDate() / 7);
          key = `${date.getFullYear()}-W${week}`;
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(point);
    });
    
    return groups;
  }
}

// 导出实例
export const priceTrendAnalyzer = new PriceTrendAnalyzer();