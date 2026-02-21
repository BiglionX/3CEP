/**
 * 设备档案集成测试数据准备脚本
 * 为M1、DIY、CROWDFUND、FCX模块准备测试用的设备档案数据
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 请设置 SUPABASE 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 测试设备数据
const testDevices = [
  {
    id: 'test_device_001',
    qrcodeId: 'QR_TEST_001',
    productModel: 'iPhone 15 Pro',
    productCategory: '智能手机',
    brandName: 'Apple',
    serialNumber: 'SN001ABC123',
    manufacturingDate: '2024-01-15',
    warrantyPeriod: 12,
    specifications: {
      color: '钛金属原色',
      storage: '256GB',
      ram: '8GB'
    }
  },
  {
    id: 'test_device_002',
    qrcodeId: 'QR_TEST_002',
    productModel: 'Galaxy S24 Ultra',
    productCategory: '智能手机',
    brandName: 'Samsung',
    serialNumber: 'SN002DEF456',
    manufacturingDate: '2024-02-01',
    warrantyPeriod: 12,
    specifications: {
      color: '钛灰',
      storage: '512GB',
      ram: '12GB'
    }
  },
  {
    id: 'test_device_003',
    qrcodeId: 'QR_TEST_003',
    productModel: 'MacBook Pro 14"',
    productCategory: '笔记本电脑',
    brandName: 'Apple',
    serialNumber: 'SN003GHI789',
    manufacturingDate: '2023-11-20',
    warrantyPeriod: 24,
    specifications: {
      processor: 'M3 Pro',
      storage: '1TB',
      ram: '18GB'
    }
  }
];

// 测试生命周期事件数据
const testLifecycleEvents = [
  // 设备1的生命周期事件
  {
    deviceQrcodeId: 'QR_TEST_001',
    eventType: 'manufactured',
    eventSubtype: 'factory_out',
    eventTimestamp: '2024-01-15T08:00:00Z',
    location: '富士康工厂',
    notes: '设备出厂',
    eventData: {
      batchNumber: 'BATCH_20240115_001',
      qualityChecked: true
    }
  },
  {
    deviceQrcodeId: 'QR_TEST_001',
    eventType: 'activated',
    eventSubtype: 'first_activation',
    eventTimestamp: '2024-01-20T14:30:00Z',
    location: '上海用户',
    notes: '用户首次激活设备',
    eventData: {
      activationMethod: '扫码激活',
      userRegion: '上海'
    }
  },
  {
    deviceQrcodeId: 'QR_TEST_001',
    eventType: 'repaired',
    eventSubtype: 'screen_replacement',
    eventTimestamp: '2024-03-15T10:00:00Z',
    location: '苹果官方维修中心',
    notes: '屏幕碎裂维修',
    eventData: {
      technician: '张师傅',
      cost: 2888,
      partsReplaced: ['屏幕总成'],
      repairTime: '2小时'
    }
  },
  {
    deviceQrcodeId: 'QR_TEST_001',
    eventType: 'part_replaced',
    eventSubtype: 'battery_replacement',
    eventTimestamp: '2024-08-20T15:30:00Z',
    location: '苹果授权维修点',
    notes: '电池老化更换',
    eventData: {
      technician: '李师傅',
      cost: 688,
      partsReplaced: ['电池'],
      batteryHealth: '85% → 100%'
    }
  },
  
  // 设备2的生命周期事件
  {
    deviceQrcodeId: 'QR_TEST_002',
    eventType: 'manufactured',
    eventSubtype: 'factory_out',
    eventTimestamp: '2024-02-01T09:00:00Z',
    location: '三星工厂',
    notes: '设备出厂',
    eventData: {
      batchNumber: 'BATCH_20240201_001',
      qualityChecked: true
    }
  },
  {
    deviceQrcodeId: 'QR_TEST_002',
    eventType: 'activated',
    eventSubtype: 'first_activation',
    eventTimestamp: '2024-02-05T16:45:00Z',
    location: '北京用户',
    notes: '用户首次激活设备',
    eventData: {
      activationMethod: '扫码激活',
      userRegion: '北京'
    }
  },
  
  // 设备3的生命周期事件
  {
    deviceQrcodeId: 'QR_TEST_003',
    eventType: 'manufactured',
    eventSubtype: 'factory_out',
    eventTimestamp: '2023-11-20T11:00:00Z',
    location: '苹果工厂',
    notes: '设备出厂',
    eventData: {
      batchNumber: 'BATCH_20231120_001',
      qualityChecked: true
    }
  },
  {
    deviceQrcodeId: 'QR_TEST_003',
    eventType: 'activated',
    eventSubtype: 'first_activation',
    eventTimestamp: '2023-11-25T09:15:00Z',
    location: '深圳用户',
    notes: '用户首次激活设备',
    eventData: {
      activationMethod: '扫码激活',
      userRegion: '深圳'
    }
  },
  {
    deviceQrcodeId: 'QR_TEST_003',
    eventType: 'repaired',
    eventSubtype: 'keyboard_replacement',
    eventTimestamp: '2024-05-10T13:20:00Z',
    location: '苹果直营店',
    notes: '键盘按键失灵维修',
    eventData: {
      technician: '王师傅',
      cost: 1288,
      partsReplaced: ['键盘'],
      repairTime: '3小时'
    }
  }
];

async function prepareTestData() {
  console.log('🔧 开始准备设备档案测试数据...\n');
  
  try {
    // 1. 创建测试设备档案
    console.log('1️⃣ 创建测试设备档案...');
    for (const device of testDevices) {
      const { data, error } = await supabase
        .from('device_profiles')
        .upsert({
          qrcode_id: device.qrcodeId,
          product_model: device.productModel,
          product_category: device.productCategory,
          brand_name: device.brandName,
          serial_number: device.serialNumber,
          manufacturing_date: device.manufacturingDate,
          warranty_period: device.warrantyPeriod,
          specifications: device.specifications,
          current_status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'qrcode_id'
        });
      
      if (error) {
        console.warn(`⚠️  创建设备档案失败 (${device.qrcodeId}):`, error.message);
      } else {
        console.log(`✅ 设备档案创建成功: ${device.productModel} (${device.qrcodeId})`);
      }
    }
    
    // 2. 创建生命周期事件
    console.log('\n2️⃣ 创建生命周期事件...');
    for (const event of testLifecycleEvents) {
      const { data, error } = await supabase
        .from('device_lifecycle_events')
        .insert({
          device_qrcode_id: event.deviceQrcodeId,
          event_type: event.eventType,
          event_subtype: event.eventSubtype,
          event_timestamp: event.eventTimestamp,
          location: event.location,
          notes: event.notes,
          event_data: event.eventData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.warn(`⚠️  创建生命周期事件失败 (${event.deviceQrcodeId}):`, error.message);
      } else {
        console.log(`✅ 生命周期事件创建成功: ${event.eventType} (${event.deviceQrcodeId})`);
      }
    }
    
    // 3. 验证数据完整性
    console.log('\n3️⃣ 验证数据完整性...');
    const { data: profiles, error: profileError } = await supabase
      .from('device_profiles')
      .select('qrcode_id, product_model, current_status')
      .in('qrcode_id', testDevices.map(d => d.qrcodeId));
    
    if (profileError) {
      console.error('❌ 查询设备档案失败:', profileError.message);
    } else {
      console.log(`📊 设备档案总数: ${profiles.length}`);
      profiles.forEach(profile => {
        console.log(`   • ${profile.product_model} (${profile.qrcode_id}) - 状态: ${profile.current_status}`);
      });
    }
    
    const { data: events, error: eventError } = await supabase
      .from('device_lifecycle_events')
      .select('device_qrcode_id, event_type, COUNT(*) as count')
      .in('device_qrcode_id', testDevices.map(d => d.qrcodeId))
      .group('device_qrcode_id, event_type');
    
    if (eventError) {
      console.error('❌ 查询生命周期事件失败:', eventError.message);
    } else {
      console.log(`📊 生命周期事件统计:`);
      const eventStats = {};
      events.forEach(event => {
        if (!eventStats[event.device_qrcode_id]) {
          eventStats[event.device_qrcode_id] = {};
        }
        eventStats[event.device_qrcode_id][event.event_type] = event.count;
      });
      
      Object.entries(eventStats).forEach(([qrcodeId, stats]) => {
        console.log(`   • ${qrcodeId}:`, Object.entries(stats).map(([type, count]) => `${type}(${count})`).join(', '));
      });
    }
    
    console.log('\n🎉 测试数据准备完成！');
    console.log('\n📋 测试用设备二维码:');
    testDevices.forEach(device => {
      console.log(`   • ${device.productModel}: ${device.qrcodeId}`);
    });
    
    console.log('\n🚀 可以开始测试以下功能:');
    console.log('   • M1-105: 扫码落地页设备档案展示');
    console.log('   • M1-106: AI诊断历史故障参考');
    console.log('   • DIY-204: 教程页面设备档案入口');
    console.log('   • CROWDFUND-304: 以旧换新设备档案评估');
    console.log('   • FCX-405: 工单完成自动记录维修事件');
    
  } catch (error) {
    console.error('❌ 准备测试数据时发生错误:', error);
    process.exit(1);
  }
}

// 执行脚本
if (require.main === module) {
  prepareTestData();
}

module.exports = { testDevices, testLifecycleEvents, prepareTestData };