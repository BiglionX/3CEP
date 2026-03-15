'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  LineChart,
  Database,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface Report {
  id: string;
  title: string;
  type: 'sales' | 'customer' | 'inventory' | 'financial';
  status: 'completed' | 'processing' | 'scheduled';
  lastGenerated: string;
  nextSchedule: string;
}

interface DashboardMetric {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: any;
}

export default function DataAnalysisPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const reports: Report[] = [
    {
      id: 'REP-001',
      title: '月度销售分析报,
      type: 'sales',
      status: 'completed',
      lastGenerated: '2024-01-20 10:30:00',
      nextSchedule: '2024-02-01 09:00:00',
    },
    {
      id: 'REP-002',
      title: '客户行为分析',
      type: 'customer',
      status: 'processing',
      lastGenerated: '2024-01-19 15:45:00',
    },
    {
      id: 'REP-003',
      title: '库存周转分析',
      type: 'inventory',
      status: 'scheduled',
      lastGenerated: '2024-01-15 08:00:00',
      nextSchedule: '2024-01-25 09:00:00',
    },
  ];

  const dashboardMetrics: DashboardMetric[] = [
    {
      title: '总销售额',
      value: '¥1,247,890',
      change: 12.5,
      trend: 'up',
      icon: TrendingUp,
    },
    {
      title: '活跃客户,
      value: '15,680',
      change: 8.3,
      trend: 'up',
      icon: PieChart,
    },
    {
      title: '平均订单价,
      value: '¥845',
      change: -2.1,
      trend: 'down',
      icon: BarChart3,
    },
    {
      title: '转化,
      value: '3.2%',
      change: 0.8,
      trend: 'up',
      icon: LineChart,
    },
  ];

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'sales':
        return 'bg-blue-100 text-blue-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      case 'inventory':
        return 'bg-purple-100 text-purple-800';
      case 'financial':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            商业智能分析平台
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            AI驱动的数据分析和商业洞察平台，提供数据可视化、预测分析和异常检测功          </p>
        </div>

        {/* 导航标签 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['dashboard', 'reports', 'analytics', 'alerts'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                     'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'dashboard' && '数据仪表}
                {tab === 'reports' && '报告中心'}
                {tab === 'analytics' && '高级分析'}
                {tab === 'alerts' && '异常预警'}
              </button>
            ))}
          </nav>
        </div>

        {/* 数据仪表*/}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* 关键指标卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {metric.title}
                      </CardTitle>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metric.value}</div>
                      <div
                        className={`flex items-center text-sm ${
                          metric.trend === 'up'
                             'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {metric.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingUp className="w-4 h-4 mr-1 rotate-180" />
                        )}
                        {metric.change > 0  '+' : ''}
                        {metric.change}%
                        <span className="text-gray-500 ml-1">本月</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* 图表区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="w-5 h-5 mr-2" />
                    销售趋势分                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <LineChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>销售趋势图/p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    客户地域分布
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>地域分布饼图</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 数据过滤*/}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  数据筛                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      日期范围
                    </label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={e =>
                        setDateRange({ ...dateRange, start: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      结束日期
                    </label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={e =>
                        setDateRange({ ...dateRange, end: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      指标类型
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>全部指标</option>
                      <option>销售数/option>
                      <option>客户数据</option>
                      <option>库存数据</option>
                    </select>
                  </div>
                  <div className="flex items-end space-x-2">
                    <Button className="flex-1">
                      <Filter className="w-4 h-4 mr-2" />
                      筛                    </Button>
                    <Button variant="outline">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 报告中心 */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>自动报告列表</span>
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    导出所有报                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">报告名称</th>
                        <th className="text-left py-3 px-4">类型</th>
                        <th className="text-left py-3 px-4">状/th>
                        <th className="text-left py-3 px-4">上次生成</th>
                        <th className="text-left py-3 px-4">下次计划</th>
                        <th className="text-left py-3 px-4">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map(report => (
                        <tr
                          key={report.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 font-medium">
                            {report.title}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReportTypeColor(report.type)}`}
                            >
                              {report.type === 'sales' && '销}
                              {report.type === 'customer' && '客户'}
                              {report.type === 'inventory' && '库存'}
                              {report.type === 'financial' && '财务'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}
                            >
                              {report.status === 'completed' && '已完}
                              {report.status === 'processing' && '生成}
                              {report.status === 'scheduled' && '已计}
                            </span>
                          </td>
                          <td className="py-3 px-4">{report.lastGenerated}</td>
                          <td className="py-3 px-4">
                            {report.nextSchedule || '-'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                查看
                              </Button>
                              <Button variant="outline" size="sm">
                                下载
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 高级分析 */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    预测分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">
                        下月销售预                      </h3>
                      <p className="text-blue-700">
                        预计下月销售额将达¥1,380,000，同比增15.2%
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">
                        热门产品预测
                      </h3>
                      <p className="text-green-700">
                        根据趋势分析，智能家居产品线预计将增25%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    异常检                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                        <h3 className="font-semibold text-yellow-900">
                          库存预警
                        </h3>
                      </div>
                      <p className="text-yellow-700">
                        产品 XYZ-2024 的库存低于安全线，建议及时补                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                        <h3 className="font-semibold text-red-900">异常交易</h3>
                      </div>
                      <p className="text-red-700">
                        发现 3 笔异常大额交易，需要人工审                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 异常预警 */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  实时预警系统
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-red-900">
                          服务器负载过                        </h3>
                        <p className="text-red-700 text-sm">
                          CPU 使用率达95%，建议扩                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-red-600">2分钟/div>
                      <Button variant="outline" size="sm" className="mt-1">
                        处理
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-yellow-900">
                          库存不足预警
                        </h3>
                        <p className="text-yellow-700 text-sm">
                          产品 ABC-123 库存仅剩 15                         </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-yellow-600">15分钟/div>
                      <Button variant="outline" size="sm" className="mt-1">
                        查看详情
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-green-900">
                          系统恢复正常
                        </h3>
                        <p className="text-green-700 text-sm">
                          数据库连接已恢复稳定状                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-600">1小时/div>
                      <Button variant="outline" size="sm" className="mt-1">
                        确认
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

