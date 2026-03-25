'use client';

import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import { Edit, Hash, Plus, Trash2, TrendingUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Tag {
  id: string;
  name: string;
  name_en?: string;
  description?: string;
  category?: string;
  usage_count: number;
  is_hot: boolean;
  color: string;
}

export default function SkillTagsManagementPage() {
  const { isAuthenticated, is_admin, isLoading } = useUnifiedAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // 认证检查
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !is_admin)) {
      window.location.href = `/login?redirect=${encodeURIComponent('/admin/skill-tags')}`;
    }
  }, [isAuthenticated, is_admin, isLoading]);

  // 加载标签列表
  useEffect(() => {
    if (isAuthenticated && is_admin) {
      loadTags();
    }
  }, [isAuthenticated, is_admin]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/skill-tags/list');
      const result = await response.json();

      if (result.success) {
        setTags(result.data || []);
      }
    } catch (error) {
      console.error('加载标签失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 删除标签
  const handleDelete = async (tagId: string) => {
    if (!confirm('确定要删除这个标签吗？')) return;

    try {
      const response = await fetch(`/api/admin/skill-tags/delete?id=${tagId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        alert('标签已删除');
        loadTags();
      } else {
        alert(`删除失败：${result.error}`);
      }
    } catch (error) {
      console.error('删除标签失败:', error);
      alert('操作失败，请重试');
    }
  };

  // 切换热门状态
  const toggleHot = async (tagId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/skill-tags/toggle-hot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagId, isHot: !currentStatus }),
      });

      const result = await response.json();
      if (result.success) {
        loadTags();
      } else {
        alert(`操作失败：${result.error}`);
      }
    } catch (error) {
      console.error('切换热门状态失败:', error);
    }
  };

  // 过滤标签
  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || tag.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // 获取所有分类
  const categories = Array.from(
    new Set(tags.map(t => t.category).filter(Boolean))
  );

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
          <h1 className="text-3xl font-bold text-gray-900">标签管理</h1>
          <p className="mt-1 text-sm text-gray-500">管理 Skills 的标签分类</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加标签
        </button>
      </div>

      {/* 筛选器 */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="搜索标签..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">全部分类</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 标签列表 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  标签
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  英文名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  分类
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  使用次数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  颜色
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  热门
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
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    加载中...
                  </td>
                </tr>
              ) : filteredTags.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    暂无标签
                  </td>
                </tr>
              ) : (
                filteredTags.map(tag => (
                  <tr key={tag.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Hash className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {tag.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {tag.name_en || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tag.category || '未分类'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {tag.usage_count}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div
                          className="w-6 h-6 rounded border border-gray-300 mr-2"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="text-sm text-gray-500">
                          {tag.color}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleHot(tag.id, tag.is_hot)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tag.is_hot
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {tag.is_hot ? '热门' : '普通'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tag.id)}
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

      {/* 统计信息 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">总标签数</div>
          <div className="text-2xl font-bold text-gray-900">{tags.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">热门标签</div>
          <div className="text-2xl font-bold text-yellow-600">
            {tags.filter(t => t.is_hot).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">分类数</div>
          <div className="text-2xl font-bold text-blue-600">
            {categories.length}
          </div>
        </div>
      </div>

      {/* TODO: 添加创建/编辑模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">添加标签</h3>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">功能开发中...</p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
