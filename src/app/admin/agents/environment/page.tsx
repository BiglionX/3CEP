'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  Variable,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  type: 'public' | 'secret';
  description?: string;
  isEncrypted: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  lastAccessed?: string;
}

export default function AgentsEnvironmentPage() {
  const { user: _user } = useUnifiedAuth();
  const [variables, setVariables] = useState<EnvironmentVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVar, setEditingVar] = useState<EnvironmentVariable | null>(
    null
  );
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  const N8N_BASE_URL =
    process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678';
  const N8N_API_KEY = process.env.N8N_API_TOKEN || '';

  const loadVariables = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${N8N_BASE_URL}/api/v1/variables`, {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`n8n API 错误：${response.status}`);
      }

      const data = await response.json();
      setVariables(data.data || []);
    } catch (err: any) {
      console.error('加载环境变量失败:', err);
      setVariables(getMockVariables());
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVariable = async (varData: Partial<EnvironmentVariable>) => {
    try {
      if (editingVar) {
        const response = await fetch(
          `${N8N_BASE_URL}/api/v1/variables/${editingVar.id}`,
          {
            method: 'PUT',
            headers: {
              'X-N8N-API-KEY': N8N_API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(varData),
          }
        );

        if (!response.ok) throw new Error('更新失败');
      } else {
        const response = await fetch(`${N8N_BASE_URL}/api/v1/variables`, {
          method: 'POST',
          headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(varData),
        });

        if (!response.ok) throw new Error('创建失败');
      }

      await loadVariables();
      setDialogOpen(false);
      setEditingVar(null);
    } catch (err: any) {
      console.error('保存环境变量失败:', err);
    }
  };

  const handleDeleteVariable = async (id: string) => {
    if (!confirm('确定要删除此环境变量吗？')) return;

    try {
      const response = await fetch(`${N8N_BASE_URL}/api/v1/variables/${id}`, {
        method: 'DELETE',
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
        },
      });

      if (!response.ok) throw new Error('删除失败');
      await loadVariables();
    } catch (err: any) {
      console.error('删除环境变量失败:', err);
    }
  };

  const toggleValueVisibility = (id: string) => {
    setShowValues(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  const getMockVariables = (): EnvironmentVariable[] => {
    return [
      {
        id: '1',
        key: 'STRIPE_SECRET_KEY',
        value: 'sk_test_************************abc123',
        type: 'secret',
        description: 'Stripe 支付密钥',
        isEncrypted: true,
        status: 'active',
        createdAt: '2026-03-20T10:00:00Z',
        updatedAt: '2026-03-24T09:30:00Z',
        lastAccessed: '2026-03-25T09:00:00Z',
      },
      {
        id: '2',
        key: 'NEXT_PUBLIC_SITE_URL',
        value: 'https://example.com',
        type: 'public',
        description: '网站基础 URL',
        isEncrypted: false,
        status: 'active',
        createdAt: '2026-03-18T14:20:00Z',
        updatedAt: '2026-03-24T11:15:00Z',
        lastAccessed: '2026-03-25T08:30:00Z',
      },
      {
        id: '3',
        key: 'DEEPSEEK_API_KEY',
        value: 'sk_************************xyz789',
        type: 'secret',
        description: 'DeepSeek AI API 密钥',
        isEncrypted: true,
        status: 'active',
        createdAt: '2026-03-15T08:00:00Z',
        updatedAt: '2026-03-23T23:00:00Z',
        lastAccessed: '2026-03-25T07:45:00Z',
      },
      {
        id: '4',
        key: 'SMTP_PASSWORD',
        value: '************************pass456',
        type: 'secret',
        description: '邮件服务器密码',
        isEncrypted: true,
        status: 'inactive',
        createdAt: '2026-03-10T16:45:00Z',
        updatedAt: '2026-03-22T09:45:00Z',
      },
    ];
  };

  useEffect(() => {
    loadVariables();
  }, []);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'public':
        return <Badge variant="outline">公开</Badge>;
      case 'secret':
        return (
          <Badge variant="default" className="gap-1">
            <Shield className="w-3 h-3" />
            密钥
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            启用
          </Badge>
        );
      case 'inactive':
        return <Badge variant="secondary">未启用</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredVariables = {
    all: variables,
    public: variables.filter(v => v.type === 'public'),
    secret: variables.filter(v => v.type === 'secret'),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面头部 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Variable className="w-8 h-8 text-blue-600" />
            n8n 环境变量管理
          </h1>
          <p className="text-gray-600">配置全局变量和敏感密钥</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadVariables}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setEditingVar(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            添加变量
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总变量数</CardTitle>
            <Variable className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{variables.length}</div>
            <p className="text-xs text-muted-foreground mt-1">环境变量总数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">公开变量</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredVariables.public.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              可公开访问的变量
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">密钥变量</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredVariables.secret.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">加密存储的密钥</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">启用的变量</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {variables.filter(v => v.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">正在使用的变量</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab 切换 */}
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">全部 ({variables.length})</TabsTrigger>
          <TabsTrigger value="public">
            公开 ({filteredVariables.public.length})
          </TabsTrigger>
          <TabsTrigger value="secret">
            密钥 ({filteredVariables.secret.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <VariableList
            variables={filteredVariables.all}
            loading={loading}
            showValues={showValues}
            onToggleVisibility={toggleValueVisibility}
            onCopy={copyToClipboard}
            onEdit={(v: EnvironmentVariable) => {
              setEditingVar(v);
              setDialogOpen(true);
            }}
            onDelete={handleDeleteVariable}
            getTypeBadge={getTypeBadge}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="public">
          <VariableList
            variables={filteredVariables.public}
            loading={loading}
            showValues={showValues}
            onToggleVisibility={toggleValueVisibility}
            onCopy={copyToClipboard}
            onEdit={(v: EnvironmentVariable) => {
              setEditingVar(v);
              setDialogOpen(true);
            }}
            onDelete={handleDeleteVariable}
            getTypeBadge={getTypeBadge}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="secret">
          <VariableList
            variables={filteredVariables.secret}
            loading={loading}
            showValues={showValues}
            onToggleVisibility={toggleValueVisibility}
            onCopy={copyToClipboard}
            onEdit={(v: EnvironmentVariable) => {
              setEditingVar(v);
              setDialogOpen(true);
            }}
            onDelete={handleDeleteVariable}
            getTypeBadge={getTypeBadge}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
      </Tabs>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            环境变量管理说明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>环境变量分为公开变量和密钥两种类型</li>
            <li>密钥类型变量会自动加密存储，确保安全</li>
            <li>
              可以在工作流中通过{' '}
              <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                {'{{ $env.VARIABLE_NAME }}'}
              </code>{' '}
              引用环境变量
            </li>
            <li>支持随时查看、复制和修改变量值</li>
            <li>如果连接失败，将显示模拟数据用于演示</li>
          </ul>
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingVar ? '编辑环境变量' : '添加环境变量'}
            </DialogTitle>
            <DialogDescription>配置全局环境变量和密钥</DialogDescription>
          </DialogHeader>

          <form
            onSubmit={e => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveVariable({
                key: formData.get('key') as string,
                value: formData.get('value') as string,
                type: formData.get('type') as 'public' | 'secret',
                description: formData.get('description') as string,
              });
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="key" className="text-right">
                  变量名
                </Label>
                <Input
                  id="key"
                  name="key"
                  defaultValue={editingVar?.key}
                  className="col-span-3"
                  placeholder="例如：API_KEY"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  类型
                </Label>
                <Select name="type" defaultValue={editingVar?.type || 'public'}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">公开变量</SelectItem>
                    <SelectItem value="secret">密钥</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">
                  变量值
                </Label>
                <Input
                  id="value"
                  name="value"
                  defaultValue={editingVar?.value}
                  className="col-span-3"
                  placeholder="变量值"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  描述
                </Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={editingVar?.description}
                  className="col-span-3"
                  placeholder="变量用途说明"
                />
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
                {editingVar ? '保存更改' : '添加变量'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 变量列表组件
function VariableList({
  variables,
  loading,
  showValues,
  onToggleVisibility,
  onCopy,
  onEdit,
  onDelete,
  getTypeBadge,
  getStatusBadge,
}: any) {
  return (
    <Card>
      <CardContent className="pt-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
            <p>加载中...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {variables.map((variable: EnvironmentVariable) => (
              <div
                key={variable.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg font-mono">
                        {variable.key}
                      </h3>
                      {getTypeBadge(variable.type)}
                      {getStatusBadge(variable.status)}
                      {variable.isEncrypted && (
                        <Badge variant="outline" className="gap-1">
                          <Shield className="w-3 h-3" />
                          已加密
                        </Badge>
                      )}
                    </div>

                    <div className="bg-gray-100 px-3 py-2 rounded font-mono text-sm mb-3 flex items-center gap-2 max-w-md">
                      <span className="text-gray-600 truncate">
                        {showValues[variable.id] || variable.type === 'public'
                          ? variable.value
                          : '•'.repeat(Math.min(variable.value.length, 20))}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleVisibility(variable.id)}
                      >
                        {showValues[variable.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCopy(variable.value)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>

                    {variable.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {variable.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {variable.lastAccessed && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          最后使用：
                          {new Date(variable.lastAccessed).toLocaleString(
                            'zh-CN'
                          )}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        更新：
                        {new Date(variable.updatedAt).toLocaleDateString(
                          'zh-CN'
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(variable)}
                    >
                      编辑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(variable.id)}
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
  );
}
