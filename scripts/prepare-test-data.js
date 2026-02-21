#!/usr/bin/env node

/**
 * FixCycle E2E测试数据准备脚本
 * 用于创建测试所需的用户账号、字典数据、热点链接等基础数据
 */

// 手动加载环境变量
require('fs').readFileSync('.env', 'utf8').split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  }
});

const { createClient } = require('@supabase/supabase-js');

// 配置Supabase客户端
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ 缺少必要的环境变量:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SERVICE_ROLE_KEY ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// 测试数据配置
const TEST_DATA = {
  users: [
    {
      email: 'engineer@test.com',
      password: 'Test123!@#',
      user_metadata: {
        name: '测试工程师',
        role: 'engineer',
        phone: '13800138001'
      }
    },
    {
      email: 'consumer@test.com',
      password: 'Test123!@#',
      user_metadata: {
        name: '测试消费者',
        role: 'consumer',
        phone: '13800138002'
      }
    },
    {
      email: 'shopowner@test.com',
      password: 'Test123!@#',
      user_metadata: {
        name: '测试店主',
        role: 'engineer',
        sub_role: 'shop_owner',
        phone: '13800138003'
      }
    }
  ],
  
  devices: [
    { brand: 'Apple', model: 'iPhone 12', series: 'iPhone', release_year: 2020, category: 'smartphone', os_type: 'iOS', status: 'active' },
    { brand: 'Apple', model: 'iPhone 13', series: 'iPhone', release_year: 2021, category: 'smartphone', os_type: 'iOS', status: 'active' },
    { brand: 'Apple', model: 'iPhone 14', series: 'iPhone', release_year: 2022, category: 'smartphone', os_type: 'iOS', status: 'active' },
    { brand: 'Apple', model: 'iPhone 15', series: 'iPhone', release_year: 2023, category: 'smartphone', os_type: 'iOS', status: 'active' },
    { brand: 'Huawei', model: 'P50', series: 'P系列', release_year: 2021, category: 'smartphone', os_type: 'Android', status: 'active' },
    { brand: 'Huawei', model: 'Mate 40', series: 'Mate系列', release_year: 2020, category: 'smartphone', os_type: 'Android', status: 'active' },
    { brand: 'Xiaomi', model: '13', series: '数字系列', release_year: 2022, category: 'smartphone', os_type: 'Android', status: 'active' },
    { brand: 'Xiaomi', model: '14', series: '数字系列', release_year: 2023, category: 'smartphone', os_type: 'Android', status: 'active' },
    { brand: 'Samsung', model: 'Galaxy S23', series: 'Galaxy S', release_year: 2023, category: 'smartphone', os_type: 'Android', status: 'active' },
    { brand: 'OPPO', model: 'Reno 8', series: 'Reno系列', release_year: 2022, category: 'smartphone', os_type: 'Android', status: 'active' }
  ],
  
  fault_types: [
    { 
      name: '屏幕损坏', 
      description: '屏幕碎裂或显示异常',
      difficulty_level: 'medium',
      estimated_time: 60
    },
    { 
      name: '电池问题', 
      description: '电池不耐用或无法充电',
      difficulty_level: 'easy',
      estimated_time: 30
    },
    { 
      name: '进水故障', 
      description: '设备进水导致功能异常',
      difficulty_level: 'hard',
      estimated_time: 120
    },
    { 
      name: '无法开机', 
      description: '设备无法正常启动',
      difficulty_level: 'medium',
      estimated_time: 45
    },
    { 
      name: '声音问题', 
      description: '听筒、扬声器无声或杂音',
      difficulty_level: 'easy',
      estimated_time: 25
    }
  ],
  
  hot_links: [
    {
      url: 'https://example.com/iphone12-screen-repair',
      title: 'iPhone 12 屏幕更换详细教程',
      description: '详细的iPhone 12屏幕更换步骤，包含所需工具和注意事项',
      source: 'tech-blog',
      views: 156,
      likes: 2,
      scraped_at: new Date().toISOString()
    },
    {
      url: 'https://example.com/battery-fix-guide',
      title: '手机电池续航优化指南',
      description: '提升手机电池使用寿命的实用技巧和维修方法',
      source: 'repair-wiki',
      views: 89,
      likes: 1,
      scraped_at: new Date().toISOString()
    },
    {
      url: 'https://example.com/water-damage-solution',
      title: '手机进水应急处理方案',
      description: '手机意外进水后的紧急处理步骤和专业维修建议',
      source: 'professional-repair',
      views: 234,
      likes: 0,
      scraped_at: new Date().toISOString()
    }
  ],
  
  parts: [
    {
      name: 'iPhone 12 原装屏幕总成',
      category: '屏幕组件',
      brand: 'Apple',
      model: 'iPhone 12',
      description: '适用于iPhone 12的原装屏幕总成，包含触摸层和显示层',
      image_url: 'https://example.com/images/iphone12-screen.jpg'
    },
    {
      name: 'iPhone 13 电池',
      category: '电池组件',
      brand: 'Apple',
      model: 'iPhone 13',
      description: 'iPhone 13原装电池，容量3240mAh，续航表现优秀',
      image_url: 'https://example.com/images/iphone13-battery.jpg'
    },
    {
      name: '华为 P50 充电IC',
      category: '芯片组件',
      brand: 'Huawei',
      model: 'P50',
      description: '华为P50专用充电管理芯片，支持快充协议',
      image_url: 'https://example.com/images/p50-charging-ic.jpg'
    }
  ]
};

async function prepareTestData() {
  console.log('🚀 开始准备E2E测试数据...\n');
  
  try {
    // 1. 创建测试用户
    console.log('📋 1. 创建测试用户...');
    const createdUsers = [];
    
    for (const userData of TEST_DATA.users) {
      try {
        // 检查用户是否已存在
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', userData.email)
          .single();
        
        if (existingUser) {
          console.log(`   ⚠️  用户 ${userData.email} 已存在`);
          createdUsers.push(existingUser);
          continue;
        }
        
        // 创建新用户
        const { data, error } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: userData.user_metadata
        });
        
        if (error) {
          console.error(`   ❌ 创建用户 ${userData.email} 失败:`, error.message);
        } else {
          console.log(`   ✅ 成功创建用户 ${userData.email}`);
          createdUsers.push(data.user);
          
          // 更新用户档案扩展信息
          await supabase.from('user_profiles_ext').insert({
            user_id: data.user.id,
            role: userData.user_metadata.role,
            sub_role: userData.user_metadata.sub_role || null,
            phone: userData.user_metadata.phone,
            status: 'active'
          });
        }
      } catch (error) {
        console.error(`   ❌ 处理用户 ${userData.email} 时出错:`, error.message);
      }
    }
    
    // 2. 创建设备型号字典
    console.log('\n📱 2. 创建设备型号字典...');
    for (const device of TEST_DATA.devices) {
      try {
        const { data, error } = await supabase
          .from('devices')
          .upsert(device, { onConflict: 'name' });
        
        if (error) {
          console.error(`   ❌ 创建设备 ${device.name} 失败:`, error.message);
        } else {
          console.log(`   ✅ 设备 ${device.name} 准备就绪`);
        }
      } catch (error) {
        console.error(`   ❌ 处理设备 ${device.name} 时出错:`, error.message);
      }
    }
    
    // 3. 创建故障类型字典
    console.log('\n🔧 3. 创建故障类型字典...');
    for (const faultType of TEST_DATA.fault_types) {
      try {
        const { data, error } = await supabase
          .from('fault_types')
          .upsert(faultType, { onConflict: 'code' });
        
        if (error) {
          console.error(`   ❌ 创建故障类型 ${faultType.name} 失败:`, error.message);
        } else {
          console.log(`   ✅ 故障类型 ${faultType.name} 准备就绪`);
        }
      } catch (error) {
        console.error(`   ❌ 处理故障类型 ${faultType.name} 时出错:`, error.message);
      }
    }
    
    // 4. 创建热点链接数据
    console.log('\n🔗 4. 创建热点链接数据...');
    for (const hotLink of TEST_DATA.hot_links) {
      try {
        const { data, error } = await supabase
          .from('hot_link_pool')
          .upsert(hotLink, { onConflict: 'url' });
        
        if (error) {
          console.error(`   ❌ 创建热点链接 ${hotLink.title} 失败:`, error.message);
        } else {
          console.log(`   ✅ 热点链接 ${hotLink.title} 准备就绪`);
        }
      } catch (error) {
        console.error(`   ❌ 处理热点链接 ${hotLink.title} 时出错:`, error.message);
      }
    }
    
    // 5. 创建配件数据
    console.log('\n⚙️  5. 创建配件数据...');
    for (const part of TEST_DATA.parts) {
      try {
        const { data, error } = await supabase
          .from('parts')
          .upsert(part, { onConflict: 'name' });
        
        if (error) {
          console.error(`   ❌ 创建配件 ${part.name} 失败:`, error.message);
        } else {
          console.log(`   ✅ 配件 ${part.name} 准备就绪`);
        }
      } catch (error) {
        console.error(`   ❌ 处理配件 ${part.name} 时出错:`, error.message);
      }
    }
    
    console.log('\n🎉 测试数据准备完成！');
    console.log('\n📊 数据统计:');
    console.log(`   • 测试用户: ${createdUsers.length} 个`);
    console.log(`   • 设备型号: ${TEST_DATA.devices.length} 种`);
    console.log(`   • 故障类型: ${TEST_DATA.fault_types.length} 种`);
    console.log(`   • 热点链接: ${TEST_DATA.hot_links.length} 条`);
    console.log(`   • 配件数据: ${TEST_DATA.parts.length} 个`);
    
    console.log('\n📝 测试账号信息:');
    console.log('   工程师账号: engineer@test.com / Test123!@#');
    console.log('   消费者账号: consumer@test.com / Test123!@#');
    console.log('   店主账号: shopowner@test.com / Test123!@#');
    
    return true;
    
  } catch (error) {
    console.error('❌ 测试数据准备过程中发生错误:', error.message);
    return false;
  }
}

// 执行数据准备
if (require.main === module) {
  prepareTestData()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { prepareTestData, TEST_DATA };