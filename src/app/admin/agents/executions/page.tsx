'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  XCircle,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Execution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'success' | 'error' | 'running' | 'waiting';
  startedAt: string;
  stoppedAt?: string;
  duration?: number;
  errorMessage?: string;
  mode: 'production' | 'test' | 'manual' | 'api';
  retryOf?: string;
}

/**
 * n8n 工作流执行历史列表页面
 */
export default function AgentsExecutionsPage() {
  const { user } = useUnifiedAuth();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'success' | 'error' | 'running'
  >('all');
  const [error, setError] = useState<string | null>(null);

  // n8n API 配置
  const N8N_BASE_URL =
    process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678';
  const N8N_API_KEY = process.env.N8N_API_TOKEN || '';

  // 加载执行历史
  const loadExecutions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${N8N_BASE_URL}/api/v1/executions?limit=100`,
        {
          headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`n8n API 错误：${response.status}`);
      }

      const data = await response.json();
      setExecutions(data.data || []);
    } catch (err: any) {
      console.error('加载执行历史失败:', err);
      setError(err.message);
      // 使用模拟数据演示
      setExecutions(getMockExecutions());
    } finally {
      setLoading(false);
    }
  };

  // 模拟执行数据
  const getMockExecutions = (): Execution[] => {
    const now = Date.now();
    return [
      {
        id: '1001',
        workflowId: '1',
        workflowName: '订单处理自动化流程',
        status: 'success',
        startedAt: new Date(now - 300000).toISOString(),
        stoppedAt: new Date(now - 297660).toISOString(),
        duration: 2340,
        mode: 'production',
      },
      {
        id: '1002',
        workflowId: '2',
        workflowName: '客户服务智能回复',
        status: 'success',
        startedAt: new Date(now - 600000).toISOString(),
        stoppedAt: new Date(now - 598440).toISOString(),
        duration: 1560,
        mode: 'production',
      },
      {
        id: '1003',
        workflowId: '3',
        workflowName: '库存预警系统',
        status: 'error',
        startedAt: new Date(now - 900000).toISOString(),
        stoppedAt: new Date(now - 895000).toISOString(),
        duration: 5000,
        errorMessage: 'API 连接超时：无法连接到库存管理系统 (ERP)',
        mode: 'production',
      },
      {
        id: '1004',
        workflowId: '1',
        workflowName: '订单处理自动化流程',
        status: 'running',
        startedAt: new Date(now - 120000).toISOString(),
        mode: 'manual',
      },
      {
        id: '1005',
        workflowId: '4',
        workflowName: '每日数据报告生成',
        status: 'success',
        startedAt: new Date(now - 86400000).toISOString(),
        stoppedAt: new Date(now - 86385000).toISOString(),
        duration: 15000,
        mode: 'production',
      },
      {
        id: '1006',
        workflowId: '2',
        workflowName: '客户服务智能回复',
        status: 'error',
        startedAt: new Date(now - 172800000).toISOString(),
        stoppedAt: new Date(now - 172795000).toISOString(),
        duration: 5000,
        errorMessage: '凭证已过期：请更新 OpenAI API Key',
        mode: 'production',
      },
      {
        id: '1007',
        workflowId: '5',
        workflowName: '用户行为追踪',
        status: 'success',
        startedAt: new Date(now - 259200000).toISOString(),
        stoppedAt: new Date(now - 259198500).toISOString(),
        duration: 1500,
        mode: 'test',
      },
    ];
  };

  useEffect(() => {
    loadExecutions();

    // 自动刷新运行中的执行
    const interval = setInterval(() => {
      const hasRunning = executions.some(e => e.status === 'running');
      if (hasRunning) {
        loadExecutions();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 过滤执行记录
  const filteredExecutions = executions.filter(execution => {
    const matchesSearch =
      execution.workflowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      execution.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' || execution.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // 格式化持续时间
  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  // 获取状态图标和颜色
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="default" className="bg-green-500">
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
      case 'waiting':
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            等待中
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // 获取模式徽章
  const getModeBadge = (mode: string) => {
    switch (mode) {
      case 'production':
        return <Badge variant="outline">生产</Badge>;
      case 'test':
        return <Badge variant="secondary">测试</Badge>;
      case 'manual':
        return <Badge variant="outline">手动</Badge>;
      case 'api':
        return <Badge variant="outline">API</Badge>;
      default:
        return <Badge variant="outline">{mode}</Badge>;
    }
  };

  // 统计信息
  const stats = {
    total: filteredExecutions.length,
    success: filteredExecutions.filter(e => e.status === 'success').length,
    error: filteredExecutions.filter(e => e.status === 'error').length,
    running: filteredExecutions.filter(e => e.status === 'running').length,
  };

  const successRate =
    stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面头部 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            执行历史
          </h1>
          <p className="text-gray-600">查看所有工作流的执行记录和详细信息</p>
        </div>
        <Button onClick={loadExecutions} variant="outline" size="sm">
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
          />
          刷新
        </Button>
      </div>

      {/* 错误提示 */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
              <span className="text-xs ml-2">(显示模拟数据)</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总执行数</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              筛选条件下的总数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成功</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.success}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              成功率 {successRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">失败</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.error}</div>
            <p className="text-xs text-muted-foreground mt-1">
              失败率 {((stats.error / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">运行中</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.running}
            </div>
            <p className="text-xs text-muted-foreground mt-1">当前正在执行</p>
          </CardContent>
        </Card>
      </div>

      {/* 筛选工具栏 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索工作流名称或执行 ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="success">成功</option>
              <option value="error">失败</option>
              <option value="running">运行中</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 执行列表 */}
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
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredExecutions.map(execution => (
                <Link
                  key={execution.id}
                  href={`/admin/agents/executions/${execution.id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="p-4 flex items-start gap-4">
                    {/* 状态图标 */}
                    <div className="flex-shrink-0 mt-1">
                      {getStatusBadge(execution.status)}
                    </div>

                    {/* 主要信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">
                          {execution.workflowName}
                        </h3>
                        {getModeBadge(execution.mode)}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(execution.startedAt).toLocaleString(
                            'zh-CN'
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          耗时：{formatDuration(execution.duration)}
                        </span>
                        <span className="flex items-center gap-1">
                          ID: {execution.id}
                        </span>
                      </div>

                      {/* 错误信息 */}
                      {execution.errorMessage && (
                        <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {execution.errorMessage}
                        </div>
                      )}
                    </div>

                    {/* 详情链接 */}
                    <div className="flex-shrink-0">
                      <Button variant="ghost" size="sm">
                        详情
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* 空状态 */}
            {filteredExecutions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Zap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">暂无执行记录</p>
                <p className="text-sm">
                  {searchTerm || filterStatus !== 'all'
                    ? '尝试调整搜索条件或筛选器'
                    : '工作流执行后会在这里显示记录'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 使用说明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            说明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>点击任意执行记录可查看详细信息</li>
            <li>运行中的执行会自动刷新（每 5 秒）</li>
            <li>支持按状态筛选和关键词搜索</li>
            <li>绿色表示成功，红色表示失败，蓝色旋转图标表示运行中</li>
            <li>显示最近 100 条执行记录</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
