'use client';

import { useEffect, useState } from 'react';
import BatchActions from './BatchActions';

// 智能体注册信息接口
interface AgentRegistration {
  id: string;
  name: string;
  domain: string;
  type: 'n8n' | 'service';
  endpoint: string;
  version: string;
  description?: string;
  metadata: {
    latency_sensitive: boolean;
    security_level: 'low' | 'medium' | 'high';
    traffic_level: 'low' | 'medium' | 'high';
    status_complexity: 'low' | 'medium' | 'high';
  };
  health_check_endpoint?: string;
  supported_operations: string[];
  created_at: string;
  updated_at: string;
}

// 智能体状态接口
interface AgentStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  last_heartbeat: string;
  metrics: {
    success_rate: number;
    avg_response_time: number;
    error_rate: number;
    request_count: number;
  };
  health: {
    endpoint_reachable: boolean;
    response_time: number;
    last_check: string;
  };
}

// 综合智能体信息接口
interface AgentInfo {
  registration: AgentRegistration;
  status: AgentStatus;
}

export default function AgentsDashboard(): JSX.Element {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    domain: '',
    type: '',
    status: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);

  useEffect(() => {
    loadAgents();
    // 每30秒刷新一次
    const interval = setInterval(loadAgents, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);

      // 并行获取注册信息和状态信息
      const [registryResponse, statusResponse] = await Promise.all([
        fetch('/api/agents/registry'),
        fetch('/api/agents/status'),
      ]);

      if (!registryResponse.ok || !statusResponse.ok) {
        throw new Error('获取智能体信息失败');
      }

      const registryData = await registryResponse.json();
      const statusData = await statusResponse.json();

      // 合并注册信息和状态信息
      const mergedAgents: AgentInfo[] = registryData.data.map(
        (reg: AgentRegistration) => {
          const status = statusData.data.find(
            (s: AgentStatus) => s.name === reg.name
          );
          return {
            registration: reg,
            status: status || getDefaultStatus(reg.name),
          };
        }
      );

      setAgents(mergedAgents);
    } catch (error) {
      console.error('加载智能体信息失败', error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultStatus = (agentName: string): AgentStatus => ({
    name: agentName,
    status: 'offline',
    last_heartbeat: new Date(0).toISOString(),
    metrics: {
      success_rate: 0,
      avg_response_time: 0,
      error_rate: 0,
      request_count: 0,
    },
    health: {
      endpoint_reachable: false,
      response_time: 0,
      last_check: new Date(0).toISOString(),
    },
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeDisplay = (type: string) => {
    return type === 'n8n' ? 'n8n工作流' : '服务';
  };

  const getSecurityLevelDisplay = (level: string) => {
    switch (level) {
      case 'high':
        return '高风险';
      case 'medium':
        return '中风险';
      case 'low':
        return '低风险';
      default:
        return '未知';
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAgentIds(filteredAgents.map(a => a.registration.id));
    } else {
      setSelectedAgentIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedAgentIds(prev => [...prev, id]);
    } else {
      setSelectedAgentIds(prev => prev.filter(agentId => agentId !== id));
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch =
      agent.registration.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      agent.registration.domain
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesDomain =
      !filters.domain || agent.registration.domain === filters.domain;
    const matchesType =
      !filters.type || agent.registration.type === filters.type;
    const matchesStatus =
      !filters.status || agent.status.status === filters.status;

    return matchesSearch && matchesDomain && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">智能体管理</h1>
          <p className="text-gray-600 mt-2">监控和管理平台中的所有智能体服务</p>
        </div>
        <button
          onClick={loadAgents}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          刷新
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">总计智能体</h3>
          <p className="text-2xl font-bold mt-1">{agents.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">在线智能体</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {agents.filter(a => a.status.status === 'online').length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">平均成功率</h3>
          <p className="text-2xl font-bold mt-1">
            {agents.length > 0
              ? `${Math.round((agents.reduce((sum, a) => sum + a.status.metrics.success_rate, 0) / agents.length) * 100)}%`
              : '0%'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">总请求数</h3>
          <p className="text-2xl font-bold mt-1">
            {agents.reduce((sum, a) => sum + a.status.metrics.request_count, 0)}
          </p>
        </div>
      </div>

      {/* 过滤器 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">过滤器</h2>
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="搜索智能体名称或领域..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filters.domain}
            onChange={e => setFilters({ ...filters, domain: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部领域</option>
            {Array.from(new Set(agents.map(a => a.registration.domain))).map(
              domain => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              )
            )}
          </select>

          <select
            value={filters.type}
            onChange={e => setFilters({ ...filters, type: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部类型</option>
            {Array.from(new Set(agents.map(a => a.registration.type))).map(
              type => (
                <option key={type} value={type}>
                  {getTypeDisplay(type)}
                </option>
              )
            )}
          </select>

          <select
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部状态</option>
            {Array.from(new Set(agents.map(a => a.status.status))).map(
              status => (
                <option key={status} value={status}>
                  {status === 'online'
                    ? '在线'
                    : status === 'degraded'
                      ? '降级'
                      : '离线'}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* 批量操作工具栏 */}
      {selectedAgentIds.length > 0 && (
        <BatchActions
          selectedIds={selectedAgentIds}
          onActionComplete={() => {
            setSelectedAgentIds([]);
            loadAgents();
          }}
        />
      )}

      {/* 智能体列表 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">智能体列表</h2>
            <p className="text-gray-600 text-sm mt-1">
              共 {filteredAgents.length} 个智能体
            </p>
          </div>
          {selectedAgentIds.length > 0 && (
            <p className="text-sm text-indigo-600 font-medium">
              已选择 {selectedAgentIds.length} 个
            </p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={
                      selectedAgentIds.length === filteredAgents.length &&
                      filteredAgents.length > 0
                    }
                    onChange={e => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  领域
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  安全等级
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  成功率
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  响应时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  请求量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAgents.map(agent => (
                <tr key={agent.registration.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedAgentIds.includes(agent.registration.id)}
                      onChange={e =>
                        handleSelectOne(agent.registration.id, e.target.checked)
                      }
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {agent.registration.name}
                      {agent.registration.version && (
                        <span className="text-xs text-gray-500 ml-2">
                          v{agent.registration.version}
                        </span>
                      )}
                    </div>
                    {agent.registration.description && (
                      <div className="text-sm text-gray-500 mt-1">
                        {agent.registration.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {agent.registration.domain}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getTypeDisplay(agent.registration.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(agent.status.status)}`}
                    >
                      {agent.status.status === 'online'
                        ? '在线'
                        : agent.status.status === 'degraded'
                          ? '降级'
                          : '离线'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getSecurityLevelDisplay(
                      agent.registration.metadata.security_level
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(agent.status.metrics.success_rate * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {agent.status.metrics.avg_response_time.toFixed(0)}ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {agent.status.metrics.request_count.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        查看详情
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        测试调用
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        配置
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.881-6.08 2.32M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium">没有找到匹配的智能体</h3>
            <p className="mt-1 text-sm">尝试调整搜索条件或过滤器</p>
          </div>
        )}
      </div>
    </div>
  );
}
