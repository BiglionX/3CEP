import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface MarketDataPoint {
  commodity: string;
  region: string;
  price: number;
  currency: string;
  unit: string;
  timestamp: string;
  source: string;
  confidence: number;
  volume?: number;
}

interface PriceIndex {
  commodity: string;
  base_price: number;
  current_price: number;
  price_change: number;
  price_change_percent: number;
  volatility_index: number;
  trend: 'up' | 'down' | 'stable';
  updated_at: string;
}

interface SupplyDemandAnalysis {
  commodity: string;
  supply_level: 'shortage' | 'balanced' | 'surplus';
  demand_level: 'weak' | 'moderate' | 'strong';
  supply_demand_ratio: number;
  market_pressure: 'bullish' | 'bearish' | 'neutral';
  key_insights: string[];
  forecast_period: string;
}

interface MarketIntelligenceReport {
  report_id: string;
  generated_at: string;
  coverage_period: { start: string; end: string };
  price_indices: PriceIndex[];
  supply_demand_analyses: SupplyDemandAnalysis[];
  market_outlook: {
    overall_sentiment: 'positive' | 'negative' | 'neutral';
    key_drivers: string[];
    risk_factors: string[];
    opportunities: string[];
  };
  regional_analysis: Array<{
    region: string;
    market_conditions: string;
    price_trends: string;
    supply_status: string;
  }>;
  commodity_spotlight: Array<{
    commodity: string;
    analysis: string;
    recommendation: string;
    confidence_level: number;
  }>;
}

interface IntelligenceConfig {
  data_sources: {
    price_feeds: string[];
    economic_indicators: string[];
    news_sentiment: boolean;
    social_media_monitoring: boolean;
  };
  analysis_parameters: {
    lookback_period: number; // 天数
    forecast_horizon: number; // 天数
    volatility_window: number; // 计算波动率的窗口
    correlation_threshold: number; // 相关性阈值
  };
  reporting: {
    frequency: 'daily' | 'weekly' | 'monthly';
    include_forecasts: boolean;
    detailed_breakdown: boolean;
  };
}

export class MarketIntelligenceService {
  private config: IntelligenceConfig;

  constructor(config?: Partial<IntelligenceConfig>) {
    this.config = {
      data_sources: {
        price_feeds: ['market_data_api', 'exchange_feeds', 'supplier_reports'],
        economic_indicators: [
          'gdp',
          'inflation',
          'exchange_rates',
          'commodity_indices',
        ],
        news_sentiment: true,
        social_media_monitoring: true,
      },
      analysis_parameters: {
        lookback_period: 90,
        forecast_horizon: 30,
        volatility_window: 30,
        correlation_threshold: 0.7,
      },
      reporting: {
        frequency: 'daily',
        include_forecasts: true,
        detailed_breakdown: true,
      },
      ...config,
    };
  }

  /**
   * 生成市场情报报告
   */
  async generateMarketIntelligenceReport(
    commodities?: string[],
    regions?: string[]
  ): Promise<MarketIntelligenceReport> {
    try {
      // TODO: 移除调试日志
      console.log('📊 开始生成市场情报报告...');
      const reportId = this.generateReportId();
      const currentTime = new Date().toISOString();
      const coveragePeriod = this.calculateCoveragePeriod();

      // 1. 收集市场价格数据
      const marketData = await this.collectMarketData(commodities, regions);

      // 2. 计算价格指数
      const priceIndices = this.calculatePriceIndices(marketData);

      // 3. 分析供需状况
      const supplyDemandAnalyses = await this.analyzeSupplyDemand(marketData);

      // 4. 评估市场情绪
      const marketSentiment = await this.assessMarketSentiment(commodities);

      // 5. 生成区域分析
      const regionalAnalysis = this.generateRegionalAnalysis(marketData);

      // 6. 商品焦点分析
      const commoditySpotlight = this.analyzeCommoditySpotlight(marketData);

      // 7. 生成市场展望
      const marketOutlook = this.generateMarketOutlook(
        priceIndices,
        supplyDemandAnalyses,
        marketSentiment
      );

      const report: MarketIntelligenceReport = {
        report_id: reportId,
        generated_at: currentTime,
        coverage_period: coveragePeriod,
        price_indices: priceIndices,
        supply_demand_analyses: supplyDemandAnalyses,
        market_outlook: marketOutlook,
        regional_analysis: regionalAnalysis,
        commodity_spotlight: commoditySpotlight,
      };

      // 8. 存储报告
      await this.storeMarketReport(report);

      // TODO: 移除调试日志
      console.log(`✅ 市场情报报告生成完成：${reportId}`);
      return report;
    } catch (error) {
      console.error('❌ 市场情报报告生成失败:', error);
      throw error;
    }
  }

  /**
   * 收集市场价格数据
   */
  private async collectMarketData(
    commodities?: string[],
    regions?: string[]
  ): Promise<MarketDataPoint[]> {
    // TODO: 移除调试日志
    // console.log('🔍 收集市场价格数据...');
    // 查询国际价格指数
    let query = supabase
      .from('international_price_indices')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(1000);

    // 应用商品过滤
    if (commodities && commodities.length > 0) {
      query = query.in('commodity', commodities);
    }

    // 应用区域过滤
    if (regions && regions.length > 0) {
      query = query.in('region', regions);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`收集市场数据失败: ${error.message}`);
    }

    // 转换为标准格式
    const marketData: MarketDataPoint[] = data.map(item => ({
      commodity: item.commodity,
      region: item.region,
      price: item.price,
      currency: item.currency,
      unit: item.unit,
      timestamp: item.recorded_at,
      source: item.source,
      confidence: item.confidence_level,
      volume: item.trading_volume,
    }));

    // TODO: 移除调试日志
    // console.log(`📋 收集了 ${marketData.length} 条市场价格数据`);
    return marketData;
  }

  /**
   * 计算价格指数
   */
  private calculatePriceIndices(marketData: MarketDataPoint[]): PriceIndex[] {
    // TODO: 移除调试日志
    // console.log('📈 计算价格指数...');
    // 按商品分
    const groupedByCommodity = this.groupByCommodity(marketData);

    const priceIndices: PriceIndex[] = [];

    for (const [commodity, dataPoints] of Object.entries(groupedByCommodity)) {
      if (dataPoints.length < 2) continue;

      // 按时间排
      const sortedData = [...dataPoints].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // 获取基准价格（最早的）和当前价格（最新的）
      const basePrice = sortedData[0].price;
      const currentPrice = sortedData[sortedData.length - 1].price;

      // 计算价格变化
      const priceChange = currentPrice - basePrice;
      const priceChangePercent =
        basePrice > 0 ? (priceChange / basePrice) * 100 : 0;

      // 计算波动
      const volatilityIndex = this.calculateVolatilityIndex(
        sortedData.map(d => d.price)
      );

      // 确定趋势
      const trend = this.determinePriceTrend(priceChangePercent);

      priceIndices.push({
        commodity,
        base_price: basePrice,
        current_price: currentPrice,
        price_change: priceChange,
        price_change_percent: parseFloat(priceChangePercent.toFixed(2)),
        volatility_index: parseFloat(volatilityIndex.toFixed(2)),
        trend,
        updated_at: new Date().toISOString(),
      });
    }

    // TODO: 移除调试日志
    // console.log(`📊 计算完成 ${priceIndices.length} 个价格指数`);
    return priceIndices;
  }

  /**
   * 分析供需状况
   */
  private async analyzeSupplyDemand(
    marketData: MarketDataPoint[]
  ): Promise<SupplyDemandAnalysis[]> {
    // TODO: 移除调试日志
    // console.log('⚖️ 分析供需状况...');
    const analyses: SupplyDemandAnalysis[] = [];
    const groupedByCommodity = this.groupByCommodity(marketData);

    for (const [commodity, dataPoints] of Object.entries(groupedByCommodity)) {
      // 分析价格趋势判断供需
      const recentData = dataPoints.slice(-30); // 最近30天数
      const priceTrend = this.calculatePriceTrend(recentData.map(d => d.price));

      // 分析成交量趋势
      const volumeTrend = await this.analyzeVolumeTrend(commodity);

      // 综合判断供需状况
      const supplyDemandAnalysis = this.determineSupplyDemandStatus(
        priceTrend,
        volumeTrend,
        commodity
      );

      analyses.push(supplyDemandAnalysis);
    }

    return analyses;
  }

  /**
   * 评估市场情绪
   */
  private async assessMarketSentiment(commodities?: string[]): Promise<any> {
    // TODO: 移除调试日志
    // console.log('💭 评估市场情绪...');
    // 1. 新闻情感分析
    const newsSentiment = await this.analyzeNewsSentiment(commodities);

    // 2. 社交媒体情绪
    const socialSentiment = await this.analyzeSocialMediaSentiment(commodities);

    // 3. 技术指标分析
    const technicalIndicators =
      await this.analyzeTechnicalIndicators(commodities);

    // 综合情绪得分
    const compositeSentiment = this.calculateCompositeSentiment(
      newsSentiment,
      socialSentiment,
      technicalIndicators
    );

    return {
      overall_sentiment: compositeSentiment.sentiment,
      confidence: compositeSentiment.confidence,
      components: {
        news: newsSentiment,
        social_media: socialSentiment,
        technical: technicalIndicators,
      },
      key_drivers: compositeSentiment.drivers,
    };
  }

  /**
   * 生成区域分析
   */
  private generateRegionalAnalysis(marketData: MarketDataPoint[]): any[] {
    // TODO: 移除调试日志
    // console.log('🌍 生成区域分析...');
    const groupedByRegion = this.groupByRegion(marketData);
    const regionalAnalysis: any[] = [];

    for (const [region, dataPoints] of Object.entries(groupedByRegion)) {
      // 计算该区域的平均价格变化
      const priceChanges = dataPoints.map(point => {
        const baseData = dataPoints.find(
          d =>
            d.commodity === point.commodity &&
            new Date(d.timestamp) < new Date(point.timestamp)
        );
        return baseData
          ? ((point.price - baseData.price) / baseData.price) * 100
          : 0;
      });

      const avgPriceChange =
        priceChanges.length > 0
          ? priceChanges.reduce((sum, change) => sum + change, 0) /
            priceChanges.length
          : 0;

      // 分析供需压力
      const supplyPressure = this.estimateRegionalSupplyPressure(
        region,
        dataPoints
      );
      const demandPressure = this.estimateRegionalDemandPressure(
        region,
        dataPoints
      );

      regionalAnalysis.push({
        region,
        market_conditions: this.describeMarketConditions(
          avgPriceChange,
          supplyPressure,
          demandPressure
        ),
        price_trends:
          avgPriceChange > 2 ? '上涨' : avgPriceChange < -2 ? '下跌' : '稳定',
        supply_status:
          supplyPressure > 0.6
            ? '紧张'
            : supplyPressure < 0.4
              ? '充足'
              : '平衡',
        demand_status:
          demandPressure > 0.6
            ? '强劲'
            : demandPressure < 0.4
              ? '疲软'
              : '适中',
      });
    }

    return regionalAnalysis;
  }

  /**
   * 分析商品焦点
   */
  private analyzeCommoditySpotlight(marketData: MarketDataPoint[]): any[] {
    // TODO: 移除调试日志
    // console.log('🔍 分析商品焦点...');
    const commoditySpotlight: any[] = [];
    const groupedByCommodity = this.groupByCommodity(marketData);

    // 找出最具波动性的商品
    const volatilityRanking = Object.entries(groupedByCommodity)
      .map(([commodity, dataPoints]) => {
        const prices = dataPoints.map(d => d.price);
        const volatility = this.calculateVolatilityIndex(prices);
        return { commodity, volatility };
      })
      .sort((a, b) => b.volatility - a.volatility)
      .slice(0, 5); // 取前5个最波动的商品
    for (const { commodity, volatility } of volatilityRanking) {
      const analysis = this.generateCommodityAnalysis(commodity, marketData);
      commoditySpotlight.push({
        commodity,
        analysis: analysis.description,
        recommendation: analysis.recommendation,
        confidence_level: Math.min(1, volatility / 20), // 简化的置信度计算
      });
    }

    return commoditySpotlight;
  }

  /**
   * 生成市场展望
   */
  private generateMarketOutlook(
    priceIndices: PriceIndex[],
    supplyDemandAnalyses: SupplyDemandAnalysis[],
    sentiment: any
  ): any {
    // TODO: 移除调试日志
    // console.log('🔮 生成市场展望...');
    // 1. 综合趋势分析
    const positiveTrends = priceIndices.filter(
      idx => idx.trend === 'up'
    ).length;
    const negativeTrends = priceIndices.filter(
      idx => idx.trend === 'down'
    ).length;
    const totalTrends = priceIndices.length;

    // 2. 供需压力分析
    const bullishPressures = supplyDemandAnalyses.filter(
      sd => sd.market_pressure === 'bullish'
    ).length;
    const bearishPressures = supplyDemandAnalyses.filter(
      sd => sd.market_pressure === 'bearish'
    ).length;

    // 3. 确定整体情绪
    let overallSentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    const sentimentScore =
      positiveTrends - negativeTrends + bullishPressures - bearishPressures;

    if (sentimentScore > totalTrends * 0.3) {
      overallSentiment = 'positive';
    } else if (sentimentScore < -totalTrends * 0.3) {
      overallSentiment = 'negative';
    }

    // 4. 识别关键驱动因素
    const keyDrivers = this.identifyKeyDrivers(
      priceIndices,
      supplyDemandAnalyses
    );

    // 5. 识别风险因素
    const riskFactors = this.identifyRiskFactors(
      priceIndices,
      supplyDemandAnalyses
    );

    // 6. 识别机会
    const opportunities = this.identifyOpportunities(
      priceIndices,
      supplyDemandAnalyses
    );

    return {
      overall_sentiment: overallSentiment,
      key_drivers: keyDrivers,
      risk_factors: riskFactors,
      opportunities: opportunities,
    };
  }

  /**
   * 存储市场报告
   */
  private async storeMarketReport(
    report: MarketIntelligenceReport
  ): Promise<void> {
    const { error } = await supabase
      .from('market_intelligence_reports')
      .insert([
        {
          report_id: report.report_id,
          generated_at: report.generated_at,
          coverage_period_start: report.coverage_period.start,
          coverage_period_end: report.coverage_period.end,
          price_indices: report.price_indices,
          supply_demand_analyses: report.supply_demand_analyses,
          market_outlook: report.market_outlook,
          regional_analysis: report.regional_analysis,
          commodity_spotlight: report.commodity_spotlight,
        },
      ]);

    if (error) {
      console.warn('存储市场报告失败:', error.message);
    }
  }

  // 辅助方法
  private generateReportId(): string {
    return `MIR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateCoveragePeriod(): { start: string; end: string } {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(
      startDate.getDate() - this.config.analysis_parameters.lookback_period
    );

    return {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    };
  }

  private groupByCommodity(
    data: MarketDataPoint[]
  ): Record<string, MarketDataPoint[]> {
    const grouped: Record<string, MarketDataPoint[]> = {};
    data.forEach(point => {
      if (!grouped[point.commodity]) {
        grouped[point.commodity] = [];
      }
      grouped[point.commodity].push(point);
    });
    return grouped;
  }

  private groupByRegion(
    data: MarketDataPoint[]
  ): Record<string, MarketDataPoint[]> {
    const grouped: Record<string, MarketDataPoint[]> = {};
    data.forEach(point => {
      if (!grouped[point.region]) {
        grouped[point.region] = [];
      }
      grouped[point.region].push(point);
    });
    return grouped;
  }

  private calculateVolatilityIndex(prices: number[]): number {
    if (prices.length < 2) return 0;

    // 计算收益
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    // 计算标准差
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance =
      returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) /
      (returns.length - 1);

    return Math.sqrt(variance) * 100; // 转换为百分比
  }

  private determinePriceTrend(
    priceChangePercent: number
  ): 'up' | 'down' | 'stable' {
    if (priceChangePercent > 5) return 'up';
    if (priceChangePercent < -5) return 'down';
    return 'stable';
  }

  private calculatePriceTrend(prices: number[]): number {
    if (prices.length < 2) return 0;

    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    return ((lastPrice - firstPrice) / firstPrice) * 100;
  }

  private async analyzeVolumeTrend(commodity: string): Promise<number> {
    // 模拟成交量趋势分析
    await new Promise(resolve => setTimeout(resolve, 100));
    return 0.5 + (Math.random() - 0.5) * 0.4; // -0.2 ~ 0.8 之间
  }

  private determineSupplyDemandStatus(
    priceTrend: number,
    volumeTrend: number,
    commodity: string
  ): SupplyDemandAnalysis {
    let supplyLevel: 'shortage' | 'balanced' | 'surplus' = 'balanced';
    let demandLevel: 'weak' | 'moderate' | 'strong' = 'moderate';
    let marketPressure: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    let supplyDemandRatio = 1;

    // 基于价格和成交量判断
    if (priceTrend > 5 && volumeTrend > 0.6) {
      supplyLevel = 'shortage';
      demandLevel = 'strong';
      marketPressure = 'bullish';
      supplyDemandRatio = 0.7;
    } else if (priceTrend < -5 && volumeTrend > 0.6) {
      supplyLevel = 'surplus';
      demandLevel = 'weak';
      marketPressure = 'bearish';
      supplyDemandRatio = 1.4;
    }

    return {
      commodity,
      supply_level: supplyLevel,
      demand_level: demandLevel,
      supply_demand_ratio: parseFloat(supplyDemandRatio.toFixed(2)),
      market_pressure: marketPressure,
      key_insights: this.generateSupplyDemandInsights(
        supplyLevel,
        demandLevel,
        priceTrend
      ),
      forecast_period: '30天',
    };
  }

  private generateSupplyDemandInsights(
    supplyLevel: string,
    demandLevel: string,
    priceTrend: number
  ): string[] {
    const insights: string[] = [];

    if (supplyLevel === 'shortage') {
      insights.push('供应紧张，可能出现缺货风险');
    } else if (supplyLevel === 'surplus') {
      insights.push('供应充足，价格下行压力较大');
    }

    if (demandLevel === 'strong') {
      insights.push('市场需求强劲，支撑价格上涨');
    } else if (demandLevel === 'weak') {
      insights.push('需求疲软，价格承压');
    }

    if (Math.abs(priceTrend) > 10) {
      insights.push(
        `价格波动剧烈，${priceTrend > 0 ? '上涨' : '下跌'}幅度为${Math.abs(priceTrend).toFixed(1)}%`
      );
    }

    return insights;
  }

  private async analyzeNewsSentiment(commodities?: string[]): Promise<any> {
    // 模拟新闻情感分析
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      sentiment_score: (Math.random() - 0.5) * 2, // -1 ~ 1
      positive_news: Math.floor(Math.random() * 10),
      negative_news: Math.floor(Math.random() * 5),
      neutral_news: Math.floor(Math.random() * 8),
    };
  }

  private async analyzeSocialMediaSentiment(
    commodities?: string[]
  ): Promise<any> {
    // 模拟社交媒体情感分析
    await new Promise(resolve => setTimeout(resolve, 150));
    return {
      sentiment_score: (Math.random() - 0.5) * 1.5,
      mentions_count: Math.floor(Math.random() * 1000),
      positive_mentions: Math.floor(Math.random() * 600),
      negative_mentions: Math.floor(Math.random() * 200),
    };
  }

  private async analyzeTechnicalIndicators(
    commodities?: string[]
  ): Promise<any> {
    // 模拟技术指标分析
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      moving_average: Math.random() > 0.5 ? 'bullish' : 'bearish',
      rsi: 30 + Math.random() * 40, // 30-70
      macd: Math.random() > 0.5 ? 'positive' : 'negative',
    };
  }

  private calculateCompositeSentiment(
    news: any,
    social: any,
    technical: any
  ): any {
    const weights = { news: 0.4, social: 0.3, technical: 0.3 };
    const compositeScore =
      news.sentiment_score * weights.news +
      social.sentiment_score * weights.social +
      (technical.moving_average === 'bullish' ? 0.5 : -0.5) * weights.technical;

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (compositeScore > 0.3) sentiment = 'positive';
    else if (compositeScore < -0.3) sentiment = 'negative';

    return {
      sentiment,
      confidence: Math.abs(compositeScore),
      drivers: this.identifySentimentDrivers(news, social, technical),
    };
  }

  private identifySentimentDrivers(
    news: any,
    social: any,
    technical: any
  ): string[] {
    const drivers: string[] = [];

    if (Math.abs(news.sentiment_score) > 0.5) {
      drivers.push('新闻媒体报道影响显著');
    }

    if (social.mentions_count > 500) {
      drivers.push('社交媒体关注度高');
    }

    if (technical.rsi > 70 || technical.rsi < 30) {
      drivers.push('技术指标显示超买或超卖');
    }

    return drivers;
  }

  private estimateRegionalSupplyPressure(
    region: string,
    dataPoints: MarketDataPoint[]
  ): number {
    // 基于价格趋势和成交量估算供应压力
    const priceTrend = this.calculatePriceTrend(dataPoints.map(d => d.price));
    return priceTrend > 0 ? 0.7 : priceTrend < 0 ? 0.3 : 0.5;
  }

  private estimateRegionalDemandPressure(
    region: string,
    dataPoints: MarketDataPoint[]
  ): number {
    // 基于交易量和价格变化估算需求压力
    const avgVolume =
      dataPoints.reduce((sum, d) => sum + (d.volume || 0), 0) /
      dataPoints.length;
    return avgVolume > 1000 ? 0.8 : avgVolume > 500 ? 0.6 : 0.4;
  }

  private describeMarketConditions(
    priceChange: number,
    supplyPressure: number,
    demandPressure: number
  ): string {
    const conditions = [];

    if (priceChange > 5) conditions.push('价格上涨');
    else if (priceChange < -5) conditions.push('价格下跌');
    else conditions.push('价格稳定');

    if (supplyPressure > 0.7) conditions.push('供应紧张');
    else if (supplyPressure < 0.3) conditions.push('供应充足');

    if (demandPressure > 0.7) conditions.push('需求旺盛');
    else if (demandPressure < 0.3) conditions.push('需求疲软');

    return conditions.join(', ');
  }

  private generateCommodityAnalysis(
    commodity: string,
    marketData: MarketDataPoint[]
  ): any {
    const commodityData = marketData.filter(d => d.commodity === commodity);
    const recentData = commodityData.slice(-30);

    const priceTrend = this.calculatePriceTrend(recentData.map(d => d.price));
    const volatility = this.calculateVolatilityIndex(
      recentData.map(d => d.price)
    );

    let description = `${commodity}近期`;
    let recommendation = '';

    if (priceTrend > 10) {
      description += '大幅上涨';
      recommendation = '谨慎追高，关注回调机会';
    } else if (priceTrend < -10) {
      description += '大幅下跌';
      recommendation = '可考虑逢低布局';
    } else {
      description += '走势平稳';
      recommendation = '观望为主，等待明确信号';
    }

    description += `，波动率为${volatility.toFixed(2)}%`;

    return { description, recommendation };
  }

  private identifyKeyDrivers(
    priceIndices: PriceIndex[],
    supplyDemand: SupplyDemandAnalysis[]
  ): string[] {
    const drivers: string[] = [];

    const risingPrices = priceIndices.filter(idx => idx.trend === 'up');
    if (risingPrices.length > priceIndices.length * 0.6) {
      drivers.push('多数商品价格上涨推动市场');
    }

    const supplyShortages = supplyDemand.filter(
      sd => sd.supply_level === 'shortage'
    );
    if (supplyShortages.length > 0) {
      drivers.push(`${supplyShortages.length}个商品出现供应短缺`);
    }

    return drivers.slice(0, 3);
  }

  private identifyRiskFactors(
    priceIndices: PriceIndex[],
    supplyDemand: SupplyDemandAnalysis[]
  ): string[] {
    const risks: string[] = [];

    const highVolatility = priceIndices.filter(
      idx => idx.volatility_index > 15
    );
    if (highVolatility.length > 0) {
      risks.push(`${highVolatility.length}个商品价格波动剧烈`);
    }

    const demandWeak = supplyDemand.filter(sd => sd.demand_level === 'weak');
    if (demandWeak.length > supplyDemand.length * 0.5) {
      risks.push('整体需求疲软');
    }

    return risks.slice(0, 3);
  }

  private identifyOpportunities(
    priceIndices: PriceIndex[],
    supplyDemand: SupplyDemandAnalysis[]
  ): string[] {
    const opportunities: string[] = [];

    const fallingPrices = priceIndices.filter(
      idx => idx.trend === 'down' && idx.volatility_index < 10
    );
    if (fallingPrices.length > 0) {
      opportunities.push(`${fallingPrices.length}个商品价格回调提供买入机会`);
    }

    const balancedMarkets = supplyDemand.filter(
      sd => sd.supply_level === 'balanced' && sd.demand_level === 'moderate'
    );
    if (balancedMarkets.length > supplyDemand.length * 0.6) {
      opportunities.push('多数市场供需平衡，适合稳健投资');
    }

    return opportunities.slice(0, 3);
  }
}

// 导出实例
export const marketIntelligenceService = new MarketIntelligenceService();

/**
 * API 路由处理器示例
 */
/*
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commodities, regions, config } = body;

    const service = new MarketIntelligenceService(config);
    const report = await service.generateMarketIntelligenceReport(commodities, regions);

    return Response.json(report);

  } catch (error: any) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');
    
    if (reportId) {
      // 获取特定报告
      const { data, error } = await supabase
        .from('market_intelligence_reports')
        .select('*')
        .eq('report_id', reportId)
        .single();
        
      if (error) throw error;
      return Response.json(data);
    } else {
      // 获取最新报告列表
      const { data, error } = await supabase
        .from('market_intelligence_reports')
        .select('report_id, generated_at, coverage_period_start, coverage_period_end')
        .order('generated_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      return Response.json(data);
    }

  } catch (error: any) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
*/
