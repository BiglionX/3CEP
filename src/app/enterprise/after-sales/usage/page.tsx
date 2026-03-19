'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  RefreshCw,
  TrendingUp,
  Activity,
  CheckCircle,
  Eye,
  Download,
  Search,
  Loader2,
  Hash,
  Package,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

interface DailyUsage {
  date: string;
  scanned: number;
  verified: number;
  bound: number;
}

interface UsageStats {
  totalCodes: number;
  usedCodes: number;
  availableCodes: number;
  totalScans: number;
  totalVerifications: number;
  activeToday: number;
}

interface RecentActivity {
  id: string;
  type: 'scan' | 'verify' | 'bind';
  code: string;
  productName: string;
  time: string;
  location?: string;
}

// 模拟数据
const mockDailyUsage: DailyUsage[] = [
  { date: '03-12', scanned: 45, verified: 38, bound: 12 },
  { date: '03-13', scanned: 52, verified: 45, bound: 8 },
  { date: '03-14', scanned: 38, verified: 32, bound: 15 },
  { date: '03-15', scanned: 65, verified: 58, bound: 20 },
  { date: '03-16', scanned: 78, verified: 70, bound: 18 },
  { date: '03-17', scanned: 55, verified: 48, bound: 10 },
  { date: '03-18', scanned: 42, verified: 36, bound: 5 },
];

const mockRecentActivity: RecentActivity[] = [
  { id: '1', type: 'scan', code: 'BC00001001', productName: '智能产品A', time: '2024-03-18 14:30:00', location: '北京' },
  { id: '2', type: 'verify', code: 'BC00001002', productName: '智能产品B', time: '2024-03-18 14:25:00', location: '上海' },
  { id: '3', type: 'bind', code: 'BC00001003', productName: '智能产品C', time: '2024-03-18 14:20:00' },
  { id: '4', type: 'scan', code: 'BC00001004', productName: '智能产品D', time: '2024-03-18 14:15:00', location: '广州' },
  { id: '5', type: 'verify', code: 'BC00001005', productName: '智能产品E', time: '2024-03-18 14:10:00', location: '深圳' },
  { id: '6', type: 'scan', code: 'BC00001001', productName: '智能产品A', time: '2024-03-18 14:05:00', location: '杭州' },
  { id: '7', type: 'verify', code: 'BC00001002', productName: '智能产品B', time: '2024-03-18 14:00:00', location: '成都' },
];

export default function UsageStatsPage() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');

  // 加载数据
  const fetchData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      setStats({
        totalCodes: 10000,
        usedCodes: 3520,
        availableCodes: 6480,
        totalScans: 15842,
        totalVerifications: 12456,
        activeToday: 42,
      });

      setDailyUsage(mockDailyUsage);
      setRecentActivity(mockRecentActivity);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  // 计算使用率
  const usageRate = stats ? Math.round((stats.usedCodes / stats.totalCodes) * 100) : 0;

  // 过滤活动记录
  const filteredActivity = recentActivity.filter(a =>
    a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'scan':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'verify':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'bind':
        return <Hash className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'scan':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">扫码</Badge>;
      case 'verify':
        return <Badge variant="outline" className="bg-green-50 text-green-700">验证</Badge>;
      case 'bind':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">绑定</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  区块链码使用情况
                </h1>
                <p className="text-gray-500 mt-1">
                  查看您的区块链码使用统计和分析
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
                {/* 核心指标 */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                  <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="pt-4">
                      <p className="text-purple-100 text-sm">总码数</p>
                      <p className="text-2xl font-bold">{stats.totalCodes.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="pt-4">
                      <p className="text-blue-100 text-sm">已使用</p>
                      <p className="text-2xl font-bold">{stats.usedCodes.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="pt-4">
                      <p className="text-green-100 text-sm">可用</p>
                      <p className="text-2xl font-bold">{stats.availableCodes.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardContent className="pt-4">
                      <p className="text-orange-100 text-sm">总扫码</p>
                      <p className="text-2xl font-bold">{stats.totalScans.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                    <CardContent className="pt-4">
                      <p className="text-cyan-100 text-sm">总验证</p>
                      <p className="text-2xl font-bold">{stats.totalVerifications.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                    <CardContent className="pt-4">
                      <p className="text-pink-100 text-sm">今日活跃</p>
                      <p className="text-2xl font-bold">{stats.activeToday}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* 使用率进度条 */}
                <Card>
                  <CardHeader>
                    <CardTitle>码号使用率</CardTitle>
                    <CardDescription>
                      已使用 {stats.usedCodes.toLocaleString()} / {stats.totalCodes.toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${usageRate}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-500">
                      <span>使用率: {usageRate}%</span>
                      <span>剩余: {100 - usageRate}%</span>
                    </div>
                  </CardContent>
                </Card>

                {/* 图表区域 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 扫码验证趋势 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        扫码验证趋势
                      </CardTitle>
                      <CardDescription>
                        每日扫码和验证次数
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={dailyUsage}>
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
                              dataKey="scanned"
                              name="扫码"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              dot={{ fill: '#3b82f6', r: 4 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="verified"
                              name="验证"
                              stroke="#10b981"
                              strokeWidth={2}
                              dot={{ fill: '#10b981', r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 绑定趋势 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Hash className="h-5 w-5 text-purple-600" />
                        码号绑定趋势
                      </CardTitle>
                      <CardDescription>
                        每日新增绑定数量
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dailyUsage}>
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
                            <Bar
                              dataKey="bound"
                              name="绑定"
                              fill="#8b5cf6"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 最近活动 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-purple-600" />
                        最近活动
                      </CardTitle>
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="搜索码号或产品..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredActivity.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              {getActivityIcon(activity.type)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-medium">{activity.code}</span>
                                {getActivityBadge(activity.type)}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Package className="h-3 w-3 text-gray-400" />
                                <span className="text-sm text-gray-500">{activity.productName}</span>
                                {activity.location && (
                                  <>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-sm text-gray-500">{activity.location}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                      {filteredActivity.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          暂无活动记录
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </div>
        </main>
      </div>
  );
}
