import { cacheManager, generateCacheKey } from '@/tech/utils/cache-manager';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 绉垎浣撶郴API
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || 'anonymous';
    const action = searchParams.get('action') || 'get_balance'; // get_balance, get_history, get_rules

    // 楠岃瘉璁よ瘉
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ') && userId !== 'anonymous') {
      return NextResponse.json(
        {
          code: 40101,
          message: '鏈巿鏉冭?,
          data: null,
        },
        { status: 401 }
      );
    }

    switch (action) {
      case 'get_balance':
        return await getUserPointsBalance(userId);
      case 'get_history':
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('page_size') || '20');
        return await getUserPointsHistory(userId, page, pageSize);
      case 'get_rules':
        return await getPointsRules();
      default:
        return NextResponse.json(
          {
            code: 40001,
            message: '涓嶆敮鎸佺殑鎿嶄綔',
            data: null,
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('绉垎绯荤粺閿欒:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '绉垎鏈嶅姟鏆傛椂涓嶅彲?,
        data: null,
      },
      { status: 500 }
    );
  }
}

// 鑾峰彇鐢ㄦ埛绉垎浣欓
async function getUserPointsBalance(userId: string) {
  try {
    const cacheKey = generateCacheKey('points_balance', userId);

    // 灏濊瘯浠庣紦瀛樿幏?    const cachedBalance = await cacheManager.get(cacheKey);
    if (cachedBalance) {
      return NextResponse.json({
        code: 0,
        message: 'ok',
        data: cachedBalance,
        from_cache: true,
        timestamp: new Date().toISOString(),
      });
    }

    // 浠庢暟鎹簱鑾峰彇
    const { data: balanceRecord, error } = await supabase
      .from('user_points')
      .select('total_points, available_points, frozen_points, updated_at')
      .eq('user_id', userId)
      .single();

    let balanceData;

    if (error || !balanceRecord) {
      // 鐢ㄦ埛棣栨鏌ヨ锛屽垱寤洪粯璁よ?      const { data: newRecord, error: insertError } = await supabase
        .from('user_points')
        .insert({
          user_id: userId,
          total_points: 0,
          available_points: 0,
          frozen_points: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any)
        .select()
        .single();

      if (insertError) {
        throw new Error('鍒涘缓鐢ㄦ埛绉垎璁板綍澶辫触');
      }

      balanceData = {
        total_points: 0,
        available_points: 0,
        frozen_points: 0,
        updated_at: newRecord.updated_at,
      };
    } else {
      balanceData = {
        total_points: balanceRecord.total_points || 0,
        available_points: balanceRecord.available_points || 0,
        frozen_points: balanceRecord.frozen_points || 0,
        updated_at: balanceRecord.updated_at,
      };
    }

    // 缂撳瓨缁撴灉?鍒嗛挓?    await cacheManager.set(cacheKey, balanceData, 300);

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: balanceData,
      from_cache: false,
      timestamp: new Date().toISOString(),
    }) as any;
  } catch (error) {
    console.error('鑾峰彇绉垎浣欓澶辫触:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '鑾峰彇绉垎浣欓澶辫触',
        data: null,
      },
      { status: 500 }
    );
  }
}

// 鑾峰彇鐢ㄦ埛绉垎鍘嗗彶
async function getUserPointsHistory(
  userId: string,
  page: number,
  pageSize: number
) {
  try {
    const offset = (page - 1) * pageSize;

    const {
      data: history,
      error,
      count,
    } = await supabase
      .from('points_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error('鑾峰彇绉垎鍘嗗彶澶辫触');
    }

    const result = {
      list: (history || []).map(record => ({
        id: record.id,
        action: record.action,
        points_change: record.points_change,
        balance_after: record.balance_after,
        description: record.description,
        related_id: record.related_id,
        created_at: record.created_at,
      })),
      total: count || 0,
      page,
      page_size: pageSize,
      total_pages: Math.ceil((count || 0) / pageSize),
    };

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('鑾峰彇绉垎鍘嗗彶澶辫触:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '鑾峰彇绉垎鍘嗗彶澶辫触',
        data: null,
      },
      { status: 500 }
    );
  }
}

// 鑾峰彇绉垎瑙勫垯
async function getPointsRules() {
  try {
    const cacheKey = 'points_rules';

    // 灏濊瘯浠庣紦瀛樿幏?    const cachedRules = await cacheManager.get(cacheKey);
    if (cachedRules) {
      return NextResponse.json({
        code: 0,
        message: 'ok',
        data: cachedRules,
        from_cache: true,
        timestamp: new Date().toISOString(),
      });
    }

    // 瀹氫箟绉垎瑙勫垯
    const rules = [
      {
        action: 'daily_login',
        points: 10,
        description: '姣忔棩绛惧埌濂栧姳',
        frequency: 'once_per_day',
        limit_per_day: 1,
      },
      {
        action: 'like_article',
        points: 2,
        description: '鐐硅禐鏂囩珷',
        frequency: 'per_action',
        limit_per_day: 50,
      },
      {
        action: 'favorite_article',
        points: 5,
        description: '鏀惰棌鏂囩珷',
        frequency: 'per_action',
        limit_per_day: 20,
      },
      {
        action: 'share_content',
        points: 15,
        description: '鍒嗕韩鍐呭鍒扮ぞ浜ゅ钩?,
        frequency: 'per_action',
        limit_per_day: 10,
      },
      {
        action: 'create_article',
        points: 50,
        description: '鍙戝竷鍘熷垱鏂囩珷',
        frequency: 'per_action',
        limit_per_day: 5,
      },
      {
        action: 'complete_repair',
        points: 100,
        description: '瀹屾垚缁翠慨璁㈠崟',
        frequency: 'per_action',
        limit_per_day: 3,
      },
      {
        action: 'invite_friend',
        points: 200,
        description: '閭€璇峰ソ鍙嬫敞?,
        frequency: 'per_invite',
        limit_per_day: 10,
      },
    ];

    // 缂撳瓨缁撴灉?灏忔椂?    await cacheManager.set(cacheKey, rules, 3600);

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: rules,
      from_cache: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('鑾峰彇绉垎瑙勫垯澶辫触:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '鑾峰彇绉垎瑙勫垯澶辫触',
        data: null,
      },
      { status: 500 }
    );
  }
}

// 绉垎鎿嶄綔鎺ュ彛锛圥OST锟?export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          code: 40101,
          message: '鏈巿鏉冭?,
          data: null,
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { user_id, action, amount, description, related_id } = body;

    if (!user_id || !action) {
      return NextResponse.json(
        {
          code: 40001,
          message: '缂哄皯蹇呰鍙傛暟',
          data: null,
        },
        { status: 400 }
      );
    }

    // 鎵ц绉垎鎿嶄綔
    const result = await executePointsAction(
      user_id,
      action,
      amount,
      description,
      related_id
    );

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('绉垎鎿嶄綔澶辫触:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '绉垎鎿嶄綔澶辫触',
        data: null,
      },
      { status: 500 }
    );
  }
}

// 鎵ц绉垎鎿嶄綔
async function executePointsAction(
  userId: string,
  action: string,
  amount: number,
  description: string,
  relatedId?: string
) {
  try {
    // 寮€濮嬫暟鎹簱浜嬪姟
    const { data: userData, error: userError } = await supabase
      .from('user_points')
      .select('id, total_points, available_points, frozen_points')
      .eq('user_id', userId)
      .single();

    if (userError) {
      throw new Error('鐢ㄦ埛绉垎璁板綍涓嶅瓨?);
    }

    // 璁＄畻鏂扮殑绉垎浣欓
    const newTotal = (userData.total_points || 0) + amount;
    const newAvailable = (userData.available_points || 0) + amount;

    // 鏇存柊鐢ㄦ埛绉垎鎬婚
    const { error: updateError } = await supabase
      .from('user_points')
      .update({
        total_points: Math.max(0, newTotal),
        available_points: Math.max(0, newAvailable),
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', userData.id);

    if (updateError) {
      throw new Error('鏇存柊绉垎澶辫触');
    }

    // 璁板綍绉垎鍙樺姩鍘嗗彶
    const { data: transaction, error: transError } = await supabase
      .from('points_transactions')
      .insert({
        user_id: userId,
        action: action,
        points_change: amount,
        balance_after: Math.max(0, newAvailable),
        description: description || getDefaultDescription(action, amount),
        related_id: relatedId,
        created_at: new Date().toISOString(),
      } as any)
      .select()
      .single();

    if (transError) {
      console.warn('璁板綍绉垎鍘嗗彶澶辫触:', transError);
    }

    // 娓呴櫎鐩稿叧缂撳瓨
    const balanceCacheKey = generateCacheKey('points_balance', userId);
    await cacheManager.del(balanceCacheKey);

    return {
      transaction_id: transaction?.id,
      user_id: userId,
      action: action,
      points_change: amount,
      new_balance: Math.max(0, newAvailable),
      description: description || getDefaultDescription(action, amount),
    };
  } catch (error) {
    console.error('鎵ц绉垎鎿嶄綔澶辫触:', error);
    throw error;
  }
}

// 鑾峰彇榛樿鎻忚堪
function getDefaultDescription(action: string, amount: number) {
  const actionDescriptions: Record<string, string> = {
    daily_login: '姣忔棩绛惧埌濂栧姳',
    like_article: '鐐硅禐鏂囩珷濂栧姳',
    favorite_article: '鏀惰棌鏂囩珷濂栧姳',
    share_content: '鍒嗕韩鍐呭濂栧姳',
    create_article: '鍙戝竷鏂囩珷濂栧姳',
    complete_repair: '瀹屾垚缁翠慨璁㈠崟濂栧姳',
    invite_friend: '閭€璇峰ソ鍙嬪?,
  };

  const baseDesc = actionDescriptions[action] || '绉垎鍙樺姩';
  return `${baseDesc} ${amount > 0 ? '+' : ''}${amount}绉垎`;
}

