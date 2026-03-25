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
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Pause,
  Play,
  RefreshCw,
  Settings,
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
  executions?: number;
  successRate?: number;
}

/**
 * n8n 工作流执行管理页面
 * 集成真实的 n8n API 进行工作流管理
 */
export default function AgentsExecutionPage() {
  const { user } = useUnifiedAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // n8n API 基础 URL
  const N8N_BASE_URL =
    process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678';
  const N8N_API_KEY = process.env.N8N_API_TOKEN || '';

  // 加载 n8n 工作流列表
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
      // 使用模拟数据用于演示
      setWorkflows(getMockWorkflows());
    } finally {
      setLoading(false);
    }
  };

  // 触发工作流执行
  const executeWorkflow = async (workflowId: string) => {
    try {
      setExecutingId(workflowId);
      setError(null);

      const response = await fetch(
        `${N8N_BASE_URL}/api/v1/workflows/${workflowId}/run`,
        {
          method: 'POST',
          headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startNodes: [],
            destinationNode: undefined,
            executionMode: 'production',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`执行失败：${response.status}`);
      }

      const result = await response.json();
      console.log('工作流执行成功:', result);

      // 刷新列表
      await loadWorkflows();
    } catch (err: any) {
      console.error('工作流执行失败:', err);
      setError(err.message);
    } finally {
      setExecutingId(null);
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
      setError(err.message);
    }
  };

  // 模拟工作流数据（用于演示）
  const getMockWorkflows = (): Workflow[] => [
    {
      id: '1',
      name: '订单处理自动化流程',
      active: true,
      tags: ['订单', '自动化', '核心业务'],
      createdAt: '2026-03-20T10:00:00Z',
      updatedAt: '2026-03-24T09:30:00Z',
      executions: 1234,
      successRate: 98.5,
    },
    {
      id: '2',
      name: '客户服务智能回复',
      active: true,
      tags: ['客服', 'AI', '自动回复'],
      createdAt: '2026-03-18T14:20:00Z',
      updatedAt: '2026-03-24T11:15:00Z',
      executions: 5678,
      successRate: 95.2,
    },
    {
      id: '3',
      name: '每日数据分析报告生成',
      active: false,
      tags: ['数据分析', '报告', '定时任务'],
      createdAt: '2026-03-15T08:00:00Z',
      updatedAt: '2026-03-23T23:00:00Z',
      executions: 890,
      successRate: 99.1,
    },
    {
      id: '4',
      name: '库存预警与自动采购',
      active: true,
      tags: ['库存', '采购', '预警'],
      createdAt: '2026-03-10T16:45:00Z',
      updatedAt: '2026-03-24T09:45:00Z',
      executions: 2345,
      successRate: 97.8,
    },
    {
      id: '5',
      name: '用户行为追踪与分析',
      active: true,
      tags: ['用户分析', '行为追踪'],
      createdAt: '2026-03-22T11:30:00Z',
      updatedAt: '2026-03-24T10:20:00Z',
      executions: 3456,
      successRate: 96.3,
    },
  ];

  useEffect(() => {
    loadWorkflows();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面头部 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-600" />
            n8n 工作流执行管理
          </h1>
          <p className="text-gray-600">管理和监控 n8n 自动化工作流的执行状态</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadWorkflows} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Play className="w-4 h-4 mr-2" />
            创建工作流
          </Button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总工作流数</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows.length}</div>
            <p className="text-xs text-muted-foreground mt-1">已配置的工作流</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">运行中</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workflows.filter(w => w.active).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              正在执行的工作流
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总执行次数</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workflows
                .reduce((sum, w) => sum + (w.executions || 0), 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">累计执行次数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均成功率</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workflows.length > 0
                ? (
                    workflows.reduce(
                      (sum, w) => sum + (w.successRate || 0),
                      0
                    ) / workflows.length
                  ).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              所有工作流的平均成功率
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 工作流列表 */}
      <Card>
        <CardHeader>
          <CardTitle>n8n 工作流列表</CardTitle>
          <CardDescription>连接到 n8n 服务器：{N8N_BASE_URL}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
              <p>加载中...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workflows.map(workflow => (
                <div
                  key={workflow.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {workflow.name}
                        </h3>
                        <Badge
                          variant={workflow.active ? 'default' : 'secondary'}
                        >
                          {workflow.active ? '运行中' : '已暂停'}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {workflow.tags?.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <RefreshCw className="w-4 h-4 mr-1" />
                          执行 {(workflow.executions || 0).toLocaleString()} 次
                        </span>
                        {workflow.successRate && (
                          <span className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                            成功率 {workflow.successRate}%
                          </span>
                        )}
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          更新：
                          {new Date(workflow.updatedAt).toLocaleString('zh-CN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => executeWorkflow(workflow.id)}
                        disabled={
                          executingId === workflow.id || !workflow.active
                        }
                      >
                        {executingId === workflow.id ? (
                          <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4 mr-1" />
                        )}
                        执行
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toggleWorkflowStatus(workflow.id, workflow.active)
                        }
                      >
                        {workflow.active ? (
                          <>
                            <Pause className="w-4 h-4 mr-1" />
                            暂停
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            恢复
                          </>
                        )}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 使用说明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            n8n 集成说明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>本页面通过 n8n API 直接连接您的 n8n 工作流服务器</li>
            <li>
              需要配置环境变量：
              <code className="bg-gray-100 px-2 py-0.5 rounded">
                NEXT_PUBLIC_N8N_URL
              </code>{' '}
              和{' '}
              <code className="bg-gray-100 px-2 py-0.5 rounded">
                N8N_API_TOKEN
              </code>
            </li>
            <li>点击 &quot;执行&quot; 按钮可手动触发工作流立即运行</li>
            <li>使用 &quot;暂停/恢复&quot; 按钮控制工作流的激活状态</li>
            <li>绿色状态表示工作流正在运行，灰色表示已暂停</li>
            <li>如果连接失败，将显示模拟数据用于演示</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
