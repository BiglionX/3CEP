'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  BarChart3,
  Blockchain,
  Plus,
  RefreshCw,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Database,
  Users,
  Tag,
  QrCode,
  Search,
  Filter,
} from 'lucide-react';

interface CodeSegment {
  id: string;
  name: string;
  startCode: string;
  endCode: string;
  totalCount: number;
  usedCount: number;
  status: 'available' | 'allocated' | 'exhausted';
  merchantId?: string;
  merchantName?: string;
  createdAt: string;
  allocatedAt?: string;
  price: number;
}

interface Stats {
  totalSegments: number;
  totalCodes: number;
  usedCodes: number;
  availableCodes: number;
  totalMerchants: number;
}

interface Merchant {
  id: string;
  name: string;
}

const mockMerchants: Merchant[] = [
  { id: 'm001', name: '测试商户A' },
  { id: 'm002', name: '测试商户B' },
  { id: 'm003', name: '测试商户C' },
  { id: 'm004', name: '测试商户D' },
];

export default function CodeSegmentManagementPage() {
  const [segments, setSegments] = useState<CodeSegment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 创建码段对话框
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSegment, setNewSegment] = useState({
    name: '',
    startCode: '',
    endCode: '',
    price: 0.1,
  });
  const [creating, setCreating] = useState(false);

  // 分配码段对话框
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<CodeSegment | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [allocating, setAllocating] = useState(false);

  // 加载数据
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetch(`/api/enterprise/blockchain/codes?${params}`);
      const data = await response.json();

      if (data.success) {
        setSegments(data.data);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch code segments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  // 创建码段
  const handleCreateSegment = async () => {
    setCreating(true);
    try {
      const response = await fetch('/api/enterprise/blockchain/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSegment),
      });
      const data = await response.json();

      if (data.success) {
        setCreateDialogOpen(false);
        setNewSegment({ name: '', startCode: '', endCode: '', price: 0.1 });
        fetchData();
      } else {
        alert(data.error || '创建失败');
      }
    } catch (error) {
      console.error('Failed to create segment:', error);
    } finally {
      setCreating(false);
    }
  };

  // 分配码段
  const handleAllocate = async () => {
    if (!selectedSegment || !selectedMerchant) return;

    setAllocating(true);
    try {
      const merchant = mockMerchants.find(m => m.id === selectedMerchant);
      const response = await fetch('/api/enterprise/blockchain/codes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedSegment.id,
          action: 'allocate',
          merchantId: selectedMerchant,
          merchantName: merchant?.name,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setAllocateDialogOpen(false);
        setSelectedSegment(null);
        setSelectedMerchant('');
        fetchData();
      } else {
        alert(data.error || '分配失败');
      }
    } catch (error) {
      console.error('Failed to allocate segment:', error);
    } finally {
      setAllocating(false);
    }
  };

  // 回收码段
  const handleRecycle = async (segment: CodeSegment) => {
    if (segment.usedCount > 0) {
      alert('该码段已有使用记录，无法回收');
      return;
    }

    if (!confirm(`确定要回收码段"${segment.name}"吗？`)) return;

    try {
      const response = await fetch('/api/enterprise/blockchain/codes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: segment.id,
          action: 'recycle',
        }),
      });
      const data = await response.json();

      if (data.success) {
        fetchData();
      } else {
        alert(data.error || '回收失败');
      }
    } catch (error) {
      console.error('Failed to recycle segment:', error);
    }
  };

  // 删除码段
  const handleDelete = async (segment: CodeSegment) => {
    if (segment.usedCount > 0) {
      alert('该码段已有使用记录，无法删除');
      return;
    }

    if (!confirm(`确定要删除码段"${segment.name}"吗？此操作不可恢复。`)) return;

    try {
      const response = await fetch(`/api/enterprise/blockchain/codes?id=${segment.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        fetchData();
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('Failed to delete segment:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-700">可用</Badge>;
      case 'allocated':
        return <Badge className="bg-blue-100 text-blue-700">已分配</Badge>;
      case 'exhausted':
        return <Badge variant="destructive">已用完</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUsagePercent = (segment: CodeSegment) => {
    return Math.round((segment.usedCount / segment.totalCount) * 100);
  };

  // 过滤搜索
  const filteredSegments = segments.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.startCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.merchantName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  码段分配管理
                </h1>
                <p className="text-gray-500 mt-1">
                  创建、分配、回收区块链产品码段
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchData} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      创建码段
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>创建新码段</DialogTitle>
                      <DialogDescription>
                        创建一个新的区块链产品码段
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">码段名称</Label>
                        <Input
                          id="name"
                          placeholder="例如：基础防伪码段-A"
                          value={newSegment.name}
                          onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startCode">起始码</Label>
                          <Input
                            id="startCode"
                            placeholder="BC00001"
                            value={newSegment.startCode}
                            onChange={(e) => setNewSegment({ ...newSegment, startCode: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endCode">结束码</Label>
                          <Input
                            id="endCode"
                            placeholder="BC10000"
                            value={newSegment.endCode}
                            onChange={(e) => setNewSegment({ ...newSegment, endCode: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">单价 (ETH)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.1"
                          value={newSegment.price}
                          onChange={(e) => setNewSegment({ ...newSegment, price: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                        取消
                      </Button>
                      <Button
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={handleCreateSegment}
                        disabled={creating || !newSegment.name || !newSegment.startCode || !newSegment.endCode}
                      >
                        {creating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            创建中...
                          </>
                        ) : (
                          '创建'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* 统计数据 */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Database className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">码段总数</p>
                        <p className="text-xl font-bold">{stats.totalSegments}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <QrCode className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">码号总数</p>
                        <p className="text-xl font-bold">{stats.totalCodes.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">已使用</p>
                        <p className="text-xl font-bold">{stats.usedCodes.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">可用</p>
                        <p className="text-xl font-bold">{stats.availableCodes.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">商户数</p>
                        <p className="text-xl font-bold">{stats.totalMerchants}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 搜索和筛选 */}
            <Card className="mb-6">
              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="搜索码段名称、起始码、商户..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="all">全部状态</option>
                      <option value="available">可用</option>
                      <option value="allocated">已分配</option>
                      <option value="exhausted">已用完</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 码段列表 */}
            <Card>
              <CardHeader>
                <CardTitle>码段列表</CardTitle>
                <CardDescription>
                  共 {filteredSegments.length} 个码段
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>码段名称</TableHead>
                        <TableHead>码号范围</TableHead>
                        <TableHead>数量</TableHead>
                        <TableHead>使用情况</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>商户</TableHead>
                        <TableHead>单价</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSegments.map((segment) => (
                        <TableRow key={segment.id}>
                          <TableCell className="font-medium">{segment.name}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {segment.startCode}
                            </code>
                            <span className="mx-1">-</span>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {segment.endCode}
                            </code>
                          </TableCell>
                          <TableCell>{segment.totalCount.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    getUsagePercent(segment) === 100
                                      ? 'bg-red-500'
                                      : getUsagePercent(segment) > 80
                                      ? 'bg-orange-500'
                                      : 'bg-green-500'
                                  }`}
                                  style={{ width: `${getUsagePercent(segment)}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">
                                {segment.usedCount.toLocaleString()} ({getUsagePercent(segment)}%)
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(segment.status)}</TableCell>
                          <TableCell>{segment.merchantName || '-'}</TableCell>
                          <TableCell>{segment.price} ETH</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {segment.status === 'available' ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSegment(segment);
                                    setAllocateDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  分配
                                </Button>
                              ) : segment.status === 'allocated' && segment.usedCount === 0 ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRecycle(segment)}
                                >
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  回收
                                </Button>
                              ) : null}
                              {segment.usedCount === 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(segment)}
                                >
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredSegments.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            暂无码段数据
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* 分配码段对话框 */}
      <Dialog open={allocateDialogOpen} onOpenChange={setAllocateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>分配码段</DialogTitle>
            <DialogDescription>
              将码段分配给商户
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>码段名称</Label>
              <Input value={selectedSegment?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>码号范围</Label>
              <Input
                value={`${selectedSegment?.startCode || ''} - ${selectedSegment?.endCode || ''}`}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="merchant">选择商户</Label>
              <select
                id="merchant"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={selectedMerchant}
                onChange={(e) => setSelectedMerchant(e.target.value)}
              >
                <option value="">请选择商户</option>
                {mockMerchants.map((merchant) => (
                  <option key={merchant.id} value={merchant.id}>
                    {merchant.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAllocateDialogOpen(false)}>
              取消
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleAllocate}
              disabled={allocating || !selectedMerchant}
            >
              {allocating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  分配中...
                </>
              ) : (
                '确认分配'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
