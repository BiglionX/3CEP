/**
 * 工作流管理页?
 * 提供工作流列表、创建、执行和回放功能
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
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
  AlertCircle
} from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  version: string;
  workflow_data: any;
  created_at: string;
  updated_at: string;
  executions?: WorkflowExecution[];
}

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input_data: any;
  output_data: any;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  is_replay: boolean;
  replayed_from: string | null;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  useEffect(() => {
    loadWorkflows();
  }, []);

  useEffect(() => {
    filterWorkflows();
  }, [workflows, searchTerm, statusFilter]);

  const loadWorkflows = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/workflows');
      
      if (!response.ok) {
        throw new Error('获取工作流列表失?);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setWorkflows(result.data);
      } else {
        throw new Error(result.error || '获取数据失败');
      }
      
    } catch (err: any) {
      console.error('加载工作流失?', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filterWorkflows = () => {
    let filtered = [...workflows];
    
    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(workflow => 
        workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (workflow.description && workflow.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // 状态过?
    if (statusFilter !== 'all') {
      filtered = filtered.filter(workflow => workflow.status === statusFilter);
    }
    
    setFilteredWorkflows(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'inactive': return <XCircle className="w-4 h-4" />;
      case 'archived': return <Trash2 className="w-4 h-4" />;
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

  const executeWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_data: {}
        })
      });
      
      if (!response.ok) {
        throw new Error('执行工作流失?);
      }
      
      const result = await response.json();
      alert(`工作流开始执? ${result.data.workflowName}`);
      
    } catch (err: any) {
      console.error('执行工作流失?', err);
      alert(`执行失败: ${err.message}`);
    }
  };

  const replayExecution = async (executionId: string) => {
    try {
      const response = await fetch(`/api/workflows/${executionId}/execute`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('回放执行失败');
      }
      
      const result = await response.json();
      alert(`工作流回放开? ${result.data.workflowName}`);
      
    } catch (err: any) {
      console.error('回放执行失败:', err);
      alert(`回放失败: ${err.message}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载工作流数据中...</p>
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
            onClick={loadWorkflows}
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
              <h1 className="text-2xl font-bold text-gray-900">工作流管?/h1>
              <p className="text-gray-600 mt-1">管理和执行自动化工作?/p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>新建工作?/span>
            </button>
          </div>
          
          {/* 搜索和过?*/}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索工作流名称或描述..."
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
                <option value="all">全部状?/option>
                <option value="active">已激?/option>
                <option value="draft">草稿</option>
                <option value="inactive">未激?/option>
                <option value="archived">已归?/option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 工作流列?*/}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredWorkflows.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <div className="w-12 h-12 mx-auto flex items-center justify-center bg-gray-100 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无工作?/h3>
              <p className="text-gray-500">创建您的第一个工作流来开始自动化流程</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredWorkflows.map((workflow) => (
                <div key={workflow.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                          {getStatusIcon(workflow.status)}
                          <span className="ml-1 capitalize">{workflow.status}</span>
                        </span>
                        <span className="text-sm text-gray-500">v{workflow.version}</span>
                      </div>
                      
                      {workflow.description && (
                        <p className="text-gray-600 mb-3">{workflow.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                        <span>创建?{formatDate(workflow.created_at)}</span>
                        <span>更新?{formatDate(workflow.updated_at)}</span>
                        {workflow.executions && workflow.executions.length > 0 && (
                          <span>{workflow.executions.length} 次执?/span>
                        )}
                      </div>
                      
                      {/* 执行记录预览 */}
                      {workflow.executions && workflow.executions.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">最近执?</h4>
                          <div className="space-y-2">
                            {workflow.executions.slice(0, 3).map((execution) => (
                              <div key={execution.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span className={getExecutionStatusColor(execution.status)}>
                                    {execution.status === 'completed' && '�?'}
                                    {execution.status === 'failed' && '�?'}
                                    {execution.status === 'running' && '🔄 '}
                                    {execution.status === 'pending' && '�?'}
                                    {execution.status}
                                  </span>
                                  <span className="text-gray-500">
                                    {formatDate(execution.started_at)}
                                  </span>
                                  {execution.is_replay && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800">
                                      回放
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  {execution.duration_ms && (
                                    <span className="text-gray-500">
                                      {execution.duration_ms}ms
                                    </span>
                                  )}
                                  <button
                                    onClick={() => replayExecution(execution.id)}
                                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                                    title="回放此执?
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>回放</span>
                                  </button>
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
                        onClick={() => executeWorkflow(workflow.id)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        disabled={workflow.status !== 'active'}
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

      {/* 创建工作流模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">创建新工作流</h2>
            <p className="text-gray-600 mb-6">配置您的自动化工作流</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  工作流名?*
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入工作流名?
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="描述工作流的用途和功能"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  状?
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="draft">草稿</option>
                  <option value="active">激?/option>
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
                  // 这里应该实现创建工作流的逻辑
                  setShowCreateModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                创建工作?
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
