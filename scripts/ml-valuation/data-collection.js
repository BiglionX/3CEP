/**
 * VALUE-201: 数据采集与清洗脚本
 * 从LIFE档案和订单系统中提取用于机器学习模型训练的特征和标签
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * 设备特征提取器
 */
class DeviceFeatureExtractor {
  /**
   * 从设备档案中提取数值化特征
   * @param {Object} deviceProfile - 设备档案数据
   * @returns {Object} 特征向量
   */
  static extractFeatures(deviceProfile) {
    const features = {};
    
    // 基础设备信息
    features.brand = deviceProfile.brandName || 'Unknown';
    features.model = deviceProfile.productModel || 'Unknown';
    features.category = deviceProfile.productCategory || 'Unknown';
    
    // 时间特征
    features.age_months = this.calculateAgeInMonths(deviceProfile.manufacturingDate);
    features.years_old = Math.floor(features.age_months / 12);
    
    // 硬件规格特征
    const specs = deviceProfile.specifications || {};
    features.ram_gb = this.parseRamSize(specs.ram || specs.memory);
    features.storage_gb = this.parseStorageSize(specs.storage);
    features.cpu_score = this.getCpuPerformanceScore(specs.processor || specs.cpu);
    
    // 使用历史特征
    features.total_repair_count = deviceProfile.totalRepairCount || 0;
    features.part_replacement_count = deviceProfile.totalPartReplacementCount || 0;
    features.transfer_count = deviceProfile.totalTransferCount || 0;
    features.has_warranty = deviceProfile.warrantyPeriod ? 1 : 0;
    
    return features;
  }
  
  /**
   * 计算设备年龄（月）
   */
  static calculateAgeInMonths(manufacturingDate) {
    if (!manufacturingDate) return 0;
    
    const manufacture = new Date(manufacturingDate);
    const now = new Date();
    const diffTime = Math.abs(now - manufacture);
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    
    return Math.max(0, diffMonths);
  }
  
  /**
   * 解析内存大小
   */
  static parseRamSize(ramSpec) {
    if (!ramSpec) return 0;
    
    const ramStr = ramSpec.toString().toLowerCase();
    const match = ramStr.match(/(\d+)/);
    if (match) {
      const size = parseInt(match[1]);
      // 处理不同单位
      if (ramStr.includes('gb')) return size;
      if (ramStr.includes('mb')) return size / 1024;
    }
    return 0;
  }
  
  /**
   * 解析存储大小
   */
  static parseStorageSize(storageSpec) {
    if (!storageSpec) return 0;
    
    const storageStr = storageSpec.toString().toLowerCase();
    const match = storageStr.match(/(\d+)/);
    if (match) {
      const size = parseInt(match[1]);
      // 处理不同单位
      if (storageStr.includes('tb')) return size * 1024;
      if (storageStr.includes('gb')) return size;
      if (storageStr.includes('mb')) return size / 1024;
    }
    return 0;
  }
  
  /**
   * CPU性能评分
   */
  static getCpuPerformanceScore(cpuSpec) {
    if (!cpuSpec) return 0;
    
    const cpu = cpuSpec.toString().toLowerCase();
    
    // Apple芯片系列
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
    if (cpu.includes('a12')) return 4;
    
    // Intel/AMD处理器
    if (cpu.includes('intel') || cpu.includes('amd')) {
      if (cpu.includes('i9') || cpu.includes('ryzen 9')) return 8;
      if (cpu.includes('i7') || cpu.includes('ryzen 7')) return 7;
      if (cpu.includes('i5') || cpu.includes('ryzen 5')) return 6;
      if (cpu.includes('i3') || cpu.includes('ryzen 3')) return 5;
    }
    
    return 3; // 默认基础分数
  }
}

/**
 * 成色状态量化器
 */
class ConditionQuantifier {
  /**
   * 从生命周期事件中提取成色特征
   * @param {Array} lifecycleEvents - 生命周期事件列表
   * @returns {Object} 成色量化特征
   */
  static quantifyCondition(lifecycleEvents) {
    const condition = {
      screen_condition: 1.0,    // 1.0 = 完美, 0.1 = 严重损坏
      battery_health: 1.0,      // 1.0 = 优秀, 0.1 = 很差
      body_condition: 1.0,      // 1.0 = 全新, 0.1 = 严重磨损
      functionality_score: 1.0  // 1.0 = 完美功能, 0.1 = 功能严重受损
    };
    
    if (!lifecycleEvents || lifecycleEvents.length === 0) {
      return condition;
    }
    
    // 分析维修和更换事件
    const repairEvents = lifecycleEvents.filter(e => e.eventType === 'repaired');
    const partReplaceEvents = lifecycleEvents.filter(e => e.eventType === 'part_replaced');
    
    // 根据维修历史调整成色
    condition.functionality_score = Math.max(0.1, 1.0 - (repairEvents.length * 0.1));
    
    // 分析具体的部件更换
    partReplaceEvents.forEach(event => {
      const subtype = event.eventSubtype || '';
      const notes = (event.notes || '').toLowerCase();
      
      if (subtype.includes('screen') || notes.includes('屏幕')) {
        condition.screen_condition = Math.max(0.3, condition.screen_condition - 0.3);
      }
      
      if (subtype.includes('battery') || notes.includes('电池')) {
        condition.battery_health = Math.max(0.2, condition.battery_health - 0.4);
      }
      
      if (notes.includes('外壳') || notes.includes('机身')) {
        condition.body_condition = Math.max(0.2, condition.body_condition - 0.2);
      }
    });
    
    return condition;
  }
}

/**
 * 价格标签提取器
 */
class PriceLabelExtractor {
  /**
   * 从交易记录中提取实际成交价格
   * @param {Object} transactionRecord - 交易记录
   * @returns {number|null} 成交价格
   */
  static extractActualPrice(transactionRecord) {
    // 从众筹支持记录中提取
    if (transactionRecord.hasOwnProperty('amount')) {
      return transactionRecord.amount;
    }
    
    // 从FCX兑换记录中提取
    if (transactionRecord.hasOwnProperty('total_fcx_cost')) {
      // 需要转换FCX到人民币的汇率
      const fcxToCnyRate = 0.1; // 假设1 FCX = 0.1 CNY
      return transactionRecord.total_fcx_cost * fcxToCnyRate;
    }
    
    // 从维修工单中提取
    if (transactionRecord.hasOwnProperty('fcx_amount_locked')) {
      const fcxToCnyRate = 0.1;
      return transactionRecord.fcx_amount_locked * fcxToCnyRate;
    }
    
    return null;
  }
}

/**
 * 主数据采集函数
 */
async function collectTrainingData() {
  console.log('🚀 开始采集机器学习训练数据...\n');
  
  try {
    // 1. 收集已完成的交易数据
    console.log('1️⃣ 收集交易记录...');
    const transactionData = await collectTransactionRecords();
    console.log(`   ✅ 收集到 ${transactionData.length} 条交易记录`);
    
    // 2. 收集对应的设备档案数据
    console.log('\n2️⃣ 关联设备档案信息...');
    const trainingSamples = [];
    
    for (const transaction of transactionData) {
      const deviceQrcodeId = transaction.device_qrcode_id || transaction.qrcodeId;
      if (!deviceQrcodeId) continue;
      
      try {
        // 获取设备档案
        const { data: profile, error: profileError } = await supabase
          .from('device_profiles')
          .select('*')
          .eq('qrcode_id', deviceQrcodeId)
          .single();
        
        if (profileError || !profile) {
          console.log(`   ⚠️  未找到设备档案: ${deviceQrcodeId}`);
          continue;
        }
        
        // 获取生命周期事件
        const { data: events, error: eventsError } = await supabase
          .from('device_lifecycle_events')
          .select('*')
          .eq('device_qrcode_id', deviceQrcodeId)
          .order('event_timestamp', { ascending: false });
        
        if (eventsError) {
          console.log(`   ⚠️  获取生命周期事件失败: ${deviceQrcodeId}`);
          continue;
        }
        
        // 提取特征和标签
        const features = DeviceFeatureExtractor.extractFeatures(profile);
        const condition = ConditionQuantifier.quantifyCondition(events);
        const actualPrice = PriceLabelExtractor.extractActualPrice(transaction);
        
        if (actualPrice && actualPrice > 0) {
          trainingSamples.push({
            features: { ...features, ...condition },
            label: actualPrice,
            device_qrcode_id: deviceQrcodeId,
            transaction_id: transaction.id,
            transaction_type: transaction.transaction_type || 'unknown',
            created_at: transaction.created_at
          });
        }
        
      } catch (error) {
        console.log(`   ❌ 处理设备 ${deviceQrcodeId} 时出错:`, error.message);
      }
    }
    
    console.log(`\n📊 成功构建 ${trainingSamples.length} 个训练样本`);
    
    // 3. 数据清洗和预处理
    console.log('\n3️⃣ 数据清洗和预处理...');
    const cleanedData = preprocessTrainingData(trainingSamples);
    console.log(`   ✅ 清洗后剩余 ${cleanedData.length} 个有效样本`);
    
    // 4. 保存训练数据
    console.log('\n4️⃣ 保存训练数据...');
    await saveTrainingData(cleanedData);
    
    // 5. 生成数据统计报告
    generateDataReport(cleanedData);
    
    console.log('\n🎉 数据采集与清洗完成！');
    return cleanedData;
    
  } catch (error) {
    console.error('❌ 数据采集过程中出现错误:', error);
    throw error;
  }
}

/**
 * 收集交易记录
 */
async function collectTransactionRecords() {
  const allTransactions = [];
  
  // 1. 收集众筹支持记录
  try {
    const { data: pledges, error } = await supabase
      .from('crowdfunding_pledges')
      .select(`
        id,
        project_id,
        amount,
        old_device_qrcode,
        status,
        created_at,
        crowdfunding_projects(product_model, old_models)
      `)
      .eq('status', 'confirmed')
      .limit(1000);
    
    if (!error && pledges) {
      pledges.forEach(pledge => {
        if (pledge.old_device_qrcode) {
          allTransactions.push({
            id: pledge.id,
            device_qrcode_id: pledge.old_device_qrcode,
            amount: pledge.amount,
            transaction_type: 'crowdfunding_pledge',
            created_at: pledge.created_at,
            project_model: pledge.crowdfunding_projects?.product_model
          });
        }
      });
    }
  } catch (error) {
    console.log('⚠️  收集众筹数据时出错:', error.message);
  }
  
  // 2. 收集FCX兑换记录
  try {
    const { data: orders, error } = await supabase
      .from('fcx_exchange_orders')
      .select(`
        id,
        user_id,
        total_fcx_cost,
        created_at,
        fcx_exchange_order_items(
          part_id,
          quantity,
          fcx_unit_price
        )
      `)
      .eq('status', 'completed')
      .limit(1000);
    
    if (!error && orders) {
      orders.forEach(order => {
        // 简化处理：假设订单对应一个设备
        allTransactions.push({
          id: order.id,
          user_id: order.user_id,
          total_fcx_cost: order.total_fcx_cost,
          transaction_type: 'fcx_exchange',
          created_at: order.created_at
        });
      });
    }
  } catch (error) {
    console.log('⚠️  收集FCX数据时出错:', error.message);
  }
  
  // 3. 收集维修工单数据
  try {
    const { data: repairOrders, error } = await supabase
      .from('repair_orders')
      .select(`
        id,
        device_info,
        fcx_amount_locked,
        completed_at,
        status
      `)
      .eq('status', 'completed')
      .limit(1000);
    
    if (!error && repairOrders) {
      repairOrders.forEach(order => {
        if (order.device_info?.qrcodeId) {
          allTransactions.push({
            id: order.id,
            device_qrcode_id: order.device_info.qrcodeId,
            fcx_amount_locked: order.fcx_amount_locked,
            transaction_type: 'repair_order',
            created_at: order.completed_at
          });
        }
      });
    }
  } catch (error) {
    console.log('⚠️  收集维修数据时出错:', error.message);
  }
  
  return allTransactions;
}

/**
 * 数据预处理
 */
function preprocessTrainingData(samples) {
  // 过滤异常值
  const filtered = samples.filter(sample => {
    // 过滤价格异常的数据
    if (sample.label < 100 || sample.label > 50000) return false;
    
    // 过滤特征缺失严重的数据
    const features = sample.features;
    if (features.age_months > 120) return false; // 超过10年的设备
    if (features.ram_gb === 0 && features.storage_gb === 0) return false;
    
    return true;
  });
  
  // 特征工程：创建组合特征
  return filtered.map(sample => {
    const features = sample.features;
    
    // 创建组合特征
    features.age_ram_ratio = features.age_months / (features.ram_gb || 1);
    features.storage_age_ratio = features.storage_gb / (features.age_months || 1);
    features.repair_frequency = features.total_repair_count / (features.age_months || 1);
    
    // 品牌编码
    features.brand_encoded = encodeBrand(features.brand);
    
    // 类别编码
    features.category_encoded = encodeCategory(features.category);
    
    return {
      ...sample,
      features
    };
  });
}

/**
 * 品牌编码
 */
function encodeBrand(brand) {
  const brandMap = {
    'Apple': 1,
    'Samsung': 2,
    '华为': 3,
    'Xiaomi': 4,
    'OPPO': 5,
    'Vivo': 6,
    'OnePlus': 7,
    'Google': 8,
    'Microsoft': 9,
    'Dell': 10,
    'HP': 11,
    'Lenovo': 12,
    'Asus': 13,
    'Acer': 14
  };
  
  return brandMap[brand] || 0;
}

/**
 * 类别编码
 */
function encodeCategory(category) {
  const categoryMap = {
    '智能手机': 1,
    '笔记本电脑': 2,
    '平板电脑': 3,
    '台式机': 4,
    '智能手表': 5,
    '耳机': 6
  };
  
  const lowerCategory = category.toLowerCase();
  for (const [key, value] of Object.entries(categoryMap)) {
    if (lowerCategory.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return 0;
}

/**
 * 保存训练数据
 */
async function saveTrainingData(data) {
  const fs = require('fs');
  const path = require('path');
  
  // 创建数据目录
  const dataDir = path.join(__dirname, '../../data/ml-training');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // 保存为CSV格式
  const csvContent = convertToCSV(data);
  const csvPath = path.join(dataDir, 'device_valuation_training_data.csv');
  fs.writeFileSync(csvPath, csvContent);
  
  // 保存为JSON格式
  const jsonPath = path.join(dataDir, 'device_valuation_training_data.json');
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  
  console.log(`   ✅ CSV数据保存至: ${csvPath}`);
  console.log(`   ✅ JSON数据保存至: ${jsonPath}`);
}

/**
 * 转换为CSV格式
 */
function convertToCSV(data) {
  if (data.length === 0) return '';
  
  // 获取所有特征字段
  const featureKeys = Object.keys(data[0].features);
  const header = [...featureKeys, 'actual_price', 'device_qrcode_id', 'transaction_type', 'created_at'];
  
  const rows = data.map(sample => {
    const row = featureKeys.map(key => sample.features[key] || 0);
    row.push(
      sample.label,
      sample.device_qrcode_id || '',
      sample.transaction_type || '',
      sample.created_at || ''
    );
    return row.join(',');
  });
  
  return [header.join(','), ...rows].join('\n');
}

/**
 * 生成数据报告
 */
function generateDataReport(data) {
  console.log('\n📈 训练数据统计报告:');
  console.log('=====================');
  
  if (data.length === 0) {
    console.log('❌ 没有有效数据');
    return;
  }
  
  // 基本统计
  console.log(`总样本数: ${data.length}`);
  
  // 价格分布
  const prices = data.map(d => d.label);
  console.log(`价格范围: ¥${Math.min(...prices).toFixed(2)} - ¥${Math.max(...prices).toFixed(2)}`);
  console.log(`平均价格: ¥${(prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)}`);
  
  // 设备类型分布
  const brandCounts = {};
  const categoryCounts = {};
  
  data.forEach(sample => {
    const brand = sample.features.brand || 'Unknown';
    const category = sample.features.category || 'Unknown';
    
    brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });
  
  console.log('\n品牌分布:');
  Object.entries(brandCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([brand, count]) => {
      console.log(`  ${brand}: ${count} 台`);
    });
  
  console.log('\n类别分布:');
  Object.entries(categoryCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 台`);
    });
  
  // 交易类型分布
  const typeCounts = {};
  data.forEach(sample => {
    const type = sample.transaction_type || 'unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  
  console.log('\n交易类型分布:');
  Object.entries(typeCounts).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} 笔`);
  });
}

// 执行数据采集
if (require.main === module) {
  collectTrainingData()
    .then(data => {
      console.log(`\n✅ 成功采集 ${data.length} 条训练数据`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 数据采集失败:', error);
      process.exit(1);
    });
}

module.exports = { collectTrainingData, DeviceFeatureExtractor, ConditionQuantifier };