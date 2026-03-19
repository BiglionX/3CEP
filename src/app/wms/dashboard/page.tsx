'use client';

import { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Package,
  DollarSign,
  Users,
  MapPin,
  BarChart3,
} from 'lucide-react';

// 类型定义
interface WarehouseKPI {
  inbound_timeliness: any;
  outbound_timeliness: any;
  inventory_turnover: any;
  exception_rate: any;
  accuracy_rate: any;
  on_time_rate: any;
  damage_rate: any;
  storage_utilization: any;
  labor_efficiency: any;
  cost_per_order: any;
}

interface AggregatedWarehouseMetrics {
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  location: {
    country: string;
    city: string;
    countryCode: string;
  };
  kpiMetrics: WarehouseKPI;
  compositeScore: {
    operationalEfficiency: number;
    serviceQuality: number;
    costControl: number;
    overallScore: number;
  };
}

interface DashboardData {
  summary: {
    totalWarehouses: number;
    activeWarehouses: number;
    totalOperationsValue: number;
    avgCompositeScore: number;
    periodComparison: {
      valueChange: number;
      scoreChange: number;
    };
  };
  warehouseMetrics: AggregatedWarehouseMetrics[];
  trends: {
    timelineData: Array<{
      date: string;
      metrics: Partial<Record<string, number>>;
    }>;
    warehouseRankings: Array<{
      warehouseId: string;
      warehouseName: string;
      overallScore: number;
      rank: number;
      improvement: number;
    }>;
    kpiTrendAnalysis: Array<{
      kpiType: string;
      kpiName: string;
      currentValue: number;
      previousValue: number;
      trend: 'up' | 'down' | 'stable';
      variance: number;
    }>;
  };
  alerts: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    warehouseId: string;
    warehouseName: string;
    kpiType: string;
    message: string;
    currentValue: number;
    thresholdValue: number;
    timestamp: string;
  }>;
}

export default function WMSEfficiencyDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    warehouseIds: [] as string[],
    countries: [] as string[],
    cities: [] as string[],
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
    timeDimension: 'monthly',
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams({
        startDate: filters.dateRange.startDate,
        endDate: filters.dateRange.endDate,
        timeDimension: filters.timeDimension,
      });

      const response = await fetch(
        `/api/wms/dashboard/performance${queryParams}`
      );
      const result = await response.json();

      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('加载看板数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApplyFilters = () => {
    loadDashboardData();
  };

  const exportData = () => {
    // 实现数据导出功能
    // TODO: 移除调试日志
    console.log('导出数据');
  };

  // 渲染指标卡片
  const renderMetricCard = (
    title: string,
    value: number,
    unit: string,
    status: string,
    icon: React.ReactNode
  ) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'excellent':
          return 'text-green-600';
        case 'good':
          return 'text-blue-600';
        case 'warning':
          return 'text-yellow-600';
        case 'critical':
          return 'text-red-600';
        default:
          return 'text-gray-600';
      }
    };

    const getStatusBg = (status: string) => {
      switch (status) {
        case 'excellent':
          return 'bg-green-100';
        case 'good':
          return 'bg-blue-100';
        case 'warning':
          return 'bg-yellow-100';
        case 'critical':
          return 'bg-red-100';
        default:
          return 'bg-gray-100';
      }
    };

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {value.toFixed(1)}
            {unit}
          </div>
          <Badge
            className={`${getStatusBg(status)} ${getStatusColor(status)} mt-2`}
          >
            {status === 'excellent'
              ? '优秀'
              : status === 'good'
                ? '良好'
                : status === 'warning'
                  ? '警告'
                  : '危险'}
          </Badge>
        </CardContent>
      </Card>
    );
  };

  // 渲染趋势图标
  const renderTrendIcon = (trend: string) => {
    if (trend === 'up') {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trend === 'down') {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    } else {
      return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">暂无数据</h3>
          <p className="text-gray-500">请调整筛选条件或稍后重试</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">WMS效能分析看板</h1>
          <p className="text-gray-600 mt-2">
            监控各海外仓运营数据，实时掌握仓储效能
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </Button>
        </div>
      </div>

      {/* 筛选器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            数据筛选
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">开始日期</label>
              <Input
                type="date"
                value={filters.dateRange.startDate}
                onChange={e =>
                  handleFilterChange('dateRange', {
                    ...filters.dateRange,
                    startDate: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">结束日期</label>
              <Input
                type="date"
                value={filters.dateRange.endDate}
                onChange={e =>
                  handleFilterChange('dateRange', {
                    ...filters.dateRange,
                    endDate: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">时间维度</label>
              <select
                value={filters.timeDimension}
                onChange={e =>
                  handleFilterChange('timeDimension', e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="daily">日</option>
                <option value="weekly">周</option>
                <option value="monthly">月</option>
                <option value="quarterly">季度</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleApplyFilters} className="w-full">
                应用筛选
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 汇总指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Package className="w-4 h-4" />
              仓库总数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">
              {dashboardData.summary.totalWarehouses}
            </div>
            <p className="text-sm text-blue-600 mt-1">
              活跃: {dashboardData.summary.activeWarehouses}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              平均评分
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800">
              {dashboardData.summary.avgCompositeScore.toFixed(1)}
            </div>
            <p className="text-sm text-green-600 mt-1">综合效能评分</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              环比变化
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${dashboardData.summary.periodComparison.scoreChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {dashboardData.summary.periodComparison.scoreChange >= 0
                ? '+'
                : ''}
              {dashboardData.summary.periodComparison.scoreChange.toFixed(1)}%
            </div>
            <p className="text-sm text-purple-600 mt-1">评分变化</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              告警数量
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-800">
              {dashboardData.alerts.length}
            </div>
            <p className="text-sm text-orange-600 mt-1">需要关注的问题</p>
          </CardContent>
        </Card>
      </div>

      {/* KPI指标卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {dashboardData.warehouseMetrics[0] &&
          Object.entries(dashboardData.warehouseMetrics[0].kpiMetrics).map(
            ([kpiKey, kpiData]) => {
              const kpiNames: Record<
                string,
                { name: string; icon: React.ReactNode; unit: string }
              > = {
                inbound_timeliness: {
                  name: '入库时效',
                  icon: <Clock className="w-4 h-4" />,
                  unit: '分钟',
                },
                outbound_timeliness: {
                  name: '出库时效',
                  icon: <Package className="w-4 h-4" />,
                  unit: '分钟',
                },
                inventory_turnover: {
                  name: '库存周转',
                  icon: <BarChart3 className="w-4 h-4" />,
                  unit: '次',
                },
                exception_rate: {
                  name: '异常率',
                  icon: <AlertTriangle className="w-4 h-4" />,
                  unit: '%',
                },
                accuracy_rate: {
                  name: '准确率',
                  icon: <CheckCircle className="w-4 h-4" />,
                  unit: '%',
                },
                on_time_rate: {
                  name: '准时率',
                  icon: <Clock className="w-4 h-4" />,
                  unit: '%',
                },
                damage_rate: {
                  name: '损坏率',
                  icon: <AlertTriangle className="w-4 h-4" />,
                  unit: '%',
                },
                storage_utilization: {
                  name: '存储利用率',
                  icon: <BarChart3 className="w-4 h-4" />,
                  unit: '%',
                },
                labor_efficiency: {
                  name: '劳动效率',
                  icon: <Users className="w-4 h-4" />,
                  unit: '订单/小时',
                },
                cost_per_order: {
                  name: '单订单成本',
                  icon: <DollarSign className="w-4 h-4" />,
                  unit: '美元',
                },
              };

              const kpiInfo = kpiNames[kpiKey] || {
                name: kpiKey,
                icon: <BarChart3 className="w-4 h-4" />,
                unit: '',
              };

              return renderMetricCard(
                kpiInfo.name,
                kpiData.currentValue,
                kpiInfo.unit,
                kpiData.status,
                kpiInfo.icon
              );
            }
          )}
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 综合评分趋势图 */}
        <Card>
          <CardHeader>
            <CardTitle>综合评分趋势</CardTitle>
            <CardDescription>各仓库综合效能评分变化趋势</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboardData.trends.timelineData.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="metrics.inventory_turnover"
                  name="库存周转"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="metrics.accuracy_rate"
                  name="准确率"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 仓库排名饼图 */}
        <Card>
          <CardHeader>
            <CardTitle>仓库效能排名</CardTitle>
            <CardDescription>各仓库综合评分排名</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.trends.warehouseRankings.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="overallScore"
                  nameKey="warehouseName"
                  label={({ warehouseName, overallScore }) =>
                    `${warehouseName}: ${overallScore.toFixed(0)}`
                  }
                >
                  {dashboardData.trends.warehouseRankings
                    .slice(0, 6)
                    .map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          [
                            '#0088FE',
                            '#00C49F',
                            '#FFBB28',
                            '#FF8042',
                            '#8884d8',
                            '#82ca9d',
                          ][index % 6]
                        }
                      />
                    ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* KPI趋势分析 */}
      <Card>
        <CardHeader>
          <CardTitle>KPI趋势分析</CardTitle>
          <CardDescription>关键绩效指标变化趋势</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.trends.kpiTrendAnalysis.map((trend, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="font-medium">{trend.kpiName}</div>
                  <Badge
                    variant={
                      trend.trend === 'up'
                        ? 'default'
                        : trend.trend === 'down'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {renderTrendIcon(trend.trend)}
                    <span className="ml-1">
                      {trend.variance > 0 ? '+' : ''}
                      {trend.variance.toFixed(1)}%
                    </span>
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    {trend.currentValue.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">
                    上期: {trend.previousValue.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 告警列表 */}
      {dashboardData.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              系统告警
            </CardTitle>
            <CardDescription>需要立即关注的运营问题</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.alerts.slice(0, 5).map((alert, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">
                      {alert.warehouseName} - {alert.message}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      当前值: {alert.currentValue.toFixed(2)} | 阈值:{' '}
                      {alert.thresholdValue}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Badge
                    variant={
                      alert.severity === 'critical'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {alert.severity === 'critical'
                      ? '严重'
                      : alert.severity === 'high'
                        ? '高'
                        : alert.severity === 'medium'
                          ? '中'
                          : '低'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 仓库详细指标表格 */}
      <Card>
        <CardHeader>
          <CardTitle>仓库详细指标</CardTitle>
          <CardDescription>各仓库关键KPI指标详情</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">仓库</th>
                  <th className="text-left py-3 px-4">位置</th>
                  <th className="text-left py-3 px-4">综合评分</th>
                  <th className="text-left py-3 px-4">入库时效</th>
                  <th className="text-left py-3 px-4">出库时效</th>
                  <th className="text-left py-3 px-4">准确率</th>
                  <th className="text-left py-3 px-4">准时率</th>
                  <th className="text-left py-3 px-4">异常率</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.warehouseMetrics.map((warehouse, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">
                          {warehouse.warehouseName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {warehouse.warehouseCode}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {warehouse.location.city}, {warehouse.location.country}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          warehouse.compositeScore.overallScore >= 90
                            ? 'default'
                            : warehouse.compositeScore.overallScore >= 80
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {warehouse.compositeScore.overallScore.toFixed(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {warehouse.kpiMetrics.inbound_timeliness.currentValue.toFixed(
                        1
                      )}
                      分钟
                    </td>
                    <td className="py-3 px-4">
                      {warehouse.kpiMetrics.outbound_timeliness.currentValue.toFixed(
                        1
                      )}
                      分钟
                    </td>
                    <td className="py-3 px-4">
                      {warehouse.kpiMetrics.accuracy_rate.currentValue.toFixed(
                        1
                      )}
                      %
                    </td>
                    <td className="py-3 px-4">
                      {warehouse.kpiMetrics.on_time_rate.currentValue.toFixed(
                        1
                      )}
                      %
                    </td>
                    <td className="py-3 px-4">
                      {warehouse.kpiMetrics.exception_rate.currentValue.toFixed(
                        1
                      )}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
