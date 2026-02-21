import { supabase } from "@/lib/supabase";
import { CrowdfundingPledgeService } from "@/services/crowdfunding/pledge-service";
import { NextResponse } from "next/server";

// POST /api/crowdfunding/pledges - 创建支持记录
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

    // 验证必需字段
    if (!body.project_id || !body.amount) {
      return NextResponse.json(
        { error: "缺少必需字段: project_id 或 amount" },
        { status: 400 }
      );
    }

    // 验证金额
    if (body.amount <= 0) {
      return NextResponse.json({ error: "支持金额必须大于0" }, { status: 400 });
    }

    // 设置默认值
    const pledgeData = {
      project_id: body.project_id,
      amount: body.amount,
      pledge_type: body.pledge_type || "reservation",
      reward_level: body.reward_level || null,
      shipping_address: body.shipping_address || {},
      contact_info: body.contact_info || {},
      payment_method: body.payment_method || null,
      notes: body.notes || null,
    };

    const pledge = await CrowdfundingPledgeService.createPledge(
      pledgeData,
      user.id
    );

    return NextResponse.json(pledge, { status: 201 });
  } catch (error: any) {
    console.error("创建支持记录失败:", error);
    return NextResponse.json(
      { error: error.message || "创建支持记录失败" },
      { status: 500 }
    );
  }
}

// GET /api/crowdfunding/pledges - 获取用户支持记录
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const result = await CrowdfundingPledgeService.getUserPledges(
      user.id,
      page,
      limit
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("获取支持记录失败:", error);
    return NextResponse.json(
      { error: error.message || "获取支持记录失败" },
      { status: 500 }
    );
  }
}
