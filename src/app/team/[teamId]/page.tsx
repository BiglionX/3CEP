'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Play,
  Pause,
  Edit,
  Trash2,
  Plus,
  Users,
  Settings,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
} from 'lucide-react';

interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  activeOrchestrations: number;
  createdAt: string;
  status: 'active' | 'archived';
}

interface Orchestration {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  triggerType: 'manual' | 'scheduled' | 'event';
  lastExecutedAt: string;
  executionCount: number;
  successRate: number;
}

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [orchestrations, setOrchestrations] = useState<Orchestration[]>([]);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'orchestrations' | 'members' | 'settings'
  >('dashboard');
  const [loading, setLoading] = useState(true);

  // 模拟团队数据
  const mockTeam: Team = {
    id: teamId,
    name: '销售智能体团队',
    description: '负责客户服务和销售转化的智能体团队',
    memberCount: 5,
    activeOrchestrations: 3,
    createdAt: '2026-02-15',
    status: 'active',
  };

  // 模拟编排数据
  const mockOrchestrations: Orchestration[] = [
    {
      id: 'orch-1',
      name: '客户接待流程',
      description: '自动接待新客户并收集基本信息',
      status: 'active',
      triggerType: 'event',
      lastExecutedAt: '2026-03-01T10:30:00Z',
      executionCount: 127,
      successRate: 98.4,
    },
    {
      id: 'orch-2',
      name: '销售跟进自动化',
      description: '定期跟进潜在客户并发送个性化内容',
      status: 'active',
      triggerType: 'scheduled',
      lastExecutedAt: '2026-03-01T09:15:00Z',
      executionCount: 89,
      successRate: 96.7,
    },
    {
      id: 'orch-3',
      name: '订单处理流程',
      description: '自动化处理客户订单和付款确认',
      status: 'paused',
      triggerType: 'manual',
      executionCount: 45,
      successRate: 92.3,
    },
  ];

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setTeam(mockTeam);
      setOrchestrations(mockOrchestrations);
      setLoading(false);
    }, 500);
  }, [teamId]);

  const handleBack = () => {
    router.push('/team');
  };

  const handleCreateOrchestration = () => {
    router.push(`/team/${teamId}/orchestrations/create`);
  };

  const handleEditOrchestration = (orchestrationId: string) => {
    router.push(`/team/${teamId}/orchestrations/${orchestrationId}/edit`);
  };

  const handleExecuteOrchestration = (orchestrationId: string) => {
    // 模拟执行编排
    alert(`执行编排: ${orchestrationId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'manual':
        return '🖱️';
      case 'scheduled':
        return '⏰';
      case 'event':
        return '⚡';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载团队详情中...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            团队不存在
          </h2>
          <p className="text-gray-600 mb-6">找不到指定的团队</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回团队列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center mb-4">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回团队列表
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
              <p className="text-gray-600 mt-1">{team.description}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(team.status)}`}
              >
                {team.status === 'active'  '活跃' : '已归档'}
              </span>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 导航标签页 */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {(
                [
                  { id: 'dashboard', label: '仪表板', icon: Activity },
                  { id: 'orchestrations', label: '智能体编排', icon: Play },
                  { id: 'members', label: '成员管理', icon: Users },
                  { id: 'settings', label: '设置', icon: Settings },
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                       'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 仪表板视图 */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        团队成员
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {team.memberCount}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Play className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        活跃编排
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {team.activeOrchestrations}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        总执行次数
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {orchestrations.reduce(
                          (sum, o) => sum + o.executionCount,
                          0
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        平均成功率
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {orchestrations.length > 0
                           (
                              orchestrations.reduce(
                                (sum, o) => sum + o.successRate,
                                0
                              ) / orchestrations.length
                            ).toFixed(1)
                          : '0.0'}
                        %
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* 最近编排活动 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    最近编排活动
                  </h2>
                  <button
                    onClick={handleCreateOrchestration}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    新建编排
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {orchestrations.slice(0, 5).map(orchestration => (
                  <div key={orchestration.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">
                          {getTriggerIcon(orchestration.triggerType)}
                        </span>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {orchestration.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {orchestration.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {orchestration.successRate}%
                          </div>
                          <div className="text-xs text-gray-500">成功率</div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(orchestration.status)}`}
                        >
                          {orchestration.status}
                        </span>
                        <button
                          onClick={() =>
                            handleExecuteOrchestration(orchestration.id)
                          }
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 编排管理视图 */}
        {activeTab === 'orchestrations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                智能体编排
              </h2>
              <button
                onClick={handleCreateOrchestration}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                新建编排
              </button>
            </div>

            {orchestrations.length === 0  (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  暂无编排
                </h3>
                <p className="text-gray-600 mb-6">您还没有创建任何智能体编排</p>
                <button
                  onClick={handleCreateOrchestration}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  创建第一个编排
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {orchestrations.map(orchestration => (
                  <div
                    key={orchestration.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="text-xl mr-2">
                              {getTriggerIcon(orchestration.triggerType)}
                            </span>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {orchestration.name}
                            </h3>
                            <span
                              className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(orchestration.status)}`}
                            >
                              {orchestration.status}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-4">
                            {orchestration.description}
                          </p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>

                      {/* 编排统计 */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {orchestration.executionCount}
                          </div>
                          <div className="text-xs text-gray-500">执行次数</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {orchestration.successRate}%
                          </div>
                          <div className="text-xs text-gray-500">成功率</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">
                            {orchestration.lastExecutedAt
                               new Date(
                                  orchestration.lastExecutedAt
                                ).toLocaleDateString()
                              : '从未执行'}
                          </div>
                          <div className="text-xs text-gray-500">上次执行</div>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleExecuteOrchestration(orchestration.id)
                            }
                            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            执行
                          </button>
                          <button
                            onClick={() =>
                              handleEditOrchestration(orchestration.id)
                            }
                            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            编辑
                          </button>
                        </div>
                        <button className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 成员管理视图 */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              成员管理
            </h2>
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                成员管理功能即将推出
              </h3>
              <p className="text-gray-600">正在开发中，请稍候...</p>
            </div>
          </div>
        )}

        {/* 设置视图 */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              团队设置
            </h2>
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                团队设置功能即将推出
              </h3>
              <p className="text-gray-600">正在开发中，请稍候...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
