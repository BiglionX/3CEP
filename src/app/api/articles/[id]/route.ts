import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 获取单篇文章详情
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id;

    // 获取文章详情
    const { data: article, error } = await supabase
      .from('articles')
      .select(
        `
        id,
        title,
        summary,
        content,
        cover_image_url,
        tags,
        view_count,
        like_count,
        comment_count,
        status,
        created_at,
        updated_at,
        author_id,
        authors (id, name, avatar_url, bio),
        category_id,
        article_categories (id, name, slug, description)
      `
      )
      .eq('id', articleId)
      .eq('status', 'published')
      .single();

    if (error) {
      console.error('获取文章详情失败:', error);
      return NextResponse.json(
        { error: '文章不存在或已被删除' },
        { status: 404 }
      );
    }

    if (!article) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    // 增加浏览量
    await supabase
      .from('articles')
      .update({ view_count: (article.view_count || 0) + 1 } as any)
      .eq('id', articleId);

    // 获取相关文章（同分类的其他文章）
    const { data: relatedArticles } = await supabase
      .from('articles')
      .select(
        `
        id,
        title,
        summary,
        cover_image_url,
        created_at,
        article_categories (name)
      `
      )
      .eq('category_id', article.category_id)
      .eq('status', 'published')
      .neq('id', articleId)
      .limit(4)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      data: {
        ...article,
        view_count: (article.view_count || 0) + 1,
      },
      relatedArticles: relatedArticles || [],
    });
  } catch (error) {
    console.error('获取文章详情异常:', error);
    return NextResponse.json(
      { error: '服务器内部错误', details: (error as Error).message },
      { status: 500 }
    );
  }
}
