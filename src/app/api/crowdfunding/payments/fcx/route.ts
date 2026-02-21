/**
 * 众筹FCX支付API
 * 处理众筹项目中的FCX支付请求
 */

import { supabase } from "@/lib/supabase";
import {
  CrowdfundingFcxPaymentService,
  FcxPaymentRequest,
} from "@/services/crowdfunding/fcx-payment.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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

    const body = await request.json();
    const { pledgeId, fcxAmount, useHybridPayment, fiatAmount } = body;

    // 参数验证
    if (!pledgeId || fcxAmount === undefined) {
      return NextResponse.json(
        { error: "缺少必要参数: pledgeId 或 fcxAmount" },
        { status: 400 }
      );
    }

    if (fcxAmount <= 0) {
      return NextResponse.json(
        { error: "FCX支付金额必须大于0" },
        { status: 400 }
      );
    }

    // 获取用户的FCX账户
    const accountService = new (
      await import("@/fcx-system")
    ).FcxAccountService();
    const account = await accountService.getAccountByUserId(user.id);

    if (!account) {
      return NextResponse.json(
        { error: "未找到FCX账户，请先创建账户" },
        { status: 404 }
      );
    }

    const paymentRequest: FcxPaymentRequest = {
      pledgeId,
      userId: user.id,
      fcxAccountId: account.id,
      fcxAmount,
      fiatAmount: fiatAmount || 0,
    };

    let result;
    if (useHybridPayment) {
      // 混合支付
      result = await CrowdfundingFcxPaymentService.processHybridPayment(
        paymentRequest
      );
    } else {
      // 纯FCX支付
      result = await CrowdfundingFcxPaymentService.processFcxPayment(
        paymentRequest
      );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "支付失败",
          message: result.message,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("FCX支付处理错误:", error);
    return NextResponse.json(
      {
        error: "支付处理失败",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// GET /api/crowdfunding/payments/fcx/balance?userId=xxx
// 获取用户FCX余额
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "缺少userId参数" }, { status: 400 });
    }

    const balance = await CrowdfundingFcxPaymentService.getUserFcxBalance(
      userId
    );

    return NextResponse.json({
      success: true,
      data: {
        userId,
        fcxBalance: balance,
        usdValue: balance / 10, // 假设10 FCX = 1 USD
      },
    });
  } catch (error) {
    console.error("获取FCX余额错误:", error);
    return NextResponse.json(
      {
        error: "获取余额失败",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
