import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 楠岃瘉绠＄悊鍛樻潈    const cookieStore = await cookies();
    const session = cookieStore.get('supabase-auth-token');

    if (!session) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    // 鑾峰彇缁熻淇℃伅
    const [totalResult, publishedResult, draftResult, todayViewsResult] =
      await Promise.all([
        // 鎬绘枃绔犳暟
        supabase.from('articles').select('id', { count: 'exact', head: true }),

        // 宸插彂甯冩枃绔犳暟
        supabase
          .from('articles')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published'),

        // 鑽夌        supabase
          .from('articles')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'draft'),

        // 婃棩娴忚閲忥紙绠€鍖栧鐞嗭紝瀹為檯搴旇鏈変笓闂ㄧ殑缁熻琛級
        supabase
          .from('articles')
          .select('view_count')
          .gte('updated_at', new Date().toISOString().split('T')[0]),
      ]);

    const stats = {
      total: totalResult.count || 0,
      published: publishedResult.count || 0,
      draft: draftResult.count || 0,
      todayViews:
        todayViewsResult.reduce(
          (sum, article) => sum + (article.view_count || 0),
          0
        ) || 0,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('鑾峰彇缁熻淇℃伅寮傚父:', error);
    return NextResponse.json(
      { error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊, details: (error as Error).message },
      { status: 500 }
    );
  }
}

