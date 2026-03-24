import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';
import { cookies } from 'next/headers';

// 鍒濆鍖朣upabase瀹㈡埛const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - 鑾峰彇寰呭鏍搁摼鎺ュ垪export async function GET(request: Request) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const status = searchParams.get('status') || 'pending_review';
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * pageSize;

    // 鏋勫缓鏌ヨ鏉′欢
    let query = supabase
      .from('unified_link_library')
      .select(
        `
        id,
        url,
        title,
        description,
        source,
        category,
        sub_category,
        image_url,
        likes,
        views,
        share_count,
        ai_tags,
        scraped_at,
        status,
        reviewed_at,
        rejection_reason,
        article_id,
        created_at,
        updated_at,
        reviewer:reviewed_by (
          id,
          email
        )
      `,
        { count: 'exact' }
      )
      .eq('status', status)
      .order('created_at', { ascending: false });

    // 娣诲姞鍒嗙被绛    if (category) {
      query = query.eq('category', category);
    }

    // 娣诲姞鎼滅储鏉′欢
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // 鍒嗛〉
    const { data, error, count } = await query.range(
      offset,
      offset + pageSize - 1
    );

    if (error) {
      console.error('鑾峰彇寰呭鏍搁摼鎺ュけ', error);
      return NextResponse.json(
        { error: '鑾峰彇鏁版嵁澶辫触', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error('API閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }

    },
    'links_read'
  );

// POST - 鎵归噺鎿嶄綔锛堝彂甯冩垨椹冲洖export async function POST(request: Request) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const { action, ids, rejectionReason } = await request.json();

    if (!action || !ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: '鍙傛暟涓嶅畬 }, { status: 400 });
    }

    const cookieStore = await cookies();
    const session = cookieStore.get('supabase-auth-token');

    if (!session) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    const userId = JSON.parse(session.value).user.id;

    let updateData: any = {
      reviewed_at: new Date().toISOString(),
      reviewed_by: userId,
    };

    switch (action) {
      case 'publish':
        // 鍙戝竷鎿嶄綔锛氬垱寤烘枃绔犺崏绋垮苟鏇存柊炬帴鐘        updateData.status = 'promoted';

        // 涓烘瘡涓摼鎺ュ垱寤哄搴旂殑鏂囩珷
        for (const id of ids) {
          const { data: linkData } = await supabase
            .from('unified_link_library')
            .select('*')
            .eq('id', id)
            .single();

          if (linkData) {
            const { data: articleData, error: articleError } = await supabase
              .from('articles')
              .insert({
                title: linkData.title,
                content: linkData.description,
                summary: linkData.substring(0, 200),
                cover_image_url: linkData.image_url,
                author_id: userId,
                status: 'published', // 鐩存帴鍙戝竷
                tags: linkData.tags || [],
                publish_at: new Date().toISOString(),
              } as any)
              .select()
              .single();

            if (articleData && !articleError) {
              // 鏇存柊炬帴鍏宠仈鐨勬枃绔營D
              await supabase
                .from('unified_link_library')
                .update({
                  article_id: articleData.id,
                  ...updateData,
                } as any)
                .eq('id', id);
            }
          }
        }
        break;

      case 'reject':
        // 椹冲洖鎿嶄綔
        updateData.status = 'rejected';
        updateData.rejection_reason = rejectionReason || '瀹℃牳鏈€氳繃';

        await supabase
          .from('unified_link_library')
          .update(updateData)
          .in('id', ids);
        break;

      default:
        return NextResponse.json(
          { error: '涓嶆敮鎸佺殑鎿嶄綔绫诲瀷' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `鎴愬姛${action === 'publish' ? '鍙戝竷' : '椹冲洖'} ${ids.length} 鏉¤褰昤,
    }) as any;
  } catch (error) {
    console.error('鎵归噺鎿嶄綔澶辫触:', error);
    return NextResponse.json(
      { error: '鎿嶄綔澶辫触', details: (error as Error).message },
      { status: 500 }
    );
  }

    },
    'links_read'
  );

