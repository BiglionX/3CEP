import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 导入mock数据版本
import { GET as MOCK_GET } from "./mock-route";

// 如果数据库表不存在，则使用mock数据
let useMock = false;

// 检查是否可以连接到真实数据库
async function checkDatabaseConnection() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/repair_tutorials?select=*&limit=1`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
          }`,
        },
      }
    );
    useMock = !response.ok;
  } catch (error) {
    useMock = true;
  }
}

// GET /api/tutorials
export async function GET(request: Request) {
  await checkDatabaseConnection();
  if (useMock) {
    return MOCK_GET(request);
  }

  // 原有的真实数据库逻辑
  try {
    const { searchParams } = new URL(request.url);

    // 获取查询参数
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const deviceModel = searchParams.get("deviceModel");
    const faultType = searchParams.get("faultType");
    const status = searchParams.get("status") || "published";
    const search = searchParams.get("search");

    // 计算偏移量
    const offset = (page - 1) * pageSize;

    // 构建查询
    let query = supabase
      .from("repair_tutorials")
      .select("*", { count: "exact" })
      .eq("status", status)
      .range(offset, offset + pageSize - 1)
      .order("created_at", { ascending: false });

    // 添加过滤条件
    if (deviceModel) {
      query = query.eq("device_model", deviceModel);
    }

    if (faultType) {
      query = query.eq("fault_type", faultType);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("获取教程列表失败:", error);
      return NextResponse.json(
        { error: "获取教程列表失败", details: error.message },
        { status: 500 }
      );
    }

    // 计算分页信息
    const totalPages = Math.ceil((count || 0) / pageSize);

    return NextResponse.json({
      tutorials: data,
      pagination: {
        currentPage: page,
        pageSize,
        totalCount: count || 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

// POST /api/tutorials - 创建新教程（需要认证）
export async function POST(request: Request) {
  try {
    // 这里应该添加认证检查
    // 暂时允许所有请求，后续添加JWT验证

    const tutorialData = await request.json();

    // 验证必需字段
    if (
      !tutorialData.title ||
      !tutorialData.device_model ||
      !tutorialData.fault_type
    ) {
      return NextResponse.json(
        { error: "缺少必需字段: title, device_model, fault_type" },
        { status: 400 }
      );
    }

    // 设置默认值
    const tutorial = {
      ...tutorialData,
      steps: tutorialData.steps || [],
      tools: tutorialData.tools || [],
      parts: tutorialData.parts || [],
      view_count: 0,
      like_count: 0,
      status: tutorialData.status || "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("repair_tutorials")
      .insert(tutorial)
      .select()
      .single();

    if (error) {
      console.error("创建教程失败:", error);
      return NextResponse.json(
        { error: "创建教程失败", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "教程创建成功",
        tutorial: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
