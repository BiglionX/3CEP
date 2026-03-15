'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Bot,
  Play,
  Pause,
  Settings,
  Trash2,
  Activity,
  Search,
  Filter,
  Plus,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

interface EnterpriseAgent {
  id: string;
  name: string;
  type: 'customer-service' | 'data-analysis' | 'procurement' | 'workflow';
  status: 'running' | 'stopped' | 'error' | 'pending';
  version: string;
  createdAt: string;
  lastActive: string;
  usageCount: number;
  successRate: number;
  avgResponseTime: number;
}

export default function EnterpriseAgentsPage() {
  const [agents, setAgents] = useState<EnterpriseAgent[]>([
    {
      id: '1',
      name: '智能客服机器,
      type: 'customer-service',
      status: 'running',
      version: 'v2.1.0',
      createdAt: '2024-01-15',
      lastActive: '2024-01-20 14:30:25',
      usageCount: 1247,
      successRate: 96.8,
      avgResponseTime: 1.2,
    },
    {
      id: '2',
      name: '数据分析助手',
      type: 'data-analysis',
      status: 'running',
      version: 'v1.5.2',
      createdAt: '2024-01-10',
      lastActive: '2024-01-20 15:45:12',
      usageCount: 892,
      successRate: 98.2,
      avgResponseTime: 2.8,
    },
    {
      id: '3',
      name: '采购智能,
      type: 'procurement',
      status: 'stopped',
      version: 'v1.0.0',
      createdAt: '2024-01-05',
      lastActive: '2024-01-18 09:15:33',
      usageCount: 156,
      successRate: 92.3,
      avgResponseTime: 3.5,
    },
    {
      id: '4',
      name: '流程自动化助,
      type: 'workflow',
      status: 'error',
      version: 'v1.2.1',
      createdAt: '2024-01-12',
      lastActive: '2024-01-19 16:22:45',
      usageCount: 342,
      successRate: 87.5,
      avgResponseTime: 4.1,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredAgents = agents.filter(agent => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || agent.type === filterType;
    const matchesStatus =
      filterStatus === 'all' || agent.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'customer-service':
        return { label: '客户服务', color: 'bg-blue-100 text-blue-800' };
      case 'data-analysis':
        return { label: '数据分析', color: 'bg-green-100 text-green-800' };
      case 'procurement':
        return { label: '采购管理', color: 'bg-purple-100 text-purple-800' };
      case 'workflow':
        return { label: '流程自动, color: 'bg-orange-100 text-orange-800' };
      default:
        return { label: type, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'running':
        return {
          label: '运行,
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
        };
      case 'stopped':
        return {
          label: '已停,
          color: 'bg-gray-100 text-gray-800',
          icon: XCircle,
        };
      case 'error':
        return {
          label: '错误',
          color: 'bg-red-100 text-red-800',
          icon: AlertTriangle,
        };
      case 'pending':
        return {
          label: '待启,
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800',
          icon: XCircle,
        };
    }
  };

  const toggleAgentStatus = (agentId: string) => {
    setAgents(
      agents.map(agent =>
        agent.id === agentId
           {
              ...agent,
              status: agent.status === 'running'  'stopped' : 'running',
              lastActive: new Date().toISOString(),
            }
          : agent
      )
    );
  };

  const deleteAgent = (agentId: string) => {
    if (confirm('确定要删除这个智能体吗？此操作不可撤销)) {
      setAgents(agents.filter(agent => agent.id !== agentId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题和操作按*/}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">智能体管/h1>
            <p className="mt-1 text-sm text-gray-600">
              管理和监控企业部署的所有AI智能            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              性能分析
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新建智能            </Button>
          </div>
        </div>

        {/* 搜索和过*/}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="搜索智能体名称或类型..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                >
                  <option value="all">所有类/option>
                  <option value="customer-service">客户服务</option>
                  <option value="data-analysis">数据分析</option>
                  <option value="procurement">采购管理</option>
                  <option value="workflow">流程自动/option>
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="all">所有状/option>
                  <option value="running">运行/option>
                  <option value="stopped">已停/option>
                  <option value="error">错误</option>
                  <option value="pending">待启/option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 统计概览 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    总智能体                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {agents.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">运行/p>
                  <p className="text-2xl font-bold text-gray-900">
                    {agents.filter(a => a.status === 'running').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">总调用量</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {agents
                      .reduce((sum, agent) => sum + agent.usageCount, 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">异常数量</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {agents.filter(a => a.status === 'error').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 智能体列*/}
        <div className="space-y-6">
          {filteredAgents.map(agent => {
            const typeConfig = getTypeConfig(agent.type);
            const statusConfig = getStatusConfig(agent.status);
            const StatusIcon = statusConfig.icon;

            return (
              <Card
                key={agent.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {agent.name}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig.color}`}
                            >
                              {typeConfig.label}
                            </span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">
                            版本: {agent.version} 创建时间: {agent.createdAt}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">调用次数</p>
                              <p className="font-semibold">
                                {agent.usageCount.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">成功/p>
                              <p
                                className={`font-semibold ${agent.successRate >= 95  'text-green-600' : agent.successRate >= 90  'text-yellow-600' : 'text-red-600'}`}
                              >
                                {agent.successRate}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                平均响应时间
                              </p>
                              <p className="font-semibold">
                                {agent.avgResponseTime}s
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 lg:mt-0 flex space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAgentStatus(agent.id)}
                      >
                        {agent.status === 'running' ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            停止
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            启动
                          </>
                        )}
                      </Button>

                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        配置
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAgent(agent.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        删除
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      最后活 {agent.lastActive}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredAgents.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  未找到匹配的智能                </h3>
                <p className="text-gray-500 mb-4">
                  尝试调整搜索条件或创建新的智能体
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  创建智能                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

