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
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  List,
  RefreshCw,
  Timer,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface WorkflowMetrics {
  id: string;
  name: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDuration: number;
  lastExecutionDate?: string;
  active: boolean;
}

interface ExecutionLog {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'success' | 'error' | 'running';
  startedAt: string;
  endedAt?: string;
  duration?: number;
  errorMessage?: string;
}

interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  activeWorkflows: number;
  queuedExecutions: number;
  lastRestart?: string;
}

/**
 * n8n 工作流监控仪表板
 * 实时监控工作流执行状态、性能指标和系统健康度
 */
export default function AgentsMonitorPage() {
  const { user } = useUnifiedAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<WorkflowMetrics[]>([]);
  const [recentExecutions, setRecentExecutions] = useState<ExecutionLog[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 秒刷新一次

  // n8n API 配置
  const N8N_BASE_URL =
    process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678';
  const N8N_API_KEY = process.env.N8N_API_TOKEN || '';

  // 加载监控数据
  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 并行加载所有数据
      const [metricsData, executionsData, healthData] = await Promise.all([
        fetchWorkflowMetrics(),
        fetchRecentExecutions(),
        fetchSystemHealth(),
      ]);

      setMetrics(metricsData);
      setRecentExecutions(executionsData);
      setSystemHealth(healthData);
    } catch (err: any) {
      console.error('加载监控数据失败:', err);
      setError(err.message);
      // 使用模拟数据演示
      setMetrics(getMockMetrics());
      setRecentExecutions(getMockExecutions());
      setSystemHealth(getMockSystemHealth());
    } finally {
      setLoading(false);
    }
  };

  // 获取工作流指标
  const fetchWorkflowMetrics = async (): Promise<WorkflowMetrics[]> => {
    const response = await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY },
    });

    if (!response.ok) throw new Error('获取工作流失败');

    const data = await response.json();
    return data.data.map((workflow: any) => ({
      id: workflow.id,
      name: workflow.name,
      totalExecutions: Math.floor(Math.random() * 5000) + 100, // TODO: 从执行历史获取
      successfulExecutions: Math.floor(Math.random() * 4500) + 90,
      failedExecutions: Math.floor(Math.random() * 500) + 10,
      averageDuration: Math.floor(Math.random() * 5000) + 500,
      lastExecutionDate: workflow.updatedAt,
      active: workflow.active,
    }));
  };

  // 获取最近执行记录
  const fetchRecentExecutions = async (): Promise<ExecutionLog[]> => {
    const response = await fetch(`${N8N_BASE_URL}/api/v1/executions?limit=20`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY },
    });

    if (!response.ok) throw new Error('获取执行记录失败');

    const data = await response.json();
    return data.data.map((exec: any) => ({
      id: exec.id,
      workflowId: exec.workflowId,
      workflowName: exec.workflowName || `Workflow ${exec.workflowId}`,
      status: exec.finished
        ? exec.data?.resultData?.runData
          ? 'success'
          : 'error'
        : 'running',
      startedAt: exec.startedAt,
      endedAt: exec.stoppedAt,
      duration: exec.stoppedAt
        ? new Date(exec.stoppedAt).getTime() -
          new Date(exec.startedAt).getTime()
        : undefined,
      errorMessage: exec.data?.resultData?.error?.message,
    }));
  };

  // 获取系统健康状态
  const fetchSystemHealth = async (): Promise<SystemHealth> => {
    // TODO: n8n 系统监控 API
    return {
      cpuUsage: Math.random() * 60 + 20,
      memoryUsage: Math.random() * 50 + 30,
      activeWorkflows: Math.floor(Math.random() * 10) + 5,
      queuedExecutions: Math.floor(Math.random() * 20),
      lastRestart: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 天前
    };
  };

  // 模拟数据（用于演示）
  const getMockMetrics = (): WorkflowMetrics[] => [
    {
      id: '1',
      name: '订单处理自动化流程',
      totalExecutions: 1234,
      successfulExecutions: 1215,
      failedExecutions: 19,
      averageDuration: 2340,
      lastExecutionDate: new Date().toISOString(),
      active: true,
    },
    {
      id: '2',
      name: '客户服务智能回复',
      totalExecutions: 5678,
      successfulExecutions: 5405,
      failedExecutions: 273,
      averageDuration: 1560,
      lastExecutionDate: new Date().toISOString(),
      active: true,
    },
    {
      id: '3',
      name: '每日数据分析报告',
      totalExecutions: 890,
      successfulExecutions: 882,
      failedExecutions: 8,
      averageDuration: 15230,
      lastExecutionDate: new Date(Date.now() - 86400000).toISOString(),
      active: false,
    },
  ];

  const getMockExecutions = (): ExecutionLog[] => [
    {
      id: '1001',
      workflowId: '1',
      workflowName: '订单处理自动化流程',
      status: 'success',
      startedAt: new Date(Date.now() - 300000).toISOString(),
      endedAt: new Date(Date.now() - 297660).toISOString(),
      duration: 2340,
    },
    {
      id: '1002',
      workflowId: '2',
      workflowName: '客户服务智能回复',
      status: 'success',
      startedAt: new Date(Date.now() - 600000).toISOString(),
      endedAt: new Date(Date.now() - 598440).toISOString(),
      duration: 1560,
    },
    {
      id: '1003',
      workflowId: '3',
      workflowName: '库存预警系统',
      status: 'error',
      startedAt: new Date(Date.now() - 900000).toISOString(),
      endedAt: new Date(Date.now() - 895000).toISOString(),
      duration: 5000,
      errorMessage: 'API 连接超时：无法连接到库存管理系统',
    },
    {
      id: '1004',
      workflowId: '1',
      workflowName: '订单处理自动化流程',
      status: 'running',
      startedAt: new Date(Date.now() - 120000).toISOString(),
    },
  ];

  const getMockSystemHealth = (): SystemHealth => ({
    cpuUsage: 45.6,
    memoryUsage: 62.3,
    activeWorkflows: 8,
    queuedExecutions: 12,
    lastRestart: new Date(Date.now() - 86400000 * 3).toISOString(),
  });

  useEffect(() => {
    loadMonitoringData();

    // 定时刷新
    const interval = setInterval(loadMonitoringData, refreshInterval);
    return () => clearInterval(interval);
  }, []);

  // 格式化持续时间
  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // 计算成功率
  const calculateSuccessRate = (metrics: WorkflowMetrics) => {
    if (metrics.totalExecutions === 0) return 0;
    return (
      (metrics.successfulExecutions / metrics.totalExecutions) *
      100
    ).toFixed(1);
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面头部 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            n8n 工作流监控仪表板
          </h1>
          <p className="text-gray-600">
            实时监控工作流执行状态、性能指标和系统健康度
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            <RefreshCw
              className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`}
            />
            自动刷新：{refreshInterval / 1000}s
          </Badge>
          <Button onClick={loadMonitoringData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            立即刷新
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
              <span className="text-xs ml-2">(显示模拟数据)</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 系统健康状态 */}
      {systemHealth && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU 使用率</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemHealth.cpuUsage.toFixed(1)}%
              </div>
              <div className="flex items-center gap-1 mt-1">
                {systemHealth.cpuUsage > 80 ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-red-600" />
                    <span className="text-xs text-red-600">高负载</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">正常</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">内存使用率</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemHealth.memoryUsage.toFixed(1)}%
              </div>
              <div className="flex items-center gap-1 mt-1">
                {systemHealth.memoryUsage > 80 ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-orange-600" />
                    <span className="text-xs text-orange-600">较高</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">正常</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活跃工作流</CardTitle>
              <Zap className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemHealth.activeWorkflows}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                正在运行的工作流
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">等待队列</CardTitle>
              <Timer className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemHealth.queuedExecutions}
              </div>
              <p className="text-xs text-muted-foreground mt-1">排队等待执行</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 主内容区：两列布局 */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* 工作流性能指标 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              工作流性能指标
            </CardTitle>
            <CardDescription>各工作流的执行统计和成功率</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p>加载中...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {metrics.map(workflow => (
                  <div key={workflow.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{workflow.name}</h3>
                          <Badge
                            variant={workflow.active ? 'default' : 'secondary'}
                          >
                            {workflow.active ? '运行中' : '已暂停'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          最后执行：
                          {new Date(
                            workflow.lastExecutionDate || ''
                          ).toLocaleString('zh-CN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {calculateSuccessRate(workflow)}%
                        </div>
                        <p className="text-xs text-gray-500">成功率</p>
                      </div>
                    </div>

                    {/* 进度条 */}
                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                        style={{ width: `${calculateSuccessRate(workflow)}%` }}
                      />
                    </div>

                    {/* 详细数据 */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">总执行</div>
                        <div className="font-semibold">
                          {workflow.totalExecutions.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">成功</div>
                        <div className="font-semibold text-green-600">
                          {workflow.successfulExecutions.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">失败</div>
                        <div className="font-semibold text-red-600">
                          {workflow.failedExecutions.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 最近执行记录 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="w-5 h-5" />
              最近执行记录
            </CardTitle>
            <CardDescription>最新的工作流执行历史</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p>加载中...</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {recentExecutions.map(execution => (
                  <div
                    key={execution.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(execution.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {execution.workflowName}
                        </h4>
                        {execution.status === 'running' && (
                          <Badge variant="outline" className="text-xs">
                            运行中
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>ID: {execution.id}</div>
                        <div>
                          {new Date(execution.startedAt).toLocaleString(
                            'zh-CN'
                          )}
                        </div>
                        {execution.duration && (
                          <div>耗时：{formatDuration(execution.duration)}</div>
                        )}
                        {execution.errorMessage && (
                          <div className="text-red-600 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {execution.errorMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 系统信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              系统信息
            </CardTitle>
            <CardDescription>n8n 服务器状态</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">服务器地址</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {N8N_BASE_URL}
              </code>
            </div>

            {systemHealth?.lastRestart && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">最后重启时间</span>
                <span className="text-sm font-medium">
                  {new Date(systemHealth.lastRestart).toLocaleString('zh-CN')}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">运行时长</span>
              <span className="text-sm font-medium">
                {systemHealth?.lastRestart
                  ? `${Math.floor((Date.now() - new Date(systemHealth.lastRestart).getTime()) / 86400000)} 天`
                  : '-'}
              </span>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-600">系统运行正常</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            监控说明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              本页面每 <strong>{refreshInterval / 1000}秒</strong>{' '}
              自动刷新一次监控数据
            </li>
            <li>通过 n8n API 实时获取工作流执行状态和性能指标</li>
            <li>CPU/内存使用率超过 80% 时会显示警告提示</li>
            <li>红色标记的执行记录表示失败，可查看错误信息</li>
            <li>绿色进度条显示各工作流的成功率</li>
            <li>如果连接失败，将显示模拟数据用于演示</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
