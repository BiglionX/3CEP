// 告警规则管理服务
// 负责告警规则的创建、管理、升级策略等核心功能

import { createClient } from '@supabase/supabase-js';

// 告警规则接口
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric_name: string;
  condition: 'above' | 'below' | 'equal' | 'change' | 'anomaly';
  threshold: number;
  duration: number; // 持续时间(�?
  severity: 'info' | 'warning' | 'error' | 'critical' | 'emergency';
  enabled: boolean;
  notification_channels: string[]; // ['email', 'slack', 'sms', 'webhook']
  recipients: string[];
  escalation_policy?: EscalationPolicy;
  suppression_rules?: SuppressionRule[];
  tags?: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

// 升级策略接口
export interface EscalationPolicy {
  id: string;
  name: string;
  levels: EscalationLevel[];
  repeat_interval?: number; // 重复通知间隔(�?
  max_notifications?: number; // 最大通知次数
  enabled: boolean;
}

// 升级级别接口
export interface EscalationLevel {
  level: number;
  delay: number; // 延迟时间(�?
  channels: string[]; // 通知渠道
  recipients: string[]; // 接收?
  message_template?: string; // 消息模板
}

// 抑制规则接口
export interface SuppressionRule {
  id: string;
  name: string;
  condition: SuppressionCondition;
  start_time: string;
  end_time: string;
  enabled: boolean;
  description?: string;
}

// 抑制条件接口
export interface SuppressionCondition {
  metric_patterns?: string[]; // 指标名称模式
  severity_levels?: string[]; // 严重级别
  time_ranges?: TimeRange[]; // 时间范围
  tags?: string[]; // 标签
}

// 时间范围接口
export interface TimeRange {
  start_hour: number;
  end_hour: number;
  days_of_week?: number[]; // 0-6 (周日-周六)
}

// 告警规则创建参数
export interface CreateAlertRuleParams {
  name: string;
  description: string;
  metric_name: string;
  condition: 'above' | 'below' | 'equal' | 'change' | 'anomaly';
  threshold: number;
  duration: number;
  severity: 'info' | 'warning' | 'error' | 'critical' | 'emergency';
  notification_channels: string[];
  recipients: string[];
  escalation_policy_id?: string;
  suppression_rule_ids?: string[];
  tags?: string[];
  created_by: string;
}

// 告警规则更新参数
export interface UpdateAlertRuleParams {
  id: string;
  name?: string;
  description?: string;
  condition?: 'above' | 'below' | 'equal' | 'change' | 'anomaly';
  threshold?: number;
  duration?: number;
  severity?: 'info' | 'warning' | 'error' | 'critical' | 'emergency';
  enabled?: boolean;
  notification_channels?: string[];
  recipients?: string[];
  escalation_policy_id?: string;
  suppression_rule_ids?: string[];
  tags?: string[];
}

export class AlertRulesManager {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * 创建告警规则
   */
  async createAlertRule(params: CreateAlertRuleParams): Promise<AlertRule> {
    try {
      const newRule: any = {
        ...params,
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from('alert_rules')
        .insert(newRule)
        .select()
        .single();

      if (error) throw error;

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?告警规则创建成功: ${data.name}`)return data;
    } catch (error) {
      console.error('创建告警规则失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有告警规?
   */
  async getAllAlertRules(filters?: {
    enabled?: boolean;
    severity?: string;
    metric_name?: string;
  }): Promise<AlertRule[]> {
    try {
      let query = this.supabase.from('alert_rules').select('*');

      if (filters?.enabled !== undefined) {
        query = query.eq('enabled', filters.enabled);
      }

      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }

      if (filters?.metric_name) {
        query = query.eq('metric_name', filters.metric_name);
      }

      const { data, error } = await query.order('created_at', {
        ascending: false,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取告警规则失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取告警规则
   */
  async getAlertRuleById(id: string): Promise<AlertRule | null> {
    try {
      const { data, error } = await this.supabase
        .from('alert_rules')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // 未找到记?
        throw error;
      }

      return data;
    } catch (error) {
      console.error('获取告警规则失败:', error);
      throw error;
    }
  }

  /**
   * 更新告警规则
   */
  async updateAlertRule(params: UpdateAlertRuleParams): Promise<AlertRule> {
    try {
      const { id, ...updates } = params;
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from('alert_rules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?告警规则更新成功: ${data.name}`)return data;
    } catch (error) {
      console.error('更新告警规则失败:', error);
      throw error;
    }
  }

  /**
   * 删除告警规则
   */
  async deleteAlertRule(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('alert_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?告警规则删除成功: ${id}`)} catch (error) {
      console.error('删除告警规则失败:', error);
      throw error;
    }
  }

  /**
   * 启用/禁用告警规则
   */
  async toggleAlertRule(id: string, enabled: boolean): Promise<AlertRule> {
    try {
      const { data, error } = await this.supabase
        .from('alert_rules')
        .update({
          enabled,
          updated_at: new Date().toISOString(),
        }) as any
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?告警规则${enabled ? '启用' : '禁用'}成功: ${data.name}`)return data;
    } catch (error) {
      console.error(`${enabled ? '启用' : '禁用'}告警规则失败:`, error);
      throw error;
    }
  }

  /**
   * 创建升级策略
   */
  async createEscalationPolicy(
    policy: Omit<EscalationPolicy, 'id'>
  ): Promise<EscalationPolicy> {
    try {
      const newPolicy: any = {
        ...policy,
        id: `esc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      const { data, error } = await this.supabase
        .from('escalation_policies')
        .insert(newPolicy)
        .select()
        .single();

      if (error) throw error;

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?升级策略创建成功: ${data.name}`)return data;
    } catch (error) {
      console.error('创建升级策略失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有升级策?
   */
  async getAllEscalationPolicies(): Promise<EscalationPolicy[]> {
    try {
      const { data, error } = await this.supabase
        .from('escalation_policies')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取升级策略失败:', error);
      throw error;
    }
  }

  /**
   * 创建抑制规则
   */
  async createSuppressionRule(
    rule: Omit<SuppressionRule, 'id'>
  ): Promise<SuppressionRule> {
    try {
      const newRule: any = {
        ...rule,
        id: `supp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      const { data, error } = await this.supabase
        .from('suppression_rules')
        .insert(newRule)
        .select()
        .single();

      if (error) throw error;

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?抑制规则创建成功: ${data.name}`)return data;
    } catch (error) {
      console.error('创建抑制规则失败:', error);
      throw error;
    }
  }

  /**
   * 获取有效的抑制规?
   */
  async getActiveSuppressionRules(): Promise<SuppressionRule[]> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await this.supabase
        .from('suppression_rules')
        .select('*')
        .eq('enabled', true)
        .lte('start_time', now)
        .gte('end_time', now);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取抑制规则失败:', error);
      throw error;
    }
  }

  /**
   * 测试告警规则
   */
  async testAlertRule(
    ruleId: string,
    testValue: number
  ): Promise<{
    shouldTrigger: boolean;
    severity: string;
    message: string;
  }> {
    try {
      const rule = await this.getAlertRuleById(ruleId);
      if (!rule) {
        throw new Error('告警规则不存?);
      }

      const shouldTrigger = this.evaluateCondition(
        testValue,
        rule.condition,
        rule.threshold
      );
      const severity = shouldTrigger ? rule.severity : 'none';
      const message = shouldTrigger
        ? `测试?${testValue} ${this.getConditionText(rule.condition)} 阈?${rule.threshold}`
        : `测试?${testValue} 未触发告警`;

      return {
        shouldTrigger,
        severity,
        message,
      };
    } catch (error) {
      console.error('测试告警规则失败:', error);
      throw error;
    }
  }

  /**
   * 评估告警条件
   */
  private evaluateCondition(
    value: number,
    condition: string,
    threshold: number
  ): boolean {
    switch (condition) {
      case 'above':
        return value > threshold;
      case 'below':
        return value < threshold;
      case 'equal':
        return Math.abs(value - threshold) < 0.001;
      case 'change':
        // 变化检测需要历史数据，这里简化处?
        return Math.abs(value - threshold) > threshold * 0.1;
      case 'anomaly':
        // 异常检测需要更复杂的算法，这里简化处?
        return value > threshold * 1.5;
      default:
        return false;
    }
  }

  /**
   * 获取条件文本描述
   */
  private getConditionText(condition: string): string {
    const texts: Record<string, string> = {
      above: '超过',
      below: '低于',
      equal: '等于',
      change: '变化超过',
      anomaly: '异常高于',
    };
    return texts[condition] || condition;
  }

  /**
   * 获取告警规则统计信息
   */
  async getAlertRulesStatistics(): Promise<{
    total: number;
    enabled: number;
    disabled: number;
    by_severity: Record<string, number>;
    by_metric: Record<string, number>;
  }> {
    try {
      const rules = await this.getAllAlertRules();

      const stats = {
        total: rules.length,
        enabled: rules.filter(r => r.enabled).length,
        disabled: rules.filter(r => !r.enabled).length,
        by_severity: {} as Record<string, number>,
        by_metric: {} as Record<string, number>,
      };

      // 按严重级别统?
      rules.forEach(rule => {
        stats.by_severity[rule.severity] =
          (stats.by_severity[rule.severity] || 0) + 1;
      });

      // 按指标统?
      rules.forEach(rule => {
        stats.by_metric[rule.metric_name] =
          (stats.by_metric[rule.metric_name] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('获取告警规则统计失败:', error);
      throw error;
    }
  }
}

// 导出实例
export const alertRulesManager = new AlertRulesManager();
