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
import { Database, Edit, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DataSource {
  id: string;
  name: string;
  type:
    | 'postgresql'
    | 'mysql'
    | 'mongodb'
    | 'redis'
    | 'elasticsearch'
    | 'kafka';
  host: string;
  port: number;
  database: string;
  username: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastConnected: string;
  recordCount: number;
  syncFrequency: string;
  createdAt: string;
}

export default function DataSourcesPage() {
  const router = useRouter();
  const [sources, setSources] = useState<DataSource[]>([]);
  const [filteredSources, setFilteredSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSource, setEditingSource] = useState<DataSource | null>(null);

  useEffect(() => {
    loadSources();
  }, []);

  useEffect(() => {
    filterSources();
  }, [sources, searchTerm, statusFilter]);

  const loadSources = async () => {
    try {
      setLoading(true);
      const mockSources: DataSource[] = [
        {
          id: '1',
          name: '设备管理系统数据源',
          type: 'postgresql',
          host: 'db.devices.local',
          port: 5432,
          database: 'device_management',
          username: 'admin',
          status: 'connected',
          lastConnected: '2026-02-28 14:30:00',
          recordCount: 15420,
          syncFrequency: '实时',
          createdAt: '2026-01-15',
        },
        {
          id: '2',
          name: '供应链数据仓库',
          type: 'mysql',
          host: 'warehouse.supply.local',
          port: 3306,
          database: 'supply_chain',
          username: 'analyst',
          status: 'connected',
          lastConnected: '2026-02-28 14:25:00',
          recordCount: 8734,
          syncFrequency: '5 分钟',
          createdAt: '2026-01-20',
        },
        {
          id: '3',
          name: '维修记录系统',
          type: 'mongodb',
          host: 'mongo.repair.local',
          port: 27017,
          database: 'repair_logs',
          username: 'service',
          status: 'error',
          lastConnected: '2026-02-27 10:00:00',
          recordCount: 5621,
          syncFrequency: '每小时',
          createdAt: '2026-01-25',
        },
        {
          id: '4',
          name: '实时报价缓存',
          type: 'redis',
          host: 'cache.quote.local',
          port: 6379,
          database: 'main',
          username: 'cache_user',
          status: 'connected',
          lastConnected: '2026-02-28 14:35:00',
          recordCount: 2340,
          syncFrequency: '实时',
          createdAt: '2026-02-01',
        },
      ];
      setSources(mockSources);
    } catch (error) {
      console.error('加载数据源失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSources = () => {
    let filtered = [...sources];

    if (searchTerm) {
      filtered = filtered.filter(
        source =>
          source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          source.database.toLowerCase().includes(searchTerm.toLowerCase()) ||
          source.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(source => source.status === statusFilter);
    }

    setFilteredSources(filtered);
  };

  const handleTestConnection = async (sourceId: string) => {
    const source = sources.find(s => s.id === sourceId);
    if (source) {
      setSources(prev =>
        prev.map(s => (s.id === sourceId ? { ...s, status: 'connecting' } : s))
      );

      setTimeout(() => {
        setSources(prev =>
          prev.map(s =>
            s.id === sourceId
              ? {
                  ...s,
                  status: 'connected',
                  lastConnected: new Date().toLocaleString('zh-CN'),
                }
              : s
          )
        );
      }, 2000);
    }
  };

  const handleDeleteSource = (sourceId: string) => {
    setSources(prev => prev.filter(s => s.id !== sourceId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAddDialog(false);
    setEditingSource(null);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return '已连接';
      case 'disconnected':
        return '已断开';
      case 'connecting':
        return '连接中';
      case 'error':
        return '错误';
      default:
        return '未知';
    }
  };

  const getTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      postgresql: 'PostgreSQL',
      mysql: 'MySQL',
      mongodb: 'MongoDB',
      redis: 'Redis',
      elasticsearch: 'Elasticsearch',
      kafka: 'Kafka',
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面头部 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据源管理</h1>
          <p className="text-gray-600 mt-1">管理和监控所有数据连接源</p>
        </div>
      </div>

      {/* 过滤工具栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索数据源..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="connected">已连接</SelectItem>
                <SelectItem value="disconnected">已断开</SelectItem>
                <SelectItem value="connecting">连接中</SelectItem>
                <SelectItem value="error">错误</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 数据源列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSources.map(source => (
          <Card key={source.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      source.type === 'postgresql'
                        ? 'bg-blue-100'
                        : source.type === 'mysql'
                          ? 'bg-green-100'
                          : source.type === 'mongodb'
                            ? 'bg-yellow-100'
                            : source.type === 'redis'
                              ? 'bg-red-100'
                              : 'bg-purple-100'
                    }`}
                  >
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{source.name}</CardTitle>
                    <CardDescription>
                      {getTypeName(source.type)}
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant={
                    source.status === 'connected'
                      ? 'default'
                      : source.status === 'error'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {getStatusText(source.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">主机</span>
                  <span className="font-medium">
                    {source.host}:{source.port}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">数据库</span>
                  <span className="font-medium">{source.database}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">记录数</span>
                  <span className="font-medium">
                    {source.recordCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">同步频率</span>
                  <span className="font-medium">{source.syncFrequency}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTestConnection(source.id)}
                  disabled={source.status === 'connecting'}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  测试连接
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingSource(source);
                    setShowAddDialog(true);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  编辑
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteSource(source.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 空状态 */}
      {filteredSources.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              暂无数据源
            </h3>
            <p className="text-gray-500 mb-4">开始添加您的第一个数据源</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              添加数据源
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 添加/编辑对话框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSource ? '编辑数据源' : '添加数据源'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">数据源名称</Label>
              <Input id="name" placeholder="输入数据源名称" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">数据库类型</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="选择数据源类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="mongodb">MongoDB</SelectItem>
                  <SelectItem value="redis">Redis</SelectItem>
                  <SelectItem value="elasticsearch">Elasticsearch</SelectItem>
                  <SelectItem value="kafka">Kafka</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host">主机地址</Label>
                <Input id="host" placeholder="localhost" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">端口</Label>
                <Input id="port" type="number" placeholder="5432" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="database">数据库名称</Label>
              <Input id="database" placeholder="database_name" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input id="username" placeholder="username" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                取消
              </Button>
              <Button type="submit">
                {editingSource ? '保存更改' : '添加数据源'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
