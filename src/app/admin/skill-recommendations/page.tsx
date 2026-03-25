'use client';

import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import { Eye, MousePointer, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Recommendation {
  id: string;
  user_id?: string;
  skill_id: string;
  recommendation_type: string;
  score: number;
  reason?: string;
  is_clicked: boolean;
  created_at: string;
  skill_name?: string;
  user_email?: string;
}

export default function SkillRecommendationsManagementPage() {
  const { isAuthenticated, is_admin, isLoading } = useUnifiedAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7');

  // 认证检查
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !is_admin)) {
      window.location.href = `/login?redirect=${encodeURIComponent('/admin/skill-recommendations')}`;
    }
  }, [isAuthenticated, is_admin, isLoading]);

  // 加载推荐数据
  useEffect(() => {
    if (isAuthenticated && is_admin) {
      loadRecommendations();
    }
  }, [isAuthenticated, is_admin, filterType, dateRange]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      // TODO: 实现获取推荐列表的 API
      // const response = await fetch(`/api/admin/skill-recommendations/list-all?type=${filterType}&days=${dateRange}`);
      // const result = await response.json();

      // 模拟数据
      setRecommendations([]);
    } catch (error) {
      console.error('加载推荐数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 统计信息
  const stats = {
    total: recommendations.length,
    clicked: recommendations.filter(r => r.is_clicked).length,
    ctr:
      recommendations.length > 0
        ? (
            (recommendations.filter(r => r.is_clicked).length /
              recommendations.length) *
            100
          ).toFixed(1)
        : '0.0',
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
          <h1 className="text-3xl font-bold text-gray-900">推荐系统管理</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理 Skills 推荐算法和数据
          </p>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="flex items-center space-x-4">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">全部类型</option>
          <option value="hot">热门推荐</option>
          <option value="similar">相似推荐</option>
          <option value="personalized">个性化推荐</option>
        </select>

        <select
          value={dateRange}
          onChange={e => setDateRange(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="1">最近 1 天</option>
          <option value="7">最近 7 天</option>
          <option value="30">最近 30 天</option>
          <option value="90">最近 90 天</option>
        </select>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">总推荐数</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.total}
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">点击次数</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.clicked}
              </div>
            </div>
            <MousePointer className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">点击率</div>
              <div className="text-2xl font-bold text-purple-600">
                {stats.ctr}%
              </div>
            </div>
            <Eye className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">覆盖用户</div>
              <div className="text-2xl font-bold text-orange-600">
                {
                  new Set(recommendations.map(r => r.user_id).filter(Boolean))
                    .size
                }
              </div>
            </div>
            <Users className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* 推荐列表 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">推荐记录</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  推荐 ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  用户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Skill
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  分数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  理由
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  时间
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
              ) : recommendations.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    暂无推荐记录
                  </td>
                </tr>
              ) : (
                recommendations.map(rec => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {rec.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {rec.user_email ||
                        `${rec.user_id?.slice(0, 8)}...` ||
                        '匿名用户'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {rec.skill_name || `${rec.skill_id.slice(0, 8)}...`}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rec.recommendation_type === 'hot'
                            ? 'bg-red-100 text-red-800'
                            : rec.recommendation_type === 'similar'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {rec.recommendation_type === 'hot' && (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        )}
                        {rec.recommendation_type === 'similar' && (
                          <Star className="w-3 h-3 mr-1" />
                        )}
                        {rec.recommendation_type === 'personalized' && (
                          <Zap className="w-3 h-3 mr-1" />
                        )}
                        {rec.recommendation_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-blue-600">
                        {(rec.score * 100).toFixed(0)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {rec.reason || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rec.is_clicked
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {rec.is_clicked ? '已点击' : '未点击'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(rec.created_at).toLocaleDateString('zh-CN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 说明信息 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          推荐算法说明:
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • <strong>热门推荐</strong>:
            基于浏览量、下载量、使用量、评分综合计算
          </li>
          <li>
            • <strong>相似推荐</strong>: 基于分类、标签重叠度、评分接近度
          </li>
          <li>
            • <strong>个性化推荐</strong>: 基于用户浏览历史和偏好分类
          </li>
        </ul>
      </div>
    </div>
  );
}
