'use client';

import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import { CheckCircle, Flag, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Review {
  id: string;
  skill_id: string;
  skill_name?: string;
  user_email: string;
  rating: number;
  title: string;
  content: string;
  is_approved: boolean;
  is_offensive: boolean;
  helpful_count: number;
  created_at: string;
}

export default function SkillReviewsManagementPage() {
  const { isAuthenticated, is_admin, isLoading } = useUnifiedAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reported'>('all');

  // 认证检查
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !is_admin)) {
      window.location.href = `/login?redirect=${encodeURIComponent('/admin/skill-reviews')}`;
    }
  }, [isAuthenticated, is_admin, isLoading]);

  // 加载评论列表
  useEffect(() => {
    if (isAuthenticated && is_admin) {
      loadReviews();
    }
  }, [filter, isAuthenticated, is_admin]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      let endpoint = '/api/admin/skill-reviews/list/all';

      switch (filter) {
        case 'pending':
          endpoint = '/api/admin/skill-reviews/list/pending';
          break;
        case 'reported':
          endpoint = '/api/admin/skill-reviews/list/reported';
          break;
      }

      const response = await fetch(endpoint);
      const result = await response.json();

      if (result.success) {
        setReviews(result.data || []);
      } else {
        console.error('加载评论失败:', result.error);
        setReviews([]);
      }
    } catch (error) {
      console.error('加载评论失败:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // 审核评论
  const handleApprove = async (reviewId: string, approved: boolean) => {
    try {
      const response = await fetch('/api/admin/skill-reviews/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, approved }),
      });

      const result = await response.json();
      if (result.success) {
        alert(approved ? '已通过' : '已驳回');
        loadReviews();
      } else {
        alert(`操作失败：${result.error}`);
      }
    } catch (error) {
      console.error('审核评论失败:', error);
      alert('操作失败，请重试');
    }
  };

  // 删除评论
  const handleDelete = async (reviewId: string) => {
    if (!confirm('确定要删除这条评论吗？')) return;

    try {
      const response = await fetch(`/api/admin/skill-reviews/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId }),
      });

      const result = await response.json();
      if (result.success) {
        alert('评论已删除');
        loadReviews();
      } else {
        alert(`操作失败：${result.error}`);
      }
    } catch (error) {
      console.error('删除评论失败:', error);
      alert('操作失败，请重试');
    }
  };

  // 查看 Skill 详情
  const viewSkill = (skillId: string) => {
    window.open(`/admin/skill-store/${skillId}`, '_blank');
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
          <h1 className="text-3xl font-bold text-gray-900">评论管理</h1>
          <p className="mt-1 text-sm text-gray-500">审核和管理用户评论</p>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          全部评论
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          待审核
        </button>
        <button
          onClick={() => setFilter('reported')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'reported'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          被举报
        </button>
      </div>

      {/* 评论列表 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  评分
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  评论内容
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Skill
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  用户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  时间
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
              ) : reviews.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    暂无评论
                  </td>
                </tr>
              ) : (
                reviews.map(review => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <div className="text-sm text-gray-900 truncate">
                        {review.title || '无标题'}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {review.content.substring(0, 100)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => viewSkill(review.skill_id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        查看 Skill
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {review.user_email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {review.is_approved ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            已通过
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            待审核
                          </span>
                        )}
                        {review.is_offensive && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Flag className="w-3 h-3 mr-1" />
                            被举报
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {!review.is_approved && (
                          <>
                            <button
                              onClick={() => handleApprove(review.id, true)}
                              className="text-green-600 hover:text-green-800"
                              title="通过"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApprove(review.id, false)}
                              className="text-red-600 hover:text-red-800"
                              title="驳回"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="text-gray-600 hover:text-gray-800"
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
          <div className="text-sm text-gray-600">总评论数</div>
          <div className="text-2xl font-bold text-gray-900">
            {reviews.length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">待审核</div>
          <div className="text-2xl font-bold text-yellow-600">
            {reviews.filter(r => !r.is_approved).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">被举报</div>
          <div className="text-2xl font-bold text-red-600">
            {reviews.filter(r => r.is_offensive).length}
          </div>
        </div>
      </div>
    </div>
  );
}
