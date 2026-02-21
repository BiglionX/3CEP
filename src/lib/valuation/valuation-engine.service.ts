import { DeviceProfile } from '@/lib/constants/lifecycle';
import factorsConfig from './valuation-factors.json';

/**
 * 机器学习模型客户端接口
 */
interface MLModelClient {
  predict: (features: Record<string, any>) => Promise<number>;
  isAvailable: () => boolean;
}

/**
 * 简化的ML模型客户端实现
 */
class SimpleMLClient implements MLModelClient {
  private isModelAvailable: boolean = false;
  
  constructor() {
    // 检查ML服务是否可用
    this.checkModelAvailability();
  }
  
  async checkModelAvailability() {
    try {
      // 这里应该检查实际的ML服务
      // 暂时模拟可用状态
      this.isModelAvailable = true;
    } catch (error) {
      this.isModelAvailable = false;
    }
  }
  
  isAvailable(): boolean {
    return this.isModelAvailable;
  }
  
  async predict(features: Record<string, any>): Promise<number> {
    if (!this.isAvailable()) {
      throw new Error('ML模型不可用');
    }
    
    // 简化的ML预测逻辑
    // 实际部署时应该调用真正的ML服务
    return this.simpleMLPrediction(features);
  }
  
  /**
   * 简化的机器学习预测
   * 实际应用中应该调用训练好的模型
   */
  private simpleMLPrediction(features: Record<string, any>): number {
    // 基于特征的重要性和权重进行预测
    const weights = {
      age_months: -0.15,
      ram_gb: 0.25,
      storage_gb: 0.15,
      cpu_score: 0.30,
      screen_condition: 0.10,
      battery_health: 0.08,
      body_condition: 0.05,
      functionality_score: 0.02
    };
    
    let score = 0;
    let totalWeight = 0;
    
    Object.entries(weights).forEach(([feature, weight]) => {
      if (features.hasOwnProperty(feature)) {
        score += features[feature] * weight;
        totalWeight += Math.abs(weight);
      }
    });
    
    // 基准价格 + 加权分数
    const basePrice = 3000;
    const priceRange = 2500;
    return basePrice + (score / totalWeight) * priceRange;
  }
}

/**
 * 设备估值引擎服务
 * 基于eReuse RdeviceScore核心思想实现的基础估值算法
 */

export interface ValuationResult {
  baseValue: number;           // 基础价值
  componentScore: number;      // 部件评分
  conditionMultiplier: number; // 成色乘数
  finalValue: number;          // 最终估值
  breakdown: ValuationBreakdown; // 详细分解
  currency: string;            // 货币单位
}

export interface ValuationBreakdown {
  originalPrice: number;       // 原始价格
  depreciation: number;        // 折旧金额
  componentAdjustment: number; // 部件调整
  conditionAdjustment: number; // 成色调整
  brandAdjustment: number;     // 品牌调整
  ageAdjustment: number;       // 年龄调整
  repairAdjustment: number;    // 维修历史调整
  // ML模型相关信息
  mlPrediction?: number;       // ML模型预测值
  ruleBasedValue?: number;     // 规则引擎估值
  strategyUsed?: string;       // 使用的策略
}

export interface DeviceCondition {
  screen: 'perfect' | 'minor_scratches' | 'visible_scratches' | 'heavy_scratches' | 'cracked';
  battery: 'excellent' | 'good' | 'average' | 'poor' | 'bad';
  body: 'mint' | 'light_wear' | 'moderate_wear' | 'heavy_wear' | 'damaged';
  functionality: 'perfect' | 'minor_issues' | 'some_issues' | 'major_issues' | 'non_functional';
}

export class ValuationEngineService {
  private static instance: ValuationEngineService;
  private mlClient: MLModelClient;
  
  private constructor() {
    this.mlClient = new SimpleMLClient();
  }

  public static getInstance(): ValuationEngineService {
    if (!ValuationEngineService.instance) {
      ValuationEngineService.instance = new ValuationEngineService();
    }
    return ValuationEngineService.instance;
  }

  /**
   * 计算混合估值（ML模型 + 规则引擎）
   * @param deviceProfile 设备档案
   * @param condition 设备成色状态
   * @param marketPrice 当前市场价格
   * @param useMLModel 是否优先使用ML模型
   * @returns 估值结果
   */
  public async calculateHybridValue(
    deviceProfile: DeviceProfile,
    condition?: DeviceCondition,
    marketPrice?: number,
    useMLModel: boolean = true
  ): Promise<ValuationResult> {
    try {
      // 构建设备特征
      const features = this.extractDeviceFeatures(deviceProfile, condition);
      
      let mlPrediction: number | null = null;
      let ruleBasedValue: ValuationResult | null = null;
      
      // 尝试ML模型预测
      if (useMLModel && this.mlClient.isAvailable()) {
        try {
          mlPrediction = await this.mlClient.predict(features);
          console.log(`🤖 ML模型预测: ¥${mlPrediction.toFixed(2)}`);
        } catch (error) {
          console.warn('ML模型预测失败，回退到规则引擎:', error.message);
        }
      }
      
      // 规则引擎估值
      ruleBasedValue = await this.calculateBaseValue(deviceProfile, condition, marketPrice);
      console.log(`📏 规则引擎估值: ¥${ruleBasedValue.finalValue.toFixed(2)}`);
      
      // 混合策略：如果有ML预测，则加权平均
      let finalValue: number;
      let strategyUsed: string;
      
      if (mlPrediction !== null) {
        // 使用加权平均（ML 70%, 规则 30%）
        finalValue = mlPrediction * 0.7 + ruleBasedValue.finalValue * 0.3;
        strategyUsed = 'hybrid_ml_weighted';
      } else {
        // 仅使用规则引擎
        finalValue = ruleBasedValue.finalValue;
        strategyUsed = 'rule_based_only';
      }
      
      // 构建混合估值结果
      const hybridResult: ValuationResult = {
        ...ruleBasedValue,
        finalValue: Number(finalValue.toFixed(2)),
        breakdown: {
          ...ruleBasedValue.breakdown,
          mlPrediction: mlPrediction !== null ? mlPrediction : undefined,
          ruleBasedValue: ruleBasedValue.finalValue,
          strategyUsed
        }
      };
      
      return hybridResult;
      
    } catch (error) {
      console.error('混合估值计算失败:', error);
      // 完全回退到规则引擎
      return this.calculateBaseValue(deviceProfile, condition, marketPrice);
    }
  }
  
  /**
   * 提取设备特征用于ML模型
   */
  private extractDeviceFeatures(deviceProfile: DeviceProfile, condition?: DeviceCondition) {
    const specs = deviceProfile.specifications || {};
    
    const features = {
      // 基础信息
      brand_encoded: this.encodeBrand(deviceProfile.brandName || ''),
      category_encoded: this.encodeCategory(deviceProfile.productCategory || ''),
      
      // 硬件规格
      age_months: this.calculateAgeInMonths(deviceProfile.manufacturingDate),
      ram_gb: this.parseRamSize(specs.ram || specs.memory),
      storage_gb: this.parseStorageSize(specs.storage),
      cpu_score: this.getCpuPerformanceScore(specs.processor || specs.cpu),
      
      // 使用历史
      total_repair_count: deviceProfile.totalRepairCount || 0,
      part_replacement_count: deviceProfile.totalPartReplacementCount || 0,
      transfer_count: deviceProfile.totalTransferCount || 0,
      
      // 成色状态（如果提供）
      screen_condition: condition ? this.encodeScreenCondition(condition.screen) : 0.8,
      battery_health: condition ? this.encodeBatteryHealth(condition.battery) : 0.8,
      body_condition: condition ? this.encodeBodyCondition(condition.body) : 0.8,
      functionality_score: condition ? this.encodeFunctionality(condition.functionality) : 0.9,
      
      // 衍生特征
      age_ram_ratio: 0,
      storage_age_ratio: 0,
      repair_frequency: 0
    };
    
    // 计算衍生特征
    features.age_ram_ratio = features.age_months / (features.ram_gb || 1);
    features.storage_age_ratio = features.storage_gb / (features.age_months || 1);
    features.repair_frequency = features.total_repair_count / (features.age_months || 1);
    
    return features;
  }

  /**
   * 计算设备基础估值
   * @param deviceProfile 设备档案
   * @param condition 设备成色状态
   * @param marketPrice 当前市场价格（可选）
   * @returns 估值结果
   */
  public async calculateBaseValue(
    deviceProfile: DeviceProfile,
    condition?: DeviceCondition,
    marketPrice?: number
  ): Promise<ValuationResult> {
    try {
      // 1. 获取基准价格
      const originalPrice = await this.getOriginalPrice(deviceProfile, marketPrice);
      
      // 2. 计算折旧
      const depreciation = this.calculateDepreciation(originalPrice, deviceProfile);
      
      // 3. 计算部件评分
      const componentScore = this.calculateComponentScore(deviceProfile);
      
      // 4. 计算成色乘数
      const conditionMultiplier = this.calculateConditionMultiplier(condition || this.getDefaultCondition());
      
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
      console.error('估值计算失败:', error);
      throw new Error(`估值计算失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取设备原始价格
   */
  private async getOriginalPrice(deviceProfile: DeviceProfile, marketPrice?: number): Promise<number> {
    // 如果提供了市场价格，直接使用
    if (marketPrice && marketPrice > 0) {
      return marketPrice;
    }
    
    // 否则根据型号和年份估算价格
    const basePrice = this.estimateBasePrice(deviceProfile);
    return basePrice;
  }

  /**
   * 估算设备基础价格
   */
  private estimateBasePrice(deviceProfile: DeviceProfile): number {
    const model = deviceProfile.productModel.toLowerCase();
    const year = deviceProfile.manufacturingDate 
      ? new Date(deviceProfile.manufacturingDate).getFullYear() 
      : new Date().getFullYear();
    
    // 基于型号和年份的价格估算
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
    
    // 默认价格
    return 3000;
  }

  /**
   * 计算折旧金额
   */
  private calculateDepreciation(originalPrice: number, deviceProfile: DeviceProfile): number {
    const { annualRate, maxYears } = factorsConfig.depreciation;
    
    // 计算设备年龄（月）
    const manufactureDate = deviceProfile.manufacturingDate 
      ? new Date(deviceProfile.manufacturingDate)
      : new Date();
    const monthsOld = (Date.now() - manufactureDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const yearsOld = monthsOld / 12;
    
    // 应用最大年限限制
    const effectiveYears = Math.min(yearsOld, maxYears);
    
    // 计算折旧率
    const depreciationRate = Math.min(effectiveYears * annualRate, 0.9); // 最多贬值90%
    
    return originalPrice * depreciationRate;
  }

  /**
   * 计算部件评分
   */
  private calculateComponentScore(deviceProfile: DeviceProfile): number {
    const specs = deviceProfile.specifications || {};
    const weights = factorsConfig.componentWeights;
    
    let score = 0;
    let totalWeight = 0;
    
    // CPU评分（简化处理）
    if (specs.processor || specs.cpu) {
      const cpuSpec = (specs.processor || specs.cpu).toLowerCase();
      let cpuScore = 0.5; // 基础分数
      
      if (cpuSpec.includes('m3') || cpuSpec.includes('a17') || cpuSpec.includes('snapdragon 8')) {
        cpuScore = 1.0;
      } else if (cpuSpec.includes('m2') || cpuSpec.includes('a16') || cpuSpec.includes('snapdragon 7')) {
        cpuScore = 0.8;
      } else if (cpuSpec.includes('m1') || cpuSpec.includes('a15') || cpuSpec.includes('snapdragon 6')) {
        cpuScore = 0.6;
      }
      
      score += cpuScore * weights.cpu;
      totalWeight += weights.cpu;
    }
    
    // 内存评分
    if (specs.ram || specs.memory) {
      const ramSize = parseInt((specs.ram || specs.memory).toString()) || 0;
      let ramScore = 0.3; // 基础分数
      
      if (ramSize >= 16) ramScore = 1.0;
      else if (ramSize >= 12) ramScore = 0.9;
      else if (ramSize >= 8) ramScore = 0.7;
      else if (ramSize >= 6) ramScore = 0.5;
      
      score += ramScore * weights.memory;
      totalWeight += weights.memory;
    }
    
    // 存储评分
    if (specs.storage) {
      const storageSize = parseInt(specs.storage.toString()) || 0;
      let storageScore = 0.2; // 基础分数
      
      if (storageSize >= 1000) storageScore = 1.0;
      else if (storageSize >= 512) storageScore = 0.9;
      else if (storageSize >= 256) storageScore = 0.7;
      else if (storageSize >= 128) storageScore = 0.5;
      
      score += storageScore * weights.storage;
      totalWeight += weights.storage;
    }
    
    // 归一化到0-1范围
    return totalWeight > 0 ? score / totalWeight : 0.7; // 默认分数
  }
  
  // ==================== 辅助方法 ====================
  
  /**
   * 品牌编码
   */
  private encodeBrand(brand: string): number {
    const brandMap: Record<string, number> = {
      'Apple': 1, 'Samsung': 2, '华为': 3, 'Xiaomi': 4,
      'OPPO': 5, 'Vivo': 6, 'OnePlus': 7, 'Google': 8,
      'Microsoft': 9, 'Dell': 10, 'HP': 11, 'Lenovo': 12,
      'Asus': 13, 'Acer': 14
    };
    
    const brandLower = brand.toLowerCase();
    for (const [key, value] of Object.entries(brandMap)) {
      if (brandLower.includes(key.toLowerCase())) {
        return value;
      }
    }
    return 0;
  }
  
  /**
   * 类别编码
   */
  private encodeCategory(category: string): number {
    const categoryMap: Record<string, number> = {
      '智能手机': 1, '笔记本电脑': 2, '平板电脑': 3,
      '台式机': 4, '智能手表': 5, '耳机': 6
    };
    
    const categoryLower = category.toLowerCase();
    for (const [key, value] of Object.entries(categoryMap)) {
      if (categoryLower.includes(key.toLowerCase())) {
        return value;
      }
    }
    return 0;
  }
  
  /**
   * 计算设备年龄（月）
   */
  private calculateAgeInMonths(manufacturingDate?: Date): number {
    if (!manufacturingDate) return 12; // 默认1年
    
    const manufacture = new Date(manufacturingDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - manufacture.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    
    return Math.max(0, diffMonths);
  }
  
  /**
   * 解析内存大小
   */
  private parseRamSize(ramSpec?: any): number {
    if (!ramSpec) return 8; // 默认8GB
    
    const ramStr = ramSpec.toString().toLowerCase();
    const match = ramStr.match(/(\d+)/);
    if (match) {
      const size = parseInt(match[1]);
      if (ramStr.includes('gb')) return size;
      if (ramStr.includes('mb')) return size / 1024;
    }
    return 8;
  }
  
  /**
   * 解析存储大小
   */
  private parseStorageSize(storageSpec?: any): number {
    if (!storageSpec) return 256; // 默认256GB
    
    const storageStr = storageSpec.toString().toLowerCase();
    const match = storageStr.match(/(\d+)/);
    if (match) {
      const size = parseInt(match[1]);
      if (storageStr.includes('tb')) return size * 1024;
      if (storageStr.includes('gb')) return size;
      if (storageStr.includes('mb')) return size / 1024;
    }
    return 256;
  }
  
  /**
   * CPU性能评分
   */
  private getCpuPerformanceScore(cpuSpec?: any): number {
    if (!cpuSpec) return 5; // 默认中等性能
    
    const cpu = cpuSpec.toString().toLowerCase();
    
    // Apple芯片
    if (cpu.includes('m3')) return 9;
    if (cpu.includes('m2')) return 8;
    if (cpu.includes('m1')) return 7;
    
    // 骁龙系列
    if (cpu.includes('snapdragon 8')) return 8;
    if (cpu.includes('snapdragon 7')) return 6;
    if (cpu.includes('snapdragon 6')) return 4;
    
    // A系列芯片
    if (cpu.includes('a17')) return 9;
    if (cpu.includes('a16')) return 8;
    if (cpu.includes('a15')) return 7;
    if (cpu.includes('a14')) return 6;
    if (cpu.includes('a13')) return 5;
    
    return 3; // 默认基础分数
  }
  
  /**
   * 屏幕成色编码
   */
  private encodeScreenCondition(condition: string): number {
    const conditionMap: Record<string, number> = {
      'perfect': 1.0, 'minor_scratches': 0.9,
      'visible_scratches': 0.8, 'heavy_scratches': 0.6,
      'cracked': 0.3
    };
    return conditionMap[condition] || 0.8;
  }
  
  /**
   * 电池健康度编码
   */
  private encodeBatteryHealth(health: string): number {
    const healthMap: Record<string, number> = {
      'excellent': 1.0, 'good': 0.9,
      'average': 0.7, 'poor': 0.5, 'bad': 0.3
    };
    return healthMap[health] || 0.8;
  }
  
  /**
   * 机身成色编码
   */
  private encodeBodyCondition(condition: string): number {
    const conditionMap: Record<string, number> = {
      'mint': 1.0, 'light_wear': 0.9,
      'moderate_wear': 0.8, 'heavy_wear': 0.6,
      'damaged': 0.4
    };
    return conditionMap[condition] || 0.8;
  }
  
  /**
   * 功能完整性编码
   */
  private encodeFunctionality(functionality: string): number {
    const functionalityMap: Record<string, number> = {
      'perfect': 1.0, 'minor_issues': 0.9,
      'some_issues': 0.7, 'major_issues': 0.4,
      'non_functional': 0.1
    };
    return functionalityMap[functionality] || 0.9;
  }

  /**
   * 计算成色乘数
   */
  private calculateConditionMultiplier(condition: DeviceCondition): number {
    const multipliers = factorsConfig.conditionMultipliers;
    
    const screenMultiplier = multipliers.screen[condition.screen];
    const batteryMultiplier = multipliers.battery[condition.battery];
    const bodyMultiplier = multipliers.body[condition.body];
    const functionMultiplier = multipliers.functionality[condition.functionality];
    
    // 加权平均计算
    return (screenMultiplier * 0.3 + 
            batteryMultiplier * 0.2 + 
            bodyMultiplier * 0.3 + 
            functionMultiplier * 0.2);
  }

  /**
   * 获取默认成色状态
   */
  private getDefaultCondition(): DeviceCondition {
    return {
      screen: 'minor_scratches',
      battery: 'good',
      body: 'light_wear',
      functionality: 'perfect'
    };
  }

  /**
   * 获取品牌乘数
   */
  private getBrandMultiplier(brand: string): number {
    const brandLower = brand.toLowerCase();
    const multipliers = factorsConfig.brandMultipliers;
    
    for (const [brandName, multiplier] of Object.entries(multipliers)) {
      if (brandLower.includes(brandName.toLowerCase())) {
        return multiplier;
      }
    }
    
    return 0.7; // 默认品牌乘数
  }

  /**
   * 获取类别乘数
   */
  private getCategoryMultiplier(category: string): number {
    const categoryLower = category.toLowerCase();
    const multipliers = factorsConfig.categoryMultipliers;
    
    if (categoryLower.includes('手机') || categoryLower.includes('smartphone')) {
      return multipliers.smartphone;
    }
    if (categoryLower.includes('平板') || categoryLower.includes('tablet')) {
      return multipliers.tablet;
    }
    if (categoryLower.includes('笔记本') || categoryLower.includes('laptop')) {
      return multipliers.laptop;
    }
    if (categoryLower.includes('台式') || categoryLower.includes('desktop')) {
      return multipliers.desktop;
    }
    if (categoryLower.includes('手表') || categoryLower.includes('smartwatch')) {
      return multipliers.smartwatch;
    }
    
    return 1.0; // 默认乘数
  }

  /**
   * 获取年龄乘数
   */
  private getAgeMultiplier(deviceProfile: DeviceProfile): number {
    const manufactureDate = deviceProfile.manufacturingDate 
      ? new Date(deviceProfile.manufacturingDate)
      : new Date();
    const monthsOld = (Date.now() - manufactureDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    const brackets = factorsConfig.ageBrackets;
    
    if (monthsOld <= brackets.new.max_months) return brackets.new.multiplier;
    if (monthsOld <= brackets.recent.max_months) return brackets.recent.multiplier;
    if (monthsOld <= brackets.moderate.max_months) return brackets.moderate.multiplier;
    if (monthsOld <= brackets.older.max_months) return brackets.older.multiplier;
    return brackets.vintage.multiplier;
  }

  /**
   * 获取维修历史乘数
   */
  private getRepairHistoryMultiplier(deviceProfile: DeviceProfile): number {
    const repairCount = deviceProfile.totalRepairCount || 0;
    const multipliers = factorsConfig.repairHistoryImpact;
    
    if (repairCount === 0) return multipliers.no_repairs;
    if (repairCount === 1) return multipliers['1_repair'];
    if (repairCount === 2) return multipliers['2_repairs'];
    if (repairCount >= 3) return multipliers['3_plus_repairs'];
    
    return 1.0; // 默认无影响
  }

  /**
   * 批量估值多个设备
   */
  public async batchCalculateValues(
    devices: { profile: DeviceProfile; condition?: DeviceCondition; marketPrice?: number }[]
  ): Promise<ValuationResult[]> {
    return Promise.all(
      devices.map(async ({ profile, condition, marketPrice }) => 
        this.calculateBaseValue(profile, condition, marketPrice)
      )
    );
  }

  /**
   * 获取估值因素配置
   */
  public getFactorsConfig() {
    return factorsConfig;
  }
}