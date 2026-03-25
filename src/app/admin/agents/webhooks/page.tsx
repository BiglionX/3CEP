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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  Webhook,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Webhook {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  workflowId: string;
  workflowName: string;
  status: 'active' | 'inactive' | 'error';
  calls: number;
  lastCalled?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AgentsWebhooksPage() {
  const { user } = useUnifiedAuth();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [testPayload, setTestPayload] = useState('{}');

  const N8N_BASE_URL =
    process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678';
  const N8N_API_KEY = process.env.N8N_API_TOKEN || '';

  const loadWebhooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${N8N_BASE_URL}/api/v1/webhooks`, {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`n8n API 错误：${response.status}`);
      }

      const data = await response.json();
      setWebhooks(data.data || []);
    } catch (err: any) {
      console.error('加载 Webhook 失败:', err);
      setWebhooks(getMockWebhooks());
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWebhook = async (webhookData: Partial<Webhook>) => {
    try {
      if (selectedWebhook) {
        const response = await fetch(
          `${N8N_BASE_URL}/api/v1/webhooks/${selectedWebhook.id}`,
          {
            method: 'PUT',
            headers: {
              'X-N8N-API-KEY': N8N_API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookData),
          }
        );

        if (!response.ok) throw new Error('更新失败');
      } else {
        const response = await fetch(`${N8N_BASE_URL}/api/v1/webhooks`, {
          method: 'POST',
          headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData),
        });

        if (!response.ok) throw new Error('创建失败');
      }

      await loadWebhooks();
      setDialogOpen(false);
      setSelectedWebhook(null);
    } catch (err: any) {
      console.error('保存 Webhook 失败:', err);
    }
  };

  const handleTestWebhook = async () => {
    if (!selectedWebhook) return;

    try {
      const response = await fetch(
        `${N8N_BASE_URL}/api/v1/webhooks/${selectedWebhook.id}/test`,
        {
          method: 'POST',
          headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
            'Content-Type': 'application/json',
          },
          body: testPayload,
        }
      );

      if (!response.ok) throw new Error('测试失败');

      alert('Webhook 测试成功！');
      setTestDialogOpen(false);
      setTestPayload('{}');
    } catch (err: any) {
      console.error('Webhook 测试失败:', err);
      alert(`测试失败：${err.message}`);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('确定要删除此 Webhook 吗？')) return;

    try {
      const response = await fetch(`${N8N_BASE_URL}/api/v1/webhooks/${id}`, {
        method: 'DELETE',
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
        },
      });

      if (!response.ok) throw new Error('删除失败');
      await loadWebhooks();
    } catch (err: any) {
      console.error('删除 Webhook 失败:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  const getMockWebhooks = (): Webhook[] => [
    {
      id: '1',
      name: '订单创建通知',
      url: 'https://api.example.com/webhooks/order-created',
      method: 'POST',
      workflowId: 'w1',
      workflowName: '订单处理工作流',
      status: 'active',
      calls: 1234,
      lastCalled: '2026-03-25T09:30:00Z',
      createdAt: '2026-03-20T10:00:00Z',
      updatedAt: '2026-03-24T09:30:00Z',
    },
    {
      id: '2',
      name: '支付成功回调',
      url: 'https://api.example.com/webhooks/payment-success',
      method: 'POST',
      workflowId: 'w2',
      workflowName: '支付处理工作流',
      status: 'active',
      calls: 890,
      lastCalled: '2026-03-25T08:45:00Z',
      createdAt: '2026-03-18T14:20:00Z',
      updatedAt: '2026-03-24T11:15:00Z',
    },
    {
      id: '3',
      name: '库存更新同步',
      url: 'https://api.example.com/webhooks/inventory-update',
      method: 'PUT',
      workflowId: 'w3',
      workflowName: '库存管理工作流',
      status: 'inactive',
      calls: 567,
      lastCalled: '2026-03-22T16:00:00Z',
      createdAt: '2026-03-15T08:00:00Z',
      updatedAt: '2026-03-23T23:00:00Z',
    },
  ];

  useEffect(() => {
    loadWebhooks();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            正常
          </Badge>
        );
      case 'inactive':
        return <Badge variant="secondary">未启用</Badge>;
      case 'error':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            异常
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-blue-100 text-blue-800',
      POST: 'bg-green-100 text-green-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={colors[method] || 'bg-gray-100 text-gray-800'}>
        {method}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面头部 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Webhook className="w-8 h-8 text-blue-600" />
            n8n Webhook 管理
          </h1>
          <p className="text-gray-600">管理 Webhook URL 和测试外部集成</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadWebhooks}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setSelectedWebhook(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            创建 Webhook
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总 Webhook 数</CardTitle>
            <Webhook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webhooks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              已配置的 Webhook
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃 Webhook</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {webhooks.filter(w => w.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              正在监听的 Webhook
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总调用次数</CardTitle>
            <Send className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {webhooks.reduce((sum, w) => sum + w.calls, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">累计调用次数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日调用</CardTitle>
            <RefreshCw className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                webhooks.filter(w => {
                  if (!w.lastCalled) return false;
                  const lastCall = new Date(w.lastCalled);
                  const today = new Date();
                  return lastCall.toDateString() === today.toDateString();
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              今日有调用的 Webhook
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Webhook 列表 */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook 列表</CardTitle>
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
              {webhooks.map(webhook => (
                <div
                  key={webhook.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {webhook.name}
                        </h3>
                        {getStatusBadge(webhook.status)}
                        {getMethodBadge(webhook.method)}
                      </div>

                      <div className="bg-gray-100 px-3 py-2 rounded font-mono text-sm mb-3 flex items-center gap-2">
                        <span className="text-gray-600 truncate">
                          {webhook.url}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(webhook.url)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        关联工作流：
                        <span className="font-medium">
                          {webhook.workflowName}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Send className="w-3 h-3" />
                          调用 {webhook.calls.toLocaleString()} 次
                        </span>
                        {webhook.lastCalled && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            最后调用：
                            {new Date(webhook.lastCalled).toLocaleString(
                              'zh-CN'
                            )}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          创建：
                          {new Date(webhook.createdAt).toLocaleDateString(
                            'zh-CN'
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedWebhook(webhook);
                          setTestDialogOpen(true);
                        }}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        测试
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedWebhook(webhook);
                          setDialogOpen(true);
                        }}
                      >
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteWebhook(webhook.id)}
                      >
                        <Trash2 className="w-4 h-4" />
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
            Webhook 管理说明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>为工作流创建唯一的 Webhook URL 用于接收外部事件</li>
            <li>支持 GET、POST、PUT、DELETE 等多种 HTTP 方法</li>
            <li>可以发送测试请求验证 Webhook 配置是否正确</li>
            <li>查看 Webhook 的调用历史和状态监控</li>
            <li>如果连接失败，将显示模拟数据用于演示</li>
          </ul>
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedWebhook ? '编辑 Webhook' : '创建 Webhook'}
            </DialogTitle>
            <DialogDescription>配置工作流的 Webhook URL</DialogDescription>
          </DialogHeader>

          <form
            onSubmit={e => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveWebhook({
                name: formData.get('name') as string,
                url: formData.get('url') as string,
                method: formData.get('method') as Webhook['method'],
                workflowId: formData.get('workflowId') as string,
              });
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  名称
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={selectedWebhook?.name}
                  className="col-span-3"
                  placeholder="例如：订单创建通知"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="method" className="text-right">
                  HTTP 方法
                </Label>
                <Select
                  name="method"
                  defaultValue={selectedWebhook?.method || 'POST'}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择方法" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="url" className="text-right">
                  URL
                </Label>
                <Input
                  id="url"
                  name="url"
                  defaultValue={selectedWebhook?.url}
                  className="col-span-3"
                  placeholder="https://api.example.com/webhook"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="workflowId" className="text-right">
                  工作流
                </Label>
                <Select
                  name="workflowId"
                  defaultValue={selectedWebhook?.workflowId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择工作流" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="w1">订单处理工作流</SelectItem>
                    <SelectItem value="w2">支付处理工作流</SelectItem>
                    <SelectItem value="w3">库存管理工作流</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                取消
              </Button>
              <Button type="submit">
                {selectedWebhook ? '保存更改' : '创建 Webhook'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 测试对话框 */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>测试 Webhook</DialogTitle>
            <DialogDescription>
              发送测试请求到 {selectedWebhook?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="payload">JSON Payload</Label>
            <div className="mt-2">
              <textarea
                id="payload"
                rows={8}
                value={testPayload}
                onChange={e => setTestPayload(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder='{"key": "value"}'
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              这将向 {selectedWebhook?.url} 发送一个 {selectedWebhook?.method}{' '}
              请求
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleTestWebhook}>
              <Send className="w-4 h-4 mr-2" />
              发送测试
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
