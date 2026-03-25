'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Code,
  Copy,
  Download,
  Edit,
  Filter,
  GitBranch,
  MoreVertical,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Workflow {
  id: string;
  name: string;
  active: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  description?: string;
  nodes?: number;
  connections?: number;
}

/**
 * n8n 工作流管理工作流列表页面
 * 用于浏览、创建、编辑和管理 n8n 工作流
 */
export default function AgentsWorkflowsPage() {
  const { user } = useUnifiedAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [error, setError] = useState<string | null>(null);

  // n8n API 配置
  const N8N_BASE_URL =
    process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678';
  const N8N_API_KEY = process.env.N8N_API_TOKEN || '';

  // 加载工作流列表
  const loadWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`n8n API 错误：${response.status}`);
      }

      const data = await response.json();
      setWorkflows(data.data || []);
    } catch (err: any) {
      console.error('加载工作流失败:', err);
      setError(err.message);
      // 使用模拟数据演示
      setWorkflows(getMockWorkflows());
    } finally {
      setLoading(false);
    }
  };

  // 删除工作流
  const deleteWorkflow = async (workflowId: string) => {
    if (!confirm('确定要删除这个工作流吗？此操作不可恢复。')) {
      return;
    }

    try {
      const response = await fetch(
        `${N8N_BASE_URL}/api/v1/workflows/${workflowId}`,
        {
          method: 'DELETE',
          headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`删除失败：${response.status}`);
      }

      // 刷新列表
      await loadWorkflows();
    } catch (err: any) {
      console.error('删除工作流失败:', err);
      alert(`删除失败：${err.message}`);
    }
  };

  // 切换工作流激活状态
  const toggleWorkflowStatus = async (
    workflowId: string,
    currentStatus: boolean
  ) => {
    try {
      const newStatus = !currentStatus;

      const response = await fetch(
        `${N8N_BASE_URL}/api/v1/workflows/${workflowId}/active`,
        {
          method: 'PATCH',
          headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ active: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(`更新失败：${response.status}`);
      }

      // 刷新列表
      await loadWorkflows();
    } catch (err: any) {
      console.error('更新工作流状态失败:', err);
      alert(`更新失败：${err.message}`);
    }
  };

  // 导出工作流
  const exportWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(
        `${N8N_BASE_URL}/api/v1/workflows/${workflowId}`,
        {
          headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`导出失败：${response.status}`);
      }

      const data = await response.json();

      // 创建下载链接
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflow-${workflowId}-${data.name}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('导出工作流失败:', err);
      alert(`导出失败：${err.message}`);
    }
  };

  // 模拟工作流数据
  const getMockWorkflows = (): Workflow[] => [
    {
      id: '1',
      name: '订单处理自动化流程',
      active: true,
      tags: ['订单', '自动化', '核心业务'],
      createdAt: '2026-03-20T10:00:00Z',
      updatedAt: '2026-03-24T09:30:00Z',
      description: '自动处理客户订单，包括库存检查、发货安排和通知发送',
      nodes: 12,
      connections: 15,
    },
    {
      id: '2',
      name: '客户服务智能回复系统',
      active: true,
      tags: ['客服', 'AI', '自动回复'],
      createdAt: '2026-03-18T14:20:00Z',
      updatedAt: '2026-03-24T11:15:00Z',
      description: '使用 AI 自动回复常见问题，复杂问题转接人工客服',
      nodes: 8,
      connections: 10,
    },
    {
      id: '3',
      name: '每日数据分析报告生成',
      active: false,
      tags: ['数据分析', '报告', '定时任务'],
      createdAt: '2026-03-15T08:00:00Z',
      updatedAt: '2026-03-23T23:00:00Z',
      description: '每天自动生成业务数据分析报告并发送邮件给管理层',
      nodes: 15,
      connections: 18,
    },
    {
      id: '4',
      name: '库存预警与自动采购',
      active: true,
      tags: ['库存', '采购', '预警'],
      createdAt: '2026-03-10T16:45:00Z',
      updatedAt: '2026-03-24T09:45:00Z',
      description: '监控库存水平，低于安全阈值时自动触发采购流程',
      nodes: 10,
      connections: 12,
    },
    {
      id: '5',
      name: '用户行为追踪与分析',
      active: true,
      tags: ['用户分析', '行为追踪', '数据收集'],
      createdAt: '2026-03-22T11:30:00Z',
      updatedAt: '2026-03-24T10:20:00Z',
      description: '追踪用户在网站的行为，分析用户偏好和使用习惯',
      nodes: 6,
      connections: 8,
    },
    {
      id: '6',
      name: '社交媒体自动发布',
      active: true,
      tags: ['社交媒体', '营销', '自动化'],
      createdAt: '2026-03-12T09:15:00Z',
      updatedAt: '2026-03-24T08:00:00Z',
      description: '定时在多个社交媒体平台自动发布内容和推广信息',
      nodes: 9,
      connections: 11,
    },
  ];

  useEffect(() => {
    loadWorkflows();
  }, []);

  // 过滤工作流
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch =
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.tags.some(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && workflow.active) ||
      (filterStatus === 'inactive' && !workflow.active);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面头部 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <GitBranch className="w-8 h-8 text-blue-600" />
            n8n 工作流管理
          </h1>
          <p className="text-gray-600">创建、编辑和管理 n8n 自动化工作流</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          创建工作流
        </Button>
      </div>

      {/* 错误提示 */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <span className="text-xs ml-2">(显示模拟数据)</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 筛选和搜索工具栏 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索工作流名称、描述或标签..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 状态筛选 */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部状态</option>
                <option value="active">运行中</option>
                <option value="inactive">已暂停</option>
              </select>
            </div>

            {/* 刷新按钮 */}
            <Button onClick={loadWorkflows} variant="outline" size="sm">
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
              />
              刷新
            </Button>
          </div>

          {/* 统计信息 */}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <span>共 {filteredWorkflows.length} 个工作流</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              {filteredWorkflows.filter(w => w.active).length} 个运行中
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <XCircle className="w-4 h-4 text-gray-600" />
              {filteredWorkflows.filter(w => !w.active).length} 个已暂停
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 工作流列表 */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-gray-500">
              <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin" />
              <p className="text-lg">加载中...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorkflows.map(workflow => (
            <Card
              key={workflow.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg font-semibold">
                        {workflow.name}
                      </CardTitle>
                      <Badge
                        variant={workflow.active ? 'default' : 'secondary'}
                      >
                        {workflow.active ? '运行中' : '已暂停'}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {workflow.description || '暂无描述'}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        编辑工作流
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="w-4 h-4 mr-2" />
                        复制工作流
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => exportWorkflow(workflow.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        导出 JSON
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          toggleWorkflowStatus(workflow.id, workflow.active)
                        }
                      >
                        {workflow.active ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            暂停
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            恢复
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => deleteWorkflow(workflow.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {/* 标签 */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {workflow.tags?.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* 统计信息 */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Code className="w-3 h-3" />
                    <span>{workflow.nodes || 0} 个节点</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    <span>{workflow.connections || 0} 个连接</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      创建：
                      {new Date(workflow.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    <span>
                      更新：
                      {new Date(workflow.updatedAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      window.open(
                        `${N8N_BASE_URL}/workflow/${workflow.id}`,
                        '_blank'
                      )
                    }
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    配置
                  </Button>
                  <Button
                    variant={workflow.active ? 'outline' : 'default'}
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      toggleWorkflowStatus(workflow.id, workflow.active)
                    }
                  >
                    {workflow.active ? (
                      <>
                        <Pause className="w-3 h-3 mr-1" />
                        暂停
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        启动
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!loading && filteredWorkflows.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-gray-500">
              <Zap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">未找到工作流</p>
              <p className="text-sm mb-4">
                {searchTerm || filterStatus !== 'all'
                  ? '尝试调整搜索条件或筛选器'
                  : '点击上方按钮创建第一个工作流'}
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  创建工作流
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 使用说明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            工作流管理说明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>本页面通过 n8n API 连接到您的 n8n 工作流服务器</li>
            <li>
              点击 &quot;创建工作流&quot; 按钮跳转到 n8n 编辑器创建新工作流
            </li>
            <li>点击卡片右上角的菜单可进行编辑、复制、导出等操作</li>
            <li>使用 &quot;配置&quot; 按钮在 n8n 中打开工作流进行可视化编辑</li>
            <li>可以快速暂停或启动工作流，无需进入编辑器</li>
            <li>支持搜索工作流名称、描述和标签</li>
            <li>可以按状态筛选工作流（全部/运行中/已暂停）</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
