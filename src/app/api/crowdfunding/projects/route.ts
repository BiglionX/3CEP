import { supabase } from "@/lib/supabase";
import { CrowdfundingProjectService } from "@/services/crowdfunding/project-service";
import { NextResponse } from "next/server";

// GET /api/crowdfunding/projects - 获取项目列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";

    let result;

    if (search) {
      // 搜索项目
      result = await CrowdfundingProjectService.searchProjects(
        search,
        page,
        limit
      );
    } else if (category) {
      // 按分类获取项目
      result = await CrowdfundingProjectService.getProjectsByCategory(
        category,
        page,
        limit
      );
    } else {
      // 获取所有活跃项目
      result = await CrowdfundingProjectService.getActiveProjects(page, limit);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("获取项目列表失败:", error);
    return NextResponse.json(
      { error: error.message || "获取项目列表失败" },
      { status: 500 }
    );
  }
}

// POST /api/crowdfunding/projects - 创建新项目
export async function POST(request: Request) {
  try {
    // 验证用户认证
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 验证JWT令牌
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "无效的认证令牌" }, { status: 401 });
    }

    const body = await request.json();

    // 验证必需字段
    const requiredFields = [
      "title",
      "description",
      "product_model",
      "target_amount",
      "start_date",
      "end_date",
      "category",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缺少必需字段: ${field}` },
          { status: 400 }
        );
      }
    }

    // 验证金额
    if (body.target_amount <= 0) {
      return NextResponse.json({ error: "目标金额必须大于0" }, { status: 400 });
    }

    // 验证日期
    const startDate = new Date(body.start_date);
    const endDate = new Date(body.end_date);
    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "结束时间必须晚于开始时间" },
        { status: 400 }
      );
    }

    const project = await CrowdfundingProjectService.createProject(
      body,
      user.id
    );

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error("创建项目失败:", error);
    return NextResponse.json(
      { error: error.message || "创建项目失败" },
      { status: 500 }
    );
  }
}
