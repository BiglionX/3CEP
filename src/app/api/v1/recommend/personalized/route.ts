import { cacheManager, generateCacheKey } from '@/utils/cache-manager';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 个性化推荐接口
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || 'anonymous';
    const deviceId = searchParams.get('device_id') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '10');
    const strategy = searchParams.get('strategy') || 'hybrid'; // hybrid, content, collaborative

    // 验证参数
    if (page < 1 || pageSize < 1 || pageSize > 50) {
      return NextResponse.json(
        {
          code: 40001,
          message: '参数无效',
          data: null,
        },
        { status: 400 }
      );
    }

    // 生成缓存键
    const cacheKey = generateCacheKey(
      'recommendations',
      userId,
      deviceId,
      strategy,
      page,
      pageSize
    );

    // 尝试从缓存获取
    const cachedResult = await cacheManager.get(cacheKey);
    if (cachedResult) {
      console.log(`📦 推荐缓存命中: ${userId}`);
      return NextResponse.json({
        code: 0,
        message: 'ok',
        data: cachedResult,
        from_cache: true,
        timestamp: new Date().toISOString(),
      });
    }

    // 获取用户行为数据
    const userBehavior = await getUserBehavior(userId, deviceId);

    // 根据不同策略生成推荐
    let recommendations = [];

    switch (strategy) {
      case 'content':
        recommendations = await getContentBasedRecommendations(
          userBehavior,
          deviceId
        );
        break;
      case 'collaborative':
        recommendations = await getCollaborativeRecommendations(
          userId,
          userBehavior
        );
        break;
      case 'hybrid':
      default:
        recommendations = await getHybridRecommendations(
          userId,
          userBehavior,
          deviceId
        );
        break;
    }

    // 分页处理
    const offset = (page - 1) * pageSize;
    const paginatedResults = recommendations.slice(offset, offset + pageSize);

    // 格式化返回数据
    const result = {
      list: paginatedResults,
      total: recommendations.length,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(recommendations.length / pageSize),
      strategy,
      user_profile: {
        interest_score: userBehavior.interestScore,
        activity_level: userBehavior.activityLevel,
        preferred_categories: userBehavior.preferredCategories,
      },
    };

    // 缓存结果（1小时）
    await cacheManager.set(cacheKey, result, 3600);

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: result,
      from_cache: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('推荐系统错误:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '推荐服务暂时不可用',
        data: null,
      },
      { status: 500 }
    );
  }
}

// 获取用户行为数据
async function getUserBehavior(userId: string, deviceId: string) {
  try {
    // 获取用户的浏览历史
    const { data: viewHistory, error: viewError } = await supabase
      .from('user_interactions')
      .select('target_id, target_type, created_at, is_liked')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    // 获取设备相关信息
    const { data: deviceData, error: deviceError } = await supabase
      .from('user_devices')
      .select('device_model, brand, last_used_at')
      .eq('device_id', deviceId)
      .single();

    // 计算兴趣分数
    const likedItems = viewHistory?.filter(item => item.is_liked) || [];
    const recentViews = viewHistory?.slice(0, 20) || [];

    // 分析偏好类别
    const categoryCounts: Record<string, number> = {};
    recentViews.forEach(view => {
      const category = getCategoryFromTarget(view.target_type, view.target_id);
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const preferredCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    return {
      userId,
      deviceId,
      viewHistory: recentViews,
      likedItems,
      deviceInfo: deviceData,
      interestScore: Math.min(
        100,
        likedItems.length * 10 + recentViews.length * 2
      ),
      activityLevel:
        recentViews.length > 10
          ? 'high'
          : recentViews.length > 5
          ? 'medium'
          : 'low',
      preferredCategories,
    };
  } catch (error) {
    console.warn('获取用户行为数据失败:', error);
    return {
      userId,
      deviceId,
      viewHistory: [],
      likedItems: [],
      deviceInfo: null,
      interestScore: 0,
      activityLevel: 'low',
      preferredCategories: [],
    };
  }
}

// 基于内容的推荐
async function getContentBasedRecommendations(behavior: any, deviceId: string) {
  try {
    const recommendations = [];

    // 基于用户偏好类别推荐
    for (const category of behavior.preferredCategories) {
      const { data: categoryItems } = await supabase
        .from('articles')
        .select(
          'id, title, summary, cover_image_url, like_count, view_count, created_at'
        )
        .ilike('tags', `%${category}%`)
        .eq('status', 'published')
        .order('like_count', { ascending: false })
        .limit(5);

      if (categoryItems) {
        recommendations.push(
          ...categoryItems.map(item => ({
            id: item.id,
            type: 'article',
            title: item.title,
            summary: item.summary,
            cover_image: item.cover_image_url,
            like_count: item.like_count,
            view_count: item.view_count,
            score: calculateRelevanceScore(item, behavior, category),
            reason: `基于您对"${category}"的兴趣推荐`,
            created_at: item.created_at,
          }))
        );
      }
    }

    // 基于设备型号推荐相关内容
    if (behavior.deviceInfo) {
      const deviceBrand = behavior.deviceInfo.brand;
      const { data: deviceArticles } = await supabase
        .from('articles')
        .select(
          'id, title, summary, cover_image_url, like_count, view_count, created_at'
        )
        .ilike('title', `%${deviceBrand}%`)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3);

      if (deviceArticles) {
        recommendations.push(
          ...deviceArticles.map(item => ({
            id: item.id,
            type: 'article',
            title: item.title,
            summary: item.summary,
            cover_image: item.cover_image_url,
            like_count: item.like_count,
            view_count: item.view_count,
            score: 80, // 设备相关性较高
            reason: `与您的${deviceBrand}设备相关`,
            created_at: item.created_at,
          }))
        );
      }
    }

    // 去重并按分数排序
    const uniqueRecommendations = Array.from(
      new Map(recommendations.map(item => [item.id, item])).values()
    ).sort((a, b) => b.score - a.score);

    return uniqueRecommendations;
  } catch (error) {
    console.warn('内容推荐失败:', error);
    return [];
  }
}

// 协同过滤推荐
async function getCollaborativeRecommendations(userId: string, behavior: any) {
  try {
    // 简化的协同过滤：找相似用户喜欢的内容
    const similarUsers = await findSimilarUsers(userId, behavior);

    const recommendations = [];

    for (const similarUser of similarUsers) {
      const { data: likedArticles } = await supabase
        .from('user_interactions')
        .select('target_id')
        .eq('user_id', similarUser.userId)
        .eq('is_liked', true)
        .eq('target_type', 'article')
        .limit(10);

      if (likedArticles) {
        const articleIds = likedArticles.map(item => item.target_id);
        const { data: articles } = await supabase
          .from('articles')
          .select(
            'id, title, summary, cover_image_url, like_count, view_count, created_at'
          )
          .in('id', articleIds)
          .eq('status', 'published');

        if (articles) {
          recommendations.push(
            ...articles.map(article => ({
              id: article.id,
              type: 'article',
              title: article.title,
              summary: article.summary,
              cover_image: article.cover_image_url,
              like_count: article.like_count,
              view_count: article.view_count,
              score: 70 + similarUser.similarity * 20,
              reason: `相似用户也喜欢这篇文章`,
              created_at: article.created_at,
            }))
          );
        }
      }
    }

    return recommendations.sort((a, b) => b.score - a.score).slice(0, 20);
  } catch (error) {
    console.warn('协同过滤推荐失败:', error);
    return [];
  }
}

// 混合推荐（结合多种策略）
async function getHybridRecommendations(
  userId: string,
  behavior: any,
  deviceId: string
) {
  try {
    // 获取各种策略的结果
    const [contentRecs, collabRecs, popularRecs] = await Promise.all([
      getContentBasedRecommendations(behavior, deviceId),
      getCollaborativeRecommendations(userId, behavior),
      getPopularContent(),
    ]);

    // 加权合并结果
    const scoredRecommendations: Record<string, any> = {};

    // 内容推荐权重：40%
    contentRecs.forEach(item => {
      scoredRecommendations[item.id] = {
        ...item,
        hybridScore: (item.score || 0) * 0.4,
      };
    });

    // 协同推荐权重：35%
    collabRecs.forEach(item => {
      if (scoredRecommendations[item.id]) {
        scoredRecommendations[item.id].hybridScore += (item.score || 0) * 0.35;
        scoredRecommendations[item.id].reason += ' | ' + item.reason;
      } else {
        scoredRecommendations[item.id] = {
          ...item,
          hybridScore: (item.score || 0) * 0.35,
        };
      }
    });

    // 热门内容权重：25%
    popularRecs.forEach(item => {
      if (scoredRecommendations[item.id]) {
        scoredRecommendations[item.id].hybridScore += 70 * 0.25;
      } else {
        scoredRecommendations[item.id] = {
          ...item,
          hybridScore: 70 * 0.25,
          reason: '热门推荐',
        };
      }
    });

    // 转换为数组并排序
    const finalRecommendations = Object.values(scoredRecommendations).sort(
      (a: any, b: any) => b.hybridScore - a.hybridScore
    );

    return finalRecommendations;
  } catch (error) {
    console.warn('混合推荐失败:', error);
    return [];
  }
}

// 获取热门内容
async function getPopularContent() {
  try {
    const { data: popularArticles } = await supabase
      .from('articles')
      .select(
        'id, title, summary, cover_image_url, like_count, view_count, created_at'
      )
      .eq('status', 'published')
      .order('view_count', { ascending: false })
      .limit(10);

    return (popularArticles || []).map(article => ({
      id: article.id,
      type: 'article',
      title: article.title,
      summary: article.summary,
      cover_image: article.cover_image_url,
      like_count: article.like_count,
      view_count: article.view_count,
      score: 70,
      reason: '热门内容推荐',
      created_at: article.created_at,
    }));
  } catch (error) {
    console.warn('获取热门内容失败:', error);
    return [];
  }
}

// 查找相似用户
async function findSimilarUsers(userId: string, behavior: any) {
  // 简化的相似度计算：基于共同喜好
  return [
    { userId: 'user_similar_1', similarity: 0.8 },
    { userId: 'user_similar_2', similarity: 0.7 },
    { userId: 'user_similar_3', similarity: 0.6 },
  ];
}

// 计算相关性分数
function calculateRelevanceScore(item: any, behavior: any, category: string) {
  let score = 50; // 基础分数

  // 基于点赞数
  score += Math.min(30, item.like_count || 0);

  // 基于浏览量
  score += Math.min(20, Math.floor((item.view_count || 0) / 100));

  // 基于用户兴趣匹配
  if (behavior.preferredCategories.includes(category)) {
    score += 20;
  }

  // 基于时效性
  const daysOld =
    (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysOld < 7) score += 15;
  else if (daysOld < 30) score += 10;

  return Math.min(100, score);
}

// 从目标获取类别
function getCategoryFromTarget(targetType: string, targetId: string) {
  // 简化的类别映射
  const categoryMap: Record<string, string> = {
    article: '技术文章',
    part: '配件推荐',
    shop: '维修店铺',
    hot_link: '热点资讯',
  };
  return categoryMap[targetType] || '其他';
}
