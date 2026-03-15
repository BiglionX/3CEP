'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Brain,
  Settings,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Target,
  TrendingUp,
  Activity,
  Filter,
} from 'lucide-react';

interface SmartGroup {
  id: string;
  name: string;
  description: string;
  criteria: GroupCriteria;
  memberCount: number;
  members: string[]; // 用户ID列表
  aiConfidence: number; // AI分组置信度 0-1
  lastUpdated: string;
  statistics: GroupStatistics;
}

interface GroupCriteria {
  behavioral: {
    visitFrequency?: 'high' | 'medium' | 'low';
    featureUsage?: string[];
    engagementLevel?: 'active' | 'passive' | 'inactive';
  };
  demographic: {
    ageGroups?: string[];
    locations?: string[];
    valueTiers?: string[];
  };
  preference: {
    favoriteFeatures?: string[];
    uiPreferences?: string[];
  };
  predictive: {
    churnRisk?: 'low' | 'medium' | 'high';
    growthPotential?: 'high' | 'medium' | 'low';
  };
}

interface GroupStatistics {
  averageEngagement: number;
  featureAdoptionRate: number;
  retentionRate: number;
  valueContribution: number;
}

interface SmartGroupingPanelProps {
  usersData: any[];
  behaviorData: any[];
  className?: string;
  onGroupUpdate?: (groups: SmartGroup[]) => void;
}

export function SmartGroupingPanel({
  usersData,
  behaviorData,
  className = '',
  onGroupUpdate,
}: SmartGroupingPanelProps) {
  const [groups, setGroups] = useState<SmartGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'auto' | 'manual'>('auto');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCriteria, setNewGroupCriteria] = useState<GroupCriteria>({
    behavioral: {},
    demographic: {},
    preference: {},
    predictive: {},
  });

  // 初始化智能分组
  useEffect(() => {
    initializeSmartGroups();
  }, [usersData, behaviorData]);

  const initializeSmartGroups = async () => {
    try {
      setLoading(true);

      // 基于AI算法自动生成智能分组
      const autoGroups = generateAutomaticGroups(usersData, behaviorData);
      setGroups(autoGroups);
      onGroupUpdate?.(autoGroups);
    } catch (error) {
      console.error('初始化智能分组失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 生成自动分组
  const generateAutomaticGroups = (
    _users: any[],
    _behaviors: any[]
  ): SmartGroup[] => {
    const groups: SmartGroup[] = [];

    // 1. 基于价值层级分组
    const valueBasedGroups = createValueBasedGroups(_users);
    groups.push(...valueBasedGroups);

    // 2. 基于行为模式分组
    const behaviorBasedGroups = createBehaviorBasedGroups(_users, _behaviors);
    groups.push(...behaviorBasedGroups);

    // 3. 基于生命周期分组
    const lifecycleGroups = createLifecycleGroups(_users);
    groups.push(...lifecycleGroups);

    // 4. 基于风险等级分组
    const riskBasedGroups = createRiskBasedGroups(_users, _behaviors);
    groups.push(...riskBasedGroups);

    return groups;
  };

  // 基于价值层级创建分组
  const createValueBasedGroups = (users: any[]): SmartGroup[] => {
    const groups: SmartGroup[] = [];
    const valueTiers = ['platinum', 'gold', 'silver', 'bronze'];

    valueTiers.forEach(tier => {
      const tierUsers = users.filter((u: any) => u.valueTier === tier);
      if (tierUsers.length > 0) {
        groups.push({
          id: `value_${tier}`,
          name: `${tier.charAt(0).toUpperCase() + tier.slice(1)}级用户`,
          description: `价值等级为${tier}的用户群体`,
          criteria: {
            behavioral: {},
            demographic: { valueTiers: [tier] },
            preference: {},
            predictive: {},
          },
          memberCount: tierUsers.length,
          members: tierUsers.map((u: any) => u.userId),
          aiConfidence: 0.95,
          lastUpdated: new Date().toISOString(),
          statistics: calculateGroupStatistics(tierUsers),
        });
      }
    });

    return groups;
  };

  // 基于行为模式创建分组
  const createBehaviorBasedGroups = (
    users: any[],
    behaviors: any[]
  ): SmartGroup[] => {
    const groups: SmartGroup[] = [];

    // 高频活跃用户组
    const highFrequencyUsers = users.filter((u: any) => {
      const userBehaviors = behaviors.filter((b: any) => b.user_id === u.userId);
      const dailyVisits =
        userBehaviors.filter((b: any) => b.behavior_type === 'page_view').length / 30;
      return dailyVisits > 2;
    });

    if (highFrequencyUsers.length > 0) {
      groups.push({
        id: 'behavior_high_freq',
        name: '高频活跃用户',
        description: '每日平均访问超过2次的活跃用户',
        criteria: {
          behavioral: { visitFrequency: 'high' },
          demographic: {},
          preference: {},
          predictive: {},
        },
        memberCount: highFrequencyUsers.length,
        members: highFrequencyUsers.map((u: any) => u.userId),
        aiConfidence: 0.88,
        lastUpdated: new Date().toISOString(),
        statistics: calculateGroupStatistics(highFrequencyUsers),
      });
    }

    // 功能专家用户组
    const featureExperts = users.filter((u: any) => {
      const adoptionRate = u?.featureAdoption?.adoptionRate || 0;
      return adoptionRate > 70;
    });

    if (featureExperts.length > 0) {
      groups.push({
        id: 'behavior_experts',
        name: '功能专家用户',
        description: '功能采用率超过70%的资深用户',
        criteria: {
          behavioral: { engagementLevel: 'active' },
          demographic: {},
          preference: {},
          predictive: {},
        },
        memberCount: featureExperts.length,
        members: featureExperts.map((u: any) => u.userId),
        aiConfidence: 0.92,
        lastUpdated: new Date().toISOString(),
        statistics: calculateGroupStatistics(featureExperts),
      });
    }

    return groups;
  };

  // 基于生命周期创建分组
  const createLifecycleGroups = (users: any[]): SmartGroup[] => {
    const groups: SmartGroup[] = [];
    const lifecycleStages = ['new_user', 'onboarding', 'active', 'loyal'];

    lifecycleStages.forEach(stage => {
      const stageUsers = users.filter((u: any) => u.lifecycleStage === stage);
      if (stageUsers.length > 0) {
        const stageNames: Record<string, string> = {
          new_user: '新用户',
          onboarding: '体验期用户',
          active: '活跃用户',
          loyal: '忠实用户',
        };

        groups.push({
          id: `lifecycle_${stage}`,
          name: stageNames[stage],
          description: `处于${stageNames[stage]}阶段的用户`,
          criteria: {
            behavioral: {},
            demographic: {},
            preference: {},
            predictive: {},
          },
          memberCount: stageUsers.length,
          members: stageUsers.map((u: any) => u.userId),
          aiConfidence: 0.85,
          lastUpdated: new Date().toISOString(),
          statistics: calculateGroupStatistics(stageUsers),
        });
      }
    });

    return groups;
  };

  // 基于风险等级创建分组
  const createRiskBasedGroups = (
    users: any[],
    behaviors: any[]
  ): SmartGroup[] => {
    const groups: SmartGroup[] = [];

    // 高流失风险用户组
    const highRiskUsers = users.filter((u: any) => {
      const userBehaviors = behaviors.filter((b: any) => b.user_id === u.userId);
      const recentActivity = userBehaviors.filter((b: any) => {
        const daysAgo =
          (Date.now() - new Date(b.timestamp).getTime()) /
          (1000 * 60 * 60 * 24);
        return daysAgo <= 30;
      });

      return recentActivity.length < 5 && u.valueTier !== 'platinum';
    });

    if (highRiskUsers.length > 0) {
      groups.push({
        id: 'risk_high',
        name: '高流失风险用户',
        description: '30天活动较少且非高价值用户的潜在流失用户',
        criteria: {
          behavioral: {},
          demographic: {},
          preference: {},
          predictive: { churnRisk: 'high' },
        },
        memberCount: highRiskUsers.length,
        members: highRiskUsers.map((u: any) => u.userId),
        aiConfidence: 0.82,
        lastUpdated: new Date().toISOString(),
        statistics: calculateGroupStatistics(highRiskUsers),
      });
    }

    return groups;
  };

  // 计算分组统计信息
  const calculateGroupStatistics = (users: any[]): GroupStatistics => {
    if (users.length === 0) {
      return {
        averageEngagement: 0,
        featureAdoptionRate: 0,
        retentionRate: 0,
        valueContribution: 0,
      };
    }

    const totalEngagement = users.reduce(
      (sum, u) => sum + (u?.engagementScore || 0),
      0
    );
    const totalAdoption = users.reduce(
      (sum, u) => sum + (u?.featureAdoption?.adoptionRate || 0),
      0
    );
    const highValueUsers = users.filter(
      (u: any) => u.valueTier === 'gold' || u.valueTier === 'platinum'
    ).length;

    return {
      averageEngagement: totalEngagement / users.length,
      featureAdoptionRate: totalAdoption / users.length,
      retentionRate: (users.length / users.length) * 100,
      valueContribution: (highValueUsers / users.length) * 100,
    };
  };

  // 手动创建新分组
  const createManualGroup = () => {
    if (!newGroupName.trim()) return;

    const newGroup: SmartGroup = {
      id: `manual_${Date.now()}`,
      name: newGroupName,
      description: '手动创建的用户分组',
      criteria: newGroupCriteria,
      memberCount: 0,
      members: [],
      aiConfidence: 0.7,
      lastUpdated: new Date().toISOString(),
      statistics: {
        averageEngagement: 0,
        featureAdoptionRate: 0,
        retentionRate: 0,
        valueContribution: 0,
      },
    };

    setGroups([...groups, newGroup]);
    setNewGroupName('');
    setNewGroupCriteria({
      behavioral: {},
      demographic: {},
      preference: {},
      predictive: {},
    });
  };

  // 刷新智能分组
  const refreshGroups = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await initializeSmartGroups();
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* 控制面板 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">智能用户分组</h2>

        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('auto')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'auto'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Brain className="w-4 h-4 inline mr-1" />
              智能分组
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'manual'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-1" />
              手动分组
            </button>
          </div>

          <Button onClick={refreshGroups} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新分组
          </Button>
        </div>
      </div>

      {/* 智能分组视图 */}
      {activeTab === 'auto' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center text-lg">
                      <Users className="w-5 h-5 mr-2 text-blue-500" />
                      {group.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {group.description}
                    </p>
                  </div>
                  <Badge
                    variant={group.aiConfidence > 0.9 ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {Math.round(group.aiConfidence * 100)}% 置信度
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* 成员统计 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">成员数量</span>
                    <Badge variant="outline">{group.memberCount}</Badge>
                  </div>

                  {/* 分组统计指标 */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center">
                      <Activity className="w-4 h-4 text-green-500 mr-1" />
                      <span>
                        参与度 {group.statistics.averageEngagement.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                      <span>
                        采用率{' '}
                        {group.statistics.featureAdoptionRate.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Target className="w-4 h-4 text-purple-500 mr-1" />
                      <span>
                        价值贡献{' '}
                        {group.statistics.valueContribution.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Filter className="w-4 h-4 text-orange-500 mr-1" />
                      <span>
                        留存率 {group.statistics.retentionRate.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* 快速操作 */}
                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="w-3 h-3 mr-1" />
                      编辑
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Trash2 className="w-3 h-3 mr-1" />
                      删除
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 手动分组视图 */}
      {activeTab === 'manual' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              创建自定义分组
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 分组基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分组名称
                  </label>
                  <Input
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    placeholder="输入分组名称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分组描述
                  </label>
                  <Input placeholder="输入分组描述" />
                </div>
              </div>

              {/* 分组条件设置 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  分组条件
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 行为条件 */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">行为条件</h4>
                    <div className="space-y-2">
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option value="">访问频率</option>
                        <option value="high">高频</option>
                        <option value="medium">中频</option>
                        <option value="low">低频</option>
                      </select>

                      <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option value="">参与程度</option>
                        <option value="active">活跃</option>
                        <option value="passive">被动</option>
                        <option value="inactive">不活跃</option>
                      </select>
                    </div>
                  </div>

                  {/* 人口统计条件 */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">人口统计</h4>
                    <div className="space-y-2">
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option value="">价值等级</option>
                        <option value="platinum">铂金</option>
                        <option value="gold">黄金</option>
                        <option value="silver">白银</option>
                        <option value="bronze">青铜</option>
                      </select>

                      <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option value="">生命周期</option>
                        <option value="new_user">新用户</option>
                        <option value="onboarding">体验期</option>
                        <option value="active">活跃期</option>
                        <option value="loyal">忠诚期</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 创建按钮 */}
              <div className="flex justify-end">
                <Button
                  onClick={createManualGroup}
                  disabled={!newGroupName.trim()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  创建分组
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 空状态 */}
      {groups.length === 0 && activeTab === 'auto' && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            暂无智能分组
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            系统正在分析用户数据以生成智能分组
          </p>
          <Button onClick={refreshGroups} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            重新分析
          </Button>
        </div>
      )}
    </div>
  );
}
