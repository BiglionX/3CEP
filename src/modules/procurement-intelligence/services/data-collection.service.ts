import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

// 初始?Supabase 客户?const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SupplierData {
  supplier_id: string;
  company_name: string;
  registration_country: string;
  business_scale: 'enterprise' | 'mid_market' | 'sme' | 'startup';
  website?: string;
  contact_info?: string;
  established_year?: number;
  employee_count?: number;
  annual_revenue?: number;
  industries_served?: string[];
  certifications?: string[];
  compliance_status?: 'compliant' | 'non_compliant' | 'under_review';
  data_source:
    | 'web_scraping'
    | 'api_integration'
    | 'manual_entry'
    | 'third_party';
  confidence_level: number; // 0-1
  collected_at: string;
}

interface MarketPriceData {
  commodity_id: string;
  commodity_name: string;
  region: string;
  currency: string;
  price: number;
  unit: string;
  price_date: string;
  source: string;
  confidence_level: number;
  volatility_index?: number;
  trend_direction?: 'up' | 'down' | 'stable';
}

interface CollectionConfig {
  suppliers: {
    enabled: boolean;
    sources: string[];
    frequency: 'hourly' | 'daily' | 'weekly';
    max_records: number;
  };
  market_prices: {
    enabled: boolean;
    commodities: string[];
    regions: string[];
    frequency: 'hourly' | 'daily';
    max_records: number;
  };
}

export class DataCollectionService {
  private config: CollectionConfig;

  constructor(config?: Partial<CollectionConfig>) {
    this.config = {
      suppliers: {
        enabled: true,
        sources: ['company_registry', 'business_databases', 'web_scraping'],
        frequency: 'daily',
        max_records: 1000,
      },
      market_prices: {
        enabled: true,
        commodities: [
          'semiconductors',
          'electronics_components',
          'raw_materials',
        ],
        regions: ['asia_pacific', 'north_america', 'europe'],
        frequency: 'hourly',
        max_records: 5000,
      },
      ...config,
    };
  }

  /**
   * 收集供应商数?   */
  async collectSupplierData(): Promise<void> {
    if (!this.config.suppliers.enabled) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('供应商数据收集已禁用')return;
    }

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🚀 开始收集供应商数据...')try {
      // 1. 从不同数据源收集数据
      const collectedData = await this.collectFromMultipleSources();

      // 2. 数据清洗和标准化
      const cleanedData = await this.cleanAndStandardizeData(collectedData);

      // 3. 存储到数据库
      await this.storeSupplierData(cleanedData);

      // 4. 更新统计信息
      await this.updateCollectionStats('suppliers', cleanedData.length);

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?成功收集并存?${cleanedData.length} 条供应商数据`)} catch (error) {
      console.error('�?供应商数据收集失?', error);
      throw error;
    }
  }

  /**
   * 收集国际市场价格数据
   */
  async collectMarketPriceData(): Promise<void> {
    if (!this.config.market_prices.enabled) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('市场价格数据收集已禁?)return;
    }

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('📊 开始收集国际市场价格数?..')try {
      // 1. 收集价格数据
      const priceData = await this.collectPriceData();

      // 2. 计算波动指数
      const analyzedData = await this.analyzePriceVolatility(priceData);

      // 3. 存储数据
      await this.storeMarketPriceData(analyzedData);

      // 4. 更新统计信息
      await this.updateCollectionStats('market_prices', analyzedData.length);

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?成功收集并分?${analyzedData.length} 条价格数据`)} catch (error) {
      console.error('�?市场价格数据收集失败:', error);
      throw error;
    }
  }

  /**
   * 从多个数据源收集供应商数?   */
  private async collectFromMultipleSources(): Promise<any[]> {
    const allData: any[] = [];

    // 模拟从不同来源收集数?    const sources = [
      this.collectFromCompanyRegistry(),
      this.collectFromBusinessDatabase(),
      this.collectFromWebScraping(),
    ];

    const results = await Promise.allSettled(sources);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
          `�?数据?${index + 1} 收集成功: ${result.value.length} 条记录`
        )allData.push(...result.value);
      } else {
        console.warn(`⚠️ 数据?${index + 1} 收集失败:`, result.reason);
      }
    });

    return allData;
  }

  /**
   * 从公司注册数据库收集数据
   */
  private async collectFromCompanyRegistry(): Promise<any[]> {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000));

    return [
      {
        supplier_id: 'reg_' + Date.now() + '_001',
        company_name: 'Samsung Electronics Co., Ltd.',
        registration_country: '韩国',
        business_scale: 'enterprise',
        website: 'https://www.samsung.com',
        established_year: 1969,
        employee_count: 267000,
        annual_revenue: 197700000000,
        industries_served: ['electronics', 'semiconductors', 'mobile'],
        certifications: ['ISO 9001', 'ISO 14001'],
        compliance_status: 'compliant',
        data_source: 'company_registry',
        confidence_level: 0.95,
        collected_at: new Date().toISOString(),
      },
      {
        supplier_id: 'reg_' + Date.now() + '_002',
        company_name: 'Foxconn Technology Group',
        registration_country: '台湾',
        business_scale: 'enterprise',
        website: 'https://www.foxconn.com',
        established_year: 1974,
        employee_count: 660000,
        annual_revenue: 135000000000,
        industries_served: ['electronics_manufacturing', 'assembly'],
        certifications: ['ISO 9001', 'TS 16949'],
        compliance_status: 'compliant',
        data_source: 'company_registry',
        confidence_level: 0.92,
        collected_at: new Date().toISOString(),
      },
    ];
  }

  /**
   * 从商业数据库收集数据
   */
  private async collectFromBusinessDatabase(): Promise<any[]> {
    // 模拟数据库查?    await new Promise(resolve => setTimeout(resolve, 800));

    return [
      {
        supplier_id: 'db_' + Date.now() + '_001',
        company_name: 'Texas Instruments Incorporated',
        registration_country: '美国',
        business_scale: 'enterprise',
        website: 'https://www.ti.com',
        established_year: 1930,
        employee_count: 31000,
        annual_revenue: 15780000000,
        industries_served: ['semiconductors', 'analog_chips'],
        certifications: ['ISO 9001', 'IATF 16949'],
        compliance_status: 'compliant',
        data_source: 'business_database',
        confidence_level: 0.9,
        collected_at: new Date().toISOString(),
      },
    ];
  }

  /**
   * 从网络爬虫收集数?   */
  private async collectFromWebScraping(): Promise<any[]> {
    // 模拟网页抓取
    await new Promise(resolve => setTimeout(resolve, 1200));

    return [
      {
        supplier_id: 'web_' + Date.now() + '_001',
        company_name: 'Qualcomm Incorporated',
        registration_country: '美国',
        business_scale: 'enterprise',
        website: 'https://www.qualcomm.com',
        established_year: 1985,
        employee_count: 51000,
        annual_revenue: 35000000000,
        industries_served: ['wireless_technology', 'chipsets'],
        certifications: ['ISO 9001'],
        compliance_status: 'compliant',
        data_source: 'web_scraping',
        confidence_level: 0.85,
        collected_at: new Date().toISOString(),
      },
    ];
  }

  /**
   * 清洗和标准化数据
   */
  private async cleanAndStandardizeData(
    rawData: any[]
  ): Promise<SupplierData[]> {
    const cleanedData: SupplierData[] = [];

    for (const record of rawData) {
      try {
        // 数据验证和清?        const cleanedRecord: SupplierData = {
          supplier_id: this.validateAndCleanId(record.supplier_id),
          company_name: this.cleanCompanyName(record.company_name),
          registration_country: this.standardizeCountry(
            record.registration_country
          ),
          business_scale: this.validateBusinessScale(record.business_scale),
          website: record.website
            ? this.validateUrl(record.website)
            : undefined,
          contact_info: record.contact_info,
          established_year: record.established_year
            ? this.validateYear(record.established_year)
            : undefined,
          employee_count: record.employee_count
            ? Math.max(0, record.employee_count)
            : undefined,
          annual_revenue: record.annual_revenue
            ? Math.max(0, record.annual_revenue)
            : undefined,
          industries_served: Array.isArray(record.industries_served)
            ? record.industries_served
            : [],
          certifications: Array.isArray(record.certifications)
            ? record.certifications
            : [],
          compliance_status: record.compliance_status || 'under_review',
          data_source: record.data_source,
          confidence_level: Math.min(
            1,
            Math.max(0, record.confidence_level || 0.5)
          ),
          collected_at: record.collected_at || new Date().toISOString(),
        };

        // 只保留有效的记录
        if (this.isValidSupplierRecord(cleanedRecord)) {
          cleanedData.push(cleanedRecord);
        }
      } catch (error) {
        console.warn('数据清洗失败:', record.supplier_id, error);
      }
    }

    return cleanedData;
  }

  /**
   * 存储供应商数据到数据?   */
  private async storeSupplierData(data: SupplierData[]): Promise<void> {
    if (data.length === 0) return;

    const { error } = await supabase
      .from('supplier_intelligence_profiles')
      .upsert(
        data.map(record => ({
          ...record,
          // 映射到现有表结构字段
          supplier_id: record.supplier_id,
          company_name: record.company_name,
          registration_country: record.registration_country,
          business_scale: record.business_scale,
          overall_score: this.calculateInitialScore(record),
          supplier_tier: this.determineSupplierTier(record),
          risk_score: this.calculateInitialRiskScore(record),
          last_updated: new Date().toISOString(),
          created_at: record.collected_at,
        })),
        {
          onConflict: 'supplier_id',
        }
      );

    if (error) {
      throw new Error(`存储供应商数据失? ${error.message}`);
    }
  }

  /**
   * 收集价格数据
   */
  private async collectPriceData(): Promise<MarketPriceData[]> {
    const commodities = this.config.market_prices.commodities;
    const regions = this.config.market_prices.regions;

    const priceData: MarketPriceData[] = [];

    for (const commodity of commodities) {
      for (const region of regions) {
        // 模拟价格数据收集
        const basePrice = this.getBasePrice(commodity);
        const regionalMultiplier = this.getRegionalMultiplier(region);
        const fluctuation = (Math.random() - 0.5) * 0.1; // ±5% 波动

        const price = basePrice * regionalMultiplier * (1 + fluctuation);

        priceData.push({
          commodity_id: `${commodity}_${region}_${Date.now()}`,
          commodity_name: commodity,
          region: region,
          currency: this.getRegionCurrency(region),
          price: parseFloat(price.toFixed(2)),
          unit: this.getCommodityUnit(commodity),
          price_date: new Date().toISOString(),
          source: 'market_data_api',
          confidence_level: 0.85 + Math.random() * 0.15,
          volatility_index: Math.abs(fluctuation) * 100,
        });
      }
    }

    return priceData;
  }

  /**
   * 分析价格波动
   */
  private async analyzePriceVolatility(
    priceData: MarketPriceData[]
  ): Promise<MarketPriceData[]> {
    // 计算趋势方向
    return priceData.map(data => {
      let trend: 'up' | 'down' | 'stable' = 'stable';

      if (data.volatility_index! > 5) {
        trend = data.volatility_index! > 10 ? 'up' : 'down';
      }

      return {
        ...data,
        trend_direction: trend,
      };
    });
  }

  /**
   * 存储市场价格数据
   */
  private async storeMarketPriceData(data: MarketPriceData[]): Promise<void> {
    if (data.length === 0) return;

    const { error } = await supabase.from('international_price_indices').insert(
      data.map(record => ({
        ...record,
        id: record.commodity_id,
        commodity: record.commodity_name,
        region: record.region,
        currency: record.currency,
        price: record.price,
        unit: record.unit,
        recorded_at: record.price_date,
        source: record.source,
        confidence_level: record.confidence_level,
        volatility_index: record.volatility_index,
        trend_direction: record.trend_direction,
      }))
    );

    if (error) {
      throw new Error(`存储价格数据失败: ${error.message}`);
    }
  }

  /**
   * 更新收集统计信息
   */
  private async updateCollectionStats(
    dataType: string,
    count: number
  ): Promise<void> {
    const stats = {
      data_type: dataType,
      collection_date: new Date().toISOString().split('T')[0],
      record_count: count,
      success_rate: 1.0,
      average_confidence: 0.85,
      processing_time_ms: Math.floor(Math.random() * 2000) + 1000,
    };

    await supabase.from('data_collection_stats').upsert([stats], {
      onConflict: 'data_type,collection_date',
    });
  }

  // 辅助方法
  private validateAndCleanId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  private cleanCompanyName(name: string): string {
    return name.trim().replace(/\s+/g, ' ');
  }

  private standardizeCountry(country: string): string {
    const countryMap: Record<string, string> = {
      韩国: 'South Korea',
      台湾: 'Taiwan',
      美国: 'United States',
      中国: 'China',
      日本: 'Japan',
      德国: 'Germany',
    };
    return countryMap[country] || country;
  }

  private validateBusinessScale(scale: string): any {
    const validScales = ['enterprise', 'mid_market', 'sme', 'startup'];
    return validScales.includes(scale) ? scale : 'sme';
  }

  private validateUrl(url: string): string {
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    return url;
  }

  private validateYear(year: number): number {
    const currentYear = new Date().getFullYear();
    return Math.max(1900, Math.min(currentYear, year));
  }

  private isValidSupplierRecord(record: SupplierData): boolean {
    return !!(
      record.supplier_id &&
      record.company_name &&
      record.registration_country &&
      record.business_scale
    );
  }

  private calculateInitialScore(record: any): number {
    let score = 50; // 基础?
    // 规模加分
    if (record.business_scale === 'enterprise') score += 20;
    else if (record.business_scale === 'mid_market') score += 10;

    // 合规性加?    if (record.compliance_status === 'compliant') score += 15;

    // 认证加分
    if (record.certifications && record.certifications.length > 0) {
      score += Math.min(record.certifications.length * 5, 15);
    }

    return Math.min(100, score);
  }

  private determineSupplierTier(record: any): string {
    const score = this.calculateInitialScore(record);
    if (score >= 90) return 'premium';
    if (score >= 70) return 'standard';
    if (score >= 50) return 'basic';
    return 'risky';
  }

  private calculateInitialRiskScore(record: any): number {
    let risk = 25; // 基础风险?
    // 合规风险
    if (record.compliance_status === 'non_compliant') risk += 30;
    else if (record.compliance_status === 'under_review') risk += 15;

    // 规模风险（小企业风险较高?    if (record.business_scale === 'startup') risk += 20;
    else if (record.business_scale === 'sme') risk += 10;

    // 地缘政治风险
    const highRiskCountries = ['North Korea', 'Iran', 'Russia'];
    if (highRiskCountries.includes(record.registration_country)) {
      risk += 25;
    }

    return Math.min(100, risk);
  }

  private getBasePrice(commodity: string): number {
    const basePrices: Record<string, number> = {
      semiconductors: 50.0,
      electronics_components: 25.0,
      raw_materials: 100.0,
    };
    return basePrices[commodity] || 50.0;
  }

  private getRegionalMultiplier(region: string): number {
    const multipliers: Record<string, number> = {
      asia_pacific: 1.0,
      north_america: 1.2,
      europe: 1.1,
    };
    return multipliers[region] || 1.0;
  }

  private getRegionCurrency(region: string): string {
    const currencies: Record<string, string> = {
      asia_pacific: 'USD',
      north_america: 'USD',
      europe: 'EUR',
    };
    return currencies[region] || 'USD';
  }

  private getCommodityUnit(commodity: string): string {
    const units: Record<string, string> = {
      semiconductors: 'unit',
      electronics_components: 'piece',
      raw_materials: 'kg',
    };
    return units[commodity] || 'unit';
  }
}

// API 路由处理?export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config } = body;

    const collector = new DataCollectionService(config);

    switch (action) {
      case 'collect-all':
        await Promise.all([
          collector.collectSupplierData(),
          collector.collectMarketPriceData(),
        ]);
        return Response.json({
          success: true,
          message: '所有数据收集完?,
          timestamp: new Date().toISOString(),
        });

      case 'collect-suppliers':
        await collector.collectSupplierData();
        return Response.json({
          success: true,
          message: '供应商数据收集完?,
          timestamp: new Date().toISOString(),
        });

      case 'collect-prices':
        await collector.collectMarketPriceData();
        return Response.json({
          success: true,
          message: '价格数据收集完成',
          timestamp: new Date().toISOString(),
        });

      default:
        return Response.json(
          {
            success: false,
            error: '未知的操作类?,
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('数据收集API错误:', error);
    return Response.json(
      {
        success: false,
        error: error.message || '内部服务器错?,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';

    switch (action) {
      case 'status':
        // 获取收集状?        const { data: stats, error } = await supabase
          .from('data_collection_stats')
          .select('*')
          .order('collection_date', { ascending: false })
          .limit(10);

        if (error) throw error;

        return Response.json({
          success: true,
          stats: stats || [],
          timestamp: new Date().toISOString(),
        });

      case 'latest':
        // 获取最新收集的数据
        const dataType = searchParams.get('type') || 'suppliers';
        const limit = parseInt(searchParams.get('limit') || '10');

        let tableName = 'supplier_intelligence_profiles';
        if (dataType === 'prices') {
          tableName = 'international_price_indices';
        }

        const { data: latestData, error: latestError } = await supabase
          .from(tableName)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (latestError) throw latestError;

        return Response.json({
          success: true,
          data: latestData || [],
          dataType,
          timestamp: new Date().toISOString(),
        });

      default:
        return Response.json(
          {
            success: false,
            error: '未知的操作类?,
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('数据收集状态API错误:', error);
    return Response.json(
      {
        success: false,
        error: error.message || '内部服务器错?,
      },
      { status: 500 }
    );
  }
}
