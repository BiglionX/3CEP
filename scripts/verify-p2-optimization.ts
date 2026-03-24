/**
 * P2 优化任务验证脚本
 *
 * 用于快速验证 OPT-018 和 OPT-017 功能是否正常
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * 测试颜色
 */
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message: string, color = 'reset') {
  console.log(
    `${colors[color as keyof typeof colors]}${message}${colors.reset}`
  );
}

/**
 * 测试 OPT-018: 历史监控数据存储
 */
async function testOpt018() {
  log('\n📊 测试 OPT-018: 历史监控数据存储', 'blue');
  log('='.repeat(50), 'blue');

  try {
    // 测试 1: 手动触发快照采集
    log('\n1️⃣  触发智能体状态快照...', 'yellow');
    const snapshotResponse = await fetch(`${API_BASE_URL}/api/cron/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-token'}`,
      },
      body: JSON.stringify({ jobName: 'agent-status-snapshot' }),
    });

    const snapshotResult = await snapshotResponse.json();
    if (snapshotResult.success) {
      log('✅ 快照采集成功', 'green');
      log(`   - 处理：${snapshotResult.result?.processed || 0} 条`, 'green');
      log(`   - 插入：${snapshotResult.result?.inserted || 0} 条`, 'green');
    } else {
      log('❌ 快照采集失败', 'red');
      log(`   错误：${snapshotResult.error}`, 'red');
    }

    // 测试 2: 查询历史数据
    log('\n2️⃣  查询历史监控数据...', 'yellow');
    const today = new Date().toISOString().split('T')[0];
    const historyResponse = await fetch(
      `${API_BASE_URL}/api/analytics/agents/history?startDate=${today}&endDate=${today}&granularity=hourly`
    );

    const historyResult = await historyResponse.json();
    if (historyResult.success) {
      log('✅ 历史数据查询成功', 'green');
      log(`   - 数据量：${historyResult.data?.length || 0} 条`, 'green');
    } else {
      log('❌ 历史数据查询失败', 'red');
      log(`   错误：${historyResult.error}`, 'red');
    }

    // 测试 3: 查询最近 7 天统计（物化视图）
    log('\n3️⃣  查询最近 7 天统计（物化视图）...', 'yellow');
    const statsResponse = await fetch(
      `${API_BASE_URL}/api/analytics/agents/stats/recent`
    );
    const statsResult = await statsResponse.json();

    if (statsResult.success) {
      log('✅ 物化视图查询成功', 'green');
      log(`   - 统计数据：${statsResult.data?.length || 0} 条`, 'green');
      log(`   - 缓存标记：${statsResult.meta?.cached ? '是' : '否'}`, 'green');
    } else {
      log('❌ 物化视图查询失败', 'red');
      log(`   错误：${statsResult.error}`, 'red');
    }

    return true;
  } catch (error) {
    log('❌ 测试过程中发生异常', 'red');
    log(
      `   错误：${error instanceof Error ? error.message : '未知错误'}`,
      'red'
    );
    return false;
  }
}

/**
 * 测试 OPT-017: 告警通知机制
 */
async function testOpt017() {
  log('\n🔔 测试 OPT-017: 告警通知机制', 'blue');
  log('='.repeat(50), 'blue');

  try {
    // 测试 1: 获取告警规则列表
    log('\n1️⃣  获取告警规则列表...', 'yellow');
    const rulesResponse = await fetch(`${API_BASE_URL}/api/admin/alerts/rules`);
    const rulesResult = await rulesResponse.json();

    if (rulesResult.success) {
      log('✅ 告警规则获取成功', 'green');
      log(`   - 规则数量：${rulesResult.data?.length || 0} 个`, 'green');

      if (rulesResult.data && rulesResult.data.length > 0) {
        log('\n   默认规则:', 'green');
        rulesResult.data.forEach((rule: any) => {
          log(
            `     - ${rule.name} (${rule.priority}, ${rule.enabled ? '已启用' : '已禁用'})`,
            'green'
          );
        });
      }
    } else {
      log('❌ 告警规则获取失败', 'red');
      log(`   错误：${rulesResult.error}`, 'red');
    }

    // 测试 2: 获取告警历史
    log('\n2️⃣  获取告警历史记录...', 'yellow');
    const historyResponse = await fetch(
      `${API_BASE_URL}/api/admin/alerts/history?limit=10`
    );
    const historyResult = await historyResponse.json();

    if (historyResult.success) {
      log('✅ 告警历史获取成功', 'green');
      log(`   - 记录数量：${historyResult.data?.length || 0} 条`, 'green');

      if (historyResult.data && historyResult.data.length > 0) {
        log('\n   最近告警:', 'green');
        historyResult.data.slice(0, 3).forEach((alert: any) => {
          log(`     - ${alert.title} [${alert.status}]`, 'green');
        });
      }
    } else {
      log('❌ 告警历史获取失败', 'red');
      log(`   错误：${historyResult.error}`, 'red');
    }

    // 测试 3: 手动触发告警评估
    log('\n3️⃣  触发告警规则评估...', 'yellow');
    const evaluationResponse = await fetch(`${API_BASE_URL}/api/cron/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-token'}`,
      },
      body: JSON.stringify({ jobName: 'alert-evaluation' }),
    });

    const evaluationResult = await evaluationResponse.json();
    if (evaluationResult.success) {
      log('✅ 告警评估执行成功', 'green');
      log(
        `   - 评估规则：${evaluationResult.result?.evaluated || 0} 个`,
        'green'
      );
      log(
        `   - 触发告警：${evaluationResult.result?.triggered || 0} 个`,
        'green'
      );
    } else {
      log('❌ 告警评估执行失败', 'red');
      log(`   错误：${evaluationResult.error}`, 'red');
    }

    return true;
  } catch (error) {
    log('❌ 测试过程中发生异常', 'red');
    log(
      `   错误：${error instanceof Error ? error.message : '未知错误'}`,
      'red'
    );
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  log('\n🚀 开始验证 P2 优化任务功能...', 'blue');
  log('='.repeat(60), 'blue');

  const results = {
    opt018: await testOpt018(),
    opt017: await testOpt017(),
  };

  log('\n' + '='.repeat(60), 'blue');
  log('📊 测试结果汇总:', 'blue');
  log('='.repeat(60), 'blue');

  log(
    `\nOPT-018 (历史监控数据存储): ${results.opt018 ? '✅ 通过' : '❌ 失败'}`,
    results.opt018 ? 'green' : 'red'
  );
  log(
    `OPT-017 (告警通知机制): ${results.opt017 ? '✅ 通过' : '❌ 失败'}`,
    results.opt017 ? 'green' : 'red'
  );

  const allPassed = results.opt018 && results.opt017;
  log(
    `\n总体状态：${allPassed ? '✅ 所有测试通过' : '❌ 部分测试失败'}`,
    allPassed ? 'green' : 'red'
  );

  process.exit(allPassed ? 0 : 1);
}

// 运行测试
main().catch(console.error);
