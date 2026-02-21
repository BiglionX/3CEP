/**
 * 简化版设备档案测试数据准备脚本
 * 直接插入测试数据，忽略表结构验证
 */

const { createClient } = require('@supabase/supabase-js');

// 从环境变量获取配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 请设置环境变量:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 测试数据
const TEST_DEVICES = [
  {
    qrcode_id: 'QR_TEST_001',
    product_model: 'iPhone 15 Pro',
    product_category: '智能手机',
    brand_name: 'Apple',
    serial_number: 'SN001ABC123',
    manufacturing_date: '2024-01-15',
    warranty_period: 12,
    current_status: 'active',
    specifications: {
      color: '钛金属原色',
      storage: '256GB',
      ram: '8GB'
    }
  },
  {
    qrcode_id: 'QR_TEST_002', 
    product_model: 'Galaxy S24 Ultra',
    product_category: '智能手机',
    brand_name: 'Samsung',
    serial_number: 'SN002DEF456',
    manufacturing_date: '2024-02-01',
    warranty_period: 12,
    current_status: 'activated',
    specifications: {
      color: '钛灰',
      storage: '512GB', 
      ram: '12GB'
    }
  },
  {
    qrcode_id: 'QR_TEST_003',
    product_model: 'MacBook Pro 14"',
    product_category: '笔记本电脑',
    brand_name: 'Apple',
    serial_number: 'SN003GHI789',
    manufacturing_date: '2023-11-20',
    warranty_period: 24,
    current_status: 'active',
    specifications: {
      processor: 'M3 Pro',
      storage: '1TB',
      ram: '18GB'
    }
  }
];

const TEST_LIFECYCLE_EVENTS = [
  // iPhone 15 Pro 事件
  {
    device_qrcode_id: 'QR_TEST_001',
    event_type: 'manufactured',
    event_subtype: 'factory_out',
    event_timestamp: '2024-01-15T08:00:00Z',
    location: '富士康工厂',
    notes: '设备出厂',
    event_data: {
      batchNumber: 'BATCH_20240115_001',
      qualityChecked: true
    }
  },
  {
    device_qrcode_id: 'QR_TEST_001',
    event_type: 'activated',
    event_subtype: 'first_activation',
    event_timestamp: '2024-01-20T14:30:00Z',
    location: '上海用户',
    notes: '用户首次激活设备',
    event_data: {
      activationMethod: '扫码激活',
      userRegion: '上海'
    }
  },
  {
    device_qrcode_id: 'QR_TEST_001',
    event_type: 'repaired',
    event_subtype: 'screen_replacement',
    event_timestamp: '2024-03-15T10:00:00Z',
    location: '苹果官方维修中心',
    notes: '屏幕碎裂维修',
    event_data: {
      technician: '张师傅',
      cost: 2888,
      partsReplaced: ['屏幕总成'],
      repairTime: '2小时'
    }
  },
  
  // Galaxy S24 Ultra 事件
  {
    device_qrcode_id: 'QR_TEST_002',
    event_type: 'manufactured',
    event_subtype: 'factory_out',
    event_timestamp: '2024-02-01T09:00:00Z',
    location: '三星工厂',
    notes: '设备出厂',
    event_data: {
      batchNumber: 'BATCH_20240201_001',
      qualityChecked: true
    }
  },
  {
    device_qrcode_id: 'QR_TEST_002',
    event_type: 'activated',
    event_subtype: 'first_activation',
    event_timestamp: '2024-02-05T16:45:00Z',
    location: '北京用户',
    notes: '用户首次激活设备',
    event_data: {
      activationMethod: '扫码激活',
      userRegion: '北京'
    }
  },
  
  // MacBook Pro 事件
  {
    device_qrcode_id: 'QR_TEST_003',
    event_type: 'manufactured',
    event_subtype: 'factory_out',
    event_timestamp: '2023-11-20T11:00:00Z',
    location: '苹果工厂',
    notes: '设备出厂',
    event_data: {
      batchNumber: 'BATCH_20231120_001',
      qualityChecked: true
    }
  },
  {
    device_qrcode_id: 'QR_TEST_003',
    event_type: 'activated',
    event_subtype: 'first_activation',
    event_timestamp: '2023-11-25T09:15:00Z',
    location: '深圳用户',
    notes: '用户首次激活设备',
    event_data: {
      activationMethod: '扫码激活',
      userRegion: '深圳'
    }
  }
];

async function prepareSimpleTestData() {
  console.log('🔧 开始准备简化版测试数据...\n');
  
  try {
    // 1. 插入测试设备档案
    console.log('1️⃣ 插入测试设备档案...');
    let profileSuccess = 0;
    
    for (const device of TEST_DEVICES) {
      try {
        const { data, error } = await supabase
          .from('device_profiles')
          .upsert(device, {
            onConflict: 'qrcode_id'
          });
        
        if (error) {
          console.warn(`⚠️  插入设备档案失败 (${device.qrcode_id}):`, error.message);
        } else {
          console.log(`✅ 设备档案插入成功: ${device.product_model}`);
          profileSuccess++;
        }
      } catch (e) {
        console.warn(`⚠️  插入设备档案异常 (${device.qrcode_id}):`, e.message);
      }
    }
    
    // 2. 插入生命周期事件
    console.log('\n2️⃣ 插入生命周期事件...');
    let eventSuccess = 0;
    
    for (const event of TEST_LIFECYCLE_EVENTS) {
      try {
        const { data, error } = await supabase
          .from('device_lifecycle_events')
          .insert(event);
        
        if (error) {
          console.warn(`⚠️  插入事件失败 (${event.device_qrcode_id}):`, error.message);
        } else {
          console.log(`✅ 事件插入成功: ${event.event_type}`);
          eventSuccess++;
        }
      } catch (e) {
        console.warn(`⚠️  插入事件异常 (${event.device_qrcode_id}):`, e.message);
      }
    }
    
    // 3. 简单验证
    console.log('\n3️⃣ 简单验证...');
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('device_profiles')
        .select('qrcode_id, product_model')
        .in('qrcode_id', TEST_DEVICES.map(d => d.qrcode_id));
      
      if (!profileError && profiles) {
        console.log(`📊 成功插入设备档案: ${profiles.length} 条`);
      }
      
      const { data: events, error: eventError } = await supabase
        .from('device_lifecycle_events')
        .select('device_qrcode_id, event_type')
        .in('device_qrcode_id', TEST_DEVICES.map(d => d.qrcode_id));
      
      if (!eventError && events) {
        console.log(`📊 成功插入生命周期事件: ${events.length} 条`);
      }
    } catch (e) {
      console.log('⚠️  验证过程出现异常，但数据可能已插入');
    }
    
    console.log('\n🎉 测试数据准备完成！');
    console.log(`📈 插入统计: 设备档案 ${profileSuccess}/${TEST_DEVICES.length} 条, 事件 ${eventSuccess}/${TEST_LIFECYCLE_EVENTS.length} 条`);
    
    console.log('\n📋 测试用二维码:');
    TEST_DEVICES.forEach(device => {
      console.log(`   • ${device.product_model}: ${device.qrcode_id}`);
    });
    
    console.log('\n🚀 可以开始测试设备档案集成功能！');
    
  } catch (error) {
    console.error('❌ 准备测试数据时发生错误:', error);
    process.exit(1);
  }
}

// 执行脚本
if (require.main === module) {
  prepareSimpleTestData();
}

module.exports = { prepareSimpleTestData, TEST_DEVICES, TEST_LIFECYCLE_EVENTS };