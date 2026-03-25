'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle,
  Clock,
  Copy,
  Database,
  Download,
  GitBranch,
  RefreshCw,
  Share2,
  Terminal,
  XCircle,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ExecutionDetail {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'success' | 'error' | 'running' | 'waiting';
  mode: 'production' | 'test' | 'manual' | 'internal';
  startedAt: string;
  stoppedAt?: string;
  duration?: number;
  data: {
    resultData?: {
      runData?: Record<string, any[]>;
      lastNodeExecuted?: string;
      error?: {
        message: string;
        name: string;
        stack?: string;
      };
    };
    inputData?: any;
    outputData?: any;
  };
  finished: boolean;
  retryOf?: string;
  retrySuccessId?: string;
}

interface NodeExecution {
  nodeName: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: 'success' | 'error' | 'skipped';
  inputItems: number;
  outputItems: number;
  error?: {
    message: string;
    name: string;
  };
}

/**
 * n8n 工作流单次执行详情页面
 * 展示执行的完整详细信息、步骤回放、数据分析
 */
export default function ExecutionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const executionId = params.id as string;

  const { user } = useUnifiedAuth();
  const [execution, setExecution] = useState<ExecutionDetail | null>(null);
  const [nodeExecutions, setNodeExecutions] = useState<NodeExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'nodes' | 'input' | 'output' | 'error'
  >('overview');
  const [error, setError] = useState<string | null>(null);

  // n8n API 配置
  const N8N_BASE_URL =
    process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678';
  const N8N_API_KEY = process.env.N8N_API_TOKEN || '';

  // 加载执行详情
  const loadExecutionDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${N8N_BASE_URL}/api/v1/executions/${executionId}`,
        {
          headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`获取执行详情失败：${response.status}`);
      }

      const data = await response.json();
      setExecution(data.data);

      // 解析节点执行情况
      if (data.data?.data?.resultData?.runData) {
        const nodes: NodeExecution[] = [];
        Object.entries(data.data.data.resultData.runData).forEach(
          ([nodeName, tasks]) => {
            if (Array.isArray(tasks)) {
              tasks.forEach((task: any, index: number) => {
                nodes.push({
                  nodeName: `${nodeName}${index > 0 ? ` (${index + 1})` : ''}`,
                  startTime: task.startTime,
                  endTime: task.endTime,
                  duration: task.endTime - task.startTime,
                  status: task.error ? 'error' : 'success',
                  inputItems: task.inputData?.main?.[0]?.length || 0,
                  outputItems: task.data?.main?.[0]?.length || 0,
                  error: task.error,
                });
              });
            }
          }
        );
        setNodeExecutions(nodes);
      }
    } catch (err: any) {
      console.error('加载执行详情失败:', err);
      setError(err.message);
      // 使用模拟数据演示
      loadMockExecution();
    } finally {
      setLoading(false);
    }
  };

  // 加载模拟数据
  const loadMockExecution = () => {
    const mockExecution: ExecutionDetail = {
      id: executionId,
      workflowId: '1',
      workflowName: '订单处理自动化流程',
      status: 'success',
      mode: 'production',
      startedAt: new Date(Date.now() - 300000).toISOString(),
      stoppedAt: new Date(Date.now() - 297660).toISOString(),
      duration: 2340,
      finished: true,
      data: {
        resultData: {
          runData: {
            Webhook: [
              {
                startTime: Date.now() - 300000,
                endTime: Date.now() - 299500,
                data: {
                  main: [
                    [{ json: { orderId: 'ORD-2026-001', customer: '张三' } }],
                  ],
                },
              },
            ],
            检查库存: [
              {
                startTime: Date.now() - 299500,
                endTime: Date.now() - 298000,
                data: { main: [[{ json: { inStock: true, quantity: 100 } }]] },
              },
            ],
            创建发货单: [
              {
                startTime: Date.now() - 298000,
                endTime: Date.now() - 297660,
                data: { main: [[{ json: { shippingId: 'SHP-001' } }]] },
              },
            ],
          },
          lastNodeExecuted: '创建发货单',
        },
        inputData: {
          orderId: 'ORD-2026-001',
          customer: '张三',
          items: [
            { name: '商品 A', quantity: 2, price: 199 },
            { name: '商品 B', quantity: 1, price: 299 },
          ],
          total: 697,
        },
        outputData: {
          success: true,
          shippingId: 'SHP-001',
          trackingNumber: 'SF1234567890',
          estimatedDelivery: '2026-03-26',
        },
      },
    };

    const mockNodes: NodeExecution[] = [
      {
        nodeName: 'Webhook',
        startTime: Date.now() - 300000,
        endTime: Date.now() - 299500,
        duration: 500,
        status: 'success',
        inputItems: 0,
        outputItems: 1,
      },
      {
        nodeName: '检查库存',
        startTime: Date.now() - 299500,
        endTime: Date.now() - 298000,
        duration: 1500,
        status: 'success',
        inputItems: 1,
        outputItems: 1,
      },
      {
        nodeName: '创建发货单',
        startTime: Date.now() - 298000,
        endTime: Date.now() - 297660,
        duration: 340,
        status: 'success',
        inputItems: 1,
        outputItems: 1,
      },
    ];

    setExecution(mockExecution);
    setNodeExecutions(mockNodes);
    setLoading(false);
  };

  useEffect(() => {
    loadExecutionDetail();

    // 如果正在运行，自动刷新
    if (execution?.status === 'running') {
      const interval = setInterval(loadExecutionDetail, 3000);
      return () => clearInterval(interval);
    }
  }, []);

  // 格式化时间
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // 格式化持续时间
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            成功
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            失败
          </Badge>
        );
      case 'running':
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            运行中
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-gray-500">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <p className="text-lg">加载执行详情...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>未找到该执行记录，可能已被删除</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 头部导航 */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="text-2xl font-bold">{execution.workflowName}</h1>
          {getStatusBadge(execution.status)}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>执行 ID: {execution.id}</span>
          <span>•</span>
          <span>工作流 ID: {execution.workflowId}</span>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 标签页切换 */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          概览
        </button>
        <button
          onClick={() => setActiveTab('nodes')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'nodes'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          执行步骤 ({nodeExecutions.length})
        </button>
        <button
          onClick={() => setActiveTab('input')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'input'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          输入数据
        </button>
        <button
          onClick={() => setActiveTab('output')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'output'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          输出结果
        </button>
        {execution.data?.resultData?.error && (
          <button
            onClick={() => setActiveTab('error')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'error'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            错误信息
          </button>
        )}
      </div>

      {/* 概览标签页 */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 基本信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                执行概览
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">状态</div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(execution.status)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">执行模式</div>
                  <Badge variant="outline">
                    {execution.mode === 'production'
                      ? '生产'
                      : execution.mode === 'test'
                        ? '测试'
                        : execution.mode === 'manual'
                          ? '手动'
                          : '内部'}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">总耗时</div>
                  <div className="font-semibold">
                    {formatDuration(execution.duration || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">执行节点数</div>
                  <div className="font-semibold">{nodeExecutions.length}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm text-gray-500 mb-1">开始时间</div>
                  <div className="font-mono text-sm">
                    {formatDate(execution.startedAt)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">结束时间</div>
                  <div className="font-mono text-sm">
                    {execution.stoppedAt
                      ? formatDate(execution.stoppedAt)
                      : '-'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 执行步骤时间线 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                执行步骤时间线
              </CardTitle>
              <CardDescription>按执行顺序显示所有节点</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nodeExecutions.map((node, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {node.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : node.status === 'error' ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{node.nodeName}</span>
                        <Badge
                          variant={
                            node.status === 'success'
                              ? 'default'
                              : 'destructive'
                          }
                          className="text-xs"
                        >
                          {node.status === 'success' ? '成功' : '失败'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        耗时：{formatDuration(node.duration)} • 输入：
                        {node.inputItems} 项 • 输出：{node.outputItems} 项
                      </div>
                      {node.error && (
                        <div className="mt-1 text-sm text-red-600">
                          {node.error.message}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              导出数据
            </Button>
            <Button variant="outline">
              <Copy className="w-4 h-4 mr-2" />
              复制执行
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              分享
            </Button>
          </div>
        </div>
      )}

      {/* 执行步骤标签页 */}
      {activeTab === 'nodes' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              详细执行步骤
            </CardTitle>
            <CardDescription>每个节点的详细执行信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {nodeExecutions.map((node, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{node.nodeName}</h3>
                  <Badge
                    variant={
                      node.status === 'success' ? 'default' : 'destructive'
                    }
                  >
                    {node.status === 'success' ? '成功' : '失败'}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">耗时:</span>
                    <span className="ml-2 font-medium">
                      {formatDuration(node.duration)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">输入:</span>
                    <span className="ml-2 font-medium">
                      {node.inputItems} 项
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">输出:</span>
                    <span className="ml-2 font-medium">
                      {node.outputItems} 项
                    </span>
                  </div>
                </div>
                {node.error && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                    <strong>错误:</strong> {node.error.message}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 输入数据标签页 */}
      {activeTab === 'input' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              输入数据
            </CardTitle>
            <CardDescription>触发工作流的原始数据</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 border rounded-lg p-4 overflow-x-auto text-sm font-mono">
              {JSON.stringify(execution.data?.inputData || {}, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* 输出结果标签页 */}
      {activeTab === 'output' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              输出结果
            </CardTitle>
            <CardDescription>工作流执行的最终结果</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 border rounded-lg p-4 overflow-x-auto text-sm font-mono">
              {JSON.stringify(execution.data?.outputData || {}, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* 错误信息标签页 */}
      {activeTab === 'error' && execution.data?.resultData?.error && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              错误详情
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="font-semibold">
                {execution.data.resultData.error.name}
              </AlertDescription>
            </Alert>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="font-mono text-sm text-red-800 whitespace-pre-wrap">
                {execution.data.resultData.error.stack ||
                  execution.data.resultData.error.message}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
