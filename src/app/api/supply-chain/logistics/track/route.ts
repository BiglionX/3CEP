/**
 * 物流追踪API路由
 * 提供统一的运单轨迹查询接口
 *
 * GET /api/supply-chain/logistics/track?trackingNumber=xxx&carrier=xxx
 * POST /api/supply-chain/logistics/track - 批量查询
 */

import {
  BatchTrackDTO,
  LogisticsCarrier,
  LogisticsTrackingConfig,
  TrackShipmentDTO,
} from "@/supply-chain/models/logistics.model";
import { LogisticsTrackingService } from "@/supply-chain/services/logistics-tracking.service";
import { NextResponse } from "next/server";

// 物流追踪服务配置
const logisticsConfig: LogisticsTrackingConfig = {
  defaultTimeout: 10000, // 10秒超时
  maxRetryAttempts: 3,
  autoDetectEnabled: true,
  cacheEnabled: true,
  cacheTTL: 300, // 5分钟缓存
  carriers: [
    // 17track配置（作为主要聚合服务商）
    {
      carrier: LogisticsCarrier.OTHER,
      apiKey: process.env.TRACK17_API_KEY || "your_17track_api_key",
      isEnabled: true,
      timeout: 10000,
      retryAttempts: 3,
    },
    // 顺丰速运官方API配置
    {
      carrier: LogisticsCarrier.SF_EXPRESS,
      apiKey: process.env.SF_EXPRESS_API_KEY || "your_sf_express_api_key",
      endpoint:
        process.env.SF_EXPRESS_ENDPOINT || "https://sfapi.sf-express.com",
      isEnabled: !!process.env.SF_EXPRESS_API_KEY,
      timeout: 8000,
      retryAttempts: 2,
    },
    // 快递鸟配置（作为备选）
    {
      carrier: LogisticsCarrier.OTHER,
      apiKey: process.env.KDNIAO_API_KEY || "your_kdniao_api_key",
      customerId: process.env.KDNIAO_CUSTOMER_ID || "your_kdniao_customer_id",
      isEnabled: !!process.env.KDNIAO_API_KEY,
      timeout: 10000,
      retryAttempts: 3,
    },
  ],
};

// 初始化物流追踪服务
const logisticsService = new LogisticsTrackingService(logisticsConfig);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get("trackingNumber");
    const carrierParam = searchParams.get("carrier");
    const autoDetect = searchParams.get("autoDetect") !== "false";

    // 参数验证
    if (!trackingNumber) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_PARAMETER",
            message: "缺少必要的参数: trackingNumber",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 转换物流商参数
    let carrier: LogisticsCarrier | undefined;
    if (carrierParam) {
      const carrierEnum = Object.values(LogisticsCarrier).find(
        (c) => c.toLowerCase() === carrierParam.toLowerCase()
      );
      if (carrierEnum) {
        carrier = carrierEnum;
      } else {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_CARRIER",
              message: `无效的物流商代码: ${carrierParam}`,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
    }

    // 构造查询DTO
    const trackDto: TrackShipmentDTO = {
      trackingNumber,
      carrier,
      autoDetect,
    };

    // 执行轨迹查询
    const result = await logisticsService.trackShipment(trackDto);

    // 返回结果
    return NextResponse.json(
      {
        ...result,
        timestamp: result.timestamp.toISOString(),
      },
      {
        status: result.success ? 200 : 400,
      }
    );
  } catch (error) {
    console.error("物流追踪API错误:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "服务器内部错误",
          details: (error as Error).message,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 验证请求体
    if (!body.trackingNumbers || !Array.isArray(body.trackingNumbers)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "请求体必须包含trackingNumbers数组",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 转换物流商参数
    let carrier: LogisticsCarrier | undefined;
    if (body.carrier) {
      const carrierEnum = Object.values(LogisticsCarrier).find(
        (c) => c.toLowerCase() === body.carrier.toLowerCase()
      );
      if (!carrierEnum) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_CARRIER",
              message: `无效的物流商代码: ${body.carrier}`,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
      carrier = carrierEnum;
    }

    // 构造批量查询DTO
    const batchDto: BatchTrackDTO = {
      trackingNumbers: body.trackingNumbers,
      carrier,
    };

    // 执行批量轨迹查询
    const results = await logisticsService.batchTrackShipments(batchDto);

    // 统计结果
    const successCount = results.filter((r) => r.success).length;
    const totalCount = results.length;

    // 返回结果
    return NextResponse.json(
      {
        success: true,
        data: results.map((result) => ({
          ...result,
          timestamp: result.timestamp.toISOString(),
        })),
        summary: {
          totalCount,
          successCount,
          failedCount: totalCount - successCount,
          successRate:
            totalCount > 0
              ? ((successCount / totalCount) * 100).toFixed(2) + "%"
              : "0%",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("物流追踪批量API错误:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "服务器内部错误",
          details: (error as Error).message,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// 获取服务状态信息
export async function HEAD(request: Request) {
  try {
    const status = logisticsService.getServiceStatus();

    return NextResponse.json(
      {
        success: true,
        data: {
          ...status,
          timestamp: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "STATUS_CHECK_FAILED",
          message: "服务状态检查失败",
        },
      },
      { status: 500 }
    );
  }
}
