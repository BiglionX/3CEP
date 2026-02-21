/**
 * 入库预报管理API路由
 * 处理预报单的创建和查询操作
 * WMS-203 入库预报管理功能
 */

import {
  CreateInboundForecastDTO,
  InboundForecastQueryParams,
  InboundForecastStatus,
} from "@/supply-chain/models/inbound-forecast.model";
import { InboundForecastService } from "@/supply-chain/services/inbound-forecast.service";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const forecastService = new InboundForecastService();

/**
 * POST /api/wms/inbound-forecast
 * 创建新的入库预报单
 */
export async function POST(request: Request) {
  try {
    // 验证用户会话
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "未授权访问，请先登录" },
        { status: 401 }
      );
    }

    // 解析请求体
    const body: CreateInboundForecastDTO = await request.json();

    // 基础参数验证
    const validationErrors = validateCreateForecastDTO(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "参数验证失败",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    // 创建预报单
    const forecast = await forecastService.createForecast(
      body,
      session.user.id
    );

    // 返回成功响应
    return NextResponse.json(
      {
        success: true,
        message: "预报单创建成功",
        data: forecast,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("创建入库预报失败:", error);
    return NextResponse.json(
      {
        error: "创建预报单失败",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wms/inbound-forecast
 * 查询预报单列表
 */
export async function GET(request: Request) {
  try {
    // 验证用户会话
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "未授权访问，请先登录" },
        { status: 401 }
      );
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const params: InboundForecastQueryParams = {};

    // 仓库ID过滤
    if (searchParams.get("warehouseId")) {
      params.warehouseId = searchParams.get("warehouseId")!;
    }

    // 状态过滤
    if (searchParams.get("status")) {
      const status = searchParams.get("status") as InboundForecastStatus;
      if (Object.values(InboundForecastStatus).includes(status)) {
        params.status = status;
      }
    }

    // 供应商名称搜索
    if (searchParams.get("supplierName")) {
      params.supplierName = searchParams.get("supplierName")!;
    }

    // 日期范围过滤
    if (searchParams.get("startDate")) {
      params.startDate = new Date(searchParams.get("startDate")!);
    }

    if (searchParams.get("endDate")) {
      params.endDate = new Date(searchParams.get("endDate")!);
    }

    // 品牌ID过滤
    if (searchParams.get("brandId")) {
      params.brandId = searchParams.get("brandId")!;
    }

    // 创建者过滤
    if (searchParams.get("createdBy")) {
      params.createdBy = searchParams.get("createdBy")!;
    }

    // 分页参数
    if (searchParams.get("limit")) {
      params.limit = parseInt(searchParams.get("limit")!);
      // 限制最大返回数量
      if (params.limit > 100) params.limit = 100;
    }

    if (searchParams.get("offset")) {
      params.offset = parseInt(searchParams.get("offset")!);
    }

    // 查询预报单列表
    const forecasts = await forecastService.listForecasts(params);

    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: forecasts,
      meta: {
        totalCount: forecasts.length,
        limit: params.limit,
        offset: params.offset,
      },
    });
  } catch (error) {
    console.error("查询入库预报列表失败:", error);
    return NextResponse.json(
      {
        error: "查询预报单失败",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * 验证创建预报单DTO
 */
function validateCreateForecastDTO(dto: CreateInboundForecastDTO): string[] {
  const errors: string[] = [];

  // 必填字段验证
  if (!dto.warehouseId) {
    errors.push("仓库ID不能为空");
  }

  if (!dto.supplierName) {
    errors.push("供应商名称不能为空");
  } else if (dto.supplierName.length < 2 || dto.supplierName.length > 100) {
    errors.push("供应商名称长度应在2-100字符之间");
  }

  if (!dto.supplierContact) {
    errors.push("供应商联系人不能为空");
  } else if (
    dto.supplierContact.length < 5 ||
    dto.supplierContact.length > 50
  ) {
    errors.push("供应商联系人长度应在5-50字符之间");
  }

  if (!dto.supplierAddress) {
    errors.push("供应商地址不能为空");
  } else if (
    dto.supplierAddress.length < 10 ||
    dto.supplierAddress.length > 200
  ) {
    errors.push("供应商地址长度应在10-200字符之间");
  }

  if (!dto.expectedArrival) {
    errors.push("预计到货时间不能为空");
  } else {
    const arrivalDate = new Date(dto.expectedArrival);
    if (isNaN(arrivalDate.getTime())) {
      errors.push("预计到货时间格式无效");
    } else if (arrivalDate < new Date()) {
      errors.push("预计到货时间不能早于当前时间");
    }
  }

  // 商品项验证
  if (!dto.items || dto.items.length === 0) {
    errors.push("至少需要添加一个商品项");
  } else if (dto.items.length > 100) {
    errors.push("商品项数量不能超过100个");
  } else {
    dto.items.forEach((item, index) => {
      if (!item.sku) {
        errors.push(`第${index + 1}个商品的SKU不能为空`);
      } else if (item.sku.length > 50) {
        errors.push(`第${index + 1}个商品的SKU长度不能超过50字符`);
      }

      if (!item.forecastedQuantity || item.forecastedQuantity <= 0) {
        errors.push(`第${index + 1}个商品的预报数量必须大于0`);
      } else if (item.forecastedQuantity > 999999) {
        errors.push(`第${index + 1}个商品的预报数量不能超过999999`);
      }

      if (item.unitWeight !== undefined && item.unitWeight < 0) {
        errors.push(`第${index + 1}个商品的单位重量不能为负数`);
      }

      if (item.dimensions) {
        if (
          item.dimensions.length <= 0 ||
          item.dimensions.width <= 0 ||
          item.dimensions.height <= 0
        ) {
          errors.push(`第${index + 1}个商品的尺寸必须大于0`);
        }
      }
    });
  }

  return errors;
}
