'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    sortOrder: 'desc'
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
        sortOrder: filters.sortOrder
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
        priority: bulkPriority
      }));

      const response = await fetch('/api/links/priority', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`成功更新 ${result.updated} 条链接的优先级`);
        setSelectedIds([]);
        fetchLinks(); // 刷新数据
      } else {
        alert(`更新失败: ${result.error}`);
      }
    } catch (error) {
      console.error('批量更新失败:', error);
      alert('更新操作失败');
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
        body: JSON.stringify({ strategy: adjustStrategy })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(result.message);
        setShowAutoAdjustModal(false);
        fetchLinks(); // 刷新数据
      } else {
        alert(`调整失败: ${result.error}`);
      }
    } catch (error) {
      console.error('自动调整失败:', error);
      alert('调整操作失败');
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">链接库管理</h1>
        <p className="text-gray-600">管理链接优先级和内容审核</p>
      </div>

      {/* 控制面板 */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态筛选</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">全部状态</option>
              <option value="active">活跃</option>
              <option value="inactive">非活跃</option>
              <option value="pending_review">待审核</option>
              <option value="rejected">已驳回</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分类筛选</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">全部分类</option>
              <option value="维修教程">维修教程</option>
              <option value="技术分享">技术分享</option>
              <option value="行业资讯">行业资讯</option>
              <option value="工具推荐">工具推荐</option>
              <option value="案例分析">案例分析</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">排序字段</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="priority">优先级</option>
              <option value="created_at">创建时间</option>
              <option value="views">浏览量</option>
              <option value="likes">点赞数</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">排序方式</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => setFilters({...filters, sortOrder: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="desc">降序</option>
              <option value="asc">升序</option>
            </select>
          </div>
        </div>

        {/* 批量操作按钮 */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowAutoAdjustModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            自动调整优先级
          </button>
          
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={bulkPriority}
                onChange={(e) => setBulkPriority(parseInt(e.target.value) || 0)}
                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                onClick={handleBulkPriorityUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                批量更新 ({selectedIds.length}项)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 链接列表表格 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === links.length && links.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  标题
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  来源
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分类
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  优先级
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  互动数据
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(link.id)}
                      onChange={(e) => handleSelectOne(link.id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 line-clamp-2">
                      {link.title}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {link.url}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{link.source}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{link.category}</div>
                      {link.sub_category && (
                        <div className="text-sm text-gray-500">{link.sub_category}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        link.priority >= 80 ? 'bg-red-100 text-red-800' :
                        link.priority >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        link.priority >= 40 ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {link.priority}
                      </span>
                      {link.ai_quality_score && (
                        <span className="ml-2 text-xs text-gray-500">
                          AI: {(link.ai_quality_score * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>👁️ {link.views}</div>
                    <div>👍 {link.likes}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      link.status === 'active' ? 'bg-green-100 text-green-800' :
                      link.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {link.status === 'active' ? '活跃' :
                       link.status === 'pending_review' ? '待审核' :
                       link.status === 'rejected' ? '已驳回' : '非活跃'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(link.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {links.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">暂无符合条件的链接</div>
          </div>
        )}
      </div>

      {/* 自动调整优先级模态框 */}
      {showAutoAdjustModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">自动调整优先级</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                调整策略
              </label>
              <select
                value={adjustStrategy}
                onChange={(e) => setAdjustStrategy(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="mixed">混合策略（推荐）</option>
                <option value="quality_based">基于AI质量评分</option>
                <option value="engagement_based">基于互动数据</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAutoAdjustModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                取消
              </button>
              <button
                onClick={handleAutoAdjust}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                确认调整
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}