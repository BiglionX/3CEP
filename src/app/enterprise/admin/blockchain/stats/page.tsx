'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
  BarChart3,
  Blockchain,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  QrCode,
  Database,
  Users,
  Activity,
  CheckCircle,
  Loader2,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

interface CodeSegment {
  id: string;
  name: string;
  totalCount: number;
  usedCount: number;
  status: string;
}

interface DailyStats {
  date: string;
  used: number;
  created: number;
}

interface MerchantUsage {
  merchantId: string;
  merchantName: string;
  usedCount: number;
  totalAssigned: number;
}

interface Stats {
  totalSegments: number;
  totalCodes: number;
  usedCodes: number;
  availableCodes: number;
  totalMerchants: number;
  usageRate: number;
  dailyStats: DailyStats[];
  merchantUsage: MerchantUsage[];
}

// 模拟数据
const mockDailyStats: DailyStats[] = [
  { date: '03-12', used: 120, created: 150 },
  { date: '03-13', used: 180, created: 200 },
  { date: '03-14', used: 150, created: 180 },
  { date: '03-15', used: 220, created: 250 },
  { date: '03-16', used: 280, created: 300 },
  { date: '03-17', used: 190, created: 220 },
  { date: '03-18', used: 160, created: 180 },
];

const mockMerchantUsage: MerchantUsage[] = [
  { merchantId: 'm001', merchantName: '测试商户A', usedCount: 3520, totalAssigned: 10000 },
  { merchantId: 'm002', merchantName: '测试商户B', usedCount: 5000, totalAssigned: 5000 },
  { merchantId: 'm003', merchantName: '测试商户C', usedCount: 2100, totalAssigned: 8000 },
  { merchantId: 'm004', merchantName: '测试商户D', usedCount: 800, totalAssigned: 5000 },
  { merchantId: 'm005', merchantName: '测试商户E', usedCount: 0, totalAssigned: 3000 },
];

const mockSegments: CodeSegment[] = [
  { id: '1', name: '基础防伪码段-A', totalCount: 10000, usedCount: 3520, status: 'allocated' },
  { id: '2', name: '高级防伪码段-B', totalCount: 10000, usedCount: 0, status: 'available' },
  { id: '3', name: '至尊防伪码段-C', totalCount: 5000, usedCount: 5000, status: 'exhausted' },
];

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export default function CodeUsageStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [segments, setSegments] = useState<CodeSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  // 加载数据
  const fetchData = async () => {
    setLoading(true);
    try {
      // 获取码段数据
      const segmentsRes = await fetch('/api/enterprise/blockchain/codes');
      const segmentsData = await segmentsRes.json();

      if (segmentsData.success) {
        setSegments(segmentsData.data);

        // 计算统计数据
        const totalCodes = segmentsData.data.reduce((sum: number, s: CodeSegment) => sum + s.totalCount, 0);
        const usedCodes = segmentsData.data.reduce((sum: number, s: CodeSegment) => sum + s.usedCount, 0);
        const merchants = new Set(segmentsData.data.filter((s: CodeSegment) => s.merchantId).map((s: CodeSegment) => s.merchantId));

        setStats({
          totalSegments: segmentsData.data.length,
          totalCodes,
          usedCodes,
          availableCodes: totalCodes - usedCodes,
          totalMerchants: merchants.size,
          usageRate: totalCodes > 0 ? Math.round((usedCodes / totalCodes) * 100) : 0,
          dailyStats: mockDailyStats,
          merchantUsage: mockMerchantUsage,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  // 饼图数据
  const pieData = stats ? [
    { name: '已使用', value: stats.usedCodes, color: '#8b5cf6' },
    { name: '可用', value: stats.availableCodes, color: '#10b981' },
    { name: '已用完', value: segments.filter(s => s.status === 'exhausted').reduce((sum, s) => sum + s.usedCount, 0), color: '#ef4444' },
  ] : [];

  // 柱状图数据 - 码段使用量
  const segmentBarData = segments.map(s => ({
    name: s.name.length > 8 ? `${s.name.substring(0, 8)  }...` : s.name,
    已使用: s.usedCount,
    剩余: s.totalCount - s.usedCount,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  码段使用统计
                </h1>
                <p className="text-gray-500 mt-1">
                  查看码段使用量、剩余量及趋势图表
                </p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={timeRange === '7d' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTimeRange('7d')}
                  >
                    7天
                  </Button>
                  <Button
                    variant={timeRange === '30d' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTimeRange('30d')}
                  >
                    30天
                  </Button>
                  <Button
                    variant={timeRange === '90d' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTimeRange('90d')}
                  >
                    90天
                  </Button>
                </div>
                <Button variant="outline" onClick={fetchData} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  导出
                </Button>
              </div>
            </div>

            {loading && !stats ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* 核心指标卡片 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100">总码号数</p>
                          <p className="text-3xl font-bold">{stats.totalCodes.toLocaleString()}</p>
                          <p className="text-purple-100 text-sm mt-1">
                            {stats.totalSegments} 个码段
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <QrCode className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100">已使用</p>
                          <p className="text-3xl font-bold">{stats.usedCodes.toLocaleString()}</p>
                          <p className="text-green-100 text-sm mt-1 flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            占比 {stats.usageRate}%
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100">可用</p>
                          <p className="text-3xl font-bold">{stats.availableCodes.toLocaleString()}</p>
                          <p className="text-blue-100 text-sm mt-1 flex items-center">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            占比 {100 - stats.usageRate}%
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <Database className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100">活跃商户</p>
                          <p className="text-3xl font-bold">{stats.totalMerchants}</p>
                          <p className="text-orange-100 text-sm mt-1">
                            使用中
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <Users className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 图表区域 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 使用趋势图 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        使用趋势
                      </CardTitle>
                      <CardDescription>
                        近{timeRange === '7d' ? '7天' : timeRange === '30d' ? '30天' : '90天'}码号使用与创建趋势
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={stats.dailyStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                              contentStyle={{
                                background: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px'
                              }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="used"
                              name="使用量"
                              stroke="#8b5cf6"
                              strokeWidth={2}
                              dot={{ fill: '#8b5cf6', r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="created"
                              name="创建量"
                              stroke="#10b981"
                              strokeWidth={2}
                              dot={{ fill: '#10b981', r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 使用分布饼图 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-purple-600" />
                        使用分布
                      </CardTitle>
                      <CardDescription>
                        码号使用状态分布
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 码段使用量柱状图 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      各码段使用情况
                    </CardTitle>
                    <CardDescription>
                      各码段已使用与剩余码号对比
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={segmentBarData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" tick={{ fontSize: 12 }} />
                          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              background: '#fff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                          <Bar dataKey="已使用" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                          <Bar dataKey="剩余" fill="#e5e7eb" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* 商户使用排行 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      商户使用排行
                    </CardTitle>
                    <CardDescription>
                      各商户码号使用量排名
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.merchantUsage
                        .sort((a, b) => b.usedCount - a.usedCount)
                        .map((merchant, index) => (
                          <div key={merchant.merchantId} className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{merchant.merchantName}</span>
                                <span className="text-sm text-gray-500">
                                  {merchant.usedCount.toLocaleString()} / {merchant.totalAssigned.toLocaleString()}
                                </span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-purple-500 rounded-full"
                                  style={{
                                    width: `${(merchant.usedCount / merchant.totalAssigned) * 100}%`
                                  }}
                                />
                              </div>
                            </div>
                            <div className="w-16 text-right">
                              <Badge variant={merchant.usedCount === merchant.totalAssigned ? 'destructive' : 'default'}>
                                {Math.round((merchant.usedCount / merchant.totalAssigned) * 100)}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
