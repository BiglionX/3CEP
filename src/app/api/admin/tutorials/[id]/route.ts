import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// 初始化Supabase客户端（使用服务角色密钥）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/tutorials/[id] - 管理员获取单个教程详情
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: 添加管理员权限验证

    const { id } = params;

    // 验证ID格式
    if (!id) {
      return NextResponse.json({ error: "缺少教程ID" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("repair_tutorials")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "教程不存在" }, { status: 404 });
      }
      console.error("管理员获取教程详情失败:", error);
      return NextResponse.json(
        { error: "获取教程详情失败", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tutorial: data,
    });
  } catch (error) {
    console.error("管理员API错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

// PUT /api/admin/tutorials/[id] - 管理员更新教程
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: 添加管理员权限验证

    const { id } = params;

    // 验证ID格式
    if (!id) {
      return NextResponse.json({ error: "缺少教程ID" }, { status: 400 });
    }

    const tutorialData = await request.json();

    // 移除不允许更新的字段
    const {
      id: _,
      created_at: __,
      created_by: ___,
      ...updateData
    } = tutorialData;

    // 添加更新时间
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("repair_tutorials")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "教程不存在" }, { status: 404 });
      }
      console.error("管理员更新教程失败:", error);
      return NextResponse.json(
        { error: "更新教程失败", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "教程更新成功",
      tutorial: data,
    });
  } catch (error) {
    console.error("管理员API错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

// DELETE /api/admin/tutorials/[id] - 管理员删除教程
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: 添加管理员权限验证

    const { id } = params;

    // 验证ID格式
    if (!id) {
      return NextResponse.json({ error: "缺少教程ID" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("repair_tutorials")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "教程不存在" }, { status: 404 });
      }
      console.error("管理员删除教程失败:", error);
      return NextResponse.json(
        { error: "删除教程失败", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "教程删除成功",
    });
  } catch (error) {
    console.error("管理员API错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

// PATCH /api/admin/tutorials/[id]/status - 更新教程状态
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: 添加管理员权限验证

    const { id } = params;

    // 验证ID格式
    if (!id) {
      return NextResponse.json({ error: "缺少教程ID" }, { status: 400 });
    }

    const { status } = await request.json();

    // 验证状态值
    const validStatuses = ["draft", "published", "archived"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "无效的状态值", validStatuses },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("repair_tutorials")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "教程不存在" }, { status: 404 });
      }
      console.error("更新教程状态失败:", error);
      return NextResponse.json(
        { error: "更新教程状态失败", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "教程状态更新成功",
      tutorial: data,
    });
  } catch (error) {
    console.error("管理员API错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
