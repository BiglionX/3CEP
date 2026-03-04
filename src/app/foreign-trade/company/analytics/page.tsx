'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ForeignTradeSidebar } from '@/components/foreign-trade/Sidebar';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign,
  ArrowLeft,
  Download,
  Filter,
} from 'lucide-react';

interface AnalyticsData {
  monthlyRevenue: MonthlyData[];
  orderTrends: OrderTrend[];
  topPartners: PartnerData[];
  productPerformance: ProductData[];
}

interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
  growth: number;
}

interface OrderTrend {
  date: string;
  importOrders: number;
  exportOrders: number;
  totalValue: number;
}

interface PartnerData {
  name: string;
  country: string;
  totalOrders: number;
  totalValue: number;
  recentActivity: string;
}

interface ProductData {
  name: string;
  category: string;
  salesVolume: number;
  revenue: number;
  popularity: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<'importer' | 'exporter'>(
    'importer'
  );
  const [timeRange, setTimeRange] = useState('monthly');

  const analyticsData: AnalyticsData = {
    monthlyRevenue: [
      { month: '2026-01', revenue: 7550000, orders: 15, growth: 12.5 },
      { month: '2026-02', revenue: 8200000, orders: 18, growth: 8.6 },
      { month: '2026-03', revenue: 9100000, orders: 22, growth: 11.0 },
    ],
    orderTrends: [
      {
        date: '2026-02-20',
        importOrders: 3,
        exportOrders: 2,
        totalValue: 1250000,
      },
      {
        date: '2026-02-21',
        importOrders: 2,
        exportOrders: 4,
        totalValue: 1870000,
      },
      {
        date: '2026-02-22',
        importOrders: 4,
        exportOrders: 1,
        totalValue: 980000,
      },
      {
        date: '2026-02-23',
        importOrders: 1,
        exportOrders: 3,
        totalValue: 1560000,
      },
      {
        date: '2026-02-24',
        importOrders: 3,
        exportOrders: 2,
        totalValue: 1340000,
      },
      {
        date: '2026-02-25',
        importOrders: 2,
        exportOrders: 3,
        totalValue: 1680000,
      },
    ],
    topPartners: [
      {
        name: 'Samsung Electronics',
        country: '韩国',
        totalOrders: 12,
        totalValue: 4200000,
        recentActivity: '2026-02-24',
      },
      {
        name: 'Apple Inc.',
        country: '美国',
        totalOrders: 8,
        totalValue: 2850000,
        recentActivity: '2026-02-23',
      },
      {
        name: 'TechGlobal Ltd.',
        country: '美国',
        totalOrders: 15,
        totalValue: 8500000,
        recentActivity: '2026-02-25',
      },
      {
        name: 'Sony Corporation',
        country: '日本',
        totalOrders: 6,
        totalValue: 1200000,
        recentActivity: '2026-02-22',
      },
    ],
    productPerformance: [
      {
        name: 'Galaxy S24 Ultra',
        category: '智能手机',
        salesVolume: 1500,
        revenue: 10500000,
        popularity: 95,
      },
      {
        name: 'iPhone 15 Pro Max',
        category: '智能手机',
        salesVolume: 800,
        revenue: 7600000,
        popularity: 92,
      },
      {
        name: '华为Mate 60 Pro',
        category: '智能手机',
        salesVolume: 1200,
        revenue: 10200000,
        popularity: 88,
      },
      {
        name: '小米14 Ultra',
        category: '智能手机',
        salesVolume: 950,
        revenue: 6840000,
        popularity: 85,
      },
    ],
  };

  const handleRoleChange = (role: 'importer' | 'exporter') => {
    setActiveRole(role);
  };

  const handleExport = () => {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('导出分析数据')};

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ForeignTradeSidebar
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
      />

      <div className="flex-1 lg:ml-0">
        {/* 头部导航 */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/foreign-trade/company')}
                  className="mr-4"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold text-gray-900">业务分析</h1>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  导出报告
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* 时间筛?*/}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  数据筛?                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].map(
                    range => (
                      <Button
                        key={range}
                        variant={timeRange === range ? 'default' : 'outline'}
                        onClick={() => setTimeRange(range)}
                        size="sm"
                      >
                        {range === 'daily' && '日度'}
                        {range === 'weekly' && '周度'}
                        {range === 'monthly' && '月度'}
                        {range === 'quarterly' && '季度'}
                        {range === 'yearly' && '年度'}
                      </Button>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 关键指标概览 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总收?/CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ¥
                  {(
                    analyticsData.monthlyRevenue.reduce(
                      (sum, m) => sum + m.revenue,
                      0
                    ) / 10000
                  ).toFixed(1)}
                  �?                </div>
                <p className="text-xs text-muted-foreground">累计交易总额</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总订单数</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {analyticsData.monthlyRevenue.reduce(
                    (sum, m) => sum + m.orders,
                    0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">历史订单总量</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  平均增长?                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {(
                    analyticsData.monthlyRevenue.reduce(
                      (sum, m) => sum + m.growth,
                      0
                    ) / analyticsData.monthlyRevenue.length
                  ).toFixed(1)}
                  %
                </div>
                <p className="text-xs text-muted-foreground">月度平均增长</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">合作夥伴</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {analyticsData.topPartners.length}
                </div>
                <p className="text-xs text-muted-foreground">活跃合作伙伴</p>
              </CardContent>
            </Card>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 收入趋势图表 */}
            <Card>
              <CardHeader>
                <CardTitle>收入趋势分析</CardTitle>
                <CardDescription>过去3个月的收入变化趋?/CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {analyticsData.monthlyRevenue.map((month, index) => (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                        style={{
                          height: `${(month.revenue / Math.max(...analyticsData.monthlyRevenue.map(m => m.revenue))) * 200}px`,
                        }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2">
                        {month.month.split('-')[1]}�?                      </div>
                      <div className="text-xs font-medium">
                        ¥{(month.revenue / 10000).toFixed(0)}�?                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 订单趋势图表 */}
            <Card>
              <CardHeader>
                <CardTitle>订单趋势分析</CardTitle>
                <CardDescription>近期每日订单量变?/CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-1">
                  {analyticsData.orderTrends.map((day, index) => (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center space-y-1"
                    >
                      <div className="flex items-end space-x-1">
                        <div
                          className="w-3 bg-green-500 rounded-t"
                          style={{
                            height: `${(day.importOrders / 10) * 80}px`,
                          }}
                        ></div>
                        <div
                          className="w-3 bg-blue-500 rounded-t"
                          style={{
                            height: `${(day.exportOrders / 10) * 80}px`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {day.date.split('-')[2]}
                      </div>
                      <div className="text-xs font-medium">
                        {day.importOrders + day.exportOrders}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span className="text-xs">进口订单</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                    <span className="text-xs">出口订单</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 数据表格 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 合作伙伴排名 */}
            <Card>
              <CardHeader>
                <CardTitle>合作伙伴排名</CardTitle>
                <CardDescription>按交易额排序的主要合作伙?/CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topPartners.map((partner, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{partner.name}</div>
                          <div className="text-sm text-gray-500">
                            {partner.country}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          ¥{(partner.totalValue / 10000).toFixed(1)}�?                        </div>
                        <div className="text-sm text-gray-500">
                          {partner.totalOrders}�?                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 产品表现 */}
            <Card>
              <CardHeader>
                <CardTitle>产品表现分析</CardTitle>
                <CardDescription>热销产品排行?/CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.productPerformance.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            {product.category}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {product.salesVolume}�?                        </div>
                        <div className="text-sm text-gray-500">
                          热度:{product.popularity}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

