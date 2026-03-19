'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Content {
  id: string;
  title: string;
  type: 'article' | 'tutorial' | 'news' | 'faq';
  author: string;
  status: 'draft' | 'published' | 'archived';
  category: string;
  tags: string[];
  views: number;
  likes: number;
  created_at: string;
  updated_at: string;
  content: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function ContentManagementPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);

  // 获取内容列表
  const fetchContents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        search: searchTerm,
        type: typeFilter === 'all' ? '' : typeFilter,
        status: statusFilter === 'all' ? '' : statusFilter,
      });

      const response = await fetch(`/api/admin/content${params}`);
      const result = await response.json();

      if (result.data) {
        setContents(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('获取内容列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [pagination.page, searchTerm, typeFilter, statusFilter]);

  // 处理全
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(contents.map(content => content.id));
    } else {
      setSelectedIds([]);
    }
  };

  // 处理单个选择
  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  // 新建内容
  const handleCreateContent = () => {
    setEditingContent({
      id: '',
      title: '',
      type: 'article',
      author: '',
      status: 'draft',
      category: '',
      tags: [],
      views: 0,
      likes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      content: '',
    });
    setShowEditDialog(true);
  };

  // 编辑内容
  const handleEditContent = (content: Content) => {
    setEditingContent(content);
    setShowEditDialog(true);
  };

  // 保存内容
  const saveContent = async () => {
    if (!editingContent) return;

    try {
      const url = editingContent.id
         `/api/admin/content/${editingContent.id}`
        : '/api/admin/content';

      const method = editingContent.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingContent),
      });

      const result = await response.json();
      if (result.success) {
        alert(editingContent.id ? '内容更新成功' : '内容创建成功');
        setShowEditDialog(false);
        setEditingContent(null);
        fetchContents();
      } else {
        alert(`操作失败: ${result.error}`);
      }
    } catch (error) {
      console.error('保存内容失败:', error);
      alert('操作失败');
    }
  };

  // 发布/取消发布内容
  const toggleContentStatus = async (
    contentId: string,
    currentStatus: string
  ) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    const actionText = newStatus === 'published' ? '发布' : '下架';

    if (!confirm(`确定{actionText}这篇内容吗？`)) return;

    try {
      const response = await fetch(`/api/admin/content/${contentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`${actionText}成功`);
        fetchContents();
      } else {
        alert(`操作失败: ${result.error}`);
      }
    } catch (error) {
      console.error('状态切换失', error);
      alert('操作失败');
    }
  };

  // 删除内容
  const deleteContent = async (contentId: string, title: string) => {
    if (!confirm(`确定要删除内"${title}" 吗？此操作不可撤销！`)) return;

    try {
      const response = await fetch(`/api/admin/content/${contentId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        alert('内容删除成功');
        fetchContents();
      } else {
        alert(`删除失败: ${result.error}`);
      }
    } catch (error) {
      console.error('删除内容失败:', error);
      alert('删除操作失败');
    }
  };

  // 获取状态标签样
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      draft: { text: '草稿', className: 'bg-gray-100 text-gray-800' },
      published: { text: '已发布', className: 'bg-green-100 text-green-800' },
      archived: { text: '已归档', className: 'bg-yellow-100 text-yellow-800' },
    };

    const config = statusMap[status] || {
      text: status,
      className: 'bg-gray-100 text-gray-800',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.text}
      </span>
    );
  };

  // 获取内容类型标签
  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { text: string; className: string }> = {
      article: { text: '文章', className: 'bg-blue-100 text-blue-800' },
      tutorial: { text: '教程', className: 'bg-purple-100 text-purple-800' },
      news: { text: '新闻', className: 'bg-green-100 text-green-800' },
      faq: { text: 'FAQ', className: 'bg-orange-100 text-orange-800' },
    };

    const config = typeMap[type] || {
      text: type,
      className: 'bg-gray-100 text-gray-800',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">内容管理</h1>
          <p className="text-gray-600 mt-1">管理网站文章、教程和其他内容</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder="搜索标题或作者..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-64"
          />

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部类型</option>
            <option value="article">文章</option>
            <option value="tutorial">教程</option>
            <option value="news">新闻</option>
            <option value="faq">FAQ</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部状态</option>
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
            <option value="archived">已归档</option>
          </select>

          <Button onClick={handleCreateContent}>新建内容</Button>

          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline">批量操作 ({selectedIds.length})</Button>
            </div>
          )}
        </div>
      </div>

      {/* 内容列表表格 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading  (
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
                      selectedIds.length === contents.length &&
                      contents.length > 0
                    }
                    onChange={e => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </TableHead>
                <TableHead>标题</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>作者</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>浏览/点赞</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contents.map(content => (
                <TableRow key={content.id} className="border-b">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(content.id)}
                      onChange={e =>
                        handleSelectOne(content.id, e.target.checked)
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">
                        {content.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {content.tags.map(tag => `#${tag}`).join(' ')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(content.type)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{content.author}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {content.category || '未分类'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>浏览: {content.views}</div>
                      <div>点赞: {content.likes}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(content.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {new Date(content.updated_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditContent(content)}
                      >
                        编辑
                      </Button>
                      <Button
                        variant={
                          content.status === 'published' ? 'outline' : 'default'
                        }
                        size="sm"
                        onClick={() =>
                          toggleContentStatus(content.id, content.status)
                        }
                      >
                        {content.status === 'published' ? '下架' : '发布'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* 分页 */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-700">
              显示从 {(pagination.page - 1) * pagination.pageSize + 1} 到{' '}
              {Math.min(
                pagination.page * pagination.pageSize,
                pagination.total
              )}{' '}
              条， {pagination.total} 条记
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page - 1 })
                }
                disabled={pagination.page <= 1}
                variant="outline"
                size="sm"
              >
                上一页
              </Button>
              <Button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page + 1 })
                }
                disabled={pagination.page >= pagination.totalPages}
                variant="outline"
                size="sm"
              >
                下一页
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 编辑内容对话*/}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContent.id ? '编辑内容' : '新建内容'}
            </DialogTitle>
          </DialogHeader>

          {editingContent && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    标题 *
                  </label>
                  <Input
                    value={editingContent.title}
                    onChange={e =>
                      setEditingContent({
                        ...editingContent,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    作*
                  </label>
                  <Input
                    value={editingContent.author}
                    onChange={e =>
                      setEditingContent({
                        ...editingContent,
                        author: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    内容类型 *
                  </label>
                  <select
                    value={editingContent.type}
                    onChange={e =>
                      setEditingContent({
                        ...editingContent,
                        type: e.target.value as any,
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="article">文章</option>
                    <option value="tutorial">教程</option>
                    <option value="news">新闻</option>
                    <option value="faq">FAQ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分类
                  </label>
                  <Input
                    value={editingContent.category || ''}
                    onChange={e =>
                      setEditingContent({
                        ...editingContent,
                        category: e.target.value,
                      })
                    }
                    placeholder="请输入分类"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    标签
                  </label>
                  <Input
                    value={editingContent.tags.join(',')}
                    onChange={e =>
                      setEditingContent({
                        ...editingContent,
                        tags: e.target.value
                          .split(',')
                          .map(tag => tag.trim())
                          .filter(tag => tag),
                      })
                    }
                    placeholder="输入标签，用逗号分隔..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  内容 *
                </label>
                <textarea
                  value={editingContent.content}
                  onChange={e =>
                    setEditingContent({
                      ...editingContent,
                      content: e.target.value,
                    })
                  }
                  rows={10}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入内.."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              取消
            </Button>
            <Button onClick={saveContent}>
              {editingContent.id ? '保存更改' : '创建内容'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

