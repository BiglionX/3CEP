/**
 * 智能体状态快照定时任务
 *
 * 定期采集智能体状态并存储到历史记录表
 * 支持每小时或每天快照
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * 智能体快照数据
 */
interface AgentSnapshot {
  agent_id: string;
  status: 'online' | 'offline' | 'busy' | 'error';
  metrics: {
    response_time?: number;
    error_rate?: number;
    usage_count?: number;
    active_users?: number;
    success_rate?: number;
    [key: string]: number | undefined;
  };
  recorded_at: string;
}

/**
 * 主函数：执行智能体状态快照采集
 */
export async function executeAgentStatusSnapshot() {
  console.log('📸 开始执行智能体状态快照采集...');

  try {
    // 获取所有活跃的智能体
    const { data: agents, error: fetchError } = await supabase
      .from('agents')
      .select(
        `
        id,
        status,
        usage_count,
        created_at,
        updated_at
      `
      )
      .is('deleted_at', null); // 只采集未删除的智能体

    if (fetchError) {
      console.error('❌ 获取智能体列表失败:', fetchError);
      throw fetchError;
    }

    console.log(`📊 找到 ${agents?.length || 0} 个智能体`);

    if (!agents || agents.length === 0) {
      console.log('✅ 没有需要采集的智能体');
      return {
        success: true,
        processed: 0,
        inserted: 0,
        failed: 0,
      };
    }

    // 批量插入快照数据
    const snapshots: AgentSnapshot[] = [];
    const now = new Date().toISOString();

    for (const agent of agents) {
      // 模拟监控指标（实际应用中应该从监控系统获取）
      const snapshot: AgentSnapshot = {
        agent_id: agent.id,
        status: agent.status || 'online',
        metrics: {
          response_time: Math.random() * 500 + 100, // 模拟响应时间 100-600ms
          error_rate: Math.random() * 0.05, // 模拟错误率 0-5%
          usage_count: agent.usage_count || 0,
          active_users: Math.floor(Math.random() * 100), // 模拟活跃用户数
          success_rate: 1 - Math.random() * 0.05, // 模拟成功率 95-100%
        },
        recorded_at: now,
      };

      snapshots.push(snapshot);
    }

    // 分批插入（每批 100 条）
    const batchSize = 100;
    let inserted = 0;
    let failed = 0;

    for (let i = 0; i < snapshots.length; i += batchSize) {
      const batch = snapshots.slice(i, i + batchSize);

      const { error: insertError } = await supabase
        .from('agent_status_history')
        .insert(batch);

      if (insertError) {
        console.error('❌ 批量插入快照数据失败:', insertError);
        failed += batch.length;
      } else {
        inserted += batch.length;
        console.log(`✅ 已插入 ${inserted}/${snapshots.length} 条快照数据`);
      }
    }

    console.log('\n📈 快照采集完成:', {
      processed: snapshots.length,
      inserted,
      failed,
    });

    // 刷新物化视图（最近 7 天统计）
    await refreshMaterializedView();

    return {
      success: failed === 0,
      processed: snapshots.length,
      inserted,
      failed,
    };
  } catch (error) {
    console.error('❌ 执行快照采集任务失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      processed: 0,
      inserted: 0,
      failed: 0,
    };
  }
}

/**
 * 刷新物化视图
 */
async function refreshMaterializedView() {
  try {
    // 注意：Supabase 中刷新物化视图需要通过 RPC 调用
    // 这里假设我们创建了一个 RPC 函数
    const { error } = await supabase.rpc('refresh_agent_status_view');

    if (error) {
      console.warn('⚠️  刷新物化视图失败:', error);
    } else {
      console.log('✅ 物化视图已刷新');
    }
  } catch (error) {
    console.warn('⚠️  刷新物化视图异常:', error);
  }
}

/**
 * 清理过期数据（90 天前）
 * 可以通过定时任务每天执行一次
 */
export async function cleanupExpiredHistory() {
  console.log('🧹 开始清理过期历史数据...');

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    // 使用存储过程清理
    const { error } = await supabase.rpc('archive_old_agent_status_history');

    if (error) {
      console.error('❌ 清理过期数据失败:', error);
      throw error;
    }

    console.log(
      `✅ 已清理 ${cutoffDate.toISOString().split('T')[0]} 之前的数据`
    );

    return {
      success: true,
      cleanedBefore: cutoffDate.toISOString(),
    };
  } catch (error) {
    console.error('❌ 清理过期数据失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 手动触发单个智能体的快照（用于测试或特殊场景）
 */
export async function triggerManualSnapshot(
  agentId: string,
  customMetrics?: Partial<AgentSnapshot['metrics']>
): Promise<{ success: boolean; message: string }> {
  try {
    // 获取智能体信息
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('id, status, usage_count')
      .eq('id', agentId)
      .single();

    if (fetchError || !agent) {
      return {
        success: false,
        message: '智能体不存在',
      };
    }

    // 创建快照
    const snapshot: AgentSnapshot = {
      agent_id: agentId,
      status: agent.status || 'online',
      metrics: {
        response_time: Math.random() * 500 + 100,
        error_rate: Math.random() * 0.05,
        usage_count: agent.usage_count || 0,
        active_users: Math.floor(Math.random() * 100),
        success_rate: 1 - Math.random() * 0.05,
        ...customMetrics,
      },
      recorded_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from('agent_status_history')
      .insert(snapshot);

    if (insertError) {
      throw insertError;
    }

    return {
      success: true,
      message: '手动快照创建成功',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '创建失败',
    };
  }
}

// 导出给定时任务调度器使用
export default executeAgentStatusSnapshot;
