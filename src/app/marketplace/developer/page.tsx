/**
 * 开发者收益管理页面
 * FixCycle 6.0 智能体市场平台 - 收益分配系统
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Wallet,
  BarChart3,
  Users,
  Calendar,
  Download,
  Search,
  DollarSign,
  PieChart,
  ArrowUpRight,
} from 'lucide-react';

interface DeveloperStats {
  total_earnings: number;
  monthly_earnings: number;
  today_earnings: number;
  total_sales: number;
  active_agents: number;
  average_rating: number;
}

interface EarningRecord {
  id: string;
  agent: {
    id: string;
    name: string;
    category: string;
  };
  amount: number;
  usage_count: number;
  date: string;
  status: 'settled' | 'pending' | 'processing';
}

interface SalesStat {
  period: string;
  earnings: number;
  sales_count: number;
  agent_count: number;
}

export default function DeveloperPage() {
  const router = useRouter();
  const [stats, _setStats] = useState<DeveloperStats>({
    total_earnings: 2847.5,
    monthly_earnings: 632.8,
    today_earnings: 45.2,
    total_sales: 1247,
    active_agents: 8,
    average_rating: 4.7,
  });

  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [salesStats, setSalesStats] = useState<SalesStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [_periodFilter, _setPeriodFilter] = useState('month');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // 模拟收益记录数据
  const mockEarnings: EarningRecord[] = [
    {
      id: 'earn-1',
      agent: {
        id: 'agent-1',
        name: '销售助手智能体',
        category: 'sales',
      },
      amount: 12.5,
      usage_count: 25,
      date: '2026-03-01',
      status: 'settled',
    },
    {
      id: 'earn-2',
      agent: {
        id: 'agent-2',
        name: '采购智能助手',
        category: 'procurement',
      },
      amount: 8.2,
      usage_count: 18,
      date: '2026-03-01',
      status: 'settled',
    },
    {
      id: 'earn-3',
      agent: {
        id: 'agent-3',
        name: '客服支持机器人',
        category: 'support',
      },
      amount: 15.8,
      usage_count: 32,
      date: '2026-02-29',
      status: 'pending',
    },
    {
      id: 'earn-4',
      agent: {
        id: 'agent-1',
        name: '销售助手智能体',
        category: 'sales',
      },
      amount: 9.6,
      usage_count: 19,
      date: '2026-02-29',
      status: 'settled',
    },
  ];

  // 模拟销售统计数据
  const mockSalesStats: SalesStat[] = [
    { period: '2026-02', earnings: 632.8, sales_count: 127, agent_count: 8 },
    { period: '2026-01', earnings: 587.4, sales_count: 112, agent_count: 7 },
    { period: '2025-12', earnings: 498.2, sales_count: 98, agent_count: 6 },
    { period: '2025-11', earnings: 423.6, sales_count: 85, agent_count: 5 },
    { period: '2025-10', earnings: 367.5, sales_count: 72, agent_count: 4 },
    { period: '2025-09', earnings: 312.0, sales_count: 63, agent_count: 3 },
  ];

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setEarnings(mockEarnings);
      setSalesStats(mockSalesStats);
      setIsLoading(false);
    }, 800);
  }, []);

  const filteredEarnings = earnings.filter(
    earning =>
      earning.agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      earning.agent.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; text: string }> = {
      settled: { color: 'bg-green-100 text-green-800', text: '已结算' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: '待结算' },
      processing: { color: 'bg-blue-100 text-blue-800', text: '处理中' },
    };
    return configs[status] || configs.pending;
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('请输入有效的提现金额');
      return;
    }

    if (amount > stats.total_earnings) {
      alert('提现金额不能超过总收益');
      return;
    }

    // 模拟提现处理
    alert(`成功申请提现 ${formatCurrency(amount)}，预计3个工作日到账`);
    setShowWithdrawModal(false);
    setWithdrawAmount('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载开发者数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/marketplace')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowUpRight className="w-5 h-5 mr-2" />
            返回市场
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">开发者收益中心</h1>
          </div>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <DollarSign className="w-5 h-5" />
            <span>申请提现</span>
          </button>
        </div>

        {/* 收益统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总收益</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.total_earnings)}
                </p>
              </div>
              <Wallet className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              <ArrowUpRight className="w-4 h-4 inline mr-1" />
              +12.5% 本月增长
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">本月收益</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.monthly_earnings)}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              <ArrowUpRight className="w-4 h-4 inline mr-1" />
              +8.2% 较上月
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">今日收益</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(stats.today_earnings)}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              来自 {stats.active_agents} 个智能体
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总销量</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {stats.total_sales}
                </p>
              </div>
              <Users className="w-8 h-8 text-indigo-500" />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              平均评分 {stats.average_rating}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧 - 收益记录 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    收益记录
                  </h2>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="搜索智能体..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredEarnings.map(earning => {
                  const statusConfig = getStatusConfig(earning.status);
                  return (
                    <div
                      key={earning.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-3 rounded-full">
                            <BarChart3 className="w-6 h-6 text-blue-600" />
                          </div>

                          <div>
                            <h3 className="font-medium text-gray-900">
                              {earning.agent.name}
                            </h3>
                            <p className="text-gray-600 text-sm capitalize">
                              {earning.agent.category} 类别
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {earning.usage_count} 次使用 •{' '}
                              {formatDate(earning.date)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600">
                            +{formatCurrency(earning.amount)}
                          </div>
                          <div
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${statusConfig.color}`}
                          >
                            {statusConfig.text}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredEarnings.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <BarChart3 className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    暂无收益记录
                  </h3>
                  <p className="text-gray-500">您的收益记录将在这里显示</p>
                </div>
              )}
            </div>
          </div>

          {/* 右侧 - 销售统计和提现 */}
          <div className="space-y-6">
            {/* 销售趋势图表 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                销售趋势
              </h3>

              <div className="space-y-4">
                {salesStats.slice(0, 6).map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {stat.period}
                      </div>
                      <div className="text-sm text-gray-500">
                        {stat.sales_count} 笔销售
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(stat.earnings)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {stat.agent_count} 个智能体
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 提现记录 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <Download className="w-5 h-5 mr-2" />
                最近提现
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>2026-02-28</span>
                  <span className="font-medium text-green-600">+¥1,200.00</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>2026-02-15</span>
                  <span className="font-medium text-green-600">+¥800.00</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>2026-01-31</span>
                  <span className="font-medium text-green-600">+¥1,500.00</span>
                </div>
              </div>

              <button className="w-full mt-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                查看全部记录
              </button>
            </div>

            {/* 收益分析 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                收益分析
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">最受欢迎类别</span>
                  <span className="font-medium">销售类</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">平均单价</span>
                  <span className="font-medium">¥2.28/次</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">转化率</span>
                  <span className="font-medium">87.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">复购率</span>
                  <span className="font-medium">64.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 提现模态框 */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                申请提现
              </h2>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">可提现余额</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.total_earnings)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  提现手续费 2% (最低¥1)
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  提现金额
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ¥
                  </span>
                  <input
                    type="number"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="输入提现金额"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() =>
                      setWithdrawAmount(
                        (stats.total_earnings * 0.25).toString()
                      )
                    }
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    25%
                  </button>
                  <button
                    onClick={() =>
                      setWithdrawAmount((stats.total_earnings * 0.5).toString())
                    }
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    50%
                  </button>
                  <button
                    onClick={() =>
                      setWithdrawAmount(
                        (stats.total_earnings * 0.75).toString()
                      )
                    }
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    75%
                  </button>
                  <button
                    onClick={() =>
                      setWithdrawAmount(stats.total_earnings.toString())
                    }
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    全部
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleWithdraw}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  确认提现
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
