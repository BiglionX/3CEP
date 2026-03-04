// 采购智能体业务指标监控服?// 实时收集、分析和可视化关键业务指?
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 业务指标类型枚举
export enum BusinessMetricType {
  SUPPLIER_MATCH_SUCCESS_RATE = 'supplier_match_success_rate',
  PRICE_OPTIMIZATION_SAVINGS = 'price_optimization_savings',
  DECISION_CONFIDENCE_SCORE = 'decision_confidence_score',
  RISK_ASSESSMENT_COVERAGE = 'risk_assessment_coverage',
  MARKET_INTELLIGENCE_ACCURACY = 'market_intelligence_accuracy',
  CONTRACT_ADVICE_ADOPTION = 'contract_advice_adoption',
  PROCUREMENT_CYCLE_TIME = 'procurement_cycle_time',
  SUPPLIER_DIVERSITY_INDEX = 'supplier_diversity_index',
  COMPLIANCE_SCORE = 'compliance_score',
  COST_REDUCTION_RATE = 'cost_reduction_rate',
}

// 指标数据接口
interface MetricDataPoint {
  metric_type: BusinessMetricType;
  value: number;
  dimension?: string; // 如国家、行业等维度
  timestamp: string;
  metadata?: Record<string, any>;
}

// 业务指标配置
interface MetricConfig {
  type: BusinessMetricType;
  name: string;
  description: string;
  unit: string;
  aggregation: 'sum' | 'avg' | 'count' | 'ratio';
  thresholds: {
    critical: number;
    warning: number;
    good: number;
  };
  calculationMethod: string;
}

// 实时监控数据
interface RealTimeMetrics {
  timestamp: string;
  metrics: Record<BusinessMetricType, number>;
  trends: Record<BusinessMetricType, 'up' | 'down' | 'stable'>;
  alerts: MetricAlert[];
}

// 指标告警
interface MetricAlert {
  metric_type: BusinessMetricType;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  currentValue: number;
  threshold: number;
}

export class BusinessMetricsMonitor {
  private static metricsBuffer: MetricDataPoint[] = [];
  private static readonly BUFFER_SIZE = 100;
  private static monitoringInterval: NodeJS.Timeout | null = null;
  private static alertListeners: Array<(alert: MetricAlert) => void> = [];

  // 指标配置
  private static readonly METRIC_CONFIGS: Record<
    BusinessMetricType,
    MetricConfig
  > = {
    [BusinessMetricType.SUPPLIER_MATCH_SUCCESS_RATE]: {
      type: BusinessMetricType.SUPPLIER_MATCH_SUCCESS_RATE,
      name: '供应商匹配成功率',
      description: '成功匹配供应商的请求数占总请求数的比?,
      unit: '%',
      aggregation: 'avg',
      thresholds: {
        critical: 60,
        warning: 75,
        good: 90,
      },
      calculationMethod: '(成功匹配?/ 总请求数) * 100',
    },
    [BusinessMetricType.PRICE_OPTIMIZATION_SAVINGS]: {
      type: BusinessMetricType.PRICE_OPTIMIZATION_SAVINGS,
      name: '价格优化节省?,
      description: '通过智能价格优化实现的成本节省百分比',
      unit: '%',
      aggregation: 'avg',
      thresholds: {
        critical: 2,
        warning: 5,
        good: 15,
      },
      calculationMethod: '((市场?- 优化? / 市场? * 100',
    },
    [BusinessMetricType.DECISION_CONFIDENCE_SCORE]: {
      type: BusinessMetricType.DECISION_CONFIDENCE_SCORE,
      name: '决策置信度评?,
      description: 'AI采购决策的平均置信度分数',
      unit: '�?,
      aggregation: 'avg',
      thresholds: {
        critical: 60,
        warning: 75,
        good: 85,
      },
      calculationMethod: '平均置信度分?(0-100)',
    },
    [BusinessMetricType.RISK_ASSESSMENT_COVERAGE]: {
      type: BusinessMetricType.RISK_ASSESSMENT_COVERAGE,
      name: '风险评估覆盖?,
      description: '已完成风险评估的供应商占总供应商的比?,
      unit: '%',
      aggregation: 'avg',
      thresholds: {
        critical: 70,
        warning: 85,
        good: 95,
      },
      calculationMethod: '(已评估供应商?/ 总供应商? * 100',
    },
    [BusinessMetricType.MARKET_INTELLIGENCE_ACCURACY]: {
      type: BusinessMetricType.MARKET_INTELLIGENCE_ACCURACY,
      name: '市场情报准确?,
      description: '市场预测与实际结果的符合程度',
      unit: '%',
      aggregation: 'avg',
      thresholds: {
        critical: 70,
        warning: 80,
        good: 90,
      },
      calculationMethod: '(准确预测?/ 总预测数) * 100',
    },
    [BusinessMetricType.CONTRACT_ADVICE_ADOPTION]: {
      type: BusinessMetricType.CONTRACT_ADVICE_ADOPTION,
      name: '合同建议采纳?,
      description: '用户采纳智能合同建议的比?,
      unit: '%',
      aggregation: 'avg',
      thresholds: {
        critical: 40,
        warning: 60,
        good: 80,
      },
      calculationMethod: '(采纳建议?/ 总建议数) * 100',
    },
    [BusinessMetricType.PROCUREMENT_CYCLE_TIME]: {
      type: BusinessMetricType.PROCUREMENT_CYCLE_TIME,
      name: '采购周期时间',
      description: '从需求提出到合同签署的平均时?,
      unit: '�?,
      aggregation: 'avg',
      thresholds: {
        critical: 60,
        warning: 30,
        good: 15,
      },
      calculationMethod: '平均采购周期天数',
    },
    [BusinessMetricType.SUPPLIER_DIVERSITY_INDEX]: {
      type: BusinessMetricType.SUPPLIER_DIVERSITY_INDEX,
      name: '供应商多样性指?,
      description: '供应商来源的地理和行业分散程?,
      unit: '指数',
      aggregation: 'avg',
      thresholds: {
        critical: 0.3,
        warning: 0.5,
        good: 0.7,
      },
      calculationMethod: '基于赫芬达尔-赫希曼指数计算的多样性得?,
    },
    [BusinessMetricType.COMPLIANCE_SCORE]: {
      type: BusinessMetricType.COMPLIANCE_SCORE,
      name: '合规性评?,
      description: '供应商和采购流程的合规性评估得?,
      unit: '�?,
      aggregation: 'avg',
      thresholds: {
        critical: 70,
        warning: 85,
        good: 95,
      },
      calculationMethod: '平均合规性分?(0-100)',
    },
    [BusinessMetricType.COST_REDUCTION_RATE]: {
      type: BusinessMetricType.COST_REDUCTION_RATE,
      name: '成本降低?,
      description: '通过智能采购实现的整体成本降低百分比',
      unit: '%',
      aggregation: 'avg',
      thresholds: {
        critical: 3,
        warning: 8,
        good: 18,
      },
      calculationMethod: '((原成?- 新成? / 原成? * 100',
    },
  };

  /**
   * 记录业务指标数据?   */
  static async recordMetric(
    metricType: BusinessMetricType,
    value: number,
    dimension?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const dataPoint: MetricDataPoint = {
      metric_type: metricType,
      value,
      dimension,
      timestamp: new Date().toISOString(),
      metadata,
    };

    // 添加到缓冲区
    this.metricsBuffer.push(dataPoint);

    // 如果缓冲区满了，批量写入数据?    if (this.metricsBuffer.length >= this.BUFFER_SIZE) {
      await this.flushMetrics();
    }

    // 检查是否触发告?    await this.checkMetricAlerts(metricType, value);
  }

  /**
   * 批量刷新指标数据到数据库
   */
  private static async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    try {
      const { error } = await supabase
        .from('business_metrics')
        .insert(this.metricsBuffer);

      if (error) {
        console.error('批量写入业务指标失败:', error);
      } else {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?批量写入 ${this.metricsBuffer.length} 条业务指标数据`)this.metricsBuffer = []; // 清空缓冲?      }
    } catch (error) {
      console.error('刷新业务指标缓冲区失?', error);
    }
  }

  /**
   * 检查指标告?   */
  private static async checkMetricAlerts(
    metricType: BusinessMetricType,
    currentValue: number
  ): Promise<void> {
    const config = this.METRIC_CONFIGS[metricType];
    if (!config) return;

    let alertLevel: 'info' | 'warning' | 'error' | 'critical' | null = null;
    let message = '';

    // 根据阈值判断告警级?    if (currentValue <= config.thresholds.critical) {
      alertLevel = 'critical';
      message = `${config.name} 严重低于阈?${config.thresholds.critical}${config.unit}`;
    } else if (currentValue <= config.thresholds.warning) {
      alertLevel = 'warning';
      message = `${config.name} 低于预警阈?${config.thresholds.warning}${config.unit}`;
    } else if (currentValue >= config.thresholds.good) {
      alertLevel = 'info';
      message = `${config.name} 表现良好，达?${currentValue}${config.unit}`;
    }

    if (alertLevel) {
      const alert: MetricAlert = {
        metric_type: metricType,
        level: alertLevel,
        message,
        timestamp: new Date().toISOString(),
        currentValue,
        threshold:
          config.thresholds[alertLevel === 'critical' ? 'critical' : 'warning'],
      };

      // 触发告警监听?      this.alertListeners.forEach(listener => listener(alert));

      // 记录告警到数据库
      await this.recordAlert(alert);

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🔔 业务指标告警 [${alertLevel.toUpperCase()}]: ${message}`);
    }
  }

  /**
   * 记录告警到数据库
   */
  private static async recordAlert(alert: MetricAlert): Promise<void> {
    try {
      const { error } = await supabase.from('metric_alerts').insert([
        {
          metric_type: alert.metric_type,
          alert_level: alert.level,
          message: alert.message,
          current_value: alert.currentValue,
          threshold: alert.threshold,
          triggered_at: alert.timestamp,
        },
      ]);

      if (error) {
        console.error('记录告警失败:', error);
      }
    } catch (error) {
      console.error('保存告警到数据库失败:', error);
    }
  }

  /**
   * 获取实时业务指标
   */
  static async getRealTimeMetrics(
    timeWindowHours: number = 24
  ): Promise<RealTimeMetrics> {
    const sinceTime = new Date(
      Date.now() - timeWindowHours * 60 * 60 * 1000
    ).toISOString();

    try {
      // 从数据库获取最近的指标数据
      const { data, error } = await supabase
        .from('business_metrics')
        .select('*')
        .gte('timestamp', sinceTime)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // 计算各项指标的最新?      const metrics: Record<BusinessMetricType, number> = {} as any;
      const trends: Record<BusinessMetricType, 'up' | 'down' | 'stable'> =
        {} as any;

      Object.values(BusinessMetricType).forEach(metricType => {
        const metricData =
          data?.filter(d => d.metric_type === metricType) || [];

        if (metricData.length > 0) {
          // 计算平均?          const values = metricData.map(d => d.value);
          metrics[metricType] = parseFloat(
            (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
          );

          // 计算趋势（简单比较最近两个数据点?          if (metricData.length >= 2) {
            const recentValue = metricData[0].value;
            const previousValue = metricData[1].value;
            trends[metricType] =
              recentValue > previousValue
                ? 'up'
                : recentValue < previousValue
                  ? 'down'
                  : 'stable';
          } else {
            trends[metricType] = 'stable';
          }
        } else {
          metrics[metricType] = 0;
          trends[metricType] = 'stable';
        }
      });

      // 获取活跃告警
      const alerts = await this.getActiveAlerts();

      return {
        timestamp: new Date().toISOString(),
        metrics,
        trends,
        alerts,
      };
    } catch (error) {
      console.error('获取实时业务指标失败:', error);
      throw error;
    }
  }

  /**
   * 获取活跃告警
   */
  private static async getActiveAlerts(): Promise<MetricAlert[]> {
    try {
      const { data, error } = await supabase
        .from('metric_alerts')
        .select('*')
        .gte(
          'triggered_at',
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        )
        .order('triggered_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取活跃告警失败:', error);
      return [];
    }
  }

  /**
   * 获取指标历史数据
   */
  static async getMetricHistory(
    metricType: BusinessMetricType,
    days: number = 7
  ): Promise<MetricDataPoint[]> {
    const sinceTime = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000
    ).toISOString();

    try {
      const { data, error } = await supabase
        .from('business_metrics')
        .select('*')
        .eq('metric_type', metricType)
        .gte('timestamp', sinceTime)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取指标历史数据失败:', error);
      return [];
    }
  }

  /**
   * 添加告警监听?   */
  static addAlertListener(listener: (alert: MetricAlert) => void): void {
    this.alertListeners.push(listener);
  }

  /**
   * 移除告警监听?   */
  static removeAlertListener(listener: (alert: MetricAlert) => void): void {
    const index = this.alertListeners.indexOf(listener);
    if (index > -1) {
      this.alertListeners.splice(index, 1);
    }
  }

  /**
   * 启动定期监控
   */
  static startMonitoring(intervalMinutes: number = 5): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(
      async () => {
        try {
          // 定期刷新缓冲区数?          if (this.metricsBuffer.length > 0) {
            await this.flushMetrics();
          }

          // 可以在这里添加定期的指标计算和检查逻辑
          // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('📊 业务指标监控检查执?)} catch (error) {
          console.error('监控检查执行失?', error);
        }
      },
      intervalMinutes * 60 * 1000
    );

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📊 业务指标监控已启动，检查间? ${intervalMinutes}分钟`)}

  /**
   * 停止监控
   */
  static stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🛑 业务指标监控已停?)}

    // 刷新剩余的缓冲区数据
    if (this.metricsBuffer.length > 0) {
      this.flushMetrics().catch(console.error);
    }
  }

  /**
   * 获取指标配置
   */
  static getMetricConfig(metricType: BusinessMetricType): MetricConfig {
    return this.METRIC_CONFIGS[metricType];
  }

  /**
   * 获取所有指标配?   */
  static getAllMetricConfigs(): Record<BusinessMetricType, MetricConfig> {
    return { ...this.METRIC_CONFIGS };
  }
}

// 导出类型
export type { MetricDataPoint, MetricConfig, RealTimeMetrics, MetricAlert };
