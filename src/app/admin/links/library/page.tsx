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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { VirtualList } from '@/components/VirtualList';
import {
  BarChart3,
  CheckCircle,
  Clock,
  Edit2,
  ExternalLink,
  Link as LinkIcon,
  Star,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface LinkItem {
  id: string;
  url: string;
  title: string;
  source: string;
  category: string;
  sub_category: string;
  priority: number;
  views: number;
  likes: number;
  status: string;
  review_status: string;
  ai_quality_score: number | null;
  created_at: string;
  updated_at: string;
}

export default function LinkLibraryManagementPage() {
  const router = useRouter();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    sortBy: 'priority',
    sortOrder: 'desc',
  });
  const [bulkPriority, setBulkPriority] = useState<number>(50);
  const [showAutoAdjustModal, setShowAutoAdjustModal] = useState(false);
  const [adjustStrategy, setAdjustStrategy] = useState('mixed');

  // 获取链接列表
  const fetchLinks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      const response = await fetch(`/api/links/priority?${params}`);
      const result = await response.json();

      if (result.links) {
        setLinks(result.links);
      }
    } catch (error) {
      console.error('获取链接列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    fetchLinks();
  }, [filters]);

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(links.map(link => link.id));
    } else {
      setSelectedIds([]);
    }
  };

  // 处理单个选择
  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  // 批量更新优先级
  const handleBulkPriorityUpdate = async () => {
    if (selectedIds.length === 0) {
      alert('请先选择要更新的链接');
      return;
    }

    try {
      const updates = selectedIds.map(id => ({
        id,
        priority: bulkPriority,
      }));

      const response = await fetch('/api/links/priority', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      });

      if (response.ok) {
        await fetchLinks();
        setSelectedIds([]);
        alert('优先级已更新');
      }
    } catch (error) {
      console.error('批量更新优先级失败:', error);
    }
  };

  // 自动调整优先级
  const handleAutoAdjust = async () => {
    try {
      const response = await fetch('/api/links/priority/auto-adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          strategy: adjustStrategy,
          link_ids: selectedIds.length > 0 ? selectedIds : undefined,
        }),
      });

      if (response.ok) {
        await fetchLinks();
        setShowAutoAdjustModal(false);
        alert('优先级已自动调整');
      }
    } catch (error) {
      console.error('自动调整优先级失败:', error);
    }
  };

  // 删除链接
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此链接吗？')) return;

    try {
      const response = await fetch(`/api/links/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchLinks();
      }
    } catch (error) {
      console.error('删除链接失败:', error);
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (!confirm(`确定要删除选中的 ${selectedIds.length} 个链接吗？`)) return;

    try {
      const promises = selectedIds.map(id =>
        fetch(`/api/links/${id}`, { method: 'DELETE' })
      );

      await Promise.all(promises);
      setSelectedIds([]);
      await fetchLinks();
    } catch (error) {
      console.error('批量删除失败:', error);
    }
  };

  // 获取状态标签
  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      archived: 'outline',
    } as const;

    const labels = {
      active: '已激活',
      inactive: '未激活',
      archived: '已归档',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  // 获取审核状态标签
  const getReviewStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
    } as const;

    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: Trash2,
    } as const;

    const labels = {
      pending: '待审核',
      approved: '已通过',
      rejected: '已拒绝',
    } as const;

    const Icon = icons[status as keyof typeof icons];

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        <Icon className="w-3 h-3 mr-1" />
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  // 获取质量分数标签
  const getQualityBadge = (score: number | null) => {
    if (score === null) {
      return <Badge variant="outline">未评估</Badge>;
    }

    const variant =
      score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive';

    return (
      <Badge variant={variant}>
        <Star className="w-3 h-3 mr-1" />
        {score}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">链接库管理</h1>
          <p className="text-gray-500 mt-1">管理和优化链接优先级与质量</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAutoAdjustModal(true)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            自动调整优先级
          </Button>
          <Button onClick={() => router.push('/admin/links/add')}>
            <LinkIcon className="w-4 h-4 mr-2" />
            添加链接
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总链接数</CardTitle>
            <LinkIcon className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{links.length}</div>
            <p className="text-xs text-gray-500 mt-1">所有链接</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">高优先级</CardTitle>
            <Star className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {links.filter(l => l.priority >= 80).length}
            </div>
            <p className="text-xs text-gray-500 mt-1">优先级 ≥ 80</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待审核</CardTitle>
            <Clock className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {links.filter(l => l.review_status === 'pending').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">等待审核</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均访问</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {links.length > 0
                ? Math.round(
                    links.reduce((sum, l) => sum + l.views, 0) / links.length
                  )
                : 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">平均每个链接的访问量</p>
          </CardContent>
        </Card>
      </div>

      {/* 筛选工具栏 */}
      <Card>
        <CardHeader>
          <CardTitle>筛选与排序</CardTitle>
          <CardDescription>根据条件过滤和排序链接</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">状态</label>
              <Select
                value={filters.status}
                onValueChange={v => setFilters({ ...filters, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部状态</SelectItem>
                  <SelectItem value="active">已激活</SelectItem>
                  <SelectItem value="inactive">未激活</SelectItem>
                  <SelectItem value="archived">已归档</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">分类</label>
              <Select
                value={filters.category}
                onValueChange={v => setFilters({ ...filters, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部分类</SelectItem>
                  <SelectItem value="technology">技术</SelectItem>
                  <SelectItem value="business">商业</SelectItem>
                  <SelectItem value="design">设计</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">排序方式</label>
              <Select
                value={filters.sortBy}
                onValueChange={v => setFilters({ ...filters, sortBy: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择排序" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">优先级</SelectItem>
                  <SelectItem value="views">访问量</SelectItem>
                  <SelectItem value="likes">点赞数</SelectItem>
                  <SelectItem value="created_at">创建时间</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">顺序</label>
              <Select
                value={filters.sortOrder}
                onValueChange={v => setFilters({ ...filters, sortOrder: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择顺序" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">降序</SelectItem>
                  <SelectItem value="asc">升序</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 批量操作提示 */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-blue-700">
                已选择 {selectedIds.length} 个链接
              </span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={bulkPriority}
                  onChange={e => setBulkPriority(Number(e.target.value))}
                  className="w-24"
                  placeholder="优先级"
                />
                <Button size="sm" onClick={handleBulkPriorityUpdate}>
                  更新优先级
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds([])}
              >
                取消选择
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBatchDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                删除选中
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 链接列表 */}
      <Card>
        <CardHeader>
          <CardTitle>链接列表</CardTitle>
          <CardDescription>管理和查看所有链接</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">加载中...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === links.length && links.length > 0
                      }
                      onChange={e => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>优先级</TableHead>
                  <TableHead>访问量</TableHead>
                  <TableHead>点赞数</TableHead>
                  <TableHead>AI 质量</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>审核</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <VirtualList
                  items={links}
                  itemSize={68} // 每行高度约 68px（包含详细信息）
                  height={Math.min(600, links.length * 68 + 40)} // 动态高度，最多显示 600px
                  overscan={5} // 预加载 5 个额外项
                  renderItem={link => (
                    <TableRow key={link.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(link.id)}
                          onChange={e =>
                            handleSelectOne(link.id, e.target.checked)
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{link.title}</div>
                        <div className="text-xs text-gray-500">
                          {link.source}
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <span className="max-w-xs truncate block">
                            {link.url}
                          </span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <div>{link.category}</div>
                        <div className="text-xs text-gray-500">
                          {link.sub_category}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{link.priority}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          {link.views.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>{link.likes.toLocaleString()}</TableCell>
                      <TableCell>
                        {getQualityBadge(link.ai_quality_score)}
                      </TableCell>
                      <TableCell>{getStatusBadge(link.status)}</TableCell>
                      <TableCell>
                        {getReviewStatusBadge(link.review_status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/links/edit/${link.id}`)
                            }
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(link.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  emptyContent={
                    <div className="text-center py-12 text-gray-500">
                      暂无链接数据
                    </div>
                  }
                />
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 自动调整模态框 */}
      {showAutoAdjustModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">自动调整优先级</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  调整策略
                </label>
                <Select
                  value={adjustStrategy}
                  onValueChange={v => setAdjustStrategy(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择策略" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">混合策略</SelectItem>
                    <SelectItem value="views">基于访问量</SelectItem>
                    <SelectItem value="engagement">基于互动率</SelectItem>
                    <SelectItem value="ai_score">基于 AI 评分</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-600">
                {selectedIds.length > 0
                  ? `将对选中的 ${selectedIds.length} 个链接进行自动调整`
                  : '将对所有链接进行自动调整'}
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAutoAdjustModal(false)}
              >
                取消
              </Button>
              <Button className="flex-1" onClick={handleAutoAdjust}>
                开始调整
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
