/**
 * 高管仪表板服务扩展
 * 提供 KPI 钻取数据和预测分析功能
 */

import type { KPIDrillDownData } from '@/app/enterprise/admin/executive-dashboard/ExecutiveKPIDrillDown';
import {
  BusinessIntelligenceService,
  type ExecutiveDashboard,
} from '@/lib/business-intelligence-service';

interface ExtendedExecutiveDashboard extends ExecutiveDashboard {
  gmvMetrics: {
    today: number;
    thisMonth: number;
    total: number;
    growthRate: number;
  };
  userMetrics: ExecutiveDashboard['userMetrics'] & {
    realTimeActive: number;
    wau: number;
    mau: number;
  };
  tokenMetrics: {
    totalConsumed: number;
    consumptionRate: number;
    fxcInCirculation: number;
    exchangeVolume: number;
  };
  agentMetrics: {
    totalCalls: number;
    topAgents: Array<{ name: string; calls: number; revenue: number }>;
  };
}

export class ExecutiveDashboardService extends BusinessIntelligenceService {
  /**
   * 获取高管决策仪表板数据 (Task 6.1)
   */
  async getExecutiveDashboard(): Promise<ExtendedExecutiveDashboard> {
    // 模拟实时数据获取
    const now = new Date();

    return {
      kpis: [
        {
          name: '月度收入',
          value: 458200,
          target: 500000,
          trend: 'up',
          change: 12.5,
          unit: '元',
        },
        {
          name: '活跃用户数',
          value: 8420,
          target: 10000,
          trend: 'up',
          change: 8.3,
          unit: '人',
        },
        {
          name: '订单完成率',
          value: 94.5,
          target: 95,
          trend: 'stable',
          change: 0.5,
          unit: '%',
        },
        {
          name: '系统可用率',
          value: 99.8,
          target: 99.9,
          trend: 'stable',
          change: 0.1,
          unit: '%',
        },
      ],
      revenueMetrics: {
        monthlyRevenue: 3850000,
        growthRate: 15.3,
        forecast: 4200000,
      },
      userMetrics: {
        activeUsers: 8420,
        retentionRate: 85.2,
        acquisitionCost: 220,
        realTimeActive: 1247,
        wau: 35600,
        mau: 125000,
      },
      operationalMetrics: {
        systemUptime: 99.8,
        responseTime: 180,
        errorRate: 0.5,
      },
      gmvMetrics: {
        today: 125800,
        thisMonth: 3850000,
        total: 45200000,
        growthRate: 15.3,
      },
      tokenMetrics: {
        totalConsumed: 2850000,
        consumptionRate: 12500,
        fxcInCirculation: 6850000,
        exchangeVolume: 458000,
      },
      agentMetrics: {
        totalCalls: 125800,
        topAgents: [
          { name: '智能客服 Agent', calls: 45800, revenue: 125000 },
          { name: '采购预测 Agent', calls: 32500, revenue: 98000 },
          { name: '供应链优化 Agent', calls: 28600, revenue: 85000 },
          { name: '质量控制 Agent', calls: 18900, revenue: 62000 },
        ],
      },
    };
  }

  /**
   * 获取告警信息 (Task 6.3)
   */
  async getAlerts() {
    const now = new Date();
    return [
      {
        id: 'alert-1',
        severity: 'warning' as const,
        title: 'GMV 增长放缓',
        message: '今日 GMV 增速低于预期，建议关注市场动态',
        timestamp: new Date(now.getTime() - 3600000),
      },
      {
        id: 'alert-2',
        severity: 'info' as const,
        title: 'Token 消耗创新高',
        message: '过去 24 小时 Token 消耗量达到历史新高',
        timestamp: new Date(now.getTime() - 7200000),
      },
      {
        id: 'alert-3',
        severity: 'critical' as const,
        title: '系统响应时间异常',
        message: 'API 平均响应时间超过阈值 (200ms)',
        timestamp: new Date(now.getTime() - 1800000),
      },
    ];
  }

  /**
   * 获取 KPI 钻取数据
   */
  async getKPIDrillDown(
    kpiId: string,
    timeRange: string
  ): Promise<KPIDrillDownData> {
    // 模拟数据，实际应该从数据库获取
    const kpiConfig: Record<string, KPIDrillDownData> = {
      'kpi-1': {
        kpiId: 'kpi-1',
        kpiName: '月度收入',
        currentValue: 458200,
        targetValue: 500000,
        unit: '元',
        trend: 'up',
        changePercentage: 12.5,
        category: 'financial',
        timeSeriesData: [
          { period: '第 1 周', value: 98000, target: 110000, variance: -10.9 },
          { period: '第 2 周', value: 115000, target: 115000, variance: 0 },
          { period: '第 3 周', value: 122000, target: 120000, variance: 1.7 },
          { period: '第 4 周', value: 123200, target: 155000, variance: -20.5 },
        ],
        dimensionBreakdown: [
          {
            dimension: '智能体服务',
            value: 185000,
            percentage: 40.4,
            trend: 'up',
          },
          {
            dimension: '采购管理',
            value: 142000,
            percentage: 31.0,
            trend: 'stable',
          },
          {
            dimension: '供应链金融',
            value: 98000,
            percentage: 21.4,
            trend: 'down',
          },
          { dimension: '其他业务', value: 33200, percentage: 7.2, trend: 'up' },
        ],
        topPerformers: [
          { name: '销售一部', value: 125000, rank: 1, change: 15.2 },
          { name: '销售二部', value: 118000, rank: 2, change: 12.8 },
          { name: '销售三部', value: 95000, rank: 3, change: -3.5 },
          { name: '线上渠道', value: 88000, rank: 4, change: 22.1 },
          { name: '合作伙伴', value: 32200, rank: 5, change: 8.7 },
        ],
        insights: [
          {
            type: 'positive',
            title: '收入持续增长',
            description:
              '本月收入同比增长 12.5%，主要得益于智能体服务业务的强劲表现，建议继续加大该领域的投入。',
          },
          {
            type: 'negative',
            title: '供应链金融表现不佳',
            description:
              '供应链金融业务收入环比下降 8.3%，需关注市场变化和客户需求调整。',
          },
          {
            type: 'neutral',
            title: '目标完成压力',
            description:
              '当前完成率为 91.6%，按目前增速预计月底可达 96.8%，建议制定冲刺计划确保目标达成。',
          },
        ],
      },
      'kpi-2': {
        kpiId: 'kpi-2',
        kpiName: '活跃用户数',
        currentValue: 8420,
        targetValue: 10000,
        unit: '人',
        trend: 'up',
        changePercentage: 8.3,
        category: 'user',
        timeSeriesData: [
          { period: '第 1 周', value: 7800, target: 8500, variance: -8.2 },
          { period: '第 2 周', value: 8100, target: 8800, variance: -8.0 },
          { period: '第 3 周', value: 8250, target: 9200, variance: -10.3 },
          { period: '第 4 周', value: 8420, target: 10000, variance: -15.8 },
        ],
        dimensionBreakdown: [
          { dimension: '企业用户', value: 5200, percentage: 61.8, trend: 'up' },
          {
            dimension: '个人用户',
            value: 2800,
            percentage: 33.3,
            trend: 'stable',
          },
          { dimension: '政府用户', value: 420, percentage: 4.9, trend: 'up' },
        ],
        topPerformers: [
          { name: '华东大区', value: 2800, rank: 1, change: 10.5 },
          { name: '华南大区', value: 2400, rank: 2, change: 8.2 },
          { name: '华北大区', value: 2100, rank: 3, change: 6.8 },
          { name: '西部大区', value: 1120, rank: 4, change: 12.3 },
        ],
        insights: [
          {
            type: 'positive',
            title: '用户稳定增长',
            description:
              '活跃用户数环比增长 8.3%，企业用户占比持续提升，用户质量不断优化。',
          },
          {
            type: 'negative',
            title: '目标差距较大',
            description:
              '距离目标值还有 15.8% 的差距，需要加强用户运营和拉新活动。',
          },
          {
            type: 'positive',
            title: '区域发展均衡',
            description:
              '各大区用户均保持增长态势，西部大区增速最快，达到 12.3%。',
          },
        ],
      },
      'kpi-3': {
        kpiId: 'kpi-3',
        kpiName: '订单完成率',
        currentValue: 94.5,
        targetValue: 95,
        unit: '%',
        trend: 'stable',
        changePercentage: 0.5,
        category: 'business',
        timeSeriesData: [
          { period: '第 1 周', value: 93.2, target: 94.0, variance: -0.8 },
          { period: '第 2 周', value: 94.1, target: 94.5, variance: -0.4 },
          { period: '第 3 周', value: 94.8, target: 95.0, variance: -0.2 },
          { period: '第 4 周', value: 94.5, target: 95.0, variance: -0.5 },
        ],
        dimensionBreakdown: [
          {
            dimension: '智能体订单',
            value: 96.8,
            percentage: 45.2,
            trend: 'up',
          },
          {
            dimension: '采购订单',
            value: 93.5,
            percentage: 32.1,
            trend: 'stable',
          },
          {
            dimension: '服务订单',
            value: 92.1,
            percentage: 22.7,
            trend: 'down',
          },
        ],
        topPerformers: [
          { name: '客服团队', value: 97.8, rank: 1, change: 1.2 },
          { name: '交付团队', value: 96.5, rank: 2, change: 0.8 },
          { name: '技术支持', value: 94.2, rank: 3, change: -0.3 },
          { name: '售后服务', value: 91.5, rank: 4, change: -1.5 },
        ],
        insights: [
          {
            type: 'neutral',
            title: '接近目标值',
            description:
              '订单完成率达到 94.5%，距离目标仅差 0.5 个百分点，整体表现稳定。',
          },
          {
            type: 'positive',
            title: '智能体订单表现优异',
            description:
              '智能体相关订单完成率高达 96.8%，显示自动化流程的高效性。',
          },
          {
            type: 'negative',
            title: '售后服务待提升',
            description:
              '售后服务订单完成率下降 1.5%，需关注服务质量和问题响应速度。',
          },
        ],
      },
    };

    return (
      kpiConfig[kpiId] || {
        kpiId,
        kpiName: '未知指标',
        currentValue: 0,
        targetValue: 0,
        unit: '',
        trend: 'stable',
        changePercentage: 0,
        category: 'unknown',
        timeSeriesData: [],
        dimensionBreakdown: [],
        topPerformers: [],
        insights: [],
      }
    );
  }

  /**
   * 获取预测分析数据
   */
  async getPredictiveAnalytics(
    timeHorizon: 'month' | 'quarter' | 'year' = 'month'
  ) {
    const periods =
      timeHorizon === 'month' ? 12 : timeHorizon === 'quarter' ? 8 : 5;

    const predictions = [];
    const baseValue = 2100000; // 当前月收入
    const growthRate = 0.05; // 月增长率 5%

    for (let i = 0; i < periods; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i + 1);

      const predicted = baseValue * Math.pow(1 + growthRate, i + 1);
      const lowerBound = predicted * 0.9; // 置信区间下限
      const upperBound = predicted * 1.1; // 置信区间上限

      predictions.push({
        period: date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
        }),
        predicted: Math.round(predicted),
        confidence: 90 - i * 3, // 随着时间推移，置信度降低
        scenarios: {
          optimistic: Math.round(upperBound),
          pessimistic: Math.round(lowerBound),
        },
      });
    }

    return predictions;
  }

  /**
   * 获取智能建议
   */
  async getRecommendations() {
    return [
      {
        id: 'rec-1',
        category: 'revenue',
        priority: 'high',
        title: '加大智能体业务投入',
        description:
          '基于当前增长趋势，建议增加智能体业务的市场推广预算 20%，预计可带来额外 15% 的收入增长。',
        impact: 'high',
        effort: 'medium',
        roi: 2.5,
      },
      {
        id: 'rec-2',
        category: 'user',
        priority: 'medium',
        title: '优化用户留存策略',
        description:
          '针对留存率下降问题，建议实施用户分层运营，重点提升高价值用户的粘性。',
        impact: 'medium',
        effort: 'high',
        roi: 1.8,
      },
      {
        id: 'rec-3',
        category: 'operational',
        priority: 'low',
        title: '提升系统性能',
        description:
          '系统响应时间已优化 12%，建议继续推进技术架构升级，目标将响应时间降至 100ms 以内。',
        impact: 'low',
        effort: 'medium',
        roi: 1.2,
      },
    ];
  }
}
