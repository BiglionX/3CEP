import { MarketIntelligenceService } from '../../../src/modules/procurement-intelligence/services/market-intelligence.service';

// Mock Supabase client
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
};

// Mock the Supabase client creation
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabase,
}));

describe('MarketIntelligenceService', () => {
  let service: MarketIntelligenceService;

  beforeEach(() => {
    service = new MarketIntelligenceService();
    jest.clearAllMocks();
  });

  describe('constructor and configuration', () => {
    it('should initialize with default configuration', () => {
      const defaultService = new MarketIntelligenceService();

      // Access private config property for testing
      const config = (defaultService as any).config;

      expect(config.data_sources.price_feeds).toContain('market_data_api');
      expect(config.analysis_parameters.lookback_period).toBe(90);
      expect(config.reporting.frequency).toBe('daily');
    });

    it('should accept custom configuration', () => {
      const customConfig = {
        analysis_parameters: {
          lookback_period: 60,
          forecast_horizon: 15,
          volatility_window: 20,
          correlation_threshold: 0.6,
        },
        reporting: {
          frequency: 'weekly' as const,
          include_forecasts: true,
          detailed_breakdown: false,
        },
      };

      const customService = new MarketIntelligenceService(customConfig);
      const config = (customService as any).config;

      expect(config.analysis_parameters.lookback_period).toBe(60);
      expect(config.analysis_parameters.forecast_horizon).toBe(15);
      expect(config.reporting.frequency).toBe('weekly');
    });
  });

  describe('generateMarketIntelligenceReport', () => {
    it('should successfully generate market intelligence report', async () => {
      // Mock market data collection
      const mockMarketData = [
        {
          commodity: 'copper',
          region: 'Asia',
          price: 8500,
          currency: 'USD',
          unit: 'ton',
          timestamp: new Date().toISOString(),
          source: 'market_feed',
          confidence: 0.95,
          volume: 1000,
        },
      ];

      // Mock Supabase response
      mockSupabase.order.mockReturnValue({
        limit: jest.fn().mockReturnValue({
          in: jest
            .fn()
            .mockResolvedValue({ data: mockMarketData, error: null }),
        }),
      });

      const report = await service.generateMarketIntelligenceReport(
        ['copper'],
        ['Asia']
      );

      expect(report).toBeDefined();
      expect(report.report_id).toMatch(/^MIR_/);
      expect(report.generated_at).toBeDefined();
      expect(report.coverage_period).toBeDefined();
      expect(report.price_indices).toBeInstanceOf(Array);
      expect(report.supply_demand_analyses).toBeInstanceOf(Array);
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.order.mockReturnValue({
        limit: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' },
          }),
        }),
      });

      await expect(
        service.generateMarketIntelligenceReport(['copper'])
      ).rejects.toThrow('收集市场数据失败');
    });
  });

  describe('collectMarketData', () => {
    it('should collect market data without filters', async () => {
      const mockData = [
        {
          commodity: 'gold',
          region: 'Global',
          price: 1850,
          currency: 'USD',
          unit: 'oz',
          recorded_at: new Date().toISOString(),
          source: 'exchange',
          confidence_level: 0.98,
          trading_volume: 5000,
        },
      ];

      mockSupabase.order.mockReturnValue({
        limit: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({ data: mockData, error: null }),
        }),
      });

      const collectMethod = (service as any).collectMarketData.bind(service);
      const result = await collectMethod();

      expect(result).toHaveLength(1);
      expect(result[0].commodity).toBe('gold');
      expect(result[0].price).toBe(1850);
    });

    it('should apply commodity filters when provided', async () => {
      const mockData = [{ commodity: 'silver', price: 25 }];

      mockSupabase.order.mockReturnValue({
        limit: jest.fn().mockReturnValue({
          in: jest
            .fn()
            .mockImplementation((field: string, values: string[]) => {
              if (field === 'commodity') {
                expect(values).toEqual(['silver', 'gold']);
                return {
                  in: jest
                    .fn()
                    .mockResolvedValue({ data: mockData, error: null }),
                };
              }
              return mockSupabase;
            }),
        }),
      });

      const collectMethod = (service as any).collectMarketData.bind(service);
      await collectMethod(['silver', 'gold']);
    });
  });

  describe('calculatePriceIndices', () => {
    it('should calculate correct price indices', () => {
      const marketData = [
        {
          commodity: 'oil',
          price: 70,
          timestamp: '2024-01-01T00:00:00Z',
        },
        {
          commodity: 'oil',
          price: 75,
          timestamp: '2024-01-02T00:00:00Z',
        },
        {
          commodity: 'oil',
          price: 72,
          timestamp: '2024-01-03T00:00:00Z',
        },
      ];

      const calculateMethod = (service as any).calculatePriceIndices.bind(
        service
      );
      const indices = calculateMethod(marketData);

      expect(indices).toHaveLength(1);
      expect(indices[0].commodity).toBe('oil');
      expect(indices[0].base_price).toBe(70);
      expect(indices[0].current_price).toBe(72);
      expect(indices[0].price_change).toBe(2);
      expect(indices[0].price_change_percent).toBeCloseTo(2.86, 1);
    });

    it('should handle insufficient data points', () => {
      const marketData = [
        { commodity: 'gas', price: 3.5, timestamp: '2024-01-01T00:00:00Z' },
      ];

      const calculateMethod = (service as any).calculatePriceIndices.bind(
        service
      );
      const indices = calculateMethod(marketData);

      expect(indices).toHaveLength(0);
    });
  });

  describe('analyzeSupplyDemand', () => {
    it('should analyze supply demand status', async () => {
      const marketData = [
        {
          commodity: 'steel',
          price: 500,
          timestamp: '2024-01-01T00:00:00Z',
          volume: 1000,
        },
        {
          commodity: 'steel',
          price: 520,
          timestamp: '2024-01-15T00:00:00Z',
          volume: 1200,
        },
      ];

      // Mock the analyzeVolumeTrend method
      const analyzeVolumeSpy = jest
        .spyOn(service as any, 'analyzeVolumeTrend')
        .mockResolvedValue(0.6);

      const analyzeMethod = (service as any).analyzeSupplyDemand.bind(service);
      const analyses = await analyzeMethod(marketData);

      expect(analyses).toHaveLength(1);
      expect(analyses[0].commodity).toBe('steel');
      expect(analyzeVolumeSpy).toHaveBeenCalledWith('steel');
    });
  });

  describe('assessMarketSentiment', () => {
    it('should assess market sentiment combining multiple sources', async () => {
      const assessMethod = (service as any).assessMarketSentiment.bind(service);
      const sentiment = await assessMethod(['copper']);

      expect(sentiment).toBeDefined();
      expect(sentiment.overall_sentiment).toBeDefined();
      expect(sentiment.components).toBeDefined();
      expect(sentiment.components.news).toBeDefined();
      expect(sentiment.components.social_media).toBeDefined();
      expect(sentiment.components.technical).toBeDefined();
    });
  });

  describe('calculateVolatilityIndex', () => {
    it('should calculate correct volatility index', () => {
      const prices = [100, 105, 102, 108, 106];
      const calculateMethod = (service as any).calculateVolatilityIndex.bind(
        service
      );
      const volatility = calculateMethod(prices);

      expect(typeof volatility).toBe('number');
      expect(volatility).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 for insufficient data', () => {
      const prices = [100];
      const calculateMethod = (service as any).calculateVolatilityIndex.bind(
        service
      );
      const volatility = calculateMethod(prices);

      expect(volatility).toBe(0);
    });
  });

  describe('determinePriceTrend', () => {
    it('should correctly identify upward trend', () => {
      const determineMethod = (service as any).determinePriceTrend.bind(
        service
      );

      expect(determineMethod(10)).toBe('up');
      expect(determineMethod(6)).toBe('up');
    });

    it('should correctly identify downward trend', () => {
      const determineMethod = (service as any).determinePriceTrend.bind(
        service
      );

      expect(determineMethod(-10)).toBe('down');
      expect(determineMethod(-6)).toBe('down');
    });

    it('should identify stable trend', () => {
      const determineMethod = (service as any).determinePriceTrend.bind(
        service
      );

      expect(determineMethod(2)).toBe('stable');
      expect(determineMethod(-2)).toBe('stable');
      expect(determineMethod(0)).toBe('stable');
    });
  });

  describe('calculatePriceTrend', () => {
    it('should calculate correct price trend percentage', () => {
      const prices = [100, 120, 110, 130];
      const calculateMethod = (service as any).calculatePriceTrend.bind(
        service
      );
      const trend = calculateMethod(prices);

      expect(trend).toBeCloseTo(30, 1); // (130-100)/100 * 100 = 30%
    });

    it('should return 0 for insufficient data', () => {
      const prices = [100];
      const calculateMethod = (service as any).calculatePriceTrend.bind(
        service
      );
      const trend = calculateMethod(prices);

      expect(trend).toBe(0);
    });
  });

  describe('generateRegionalAnalysis', () => {
    it('should generate regional analysis for market data', () => {
      const marketData = [
        {
          commodity: 'rice',
          region: 'Asia',
          price: 300,
          timestamp: '2024-01-01T00:00:00Z',
        },
        {
          commodity: 'wheat',
          region: 'Europe',
          price: 250,
          timestamp: '2024-01-01T00:00:00Z',
        },
      ];

      const generateMethod = (service as any).generateRegionalAnalysis.bind(
        service
      );
      const analysis = generateMethod(marketData);

      expect(analysis).toBeInstanceOf(Array);
      expect(analysis.length).toBeGreaterThanOrEqual(2);
      expect(analysis.some((a: any) => a.region === 'Asia')).toBeTruthy();
      expect(analysis.some((a: any) => a.region === 'Europe')).toBeTruthy();
    });
  });

  describe('analyzeCommoditySpotlight', () => {
    it('should identify most volatile commodities', () => {
      const marketData = [
        { commodity: 'volatile_stock', price: 100, timestamp: '2024-01-01' },
        { commodity: 'volatile_stock', price: 120, timestamp: '2024-01-02' },
        { commodity: 'stable_bond', price: 99, timestamp: '2024-01-01' },
        { commodity: 'stable_bond', price: 101, timestamp: '2024-01-02' },
      ];

      const analyzeMethod = (service as any).analyzeCommoditySpotlight.bind(
        service
      );
      const spotlight = analyzeMethod(marketData);

      expect(spotlight).toBeInstanceOf(Array);
      expect(spotlight.length).toBeGreaterThan(0);
      expect(spotlight[0].commodity).toBeDefined();
      expect(spotlight[0].confidence_level).toBeDefined();
    });
  });

  describe('generateMarketOutlook', () => {
    it('should generate comprehensive market outlook', () => {
      const priceIndices = [
        { commodity: 'oil', trend: 'up' as const, price_change_percent: 8 },
        { commodity: 'gold', trend: 'down' as const, price_change_percent: -5 },
      ];

      const supplyDemand = [
        { commodity: 'oil', market_pressure: 'bullish' as const },
        { commodity: 'gold', market_pressure: 'bearish' as const },
      ];

      const sentiment = { overall_sentiment: 'positive' };

      const generateMethod = (service as any).generateMarketOutlook.bind(
        service
      );
      const outlook = generateMethod(priceIndices, supplyDemand, sentiment);

      expect(outlook).toBeDefined();
      expect(outlook.overall_sentiment).toBeDefined();
      expect(outlook.key_drivers).toBeInstanceOf(Array);
      expect(outlook.risk_factors).toBeInstanceOf(Array);
      expect(outlook.opportunities).toBeInstanceOf(Array);
    });
  });

  describe('helper methods', () => {
    it('should generate unique report IDs', () => {
      const generateMethod = (service as any).generateReportId.bind(service);

      const id1 = generateMethod();
      const id2 = generateMethod();

      expect(id1).toMatch(/^MIR_/);
      expect(id2).toMatch(/^MIR_/);
      expect(id1).not.toBe(id2);
    });

    it('should calculate correct coverage period', () => {
      const calculateMethod = (service as any).calculateCoveragePeriod.bind(
        service
      );
      const period = calculateMethod();

      expect(period.start).toBeDefined();
      expect(period.end).toBeDefined();
      expect(new Date(period.start) < new Date(period.end)).toBeTruthy();
    });

    it('should group data by commodity correctly', () => {
      const data = [
        { commodity: 'A', price: 100 },
        { commodity: 'B', price: 200 },
        { commodity: 'A', price: 110 },
      ];

      const groupMethod = (service as any).groupByCommodity.bind(service);
      const grouped = groupMethod(data);

      expect(grouped.A).toHaveLength(2);
      expect(grouped.B).toHaveLength(1);
      expect(grouped.A[0].price).toBe(100);
      expect(grouped.A[1].price).toBe(110);
    });

    it('should group data by region correctly', () => {
      const data = [
        { region: 'Asia', price: 100 },
        { region: 'Europe', price: 200 },
        { region: 'Asia', price: 110 },
      ];

      const groupMethod = (service as any).groupByRegion.bind(service);
      const grouped = groupMethod(data);

      expect(grouped.Asia).toHaveLength(2);
      expect(grouped.Europe).toHaveLength(1);
    });
  });
});
