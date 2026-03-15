import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 鍒涘缓鑽夌鏂囩珷
export async function POST(request: Request) {
  try {
    const { linkId, title, content, summary, coverImageUrl, tags, category } =
      await request.json();

    // 楠岃瘉蹇呰鍙傛暟
    if (!title || !content) {
      return NextResponse.json(
        { error: '鏍囬鍜屽唴瀹逛笉鑳戒负 },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const session = cookieStore.get('supabase-auth-token');

    if (!session) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    const userId = JSON.parse(session.value).user.id;

    // 鏌ユ壘瀵瑰簲鐨勫垎    let categoryId = null;
    if (category) {
      const { data: categoryData } = await supabase
        .from('article_categories')
        .select('id')
        .eq('name', category)
        .single();

      categoryId = categoryData.id || null;
    }

    // 鍒涘缓鑽夌鏂囩珷
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
      console.error('鍒涘缓鑽夌澶辫触:', articleError);
      return NextResponse.json(
        { error: '鍒涘缓鑽夌澶辫触', details: articleError.message },
        { status: 500 }
      );
    }

    // 濡傛灉鏈夊叧鑱旂殑炬帴锛屾洿鏂伴摼鎺ョ姸    if (linkId) {
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
      message: '鑽夌鍒涘缓鎴愬姛',
    }) as any;
  } catch (error) {
    console.error('鍒涘缓鑽夌寮傚父:', error);
    return NextResponse.json(
      { error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊, details: (error as Error).message },
      { status: 500 }
    );
  }
}

// 鑾峰彇鏂囩珷鍒嗙被鍒楄〃
export async function GET() {
  try {
    const { data: categories, error } = await supabase
      .from('article_categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('鑾峰彇鍒嗙被澶辫触:', error);
      return NextResponse.json(
        { error: '鑾峰彇鍒嗙被澶辫触', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: categories || [],
    });
  } catch (error) {
    console.error('鑾峰彇鍒嗙被寮傚父:', error);
    return NextResponse.json(
      { error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊, details: (error as Error).message },
      { status: 500 }
    );
  }
}

