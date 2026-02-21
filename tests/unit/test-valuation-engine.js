/**
 * 估值引擎单元测试
 * 验证基础估值算法的正确性和各种边界情况
 */

const { ValuationEngineService } = require('../../src/lib/valuation/valuation-engine.service');

async function runValuationTests() {
  console.log('🧪 开始估值引擎单元测试...\n');
  
  const valuationService = ValuationEngineService.getInstance();
  
  // 测试用例1: iPhone设备估值
  console.log('📝 测试用例1: iPhone 15 Pro设备估值');
  try {
    const iphoneProfile = {
      id: 'test_iphone_001',
      qrcodeId: 'QR_IPHONE_15_PRO',
      productModel: 'iPhone 15 Pro',
      productCategory: '智能手机',
      brandName: 'Apple',
      manufacturingDate: '2023-09-12',
      currentStatus: 'active',
      totalRepairCount: 0,
      totalPartReplacementCount: 0,
      totalTransferCount: 0,
      specifications: {
        ram: '8GB',
        storage: '256GB',
        processor: 'A17 Pro'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const condition = {
      screen: 'minor_scratches',
      battery: 'good',
      body: 'light_wear',
      functionality: 'perfect'
    };
    
    const result = await valuationService.calculateBaseValue(iphoneProfile, condition, 6000);
    
    console.log('   ✅ 估值计算成功');
    console.log(`   📊 原始价格: ¥${result.breakdown.originalPrice}`);
    console.log(`   📉 折旧金额: ¥${result.breakdown.depreciation.toFixed(2)}`);
    console.log(`   ⚙️  部件评分: ${(result.breakdown.componentAdjustment * 100).toFixed(1)}%`);
    console.log(`   🔧 成色乘数: ${(result.breakdown.conditionAdjustment * 100).toFixed(1)}%`);
    console.log(`   🏷️  最终估值: ¥${result.finalValue}`);
    console.log(`   💰 基础价值: ¥${result.baseValue}`);
    
    // 验证结果合理性
    if (result.finalValue > 0 && result.finalValue < result.breakdown.originalPrice) {
      console.log('   ✅ 结果合理（价值在0到原始价格之间）');
    } else {
      console.log('   ❌ 结果不合理');
    }
    
  } catch (error) {
    console.log('   ❌ 测试失败:', error.message);
  }
  
  // 测试用例2: 老旧设备估值
  console.log('\n📝 测试用例2: 老旧iPhone设备估值');
  try {
    const oldIphoneProfile = {
      id: 'test_old_iphone_001',
      qrcodeId: 'QR_OLD_IPHONE',
      productModel: 'iPhone 11',
      productCategory: '智能手机',
      brandName: 'Apple',
      manufacturingDate: '2019-09-20',
      currentStatus: 'active',
      totalRepairCount: 2,
      totalPartReplacementCount: 1,
      totalTransferCount: 0,
      specifications: {
        ram: '4GB',
        storage: '128GB',
        processor: 'A13 Bionic'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const poorCondition = {
      screen: 'visible_scratches',
      battery: 'average',
      body: 'moderate_wear',
      functionality: 'minor_issues'
    };
    
    const result = await valuationService.calculateBaseValue(oldIphoneProfile, poorCondition, 4000);
    
    console.log('   ✅ 老旧设备估值计算成功');
    console.log(`   📊 最终估值: ¥${result.finalValue}`);
    console.log(`   📉 折旧率: ${((result.breakdown.depreciation / result.breakdown.originalPrice) * 100).toFixed(1)}%`);
    console.log(`   🔧 维修历史影响: ${(result.breakdown.repairAdjustment * 100).toFixed(1)}%`);
    
    // 老旧设备应该价值较低
    if (result.finalValue < 2000) {
      console.log('   ✅ 老旧设备估值合理（低于2000元）');
    } else {
      console.log('   ⚠️  老旧设备估值偏高');
    }
    
  } catch (error) {
    console.log('   ❌ 测试失败:', error.message);
  }
  
  // 测试用例3: 高端笔记本估值
  console.log('\n📝 测试用例3: MacBook Pro高端设备估值');
  try {
    const macbookProfile = {
      id: 'test_macbook_001',
      qrcodeId: 'QR_MACBOOK_PRO',
      productModel: 'MacBook Pro 14"',
      productCategory: '笔记本电脑',
      brandName: 'Apple',
      manufacturingDate: '2023-10-30',
      currentStatus: 'active',
      totalRepairCount: 0,
      totalPartReplacementCount: 0,
      totalTransferCount: 0,
      specifications: {
        ram: '16GB',
        storage: '1TB',
        processor: 'M3 Pro'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const excellentCondition = {
      screen: 'perfect',
      battery: 'excellent',
      body: 'mint',
      functionality: 'perfect'
    };
    
    const result = await valuationService.calculateBaseValue(macbookProfile, excellentCondition, 15000);
    
    console.log('   ✅ 高端设备估值计算成功');
    console.log(`   📊 最终估值: ¥${result.finalValue}`);
    console.log(`   ⚙️  部件评分: ${(result.breakdown.componentAdjustment * 100).toFixed(1)}%`);
    console.log(`   🏷️  品牌乘数: ${(result.breakdown.brandAdjustment * 100).toFixed(1)}%`);
    console.log(`   📱 类别乘数: ${(result.breakdown.categoryAdjustment * 100).toFixed(1)}%`);
    
    // 高端设备应该保持较高价值
    if (result.finalValue > 8000) {
      console.log('   ✅ 高端设备估值合理（高于8000元）');
    } else {
      console.log('   ⚠️  高端设备估值偏低');
    }
    
  } catch (error) {
    console.log('   ❌ 测试失败:', error.message);
  }
  
  // 测试用例4: 批量估值
  console.log('\n📝 测试用例4: 批量设备估值');
  try {
    const devices = [
      {
        profile: {
          id: 'batch_001',
          qrcodeId: 'QR_BATCH_001',
          productModel: 'iPhone 14',
          productCategory: '智能手机',
          brandName: 'Apple',
          manufacturingDate: '2022-09-07',
          currentStatus: 'active',
          totalRepairCount: 0,
          specifications: { ram: '6GB', storage: '128GB' }
        }
      },
      {
        profile: {
          id: 'batch_002',
          qrcodeId: 'QR_BATCH_002',
          productModel: 'Galaxy S23',
          productCategory: '智能手机',
          brandName: 'Samsung',
          manufacturingDate: '2023-02-17',
          currentStatus: 'active',
          totalRepairCount: 1,
          specifications: { ram: '8GB', storage: '256GB' }
        }
      }
    ];
    
    const results = await valuationService.batchCalculateValues(devices);
    
    console.log('   ✅ 批量估值计算成功');
    console.log(`   📊 处理设备数量: ${results.length}`);
    
    results.forEach((result, index) => {
      console.log(`   📱 设备${index + 1}: ¥${result.finalValue}`);
    });
    
  } catch (error) {
    console.log('   ❌ 测试失败:', error.message);
  }
  
  // 测试用例5: 边界条件测试
  console.log('\n📝 测试用例5: 边界条件测试');
  try {
    // 测试无规格信息的设备
    const basicProfile = {
      id: 'basic_001',
      qrcodeId: 'QR_BASIC_001',
      productModel: 'Unknown Device',
      productCategory: '其他',
      brandName: 'Generic',
      manufacturingDate: '2020-01-01',
      currentStatus: 'active',
      totalRepairCount: 0,
      totalPartReplacementCount: 0,
      totalTransferCount: 0,
      specifications: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await valuationService.calculateBaseValue(basicProfile);
    
    console.log('   ✅ 基础设备估值计算成功');
    console.log(`   📊 最终估值: ¥${result.finalValue}`);
    
    // 应该返回合理的默认估值
    if (result.finalValue > 0) {
      console.log('   ✅ 基础设备估值合理（大于0）');
    } else {
      console.log('   ❌ 基础设备估值异常');
    }
    
  } catch (error) {
    console.log('   ❌ 测试失败:', error.message);
  }
  
  console.log('\n🎉 估值引擎单元测试完成！');
}

// 运行测试
if (typeof window === 'undefined') {
  runValuationTests().catch(console.error);
}

module.exports = { runValuationTests };