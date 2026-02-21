/**
 * 用户FCX账户余额查询API
 * 为众筹支付提供实时余额信息
 */

import { supabase } from "@/lib/supabase";
import { CrowdfundingFcxPaymentService } from "@/services/crowdfunding/fcx-payment.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // 验证用户认证
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "无效的认证令牌" }, { status: 401 });
    }

    // 获取用户FCX余额
    const balance = await CrowdfundingFcxPaymentService.getUserFcxBalance(
      user.id
    );

    // 获取账户详细信息
    const accountService = new (
      await import("@/fcx-system")
    ).FcxAccountService();
    const account = await accountService.getAccountByUserId(user.id);

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        fcxBalance: balance,
        usdValue: balance / 10, // 假设10 FCX = 1 USD
        accountExists: !!account,
        accountId: account?.id || null,
        accountType: account?.accountType || null,
        frozenBalance: account?.frozenBalance || 0,
        availableBalance: balance,
      },
    });
  } catch (error) {
    console.error("获取FCX账户信息错误:", error);
    return NextResponse.json(
      {
        error: "获取账户信息失败",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
