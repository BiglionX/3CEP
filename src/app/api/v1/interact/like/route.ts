import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 鐐硅禐/鍙栨秷鐐硅禐鎺ュ彛
export async function POST(request: Request) {
  try {
    // 鑾峰彇璁よ瘉淇℃伅
    const authHeader = request.headers.get('authorization');

    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          code: 40101,
          message: '鏈巿鏉冭,
          data: null,
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    // 瀹為檯搴旂敤涓渶瑕侀獙璇丣WTょ墝

    // 鑾峰彇璇眰    const body = await request.json();
    const { target_id, target_type } = body;

    // 楠岃瘉鍙傛暟
    if (!target_id || !target_type) {
      return NextResponse.json(
        {
          code: 40001,
          message: '缂哄皯蹇呰鍙傛暟',
          data: null,
        },
        { status: 400 }
      );
    }

    if (!['hot_link', 'article'].includes(target_type)) {
      return NextResponse.json(
        {
          code: 40001,
          message: '涓嶆敮鎸佺殑鐩爣绫诲瀷',
          data: null,
        },
        { status: 400 }
      );
    }

    // 妯℃嫙鐢ㄦ埛ID - 瀹為檯搴旇嶫WT涓В    const userId = 'user_123';

    // 妫€鏌ユ槸鍚﹀凡缁忕偣    const { data: existingLike, error: checkError } = await supabase
      .from('user_interactions')
      .select('id, is_liked')
      .eq('user_id', userId)
      .eq('target_id', target_id)
      .eq('target_type', target_type)
      .single();

    let currentLikes = 0;
    let isLiked = false;

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116琛ㄧず鏈壘鍒拌      console.error('妫€鏌ョ偣璧炵姸鎬佸け', checkError);
      // 缁х画鎵ц锛屼笉涓柇娴佺▼
    }

    if (existingLike) {
      // 宸叉湁鐐硅禐璁板綍锛屾墽琛屽彇娑堢偣璧炴垨閲嶆柊鐐硅禐
      isLiked = !existingLike.is_liked;

      const { error: updateError } = await supabase
        .from('user_interactions')
        .update({
          is_liked: isLiked,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', existingLike.id);

      if (updateError) {
        console.error('鏇存柊鐐硅禐鐘舵€佸け', updateError);
        return NextResponse.json(
          {
            code: 50001,
            message: '鎿嶄綔澶辫触',
            data: null,
          },
          { status: 500 }
        );
      }
    } else {
      // 棣栨鐐硅禐
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
        console.error('鍒涘缓鐐硅禐璁板綍澶辫触:', insertError);
        return NextResponse.json(
          {
            code: 50001,
            message: '鎿嶄綔澶辫触',
            data: null,
          },
          { status: 500 }
        );
      }
    }

    // 鏇存柊鐩爣瀵硅薄鐨勭偣璧炴暟
    const targetTable =
      target_type === 'article' ? 'articles' : 'hot_link_pool';
    const likeField = target_type === 'article' ? 'like_count' : 'likes';

    // 鑾峰彇褰撳墠鐐硅禐    const { data: targetData, error: targetError } = await supabase
      .from(targetTable)
      .select(likeField)
      .eq('id', target_id)
      .single();

    if (!targetError && targetData) {
      currentLikes = targetData[likeField] || 0;
      // 鏍规嵁鎿嶄綔绫诲瀷璋冩暣鐐硅禐      currentLikes = isLiked  currentLikes + 1 : Math.max(0, currentLikes - 1);

      // 鏇存柊鐐硅禐      await supabase
        .from(targetTable)
        .update({ [likeField]: currentLikes } as any)
        .eq('id', target_id);
    }

    // 濡傛灉鏄儹鐐归摼鎺ヤ笖鐐硅禐鏁拌揪鍒伴槇鍊硷紝瑙﹀彂娌夋穩娴佺▼
    if (target_type === 'hot_link' && isLiked && currentLikes >= 3) {
      try {
        // 瑙﹀彂鏂囩珷娌夋穩娴佺▼
        await triggerArticleCreation(target_id);
      } catch (error) {
        console.warn('瑙﹀彂鏂囩珷娌夋穩娴佺▼澶辫触:', error);
        // 涓嶄腑鏂富娴佺▼
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
    }) as any;
  } catch (error) {
    console.error('鐐硅禐API閿欒:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '鏈嶅姟鍣ㄥ唴閮ㄩ敊,
        data: null,
      },
      { status: 500 }
    );
  }
}

// 瑙﹀彂鏂囩珷娌夋穩娴佺▼
async function triggerArticleCreation(hotLinkId: string) {
  try {
    // 鑾峰彇鐑偣炬帴淇℃伅
    const { data: hotLink, error } = await supabase
      .from('hot_link_pool')
      .select('*')
      .eq('id', hotLinkId)
      .single();

    if (error || !hotLink) {
      throw new Error('鑾峰彇鐑偣炬帴澶辫触');
    }

    // 鍒涘缓鏂囩珷鑽夌
    const { data: article, insertError } = await supabase
      .from('articles')
      .insert({
        title: hotLink.title,
        content: `# ${hotLink.title} as any

${hotLink.description || ''}

[鍘熸枃炬帴](${hotLink.url}) as any`,
        summary: hotLink.description || hotLink.title,
        source_url: hotLink.url,
        status: 'pending_review',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw new Error('鍒涘缓鏂囩珷澶辫触');
    }

    // 鏇存柊鐑偣炬帴鍏宠仈鐨勬枃绔營D
    await supabase
      .from('hot_link_pool')
      .update({
        article_id: article.id,
        status: 'promoted',
      } as any)
      .eq('id', hotLinkId);

    console.log(
      `鐑偣炬帴 ${hotLinkId} 宸茶Е鍙戞枃绔犳矇娣€锛屾枃绔營D: ${article.id}`
    );
  } catch (error) {
    console.error('鏂囩珷娌夋穩娴佺▼澶辫触:', error);
    throw error;
  }
}

