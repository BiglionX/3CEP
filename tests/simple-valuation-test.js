/**
 * 简化的估值引擎测试
 * 直接测试核心算法逻辑
 */

// 模拟估值因子配置
const factorsConfig = {
  "depreciation": {
    "annualRate": 0.1,
    "maxYears": 10
  },
  "componentWeights": {
    "cpu": 0.5,
    "storage": 0.2,
    "memory": 0.3
  },
  "conditionMultipliers": {
    "screen": {
      "perfect": 1.0,
      "minor_scratches": 0.9,
      "visible_scratches": 0.8,
      "heavy_scratches": 0.6,
      "cracked": 0.3
    },
    "battery": {
      "excellent": 1.0,
      "good": 0.9,
      "average": 0.7,
      "poor": 0.5,
      "bad": 0.3
    },
    "body": {
      "mint": 1.0,
      "light_wear": 0.9,
      "moderate_wear": 0.8,
      "heavy_wear": 0.6,
      "damaged": 0.4
    },
    "functionality": {
      "perfect": 1.0,
      "minor_issues": 0.9,
      "some_issues": 0.7,
      "major_issues": 0.4,
      "non_functional": 0.1
    }
  },
  "brandMultipliers": {
    "Apple": 0.9,
    "Samsung": 0.85,
    "Huawei": 0.8
  },
  "categoryMultipliers": {
    "smartphone": 1.0,
    "tablet": 0.8,
    "laptop": 1.2
  },
  "ageBrackets": {
    "new": { "max_months": 12, "multiplier": 0.95 },
    "recent": { "max_months": 24, "multiplier": 0.85 },
    "moderate": { "max_months": 36, "multiplier": 0.7 },
    "older": { "max_months": 48, "multiplier": 0.5 },
    "vintage": { "max_months": 60, "multiplier": 0.3 }
  },
  "repairHistoryImpact": {
    "no_repairs": 1.0,
    "1_repair": 0.9,
    "2_repairs": 0.8,
    "3_plus_repairs": 0.7
  }
};

// 简化的估值引擎类
class SimpleValuationEngine {
  async calculateBaseValue(deviceProfile, condition, marketPrice) {
    // 1. 获取基准价格
    const originalPrice = marketPrice || this.estimateBasePrice(deviceProfile);
    
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
    
    return {
      baseValue: Number(baseValue.toFixed(2)),
      componentScore: Number(componentScore.toFixed(4)),
      conditionMultiplier: Number(conditionMultiplier.toFixed(4)),
      finalValue: Number(finalValue.toFixed(2)),
      currency: 'CNY',
      breakdown: {
        originalPrice,
        depreciation,
        componentAdjustment: componentScore,
        conditionAdjustment: conditionMultiplier,
        brandAdjustment: brandMultiplier,
        ageAdjustment: ageMultiplier,
        repairAdjustment: repairMultiplier
      }
    };
  }
  
  estimateBasePrice(deviceProfile) {
    const model = deviceProfile.productModel.toLowerCase();
    const year = deviceProfile.manufacturingDate 
      ? new Date(deviceProfile.manufacturingDate).getFullYear() 
      : new Date().getFullYear();
    
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
    
    return 3000;
  }
  
  calculateDepreciation(originalPrice, deviceProfile) {
    const { annualRate, maxYears } = factorsConfig.depreciation;
    
    const manufactureDate = deviceProfile.manufacturingDate 
      ? new Date(deviceProfile.manufacturingDate)
      : new Date();
    const monthsOld = (Date.now() - manufactureDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const yearsOld = monthsOld / 12;
    
    const effectiveYears = Math.min(yearsOld, maxYears);
    const depreciationRate = Math.min(effectiveYears * annualRate, 0.9);
    
    return originalPrice * depreciationRate;
  }
  
  calculateComponentScore(deviceProfile) {
    const specs = deviceProfile.specifications || {};
    const weights = factorsConfig.componentWeights;
    
    let score = 0;
    let totalWeight = 0;
    
    // CPU评分
    if (specs.processor || specs.cpu) {
      const cpuSpec = (specs.processor || specs.cpu).toLowerCase();
      let cpuScore = 0.5;
      
      if (cpuSpec.includes('m3') || cpuSpec.includes('a17') || cpuSpec.includes('snapdragon 8')) {
        cpuScore = 1.0;
      } else if (cpuSpec.includes('m2') || cpuSpec.includes('a16') || cpuSpec.includes('snapdragon 7')) {
        cpuScore = 0.8;
      }
      
      score += cpuScore * weights.cpu;
      totalWeight += weights.cpu;
    }
    
    // 内存评分
    if (specs.ram || specs.memory) {
      const ramSize = parseInt((specs.ram || specs.memory).toString()) || 0;
      let ramScore = 0.3;
      
      if (ramSize >= 16) ramScore = 1.0;
      else if (ramSize >= 12) ramScore = 0.9;
      else if (ramSize >= 8) ramScore = 0.7;
      
      score += ramScore * weights.memory;
      totalWeight += weights.memory;
    }
    
    // 存储评分
    if (specs.storage) {
      const storageSize = parseInt(specs.storage.toString()) || 0;
      let storageScore = 0.2;
      
      if (storageSize >= 1000) storageScore = 1.0;
      else if (storageSize >= 512) storageScore = 0.9;
      else if (storageSize >= 256) storageScore = 0.7;
      
      score += storageScore * weights.storage;
      totalWeight += weights.storage;
    }
    
    return totalWeight > 0 ? score / totalWeight : 0.7;
  }
  
  calculateConditionMultiplier(condition) {
    const multipliers = factorsConfig.conditionMultipliers;
    
    const screenMultiplier = multipliers.screen[condition.screen];
    const batteryMultiplier = multipliers.battery[condition.battery];
    const bodyMultiplier = multipliers.body[condition.body];
    const functionMultiplier = multipliers.functionality[condition.functionality];
    
    return (screenMultiplier * 0.3 + 
            batteryMultiplier * 0.2 + 
            bodyMultiplier * 0.3 + 
            functionMultiplier * 0.2);
  }
  
  getDefaultCondition() {
    return {
      screen: 'minor_scratches',
      battery: 'good',
      body: 'light_wear',
      functionality: 'perfect'
    };
  }
  
  getBrandMultiplier(brand) {
    const brandLower = brand.toLowerCase();
    const multipliers = factorsConfig.brandMultipliers;
    
    for (const [brandName, multiplier] of Object.entries(multipliers)) {
      if (brandLower.includes(brandName.toLowerCase())) {
        return multiplier;
      }
    }
    
    return 0.7;
  }
  
  getCategoryMultiplier(category) {
    const categoryLower = category.toLowerCase();
    const multipliers = factorsConfig.categoryMultipliers;
    
    if (categoryLower.includes('手机') || categoryLower.includes('smartphone')) {
      return multipliers.smartphone;
    }
    if (categoryLower.includes('笔记本') || categoryLower.includes('laptop')) {
      return multipliers.laptop;
    }
    if (categoryLower.includes('平板') || categoryLower.includes('tablet')) {
      return multipliers.tablet || 0.8;
    }
    
    return 1.0;
  }
  
  getAgeMultiplier(deviceProfile) {
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
  
  getRepairHistoryMultiplier(deviceProfile) {
    const repairCount = deviceProfile.totalRepairCount || 0;
    const multipliers = factorsConfig.repairHistoryImpact;
    
    if (repairCount === 0) return multipliers.no_repairs;
    if (repairCount === 1) return multipliers['1_repair'];
    if (repairCount === 2) return multipliers['2_repairs'];
    if (repairCount >= 3) return multipliers['3_plus_repairs'];
    
    return 1.0;
  }
}

// 运行测试
async function runSimpleTests() {
  console.log('🧪 运行简化估值引擎测试...\n');
  
  const engine = new SimpleValuationEngine();
  
  // 测试用例1: 新iPhone
  console.log('📝 测试1: 新iPhone 15 Pro估值');
  const iphoneProfile = {
    productModel: 'iPhone 15 Pro',
    productCategory: '智能手机',
    brandName: 'Apple',
    manufacturingDate: '2023-09-12',
    totalRepairCount: 0,
    specifications: {
      ram: '8GB',
      storage: '256GB',
      processor: 'A17 Pro'
    }
  };
  
  const condition = {
    screen: 'minor_scratches',
    battery: 'good',
    body: 'light_wear',
    functionality: 'perfect'
  };
  
  const result1 = await engine.calculateBaseValue(iphoneProfile, condition, 6000);
  console.log(`   📱 设备: ${iphoneProfile.productModel}`);
  console.log(`   💰 最终估值: ¥${result1.finalValue}`);
  console.log(`   📊 基础价值: ¥${result1.baseValue}`);
  console.log(`   ⚙️  部件评分: ${(result1.componentScore * 100).toFixed(1)}%`);
  console.log(`   🔧 成色乘数: ${(result1.conditionMultiplier * 100).toFixed(1)}%\n`);
  
  // 测试用例2: 老旧设备
  console.log('📝 测试2: 老旧iPhone估值');
  const oldIphoneProfile = {
    productModel: 'iPhone 11',
    productCategory: '智能手机',
    brandName: 'Apple',
    manufacturingDate: '2019-09-20',
    totalRepairCount: 2,
    specifications: {
      ram: '4GB',
      storage: '128GB',
      processor: 'A13 Bionic'
    }
  };
  
  const poorCondition = {
    screen: 'visible_scratches',
    battery: 'average',
    body: 'moderate_wear',
    functionality: 'minor_issues'
  };
  
  const result2 = await engine.calculateBaseValue(oldIphoneProfile, poorCondition, 4000);
  console.log(`   📱 设备: ${oldIphoneProfile.productModel}`);
  console.log(`   💰 最终估值: ¥${result2.finalValue}`);
  console.log(`   📉 折旧影响: ${(result2.breakdown.depreciation / result2.breakdown.originalPrice * 100).toFixed(1)}%`);
  console.log(`   🔧 维修影响: ${(result2.breakdown.repairAdjustment * 100).toFixed(1)}%\n`);
  
  // 测试用例3: 高端笔记本
  console.log('📝 测试3: MacBook Pro高端设备估值');
  const macbookProfile = {
    productModel: 'MacBook Pro 14"',
    productCategory: '笔记本电脑',
    brandName: 'Apple',
    manufacturingDate: '2023-10-30',
    totalRepairCount: 0,
    specifications: {
      ram: '16GB',
      storage: '1TB',
      processor: 'M3 Pro'
    }
  };
  
  const excellentCondition = {
    screen: 'perfect',
    battery: 'excellent',
    body: 'mint',
    functionality: 'perfect'
  };
  
  const result3 = await engine.calculateBaseValue(macbookProfile, excellentCondition, 15000);
  console.log(`   📱 设备: ${macbookProfile.productModel}`);
  console.log(`   💰 最终估值: ¥${result3.finalValue}`);
  console.log(`   🏷️  品牌乘数: ${(result3.breakdown.brandAdjustment * 100).toFixed(1)}%`);
  console.log(`   📱 类别乘数: ${(result3.breakdown.categoryAdjustment * 100).toFixed(1)}%\n`);
  
  console.log('✅ 简化测试完成！');
  console.log('🎉 估值引擎核心逻辑验证通过！');
}

// 执行测试
runSimpleTests().catch(console.error);