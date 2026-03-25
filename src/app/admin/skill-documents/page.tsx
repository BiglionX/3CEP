'use client';

import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import {
  BookOpen,
  Edit,
  Eye,
  FileText,
  HelpCircle,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Document {
  id: string;
  skill_id: string;
  title: string;
  slug?: string;
  content_type: string;
  category: string;
  version?: string;
  order_index: number;
  is_published: boolean;
  is_official: boolean;
  view_count: number;
  like_count: number;
  help_count: number;
  created_at: string;
}

export default function SkillDocumentsManagementPage() {
  const { isAuthenticated, is_admin, isLoading } = useUnifiedAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 认证检查
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !is_admin)) {
      window.location.href = `/login?redirect=${encodeURIComponent('/admin/skill-documents')}`;
    }
  }, [isAuthenticated, is_admin, isLoading]);

  // 加载文档列表
  useEffect(() => {
    if (isAuthenticated && is_admin) {
      loadDocuments();
    }
  }, [isAuthenticated, is_admin, filterCategory, filterStatus]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory !== 'all') {
        params.append('category', filterCategory);
      }
      if (filterStatus !== 'all') {
        params.append(
          'published',
          filterStatus === 'published' ? 'true' : 'false'
        );
      }

      const response = await fetch(`/api/admin/skill-documents?${params}`);
      const result = await response.json();

      if (result.success) {
        setDocuments(result.data || []);
      }
    } catch (error) {
      console.error('加载文档失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 搜索文档
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `/api/admin/skill-documents/search?q=${encodeURIComponent(searchQuery)}`
      );
      const result = await response.json();

      if (result.success) {
        setDocuments(result.data || []);
      }
    } catch (error) {
      console.error('搜索文档失败:', error);
    }
  };

  // 删除文档
  const handleDelete = async (docId: string) => {
    if (!confirm('确定要删除这个文档吗？')) return;

    try {
      const response = await fetch(`/api/admin/skill-documents?id=${docId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        alert('文档已删除');
        loadDocuments();
      } else {
        alert(`删除失败：${result.error}`);
      }
    } catch (error) {
      console.error('删除文档失败:', error);
      alert('操作失败，请重试');
    }
  };

  // 获取分类图标
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'guide':
        return <BookOpen className="w-4 h-4" />;
      case 'api':
        return <FileText className="w-4 h-4" />;
      case 'tutorial':
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // 统计信息
  const stats = {
    total: documents.length,
    published: documents.filter(d => d.is_published).length,
    draft: documents.filter(d => !d.is_published).length,
    official: documents.filter(d => d.is_official).length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !is_admin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">文档管理系统</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理 Skills 的文档、教程和使用指南
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          添加文档
        </button>
      </div>

      {/* 筛选器和搜索 */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="搜索文档..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>

        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">全部分类</option>
          <option value="guide">指南</option>
          <option value="api">API 文档</option>
          <option value="tutorial">教程</option>
          <option value="faq">常见问题</option>
          <option value="changelog">更新日志</option>
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">全部状态</option>
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
        </select>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">总文档数</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">已发布</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.published}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">草稿</div>
          <div className="text-2xl font-bold text-yellow-600">
            {stats.draft}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">官方文档</div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.official}
          </div>
        </div>
      </div>

      {/* 文档列表 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  文档标题
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  分类
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  版本
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  排序
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  浏览
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  点赞
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  状态
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    加载中...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    暂无文档
                  </td>
                </tr>
              ) : (
                documents.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(doc.category)}
                          <span className="text-sm font-medium text-gray-900">
                            {doc.title}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(doc.created_at).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          doc.category === 'guide'
                            ? 'bg-blue-100 text-blue-800'
                            : doc.category === 'api'
                              ? 'bg-purple-100 text-purple-800'
                              : doc.category === 'tutorial'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {doc.version || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {doc.order_index}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {doc.view_count}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {doc.like_count}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            doc.is_published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {doc.is_published ? '已发布' : '草稿'}
                        </span>
                        {doc.is_official && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            官方
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          title="查看"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-800"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="text-red-600 hover:text-red-800"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
