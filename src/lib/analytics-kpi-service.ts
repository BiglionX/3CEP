// 分析KPI服务类 - 用于管理关键绩效指标数据
import { supabase, isConfigured } from './supabase';

// KPI指标类型定义
export interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  category: 'business' | 'technical' | 'user' | 'financial';
  enterprise_id?: string; // 企业ID，用于多租户
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'; // 统计周期
  period_date?: string; // 统计日期
  created_at?: string;
  updated_at?: string;
}

// KPI分类类型
export interface KPICategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  kpis: KPI[];
}

// 分析数据接口
export interface AnalyticsData {
  kpis: KPI[];
  charts: {
    revenue: { month: string; value: number }[];
    users: { month: string; value: number }[];
    orders: { month: string; value: number }[];
    conversion: { month: string; value: number }[];
  };
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalOrders: number;
    revenue: number;
    conversionRate: number;
    avgOrderValue: number;
    customerSatisfaction: number;
  };
}

// 时间范围接口
export interface DateRange {
  from: Date;
  to: Date;
}

// 企业分析配置
export interface AnalyticsConfig {
  enterprise_id: string;
  kpi_targets: Record<string, number>; // KPI名称 -> 目标值
  auto_calculation: boolean;
  notification_thresholds: Record<string, number>; // 告警阈值
  data_retention_days: number;
}

// 数据库KPI记录接口
interface KPIDatabaseRecord {
  id: string;
  enterprise_id: string;
  kpi_name: string;
  kpi_value: number;
  target_value: number;
  unit: string;
  period: string;
  period_date: string;
  trend_direction: string;
  change_percentage: number;
  category: string;
  created_at: string;
  updated_at: string;
}

// 其他数据库表接口
interface TransactionRecord {
  amount: number;
  created_at: string;
  [key: string]: any;
}

interface UserRecord {
  id: string;
  last_active_at: string | null;
  [key: string]: any;
}

interface OrderRecord {
  status: string;
  [key: string]: any;
}

interface FeedbackRecord {
  rating: number;
  [key: string]: any;
}

interface PerformanceMetricRecord {
  api_response_time: number;
  [key: string]: any;
}

interface JourneyLogRecord {
  user_id: string;
  [key: string]: any;
}

export class AnalyticsKPIService {
  private kpis: KPI[] = [];
  private categories: KPICategory[] = [];
  private useDatabase: boolean = isConfigured;

  constructor(enterpriseId?: string) {
    if (enterpriseId) {
      this.initializeWithEnterprise(enterpriseId);
    } else {
      this.initializeKPIs();
      this.initializeCategories();
    }
  }

  private async initializeWithEnterprise(enterpriseId: string): Promise<void> {
    if (this.useDatabase) {
      try {
        // 从数据库加载企业KPI配置
        await this.loadEnterpriseKPIs(enterpriseId);
        // 计算实时指标
        await this.calculateRealTimeMetrics(enterpriseId);
      } catch (error) {
        console.error('初始化企业KPI失败，使用模拟数据:', error);
        this.initializeKPIs();
        this.initializeCategories();
      }
    } else {
      this.initializeKPIs();
      this.initializeCategories();
    }
  }

  private initializeKPIs(): void {
    this.kpis = [
      // 业务指标
      {
        id: 'kpi-001',
        name: '月度活跃用户',
        value: 85420,
        target: 100000,
        unit: '人',
        trend: 'up',
        change: 12.5,
        category: 'business',
      },
      {
        id: 'kpi-002',
        name: '转化率',
        value: 23.8,
        target: 25,
        unit: '%',
        trend: 'up',
        change: 3.2,
        category: 'business',
      },
      {
        id: 'kpi-003',
        name: '月度收入',
        value: 1850000,
        target: 2000000,
        unit: '元',
        trend: 'up',
        change: 8.7,
        category: 'business',
      },
      // 技术指标
      {
        id: 'kpi-004',
        name: '系统可用率',
        value: 99.8,
        target: 99.9,
        unit: '%',
        trend: 'stable',
        change: 0.1,
        category: 'technical',
      },
      {
        id: 'kpi-005',
        name: 'API响应时间',
        value: 142,
        target: 200,
        unit: 'ms',
        trend: 'down',
        change: -15.3,
        category: 'technical',
      },
      {
        id: 'kpi-006',
        name: '错误率',
        value: 0.3,
        target: 0.5,
        unit: '%',
        trend: 'down',
        change: -25.0,
        category: 'technical',
      },
      // 用户体验指标
      {
        id: 'kpi-007',
        name: '用户满意度',
        value: 4.6,
        target: 4.8,
        unit: '分',
        trend: 'up',
        change: 4.3,
        category: 'user',
      },
      {
        id: 'kpi-008',
        name: '功能使用率',
        value: 78.5,
        target: 85,
        unit: '%',
        trend: 'up',
        change: 7.6,
        category: 'user',
      },
      // 财务指标
      {
        id: 'kpi-009',
        name: '获客成本',
        value: 185,
        target: 200,
        unit: '元',
        trend: 'down',
        change: -8.0,
        category: 'financial',
      },
      {
        id: 'kpi-010',
        name: '客单价',
        value: 2180,
        target: 2500,
        unit: '元',
        trend: 'up',
        change: 12.8,
        category: 'financial',
      },
    ];
  }

  private initializeCategories(): void {
    this.categories = [
      {
        id: 'business',
        name: '业务指标',
        icon: 'TrendingUp',
        color: 'blue',
        kpis: this.kpis.filter(kpi => kpi.category === 'business'),
      },
      {
        id: 'technical',
        name: '技术指标',
        icon: 'BarChart3',
        color: 'green',
        kpis: this.kpis.filter(kpi => kpi.category === 'technical'),
      },
      {
        id: 'user',
        name: '用户体验',
        icon: 'Users',
        color: 'purple',
        kpis: this.kpis.filter(kpi => kpi.category === 'user'),
      },
      {
        id: 'financial',
        name: '财务指标',
        icon: 'DollarSign',
        color: 'yellow',
        kpis: this.kpis.filter(kpi => kpi.category === 'financial'),
      },
    ];
  }

  getAllKPIs(): KPI[] {
    return [...this.kpis];
  }

  getKPIById(id: string): KPI | undefined {
    return this.kpis.find(kpi => kpi.id === id);
  }

  getKPIsByCategory(category: string): KPI[] {
    return this.kpis.filter(kpi => kpi.category === category);
  }

  getCategories(): KPICategory[] {
    return [...this.categories];
  }

  getCategoryById(id: string): KPICategory | undefined {
    return this.categories.find(category => category.id === id);
  }

  updateKPIValue(kpiId: string, newValue: number): boolean {
    const kpi = this.kpis.find(k => k.id === kpiId);
    if (kpi) {
      const oldValue = kpi.value;
      kpi.value = newValue;
      kpi.change = ((newValue - oldValue) / oldValue) * 100;
      kpi.trend =
        newValue > oldValue ? 'up' : newValue < oldValue ? 'down' : 'stable';
      return true;
    }
    return false;
  }

  getOverallPerformance(): {
    achieved: number;
    total: number;
    percentage: number;
  } {
    const achieved = this.kpis.filter(kpi => kpi.value >= kpi.target).length;
    const total = this.kpis.length;
    return {
      achieved,
      total,
      percentage: (achieved / total) * 100,
    };
  }

  getTrendSummary(): { up: number; down: number; stable: number } {
    return {
      up: this.kpis.filter(kpi => kpi.trend === 'up').length,
      down: this.kpis.filter(kpi => kpi.trend === 'down').length,
      stable: this.kpis.filter(kpi => kpi.trend === 'stable').length,
    };
  }

  // ==================== 数据库操作方法 ====================

  /**
   * 加载企业KPI配置
   */
  private async loadEnterpriseKPIs(enterpriseId: string): Promise<void> {
    if (!this.useDatabase) return;

    try {
      // 从 enterprise_analytics_kpis 表加载KPI数据
      const { data, error } = await supabase
        .from('enterprise_analytics_kpis')
        .select('*')
        .eq('enterprise_id', enterpriseId)
        .eq('period_date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // 转换数据库格式为KPI对象
        this.kpis = data.map((item: KPIDatabaseRecord) => ({
          id: item.id,
          name: item.kpi_name,
          value: item.kpi_value,
          target: item.target_value,
          unit: item.unit,
          trend: item.trend_direction as 'up' | 'down' | 'stable',
          change: item.change_percentage,
          category: item.category as
            | 'business'
            | 'technical'
            | 'user'
            | 'financial',
          enterprise_id: item.enterprise_id,
          period: item.period as
            | 'daily'
            | 'weekly'
            | 'monthly'
            | 'quarterly'
            | 'yearly',
          period_date: item.period_date,
          created_at: item.created_at,
          updated_at: item.updated_at,
        }));
      } else {
        // 如果没有数据，使用默认配置
        this.initializeKPIs();
      }
    } catch (error) {
      console.error('加载企业KPI失败:', error);
      throw error;
    }
  }

  /**
   * 计算实时业务指标
   */
  private async calculateRealTimeMetrics(enterpriseId: string): Promise<void> {
    if (!this.useDatabase) return;

    try {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      // 计算月度收入
      const revenue = await this.calculateMonthlyRevenue(
        enterpriseId,
        monthStart,
        monthEnd
      );

      // 计算活跃用户数
      const activeUsers = await this.calculateActiveUsers(
        enterpriseId,
        monthStart,
        monthEnd
      );

      // 计算订单完成率
      const orderCompletionRate = await this.calculateOrderCompletionRate(
        enterpriseId,
        monthStart,
        monthEnd
      );

      // 计算客户满意度
      const customerSatisfaction = await this.calculateCustomerSatisfaction(
        enterpriseId,
        monthStart,
        monthEnd
      );

      // 计算平均响应时间
      const avgResponseTime = await this.calculateAverageResponseTime(
        enterpriseId,
        monthStart,
        monthEnd
      );

      // 计算转化率
      const conversionRate = await this.calculateConversionRate(
        enterpriseId,
        monthStart,
        monthEnd
      );

      // 更新KPI值
      this.updateKPIValueByName('月度收入', revenue);
      this.updateKPIValueByName('月度活跃用户', activeUsers);
      this.updateKPIValueByName('订单完成率', orderCompletionRate);
      this.updateKPIValueByName('用户满意度', customerSatisfaction);
      this.updateKPIValueByName('平均响应时间', avgResponseTime);
      this.updateKPIValueByName('转化率', conversionRate);

      // 保存到数据库
      await this.saveKPIsToDatabase(enterpriseId);
    } catch (error) {
      console.error('计算实时指标失败:', error);
    }
  }

  /**
   * 计算月度收入
   */
  private async calculateMonthlyRevenue(
    enterpriseId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    if (!this.useDatabase) return 1850000; // 模拟数据，与初始化KPI值一致

    try {
      const { data, error } = await supabase
        .from('enterprise_transactions')
        .select('amount')
        .eq('enterprise_id', enterpriseId)
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      return (
        data?.reduce(
          (sum: number, transaction: TransactionRecord) =>
            sum + (transaction.amount || 0),
          0
        ) || 0
      );
    } catch (error) {
      console.error('计算月度收入失败:', error);
      return 0;
    }
  }

  /**
   * 计算活跃用户数
   */
  private async calculateActiveUsers(
    enterpriseId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    if (!this.useDatabase) return 85420; // 模拟数据，与初始化KPI值一致

    try {
      // 假设有 enterprise_users 表记录用户活跃时间
      const { data, error } = await supabase
        .from('enterprise_users')
        .select('id, last_active_at')
        .eq('enterprise_id', enterpriseId)
        .not('last_active_at', 'is', null)
        .gte('last_active_at', startDate.toISOString())
        .lte('last_active_at', endDate.toISOString());

      if (error) throw error;

      const users = data as UserRecord[] | null;
      return users?.length || 0;
    } catch (error) {
      console.error('计算活跃用户数失败:', error);
      return 0;
    }
  }

  /**
   * 计算订单完成率
   */
  private async calculateOrderCompletionRate(
    enterpriseId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    if (!this.useDatabase) return 94.5; // 模拟数据

    try {
      const { data, error } = await supabase
        .from('enterprise_orders')
        .select('status')
        .eq('enterprise_id', enterpriseId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      const totalOrders = data?.length || 0;
      const completedOrders =
        data?.filter((order: OrderRecord) => order.status === 'completed')
          .length || 0;

      return totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    } catch (error) {
      console.error('计算订单完成率失败:', error);
      return 0;
    }
  }

  /**
   * 计算客户满意度
   */
  private async calculateCustomerSatisfaction(
    enterpriseId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    if (!this.useDatabase) return 4.6; // 模拟数据，与初始化KPI值一致

    try {
      const { data, error } = await supabase
        .from('enterprise_feedback')
        .select('rating')
        .eq('enterprise_id', enterpriseId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('rating', 'is', null);

      if (error) throw error;

      const ratings =
        data?.map((feedback: FeedbackRecord) => feedback.rating) || [];
      return ratings.length > 0
        ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) /
            ratings.length
        : 0;
    } catch (error) {
      console.error('计算客户满意度失败:', error);
      return 0;
    }
  }

  /**
   * 计算平均响应时间
   */
  private async calculateAverageResponseTime(
    enterpriseId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    if (!this.useDatabase) return 2.3; // 模拟数据，单位秒

    try {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('api_response_time')
        .eq('enterprise_id', enterpriseId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('api_response_time', 'is', null);

      if (error) throw error;

      const responseTimes =
        data?.map(
          (metric: PerformanceMetricRecord) => metric.api_response_time
        ) || [];
      return responseTimes.length > 0
        ? responseTimes.reduce((sum: number, time: number) => sum + time, 0) /
            responseTimes.length /
            1000
        : 0; // 转换为秒
    } catch (error) {
      console.error('计算平均响应时间失败:', error);
      return 0;
    }
  }

  /**
   * 计算转化率
   */
  private async calculateConversionRate(
    enterpriseId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    if (!this.useDatabase) return 3.8; // 模拟数据

    try {
      // 获取访问用户数
      const { data: visits, error: visitsError } = await supabase
        .from('user_journey_logs')
        .select('user_id')
        .eq('enterprise_id', enterpriseId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (visitsError) throw visitsError;

      // 获取转化用户数（例如完成订单的用户）
      const { data: conversions, error: conversionsError } = await supabase
        .from('enterprise_orders')
        .select('user_id')
        .eq('enterprise_id', enterpriseId)
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (conversionsError) throw conversionsError;

      const uniqueVisits = new Set(
        visits?.map((v: JourneyLogRecord) => v.user_id) || []
      ).size;
      const uniqueConversions = new Set(
        conversions?.map((c: OrderRecord) => c.user_id) || []
      ).size;

      return uniqueVisits > 0 ? (uniqueConversions / uniqueVisits) * 100 : 0;
    } catch (error) {
      console.error('计算转化率失败:', error);
      return 0;
    }
  }

  /**
   * 保存KPI到数据库
   */
  private async saveKPIsToDatabase(enterpriseId: string): Promise<void> {
    if (!this.useDatabase) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const kpiRecords = this.kpis.map(kpi => ({
        enterprise_id: enterpriseId,
        kpi_name: kpi.name,
        kpi_value: kpi.value,
        target_value: kpi.target,
        unit: kpi.unit,
        period: 'monthly',
        period_date: today,
        trend_direction: kpi.trend,
        change_percentage: kpi.change,
        category: kpi.category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('enterprise_analytics_kpis')
        .upsert(kpiRecords, {
          onConflict: 'enterprise_id,kpi_name,period_date',
        });

      if (error) throw error;
    } catch (error) {
      console.error('保存KPI到数据库失败:', error);
    }
  }

  // ==================== 公共方法扩展 ====================

  /**
   * 根据名称更新KPI值
   */
  updateKPIValueByName(kpiName: string, newValue: number): boolean {
    const kpi = this.kpis.find(k => k.name === kpiName);
    if (kpi) {
      const oldValue = kpi.value;
      kpi.value = newValue;
      kpi.change = oldValue > 0 ? ((newValue - oldValue) / oldValue) * 100 : 0;
      kpi.trend =
        newValue > oldValue ? 'up' : newValue < oldValue ? 'down' : 'stable';
      return true;
    }
    return false;
  }

  /**
   * 获取企业分析数据
   */
  async getEnterpriseAnalytics(
    enterpriseId: string,
    dateRange?: DateRange
  ): Promise<AnalyticsData> {
    if (dateRange) {
      await this.calculateRealTimeMetrics(enterpriseId);
    }

    // 生成图表数据
    const charts = await this.generateChartData(enterpriseId, dateRange);

    // 计算汇总指标
    const metrics = await this.calculateSummaryMetrics(enterpriseId);

    return {
      kpis: this.kpis,
      charts,
      metrics,
    };
  }

  /**
   * 生成图表数据
   */
  private async generateChartData(
    _enterpriseId: string,
    _dateRange?: DateRange
  ): Promise<AnalyticsData['charts']> {
    // 简化实现，实际应该从数据库查询历史数据
    return {
      revenue: [
        { month: '1月', value: 380000 },
        { month: '2月', value: 420000 },
        { month: '3月', value: 395000 },
        { month: '4月', value: 458200 },
        { month: '5月', value: 510000 },
        { month: '6月', value: 480000 },
      ],
      users: [
        { month: '1月', value: 7200 },
        { month: '2月', value: 7800 },
        { month: '3月', value: 8100 },
        { month: '4月', value: 8420 },
        { month: '5月', value: 8900 },
        { month: '6月', value: 9200 },
      ],
      orders: [
        { month: '1月', value: 2450 },
        { month: '2月', value: 2800 },
        { month: '3月', value: 2650 },
        { month: '4月', value: 3120 },
        { month: '5月', value: 3400 },
        { month: '6月', value: 3250 },
      ],
      conversion: [
        { month: '1月', value: 3.2 },
        { month: '2月', value: 3.5 },
        { month: '3月', value: 3.6 },
        { month: '4月', value: 3.8 },
        { month: '5月', value: 4.0 },
        { month: '6月', value: 4.2 },
      ],
    };
  }

  /**
   * 计算汇总指标
   */
  private async calculateSummaryMetrics(
    enterpriseId: string
  ): Promise<AnalyticsData['metrics']> {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return {
      totalUsers: 125400,
      activeUsers: await this.calculateActiveUsers(
        enterpriseId,
        monthStart,
        monthEnd
      ),
      totalOrders: 17670,
      revenue: await this.calculateMonthlyRevenue(
        enterpriseId,
        monthStart,
        monthEnd
      ),
      conversionRate: await this.calculateConversionRate(
        enterpriseId,
        monthStart,
        monthEnd
      ),
      avgOrderValue: 259.5,
      customerSatisfaction: await this.calculateCustomerSatisfaction(
        enterpriseId,
        monthStart,
        monthEnd
      ),
    };
  }

  /**
   * 获取时间序列数据
   */
  async getTimeSeriesData(
    enterpriseId: string,
    kpiName: string,
    startDate: Date,
    endDate: Date,
    _interval: 'daily' | 'weekly' | 'monthly' = 'monthly'
  ): Promise<{ date: string; value: number }[]> {
    if (!this.useDatabase) {
      // 返回模拟数据
      return Array.from({ length: 6 }, (_, i) => ({
        date: `${i + 1}月`,
        value: Math.floor(Math.random() * 100000) + 50000,
      }));
    }

    try {
      const { data, error } = await supabase
        .from('enterprise_analytics_kpis')
        .select('period_date, kpi_value')
        .eq('enterprise_id', enterpriseId)
        .eq('kpi_name', kpiName)
        .gte('period_date', startDate.toISOString().split('T')[0])
        .lte('period_date', endDate.toISOString().split('T')[0])
        .order('period_date', { ascending: true });

      if (error) throw error;

      return (
        data?.map((item: KPIDatabaseRecord) => ({
          date: item.period_date,
          value: item.kpi_value,
        })) || []
      );
    } catch (error) {
      console.error('获取时间序列数据失败:', error);
      return [];
    }
  }

  /**
   * 导出分析报告
   */
  async exportAnalyticsReport(
    enterpriseId: string,
    format: 'csv' | 'json' | 'pdf' = 'json'
  ): Promise<any> {
    const analyticsData = await this.getEnterpriseAnalytics(enterpriseId);

    if (format === 'json') {
      return analyticsData;
    } else if (format === 'csv') {
      // 简化的CSV转换
      const csvContent = this.convertToCSV(analyticsData);
      return {
        content: csvContent,
        filename: `analytics-${enterpriseId}-${new Date().toISOString().split('T')[0]}.csv`,
      };
    } else {
      throw new Error('PDF导出功能暂未实现');
    }
  }

  private convertToCSV(data: AnalyticsData): string {
    const headers = [
      '指标名称',
      '当前值',
      '目标值',
      '单位',
      '趋势',
      '变化率(%)',
      '分类',
    ];
    const rows = data.kpis.map(kpi => [
      kpi.name,
      kpi.value.toString(),
      kpi.target.toString(),
      kpi.unit,
      kpi.trend,
      kpi.change.toFixed(2),
      kpi.category,
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * 获取KPI告警列表
   */
  getKPIAlerts(): {
    kpi: KPI;
    severity: 'high' | 'medium' | 'low';
    message: string;
  }[] {
    const alerts: {
      kpi: KPI;
      severity: 'high' | 'medium' | 'low';
      message: string;
    }[] = [];

    this.kpis.forEach(kpi => {
      if (kpi.value < kpi.target * 0.7) {
        alerts.push({
          kpi,
          severity: 'high',
          message: `${kpi.name}严重低于目标值，当前为${kpi.value}${kpi.unit}，目标为${kpi.target}${kpi.unit}`,
        });
      } else if (kpi.value < kpi.target * 0.9) {
        alerts.push({
          kpi,
          severity: 'medium',
          message: `${kpi.name}低于目标值，当前为${kpi.value}${kpi.unit}，目标为${kpi.target}${kpi.unit}`,
        });
      } else if (kpi.trend === 'down' && kpi.change < -10) {
        alerts.push({
          kpi,
          severity: 'low',
          message: `${kpi.name}趋势下降，下降${Math.abs(kpi.change)}%`,
        });
      }
    });

    return alerts;
  }

  /**
   * 重新计算所有指标
   */
  async recalculateAllMetrics(enterpriseId: string): Promise<void> {
    await this.calculateRealTimeMetrics(enterpriseId);
  }
}

// 导出全局实例（兼容旧代码）
export const analyticsKPIService = new AnalyticsKPIService();

// 创建企业专用实例的工厂函数
export function createEnterpriseAnalyticsService(
  enterpriseId: string
): AnalyticsKPIService {
  return new AnalyticsKPIService(enterpriseId);
}
