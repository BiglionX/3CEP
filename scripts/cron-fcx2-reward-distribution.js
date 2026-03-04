#!/usr/bin/env node

/**
 * FCX2奖励发放定时任务脚本
 * 功能：定时扫描符合条件的工单，自动计算并发放FCX2奖励
 *
 * 使用方式：
 * - 定时执行：node scripts/cron-fcx2-reward-distribution.js
 * - 手动触发：node scripts/cron-fcx2-reward-distribution.js --manual
 * - 调试模式：node scripts/cron-fcx2-reward-distribution.js --debug
 */

const { createClient } = require('@supabase/supabase-js');

// 配置
const CONFIG = {
  SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://hrjqzbhqueleszkvnsen.supabase.co',
  SERVICE_KEY:
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyanF6YmxxdWVsZXN6a3Zuc2VuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMDQzOTk0NywiZXhwIjoyMDM2MDE1OTQ3fQ.YOUR_SERVICE_KEY_HERE',
  BATCH_SIZE: 50, // 每批处理的工单数量
  MIN_RATING: 3.0, // 获得奖励的最低评分
  DEBUG_MODE: process.argv.includes('--debug'),
  MANUAL_MODE: process.argv.includes('--manual'),
};

// 初始化Supabase客户端
const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SERVICE_KEY);

/**
 * 日志工具函数
 */
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${type}]`;

  if (CONFIG.DEBUG_MODE) {
    console.log(`${prefix} ${message}`);
  } else if (type !== 'DEBUG') {
    console.log(`${prefix} ${message}`);
  }
}

/**
 * 获取符合条件的工单列表
 */
async function getEligibleOrders() {
  try {
    log('正在查询符合条件的工单...');

    const { data, error } = await supabase
      .from('repair_orders')
      .select(
        `
        id,
        order_number,
        repair_shop_id,
        fcx_amount_locked,
        status,
        rating,
        completed_at,
        created_at
      `
      )
      .eq('status', 'completed')
      .gte('rating', CONFIG.MIN_RATING)
      .is('reward_processed', null) // 奖励尚未处理
      .order('completed_at', { ascending: true })
      .limit(CONFIG.BATCH_SIZE);

    if (error) {
      throw new Error(`查询工单失败: ${error.message}`);
    }

    log(`找到 ${data?.length || 0} 个符合条件的工单`);
    return data || [];
  } catch (error) {
    log(`获取工单列表错误: ${error.message}`, 'ERROR');
    throw error;
  }
}

/**
 * 计算单个工单的FCX2奖励
 */
async function calculateOrderReward(order) {
  try {
    const baseReward = (order.fcx_amount_locked || 0) * 0.1; // 基础10%奖励

    // 评分倍数计算 (3.0-5.0分对应1.0-1.5倍)
    const ratingMultiplier = 1.0 + ((order.rating - 3.0) / 2.0) * 0.5;

    // 获取店铺当前等级加成
    const { data: shop } = await supabase
      .from('repair_shops')
      .select('alliance_level')
      .eq('id', order.repair_shop_id)
      .single();

    let levelBonus = 1.0;
    if (shop?.alliance_level) {
      switch (shop.alliance_level) {
        case 'silver':
          levelBonus = 1.1;
          break;
        case 'gold':
          levelBonus = 1.2;
          break;
        case 'diamond':
          levelBonus = 1.5;
          break;
        default:
          levelBonus = 1.0;
      }
    }

    const totalReward = baseReward * ratingMultiplier * levelBonus;

    return {
      baseReward,
      ratingMultiplier,
      levelBonus,
      finalAmount: Math.round(totalReward * 1000000) / 1000000, // 保留6位小数
    };
  } catch (error) {
    log(`计算工单 ${order.order_number} 奖励错误: ${error.message}`, 'ERROR');
    throw error;
  }
}

/**
 * 发放FCX2奖励
 */
async function distributeReward(order, rewardAmount) {
  try {
    // 1. 发放期权奖励
    const { data: option, error: optionError } = await supabase
      .from('fcx2_options')
      .insert({
        repair_shop_id: order.repair_shop_id,
        amount: rewardAmount,
        earned_from_order_id: order.id,
        status: 'active',
        created_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + 2 * 365 * 24 * 60 * 60 * 1000
        ).toISOString(), // 2年后过期
      })
      .select()
      .single();

    if (optionError) {
      throw new Error(`创建期权记录失败: ${optionError.message}`);
    }

    // 2. 更新店铺FCX2余额
    const { error: updateError } = await supabase
      .from('repair_shops')
      .update({
        fcx2_balance:
          supabase.rpc('coalesce', [{ fcx2_balance: 0 }, 0]) + rewardAmount,
      })
      .eq('id', order.repair_shop_id);

    if (updateError) {
      throw new Error(`更新店铺余额失败: ${updateError.message}`);
    }

    // 3. 记录奖励发放日志
    const { error: logError } = await supabase.from('fcx_reward_logs').insert({
      order_id: order.id,
      repair_shop_id: order.repair_shop_id,
      reward_amount: rewardAmount,
      reward_type: 'fcx2_option',
      status: 'distributed',
      distributed_at: new Date().toISOString(),
    });

    if (logError) {
      log(`记录奖励日志失败: ${logError.message}`, 'WARN');
    }

    // 4. 标记工单奖励已处理
    await supabase
      .from('repair_orders')
      .update({
        reward_processed: true,
        reward_processed_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    return option;
  } catch (error) {
    log(`发放奖励失败: ${error.message}`, 'ERROR');
    throw error;
  }
}

/**
 * 处理工单奖励发放
 */
async function processOrderRewards() {
  try {
    log('开始处理FCX2奖励发放任务...');

    // 获取符合条件的工单
    const orders = await getEligibleOrders();

    if (orders.length === 0) {
      log('没有需要处理的工单');
      return { processed: 0, success: 0, failed: 0 };
    }

    let successCount = 0;
    let failedCount = 0;

    // 逐个处理工单
    for (const order of orders) {
      try {
        log(`处理工单: ${order.order_number} (评分: ${order.rating})`);

        // 计算奖励
        const reward = await calculateOrderReward(order);
        log(
          `计算奖励: 基础${reward.baseReward}, 最终${reward.finalAmount} FCX2`
        );

        // 发放奖励
        const option = await distributeReward(order, reward.finalAmount);
        log(`✅ 奖励发放成功: ${option.id} (${reward.finalAmount} FCX2)`);

        successCount++;
      } catch (error) {
        log(
          `❌ 工单 ${order.order_number} 处理失败: ${error.message}`,
          'ERROR'
        );
        failedCount++;
      }
    }

    const result = {
      processed: orders.length,
      success: successCount,
      failed: failedCount,
    };

    log(
      `任务完成 - 总计: ${result.processed}, 成功: ${result.success}, 失败: ${result.failed}`
    );
    return result;
  } catch (error) {
    log(`任务执行失败: ${error.message}`, 'ERROR');
    throw error;
  }
}

/**
 * 清理过期期权
 */
async function cleanupExpiredOptions() {
  try {
    log('开始清理过期期权...');

    const { data, error } = await supabase
      .from('fcx2_options')
      .update({ status: 'expired' })
      .lt('expires_at', new Date().toISOString())
      .eq('status', 'active')
      .select();

    if (error) {
      throw new Error(`清理过期期权失败: ${error.message}`);
    }

    log(`清理完成，共处理 ${data?.length || 0} 个过期期权`);
    return data?.length || 0;
  } catch (error) {
    log(`清理过期期权错误: ${error.message}`, 'ERROR');
    return 0;
  }
}

/**
 * 主执行函数
 */
async function main() {
  try {
    log('=== FCX2奖励发放定时任务启动 ===');

    // 处理工单奖励
    const rewardResult = await processOrderRewards();

    // 清理过期期权
    const expiredCount = await cleanupExpiredOptions();

    // 输出汇总报告
    log('=== 任务执行汇总 ===');
    log(
      `奖励发放: 处理${rewardResult.processed}个工单，成功${rewardResult.success}个，失败${rewardResult.failed}个`
    );
    log(`期权清理: 处理${expiredCount}个过期期权`);
    log('=== 任务执行完毕 ===');

    // 返回执行结果
    return {
      rewardDistribution: rewardResult,
      expiredCleanup: expiredCount,
    };
  } catch (error) {
    log(`任务执行严重错误: ${error.message}`, 'ERROR');
    process.exit(1);
  }
}

// 命令行执行入口
if (require.main === module) {
  // 设置优雅退出
  process.on('SIGTERM', () => {
    log('收到终止信号，正在优雅退出...', 'WARN');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    log('收到中断信号，正在退出...', 'WARN');
    process.exit(0);
  });

  // 执行主函数
  main()
    .then(result => {
      if (CONFIG.DEBUG_MODE) {
        console.log('\n详细执行结果:', JSON.stringify(result, null, 2));
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('任务执行失败:', error);
      process.exit(1);
    });
}

// 导出供其他模块使用
module.exports = {
  processOrderRewards,
  cleanupExpiredOptions,
  calculateOrderReward,
  distributeReward,
  CONFIG,
};
