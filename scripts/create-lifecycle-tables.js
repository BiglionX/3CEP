/**
 * 直接创建设备生命周期表结构的脚本
 * 绕过迁移系统直接执行SQL语句
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

// 设备生命周期事件表SQL
const CREATE_LIFECYCLE_EVENTS_TABLE = `
CREATE TABLE IF NOT EXISTS device_lifecycle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_qrcode_id VARCHAR(100) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  event_subtype VARCHAR(50),
  event_data JSONB,
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  location VARCHAR(255),
  notes TEXT,
  metadata JSONB,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_device_lifecycle_events_qrcode_id ON device_lifecycle_events(device_qrcode_id);
CREATE INDEX IF NOT EXISTS idx_device_lifecycle_events_event_type ON device_lifecycle_events(event_type);
CREATE INDEX IF NOT EXISTS idx_device_lifecycle_events_timestamp ON device_lifecycle_events(event_timestamp DESC);

-- 添加约束
ALTER TABLE device_lifecycle_events 
ADD CONSTRAINT chk_event_type CHECK (
  event_type IN (
    'manufactured',
    'activated', 
    'repaired',
    'part_replaced',
    'transferred',
    'recycled',
    'inspected',
    'maintained',
    'upgraded'
  )
);
`;

// 设备档案表SQL
const CREATE_DEVICE_PROFILES_TABLE = `
CREATE TABLE IF NOT EXISTS device_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qrcode_id VARCHAR(100) UNIQUE NOT NULL,
  product_model VARCHAR(100) NOT NULL,
  product_category VARCHAR(100),
  brand_name VARCHAR(100),
  serial_number VARCHAR(100),
  manufacturing_date DATE,
  first_activated_at TIMESTAMP WITH TIME ZONE,
  warranty_start_date DATE,
  warranty_expiry DATE,
  warranty_period INTEGER,
  current_status VARCHAR(50) DEFAULT 'manufactured',
  last_event_at TIMESTAMP WITH TIME ZONE,
  last_event_type VARCHAR(50),
  total_repair_count INTEGER DEFAULT 0,
  total_part_replacement_count INTEGER DEFAULT 0,
  total_transfer_count INTEGER DEFAULT 0,
  current_location VARCHAR(255),
  owner_info JSONB,
  maintenance_history JSONB,
  specifications JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_device_profiles_qrcode_id ON device_profiles(qrcode_id);
CREATE INDEX IF NOT EXISTS idx_device_profiles_status ON device_profiles(current_status);
CREATE INDEX IF NOT EXISTS idx_device_profiles_model ON device_profiles(product_model);

-- 添加约束
ALTER TABLE device_profiles 
ADD CONSTRAINT chk_current_status CHECK (
  current_status IN (
    'manufactured',
    'activated',
    'in_repair',
    'active',
    'transferred',
    'recycled',
    'archived'
  )
);
`;

async function createTables() {
  console.log('🔧 开始创建设备生命周期表结构...\n');

  try {
    // 1. 创建设备生命周期事件表
    console.log('1️⃣ 创建设备生命周期事件表...');
    const { error: eventError } = await supabase.rpc('execute_sql', {
      sql: CREATE_LIFECYCLE_EVENTS_TABLE,
    });

    if (eventError) {
      console.log('⚠️  通过RPC执行失败，尝试直接执行...');
      // 如果RPC失败，尝试其他方式
      const { data, error } = await supabase
        .from('device_lifecycle_events')
        .select('count(*)');

      if (error && error.message.includes('does not exist')) {
        console.log('   表不存在，需要通过Supabase控制台手动创建');
      } else {
        console.log('✅ 设备生命周期事件表已存在');
      }
    } else {
      console.log('✅ 设备生命周期事件表创建成功');
    }

    // 2. 创建设备档案表
    console.log('\n2️⃣ 创建设备档案表...');
    const { error: profileError } = await supabase.rpc('execute_sql', {
      sql: CREATE_DEVICE_PROFILES_TABLE,
    });

    if (profileError) {
      console.log('⚠️  通过RPC执行失败，尝试直接执行...');
      const { data, error } = await supabase
        .from('device_profiles')
        .select('count(*)');

      if (error && error.message.includes('does not exist')) {
        console.log('   表不存在，需要通过Supabase控制台手动创建');
      } else {
        console.log('✅ 设备档案表已存在');
      }
    } else {
      console.log('✅ 设备档案表创建成功');
    }

    // 3. 验证表结构
    console.log('\n3️⃣ 验证表结构...');

    // 检查设备生命周期事件表
    try {
      const { data: eventData, error: eventCheckError } = await supabase
        .from('device_lifecycle_events')
        .select('count(*)')
        .limit(1);

      if (!eventCheckError) {
        console.log('✅ device_lifecycle_events 表结构正常');
      } else {
        console.log(
          '❌ device_lifecycle_events 表结构异常:',
          eventCheckError.message
        );
      }
    } catch (e) {
      console.log('❌ device_lifecycle_events 表检查失败');
    }

    // 检查设备档案表
    try {
      const { data: profileData, error: profileCheckError } = await supabase
        .from('device_profiles')
        .select('count(*)')
        .limit(1);

      if (!profileCheckError) {
        console.log('✅ device_profiles 表结构正常');
      } else {
        console.log(
          '❌ device_profiles 表结构异常:',
          profileCheckError.message
        );
      }
    } catch (e) {
      console.log('❌ device_profiles 表检查失败');
    }

    console.log('\n📋 下一步建议:');
    console.log('   1. 如果表创建失败，请登录Supabase控制台手动执行SQL');
    console.log('   2. 或者运行: npx supabase db push');
    console.log('   3. 然后重新运行测试数据准备脚本');
  } catch (error) {
    console.error('❌ 创建表结构时发生错误:', error);
    process.exit(1);
  }
}

// 执行脚本
if (require.main === module) {
  createTables();
}

module.exports = { createTables };
