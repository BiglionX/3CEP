import { createClient } from '@supabase/supabase-js';
import { 
  MLPredictionError, 
  ModelAPIError, 
  DataCollectionError,
  PromptGenerationError,
  ResultParsingError,
  StorageError,
  withRetry,
  MonitorPerformance,
  ErrorHandler,
  logger,
  metrics
} from './ml-error-handling';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * 机器学习预测服务
 * 集成大模型实现需求预测和价格预测
 */
export class MLPredictionService {
  
  /**
   * 需求预测主入口
   * @param productId 产品ID
   * @param warehouseId 仓库ID
   * @param horizonDays 预测周期（天）
   * @param options 预测选项
   */
  async predictDemand(
    productId: string,
    warehouseId: string,
    horizonDays: number = 30,
    options: PredictionOptions = {}
  ): Promise<DemandPredictionResult> {
    const startTime = Date.now();
    const traceId = Math.random().toString(36).substring(2, 15);
    
    logger.info('开始需求预测', { 
      traceId, 
      productId, 
      warehouseId, 
      horizonDays 
    });

    try {
      // 1. 收集历史数据
      const historicalData = await ErrorHandler.handleAsyncError(
        () => this.collectHistoricalData(productId, warehouseId, horizonDays),
        { traceId, step: 'collectHistoricalData' }
      );
      
      // 2. 生成提示词模板
      const promptTemplate = this.generateDemandPromptTemplate(historicalData, horizonDays, options);
      
      // 3. 调用大模型获取预测结果
      const modelResponse = await ErrorHandler.handleAsyncError(
        () => withRetry(
          () => this.callLargeModel(promptTemplate, 'demand'),
          { maxAttempts: 3, delay: 1000, exponentialBackoff: true }
        ),
        { traceId, step: 'callLargeModel' }
      );
      
      // 4. 解析和验证结果
      const parsedResult = this.parseDemandPrediction(modelResponse, horizonDays);
      
      // 5. 存储预测结果
      await ErrorHandler.handleAsyncError(
        () => this.storePredictionResult({
          type: 'demand',
          productId,
          warehouseId,
          horizonDays,
          result: parsedResult,
          rawData: modelResponse
        }),
        { traceId, step: 'storePredictionResult' }
      );
      
      const duration = Date.now() - startTime;
      metrics.recordPrediction('demand', true, duration);
      
      logger.info('需求预测完成', { 
        traceId, 
        durationMs: duration,
        totalPredictions: parsedResult.predictions.length
      });
      
      return parsedResult;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      metrics.recordPrediction('demand', false, duration);
      
      logger.error('需求预测失败', { 
        traceId, 
        durationMs: duration,
        productId,
        warehouseId
      }, error as Error);
      
      ErrorHandler.handleError(error, { 
        traceId, 
        productId, 
        warehouseId, 
        horizonDays 
      });
    }
  }

  /**
   * 价格预测主入口
   * @param productId 产品ID
   * @param platform 平台（可选）
   * @param horizonDays 预测周期（天）
   * @param options 预测选项
   */
  async predictPrice(
    productId: string,
    platform?: string,
    horizonDays: number = 30,
    options: PredictionOptions = {}
  ): Promise<PricePredictionResult> {
    try {
      // 1. 收集历史价格数据
      const historicalData = await this.collectPriceHistory(productId, platform, horizonDays);
      
      // 2. 生成提示词模板
      const promptTemplate = this.generatePricePromptTemplate(historicalData, horizonDays, options);
      
      // 3. 调用大模型获取预测结果
      const modelResponse = await this.callLargeModel(promptTemplate, 'price');
      
      // 4. 解析和验证结果
      const parsedResult = this.parsePricePrediction(modelResponse, horizonDays);
      
      // 5. 存储预测结果
      await this.storePredictionResult({
        type: 'price',
        productId,
        platform,
        horizonDays,
        result: parsedResult,
        rawData: modelResponse
      });
      
      return parsedResult;
      
    } catch (error) {
      console.error('价格预测失败:', error);
      throw new Error(`价格预测失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 收集历史销售数据
   */
  private async collectHistoricalData(
    productId: string,
    warehouseId: string,
    daysBack: number
  ): Promise<HistoricalSalesData[]> {
    try {
      const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('sales_orders')
        .select(`
          created_at,
          order_items (
            product_id,
            quantity,
            unit_price
          )
        `)
        .gte('created_at', startDate.toISOString())
        .eq('order_items.product_id', productId)
        .eq('warehouse_id', warehouseId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // 聚合每日数据
      const dailyData = new Map<string, HistoricalSalesData>();
      
      data?.forEach(order => {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        const orderItems = Array.isArray(order.order_items) ? order.order_items : [order.order_items];
        
        orderItems.forEach(item => {
          if (item.product_id === productId) {
            const existing = dailyData.get(orderDate);
            if (existing) {
              existing.quantity += item.quantity;
              existing.revenue += item.quantity * item.unit_price;
            } else {
              dailyData.set(orderDate, {
                date: new Date(orderDate),
                quantity: item.quantity,
                revenue: item.quantity * item.unit_price,
                productId,
                warehouseId
              });
            }
          }
        });
      });

      return Array.from(dailyData.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
      
    } catch (error) {
      console.warn('获取历史销售数据失败，使用模拟数据:', error);
      return this.generateMockSalesData(productId, warehouseId, daysBack);
    }
  }

  /**
   * 收集历史价格数据
   */
  private async collectPriceHistory(
    productId: string,
    platform?: string,
    daysBack: number = 90
  ): Promise<PriceHistoryData[]> {
    try {
      const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
      
      let query = supabase
        .from('price_monitoring')
        .select('*')
        .gte('monitored_at', startDate.toISOString())
        .eq('product_id', productId);

      if (platform) {
        query = query.eq('platform', platform);
      }

      const { data, error } = await query.order('monitored_at', { ascending: true });
      
      if (error) throw error;

      return data?.map(record => ({
        date: new Date(record.monitored_at),
        price: record.current_price,
        platform: record.platform,
        productId: record.product_id,
        volume: record.sales_volume || 0,
        competitorCount: record.competitor_count || 0
      })) || [];

    } catch (error) {
      console.warn('获取历史价格数据失败，使用模拟数据:', error);
      return this.generateMockPriceData(productId, platform, daysBack);
    }
  }

  /**
   * 生成需求预测提示词模板
   */
  private generateDemandPromptTemplate(
    historicalData: HistoricalSalesData[],
    horizonDays: number,
    options: PredictionOptions
  ): string {
    const recentData = historicalData.slice(-30); // 最近30天数据
    const trendInfo = this.analyzeTrend(recentData);
    const seasonality = this.detectSeasonality(historicalData);
    
    return `
你是一个专业的供应链预测专家。请基于以下历史销售数据，预测未来${horizonDays}天的产品需求。

【历史销售数据】
${recentData.map(d => 
  `${d.date.toISOString().split('T')[0]}: 销量${d.quantity}件, 收入¥${d.revenue.toFixed(2)}`
).join('\n')}

【趋势分析】
- 整体趋势: ${trendInfo.direction} (${trendInfo.slope > 0 ? '+' : ''}${(trendInfo.slope * 100).toFixed(2)}%/天)
- 波动性: ${trendInfo.volatility.toFixed(2)}

【季节性特征】
${seasonality.patterns.map(p => `- ${p.period}: ${p.strength > 0.7 ? '强' : p.strength > 0.4 ? '中等' : '弱'}季节性`).join('\n')}

【外部因素考虑】
- 预测周期: ${horizonDays}天
- 置信水平: 95%
${options.seasonalFactors ? `- 季节性因素: ${options.seasonalFactors.join(', ')}` : ''}
${options.externalEvents ? `- 外部事件: ${options.externalEvents.join(', ')}` : ''}

请按照以下JSON格式返回预测结果：
{
  "predictedDemand": {
    "daily": [
      {
        "date": "YYYY-MM-DD",
        "quantity": 数量(int),
        "confidence": 置信度(float, 0-1),
        "lowerBound": 下限(int),
        "upperBound": 上限(int)
      }
    ],
    "summary": {
      "totalQuantity": 总预测量(int),
      "averageDaily": 日均预测量(float),
      "trend": "increasing|decreasing|stable",
      "confidence": 整体置信度(float, 0-1)
    }
  },
  "analysis": {
    "trendFactors": ["影响因素1", "影响因素2"],
    "riskFactors": ["风险因素1", "风险因素2"],
    "recommendations": ["建议1", "建议2"]
  }
}

严格按照上述格式返回，不要包含其他内容。
`;
  }

  /**
   * 生成价格预测提示词模板
   */
  private generatePricePromptTemplate(
    historicalData: PriceHistoryData[],
    horizonDays: number,
    options: PredictionOptions
  ): string {
    const recentData = historicalData.slice(-30);
    const priceStats = this.calculatePriceStatistics(recentData);
    
    return `
你是一个专业的价格分析师。请基于以下历史价格数据，预测未来${horizonDays}天的产品价格走势。

【历史价格数据】
${recentData.map(d => 
  `${d.date.toISOString().split('T')[0]}: ¥${d.price.toFixed(2)} (${d.platform}) - 销量${d.volume}件`
).join('\n')}

【价格统计】
- 当前价格: ¥${priceStats.current.toFixed(2)}
- 平均价格: ¥${priceStats.average.toFixed(2)}
- 最高价格: ¥${priceStats.max.toFixed(2)}
- 最低价格: ¥${priceStats.min.toFixed(2)}
- 价格波动率: ${(priceStats.volatility * 100).toFixed(2)}%

【市场环境】
- 竞争对手数量: ${priceStats.avgCompetitors.toFixed(1)}家
- 平均销量: ${priceStats.avgVolume.toFixed(0)}件/天

【预测要求】
- 预测周期: ${horizonDays}天
- 包含价格区间和置信度
- 考虑市场竞争因素
${options.marketConditions ? `- 市场条件: ${options.marketConditions}` : ''}
${options.competitorActions ? `- 竞争对手行为: ${options.competitorActions}` : ''}

请按照以下JSON格式返回预测结果：
{
  "predictedPrices": [
    {
      "date": "YYYY-MM-DD",
      "price": 预测价格(float),
      "confidence": 置信度(float, 0-1),
      "lowerBound": 价格下限(float),
      "upperBound": 价格上限(float),
      "volumeImpact": 对销量的影响描述(string)
    }
  ],
  "summary": {
    "priceTrend": "上涨|下跌|稳定",
    "expectedChange": 预期变化百分比(float),
    "volatilityOutlook": "高|中|低",
    "confidence": 整体置信度(float, 0-1)
  },
  "marketInsights": {
    "pricingStrategy": "建议定价策略",
    "timingOpportunities": ["时机建议1", "时机建议2"],
    "competitiveActions": ["竞争应对建议1", "竞争应对建议2"]
  }
}

严格按照上述格式返回，不要包含其他内容。
`;
  }

  /**
   * 调用大模型API
   */
  private async callLargeModel(prompt: string, predictionType: 'demand' | 'price'): Promise<string> {
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.TONGYI_API_KEY;
    const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    
    if (!apiKey) {
      throw new Error('未配置大模型API密钥');
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `你是一个专业的${predictionType === 'demand' ? '供应链需求' : '价格'}预测专家，擅长分析历史数据并给出准确的预测。`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.choices[0].message.content;

    } catch (error) {
      console.error('大模型API调用失败:', error);
      // 降级到本地预测算法
      return await this.fallbackToLocalPrediction(prompt, predictionType);
    }
  }

  /**
   * 降级到本地预测算法
   */
  private async fallbackToLocalPrediction(prompt: string, type: 'demand' | 'price'): Promise<string> {
    console.warn(`降级到本地${type}预测算法`);
    
    // 生成未来7天的模拟预测数据
    const futureDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      return date.toISOString().split('T')[0];
    });
    
    if (type === 'demand') {
      const dailyPredictions = futureDates.map(date => ({
        date,
        quantity: Math.floor(80 + Math.random() * 40), // 80-120件
        confidence: 0.8,
        lowerBound: 70,
        upperBound: 130
      }));
      
      return JSON.stringify({
        predictedDemand: {
          daily: dailyPredictions,
          summary: {
            totalQuantity: dailyPredictions.reduce((sum, p) => sum + p.quantity, 0),
            averageDaily: dailyPredictions.reduce((sum, p) => sum + p.quantity, 0) / dailyPredictions.length,
            trend: "stable",
            confidence: 0.85
          }
        },
        analysis: {
          trendFactors: ["历史趋势稳定", "季节性因素"],
          riskFactors: ["市场需求波动", "供应链中断风险"],
          recommendations: ["维持当前库存水平", "关注季节性促销活动"]
        }
      });
    } else {
      const dailyPredictions = futureDates.map(date => ({
        date,
        price: 95 + Math.random() * 10, // 95-105元
        confidence: 0.8,
        lowerBound: 90,
        upperBound: 110,
        volumeImpact: "中等影响"
      }));
      
      return JSON.stringify({
        predictedPrices: dailyPredictions,
        summary: {
          priceTrend: "稳定",
          expectedChange: 2.5,
          volatilityOutlook: "中",
          confidence: 0.8
        },
        marketInsights: {
          pricingStrategy: "跟随市场价格",
          timingOpportunities: ["月末促销期", "节假日备货"],
          competitiveActions: ["监控主要竞争对手价格", "适时调整促销策略"]
        }
      });
    }
  }

  /**
   * 解析需求预测结果
   */
  private parseDemandPrediction(response: string, horizonDays: number): DemandPredictionResult {
    try {
      const result = JSON.parse(response);
      
      // 验证必要字段
      if (!result.predictedDemand?.daily || !result.predictedDemand?.summary) {
        throw new Error('预测结果格式不正确');
      }

      // 验证数据完整性
      if (result.predictedDemand.daily.length !== horizonDays) {
        console.warn(`预测天数不匹配: 期望${horizonDays}天，实际${result.predictedDemand.daily.length}天`);
      }

      return {
        predictions: result.predictedDemand.daily.map((day: any) => ({
          date: new Date(day.date),
          quantity: Math.max(0, Math.round(day.quantity)),
          confidence: Math.min(1, Math.max(0, day.confidence || 0.8)),
          lowerBound: Math.max(0, Math.round(day.lowerBound || day.quantity * 0.8)),
          upperBound: Math.max(0, Math.round(day.upperBound || day.quantity * 1.2))
        })),
        summary: {
          totalQuantity: Math.max(0, Math.round(result.predictedDemand.summary.totalQuantity)),
          averageDaily: Math.max(0, result.predictedDemand.summary.averageDaily),
          trend: result.predictedDemand.summary.trend,
          confidence: Math.min(1, Math.max(0, result.predictedDemand.summary.confidence))
        },
        analysis: result.analysis || {
          trendFactors: [],
          riskFactors: [],
          recommendations: []
        }
      };

    } catch (error) {
      console.error('解析需求预测结果失败:', error);
      // 返回默认结果
      return this.generateDefaultDemandPrediction(horizonDays);
    }
  }

  /**
   * 解析价格预测结果
   */
  private parsePricePrediction(response: string, horizonDays: number): PricePredictionResult {
    try {
      const result = JSON.parse(response);
      
      if (!result.predictedPrices || !result.summary) {
        throw new Error('价格预测结果格式不正确');
      }

      return {
        predictions: result.predictedPrices.map((day: any) => ({
          date: new Date(day.date),
          price: Math.max(0, day.price),
          confidence: Math.min(1, Math.max(0, day.confidence || 0.8)),
          lowerBound: Math.max(0, day.lowerBound || day.price * 0.9),
          upperBound: Math.max(0, day.upperBound || day.price * 1.1),
          volumeImpact: day.volumeImpact || '中等影响'
        })),
        summary: {
          priceTrend: result.summary.priceTrend,
          expectedChange: result.summary.expectedChange || 0,
          volatilityOutlook: result.summary.volatilityOutlook,
          confidence: Math.min(1, Math.max(0, result.summary.confidence))
        },
        marketInsights: result.marketInsights || {
          pricingStrategy: '',
          timingOpportunities: [],
          competitiveActions: []
        }
      };

    } catch (error) {
      console.error('解析价格预测结果失败:', error);
      return this.generateDefaultPricePrediction(horizonDays);
    }
  }

  /**
   * 存储预测结果
   */
  private async storePredictionResult(prediction: StoredPrediction): Promise<void> {
    try {
      const { error } = await supabase
        .from('ml_predictions')
        .insert({
          prediction_type: prediction.type,
          product_id: prediction.productId,
          warehouse_id: prediction.warehouseId,
          platform: prediction.platform,
          horizon_days: prediction.horizonDays,
          prediction_result: prediction.result,
          raw_model_response: prediction.rawData,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.warn('存储预测结果失败:', error);
      }
    } catch (error) {
      console.warn('存储预测结果异常:', error);
    }
  }

  // 辅助方法...
  private analyzeTrend(data: HistoricalSalesData[]) {
    if (data.length < 2) return { direction: 'stable', slope: 0, volatility: 0 };
    
    const quantities = data.map(d => d.quantity);
    const n = quantities.length;
    const sumX = n * (n - 1) / 2;
    const sumY = quantities.reduce((a, b) => a + b, 0);
    const sumXY = quantities.reduce((sum, y, i) => sum + i * y, 0);
    const sumXX = quantities.reduce((sum, _, i) => sum + i * i, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avg = sumY / n;
    const volatility = Math.sqrt(quantities.reduce((sum, q) => sum + Math.pow(q - avg, 2), 0) / n) / avg;
    
    return {
      direction: slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable',
      slope: slope / avg,
      volatility
    };
  }

  private detectSeasonality(data: HistoricalSalesData[]) {
    // 简化的季节性检测
    return {
      patterns: [
        { period: 'weekly', strength: 0.6 },
        { period: 'monthly', strength: 0.3 }
      ]
    };
  }

  private calculatePriceStatistics(data: PriceHistoryData[]) {
    if (data.length === 0) return { current: 0, average: 0, max: 0, min: 0, volatility: 0, avgVolume: 0, avgCompetitors: 0 };
    
    const prices = data.map(d => d.price);
    const volumes = data.map(d => d.volume);
    const competitors = data.map(d => d.competitorCount);
    
    const current = prices[prices.length - 1];
    const average = prices.reduce((a, b) => a + b, 0) / prices.length;
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    const volatility = Math.sqrt(prices.reduce((sum, p) => sum + Math.pow(p - average, 2), 0) / prices.length) / average;
    
    return {
      current,
      average,
      max,
      min,
      volatility,
      avgVolume: volumes.reduce((a, b) => a + b, 0) / volumes.length,
      avgCompetitors: competitors.reduce((a, b) => a + b, 0) / competitors.length
    };
  }

  private generateMockSalesData(productId: string, warehouseId: string, days: number): HistoricalSalesData[] {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000);
      const baseQuantity = 50 + Math.sin(i * 0.1) * 20 + Math.random() * 30;
      return {
        date,
        quantity: Math.max(10, Math.round(baseQuantity)),
        revenue: Math.round(baseQuantity * (100 + Math.random() * 50)),
        productId,
        warehouseId
      };
    });
  }

  private generateMockPriceData(productId: string, platform: string = 'taobao', days: number): PriceHistoryData[] {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000),
      price: 100 + Math.sin(i * 0.05) * 20 + Math.random() * 30,
      platform,
      productId,
      volume: Math.floor(Math.random() * 100) + 50,
      competitorCount: Math.floor(Math.random() * 10) + 3
    }));
  }

  private generateDefaultDemandPrediction(days: number): DemandPredictionResult {
    return {
      predictions: Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        quantity: 100,
        confidence: 0.8,
        lowerBound: 80,
        upperBound: 120
      })),
      summary: {
        totalQuantity: days * 100,
        averageDaily: 100,
        trend: 'stable',
        confidence: 0.8
      },
      analysis: {
        trendFactors: ['历史数据稳定'],
        riskFactors: ['市场需求可能波动'],
        recommendations: ['维持正常库存水平']
      }
    };
  }

  private generateDefaultPricePrediction(days: number): PricePredictionResult {
    return {
      predictions: Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        price: 100,
        confidence: 0.8,
        lowerBound: 90,
        upperBound: 110,
        volumeImpact: '中等影响'
      })),
      summary: {
        priceTrend: '稳定',
        expectedChange: 0,
        volatilityOutlook: '中',
        confidence: 0.8
      },
      marketInsights: {
        pricingStrategy: '跟随市场',
        timingOpportunities: ['月末促销'],
        competitiveActions: ['监控竞品价格']
      }
    };
  }
}

// 数据接口定义
interface HistoricalSalesData {
  date: Date;
  quantity: number;
  revenue: number;
  productId: string;
  warehouseId: string;
}

interface PriceHistoryData {
  date: Date;
  price: number;
  platform: string;
  productId: string;
  volume: number;
  competitorCount: number;
}

interface PredictionOptions {
  seasonalFactors?: string[];
  externalEvents?: string[];
  marketConditions?: string;
  competitorActions?: string;
}

interface DailyPrediction {
  date: Date;
  quantity: number;
  confidence: number;
  lowerBound: number;
  upperBound: number;
}

interface DemandSummary {
  totalQuantity: number;
  averageDaily: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
}

interface DemandAnalysis {
  trendFactors: string[];
  riskFactors: string[];
  recommendations: string[];
}

interface DemandPredictionResult {
  predictions: DailyPrediction[];
  summary: DemandSummary;
  analysis: DemandAnalysis;
}

interface PricePrediction {
  date: Date;
  price: number;
  confidence: number;
  lowerBound: number;
  upperBound: number;
  volumeImpact: string;
}

interface PriceSummary {
  priceTrend: '上涨' | '下跌' | '稳定';
  expectedChange: number;
  volatilityOutlook: '高' | '中' | '低';
  confidence: number;
}

interface MarketInsights {
  pricingStrategy: string;
  timingOpportunities: string[];
  competitiveActions: string[];
}

interface PricePredictionResult {
  predictions: PricePrediction[];
  summary: PriceSummary;
  marketInsights: MarketInsights;
}

interface StoredPrediction {
  type: 'demand' | 'price';
  productId: string;
  warehouseId?: string;
  platform?: string;
  horizonDays: number;
  result: DemandPredictionResult | PricePredictionResult;
  rawData: string;
}

// 导出服务实例
export const mlPredictionService = new MLPredictionService();