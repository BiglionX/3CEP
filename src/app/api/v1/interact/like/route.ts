import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 点赞/取消点赞接口
export async function POST(request: Request) {
  try {
    // 获取认证信息
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          code: 40101,
          message: '未授权访问',
          data: null,
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    // 实际应用中需要验证JWT令牌

    // 获取请求体
    const body = await request.json();
    const { target_id, target_type } = body;

    // 验证参数
    if (!target_id || !target_type) {
      return NextResponse.json(
        {
          code: 40001,
          message: '缺少必要参数',
          data: null,
        },
        { status: 400 }
      );
    }

    if (!['hot_link', 'article'].includes(target_type)) {
      return NextResponse.json(
        {
          code: 40001,
          message: '不支持的目标类型',
          data: null,
        },
        { status: 400 }
      );
    }

    // 模拟用户ID - 实际应该从JWT中解析
    const userId = 'user_123';

    // 检查是否已经点赞
    const { data: existingLike, error: checkError } = await supabase
      .from('user_interactions')
      .select('id, is_liked')
      .eq('user_id', userId)
      .eq('target_id', target_id)
      .eq('target_type', target_type)
      .single();

    let currentLikes = 0;
    let isLiked = false;

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116表示未找到记录
      console.error('检查点赞状态失败:', checkError);
      // 继续执行，不中断流程
    }

    if (existingLike) {
      // 已有点赞记录，执行取消点赞或重新点赞
      isLiked = !existingLike.is_liked;

      const { error: updateError } = await supabase
        .from('user_interactions')
        .update({
          is_liked: isLiked,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', existingLike.id);

      if (updateError) {
        console.error('更新点赞状态失败:', updateError);
        return NextResponse.json(
          {
            code: 50001,
            message: '操作失败',
            data: null,
          },
          { status: 500 }
        );
      }
    } else {
      // 首次点赞
      isLiked = true;

      const { error: insertError } = await supabase
        .from('user_interactions')
        .insert({
          user_id: userId,
          target_id: target_id,
          target_type: target_type,
          is_liked: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any);

      if (insertError) {
        console.error('创建点赞记录失败:', insertError);
        return NextResponse.json(
          {
            code: 50001,
            message: '操作失败',
            data: null,
          },
          { status: 500 }
        );
      }
    }

    // 更新目标对象的点赞数
    const targetTable =
      target_type === 'article' ? 'articles' : 'hot_link_pool';
    const likeField = target_type === 'article' ? 'like_count' : 'likes';

    // 获取当前点赞数
    const { data: targetData, error: targetError } = await supabase
      .from(targetTable)
      .select(likeField)
      .eq('id', target_id)
      .single();

    if (!targetError && targetData) {
      currentLikes = targetData[likeField] || 0;
      // 根据操作类型调整点赞数
      currentLikes = isLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);

      // 更新点赞数
      await supabase
        .from(targetTable)
        .update({ [likeField]: currentLikes } as any)
        .eq('id', target_id);
    }

    // 如果是热点链接且点赞数达到阈值，触发沉淀流程
    if (target_type === 'hot_link' && isLiked && currentLikes >= 3) {
      try {
        // 触发文章沉淀流程
        await triggerArticleCreation(target_id);
      } catch (error) {
        console.warn('触发文章沉淀流程失败:', error);
        // 不中断主流程
      }
    }

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: {
        current_likes: currentLikes,
        is_liked: isLiked,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('点赞API错误:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '服务器内部错误',
        data: null,
      },
      { status: 500 }
    );
  }
}

// 触发文章沉淀流程
async function triggerArticleCreation(hotLinkId: string) {
  try {
    // 获取热点链接信息
    const { data: hotLink, error } = await supabase
      .from('hot_link_pool')
      .select('*')
      .eq('id', hotLinkId)
      .single();

    if (error || !hotLink) {
      throw new Error('获取热点链接失败');
    }

    // 创建文章草稿
    const { data: article, insertError } = await supabase
      .from('articles')
      .insert({
        title: hotLink.title,
        content: `# ${hotLink.title} as any

${hotLink.description || ''}

[原文链接](${hotLink.url})`,
        summary: hotLink.description || hotLink.title,
        source_url: hotLink.url,
        status: 'pending_review',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw new Error('创建文章失败');
    }

    // 更新热点链接关联的文章ID
    await supabase
      .from('hot_link_pool')
      .update({
        article_id: article.id,
        status: 'promoted',
      } as any)
      .eq('id', hotLinkId);

    console.log(
      `✅ 热点链接 ${hotLinkId} 已触发文章沉淀，文章ID: ${article.id}`
    );
  } catch (error) {
    console.error('文章沉淀流程失败:', error);
    throw error;
  }
}
