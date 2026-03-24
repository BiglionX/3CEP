/**
 * 智能体数据分析服务
 *
 * 提供转化率、留存率、ROI 等核心指标计算
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * 时间范围类型
 */
export type TimeRange = '7d' | '30d' | '90d' | '1y';

/**
 * 分析指标接口
 */
export interface AnalyticsMetrics {
  // 基础统计
  totalAgents: number;
  activeAgents: number;
  totalUsers: number;
  activeUsers: number;

  // 转化率
  viewToInstallRate: number;
  installToPurchaseRate: number;
  overallConversionRate: number;

  // 留存率
  day1Retention: number;
  day7Retention: number;
  day30Retention: number;

  // ROI 指标
  totalRevenue: number;
  averageRevenuePerAgent: number;
  returnOnInvestment: number;

  // 趋势数据
  trends: TrendData[];
}

/**
 * 趋势数据
 */
export interface TrendData {
  date: string;
  views: number;
  installs: number;
  purchases: number;
  revenue: number;
}

/**
 * 智能体分析服务类
 */
export class AgentAnalyticsService {
  /**
   * 获取综合分析指标
   */
  static async getComprehensiveMetrics(
    timeRange: TimeRange = '30d'
  ): Promise<AnalyticsMetrics> {
    const dateRange = this.getDateRange(timeRange);

    // 并行获取所有指标
    const [
      agentStats,
      userStats,
      conversionRates,
      retentionRates,
      roiMetrics,
      trends,
    ] = await Promise.all([
      this.getAgentStats(dateRange),
      this.getUserStats(dateRange),
      this.getConversionRates(dateRange),
      this.getRetentionRates(dateRange),
      this.getROIMetrics(dateRange),
      this.getTrendData(dateRange),
    ]);

    return {
      ...agentStats,
      ...userStats,
      ...conversionRates,
      ...retentionRates,
      ...roiMetrics,
      trends,
    };
  }

  /**
   * 获取智能体统计
   */
  private static async getAgentStats(dateRange: DateRange) {
    // 总智能体数
    const { count: totalAgents } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // 活跃智能体数（有安装记录的）
    const { count: activeAgents } = await supabase
      .from('user_agent_installations')
      .select('agent_id', { distinct: true })
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    return {
      totalAgents: totalAgents || 0,
      activeAgents: activeAgents || 0,
    };
  }

  /**
   * 获取用户统计
   */
  private static async getUserStats(dateRange: DateRange) {
    // 总用户数
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // 活跃用户数（有安装或购买行为的）
    const { count: activeUsers } = await supabase
      .from('user_agent_installations')
      .select('user_id', { distinct: true })
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
    };
  }

  /**
   * 获取转化率
   */
  private static async getConversionRates(dateRange: DateRange) {
    // 浏览量
    const { count: viewCount } = await supabase
      .from('agent_views')
      .select('*', { count: 'exact', head: true })
      .gte('viewed_at', dateRange.start)
      .lte('viewed_at', dateRange.end);

    // 安装量
    const { count: installCount } = await supabase
      .from('user_agent_installations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    // 购买量
    const { count: purchaseCount } = await supabase
      .from('agent_orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    const viewToInstall =
      viewCount && installCount ? (installCount / viewCount) * 100 : 0;
    const installToPurchase =
      installCount && purchaseCount ? (purchaseCount / installCount) * 100 : 0;
    const overall =
      viewCount && purchaseCount ? (purchaseCount / viewCount) * 100 : 0;

    return {
      viewToInstallRate: parseFloat(viewToInstall.toFixed(2)),
      installToPurchaseRate: parseFloat(installToPurchase.toFixed(2)),
      overallConversionRate: parseFloat(overall.toFixed(2)),
    };
  }

  /**
   * 获取留存率
   */
  private static async getRetentionRates(dateRange: DateRange) {
    // 获取时间段内的新增用户
    const { data: newUsers } = await supabase
      .from('user_agent_installations')
      .select('user_id, created_at')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    if (!newUsers || newUsers.length === 0) {
      return {
        day1Retention: 0,
        day7Retention: 0,
        day30Retention: 0,
      };
    }

    const cohortDate = new Date(dateRange.start);
    const now = new Date();

    // 计算各时间点的留存
    const calculateRetention = (days: number) => {
      const targetDate = new Date(cohortDate);
      targetDate.setDate(targetDate.getDate() + days);

      const retainedUsers = newUsers.filter(user => {
        const userReturnDate = new Date(user.created_at);
        return userReturnDate >= targetDate && userReturnDate <= now;
      }).length;

      return (retainedUsers / newUsers.length) * 100;
    };

    return {
      day1Retention: parseFloat(calculateRetention(1).toFixed(2)),
      day7Retention: parseFloat(calculateRetention(7).toFixed(2)),
      day30Retention: parseFloat(calculateRetention(30).toFixed(2)),
    };
  }

  /**
   * 获取 ROI 指标
   */
  private static async getROIMetrics(dateRange: DateRange) {
    // 总收入
    const { data: orders } = await supabase
      .from('agent_orders')
      .select('total_amount')
      .eq('status', 'completed')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    const totalRevenue =
      orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    // 平均每个智能体的收入
    const { count: agentCount } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    const avgRevenuePerAgent = agentCount ? totalRevenue / agentCount : 0;

    // 简单计算 ROI（假设成本为总收入的 30%）
    const cost = totalRevenue * 0.3;
    const roi = cost ? ((totalRevenue - cost) / cost) * 100 : 0;

    return {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      averageRevenuePerAgent: parseFloat(avgRevenuePerAgent.toFixed(2)),
      returnOnInvestment: parseFloat(roi.toFixed(2)),
    };
  }

  /**
   * 获取趋势数据
   */
  private static async getTrendData(
    dateRange: DateRange
  ): Promise<TrendData[]> {
    const { data: dailyStats } = await supabase.rpc('get_daily_analytics', {
      start_date: dateRange.start.toISOString(),
      end_date: dateRange.end.toISOString(),
    });

    return (dailyStats || []).map((stat: any) => ({
      date: stat.date,
      views: stat.view_count || 0,
      installs: stat.install_count || 0,
      purchases: stat.purchase_count || 0,
      revenue: parseFloat(stat.revenue || 0),
    }));
  }

  /**
   * 获取日期范围
   */
  private static getDateRange(range: TimeRange): DateRange {
    const end = new Date();
    const start = new Date();

    switch (range) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }

    return { start, end };
  }
}

/**
 * 日期范围接口
 */
interface DateRange {
  start: Date;
  end: Date;
}
