import { createClient } from '@supabase/supabase-js';
import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 创建草稿文章
export async function POST(request: Request) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const { linkId, title, content, summary, coverImageUrl, tags, category } =
      await request.json();

    // 验证必要参数
    if (!title || !content) {
      return NextResponse.json(
        { error: '标题和内容不能为空' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const session = cookieStore.get('supabase-auth-token');

    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const userId = JSON.parse(decodeURIComponent(session.value)).user.id;

    // 查找对应的分类
    let categoryId: number | null = null;
    if (category) {
      const { data: categoryData } = await supabase
        .from('article_categories')
        .select('id')
        .eq('name', category)
        .single();

      categoryId = categoryData?.id || null;
    }

    // 创建草稿文章
    const { data: articleData, error: articleError } = await supabase
      .from('articles')
      .insert({
        title: title.trim(),
        content: content.trim(),
        summary: summary.trim() || '',
        cover_image_url: coverImageUrl.trim() || null,
        author_id: userId,
        status: 'draft',
        tags: tags || [],
        category_id: categoryId,
      } as any)
      .select()
      .single();

    if (articleError) {
      console.error('创建草稿失败:', articleError);
      return NextResponse.json(
        { error: '创建草稿失败', details: articleError.message },
        { status: 500 }
      );
    }

    // 如果有关联的链接，更新链接状态
    if (linkId) {
      await supabase
        .from('hot_link_pool')
        .update({
          status: 'promoted',
          article_id: articleData.id,
          reviewed_at: new Date().toISOString(),
          reviewed_by: userId,
        } as any)
        .eq('id', linkId);
    }

    return NextResponse.json({
      success: true,
      articleId: articleData.id,
      message: '草稿创建成功',
    }) as any;
  } catch (error) {
    console.error('创建草稿异常:', error);
    return NextResponse.json(
      { error: `服务器内部错误：${(error as Error).message}` },
      { status: 500 }
    );
  }

    },
    'content_read'
  );

// 获取文章分类列表
export async function GET() {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const { data: categories, error } = await supabase
      .from('article_categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('获取分类失败:', error);
      return NextResponse.json(
        { error: '获取分类失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: categories || [],
    });
  } catch (error) {
    console.error('获取分类异常:', error);
    return NextResponse.json(
      { error: `服务器内部错误：${(error as Error).message}` },
      { status: 500 }
    );
  }

    },
    'content_read'
  );
