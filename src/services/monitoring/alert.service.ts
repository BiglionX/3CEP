/**
 * 告警通知服务
 *
 * 负责评估告警规则、触发告警、发送通知
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * 告警规则
 */
interface AlertRule {
  id: string;
  name: string;
  rule_type: string;
  resource_type: string;
  resource_id?: string;
  condition: any;
  threshold: any;
  notification_channels: string[];
  priority: 'warning' | 'critical' | 'fatal';
  cooldown_period: number;
  enabled: boolean;
}

/**
 * 告警记录
 */
interface AlertRecord {
  rule_id: string;
  resource_type: string;
  resource_id: string;
  title: string;
  message: string;
  severity: string;
  metric_value: any;
  metadata?: any;
}

/**
 * 主函数：执行告警规则评估
 */
export async function executeAlertEvaluation() {
  console.log('🔔 开始执行告警规则评估...');

  try {
    // 获取所有启用的告警规则
    const { data: rules, error: fetchError } = await supabase
      .from('alert_rules')
      .select('*')
      .eq('enabled', true);

    if (fetchError) {
      console.error('❌ 获取告警规则失败:', fetchError);
      throw fetchError;
    }

    console.log(`📋 找到 ${rules?.length || 0} 个启用的告警规则`);

    if (!rules || rules.length === 0) {
      console.log('✅ 没有需要评估的告警规则');
      return {
        success: true,
        evaluated: 0,
        triggered: 0,
        failed: 0,
      };
    }

    const results = {
      evaluated: 0,
      triggered: 0,
      failed: 0,
    };

    // 逐个评估规则
    for (const rule of rules) {
      results.evaluated++;

      try {
        const triggered = await evaluateRule(rule);

        if (triggered) {
          results.triggered++;
          console.log(`🚨 告警触发：${rule.name}`);
        } else {
          console.log(`✅ 规则正常：${rule.name}`);
        }
      } catch (error) {
        results.failed++;
        console.error(`❌ 评估规则失败：${rule.name}`, error);
      }
    }

    console.log('\n📈 告警评估完成:', results);

    return {
      success: results.failed === 0,
      ...results,
    };
  } catch (error) {
    console.error('❌ 执行告警评估失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 评估单个告警规则
 */
async function evaluateRule(rule: AlertRule): Promise<boolean> {
  // 检查冷却期
  const inCooldown = await checkCooldownPeriod(rule.id, rule.cooldown_period);
  if (inCooldown) {
    console.log(`⏸️  规则处于冷却期：${rule.name}`);
    return false;
  }

  // 根据规则类型获取指标数据
  let metricValue: any;
  let shouldTrigger = false;

  switch (rule.rule_type) {
    case 'offline':
      shouldTrigger = await checkOfflineRule(rule);
      break;
    case 'error_rate':
      metricValue = await getAgentMetrics(rule.resource_id!);
      shouldTrigger = evaluateCondition(metricValue, rule.condition);
      break;
    case 'response_time':
      metricValue = await getAgentMetrics(rule.resource_id!);
      shouldTrigger = evaluateCondition(metricValue, rule.condition);
      break;
    default:
      console.warn('未知的告警规则类型:', rule.rule_type);
      return false;
  }

  if (shouldTrigger) {
    // 触发告警
    await triggerAlert({
      rule_id: rule.id,
      resource_type: rule.resource_type,
      resource_id: rule.resource_id || 'system',
      title: generateAlertTitle(rule),
      message: generateAlertMessage(rule, metricValue),
      severity: rule.priority,
      metric_value: metricValue,
      metadata: {
        rule_name: rule.name,
        rule_type: rule.rule_type,
      },
    });

    return true;
  }

  return false;
}

/**
 * 检查离线规则
 */
async function checkOfflineRule(rule: AlertRule): Promise<boolean> {
  if (!rule.resource_id) {
    // 检查所有智能体
    const { data, error } = await supabase
      .from('agents')
      .select('id, name, status, updated_at')
      .eq('status', 'offline')
      .is('deleted_at', null);

    if (error) {
      console.error('查询离线智能体失败:', error);
      return false;
    }

    if (data && data.length > 0) {
      // 检查离线时长
      const now = new Date();
      for (const agent of data) {
        const lastUpdate = new Date(agent.updated_at);
        const offlineDuration = (now.getTime() - lastUpdate.getTime()) / 1000; // 秒

        if (offlineDuration >= rule.condition.duration) {
          await triggerAlert({
            rule_id: rule.id,
            resource_type: 'agent',
            resource_id: agent.id,
            title: `智能体离线告警：${agent.name}`,
            message: `智能体「${agent.name}」已离线 ${Math.floor(offlineDuration / 60)} 分钟`,
            severity: rule.priority,
            metric_value: { status: 'offline', duration: offlineDuration },
            metadata: { agent_name: agent.name },
          });
        }
      }
      return data.some(d => {
        const duration =
          (new Date().getTime() - new Date(d.updated_at).getTime()) / 1000;
        return duration >= rule.condition.duration;
      });
    }
  }

  return false;
}

/**
 * 获取智能体指标
 */
async function getAgentMetrics(agentId: string): Promise<any> {
  // 从最近的历史数据中获取
  const { data, error } = await supabase
    .from('agent_status_history')
    .select('metrics, recorded_at')
    .eq('agent_id', agentId)
    .order('recorded_at', { ascending: false })
    .limit(5);

  if (error || !data || data.length === 0) {
    console.warn('未找到智能体历史数据:', agentId);
    return null;
  }

  // 计算平均值
  const metrics = data.map(d => d.metrics || {});
  return {
    error_rate: average(metrics.map(m => m.error_rate || 0)),
    response_time: average(metrics.map(m => m.response_time || 0)),
    success_rate: average(metrics.map(m => m.success_rate || 0)),
  };
}

/**
 * 评估条件
 */
function evaluateCondition(metrics: any, condition: any): boolean {
  if (!metrics) return false;

  const { field, operator, value } = condition;
  const metricValue = metrics[field];

  if (metricValue === undefined) return false;

  switch (operator) {
    case '>':
      return metricValue > value;
    case '>=':
      return metricValue >= value;
    case '<':
      return metricValue < value;
    case '<=':
      return metricValue <= value;
    case '=':
      return metricValue === value;
    case '!=':
      return metricValue !== value;
    default:
      return false;
  }
}

/**
 * 检查冷却期
 */
async function checkCooldownPeriod(
  ruleId: string,
  cooldownSeconds: number
): Promise<boolean> {
  const { data, error } = await supabase
    .from('alert_history')
    .select('triggered_at')
    .eq('rule_id', ruleId)
    .order('triggered_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('查询冷却期失败:', error);
    return false;
  }

  if (!data || data.length === 0) {
    return false; // 没有历史记录，不在冷却期
  }

  const lastTriggered = new Date(data[0].triggered_at).getTime();
  const now = Date.now();
  const elapsed = (now - lastTriggered) / 1000; // 秒

  return elapsed < cooldownSeconds;
}

/**
 * 触发告警
 */
async function triggerAlert(alert: AlertRecord) {
  console.log('🚨 触发告警:', alert.title);

  // 插入告警历史
  const { data: insertedAlert, error: insertError } = await supabase
    .from('alert_history')
    .insert({
      rule_id: alert.rule_id,
      resource_type: alert.resource_type,
      resource_id: alert.resource_id,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      metric_value: alert.metric_value,
      metadata: alert.metadata,
      status: 'active',
    })
    .select()
    .single();

  if (insertError) {
    console.error('插入告警历史失败:', insertError);
    throw insertError;
  }

  // 发送通知
  await sendNotifications(insertedAlert);
}

/**
 * 发送通知
 */
async function sendNotifications(alert: any) {
  // 获取关联的告警规则的订阅者
  const { data: subscriptions, error } = await supabase
    .from('alert_subscriptions')
    .select('user_id, notification_channel')
    .eq('enabled', true);

  if (error) {
    console.error('获取订阅者失败:', error);
    return;
  }

  const notificationsSent: any[] = [];

  // 分组按渠道发送
  const channels = [
    ...new Set(subscriptions?.map(s => s.notification_channel) || []),
  ];

  for (const channel of channels) {
    try {
      const recipients =
        subscriptions?.filter(s => s.notification_channel === channel) || [];

      for (const recipient of recipients) {
        await sendNotificationViaChannel(channel, recipient.user_id, alert);
      }

      notificationsSent.push({
        channel,
        sent_at: new Date().toISOString(),
        status: 'sent',
        count: recipients.length,
      });
    } catch (error) {
      console.error(`发送 ${channel} 通知失败:`, error);
      notificationsSent.push({
        channel,
        sent_at: new Date().toISOString(),
        status: 'failed',
        error: error instanceof Error ? error.message : '发送失败',
      });
    }
  }

  // 更新通知发送记录
  await supabase
    .from('alert_history')
    .update({ notifications_sent: notificationsSent })
    .eq('id', alert.id);
}

/**
 * 通过指定渠道发送通知
 */
async function sendNotificationViaChannel(
  channel: string,
  userId: string,
  alert: any
) {
  switch (channel) {
    case 'email':
      await sendEmailNotification(userId, alert);
      break;
    case 'sms':
      await sendSmsNotification(userId, alert);
      break;
    case 'in_app':
      await sendInAppNotification(userId, alert);
      break;
    case 'webhook':
      await sendWebhookNotification(alert);
      break;
    default:
      console.warn('未知的通知渠道:', channel);
  }
}

/**
 * 发送邮件通知
 */
async function sendEmailNotification(userId: string, alert: any) {
  // 获取用户邮箱
  const { data: user } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single();

  if (!user?.email) {
    console.warn('用户邮箱不存在:', userId);
    return;
  }

  console.log(`📧 发送邮件到：${user.email}`, {
    subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
    body: alert.message,
  });

  // TODO: 调用邮件发送服务
}

/**
 * 发送短信通知
 */
async function sendSmsNotification(userId: string, alert: any) {
  console.log(`📱 发送短信到用户：${userId}`, alert.message);
  // TODO: 调用短信服务
}

/**
 * 发送站内信通知
 */
async function sendInAppNotification(userId: string, alert: any) {
  const notification = {
    user_id: userId,
    type: 'alert',
    title: alert.title,
    content: alert.message,
    metadata: {
      alert_id: alert.id,
      severity: alert.severity,
      resource_type: alert.resource_type,
      resource_id: alert.resource_id,
    },
    created_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('notifications').insert(notification);

  if (error) {
    console.error('发送站内信失败:', error);
    throw error;
  }
}

/**
 * 发送 Webhook 通知
 */
async function sendWebhookNotification(alert: any) {
  // TODO: 调用配置的 Webhook URL
  console.log('🔗 发送 Webhook 通知:', alert);
}

/**
 * 生成告警标题
 */
function generateAlertTitle(rule: AlertRule): string {
  return `${rule.name} - ${rule.rule_type.toUpperCase()}`;
}

/**
 * 生成告警消息
 */
function generateAlertMessage(rule: AlertRule, metricValue: any): string {
  if (!metricValue) {
    return `告警规则「${rule.name}」已被触发`;
  }

  const details = Object.entries(metricValue)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  return `告警规则「${rule.name}」已被触发。当前指标：${details}`;
}

/**
 * 计算平均值
 */
function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

/**
 * 手动确认告警
 */
export async function acknowledgeAlert(
  alertId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('alert_history')
      .update({
        status: 'acknowledged',
        acknowledged_by: userId,
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    if (error) throw error;

    return {
      success: true,
      message: '告警已确认',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '确认失败',
    };
  }
}

/**
 * 手动解决告警
 */
export async function resolveAlert(
  alertId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('alert_history')
      .update({
        status: 'resolved',
        resolved_by: userId,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    if (error) throw error;

    return {
      success: true,
      message: '告警已解决',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '解决失败',
    };
  }
}

// 导出给定时任务调度器使用
export default executeAlertEvaluation;
