import { marketDataService } from '@/services/market-data.service';
import { zhuanCollectorService } from '@/services/zhuan-collector.service';
import { 
  MarketPriceCreateParams,
  AggregatedMarketData,
  CollectionTaskConfig
} from '@/lib/types/market.types';

// 定时任务管理器
class CronJobManager {
  private jobs: Map<string, NodeJS.Timeout> = new Map();
  
  schedule(name: string, callback: () => void, intervalMs: number): void {
    if (this.jobs.has(name)) {
      this.cancel(name);
    }
    
    const job = setInterval(callback, intervalMs);
    this.jobs.set(name, job);
    console.log(`⏰ 定时任务已调度: ${name} (间隔: ${intervalMs}ms)`);
  }
  
  cancel(name: string): void {
    const job = this.jobs.get(name);
    if (job) {
      clearInterval(job);
      this.jobs.delete(name);
      console.log(`🛑 定时任务已取消: ${name}`);
    }
  }
  
  list(): string[] {
    return Array.from(this.jobs.keys());
  }
}

export class MarketAggregatorService {
  private cronManager: CronJobManager;
  private isRunning: boolean = false;
  private targetModels: string[];
  
  constructor(targetModels: string[] = []) {
    this.cronManager = new CronJobManager();
    this.targetModels = targetModels.length > 0 ? targetModels : this.getDefaultTargetModels();
  }

  /**
   * 启动市场数据聚合服务
   */
  async startAggregation(intervalMinutes: number = 60): Promise<void> {
    if (this.isRunning) {
      console.log('🔄 市场数据聚合服务已在运行中');
      return;
    }

    this.isRunning = true;
    console.log('🚀 启动市场数据聚合服务');
    
    try {
      // 立即执行一次聚合
      await this.performAggregation();
      
      // 设置定时聚合任务
      const intervalMs = intervalMinutes * 60 * 1000;
      this.cronManager.schedule('market-aggregation', async () => {
        if (this.isRunning) {
          await this.performAggregation();
        }
      }, intervalMs);
      
      console.log(`✅ 市场数据聚合服务已启动，聚合间隔: ${intervalMinutes}分钟`);
      
    } catch (error) {
      console.error('❌ 启动市场数据聚合服务失败:', error);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * 停止市场数据聚合服务
   */
  stopAggregation(): void {
    this.isRunning = false;
    this.cronManager.cancel('market-aggregation');
    console.log('🛑 市场数据聚合服务已停止');
  }

  /**
   * 执行市场数据聚合
   */
  private async performAggregation(): Promise<void> {
    console.log('🔄 开始执行市场数据聚合...');
    const startTime = Date.now();
    
    try {
      // 1. 触发转转数据采集
      console.log('📥 触发转转数据采集...');
      await zhuanCollectorService.triggerManualCollection(this.targetModels);
      
      // 2. 聚合各平台数据
      console.log('📊 开始聚合各平台数据...');
      const aggregatedResults: AggregatedMarketData[] = [];
      
      for (const model of this.targetModels) {
        try {
          const marketData = await marketDataService.getLatestMarketData(model);
          aggregatedResults.push(marketData);
          
          // 创建聚合数据记录
          if (marketData.aggregateData) {
            const aggregateRecord: MarketPriceCreateParams = {
              deviceModel: model,
              avgPrice: marketData.aggregateData.avgPrice,
              minPrice: marketData.aggregateData.minPrice,
              maxPrice: marketData.aggregateData.maxPrice,
              medianPrice: marketData.aggregateData.medianPrice,
              sampleCount: marketData.aggregateData.sampleCount,
              source: 'aggregate',
              freshnessScore: marketData.aggregateData.freshnessScore
            };
            
            await marketDataService.createMarketPrice(aggregateRecord);
          }
        } catch (error) {
          console.warn(`⚠️ 聚合型号 ${model} 数据时出错:`, error);
        }
      }
      
      // 3. 清理过期数据
      console.log('🧹 清理过期数据...');
      const cleanedCount = await marketDataService.cleanupExpiredData(30);
      
      const duration = Date.now() - startTime;
      console.log(`✅ 市场数据聚合完成`);
      console.log(`   • 处理型号数量: ${this.targetModels.length}`);
      console.log(`   • 聚合结果数量: ${aggregatedResults.length}`);
      console.log(`   • 清理过期记录: ${cleanedCount} 条`);
      console.log(`   • 执行耗时: ${duration}ms`);
      
    } catch (error) {
      console.error('❌ 市场数据聚合失败:', error);
      throw error;
    }
  }

  /**
   * 手动触发单次聚合
   */
  async triggerManualAggregation(models?: string[]): Promise<AggregatedMarketData[]> {
    const targetModels = models || this.targetModels;
    console.log(`🎯 手动触发聚合: ${targetModels.join(', ')}`);
    
    const results: AggregatedMarketData[] = [];
    
    for (const model of targetModels) {
      try {
        const marketData = await marketDataService.getLatestMarketData(model);
        results.push(marketData);
      } catch (error) {
        console.warn(`⚠️ 获取型号 ${model} 数据时出错:`, error);
      }
    }
    
    return results;
  }

  /**
   * 获取服务状态
   */
  getStatus(): {
    isRunning: boolean;
    scheduledJobs: string[];
    targetModels: string[];
    lastRun?: Date;
  } {
    return {
      isRunning: this.isRunning,
      scheduledJobs: this.cronManager.list(),
      targetModels: [...this.targetModels],
      lastRun: this.isRunning ? new Date() : undefined
    };
  }

  /**
   * 更新目标型号列表
   */
  updateTargetModels(models: string[]): void {
    this.targetModels = [...models];
    console.log(`⚙️ 目标型号列表已更新: ${models.join(', ')}`);
  }

  /**
   * 添加目标型号
   */
  addTargetModel(model: string): void {
    if (!this.targetModels.includes(model)) {
      this.targetModels.push(model);
      console.log(`➕ 添加目标型号: ${model}`);
    }
  }

  /**
   * 移除目标型号
   */
  removeTargetModel(model: string): void {
    const index = this.targetModels.indexOf(model);
    if (index > -1) {
      this.targetModels.splice(index, 1);
      console.log(`➖ 移除目标型号: ${model}`);
    }
  }

  /**
   * 获取默认目标型号列表
   */
  private getDefaultTargetModels(): string[] {
    return [
      'iPhone 14',
      'iPhone 13',
      'iPhone 12',
      'Samsung Galaxy S23',
      'Samsung Galaxy S22',
      'Huawei P50',
      'Xiaomi 13',
      'iPad Pro 12.9',
      'MacBook Pro 14"',
      'AirPods Pro'
    ];
  }
}

// 市场数据聚合配置
export const MARKET_AGGREGATION_CONFIG = {
  // 聚合间隔（分钟）
  aggregationInterval: 60,
  
  // 数据保留天数
  dataRetentionDays: 30,
  
  // 最小样本量要求
  minSampleCount: 5,
  
  // 新鲜度阈值
  minFreshnessScore: 0.5,
  
  // 并发处理数量
  concurrentProcessing: 3
};

// 导出单例实例
export const marketAggregatorService = new MarketAggregatorService();