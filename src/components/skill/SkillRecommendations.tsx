'use client';

import { ExternalLink, Star, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Recommendation {
  skill_id: string;
  similarity_score?: number;
  hot_score?: number;
  personal_score?: number;
  reason?: string;
  // Skill 详情 (需要额外获取)
  name?: string;
  title?: string;
  description?: string;
  rating?: number;
  usage_count?: number;
}

interface SkillRecommendationsProps {
  skillId?: string; // 用于相似推荐
  type?: 'hot' | 'similar' | 'personalized';
  limit?: number;
  title?: string;
}

export function SkillRecommendations({
  skillId,
  type = 'hot',
  limit = 10,
  title,
}: SkillRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [type, skillId, limit]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        type,
        limit: limit.toString(),
      });

      if (skillId) {
        params.append('skillId', skillId);
      }

      const response = await fetch(
        `/api/admin/skill-recommendations/list?${params}`
      );
      const result = await response.json();

      if (result.success) {
        setRecommendations(result.data || []);
      } else {
        setError(result.error || '加载失败');
      }
    } catch (err: any) {
      console.error('加载推荐失败:', err);
      setError(err.message || '网络错误');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'hot':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      case 'similar':
        return <Star className="w-5 h-5 text-blue-500" />;
      case 'personalized':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-500" />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'hot':
        return '热门推荐';
      case 'similar':
        return '相似 Skills';
      case 'personalized':
        return '为您推荐';
      default:
        return '推荐列表';
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center text-red-600 py-8">
          <p>加载失败：{error}</p>
          <button
            onClick={loadRecommendations}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <h3 className="text-lg font-semibold text-gray-900">
            {title || getDefaultTitle()}
          </h3>
        </div>
        <span className="text-sm text-gray-500">
          {recommendations.length} 个推荐
        </span>
      </div>

      {/* 推荐列表 */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-4">
              <div className="flex-1 h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center text-gray-500 py-8">暂无推荐</div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={rec.skill_id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* 排名 */}
                  <div className="flex items-center space-x-2 mb-2">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index < 3
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </span>
                    {rec.reason && (
                      <span className="text-xs text-gray-500">
                        {rec.reason}
                      </span>
                    )}
                  </div>

                  {/* Skill 信息 */}
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {rec.name ||
                        rec.title ||
                        `Skill ${rec.skill_id.slice(0, 8)}...`}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {rec.description || '暂无描述'}
                    </p>
                  </div>

                  {/* 统计信息 */}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    {rec.rating && (
                      <div className="flex items-center">
                        <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                        <span>{rec.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {rec.usage_count && (
                      <div className="flex items-center">
                        <Zap className="w-3 h-3 mr-1" />
                        <span>{rec.usage_count} 次使用</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 分数 */}
                <div className="ml-4 text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {(
                      (rec.similarity_score ||
                        rec.hot_score ||
                        rec.personal_score ||
                        0) * 100
                    ).toFixed(0)}
                    %
                  </div>
                  <div className="text-xs text-gray-500">匹配度</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 查看更多 */}
      {recommendations.length > 0 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto">
            查看更多
            <ExternalLink className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
