import { supabase } from '@/lib/supabase';

export interface SystemMetrics {
  active_users: number;
  pending_reviews: number;
  system_uptime: string;
  api_response_time: number;
  error_rate: number;
  revenue_today: number;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  online_users: number;
  recent_activities: number;
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
}

export class MonitoringService {
  /**
   * 获取系统核心指标
   * @returns 系统指标数据
   */
  static async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      // 并行获取各项指标
      const [
        activeUsers,
        pendingReviews,
        revenueToday,
        systemResources,
        onlineUsers,
        recentActivities,
      ] = await Promise.all([
        this.getActiveUsersCount(),
        this.getPendingReviewsCount(),
        this.getTodayRevenue(),
        this.getSystemResources(),
        this.getOnlineUsersCount(),
        this.getRecentActivitiesCount(),
      ]);

      return {
        active_users: activeUsers,
        pending_reviews: pendingReviews,
        system_uptime: '99.9%', // 需要实际计算
        api_response_time: 120, // 需要实际监控
        error_rate: 0.1, // 需要实际计算
        revenue_today: revenueToday,
        cpu_usage: systemResources.cpu,
        memory_usage: systemResources.memory,
        disk_usage: systemResources.disk,
        online_users: onlineUsers,
        recent_activities: recentActivities,
      };
    } catch (error) {
      console.error('获取系统指标失败:', error);
      return this.getDefaultMetrics();
    }
  }

  /**
   * 获取活跃用户数（过去1小时内有操作的用户）
   */
  private static async getActiveUsersCount(): Promise<number> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { count, error } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .gte('created_at', oneHourAgo);

      return error ? 0 : count || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * 获取待审核数量
   */
  private static async getPendingReviewsCount(): Promise<number> {
    try {
      // 检查不同表的待审核状态
      const tablesToCheck = ['shops', 'articles', 'tutorials'];
      let totalCount = 0;

      for (const table of tablesToCheck) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact' })
            .eq('status', 'pending');

          if (!error && count) {
            totalCount += count;
          }
        } catch (error) {
          // 表可能不存在，跳过
          continue;
        }
      }

      return totalCount;
    } catch (error) {
      return 0;
    }
  }

  /**
   * 获取今日收入
   */
  private static async getTodayRevenue(): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('transactions')
        .select('amount')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      if (error) return 0;

      return (
        data?.reduce(
          (sum, transaction) => sum + (transaction.amount || 0),
          0
        ) || 0
      );
    } catch (error) {
      return 0;
    }
  }

  /**
   * 获取在线用户数（基于会话）
   */
  private static async getOnlineUsersCount(): Promise<number> {
    try {
      // 这里可以根据实际的会话管理方式调整
      // 暂时返回活跃用户数作为替代
      return await this.getActiveUsersCount();
    } catch (error) {
      return 0;
    }
  }

  /**
   * 获取近期活动数
   */
  private static async getRecentActivitiesCount(): Promise<number> {
    try {
      const oneDayAgo = new Date(
        Date.now() - 24 * 60 * 60 * 1000
      ).toISOString();

      const { count, error } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .gte('created_at', oneDayAgo);

      return error ? 0 : count || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * 获取系统资源使用情况（模拟数据）
   */
  private static async getSystemResources(): Promise<{
    cpu: number;
    memory: number;
    disk: number;
  }> {
    // 在实际部署中，这里应该集成真实的系统监控
    // 可以使用 Prometheus、Node.js 内置监控或其他监控工具

    // 模拟数据 - 实际使用时替换为真实监控数据
    return {
      cpu: Math.floor(Math.random() * 30) + 40, // 40-70%
      memory: Math.floor(Math.random() * 25) + 60, // 60-85%
      disk: Math.floor(Math.random() * 20) + 70, // 70-90%
    };
  }

  /**
   * 获取默认指标值
   */
  private static getDefaultMetrics(): SystemMetrics {
    return {
      active_users: 0,
      pending_reviews: 0,
      system_uptime: '0%',
      api_response_time: 0,
      error_rate: 0,
      revenue_today: 0,
      cpu_usage: 0,
      memory_usage: 0,
      disk_usage: 0,
      online_users: 0,
      recent_activities: 0,
    };
  }

  /**
   * 获取历史数据用于图表展示
   * @param metric 指标名称
   * @param hours 小时数
   * @returns 图表数据点
   */
  static async getHistoricalData(
    metric: keyof SystemMetrics,
    hours: number = 24
  ): Promise<ChartDataPoint[]> {
    try {
      const dataPoints: ChartDataPoint[] = [];
      const now = new Date();

      // 生成过去N小时的数据点
      for (let i = hours; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);

        // 模拟数据 - 实际使用时应该从监控系统获取
        let value = 0;
        switch (metric) {
          case 'active_users':
            value = Math.floor(Math.random() * 20) + 5;
            break;
          case 'revenue_today':
            value = Math.floor(Math.random() * 10000) + 1000;
            break;
          case 'cpu_usage':
            value = Math.floor(Math.random() * 30) + 40;
            break;
          default:
            value = Math.floor(Math.random() * 100);
        }

        dataPoints.push({
          timestamp: timestamp.toISOString(),
          value: value,
        });
      }

      return dataPoints;
    } catch (error) {
      console.error('获取历史数据失败:', error);
      return [];
    }
  }

  /**
   * 获取系统健康状态
   * @returns 健康状态评分 (0-100)
   */
  static async getSystemHealth(): Promise<number> {
    try {
      const metrics = await this.getSystemMetrics();

      // 简单的健康评分算法
      let score = 100;

      // CPU使用率影响 (-1分/1%超过80%)
      if (metrics.cpu_usage > 80) {
        score -= metrics.cpu_usage - 80;
      }

      // 内存使用率影响 (-1分/1%超过85%)
      if (metrics.memory_usage > 85) {
        score -= metrics.memory_usage - 85;
      }

      // 错误率影响 (-10分/1%错误率)
      score -= metrics.error_rate * 10;

      // 待审核积压影响 (-5分/10个待审核)
      score -= Math.floor(metrics.pending_reviews / 10) * 5;

      return Math.max(0, Math.min(100, Math.round(score)));
    } catch (error) {
      console.error('计算系统健康状态失败:', error);
      return 0;
    }
  }

  /**
   * 获取最近的系统警告
   * @returns 警告信息列表
   */
  static async getRecentAlerts(limit: number = 10): Promise<
    Array<{
      id: string;
      level: 'info' | 'warning' | 'error';
      message: string;
      timestamp: string;
    }>
  > {
    try {
      const alerts: Array<{
        id: string;
        level: 'info' | 'warning' | 'error';
        message: string;
        timestamp: string;
      }> = [
        {
          id: '1',
          level: 'info',
          message: '系统运行正常',
          timestamp: new Date().toISOString(),
        },
      ];

      // 可以根据实际监控数据动态生成警告
      const metrics = await this.getSystemMetrics();

      if (metrics.cpu_usage > 85) {
        alerts.push({
          id: '2',
          level: 'warning',
          message: `CPU使用率过高: ${metrics.cpu_usage}%`,
          timestamp: new Date().toISOString(),
        });
      }

      if (metrics.memory_usage > 90) {
        alerts.push({
          id: '3',
          level: 'error',
          message: `内存使用率过高: ${metrics.memory_usage}%`,
          timestamp: new Date().toISOString(),
        });
      }

      if (metrics.pending_reviews > 50) {
        alerts.push({
          id: '4',
          level: 'warning',
          message: `待审核任务积压: ${metrics.pending_reviews}个`,
          timestamp: new Date().toISOString(),
        });
      }

      return alerts.slice(0, limit);
    } catch (error) {
      console.error('获取系统警告失败:', error);
      return [];
    }
  }
}
