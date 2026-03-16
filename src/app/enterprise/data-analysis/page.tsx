'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  FileText,
  Download,
} from 'lucide-react';

interface Report {
  id: string;
  title: string;
  type: 'sales' | 'customer' | 'inventory' | 'financial';
  status: 'completed' | 'processing' | 'scheduled';
  lastGenerated: string;
  nextSchedule: string;
}

interface AnalyticsData {
  label: string;
  value: number;
  change: number;
}

export default function DataAnalysisPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('week');

  const salesData: AnalyticsData[] = [
    { label: '周一', value: 12000, change: 5.2 },
    { label: '周二', value: 15000, change: 12.5 },
    { label: '周三', value: 18000, change: 8.3 },
    { label: '周四', value: 14000, change: -3.1 },
    { label: '周五', value: 21000, change: 15.7 },
    { label: '周六', value: 25000, change: 22.4 },
    { label: '周日', value: 22000, change: 18.9 },
  ];

  const reports: Report[] = [
    {
      id: 'RPT-001',
      title: '销售报告',
      type: 'sales',
      status: 'completed',
      lastGenerated: '2024-01-20 10:00:00',
      nextSchedule: '2024-01-27 10:00:00',
    },
    {
      id: 'RPT-002',
      title: '客户分析报告',
      type: 'customer',
      status: 'processing',
      lastGenerated: '2024-01-19 15:30:00',
      nextSchedule: '2024-01-26 15:30:00',
    },
    {
      id: 'RPT-003',
      title: '库存报告',
      type: 'inventory',
      status: 'scheduled',
      lastGenerated: '2024-01-18 09:00:00',
      nextSchedule: '2024-01-25 09:00:00',
    },
    {
      id: 'RPT-004',
      title: '财务报表',
      type: 'financial',
      status: 'completed',
      lastGenerated: '2024-01-20 08:00:00',
      nextSchedule: '2024-01-27 08:00:00',
    },
  ];

  const metrics = [
    { name: '总销售额', value: '¥127,500', change: '+12.5%', up: true },
    { name: '订单数', value: '1,245', change: '+8.3%', up: true },
    { name: '客户数', value: '8,921', change: '+5.2%', up: true },
    { name: '转化率', value: '3.2%', change: '-0.5%', up: false },
  ];

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'sales':
        return 'bg-blue-100 text-blue-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      case 'inventory':
        return 'bg-yellow-100 text-yellow-800';
      case 'financial':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const maxValue = Math.max(...salesData.map(d => d.value));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">数据分析</h1>
          <p className="text-gray-600 mt-2">查看销售数据和生成报告</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            数据概览
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            报告管理
          </button>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2 mb-6">
          {['week', 'month', 'quarter', 'year'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1 rounded text-sm ${
                dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range === 'week' && '本周'}
              {range === 'month' && '本月'}
              {range === 'quarter' && '本季度'}
              {range === 'year' && '本年'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{metric.name}</p>
                        <p className="text-2xl font-bold mt-1">{metric.value}</p>
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          metric.up ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {metric.up ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">{metric.change}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sales Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  销售趋势
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {salesData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-600 rounded-t transition-all hover:bg-blue-700"
                        style={{ height: `${(data.value / maxValue) * 100}%` }}
                      />
                      <p className="text-xs text-gray-500 mt-2">{data.label}</p>
                      <p className="text-xs font-medium">
                        ¥{(data.value / 1000).toFixed(1)}k
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Distribution Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    产品类别分布
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: '电子产品', value: 45, color: 'bg-blue-500' },
                      { name: '家用电器', value: 25, color: 'bg-green-500' },
                      { name: '办公用品', value: 20, color: 'bg-yellow-500' },
                      { name: '其他', value: 10, color: 'bg-gray-500' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded ${item.color}`} />
                        <div className="flex-1">
                          <div className="flex justify-between text-sm">
                            <span>{item.name}</span>
                            <span>{item.value}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full mt-1">
                            <div
                              className={`h-2 rounded-full ${item.color}`}
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    销售增长
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: '华南地区', growth: 25 },
                      { name: '华东地区', growth: 18 },
                      { name: '华北地区', growth: 12 },
                      { name: '西南地区', growth: 8 },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm font-medium text-green-600">
                          +{item.growth}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                报告列表
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        报告名称
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        类型
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        状态
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        上次生成
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        下次计划
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{report.title}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getReportTypeColor(
                              report.type
                            )}`}
                          >
                            {report.type === 'sales' && '销售'}
                            {report.type === 'customer' && '客户'}
                            {report.type === 'inventory' && '库存'}
                            {report.type === 'financial' && '财务'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              report.status
                            )}`}
                          >
                            {report.status === 'completed' && '已完成'}
                            {report.status === 'processing' && '处理中'}
                            {report.status === 'scheduled' && '已计划'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {report.lastGenerated}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {report.nextSchedule}
                        </td>
                        <td className="py-3 px-4">
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Download className="h-4 w-4 text-gray-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
