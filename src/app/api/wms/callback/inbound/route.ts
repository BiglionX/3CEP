/**
 * WMS入库预报回调处理API
 * 接收来自WMS系统的状态变更通知
 * WMS-203 入库预报管理功能
 */

import { WMSInboundNoticeCallback } from "@/lib/warehouse/wms-client.interface";
import { InboundForecastService } from "@/supply-chain/services/inbound-forecast.service";
import { NextResponse } from "next/server";

const forecastService = new InboundForecastService();

/**
 * POST /api/wms/callback/inbound
 * 处理WMS入库预报回调
 */
export async function POST(request: Request) {
  try {
    // 验证回调签名
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("WMS回调: 缺少或无效的认证头");
      return NextResponse.json({ error: "无效的认证" }, { status: 401 });
    }

    // 验证回调令牌（简化处理，实际应使用更安全的方式）
    const token = authHeader.substring(7);
    if (!isValidCallbackToken(token)) {
      console.warn("WMS回调: 无效的回调令牌");
      return NextResponse.json({ error: "无效的回调令牌" }, { status: 401 });
    }

    // 解析回调数据
    const callbackData: WMSInboundNoticeCallback = await request.json();

    // 基础数据验证
    const validationErrors = validateCallbackData(callbackData);
    if (validationErrors.length > 0) {
      console.warn("WMS回调数据验证失败:", validationErrors);
      return NextResponse.json(
        {
          error: "回调数据验证失败",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    // 验证时间戳（防止重放攻击）
    if (!isValidTimestamp(callbackData.timestamp)) {
      console.warn("WMS回调: 时间戳无效或过期");
      return NextResponse.json({ error: "时间戳无效" }, { status: 400 });
    }

    // 处理回调数据
    await forecastService.handleWMSCallback(callbackData);

    // 记录回调日志
    console.log("WMS回调处理成功:", {
      noticeId: callbackData.noticeId,
      status: callbackData.status,
      timestamp: callbackData.timestamp,
    });

    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: "回调处理成功",
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("处理WMS回调失败:", error);

    // 返回错误响应但保持200状态码，避免WMS重复发送
    return NextResponse.json(
      {
        success: false,
        error: "回调处理失败",
        details: (error as Error).message,
        processedAt: new Date().toISOString(),
      },
      { status: 200 } // 即使处理失败也返回200，避免重试风暴
    );
  }
}

/**
 * GET /api/wms/callback/inbound
 * 健康检查端点
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "WMS Inbound Callback Handler",
    timestamp: new Date().toISOString(),
  });
}

/**
 * 验证回调令牌
 */
function isValidCallbackToken(token: string): boolean {
  // 在生产环境中应该使用更复杂的验证机制
  // 如JWT验证、数据库查询等
  const validTokens = [
    process.env.WMS_CALLBACK_TOKEN,
    "test-callback-token", // 开发环境测试用
  ];

  return validTokens.includes(token);
}

/**
 * 验证回调数据
 */
function validateCallbackData(data: WMSInboundNoticeCallback): string[] {
  const errors: string[] = [];

  // 必填字段验证
  if (!data.noticeId) {
    errors.push("缺少预报单ID");
  }

  if (!data.status) {
    errors.push("缺少状态信息");
  } else {
    const validStatuses = ["confirmed", "in_transit", "received", "cancelled"];
    if (!validStatuses.includes(data.status)) {
      errors.push("无效的状态值");
    }
  }

  if (!data.timestamp) {
    errors.push("缺少时间戳");
  }

  // 收货项验证
  if (data.receivedItems) {
    data.receivedItems.forEach((item, index) => {
      if (!item.sku) {
        errors.push(`第${index + 1}个收货项缺少SKU`);
      }
      if (item.expectedQuantity === undefined || item.expectedQuantity < 0) {
        errors.push(`第${index + 1}个收货项预期数量无效`);
      }
      if (item.receivedQuantity === undefined || item.receivedQuantity < 0) {
        errors.push(`第${index + 1}个收货项实际收货数量无效`);
      }
    });
  }

  return errors;
}

/**
 * 验证时间戳有效性
 */
function isValidTimestamp(timestamp: Date): boolean {
  const callbackTime = new Date(timestamp);
  const currentTime = new Date();
  const timeDiff = Math.abs(currentTime.getTime() - callbackTime.getTime());

  // 时间差不能超过5分钟，防止重放攻击
  const maxTimeDiff = 5 * 60 * 1000; // 5分钟

  return timeDiff <= maxTimeDiff;
}

/**
 * 记录回调处理日志
 */
function logCallbackProcessing(
  data: WMSInboundNoticeCallback,
  success: boolean,
  error?: string
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    noticeId: data.noticeId,
    status: data.status,
    success,
    error,
    processingTime: Date.now(),
  };

  // 在生产环境中应该写入专门的日志系统
  console.log("WMS回调处理日志:", JSON.stringify(logEntry));
}
