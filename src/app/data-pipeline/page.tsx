'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Activity,
  BarChart3,
  Database,
  Download,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface PipelineStatus {
  bufferSize: number;
  isRunning: boolean;
  lastFlush: string | null;
  totalCollected: number;
}

interface MetricData {
  time_bucket: string;
  metric_name: string;
  avg_value: number;
  max_value: number;
  min_value: number;
  count: number;
}

export default function DataPipelinePage() {
  const [status, setStatus] = useState<PipelineStatus>({
    bufferSize: 0,
    isRunning: true,
    lastFlush: null,
    totalCollected: 0,
  });

  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    metricName: 'user_activity',
    value: '',
    dimensions: '{}',
    source: 'web',
  });

  // 模拟数据管道状态更新
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        bufferSize: Math.floor(Math.random() * 50),
        lastFlush: new Date().toISOString(),
        totalCollected: prev.totalCollected + Math.floor(Math.random() * 10),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleCollect = async () => {
    if (!formData.value) return;

    try {
      const response = await fetch('/api/data-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'collect',
          data: {
            metricName: formData.metricName,
            value: parseFloat(formData.value),
            dimensions: JSON.parse(formData.dimensions || '{}'),
            source: formData.source,
          },
        }),
      });

      if (response.ok) {
        setFormData(prev => ({ ...prev, value: '' }));
        alert('数据收集成功');
      }
    } catch (error) {
      console.error('收集失败:', error);
    }
  };

  const handleBatchCollect = async () => {
    try {
      const batchData = [
        { metricName: 'page_views', value: 150, dimensions: { page: '/home' } },
        {
          metricName: 'user_sessions',
          value: 85,
          dimensions: { device: 'mobile' },
        },
        {
          metricName: 'api_requests',
          value: 230,
          dimensions: { endpoint: '/api/users' },
        },
      ];

      const response = await fetch('/api/data-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'collectBatch',
          data: batchData,
        }),
      });

      if (response.ok) {
        alert('批量数据收集成功');
      }
    } catch (error) {
      console.error('批量收集失败:', error);
    }
  };

  const handleFlush = async () => {
    try {
      const response = await fetch('/api/data-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'flush' }),
      });

      if (response.ok) {
        alert('缓冲区已刷新');
      }
    } catch (error) {
      console.error('刷新失败:', error);
    }
  };

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000); // 7天前

      const response = await fetch(
        `/api/data-pipelineaction=aggregated&metrics=user_activity,page_views,user_sessions&startTime=${startTime.toISOString()}&endTime=${endTime.toISOString()}`
      );

      const data = await response.json();
      if (data.success) {
        setMetrics(data.data);
      }
    } catch (error) {
      console.error('加载指标失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format: 'json' | 'csv') => {
    try {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // 24小时
      const response = await fetch(
        `/api/data-pipelineaction=export&startTime=${startTime.toISOString()}&endTime=${endTime.toISOString()}&format=${format}`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data-export-${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('导出失败:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Database className="w-10 h-10 text-blue-600" />
            数据收集管道
          </h1>
          <p className="text-gray-600">实时数据采集、处理和分析平台</p>
        </div>

        {/* 状态卡*/}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">缓冲区大 </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {status.bufferSize}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">运行状态</p>
                  <Badge variant={status.isRunning ? 'default' : 'destructive'}>
                    {status.isRunning ? '运行中' : '已停止'}
                  </Badge>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${status.isRunning ? 'bg-green-500' : 'bg-red-500'}`}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总收集量</p>
                  <p className="text-2xl font-bold text-green-600">
                    {status.totalCollected}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">上次刷新</p>
                  <p className="text-sm text-gray-500">
                    {status.lastFlush
                      ? new Date(status.lastFlush).toLocaleTimeString()
                      : '从未'}
                  </p>
                </div>
                <RotateCcw className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 数据收集表单 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                数据收集
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="metricName">指标名称</Label>
                  <Input
                    id="metricName"
                    value={formData.metricName}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        metricName: e.target.value,
                      }))
                    }
                    placeholder=" user_activity"
                  />
                </div>
                <div>
                  <Label htmlFor="value">数值</Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, value: e.target.value }))
                    }
                    placeholder="输入数值"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dimensions">维度信息 (JSON格式)</Label>
                <Textarea
                  id="dimensions"
                  value={formData.dimensions}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      dimensions: e.target.value,
                    }))
                  }
                  placeholder='{"device": "mobile", "region": "beijing"}'
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="source">数据源</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, source: e.target.value }))
                  }
                  placeholder=" web, mobile, api"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleCollect} className="flex-1">
                  收集数据
                </Button>
                <Button onClick={handleBatchCollect} variant="outline">
                  批量收集
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 控制面板 */}
          <Card>
            <CardHeader>
              <CardTitle>管道控制</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleFlush} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  立即刷新
                </Button>
                <Button onClick={() => exportData('json')} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  导出JSON
                </Button>
              </div>

              <Button
                onClick={() => exportData('csv')}
                className="w-full"
                variant="secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                导出CSV格式
              </Button>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">快速操作示例</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>用户活跃 metricName=user_activity, value=42</p>
                  <p>页面浏览 metricName=page_views, value=156</p>
                  <p>API请求 metricName=api_requests, value=89</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 聚合数据展示 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              聚合数据分析 (最近7天)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">查看历史指标聚合数据</p>
              <Button
                onClick={loadMetrics}
                disabled={loading}
                variant="outline"
              >
                {loading ? '加载中..' : '加载数据'}
              </Button>
            </div>

            {metrics.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">时间</th>
                      <th className="text-left py-2 px-4">指标名称</th>
                      <th className="text-left py-2 px-4">平均值</th>
                      <th className="text-left py-2 px-4">最大值</th>
                      <th className="text-left py-2 px-4">最小值</th>
                      <th className="text-left py-2 px-4">样本数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((metric, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">
                          {new Date(metric.time_bucket).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-4">
                          <Badge variant="secondary">
                            {metric.metric_name}
                          </Badge>
                        </td>
                        <td className="py-2 px-4 font-medium">
                          {metric.avg_value.toFixed(2)}
                        </td>
                        <td className="py-2 px-4 text-green-600">
                          {metric.max_value}
                        </td>
                        <td className="py-2 px-4 text-red-600">
                          {metric.min_value}
                        </td>
                        <td className="py-2 px-4">{metric.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                点击"加载数据"查看聚合指标分析
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
