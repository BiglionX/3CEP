/**
 * 智能体管理页
 * 提供智能体列表、创建、配置和 Playground 功能
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Bot, 
  Play, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Terminal,
  Bug,
  Zap
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string | null;
  status: 'active' | 'inactive' | 'draft';
  version: string;
  configuration: any;
  created_at: string;
  updated_at: string;
  executions: AgentExecution[];
}

interface AgentExecution {
  id: string;
  agent_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input_data: any;
  output_data: any;
  parameters: any;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  is_debug: boolean;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPlayground, setShowPlayground] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [playgroundInput, setPlaygroundInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    filterAgents();
  }, [agents, searchTerm, statusFilter]);

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/agents');
      
      if (!response.ok) {
        throw new Error('获取智能体列表失);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setAgents(result.data);
      } else {
        throw new Error(result.error || '获取数据失败');
      }
      
    } catch (err: any) {
      console.error('加载智能体失', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAgents = () => {
    let filtered = [...agents];
    
    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (agent.description && agent.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // 状态过
    if (statusFilter !== 'all') {
      filtered = filtered.filter(agent => agent.status === statusFilter);
    }
    
    setFilteredAgents(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'inactive': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getExecutionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'running': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const executeAgent = async (agentId: string, isDebug: boolean = false) => {
    try {
      setIsExecuting(true);
      const endpoint = `/api/agents/${agentId}/execute`;
      const method = isDebug  'PATCH' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_data: { query: playgroundInput || '测试查询' },
          parameters: isDebug  { debug_mode: true } : {}
        })
      });
      
      if (!response.ok) {
        throw new Error('执行智能体失);
      }
      
      const result = await response.json();
      alert(`${isDebug  '调试' : '执行'}已启 ${result.data.agentName}`);
      
      // 重新加载执行记录
      loadAgents();
      
    } catch (err: any) {
      console.error('执行智能体失', err);
      alert(`执行失败: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const openPlayground = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowPlayground(true);
    setPlaygroundInput('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载智能体数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">加载失败</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAgents}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部区域 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">智能体管/h1>
              <p className="text-gray-600 mt-1">管理和测试您AI 智能/p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>新建智能/span>
            </button>
          </div>
          
          {/* 搜索和过*/}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索智能体名称或描述..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 w-4 h-4" />
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">全部状态/option>
                <option value="active">已激/option>
                <option value="inactive">未激/option>
                <option value="draft">草稿</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 智能体列*/}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredAgents.length === 0  (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <div className="w-12 h-12 mx-auto flex items-center justify-center bg-gray-100 rounded-lg">
                  <Bot className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无智能/h3>
              <p className="text-gray-500">创建您的第一AI 智能体来开始自动化任务</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAgents.map((agent) => (
                <div key={agent.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                          {getStatusIcon(agent.status)}
                          <span className="ml-1 capitalize">{agent.status}</span>
                        </span>
                        <span className="text-sm text-gray-500">v{agent.version}</span>
                      </div>
                      
                      {agent.description && (
                        <p className="text-gray-600 mb-3">{agent.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                        <span>创建{formatDate(agent.created_at)}</span>
                        <span>更新{formatDate(agent.updated_at)}</span>
                        {agent.executions && agent.executions.length > 0 && (
                          <span>{agent.executions.length} 次执/span>
                        )}
                      </div>
                      
                      {/* 配置预览 */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">配置预览:</h4>
                        <div className="bg-gray-50 p-3 rounded-lg text-sm">
                          <pre className="text-gray-600 overflow-x-auto">
                            {JSON.stringify(agent.configuration, null, 2)}
                          </pre>
                        </div>
                      </div>
                      
                      {/* 执行记录预览 */}
                      {agent.executions && agent.executions.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">最近执</h4>
                          <div className="space-y-2">
                            {agent.executions.slice(0, 2).map((execution) => (
                              <div key={execution.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span className={getExecutionStatusColor(execution.status)}>
                                    {execution.status === 'completed' && ''}
                                    {execution.status === 'failed' && ''}
                                    {execution.status === 'running' && '🔄 '}
                                    {execution.status === 'pending' && ''}
                                    {execution.status}
                                  </span>
                                  <span className="text-gray-500">
                                    {formatDate(execution.started_at)}
                                  </span>
                                  {execution.is_debug && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800">
                                      调试
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  {execution.duration_ms && (
                                    <span className="text-gray-500">
                                      {execution.duration_ms}ms
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => openPlayground(agent)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        disabled={agent.status !== 'active'}
                      >
                        <Terminal className="w-4 h-4" />
                        <span>Playground</span>
                      </button>
                      
                      <button
                        onClick={() => executeAgent(agent.id)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        disabled={agent.status !== 'active'}
                      >
                        <Play className="w-4 h-4" />
                        <span>执行</span>
                      </button>
                      
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Playground 模态框 */}
      {showPlayground && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* 头部 */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedAgent.name} Playground
                  </h2>
                  <p className="text-gray-600 mt-1">在线测试和调试您的智能体</p>
                </div>
                <button
                  onClick={() => setShowPlayground(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* 主要内容 */}
            <div className="flex h-[calc(90vh-140px)]">
              {/* 输入区域 */}
              <div className="w-1/2 border-r border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">输入</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      查询内容
                    </label>
                    <textarea
                      value={playgroundInput}
                      onChange={(e) => setPlaygroundInput(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入您要测试的查询内容..."
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => executeAgent(selectedAgent.id, false)}
                      disabled={isExecuting || !playgroundInput.trim()}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      <span>{isExecuting  '执行..' : '执行'}</span>
                    </button>
                    
                    <button
                      onClick={() => executeAgent(selectedAgent.id, true)}
                      disabled={isExecuting || !playgroundInput.trim()}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Bug className="w-4 h-4" />
                      <span>调试执行</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 输出区域 */}
              <div className="w-1/2 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">输出</h3>
                <div className="bg-gray-50 rounded-lg p-4 h-full">
                  <div className="text-center text-gray-500 h-full flex items-center justify-center">
                    <div>
                      <Terminal className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>执行结果将在这里显示</p>
                      <p className="text-sm mt-1">点击执行按钮开始测/p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 创建智能体模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">创建新智能体</h2>
            <p className="text-gray-600 mb-6">配置您的 AI 智能/p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  智能体名*
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入智能体名
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="描述智能体的用途和功能"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  配置 (JSON)
                </label>
                <textarea
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder='{ "model": "gpt-4", "temperature": 0.7, "max_tokens": 1000 }'
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  状
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="draft">草稿</option>
                  <option value="active">激/option>
                  <option value="inactive">未激/option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  // 这里应该实现创建智能体的逻辑
                  setShowCreateModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                创建智能
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
