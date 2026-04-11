'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  CheckCircle,
  Clock,
  ExternalLink,
  Eye,
  Loader2,
  Search,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface HotLink {
  id: string;
  url: string;
  title: string;
  source: string;
  category: string;
  likes: number;
  views: number;
  ai_tags?: {
    tags: string[];
    confidence: number;
  };
  scraped_at: string;
  status: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function PendingLinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<HotLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [previewLink, setPreviewLink] = useState<HotLink | null>(null);

  // 获取待审核链接列表
  const fetchLinks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        search: searchTerm,
      });

      const response = await fetch(`/api/links/pending?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLinks(data.links || []);
        setPagination(prev => ({
          ...prev,
          total: data.total || 0,
          totalPages: Math.ceil((data.total || 0) / pagination.pageSize),
        }));
      }
    } catch (error) {
      console.error('获取待审核链接失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [pagination.page, pagination.pageSize]);

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? links.map(link => link.id) : []);
  };

  // 处理单个选择
  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(prev =>
      checked ? [...prev, id] : prev.filter(sid => sid !== id)
    );
  };

  // 通过审核
  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/links/${id}/approve`, {
        method: 'POST',
      });
      if (response.ok) {
        await fetchLinks();
      }
    } catch (error) {
      console.error('审核失败:', error);
    }
  };

  // 批量操作
  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) return;

    try {
      const promises = selectedIds.map(id =>
        fetch(`/api/links/${id}/approve`, { method: 'POST' })
      );
      await Promise.all(promises);
      setSelectedIds([]);
      await fetchLinks();
    } catch (error) {
      console.error('批量审核失败:', error);
    }
  };

  // 获取状态标签
  const getStatusBadge = (status: string) => {
    const variants = {
      pending_review: { text: '待审核', variant: 'secondary' as const },
      approved: { text: '已通过', variant: 'default' as const },
      rejected: { text: '已驳回', variant: 'destructive' as const },
    };
    const config = variants[status as keyof typeof variants] || {
      text: status,
      variant: 'outline' as const,
    };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">待审核链接</h1>
          <p className="text-gray-500 mt-1">管理和审核热门链接</p>
        </div>
        {selectedIds.length > 0 && (
          <Button onClick={handleBatchApprove}>
            <CheckCircle className="w-4 h-4 mr-2" />
            批量通过 ({selectedIds.length})
          </Button>
        )}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待审核</CardTitle>
            <Clock className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-gray-500 mt-1">等待审核的链接</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总浏览量</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {links.reduce((sum, l) => sum + l.views, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">所有链接的总浏览</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均点赞</CardTitle>
            <CheckCircle className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {links.length > 0
                ? Math.round(
                    links.reduce((sum, l) => sum + l.likes, 0) / links.length
                  )
                : 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">平均每个链接的点赞数</p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索栏 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="搜索标题或来源..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={fetchLinks}>搜索</Button>
      </div>

      {/* 链接列表 */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
                  <TableHead>来源</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>点赞</TableHead>
                  <TableHead>浏览</TableHead>
                  <TableHead>AI 标签</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>抓取时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map(link => (
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
                      <div className="font-medium max-w-xs">{link.title}</div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {link.url.substring(0, 50)}...
                      </a>
                    </TableCell>
                    <TableCell>{link.source}</TableCell>
                    <TableCell>{link.category}</TableCell>
                    <TableCell>{link.likes.toLocaleString()}</TableCell>
                    <TableCell>{link.views.toLocaleString()}</TableCell>
                    <TableCell>
                      {link.ai_tags?.tags && link.ai_tags.tags.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {link.ai_tags.tags.slice(0, 3).map((tag, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(link.status)}</TableCell>
                    <TableCell>
                      {format(new Date(link.scraped_at), 'yyyy-MM-dd HH:mm', {
                        locale: zhCN,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewLink(link)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApprove(link.id)}
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 分页 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          共 {pagination.total} 条记录，{pagination.totalPages} 页
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
          >
            上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
          >
            下一页
          </Button>
        </div>
      </div>

      {/* 预览对话框 */}
      {previewLink && (
        <Dialog open={!!previewLink} onOpenChange={() => setPreviewLink(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>链接详情</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{previewLink.title}</h3>
                <a
                  href={previewLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  {previewLink.url}
                </a>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">来源</div>
                  <div className="font-medium">{previewLink.source}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">分类</div>
                  <div className="font-medium">{previewLink.category}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">点赞数</div>
                  <div className="font-medium">
                    {previewLink.likes.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">浏览量</div>
                  <div className="font-medium">
                    {previewLink.views.toLocaleString()}
                  </div>
                </div>
              </div>
              {previewLink.ai_tags && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">AI 标签</div>
                  <div className="flex gap-2 flex-wrap">
                    {previewLink.ai_tags.tags.map((tag, i) => (
                      <Badge key={i} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewLink(null)}>
                关闭
              </Button>
              <Button
                onClick={() => {
                  handleApprove(previewLink.id);
                  setPreviewLink(null);
                }}
              >
                通过审核
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
