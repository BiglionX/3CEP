import { cacheManager, generateCacheKey } from '@/utils/cache-manager';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 积分体系API
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || 'anonymous';
    const action = searchParams.get('action') || 'get_balance'; // get_balance, get_history, get_rules

    // 验证认证
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ') && userId !== 'anonymous') {
      return NextResponse.json(
        {
          code: 40101,
          message: '未授权访问',
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
            message: '不支持的操作',
            data: null,
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('积分系统错误:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '积分服务暂时不可用',
        data: null,
      },
      { status: 500 }
    );
  }
}

// 获取用户积分余额
async function getUserPointsBalance(userId: string) {
  try {
    const cacheKey = generateCacheKey('points_balance', userId);

    // 尝试从缓存获取
    const cachedBalance = await cacheManager.get(cacheKey);
    if (cachedBalance) {
      return NextResponse.json({
        code: 0,
        message: 'ok',
        data: cachedBalance,
        from_cache: true,
        timestamp: new Date().toISOString(),
      });
    }

    // 从数据库获取
    const { data: balanceRecord, error } = await supabase
      .from('user_points')
      .select('total_points, available_points, frozen_points, updated_at')
      .eq('user_id', userId)
      .single();

    let balanceData;

    if (error || !balanceRecord) {
      // 用户首次查询，创建默认记录
      const { data: newRecord, error: insertError } = await supabase
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
        throw new Error('创建用户积分记录失败');
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

    // 缓存结果（5分钟）
    await cacheManager.set(cacheKey, balanceData, 300);

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: balanceData,
      from_cache: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('获取积分余额失败:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '获取积分余额失败',
        data: null,
      },
      { status: 500 }
    );
  }
}

// 获取用户积分历史
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
      throw new Error('获取积分历史失败');
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
    console.error('获取积分历史失败:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '获取积分历史失败',
        data: null,
      },
      { status: 500 }
    );
  }
}

// 获取积分规则
async function getPointsRules() {
  try {
    const cacheKey = 'points_rules';

    // 尝试从缓存获取
    const cachedRules = await cacheManager.get(cacheKey);
    if (cachedRules) {
      return NextResponse.json({
        code: 0,
        message: 'ok',
        data: cachedRules,
        from_cache: true,
        timestamp: new Date().toISOString(),
      });
    }

    // 定义积分规则
    const rules = [
      {
        action: 'daily_login',
        points: 10,
        description: '每日签到奖励',
        frequency: 'once_per_day',
        limit_per_day: 1,
      },
      {
        action: 'like_article',
        points: 2,
        description: '点赞文章',
        frequency: 'per_action',
        limit_per_day: 50,
      },
      {
        action: 'favorite_article',
        points: 5,
        description: '收藏文章',
        frequency: 'per_action',
        limit_per_day: 20,
      },
      {
        action: 'share_content',
        points: 15,
        description: '分享内容到社交平台',
        frequency: 'per_action',
        limit_per_day: 10,
      },
      {
        action: 'create_article',
        points: 50,
        description: '发布原创文章',
        frequency: 'per_action',
        limit_per_day: 5,
      },
      {
        action: 'complete_repair',
        points: 100,
        description: '完成维修订单',
        frequency: 'per_action',
        limit_per_day: 3,
      },
      {
        action: 'invite_friend',
        points: 200,
        description: '邀请好友注册',
        frequency: 'per_invite',
        limit_per_day: 10,
      },
    ];

    // 缓存结果（1小时）
    await cacheManager.set(cacheKey, rules, 3600);

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: rules,
      from_cache: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('获取积分规则失败:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '获取积分规则失败',
        data: null,
      },
      { status: 500 }
    );
  }
}

// 积分操作接口（POST）
export async function POST(request: Request) {
  try {
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

    const body = await request.json();
    const { user_id, action, amount, description, related_id } = body;

    if (!user_id || !action) {
      return NextResponse.json(
        {
          code: 40001,
          message: '缺少必要参数',
          data: null,
        },
        { status: 400 }
      );
    }

    // 执行积分操作
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
    console.error('积分操作失败:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '积分操作失败',
        data: null,
      },
      { status: 500 }
    );
  }
}

// 执行积分操作
async function executePointsAction(
  userId: string,
  action: string,
  amount: number,
  description: string,
  relatedId?: string
) {
  try {
    // 开始数据库事务
    const { data: userData, error: userError } = await supabase
      .from('user_points')
      .select('id, total_points, available_points, frozen_points')
      .eq('user_id', userId)
      .single();

    if (userError) {
      throw new Error('用户积分记录不存在');
    }

    // 计算新的积分余额
    const newTotal = (userData.total_points || 0) + amount;
    const newAvailable = (userData.available_points || 0) + amount;

    // 更新用户积分总额
    const { error: updateError } = await supabase
      .from('user_points')
      .update({
        total_points: Math.max(0, newTotal),
        available_points: Math.max(0, newAvailable),
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', userData.id);

    if (updateError) {
      throw new Error('更新积分失败');
    }

    // 记录积分变动历史
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
      console.warn('记录积分历史失败:', transError);
    }

    // 清除相关缓存
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
    console.error('执行积分操作失败:', error);
    throw error;
  }
}

// 获取默认描述
function getDefaultDescription(action: string, amount: number) {
  const actionDescriptions: Record<string, string> = {
    daily_login: '每日签到奖励',
    like_article: '点赞文章奖励',
    favorite_article: '收藏文章奖励',
    share_content: '分享内容奖励',
    create_article: '发布文章奖励',
    complete_repair: '完成维修订单奖励',
    invite_friend: '邀请好友奖励',
  };

  const baseDesc = actionDescriptions[action] || '积分变动';
  return `${baseDesc} ${amount > 0 ? '+' : ''}${amount}积分`;
}
