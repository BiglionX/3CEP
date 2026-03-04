import { supabaseAdmin as supabase } from '@/lib/supabase';
import {
  MarketPrice,
  MarketPriceCreateParams,
  MarketPriceUpdateParams,
  MarketPriceQueryParams,
  PriceStatistics,
  AggregatedMarketData,
  DEFAULT_FRESHNESS_CONFIG,
  FreshnessConfig,
} from '@/lib/types/market.types';

export class MarketDataService {
  private supabase = supabase;
  private freshnessConfig: FreshnessConfig;

  constructor(config: FreshnessConfig = DEFAULT_FRESHNESS_CONFIG) {
    this.freshnessConfig = config;
  }

  /**
   * 创建市场价格记录
   */
  async createMarketPrice(data: MarketPriceCreateParams): Promise<MarketPrice> {
    try {
      const freshnessScore =
        data.freshnessScore ?? this.calculateFreshnessScore(new Date());

      const { data: result, error } = await this.supabase
        .from('market_prices')
        .insert({
          device_model: data.deviceModel,
          avg_price: data.avgPrice,
          min_price: data.minPrice,
          max_price: data.maxPrice,
          median_price: data.medianPrice,
          sample_count: data.sampleCount ?? 0,
          source: data.source,
          freshness_score: freshnessScore,
        } as any)
        .select()
        .single();

      if (error) throw new Error(`创建市场价格记录失败: ${error.message}`);

      return this.mapToMarketPrice(result);
    } catch (error) {
      console.error('MarketDataService.createMarketPrice 错误:', error);
      throw error;
    }
  }

  /**
   * 批量创建市场价格记录
   */
  async createMarketPrices(
    prices: MarketPriceCreateParams[]
  ): Promise<MarketPrice[]> {
    try {
      const priceData = prices.map(
        price =>
          ({
            device_model: price.deviceModel,
            avg_price: price.avgPrice,
            min_price: price.minPrice,
            max_price: price.maxPrice,
            median_price: price.medianPrice,
            sample_count: price.sampleCount ?? 0,
            source: price.source,
            freshness_score:
              price.freshnessScore ?? this.calculateFreshnessScore(new Date()),
          }) as any
      );

      const { data: results, error } = await this.supabase
        .from('market_prices')
        .insert(priceData)
        .select();

      if (error) throw new Error(`批量创建市场价格记录失败: ${error.message}`);

      return results.map(this.mapToMarketPrice);
    } catch (error) {
      console.error('MarketDataService.createMarketPrices 错误:', error);
      throw error;
    }
  }

  /**
   * 查询市场价格记录
   */
  async getMarketPrices(
    params: MarketPriceQueryParams = {}
  ): Promise<MarketPrice[]> {
    try {
      let query = this.supabase.from('market_prices').select('*');

      // 添加查询条件
      if (params.deviceModel) {
        query = query.eq('device_model', params.deviceModel);
      }

      if (params.source) {
        query = query.eq('source', params.source);
      }

      if (params.minFreshness) {
        query = query.gte('freshness_score', params.minFreshness);
      }

      // 排序
      const orderBy = params.orderBy || 'collected_at';
      const sortOrder = params.sortOrder || 'desc';
      query = query.order(orderBy, { ascending: sortOrder === 'asc' });

      // 分页
      if (params.limit) {
        query = query.limit(params.limit);
      }

      if (params.offset) {
        query = query.range(
          params.offset,
          params.offset + (params.limit || 10) - 1
        );
      }

      const { data: results, error } = await query;

      if (error) throw new Error(`查询市场价格记录失败: ${error.message}`);

      return results.map(this.mapToMarketPrice);
    } catch (error) {
      console.error('MarketDataService.getMarketPrices 错误:', error);
      throw error;
    }
  }

  /**
   * 根据设备型号获取最新的市场价格统计
   */
  async getLatestMarketData(
    deviceModel: string
  ): Promise<AggregatedMarketData> {
    try {
      // 获取各平台最新数?      const xianyuData = await this.getLatestPlatformData(
        deviceModel,
        'xianyu'
      );
      const zhuanTurnData = await this.getLatestPlatformData(
        deviceModel,
        'zhuan_turn'
      );

      // 计算聚合数据
      const aggregateData = this.calculateAggregateData(
        [xianyuData, zhuanTurnData].filter(Boolean)
      );

      // 确定最佳数据源
      const bestSource = this.determineBestSource(
        xianyuData,
        zhuanTurnData,
        aggregateData
      );
      const confidenceScore = this.calculateConfidenceScore(
        xianyuData,
        zhuanTurnData
      );

      return {
        deviceModel,
        xianyuData,
        zhuanTurnData,
        aggregateData,
        bestSource,
        confidenceScore,
      };
    } catch (error) {
      console.error('MarketDataService.getLatestMarketData 错误:', error);
      throw error;
    }
  }

  /**
   * 更新市场价格记录
   */
  async updateMarketPrice(
    id: string,
    data: MarketPriceUpdateParams
  ): Promise<MarketPrice> {
    try {
      const updateData: any = {};

      if (data.avgPrice !== undefined) updateData.avg_price = data.avgPrice;
      if (data.minPrice !== undefined) updateData.min_price = data.minPrice;
      if (data.maxPrice !== undefined) updateData.max_price = data.maxPrice;
      if (data.medianPrice !== undefined)
        updateData.median_price = data.medianPrice;
      if (data.sampleCount !== undefined)
        updateData.sample_count = data.sampleCount;
      if (data.freshnessScore !== undefined)
        updateData.freshness_score = data.freshnessScore;

      const { data: result, error } = await this.supabase
        .from('market_prices')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(`更新市场价格记录失败: ${error.message}`);

      return this.mapToMarketPrice(result);
    } catch (error) {
      console.error('MarketDataService.updateMarketPrice 错误:', error);
      throw error;
    }
  }

  /**
   * 删除市场价格记录
   */
  async deleteMarketPrice(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('market_prices')
        .delete()
        .eq('id', id);

      if (error) throw new Error(`删除市场价格记录失败: ${error.message}`);
    } catch (error) {
      console.error('MarketDataService.deleteMarketPrice 错误:', error);
      throw error;
    }
  }

  /**
   * 计算数据新鲜度分?   */
  calculateFreshnessScore(collectedAt: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - collectedAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > this.freshnessConfig.maxAgeDays) {
      return this.freshnessConfig.minFreshness;
    }

    const score = Math.max(
      this.freshnessConfig.minFreshness,
      1 - diffDays * this.freshnessConfig.decayRate
    );

    return parseFloat(score.toFixed(2));
  }

  /**
   * 清理过期数据
   */
  async cleanupExpiredData(maxAgeDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

      const { data, error } = await this.supabase
        .from('market_prices')
        .delete()
        .lt('collected_at', cutoffDate.toISOString());

      if (error) throw new Error(`清理过期数据失败: ${error.message}`);

      return (data as any)?.(data as any)?.length || 0;
    } catch (error) {
      console.error('MarketDataService.cleanupExpiredData 错误:', error);
      throw error;
    }
  }

  // 私有辅助方法
  private async getLatestPlatformData(
    deviceModel: string,
    source: 'xianyu' | 'zhuan_turn'
  ): Promise<PriceStatistics | null> {
    try {
      const { data: result, error } = await this.supabase
        .from('market_prices')
        .select('*')
        .eq('device_model', deviceModel)
        .eq('source', source)
        .order('collected_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !result) return null;

      return {
        deviceModel: result.device_model,
        avgPrice: result.avg_price || 0,
        minPrice: result.min_price || 0,
        maxPrice: result.max_price || 0,
        medianPrice: result.median_price || 0,
        sampleCount: result.sample_count,
        source: result.source,
        freshnessScore: result.freshness_score,
        collectedAt: new Date(result.collected_at),
      };
    } catch (error) {
      console.warn(`获取${source}平台数据失败:`, error);
      return null;
    }
  }

  private calculateAggregateData(
    platformData: (PriceStatistics | null)[]
  ): PriceStatistics | null {
    const validData = platformData.filter(Boolean) as PriceStatistics[];
    if (validData.length === 0) return null;

    const avgPrices = validData.map(d => d.avgPrice);
    const minPrices = validData.map(d => d.minPrice);
    const maxPrices = validData.map(d => d.maxPrice);
    const medianPrices = validData.map(d => d.medianPrice);
    const sampleCounts = validData.map(d => d.sampleCount);

    return {
      deviceModel: validData[0].deviceModel,
      avgPrice: parseFloat(
        (avgPrices.reduce((a, b) => a + b, 0) / avgPrices.length).toFixed(2)
      ),
      minPrice: Math.min(...minPrices),
      maxPrice: Math.max(...maxPrices),
      medianPrice: parseFloat(
        (medianPrices.reduce((a, b) => a + b, 0) / medianPrices.length).toFixed(
          2
        )
      ),
      sampleCount: sampleCounts.reduce((a, b) => a + b, 0),
      source: 'aggregate',
      freshnessScore: parseFloat(
        (
          validData.map(d => d.freshnessScore).reduce((a, b) => a + b, 0) /
          validData.length
        ).toFixed(2)
      ),
      collectedAt: new Date(),
    };
  }

  private determineBestSource(
    xianyuData: PriceStatistics | null,
    zhuanTurnData: PriceStatistics | null,
    aggregateData: PriceStatistics | null
  ): 'xianyu' | 'zhuan_turn' | 'aggregate' {
    // 优先选择样本量大的数据源
    const sources = [
      {
        data: xianyuData,
        name: 'xianyu' as const,
        score: xianyuData?.sampleCount || 0,
      },
      {
        data: zhuanTurnData,
        name: 'zhuan_turn' as const,
        score: zhuanTurnData?.sampleCount || 0,
      },
    ].filter(s => s.data !== null);

    if (sources.length === 0) return 'aggregate';

    sources.sort((a, b) => b.score - a.score);
    return sources[0].name;
  }

  private calculateConfidenceScore(
    xianyuData: PriceStatistics | null,
    zhuanTurnData: PriceStatistics | null
  ): number {
    const validSources = [xianyuData, zhuanTurnData].filter(Boolean).length;
    const totalSamples =
      (xianyuData?.sampleCount || 0) + (zhuanTurnData?.sampleCount || 0);

    // 基础置信度基于数据源数量
    let confidence = validSources * 0.3;

    // 样本量加?    if (totalSamples >= 20) confidence += 0.4;
    else if (totalSamples >= 10) confidence += 0.2;
    else if (totalSamples >= 5) confidence += 0.1;

    // 新鲜度加?    const avgFreshness =
      [xianyuData?.freshnessScore || 0, zhuanTurnData?.freshnessScore || 0]
        .filter(score => score > 0)
        .reduce((sum, score) => sum + score, 0) / validSources;

    confidence += avgFreshness * 0.3;

    return parseFloat(Math.min(1, confidence).toFixed(2));
  }

  private mapToMarketPrice(row: any): MarketPrice {
    return {
      id: row.id,
      deviceModel: row.device_model,
      avgPrice: row.avg_price,
      minPrice: row.min_price,
      maxPrice: row.max_price,
      medianPrice: row.median_price,
      sampleCount: row.sample_count,
      source: row.source,
      freshnessScore: row.freshness_score,
      collectedAt: new Date(row.collected_at),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

// 导出单例实例
export const marketDataService = new MarketDataService();
