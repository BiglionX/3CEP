import { cacheManager, generateCacheKey } from '@/tech/utils/cache-manager';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 涓€у寲鎺ㄨ崘鎺ュ彛
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || 'anonymous';
    const deviceId = searchParams.get('device_id') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '10');
    const strategy = searchParams.get('strategy') || 'hybrid'; // hybrid, content, collaborative

    // 楠岃瘉鍙傛暟
    if (page < 1 || pageSize < 1 || pageSize > 50) {
      return NextResponse.json(
        {
          code: 40001,
          message: '鍙傛暟鏃犳晥',
          data: null,
        },
        { status: 400 }
      );
    }

    // 鐢熸垚缂撳瓨?    const cacheKey = generateCacheKey(
      'recommendations',
      userId,
      deviceId,
      strategy,
      page,
      pageSize
    );

    // 灏濊瘯浠庣紦瀛樿幏?    const cachedResult = await cacheManager.get(cacheKey);
    if (cachedResult) {
      console.log(`馃摝 鎺ㄨ崘缂撳瓨鍛戒腑: ${userId}`);
      return NextResponse.json({
        code: 0,
        message: 'ok',
        data: cachedResult,
        from_cache: true,
        timestamp: new Date().toISOString(),
      });
    }

    // 鑾峰彇鐢ㄦ埛琛屼负鏁版嵁
    const userBehavior = await getUserBehavior(userId, deviceId);

    // 鏍规嵁涓嶅悓绛栫暐鐢熸垚鎺ㄨ崘
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

    // 鍒嗛〉澶勭悊
    const offset = (page - 1) * pageSize;
    const paginatedResults = recommendations.slice(offset, offset + pageSize);

    // 鏍煎紡鍖栬繑鍥炴暟?    const result = {
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

    // 缂撳瓨缁撴灉?灏忔椂?    await cacheManager.set(cacheKey, result, 3600);

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: result,
      from_cache: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('鎺ㄨ崘绯荤粺閿欒:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '鎺ㄨ崘鏈嶅姟鏆傛椂涓嶅彲?,
        data: null,
      },
      { status: 500 }
    );
  }
}

// 鑾峰彇鐢ㄦ埛琛屼负鏁版嵁
async function getUserBehavior(userId: string, deviceId: string) {
  try {
    // 鑾峰彇鐢ㄦ埛鐨勬祻瑙堝巻?    const { data: viewHistory, error: viewError } = await supabase
      .from('user_interactions')
      .select('target_id, target_type, created_at, is_liked')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    // 鑾峰彇璁惧鐩稿叧淇℃伅
    const { data: deviceData, error: deviceError } = await supabase
      .from('user_devices')
      .select('device_model, brand, last_used_at')
      .eq('device_id', deviceId)
      .single();

    // 璁＄畻鍏磋叮鍒嗘暟
    const likedItems = viewHistory?.filter(item => item.is_liked) || [];
    const recentViews = viewHistory?.slice(0, 20) || [];

    // 鍒嗘瀽鍋忓ソ绫诲埆
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
    console.warn('鑾峰彇鐢ㄦ埛琛屼负鏁版嵁澶辫触:', error);
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

// 鍩轰簬鍐呭鐨勬帹?async function getContentBasedRecommendations(behavior: any, deviceId: string) {
  try {
    const recommendations = [];

    // 鍩轰簬鐢ㄦ埛鍋忓ソ绫诲埆鎺ㄨ崘
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
            reason: `鍩轰簬鎮ㄥ"${category}"鐨勫叴瓒ｆ帹鑽恅,
            created_at: item.created_at,
          }))
        );
      }
    }

    // 鍩轰簬璁惧鍨嬪彿鎺ㄨ崘鐩稿叧鍐呭
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
            score: 80, // 璁惧鐩稿叧鎬ц緝?            reason: `涓庢偍?{deviceBrand}璁惧鐩稿叧`,
            created_at: item.created_at,
          }))
        );
      }
    }

    // 鍘婚噸骞舵寜鍒嗘暟鎺掑簭
    const uniqueRecommendations = Array.from(
      new Map(recommendations.map(item => [item.id, item])).values()
    ).sort((a, b) => b.score - a.score);

    return uniqueRecommendations;
  } catch (error) {
    console.warn('鍐呭鎺ㄨ崘澶辫触:', error);
    return [];
  }
}

// 鍗忓悓杩囨护鎺ㄨ崘
async function getCollaborativeRecommendations(userId: string, behavior: any) {
  try {
    // 绠€鍖栫殑鍗忓悓杩囨护锛氭壘鐩镐技鐢ㄦ埛鍠滄鐨勫唴?    const similarUsers = await findSimilarUsers(userId, behavior);

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
              reason: `鐩镐技鐢ㄦ埛涔熷枩娆㈣繖绡囨枃绔燻,
              created_at: article.created_at,
            }))
          );
        }
      }
    }

    return recommendations.sort((a, b) => b.score - a.score).slice(0, 20);
  } catch (error) {
    console.warn('鍗忓悓杩囨护鎺ㄨ崘澶辫触:', error);
    return [];
  }
}

// 娣峰悎鎺ㄨ崘锛堢粨鍚堝绉嶇瓥鐣ワ級
async function getHybridRecommendations(
  userId: string,
  behavior: any,
  deviceId: string
) {
  try {
    // 鑾峰彇鍚勭绛栫暐鐨勭粨?    const [contentRecs, collabRecs, popularRecs] = await Promise.all([
      getContentBasedRecommendations(behavior, deviceId),
      getCollaborativeRecommendations(userId, behavior),
      getPopularContent(),
    ]);

    // 鍔犳潈鍚堝苟缁撴灉
    const scoredRecommendations: Record<string, any> = {};

    // 鍐呭鎺ㄨ崘鏉冮噸?0%
    contentRecs.forEach(item => {
      scoredRecommendations[item.id] = {
        ...item,
        hybridScore: (item.score || 0) * 0.4,
      };
    });

    // 鍗忓悓鎺ㄨ崘鏉冮噸?5%
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

    // 鐑棬鍐呭鏉冮噸?5%
    popularRecs.forEach(item => {
      if (scoredRecommendations[item.id]) {
        scoredRecommendations[item.id].hybridScore += 70 * 0.25;
      } else {
        scoredRecommendations[item.id] = {
          ...item,
          hybridScore: 70 * 0.25,
          reason: '鐑棬鎺ㄨ崘',
        };
      }
    });

    // 杞崲涓烘暟缁勫苟鎺掑簭
    const finalRecommendations = Object.values(scoredRecommendations).sort(
      (a: any, b: any) => b.hybridScore - a.hybridScore
    );

    return finalRecommendations;
  } catch (error) {
    console.warn('娣峰悎鎺ㄨ崘澶辫触:', error);
    return [];
  }
}

// 鑾峰彇鐑棬鍐呭
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
      reason: '鐑棬鍐呭鎺ㄨ崘',
      created_at: article.created_at,
    }));
  } catch (error) {
    console.warn('鑾峰彇鐑棬鍐呭澶辫触:', error);
    return [];
  }
}

// 鏌ユ壘鐩镐技鐢ㄦ埛
async function findSimilarUsers(userId: string, behavior: any) {
  // 绠€鍖栫殑鐩镐技搴﹁绠楋細鍩轰簬鍏卞悓鍠滃ソ
  return [
    { userId: 'user_similar_1', similarity: 0.8 },
    { userId: 'user_similar_2', similarity: 0.7 },
    { userId: 'user_similar_3', similarity: 0.6 },
  ];
}

// 璁＄畻鐩稿叧鎬у垎?function calculateRelevanceScore(item: any, behavior: any, category: string) {
  let score = 50; // 鍩虹鍒嗘暟

  // 鍩轰簬鐐硅禐?  score += Math.min(30, item.like_count || 0);

  // 鍩轰簬娴忚?  score += Math.min(20, Math.floor((item.view_count || 0) / 100));

  // 鍩轰簬鐢ㄦ埛鍏磋叮鍖归厤
  if (behavior.preferredCategories.includes(category)) {
    score += 20;
  }

  // 鍩轰簬鏃舵晥?  const daysOld =
    (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysOld < 7) score += 15;
  else if (daysOld < 30) score += 10;

  return Math.min(100, score);
}

// 浠庣洰鏍囪幏鍙栫被?function getCategoryFromTarget(targetType: string, targetId: string) {
  // 绠€鍖栫殑绫诲埆鏄犲皠
  const categoryMap: Record<string, string> = {
    article: '鎶€鏈枃?,
    part: '閰嶄欢鎺ㄨ崘',
    shop: '缁翠慨搴楅摵',
    hot_link: '鐑偣璧勮',
  };
  return categoryMap[targetType] || '鍏朵粬';
}

