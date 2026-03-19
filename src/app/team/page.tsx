'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Users,
  Settings,
  Activity,
  Search,
  Filter,
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

export default function TeamManagementPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'active' | 'archived'
  >('all');

  // 模拟数据
  const mockTeams: Team[] = [
    {
      id: 'team-1',
      name: '销售智能体团队',
      description: '负责客户服务和销售转化的智能体团队',
      memberCount: 5,
      activeOrchestrations: 3,
      createdAt: '2026-02-15',
      status: 'active',
    },
    {
      id: 'team-2',
      name: '技术支持团队',
      description: '提供技术咨询和支持服务的智能体团队',
      memberCount: 3,
      activeOrchestrations: 2,
      createdAt: '2026-02-20',
      status: 'active',
    },
    {
      id: 'team-3',
      name: '数据分析团队',
      description: '专门处理数据处理和分析任务的智能体团队',
      memberCount: 4,
      activeOrchestrations: 1,
      createdAt: '2026-02-25',
      status: 'archived',
    },
  ];

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setTeams(mockTeams);
      setLoading(false);
    }, 500);
  }, []);

  const filteredTeams = teams.filter(team => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' || team.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleCreateTeam = () => {
    router.push('/team/create');
  };

  const handleViewTeam = (teamId: string) => {
    router.push(`/team/${teamId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载团队数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">团队管理</h1>
              <p className="text-gray-600 mt-1">管理您的智能体团队和协作</p>
            </div>
            <button
              onClick={handleCreateTeam}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              创建团队
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索和筛选栏 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索团队..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* 状态筛选 */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-500 w-5 h-5" />
              <select
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
              >
                <option value="all">全部状态</option>
                <option value="active">活跃</option>
                <option value="archived">已归档</option>
              </select>
            </div>

            {/* 结果统计 */}
            <div className="flex items-center justify-end text-sm text-gray-600">
              共 {filteredTeams.length} 个团队
            </div>
          </div>
        </div>

        {/* 团队列表 */}
        {filteredTeams.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无团队</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all'
                 '没有找到匹配的团队'
                : '您还没有创建任何团队'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={handleCreateTeam}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-colors font-medium"
              >
                创建第一个团队
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map(team => (
              <div
                key={team.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewTeam(team.id)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-2">
                          {team.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            team.status === 'active'
                               'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {team.status === 'active' ? '活跃' : '已归档'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {team.description}
                      </p>
                    </div>
                    <button
                      className="text-gray-400 hover:text-gray-600 p-1"
                      onClick={e => {
                        e.stopPropagation();
                        // TODO: 显示更多操作菜单
                      }}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* 团队统计数据 */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="flex items-center justify-center text-blue-600 mb-1">
                        <Users className="w-5 h-5 mr-1" />
                        <span className="text-2xl font-bold">
                          {team.memberCount}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">成员</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center text-purple-600 mb-1">
                        <Activity className="w-5 h-5 mr-1" />
                        <span className="text-2xl font-bold">
                          {team.activeOrchestrations}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">编排</p>
                    </div>
                  </div>

                  {/* 底部信息 */}
                  <div className="pt-4 border-t border-gray-100 mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        创建于 {new Date(team.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        className="text-blue-600 hover:text-blue-800 font-medium"
                        onClick={e => {
                          e.stopPropagation();
                          handleViewTeam(team.id);
                        }}
                      >
                        进入团队 →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 快捷操作区域 */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">快速开始</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleCreateTeam}
              className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">创建团队</h3>
              <p className="text-sm text-gray-600 text-center">
                组织智能体协作完成复杂任务
              </p>
            </button>

            <button
              onClick={() => router.push('/team/templates')}
              className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">使用模板</h3>
              <p className="text-sm text-gray-600 text-center">
                基于预设模板快速创建团队
              </p>
            </button>

            <button
              onClick={() => router.push('/team/documentation')}
              className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">学习指南</h3>
              <p className="text-sm text-gray-600 text-center">
                了解如何高效使用团队功能
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
