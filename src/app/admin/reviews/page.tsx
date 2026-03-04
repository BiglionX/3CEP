'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Filter,
  User,
  Calendar,
  BookOpen,
  Search,
  AlertCircle
} from 'lucide-react';
import { 
  getPendingReviews, 
  getReviewStats, 
  updateReviewStatus,
  assignReviewer,
  getReviewers
} from '@/services/review-service';

interface Review {
  id: string;
  document_id: string;
  reviewer_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
  comments: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  document?: {
    title: string;
    language: string;
    category: string;
    content: string;
  };
  reviewer?: {
    email: string;
    user_metadata: {
      name?: string;
    };
  };
}

interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  today_reviews: number;
}

export default function AdminReviewPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [selectedReviewer, setSelectedReviewer] = useState('');

  useEffect(() => {
    loadReviews();
    loadStats();
    loadReviewers();
  }, []);

  const loadReviews = async () => {
    try {
      const { data, error } = await getPendingReviews();
      if (!error && data) {
        setReviews(data);
      }
    } catch (error) {
      console.error('加载审核列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await getReviewStats();
      if (!error && data) {
        setStats(data);
      }
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  const loadReviewers = async () => {
    try {
      const { data, error } = await getReviewers();
      if (!error && data) {
        setReviewers(data);
      }
    } catch (error) {
      console.error('加载审核员失?', error);
    }
  };

  const handleApprove = async (reviewId: string) => {
    const confirmed = window.confirm('确定要批准这份文档吗?);
    if (!confirmed) return;

    try {
      const { success, error } = await updateReviewStatus(reviewId, 'approved');
      if (success) {
        alert('文档已批准！');
        loadReviews();
        loadStats();
      } else {
        alert(`操作失败: ${error}`);
      }
    } catch (error) {
      alert('操作失败');
    }
  };

  const handleReject = async (reviewId: string) => {
    const reason = prompt('请输入拒绝原?');
    if (!reason) return;

    try {
      const { success, error } = await updateReviewStatus(reviewId, 'rejected', reason);
      if (success) {
        alert('文档已被拒绝');
        loadReviews();
        loadStats();
      } else {
        alert(`操作失败: ${error}`);
      }
    } catch (error) {
      alert('操作失败');
    }
  };

  const handleAssignReviewer = async () => {
    if (!selectedReview || !selectedReviewer) return;

    setAssigning(true);
    try {
      const { success, error } = await assignReviewer(selectedReview.document_id, selectedReviewer);
      if (success) {
        alert('审核员分配成功！');
        setShowAssignModal(false);
        setSelectedReviewer('');
        loadReviews();
      } else {
        alert(`分配失败: ${error}`);
      }
    } catch (error) {
      alert('分配失败');
    } finally {
      setAssigning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '已批?;
      case 'rejected':
        return '已拒?;
      default:
        return '待审?;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载?..</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">审核管理中心</h1>
          <p className="text-gray-600 mt-2">管理产品说明书的审核流程</p>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-3">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">总文档数</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-yellow-100 p-3">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">待审?/p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">已批?/p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-red-100 p-3">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">已拒?/p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-purple-100 p-3">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">今日审核</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.today_reviews}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 待审核文档列?*/}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">待审核文?/h2>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无待审核文?/h3>
              <p className="text-gray-500">所有文档都已处理完?/p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <div key={review.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {review?.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(review.status)}`}>
                          {getStatusText(review.status)}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {review?.category}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {review?.language}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {review.comments && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">备注:</span> {review.comments}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedReview(review)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        查看详情
                      </Button>
                      
                      <Button 
                        size="sm"
                        onClick={() => handleApprove(review.id)}
                        disabled={review.status !== 'pending'}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        批准
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleReject(review.id)}
                        disabled={review.status !== 'pending'}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        拒绝
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 文档详情模态框 */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">文档详情</h3>
                <Button variant="ghost" onClick={() => setSelectedReview(null)}>×</Button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">标题</h4>
                  <p className="text-gray-600">{selectedReview?.title}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">分类</h4>
                  <p className="text-gray-600">{selectedReview?.category}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">语言</h4>
                  <p className="text-gray-600">{selectedReview?.language}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">内容预览</h4>
                  <div className="bg-gray-50 p-4 rounded mt-2 max-h-40 overflow-y-auto">
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">
                      {selectedReview?.content.substring(0, 500)}...
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setSelectedReview(null)}>
                关闭
              </Button>
              <Button onClick={() => {
                setShowAssignModal(true);
                setSelectedReview(selectedReview);
              }}>
                分配审核?
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 分配审核员模态框 */}
      {showAssignModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold">分配审核?/h3>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择审核?
                </label>
                <select
                  value={selectedReviewer}
                  onChange={(e) => setSelectedReviewer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择审核?/option>
                  {reviewers.map((reviewer) => (
                    <option key={reviewer.id} value={reviewer.user_id}>
                      {reviewer?.user_metadata?.name || reviewer?.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedReviewer('');
                }}
              >
                取消
              </Button>
              <Button 
                onClick={handleAssignReviewer}
                disabled={!selectedReviewer || assigning}
              >
                {assigning ? '分配?..' : '确认分配'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
