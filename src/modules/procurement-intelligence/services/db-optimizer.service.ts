// 采购智能体数据库查询优化服务
// 提供优化的查询方法和性能监控

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 查询性能监控接口
interface QueryPerformance {
  queryName: string;
  executionTime: number; // ms
  rowCount: number;
  cacheHit: boolean;
  timestamp: string;
}

// 慢查询记录接?interface SlowQueryRecord {
  query: string;
  executionTime: number;
  timestamp: string;
  tableName: string;
  suggestedIndex?: string;
}

export class DatabaseQueryOptimizer {
  private static performanceLogs: QueryPerformance[] = [];
  private static slowQueryThreshold = 500; // 500ms阈?
  /**
   * 获取优化的供应商查询
   */
  static async getOptimizedSuppliers(
    limit: number = 10,
    filters: {
      country?: string;
      industry?: string;
      minQualityScore?: number;
      minDeliveryScore?: number;
    } = {}
  ) {
    const startTime = Date.now();

    try {
      // 使用优化的视图查?      let query = supabase
        .from('v_supplier_comprehensive_scores')
        .select('*')
        .gte('quality_score', filters.minQualityScore || 80)
        .gte('delivery_score', filters.minDeliveryScore || 80)
        .order('composite_score', { ascending: false })
        .limit(limit);

      // 应用过滤条件
      if (filters.country) {
        query = query.eq('registration_country', filters.country);
      }

      if (filters.industry) {
        // 注意：视图可能不直接支持数组查询，这里使用原始表
        query = supabase
          .from('supplier_intelligence_profiles')
          .select('*')
          .gte('quality_score', filters.minQualityScore || 80)
          .gte('delivery_score', filters.minDeliveryScore || 80)
          .contains('industries_served', [filters.industry])
          .order('quality_score', { ascending: false })
          .limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      const executionTime = Date.now() - startTime;

      // 记录性能
      this.logPerformance(
        'getOptimizedSuppliers',
        executionTime,
        (data as any)?.length || 0
      );

      // 检查是否为慢查?      if (executionTime > this.slowQueryThreshold) {
        this.logSlowQuery(
          'SELECT * FROM v_supplier_comprehensive_scores...',
          executionTime,
          'supplier_intelligence_profiles',
          'idx_supplier_profiles_composite'
        );
      }

      return data;
    } catch (error) {
      console.error('优化供应商查询失?', error);
      throw error;
    }
  }

  /**
   * 获取优化的价格指数查?   */
  static async getOptimizedPriceIndices(
    commodity: string,
    days: number = 30,
    region?: string
  ) {
    const startTime = Date.now();

    try {
      // 使用优化的时间索引查?      let query = supabase
        .from('international_price_indices')
        .select('*')
        .eq('commodity', commodity)
        .gte(
          'recorded_at',
          new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
        )
        .order('recorded_at', { ascending: false })
        .limit(1000);

      if (region) {
        query = query.eq('region', region);
      }

      const { data, error } = await query;

      if (error) throw error;

      const executionTime = Date.now() - startTime;

      this.logPerformance(
        'getOptimizedPriceIndices',
        executionTime,
        (data as any)?.length || 0
      );

      if (executionTime > this.slowQueryThreshold) {
        this.logSlowQuery(
          `SELECT * FROM international_price_indices WHERE commodity='${commodity}'...`,
          executionTime,
          'international_price_indices',
          'idx_price_indices_time_commodity'
        );
      }

      return data;
    } catch (error) {
      console.error('优化价格指数查询失败:', error);
      throw error;
    }
  }

  /**
   * 使用存储过程获取顶级供应?   */
  static async getTopSuppliersViaFunction(
    limit: number = 10,
    country?: string,
    industry?: string
  ) {
    const startTime = Date.now();

    try {
      const { data, error } = await supabase.rpc('get_top_suppliers', {
        p_limit: limit,
        p_country: country,
        p_industry: industry,
      });

      if (error) throw error;

      const executionTime = Date.now() - startTime;

      this.logPerformance(
        'getTopSuppliersViaFunction',
        executionTime,
        (data as any)?.length || 0
      );

      return data;
    } catch (error) {
      console.error('存储过程查询失败:', error);
      // 降级到普通查?      return await this.getOptimizedSuppliers(limit, { country, industry });
    }
  }

  /**
   * 分析价格趋势
   */
  static async analyzePriceTrends(commodity: string, days: number = 30) {
    const startTime = Date.now();

    try {
      const { data, error } = await supabase.rpc('analyze_price_trends', {
        p_commodity: commodity,
        p_days: days,
      });

      if (error) throw error;

      const executionTime = Date.now() - startTime;

      this.logPerformance(
        'analyzePriceTrends',
        executionTime,
        (data as any)?.length || 0
      );

      return data?.[0]; // 存储过程返回数组
    } catch (error) {
      console.error('价格趋势分析失败:', error);
      // 降级到本地计?      return await this.calculatePriceTrendsFallback(commodity, days);
    }
  }

  /**
   * 降级的价格趋势计算（当存储过程不可用时）
   */
  private static async calculatePriceTrendsFallback(
    commodity: string,
    days: number
  ) {
    try {
      const priceData = await this.getOptimizedPriceIndices(commodity, days);

      if (!priceData || priceData.length < 2) {
        return null;
      }

      // 按时间排?      const sortedData = [...priceData].sort(
        (a, b) =>
          new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
      );

      const currentPrice = sortedData[sortedData.length - 1].price;
      const previousPrice = sortedData[0].price;
      const priceChange = currentPrice - previousPrice;
      const priceChangePercent =
        previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;

      // 计算波动?      const prices = sortedData.map(d => d.price);
      const avgPrice =
        prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const variance =
        prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) /
        prices.length;
      const volatilityIndex = Math.sqrt(variance);

      return {
        commodity,
        current_price: parseFloat(currentPrice.toFixed(2)),
        previous_price: parseFloat(previousPrice.toFixed(2)),
        price_change: parseFloat(priceChange.toFixed(2)),
        price_change_percent: parseFloat(priceChangePercent.toFixed(2)),
        volatility_index: parseFloat(volatilityIndex.toFixed(2)),
        trend_direction: this.determineTrendDirection(priceChangePercent),
      };
    } catch (error) {
      console.error('价格趋势计算降级失败:', error);
      return null;
    }
  }

  /**
   * 确定趋势方向
   */
  private static determineTrendDirection(changePercent: number): string {
    if (changePercent > 5) return 'strong_up';
    if (changePercent > 1) return 'moderate_up';
    if (changePercent > -1) return 'stable';
    if (changePercent > -5) return 'moderate_down';
    return 'strong_down';
  }

  /**
   * 记录查询性能
   */
  private static logPerformance(
    queryName: string,
    executionTime: number,
    rowCount: number
  ): void {
    const logEntry: QueryPerformance = {
      queryName,
      executionTime,
      rowCount,
      cacheHit: false, // 简化处?      timestamp: new Date().toISOString(),
    };

    this.performanceLogs.push(logEntry);

    // 保持日志数量限制
    if (this.performanceLogs.length > 1000) {
      this.performanceLogs = this.performanceLogs.slice(-500);
    }

    // 输出性能信息
    if (executionTime > 200) {
      console.warn(
        `⚠️  慢查询警?[${queryName}]: ${executionTime}ms, ${rowCount}行`
      );
    } else {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
        `�?[${queryName}] 执行时间: ${executionTime}ms, 返回: ${rowCount}行`
      )}
  }

  /**
   * 记录慢查?   */
  private static logSlowQuery(
    query: string,
    executionTime: number,
    tableName: string,
    suggestedIndex?: string
  ): void {
    const slowQuery: SlowQueryRecord = {
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      executionTime,
      timestamp: new Date().toISOString(),
      tableName,
      suggestedIndex,
    };

    console.warn('🐌 慢查询记?', slowQuery);

    // 这里可以将慢查询记录保存到专门的日志表中
    // await this.saveSlowQueryLog(slowQuery);
  }

  /**
   * 获取性能统计
   */
  static getPerformanceStats(): {
    totalQueries: number;
    averageExecutionTime: number;
    slowQueries: number;
    recentLogs: QueryPerformance[];
  } {
    const recentLogs = this.performanceLogs.slice(-50);
    const totalQueries = this.performanceLogs.length;
    const averageExecutionTime =
      totalQueries > 0
        ? this.performanceLogs.reduce(
            (sum, log) => sum + log.executionTime,
            0
          ) / totalQueries
        : 0;
    const slowQueries = this.performanceLogs.filter(
      log => log.executionTime > this.slowQueryThreshold
    ).length;

    return {
      totalQueries,
      averageExecutionTime: parseFloat(averageExecutionTime.toFixed(2)),
      slowQueries,
      recentLogs,
    };
  }

  /**
   * 清理性能日志
   */
  static clearPerformanceLogs(): void {
    this.performanceLogs = [];
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🗑�? 性能日志已清?)}

  /**
   * 设置慢查询阈?   */
  static setSlowQueryThreshold(threshold: number): void {
    this.slowQueryThreshold = threshold;
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`⏱️  慢查询阈值设置为: ${threshold}ms`)}
}

// 查询构建器辅助类
export class OptimizedQueryBuilder {
  private table: string;
  private selects: string[] = ['*'];
  private wheres: Array<{ column: string; operator: string; value: any }> = [];
  private orders: Array<{ column: string; ascending: boolean }> = [];
  private limitCount?: number;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string[]): this {
    this.selects = columns;
    return this;
  }

  where(column: string, operator: string, value: any): this {
    this.wheres.push({ column, operator, value });
    return this;
  }

  orderBy(column: string, ascending: boolean = true): this {
    this.orders.push({ column, ascending });
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  /**
   * 构建并执行查?   */
  async execute(): Promise<any[]> {
    let query = supabase.from(this.table).select(this.selects.join(', '));

    // 应用WHERE条件
    this.wheres.forEach(({ column, operator, value }) => {
      switch (operator) {
        case '=':
          query = query.eq(column, value);
          break;
        case '>':
          query = query.gt(column, value);
          break;
        case '<':
          query = query.lt(column, value);
          break;
        case '>=':
          query = query.gte(column, value);
          break;
        case '<=':
          query = query.lte(column, value);
          break;
        case 'in':
          query = query.in(column, value);
          break;
        case 'contains':
          query = query.contains(column, value);
          break;
      }
    });

    // 应用排序
    this.orders.forEach(({ column, ascending }) => {
      query = query.order(column, { ascending });
    });

    // 应用限制
    if (this.limitCount) {
      query = query.limit(this.limitCount);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`查询执行失败: ${error.message}`);
    }

    return data || [];
  }
}
