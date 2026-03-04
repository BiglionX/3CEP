/**
 * 入库预报单详情和状态更新API路由
 * 处理单个预报单的查询和状态变更操作
 * WMS-203 入库预报管理功能
 */

import {
  InboundForecastStatus,
  UpdateInboundForecastStatusDTO,
} from "@/supply-chain/models/inbound-forecast.model";
import { InboundForecastService } from "@/supply-chain/services/inbound-forecast.service";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const forecastService = new InboundForecastService();

/**
 * GET /api/wms/inbound-forecast/[id]
 * 获取预报单详情
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户会话
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session??.id) {
      return NextResponse.json(
        { error: "未授权访问，请先登录" },
        { status: 401 }
      );
    }

    // 验证预报单ID
    if (!params.id) {
      return NextResponse.json({ error: "缺少预报单ID参数" }, { status: 400 });
    }

    // 获取预报单详情
    const forecast = await forecastService.getForecastById(params.id);

    // 获取状态变更历史
    const statusHistory = await forecastService.getStatusHistory(params.id);

    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: {
        forecast,
        statusHistory,
      },
    });
  } catch (error) {
    console.error("获取入库预报详情失败:", error);

    // 根据错误类型返回不同的状态码
    if ((error as Error).message.includes("不存在")) {
      return NextResponse.json({ error: "预报单不存在" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "获取预报单详情失败",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/wms/inbound-forecast/[id]
 * 更新预报单状态
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户会话
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session??.id) {
      return NextResponse.json(
        { error: "未授权访问，请先登录" },
        { status: 401 }
      );
    }

    // 验证预报单ID
    if (!params.id) {
      return NextResponse.json({ error: "缺少预报单ID参数" }, { status: 400 });
    }

    // 解析请求体
    const body: UpdateInboundForecastStatusDTO = await request.json();

    // 参数验证
    const validationErrors = validateUpdateStatusDTO(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "参数验证失败",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    // 更新预报单状态
    await forecastService.updateForecastStatus(
      params.id,
      body,
      session.user.id
    );

    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: "预报单状态更新成功",
    });
  } catch (error) {
    console.error("更新入库预报状态失败:", error);

    // 根据错误类型返回不同的状态码
    if ((error as Error).message.includes("不存在")) {
      return NextResponse.json({ error: "预报单不存在" }, { status: 404 });
    }

    if ((error as Error).message.includes("无效的状态转换")) {
      return NextResponse.json({ error: "无效的状态转换" }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: "更新预报单状态失败",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/wms/inbound-forecast/[id]
 * 删除预报单（软删除）
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户会话
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session??.id) {
      return NextResponse.json(
        { error: "未授权访问，请先登录" },
        { status: 401 }
      );
    }

    // 验证预报单ID
    if (!params.id) {
      return NextResponse.json({ error: "缺少预报单ID参数" }, { status: 400 });
    }

    // 检查预报单是否存在且可删除
    const forecast = await forecastService.getForecastById(params.id);

    // 只有预报状态的单据才能删除
    if (forecast.status !== InboundForecastStatus.FORECAST) {
      return NextResponse.json(
        { error: "只有预报状态的单据才能删除" },
        { status: 400 }
      );
    }

    // 执行软删除（更新状态为已取消）
    await forecastService.updateForecastStatus(
      params.id,
      { status: InboundForecastStatus.CANCELLED, reason: "用户删除" },
      session.user.id
    );

    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: "预报单删除成功",
    });
  } catch (error) {
    console.error("删除入库预报失败:", error);

    // 根据错误类型返回不同的状态码
    if ((error as Error).message.includes("不存在")) {
      return NextResponse.json({ error: "预报单不存在" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "删除预报单失败",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * 验证更新状态DTO
 */
function validateUpdateStatusDTO(
  dto: UpdateInboundForecastStatusDTO
): string[] {
  const errors: string[] = [];

  // 状态必填验证
  if (!dto.status) {
    errors.push("状态不能为空");
  } else {
    // 状态有效性验证
    if (!Object.values(InboundForecastStatus).includes(dto.status)) {
      errors.push("无效的状态值");
    }
  }

  // 原因字段长度验证
  if (dto.reason && dto.reason.length > 500) {
    errors.push("原因说明长度不能超过500字符");
  }

  return errors;
}
