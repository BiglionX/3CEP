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
  Database,
  Key,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Credential {
  id: string;
  name: string;
  type: 'api_key' | 'oauth2' | 'database' | 'secret';
  provider: string;
  status: 'active' | 'inactive' | 'error';
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
  metadata?: Record<string, any>;
}

export default function AgentsCredentialsPage() {
  const { user: _user } = useUnifiedAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<
    'all' | 'api_key' | 'oauth2' | 'database' | 'secret'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');

  const N8N_BASE_URL =
    process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678';
  const N8N_API_KEY = process.env.N8N_API_TOKEN || '';

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${N8N_BASE_URL}/api/v1/credentials`, {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`n8n API 错误：${response.status}`);
      }

      const data = await response.json();
      setCredentials(data.data || []);
    } catch (err: any) {
      console.error('加载凭证失败:', err);
      setCredentials(getMockCredentials());
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCredential = async (credentialData: Partial<Credential>) => {
    try {
      if (editingCredential) {
        const response = await fetch(
          `${N8N_BASE_URL}/api/v1/credentials/${editingCredential.id}`,
          {
            method: 'PUT',
            headers: {
              'X-N8N-API-KEY': N8N_API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentialData),
          }
        );

        if (!response.ok) throw new Error('更新失败');
      } else {
        const response = await fetch(`${N8N_BASE_URL}/api/v1/credentials`, {
          method: 'POST',
          headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentialData),
        });

        if (!response.ok) throw new Error('创建失败');
      }

      await loadCredentials();
      setDialogOpen(false);
      setEditingCredential(null);
    } catch (err: any) {
      console.error('保存凭证失败:', err);
    }
  };

  const handleDeleteCredential = async (id: string) => {
    if (!confirm('确定要删除此凭证吗？')) return;

    try {
      const response = await fetch(`${N8N_BASE_URL}/api/v1/credentials/${id}`, {
        method: 'DELETE',
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
        },
      });

      if (!response.ok) throw new Error('删除失败');
      await loadCredentials();
    } catch (err: any) {
      console.error('删除凭证失败:', err);
    }
  };

  const getMockCredentials = (): Credential[] => [
    {
      id: '1',
      name: 'Stripe API Key',
      type: 'api_key',
      provider: 'Stripe',
      status: 'active',
      createdAt: '2026-03-20T10:00:00Z',
      updatedAt: '2026-03-24T09:30:00Z',
      lastUsed: '2026-03-25T08:15:00Z',
    },
    {
      id: '2',
      name: 'Google OAuth',
      type: 'oauth2',
      provider: 'Google',
      status: 'active',
      createdAt: '2026-03-18T14:20:00Z',
      updatedAt: '2026-03-24T11:15:00Z',
      lastUsed: '2026-03-25T07:45:00Z',
    },
    {
      id: '3',
      name: 'PostgreSQL Database',
      type: 'database',
      provider: 'PostgreSQL',
      status: 'active',
      createdAt: '2026-03-15T08:00:00Z',
      updatedAt: '2026-03-23T23:00:00Z',
      lastUsed: '2026-03-25T09:00:00Z',
    },
    {
      id: '4',
      name: 'DeepSeek API Secret',
      type: 'secret',
      provider: 'DeepSeek',
      status: 'inactive',
      createdAt: '2026-03-10T16:45:00Z',
      updatedAt: '2026-03-22T09:45:00Z',
    },
  ];

  useEffect(() => {
    loadCredentials();
  }, []);

  const filteredCredentials = credentials.filter(cred => {
    const matchesType = selectedType === 'all' || cred.type === selectedType;
    const matchesSearch =
      cred.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cred.provider.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api_key':
        return <Key className="w-4 h-4" />;
      case 'oauth2':
        return <UserCheck className="w-4 h-4" />;
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'secret':
        return <Shield className="w-4 h-4" />;
      default:
        return <Key className="w-4 h-4" />;
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面头部 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Key className="w-8 h-8 text-blue-600" />
            n8n 凭证管理
          </h1>
          <p className="text-gray-600">
            管理 API Key、OAuth 认证、数据库连接和密钥
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setEditingCredential(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          添加凭证
        </Button>
      </div>

      {/* 筛选和搜索 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="搜索凭证名称或提供商..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select
              value={selectedType}
              onValueChange={(val: any) => setSelectedType(val)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="凭证类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="api_key">API Key</SelectItem>
                <SelectItem value="oauth2">OAuth 认证</SelectItem>
                <SelectItem value="database">数据库连接</SelectItem>
                <SelectItem value="secret">密钥</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadCredentials}>
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总凭证数</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credentials.length}</div>
            <p className="text-xs text-muted-foreground mt-1">已配置的凭证</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">正常使用</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {credentials.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">状态正常的凭证</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Keys</CardTitle>
            <Key className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {credentials.filter(c => c.type === 'api_key').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">API 密钥数量</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OAuth 认证</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {credentials.filter(c => c.type === 'oauth2').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">OAuth 凭证数量</p>
          </CardContent>
        </Card>
      </div>

      {/* 凭证列表 */}
      <Card>
        <CardHeader>
          <CardTitle>凭证列表</CardTitle>
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
              {filteredCredentials.map(credential => (
                <div
                  key={credential.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        {getTypeIcon(credential.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {credential.name}
                          </h3>
                          {getStatusBadge(credential.status)}
                        </div>

                        <div className="text-sm text-gray-500 mb-2">
                          提供商：{credential.provider}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            创建于：
                            {new Date(credential.createdAt).toLocaleString(
                              'zh-CN'
                            )}
                          </span>
                          {credential.lastUsed && (
                            <span className="flex items-center gap-1">
                              <RefreshCw className="w-3 h-3" />
                              最后使用：
                              {new Date(credential.lastUsed).toLocaleString(
                                'zh-CN'
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCredential(credential);
                          setDialogOpen(true);
                        }}
                      >
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCredential(credential.id)}
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
            凭证管理说明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>支持管理 API Key、OAuth 2.0、数据库连接和密钥等多种凭证类型</li>
            <li>所有凭证都通过 n8n API 进行安全存储和管理</li>
            <li>凭证可以在多个工作流中复用，无需重复配置</li>
            <li>定期更新凭证以确保连接安全性</li>
            <li>如果连接失败，将显示模拟数据用于演示</li>
          </ul>
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCredential ? '编辑凭证' : '添加凭证'}
            </DialogTitle>
            <DialogDescription>配置 n8n 工作流使用的认证凭证</DialogDescription>
          </DialogHeader>

          <form
            onSubmit={e => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveCredential({
                name: formData.get('name') as string,
                type: formData.get('type') as Credential['type'],
                provider: formData.get('provider') as string,
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
                  defaultValue={editingCredential?.name}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  类型
                </Label>
                <Select
                  name="type"
                  defaultValue={editingCredential?.type || 'api_key'}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择凭证类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api_key">API Key</SelectItem>
                    <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                    <SelectItem value="database">数据库连接</SelectItem>
                    <SelectItem value="secret">密钥</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="provider" className="text-right">
                  提供商
                </Label>
                <Input
                  id="provider"
                  name="provider"
                  defaultValue={editingCredential?.provider}
                  className="col-span-3"
                  placeholder="例如：Stripe, Google, PostgreSQL"
                  required
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
                {editingCredential ? '保存更改' : '创建凭证'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
