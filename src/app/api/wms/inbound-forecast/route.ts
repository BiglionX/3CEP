/**
 * 鍏ュ簱棰勬姤绠＄悊API璺敱
 * 澶勭悊棰勬姤鍗曠殑鍒涘缓鍜屾煡璇㈡搷?
 * WMS-203 鍏ュ簱棰勬姤绠＄悊鍔熻兘
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
 * 鍒涘缓鏂扮殑鍏ュ簱棰勬姤?
 */
export async function POST(request: Request) {
  try {
    // 楠岃瘉鐢ㄦ埛浼氳瘽
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session??.id) {
      return NextResponse.json(
        { error: "鏈巿鏉冭闂紝璇峰厛鐧诲綍" },
        { status: 401 }
      );
    }

    // 瑙ｆ瀽璇锋眰?
    const body: CreateInboundForecastDTO = await request.json();

    // 鍩虹鍙傛暟楠岃瘉
    const validationErrors = validateCreateForecastDTO(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "鍙傛暟楠岃瘉澶辫触",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    // 鍒涘缓棰勬姤?
    const forecast = await forecastService.createForecast(
      body,
      session.user.id
    );

    // 杩斿洖鎴愬姛鍝嶅簲
    return NextResponse.json(
      {
        success: true,
        message: "棰勬姤鍗曞垱寤烘垚?,
        data: forecast,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("鍒涘缓鍏ュ簱棰勬姤澶辫触:", error);
    return NextResponse.json(
      {
        error: "鍒涘缓棰勬姤鍗曞け?,
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wms/inbound-forecast
 * 鏌ヨ棰勬姤鍗曞垪?
 */
export async function GET(request: Request) {
  try {
    // 楠岃瘉鐢ㄦ埛浼氳瘽
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session??.id) {
      return NextResponse.json(
        { error: "鏈巿鏉冭闂紝璇峰厛鐧诲綍" },
        { status: 401 }
      );
    }

    // 瑙ｆ瀽鏌ヨ鍙傛暟
    const { searchParams } = new URL(request.url);
    const params: InboundForecastQueryParams = {};

    // 浠撳簱ID杩囨护
    if (searchParams.get("warehouseId")) {
      params.warehouseId = searchParams.get("warehouseId")!;
    }

    // 鐘舵€佽繃?
    if (searchParams.get("status")) {
      const status = searchParams.get("status") as InboundForecastStatus;
      if (Object.values(InboundForecastStatus).includes(status)) {
        params.status = status;
      }
    }

    // 渚涘簲鍟嗗悕绉版悳?
    if (searchParams.get("supplierName")) {
      params.supplierName = searchParams.get("supplierName")!;
    }

    // 鏃ユ湡鑼冨洿杩囨护
    if (searchParams.get("startDate")) {
      params.startDate = new Date(searchParams.get("startDate")!);
    }

    if (searchParams.get("endDate")) {
      params.endDate = new Date(searchParams.get("endDate")!);
    }

    // 鍝佺墝ID杩囨护
    if (searchParams.get("brandId")) {
      params.brandId = searchParams.get("brandId")!;
    }

    // 鍒涘缓鑰呰繃?
    if (searchParams.get("createdBy")) {
      params.createdBy = searchParams.get("createdBy")!;
    }

    // 鍒嗛〉鍙傛暟
    if (searchParams.get("limit")) {
      params.limit = parseInt(searchParams.get("limit")!);
      // 闄愬埗鏈€澶ц繑鍥炴暟?
      if (params.limit > 100) params.limit = 100;
    }

    if (searchParams.get("offset")) {
      params.offset = parseInt(searchParams.get("offset")!);
    }

    // 鏌ヨ棰勬姤鍗曞垪?
    const forecasts = await forecastService.listForecasts(params);

    // 杩斿洖鎴愬姛鍝嶅簲
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
    console.error("鏌ヨ鍏ュ簱棰勬姤鍒楄〃澶辫触:", error);
    return NextResponse.json(
      {
        error: "鏌ヨ棰勬姤鍗曞け?,
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * 楠岃瘉鍒涘缓棰勬姤鍗旸TO
 */
function validateCreateForecastDTO(dto: CreateInboundForecastDTO): string[] {
  const errors: string[] = [];

  // 蹇呭～瀛楁楠岃瘉
  if (!dto.warehouseId) {
    errors.push("浠撳簱ID涓嶈兘涓虹┖");
  }

  if (!dto.supplierName) {
    errors.push("渚涘簲鍟嗗悕绉颁笉鑳戒负?);
  } else if (dto.supplierName.length < 2 || dto.supplierName.length > 100) {
    errors.push("渚涘簲鍟嗗悕绉伴暱搴﹀簲?-100瀛楃涔嬮棿");
  }

  if (!dto.supplierContact) {
    errors.push("渚涘簲鍟嗚仈绯讳汉涓嶈兘涓虹┖");
  } else if (
    dto.supplierContact.length < 5 ||
    dto.supplierContact.length > 50
  ) {
    errors.push("渚涘簲鍟嗚仈绯讳汉闀垮害搴斿湪5-50瀛楃涔嬮棿");
  }

  if (!dto.supplierAddress) {
    errors.push("渚涘簲鍟嗗湴鍧€涓嶈兘涓虹┖");
  } else if (
    dto.supplierAddress.length < 10 ||
    dto.supplierAddress.length > 200
  ) {
    errors.push("渚涘簲鍟嗗湴鍧€闀垮害搴斿湪10-200瀛楃涔嬮棿");
  }

  if (!dto.expectedArrival) {
    errors.push("棰勮鍒拌揣鏃堕棿涓嶈兘涓虹┖");
  } else {
    const arrivalDate = new Date(dto.expectedArrival);
    if (isNaN(arrivalDate.getTime())) {
      errors.push("棰勮鍒拌揣鏃堕棿鏍煎紡鏃犳晥");
    } else if (arrivalDate < new Date()) {
      errors.push("棰勮鍒拌揣鏃堕棿涓嶈兘鏃╀簬褰撳墠鏃堕棿");
    }
  }

  // 鍟嗗搧椤归獙?
  if (!dto.items || dto.items.length === 0) {
    errors.push("鑷冲皯闇€瑕佹坊鍔犱竴涓晢鍝侀」");
  } else if (dto.items.length > 100) {
    errors.push("鍟嗗搧椤规暟閲忎笉鑳借秴?00锟?);
  } else {
    dto.items.forEach((item, index) => {
      if (!item.sku) {
        errors.push(`锟?{index + 1}涓晢鍝佺殑SKU涓嶈兘涓虹┖`);
      } else if (item.sku.length > 50) {
        errors.push(`锟?{index + 1}涓晢鍝佺殑SKU闀垮害涓嶈兘瓒呰繃50瀛楃`);
      }

      if (!item.forecastedQuantity || item.forecastedQuantity <= 0) {
        errors.push(`锟?{index + 1}涓晢鍝佺殑棰勬姤鏁伴噺蹇呴』澶т簬0`);
      } else if (item.forecastedQuantity > 999999) {
        errors.push(`锟?{index + 1}涓晢鍝佺殑棰勬姤鏁伴噺涓嶈兘瓒呰繃999999`);
      }

      if (item.unitWeight !== undefined && item.unitWeight < 0) {
        errors.push(`锟?{index + 1}涓晢鍝佺殑鍗曚綅閲嶉噺涓嶈兘涓鸿礋鏁癭);
      }

      if (item.dimensions) {
        if (
          item.dimensions.length <= 0 ||
          item.dimensions.width <= 0 ||
          item.dimensions.height <= 0
        ) {
          errors.push(`锟?{index + 1}涓晢鍝佺殑灏哄蹇呴』澶т簬0`);
        }
      }
    });
  }

  return errors;
}

