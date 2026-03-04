// 使用fetch进行HTTP请求，无需额外依赖
import { marketDataService } from '@/services/market-data.service';
import {
  MarketPriceCreateParams,
  CollectionTaskConfig,
  MarketDataSource,
} from '@/lib/types/market.types';

// 第三方数据服务提供商模拟接口
interface ThirdPartyApiResponse {
  success: boolean;
  data: {
    items: Array<{
      model: string;
      avg_price: number;
      min_price: number;
      max_price: number;
      median_price: number;
      sample_count: number;
      timestamp: string;
    }>;
    total: number;
  };
  message?: string;
}

// 模拟的第三方API客户?class ThirdPartyApiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async getPriceData(
    models: string[],
    page: number = 1,
    limit: number = 50
  ): Promise<ThirdPartyApiResponse> {
    try {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📤 发送请求到第三方API: ${this.baseUrl}/prices/search`)const response = await fetch(`${this.baseUrl}/prices/search`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          models: models,
          page: page,
          limit: limit,
          platform: 'zhuan_turn',
        }),
      });

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📥 收到第三方API响应: ${response.status}`)if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      // 模拟数据（当第三方API不可用时?      console.warn('⚠️ 第三方API不可用，使用模拟数据');
      return this.generateMockData(models);
    }
  }

  private generateMockData(models: string[]): ThirdPartyApiResponse {
    const mockItems = models.map(model => ({
      model: model,
      avg_price: this.getRandomPrice(model),
      min_price: this.getRandomPrice(model) * 0.85,
      max_price: this.getRandomPrice(model) * 1.15,
      median_price: this.getRandomPrice(model) * 0.95,
      sample_count: Math.floor(Math.random() * 30) + 5,
      timestamp: new Date().toISOString(),
    }));

    return {
      success: true,
      data: {
        items: mockItems,
        total: mockItems.length,
      },
    };
  }

  private getRandomPrice(model: string): number {
    const basePrices: Record<string, number> = {
      'iPhone 14': 4500,
      'iPhone 13': 3200,
      'iPhone 12': 2500,
      'Samsung Galaxy S23': 3800,
      'Samsung Galaxy S22': 2800,
      'Huawei P50': 2200,
      'Xiaomi 13': 3200,
    };

    const basePrice = basePrices[model] || 3000;
    const variation = (Math.random() - 0.5) * 0.3; // ±15%波动
    return Math.round(basePrice * (1 + variation));
  }
}

export class ZhuanCollectorService {
  private thirdPartyClient: ThirdPartyApiClient;
  private config: CollectionTaskConfig;
  private isRunning: boolean = false;

  constructor(config: CollectionTaskConfig) {
    this.config = config;
    // 使用模拟的API密钥，实际使用时需要替换为真实的第三方API密钥
    this.thirdPartyClient = new ThirdPartyApiClient(
      process.env.THIRD_PARTY_API_KEY || 'mock_api_key',
      process.env.THIRD_PARTY_API_BASE_URL || 'https://api.mock-third-party.com'
    );
  }

  /**
   * 启动数据采集任务
   */
  async startCollection(): Promise<void> {
    if (this.isRunning) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🔄 数据采集任务已在运行?)return;
    }

    this.isRunning = true;
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🚀 启动转转数据采集任务')try {
      // 执行一次采?      await this.collectDataBatch();

      // 设置定时任务
      setInterval(
        async () => {
          if (this.isRunning) {
            await this.collectDataBatch();
          }
        },
        this.config.intervalMinutes * 60 * 1000
      );

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
        `�?数据采集任务已启动，间隔: ${this.config.intervalMinutes}分钟`
      )} catch (error) {
      console.error('�?启动数据采集任务失败:', error);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * 停止数据采集任务
   */
  stopCollection(): void {
    this.isRunning = false;
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🛑 转转数据采集任务已停?)}

  /**
   * 批量采集数据
   */
  private async collectDataBatch(): Promise<void> {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🔄 开始批量数据采?..')try {
      // 按批次处理目标型?      for (
        let i = 0;
        i < this.config.targetModels.length;
        i += this.config.batchSize
      ) {
        const batchModels = this.config.targetModels.slice(
          i,
          i + this.config.batchSize
        );
        await this.collectModelsData(batchModels);

        // 添加延迟避免请求过于频繁
        if (i + this.config.batchSize < this.config.targetModels.length) {
          await this.delay(1000); // 1秒延?        }
      }

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('�?批量数据采集完成')} catch (error) {
      console.error('�?批量数据采集失败:', error);
    }
  }

  /**
   * 采集指定型号的数?   */
  private async collectModelsData(models: string[]): Promise<void> {
    try {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📥 采集型号数据: ${models.join(', ')}`);

      // 从第三方API获取数据
      const response = await this.thirdPartyClient.getPriceData(models);

      if (!response.success) {
        throw new Error(response.message || '第三方API返回失败');
      }

      // 转换为市场价格数据格?      const marketPrices: MarketPriceCreateParams[] = response.data.items.map(
        item => ({
          deviceModel: item.model,
          avgPrice: item.avg_price,
          minPrice: item.min_price,
          maxPrice: item.max_price,
          medianPrice: item.median_price,
          sampleCount: item.sample_count,
          source: 'zhuan_turn',
        })
      );

      // 批量保存到数据库
      if (marketPrices.length > 0) {
        await marketDataService.createMarketPrices(marketPrices);
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`💾 成功保存 ${marketPrices.length} 条转转数据`)}
    } catch (error) {
      console.error(`�?采集型号数据失败 (${models.join(',')}):`, error);

      // 重试机制
      if (this.config.retryAttempts > 0) {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🔁 尝试重试... (剩余 ${this.config.retryAttempts} �?`)this.config.retryAttempts--;
        await this.delay(5000); // 5秒后重试
        await this.collectModelsData(models);
      }
    }
  }

  /**
   * 手动触发单次采集
   */
  async triggerManualCollection(models?: string[]): Promise<void> {
    const targetModels = models || this.config.targetModels;
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🎯 手动触发采集: ${targetModels.join(', ')}`);
    await this.collectModelsData(targetModels);
  }

  /**
   * 获取采集状?   */
  getStatus(): {
    isRunning: boolean;
    config: CollectionTaskConfig;
    lastRun?: Date;
  } {
    return {
      isRunning: this.isRunning,
      config: { ...this.config },
      lastRun: this.isRunning ? new Date() : undefined,
    };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<CollectionTaskConfig>): void {
    this.config = { ...this.config, ...newConfig };
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('⚙️ 采集配置已更?)}

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 默认配置
export const DEFAULT_ZHUAN_CONFIG: CollectionTaskConfig = {
  intervalMinutes: 60, // 每小时执行一?  targetModels: [
    'iPhone 14',
    'iPhone 13',
    'iPhone 12',
    'Samsung Galaxy S23',
    'Samsung Galaxy S22',
    'Huawei P50',
    'Xiaomi 13',
  ],
  sources: [
    {
      name: 'zhuan_turn',
      isEnabled: true,
      baseUrl: 'https://api.mock-third-party.com',
      rateLimit: 100, // 每分?00次请?    },
  ],
  batchSize: 5, // 每批处理5个型?  retryAttempts: 3, // 重试3�?};

// 导出单例实例
export const zhuanCollectorService = new ZhuanCollectorService(
  DEFAULT_ZHUAN_CONFIG
);
