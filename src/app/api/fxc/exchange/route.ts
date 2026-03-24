import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { exchangeFXCToTokens, fxcExchangeService } from '@/services/fxc-exchange.service';

/**
 * POST /api/fxc/exchange
 * 执行 FXC 兑换 Token
 */
export async function POST(req: NextRequest) {
  try {
    // 1. 验证用户身份
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    // 2. 解析请求体
    const body = await req.json();
    const { fxcAmount, useDynamicRate } = body;

    if (!fxcAmount || typeof fxcAmount !== 'number' || fxcAmount <= 0) {
      return NextResponse.json(
        { success: false, error: '请输入有效的兑换金额' },
        { status: 400 }
      );
    }

    // 3. 获取用户每日兑换统计
    const dailyStats = await fxcExchangeService.getUserDailyExchangeStats(user.id);

    // 4. 验证是否超过每日限额
    if (dailyStats.todayExchanged + fxcAmount > 10000) {
      return NextResponse.json(
        {
          success: false,
          error: `今日已兑换 ${dailyStats.todayExchanged} FXC，剩余可兑换额度为 ${
            10000 - dailyStats.todayExchanged
          } FXC`,
        },
        { status: 400 }
      );
    }

    // 5. 执行兑换
    const result = await exchangeFXCToTokens(
      user.id,
      fxcAmount,
      useDynamicRate !== false
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          transactionId: result.transactionId,
          tokenAmount: result.tokenAmount,
          feeAmount: result.feeAmount,
          finalAmount: result.finalAmount,
          exchangeRate: result.exchangeRate,
          dailyStats: {
            todayExchanged: dailyStats.todayExchanged + fxcAmount,
            remainingLimit: dailyStats.remainingLimit - fxcAmount,
            transactionCount: dailyStats.transactionCount + 1,
          },
        },
        message: `成功兑换 ${result.finalAmount} Tokens`,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('FXC 兑换 API 错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '系统错误',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/fxc/exchange
 * 获取用户兑换历史和统计信息
 */
export async function GET(req: NextRequest) {
  try {
    // 1. 验证用户身份
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    // 2. 获取查询参数
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    // 3. 获取每日统计
    const dailyStats = await fxcExchangeService.getUserDailyExchangeStats(user.id);

    // 4. 获取兑换历史
    const history = await fxcExchangeService.getUserExchangeHistory(user.id, limit);

    return NextResponse.json({
      success: true,
      data: {
        dailyStats,
        history,
      },
    });
  } catch (error) {
    console.error('获取 FXC 兑换信息错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '系统错误',
      },
      { status: 500 }
    );
  }
}
