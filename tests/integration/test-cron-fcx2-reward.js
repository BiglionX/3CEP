/**
 * FCX2奖励发放定时任务测试脚本
 * 用于测试和验证cron-fcx2-reward-distribution.js的功能
 */

const {
  processOrderRewards,
  cleanupExpiredOptions,
  calculateOrderReward,
} = require('./cron-fcx2-reward-distribution.js');
const { createClient } = require('@supabase/supabase-js');

// 测试配置
const TEST_CONFIG = {
  SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://hrjqzbhqueleszkvnsen.supabase.co',
  SERVICE_KEY:
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyanF6YmxxdWVsZXN6a3Zuc2VuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMDQzOTk0NywiZXhwIjoyMDM2MDE1OTQ3fQ.YOUR_SERVICE_KEY_HERE',
};

const supabase = createClient(
  TEST_CONFIG.SUPABASE_URL,
  TEST_CONFIG.SERVICE_KEY
);

/**
 * 测试奖励计算功能
 */
async function testRewardCalculation() {
  console.log('🧪 开始测试奖励计算功能...\n');

  // 模拟测试数据
  const testOrders = [
    {
      id: 'test-order-1',
      order_number: 'TEST001',
      repair_shop_id: 'test-shop-1',
      fcx_amount_locked: 1000,
      status: 'completed',
      rating: 3.0,
    },
    {
      id: 'test-order-2',
      order_number: 'TEST002',
      repair_shop_id: 'test-shop-1',
      fcx_amount_locked: 1000,
      status: 'completed',
      rating: 4.0,
    },
    {
      id: 'test-order-3',
      order_number: 'TEST003',
      repair_shop_id: 'test-shop-1',
      fcx_amount_locked: 1000,
      status: 'completed',
      rating: 5.0,
    },
  ];

  for (const order of testOrders) {
    try {
      const result = await calculateOrderReward(order);
      console.log(`✅ 工单 ${order.order_number} (评分: ${order.rating})`);
      console.log(`   基础奖励: ${result.baseReward.toFixed(6)} FCX2`);
      console.log(`   评分倍数: ${result.ratingMultiplier.toFixed(2)}x`);
      console.log(`   等级加成: ${result.levelBonus.toFixed(2)}x`);
      console.log(`   最终奖励: ${result.finalAmount.toFixed(6)} FCX2\n`);
    } catch (error) {
      console.log(`❌ 工单 ${order.order_number} 计算失败: ${error.message}\n`);
    }
  }
}

/**
 * 测试期权清理功能
 */
async function testOptionCleanup() {
  console.log('🧹 开始测试期权清理功能...\n');

  try {
    const cleanedCount = await cleanupExpiredOptions();
    console.log(`✅ 清理完成，处理了 ${cleanedCount} 个过期期权`);
  } catch (error) {
    console.log(`❌ 清理失败: ${error.message}`);
  }
}

/**
 * 测试完整奖励发放流程
 */
async function testFullProcess() {
  console.log('🚀 开始测试完整奖励发放流程...\n');

  try {
    const result = await processOrderRewards();
    console.log('📊 执行结果:');
    console.log(`   处理工单数: ${result.processed}`);
    console.log(`   成功发放: ${result.success}`);
    console.log(`   失败数量: ${result.failed}`);
  } catch (error) {
    console.log(`❌ 流程执行失败: ${error.message}`);
  }
}

/**
 * 准备测试数据
 */
async function prepareTestData() {
  console.log('📋 准备测试数据...\n');

  try {
    // 创建测试店铺
    const { data: testShop, error: shopError } = await supabase
      .from('repair_shops')
      .upsert(
        {
          id: 'test-shop-1',
          name: '测试维修店',
          contact_person: '测试联系人',
          phone: '13800138000',
          address: '测试地址',
          city: '测试城市',
          province: '测试省份',
          alliance_level: 'silver',
          fcx2_balance: 0,
          is_alliance_member: true,
        },
        { onConflict: 'id' }
      );

    if (shopError) {
      console.log(`⚠️  创建测试店铺失败: ${shopError.message}`);
    } else {
      console.log('✅ 测试店铺准备完成');
    }

    // 创建测试工单
    const testOrders = [
      {
        id: 'test-order-complete-1',
        order_number: 'TEST-COMPLETE-001',
        repair_shop_id: 'test-shop-1',
        consumer_id: 'test-consumer-1',
        fcx_amount_locked: 1500,
        status: 'completed',
        rating: 4.5,
        completed_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'test-order-complete-2',
        order_number: 'TEST-COMPLETE-002',
        repair_shop_id: 'test-shop-1',
        consumer_id: 'test-consumer-2',
        fcx_amount_locked: 2000,
        status: 'completed',
        rating: 3.8,
        completed_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      },
    ];

    for (const order of testOrders) {
      const { error: orderError } = await supabase
        .from('repair_orders')
        .upsert(order, { onConflict: 'id' });

      if (orderError) {
        console.log(
          `⚠️  创建测试工单 ${order.order_number} 失败: ${orderError.message}`
        );
      } else {
        console.log(`✅ 测试工单 ${order.order_number} 创建完成`);
      }
    }
  } catch (error) {
    console.log(`❌ 准备测试数据失败: ${error.message}`);
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🎯 FCX2奖励发放定时任务测试套件\n');
  console.log('=====================================\n');

  try {
    // 1. 准备测试数据
    await prepareTestData();

    // 2. 测试奖励计算
    await testRewardCalculation();

    // 3. 测试期权清理
    await testOptionCleanup();

    // 4. 测试完整流程（调试模式）
    console.log('🔧 运行调试模式完整测试...\n');
    await testFullProcess();

    console.log('\n✅ 所有测试完成！');
  } catch (error) {
    console.log(`❌ 测试过程中发生错误: ${error.message}`);
    process.exit(1);
  }
}

// 执行测试
if (require.main === module) {
  runTests();
}

module.exports = {
  testRewardCalculation,
  testOptionCleanup,
  testFullProcess,
  prepareTestData,
};
