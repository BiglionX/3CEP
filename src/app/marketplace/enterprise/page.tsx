/**
 * 企业订阅管理页面
 * FixCycle 6.0 智能体市场平台 - 企业级订阅系统
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building,
  Users,
  BarChart3,
  CreditCard,
  Settings,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingDown,
  Search,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';

interface EnterpriseSubscription {
  id: string;
  name: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  member_count: number;
  max_members: number;
  token_budget: number;
  used_tokens: number;
  remaining_tokens: number;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  teams: Team[];
  usage_stats: UsageStats;
}

interface Team {
  id: string;
  name: string;
  members: number;
  assigned_agents: string[];
  usage: number;
  budget: number;
}

interface UsageStats {
  daily_usage: number[];
  monthly_total: number;
  peak_usage_day: string;
  average_daily_usage: number;
  forecast_next_month: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  joined_date: string;
  last_active: string;
  assigned_agents: string[];
}

export default function EnterprisePage() {
  const router = useRouter();
  const [subscription, setSubscription] =
    useState<EnterpriseSubscription | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [_showTeamModal, _setShowTeamModal] = useState(false);
  const [_showMemberModal, _setShowMemberModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 模拟企业订阅数据
  const mockSubscription: EnterpriseSubscription = {
    id: 'sub-enterprise-001',
    name: '企业智能体订阅',
    plan: 'enterprise',
    status: 'active',
    member_count: 25,
    max_members: 50,
    token_budget: 10000,
    used_tokens: 6247,
    remaining_tokens: 3753,
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    auto_renew: true,
    usage_stats: {
      daily_usage: [120, 156, 98, 203, 178, 245, 189],
      monthly_total: 6247,
      peak_usage_day: '2026-02-28',
      average_daily_usage: 208,
      forecast_next_month: 6872,
    },
    teams: [
      {
        id: 'team-sales',
        name: '销售团队',
        members: 8,
        assigned_agents: ['agent-1', 'agent-4'],
        usage: 2156,
        budget: 3000,
      },
      {
        id: 'team-procurement',
        name: '采购团队',
        members: 6,
        assigned_agents: ['agent-2'],
        usage: 1847,
        budget: 2500,
      },
      {
        id: 'team-support',
        name: '客服团队',
        members: 11,
        assigned_agents: ['agent-3', 'agent-5'],
        usage: 2244,
        budget: 4500,
      },
    ],
  };

  // 模拟团队成员数据
  const mockMembers: TeamMember[] = [
    {
      id: 'member-1',
      name: '张经理',
      email: 'zhang.manager@company.com',
      role: 'admin',
      joined_date: '2026-01-15',
      last_active: '2026-03-01T14:30:00Z',
      assigned_agents: ['agent-1', 'agent-2'],
    },
    {
      id: 'member-2',
      name: '李主管',
      email: 'li.supervisor@company.com',
      role: 'member',
      joined_date: '2026-01-20',
      last_active: '2026-03-01T11:15:00Z',
      assigned_agents: ['agent-3'],
    },
    {
      id: 'member-3',
      name: '王专员',
      email: 'wang.specialist@company.com',
      role: 'member',
      joined_date: '2026-02-01',
      last_active: '2026-03-01T09:45:00Z',
      assigned_agents: ['agent-1', 'agent-4'],
    },
  ];

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setSubscription(mockSubscription);
      setTeams(mockSubscription.teams);
      setMembers(mockMembers);
      setIsLoading(false);
    }, 800);
  }, []);

  const getPlanConfig = (plan: string) => {
    const configs: Record<
      string,
      { name: string; color: string; price: string }
    > = {
      starter: {
        name: '入门版',
        color: 'bg-blue-100 text-blue-800',
        price: '¥999/年',
      },
      professional: {
        name: '专业版',
        color: 'bg-purple-100 text-purple-800',
        price: '¥2999/年',
      },
      enterprise: {
        name: '企业版',
        color: 'bg-green-100 text-green-800',
        price: '¥9999/年',
      },
    };
    return configs[plan] || configs.starter;
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<
      string,
      { icon: React.ReactNode; color: string; text: string }
    > = {
      active: {
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'text-green-600',
        text: '活跃',
      },
      pending: {
        icon: <AlertTriangle className="w-4 h-4" />,
        color: 'text-yellow-600',
        text: '待激活',
      },
      expired: {
        icon: <XCircle className="w-4 h-4" />,
        color: 'text-red-600',
        text: '已过期',
      },
      cancelled: {
        icon: <XCircle className="w-4 h-4" />,
        color: 'text-gray-600',
        text: '已取消',
      },
    };
    return configs[status] || configs.pending;
  };

  const filteredMembers = members.filter(
    member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  const formatPercentage = (value: number, total: number) => {
    return total > 0  ((value / total) * 100).toFixed(1) : '0';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载企业订阅数据中...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            未找到企业订阅
          </h2>
          <p className="text-gray-600 mb-6">您的企业尚未订阅智能体服务</p>
          <button
            onClick={() => router.push('/marketplace')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            浏览订阅套餐
          </button>
        </div>
      </div>
    );
  }

  const planConfig = getPlanConfig(subscription.plan);
  const statusConfig = getStatusConfig(subscription.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/marketplace')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Building className="w-5 h-5 mr-2" />
            返回市场
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Building className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">企业订阅管理</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${planConfig.color}`}
            >
              {planConfig.name}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}
            >
              {statusConfig.icon}
              <span className="ml-1">{statusConfig.text}</span>
            </span>
          </div>
        </div>

        {/* 订阅概览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">成员数量</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscription.member_count}/{subscription.max_members}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${(subscription.member_count / subscription.max_members) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Token使用量</p>
                <p className="text-2xl font-bold text-purple-600">
                  {subscription.used_tokens}/{subscription.token_budget}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{
                  width: `${(subscription.used_tokens / subscription.token_budget) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">剩余Token</p>
                <p className="text-2xl font-bold text-green-600">
                  {subscription.remaining_tokens}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              预计可用{' '}
              {(
                subscription.remaining_tokens /
                subscription.usage_stats.average_daily_usage
              ).toFixed(1)}{' '}
              天
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">订阅周期</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatDate(subscription.start_date)}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-indigo-500" />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              到期: {formatDate(subscription.end_date)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧 - 团队管理 */}
          <div className="lg:col-span-2">
            {/* 标签页导航 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: '概览', icon: BarChart3 },
                    { id: 'teams', label: '团队管理', icon: Users },
                    { id: 'members', label: '成员管理', icon: Users },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                        activeTab === tab.id
                           'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* 标签页内容 */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      使用统计
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">
                          团队使用情况
                        </h4>
                        <div className="space-y-3">
                          {teams.map(team => (
                            <div
                              key={team.id}
                              className="flex items-center justify-between"
                            >
                              <span className="text-gray-700">{team.name}</span>
                              <div className="text-right">
                                <div className="font-medium text-gray-900">
                                  {team.usage} Tokens
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatPercentage(
                                    team.usage,
                                    subscription.used_tokens
                                  )}
                                  % of total
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">
                          预算使用情况
                        </h4>
                        <div className="space-y-3">
                          {teams.map(team => (
                            <div
                              key={team.id}
                              className="flex items-center justify-between"
                            >
                              <span className="text-gray-700">{team.name}</span>
                              <div className="text-right">
                                <div className="font-medium text-gray-900">
                                  {formatCurrency(team.budget)}
                                </div>
                                <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                      width: `${(team.usage / team.budget) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'teams' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        团队列表
                      </h3>
                      <button
                        onClick={() => _setShowTeamModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>新建团队</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {teams.map(team => (
                        <div
                          key={team.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {team.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {team.members} 名成员
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {team.assigned_agents.map((agent, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                                  >
                                    {agent}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900">
                                {team.usage} Tokens
                              </div>
                              <div className="flex space-x-2 mt-2">
                                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'members' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        成员列表
                      </h3>
                      <div className="flex space-x-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="搜索成员..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <button
                          onClick={() => _setShowMemberModal(true)}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>添加成员</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {filteredMembers.map(member => (
                        <div
                          key={member.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 font-medium">
                                  {member.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {member.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {member.email}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {member.assigned_agents.map(
                                    (agent, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                                      >
                                        {agent}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  member.role === 'admin'
                                     'bg-red-100 text-red-800'
                                    : member.role === 'member'
                                       'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {member.role === 'admin'
                                   '管理员'
                                  : member.role === 'member'
                                     '成员'
                                    : '查看者'}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                最后活跃{' '}
                                {new Date(
                                  member.last_active
                                ).toLocaleDateString('zh-CN')}
                              </p>
                              <div className="flex space-x-2 mt-2">
                                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧 - 订阅详情和设置 */}
          <div className="space-y-6">
            {/* 订阅详情 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                订阅详情
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">套餐类型</span>
                  <span className="font-medium">{planConfig.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">月费</span>
                  <span className="font-medium">{planConfig.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">自动续费</span>
                  <span
                    className={`font-medium ${subscription.auto_renew  'text-green-600' : 'text-gray-600'}`}
                  >
                    {subscription.auto_renew  '开启' : '关闭'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">创建时间</span>
                  <span className="font-medium">
                    {formatDate(subscription.start_date)}
                  </span>
                </div>
              </div>

              <button className="w-full mt-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                管理订阅
              </button>
            </div>

            {/* 预算警告 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">预算提醒</p>
                  <p>当前Token使用量已达到预算的62%，请注意控制使用量</p>
                </div>
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">快捷操作</h3>

              <div className="space-y-3">
                <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3">
                  <Settings className="w-5 h-5" />
                  <span>订阅设置</span>
                </button>
                <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5" />
                  <span>详细报表</span>
                </button>
                <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3">
                  <CreditCard className="w-5 h-5" />
                  <span>账单管理</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
