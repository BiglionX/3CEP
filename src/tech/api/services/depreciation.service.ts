import { DeviceProfile } from '@/lib/constants/lifecycle';
import { 
  ValuationResult, 
  ValuationBreakdown,
  DeviceCondition 
} from '@/lib/valuation/valuation-engine.service';

// 折旧规则配置
interface DepreciationConfig {
  annualRate: number;        // 年折旧率
  maxYears: number;          // 最大折旧年限
  salvageValueRatio: number; // 残值比例
}

// 设备类别配置
interface CategoryConfig {
  depreciationRate: number;  // 该类别的折旧率调整
  baseLifeYears: number;     // 基础使用寿命
  premiumMultiplier: number; // 高端产品系数
}

// 品牌价值系数
interface BrandValueConfig {
  [brand: string]: number;
}

export class DepreciationEngineService {
  private depreciationConfig!: DepreciationConfig;
  private categoryConfigs!: Record<string, CategoryConfig>;
  private brandValues!: BrandValueConfig;

  constructor() {
    this.initializeConfig();
  }

  /**
   * 初始化配置参数
   */
  private initializeConfig(): void {
    // 基础折旧配置
    this.depreciationConfig = {
      annualRate: 0.15,      // 年折旧率15%
      maxYears: 8,           // 最大折旧8年
      salvageValueRatio: 0.1 // 残值为原价的10%
    };

    // 设备类别配置
    this.categoryConfigs = {
      '智能手机': {
        depreciationRate: 1.2,  // 折旧较快
        baseLifeYears: 3,
        premiumMultiplier: 1.3
      },
      '平板电脑': {
        depreciationRate: 1.0,
        baseLifeYears: 4,
        premiumMultiplier: 1.2
      },
      '笔记本电脑': {
        depreciationRate: 0.8,
        baseLifeYears: 5,
        premiumMultiplier: 1.5
      },
      '台式机': {
        depreciationRate: 0.6,
        baseLifeYears: 6,
        premiumMultiplier: 1.4
      },
      '智能手表': {
        depreciationRate: 1.5,
        baseLifeYears: 2,
        premiumMultiplier: 1.1
      },
      '耳机': {
        depreciationRate: 1.3,
        baseLifeYears: 2,
        premiumMultiplier: 1.0
      }
    };

    // 品牌价值系数
    this.brandValues = {
      'Apple': 1.5,
      'Samsung': 1.2,
      '华为': 1.1,
      '小米': 1.0,
      'OPPO': 0.9,
      'vivo': 0.9,
      '一加': 1.0,
      '荣耀': 0.95
    };
  }

  /**
   * 基于LIFE档案计算设备残值基线
   */
  async calculateBaselineValue(
    deviceProfile: DeviceProfile,
    condition?: DeviceCondition,
    marketPrice?: number
  ): Promise<ValuationResult> {
    try {
      // 1. 获取基准价格
      const originalPrice = marketPrice || this.estimateOriginalPrice(deviceProfile);
      
      // 2. 计算折旧
      const depreciation = this.calculateDepreciation(originalPrice, deviceProfile);
      
      // 3. 计算部件评分
      const componentScore = this.calculateComponentScore(deviceProfile);
      
      // 4. 计算成色乘数
      const conditionMultiplier = this.calculateConditionMultiplier(condition);
      
      // 5. 计算各项调整因子
      const brandMultiplier = this.getBrandMultiplier(deviceProfile.brandName || '');
      const categoryMultiplier = this.getCategoryMultiplier(deviceProfile.productCategory || '');
      const ageMultiplier = this.getAgeMultiplier(deviceProfile);
      const repairMultiplier = this.getRepairHistoryMultiplier(deviceProfile);
      
      // 6. 综合计算最终价值
      const baseValue = originalPrice - depreciation;
      const adjustedValue = baseValue * componentScore;
      const finalValue = adjustedValue * conditionMultiplier * brandMultiplier * categoryMultiplier * ageMultiplier * repairMultiplier;
      
      // 7. 构建详细分解
      const breakdown: ValuationBreakdown = {
        originalPrice,
        depreciation,
        componentAdjustment: componentScore,
        conditionAdjustment: conditionMultiplier,
        brandAdjustment: brandMultiplier,
        ageAdjustment: ageMultiplier,
        repairAdjustment: repairMultiplier
      };
      
      return {
        baseValue: Number(baseValue.toFixed(2)),
        componentScore: Number(componentScore.toFixed(4)),
        conditionMultiplier: Number(conditionMultiplier.toFixed(4)),
        finalValue: Number(finalValue.toFixed(2)),
        breakdown,
        currency: 'CNY'
      };
      
    } catch (error) {
      console.error('折旧引擎计算失败:', error);
      throw error;
    }
  }

  /**
   * 估算设备原始价格
   */
  private estimateOriginalPrice(deviceProfile: DeviceProfile): number {
    const model = deviceProfile.productModel.toLowerCase();
    const year = deviceProfile.manufacturingDate 
      ? new Date(deviceProfile.manufacturingDate).getFullYear() 
      : new Date().getFullYear();
    
    // 基于型号和年份估算价格
    if (model.includes('iphone')) {
      if (year >= 2023) return 6000;
      if (year >= 2021) return 5000;
      if (year >= 2019) return 3500;
      return 2000;
    }
    
    if (model.includes('galaxy') || model.includes('samsung')) {
      if (year >= 2023) return 5000;
      if (year >= 2021) return 4000;
      if (year >= 2019) return 2800;
      return 1500;
    }
    
    if (model.includes('macbook')) {
      if (year >= 2023) return 12000;
      if (year >= 2021) return 10000;
      if (year >= 2019) return 7000;
      return 4000;
    }
    
    if (model.includes('ipad')) {
      if (year >= 2023) return 4000;
      if (year >= 2021) return 3200;
      if (year >= 2019) return 2500;
      return 1800;
    }
    
    // 默认价格
    return 3000;
  }

  /**
   * 计算折旧金额
   */
  private calculateDepreciation(originalPrice: number, deviceProfile: DeviceProfile): number {
    const manufactureDate = deviceProfile.manufacturingDate 
      ? new Date(deviceProfile.manufacturingDate)
      : new Date();
    
    const now = new Date();
    const ageInYears = (now.getTime() - manufactureDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    // 获取类别配置
    const category = deviceProfile.productCategory || '智能手机';
    const categoryConfig = this.categoryConfigs[category] || this.categoryConfigs['智能手机'];
    
    // 计算调整后的折旧率
    const adjustedAnnualRate = this.depreciationConfig.annualRate * categoryConfig.depreciationRate;
    const effectiveAge = Math.min(ageInYears, this.depreciationConfig.maxYears);
    
    // 计算折旧金额
    let depreciation = originalPrice * adjustedAnnualRate * effectiveAge;
    
    // 确保不超过最大折旧
    const maxValueLoss = originalPrice * (1 - this.depreciationConfig.salvageValueRatio);
    depreciation = Math.min(depreciation, maxValueLoss);
    
    return Number(depreciation.toFixed(2));
  }

  /**
   * 计算部件评分
   */
  private calculateComponentScore(deviceProfile: DeviceProfile): number {
    let score = 1.0;
    
    // 内存评分
    if (deviceProfile.specifications?.ram) {
      const ramGB = this.parseRAM(deviceProfile.specifications.ram);
      score *= this.getRAMScore(ramGB);
    }
    
    // 存储评分
    if (deviceProfile.specifications?.storage) {
      const storageGB = this.parseStorage(deviceProfile.specifications.storage);
      score *= this.getStorageScore(storageGB);
    }
    
    // 处理器评分
    if (deviceProfile.specifications?.processor) {
      score *= this.getProcessorScore(deviceProfile.specifications.processor);
    }
    
    return Math.max(0.5, Math.min(1.5, score)); // 限制在0.5-1.5范围内
  }

  /**
   * 计算成色乘数
   */
  private calculateConditionMultiplier(condition?: DeviceCondition): number {
    if (!condition) {
      return 0.8; // 默认中等成色
    }
    
    // 各项成色权重
    const weights = {
      screen: 0.3,
      battery: 0.25,
      body: 0.25,
      functionality: 0.2
    };
    
    // 成色评分映射
    const conditionScores: Record<string, number> = {
      perfect: 1.0,
      'minor_scratches': 0.9,
      'visible_scratches': 0.8,
      'heavy_scratches': 0.6,
      cracked: 0.4,
      excellent: 1.0,
      good: 0.9,
      average: 0.7,
      poor: 0.5,
      bad: 0.3,
      mint: 1.0,
      'light_wear': 0.9,
      'moderate_wear': 0.7,
      'heavy_wear': 0.5,
      damaged: 0.3,
      'minor_issues': 0.9,
      'some_issues': 0.7,
      'major_issues': 0.4,
      'non_functional': 0.1
    };
    
    let multiplier = 0;
    multiplier += weights.screen * (conditionScores[condition.screen] || 0.8);
    multiplier += weights.battery * (conditionScores[condition.battery] || 0.8);
    multiplier += weights.body * (conditionScores[condition.body] || 0.8);
    multiplier += weights.functionality * (conditionScores[condition.functionality] || 0.9);
    
    return Math.max(0.3, Math.min(1.0, multiplier));
  }

  /**
   * 获取品牌乘数
   */
  private getBrandMultiplier(brand: string): number {
    return this.brandValues[brand] || 1.0;
  }

  /**
   * 获取类别乘数
   */
  private getCategoryMultiplier(category: string): number {
    const config = this.categoryConfigs[category];
    return config ? config.premiumMultiplier : 1.0;
  }

  /**
   * 获取年龄乘数
   */
  private getAgeMultiplier(deviceProfile: DeviceProfile): number {
    const manufactureDate = deviceProfile.manufacturingDate 
      ? new Date(deviceProfile.manufacturingDate)
      : new Date();
    
    const ageInYears = (new Date().getTime() - manufactureDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    if (ageInYears < 1) return 0.95;
    if (ageInYears < 2) return 0.85;
    if (ageInYears < 3) return 0.7;
    if (ageInYears < 4) return 0.5;
    return 0.3;
  }

  /**
   * 获取维修历史乘数
   */
  private getRepairHistoryMultiplier(deviceProfile: DeviceProfile): number {
    const repairCount = deviceProfile.totalRepairCount || 0;
    const replacementCount = deviceProfile.totalPartReplacementCount || 0;
    
    let multiplier = 1.0;
    
    // 维修次数影响
    if (repairCount > 3) multiplier *= 0.7;
    else if (repairCount > 1) multiplier *= 0.85;
    else if (repairCount > 0) multiplier *= 0.95;
    
    // 更换部件影响
    if (replacementCount > 2) multiplier *= 0.8;
    else if (replacementCount > 0) multiplier *= 0.9;
    
    return Math.max(0.5, multiplier);
  }

  // 辅助方法
  private parseRAM(ramSpec: string): number {
    const match = ramSpec.match(/(\d+)GB/i);
    return match ? parseInt(match[1]) : 4;
  }

  private parseStorage(storageSpec: string): number {
    const match = storageSpec.match(/(\d+)GB/i);
    return match ? parseInt(match[1]) : 64;
  }

  private getRAMScore(ramGB: number): number {
    if (ramGB >= 16) return 1.2;
    if (ramGB >= 12) return 1.1;
    if (ramGB >= 8) return 1.0;
    if (ramGB >= 6) return 0.9;
    return 0.8;
  }

  private getStorageScore(storageGB: number): number {
    if (storageGB >= 1000) return 1.2;
    if (storageGB >= 512) return 1.15;
    if (storageGB >= 256) return 1.1;
    if (storageGB >= 128) return 1.0;
    return 0.9;
  }

  private getProcessorScore(processor: string): number {
    const proc = processor.toLowerCase();
    if (proc.includes('m3') || proc.includes('a17') || proc.includes('snapdragon 8')) return 1.2;
    if (proc.includes('m2') || proc.includes('a16') || proc.includes('snapdragon 7')) return 1.1;
    if (proc.includes('m1') || proc.includes('a15') || proc.includes('snapdragon 6')) return 1.0;
    return 0.9;
  }

  /**
   * 获取服务配置信息
   */
  getConfig(): {
    depreciationConfig: DepreciationConfig;
    categoryConfigs: Record<string, CategoryConfig>;
    brandValues: BrandValueConfig;
  } {
    return {
      depreciationConfig: { ...this.depreciationConfig },
      categoryConfigs: { ...this.categoryConfigs },
      brandValues: { ...this.brandValues }
    };
  }
}

// 导出单例实例
export const depreciationEngineService = new DepreciationEngineService();