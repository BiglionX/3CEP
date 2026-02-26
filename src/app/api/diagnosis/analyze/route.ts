/**
 * AI诊断分析API端点
 * POST /api/diagnosis/analyze
 * 接收故障描述，返回结构化诊断结果
 */

import {
  DiagnosisAnalysisService,
  DiagnosisRequest,
} from "@/services/diagnosis-analysis.service";
import { validateDiagnosisResult } from "@/services/diagnosis-prompt-template";
import { NextResponse } from "next/server";

// 请求体接口
interface DiagnosisApiRequest {
  faultDescription: string;
  deviceId?: string;
  deviceInfo?: {
    brand?: string;
    model?: string;
    category?: string;
    purchaseTime?: string;
  };
  sessionId?: string;
  language?: string;
}

// 响应体接口
interface DiagnosisApiResponse {
  success: boolean;
  data?: {
    diagnosisResult: any;
    sessionId: string;
    processingTimeMs: number;
  };
  error?: string;
  timestamp: string;
}

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    // 1. 解析请求体
    const body: DiagnosisApiRequest = await request.json();

    // 2. 参数验证
    const validationError = validateRequest(body);
    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: validationError,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 3. 构造诊断请求
    const diagnosisRequest: DiagnosisRequest = {
      faultDescription: body.faultDescription,
      deviceId: body.deviceId,
      deviceInfo: body.deviceInfo,
      sessionId:
        body.sessionId ||
        `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      language: body.language || "zh",
    };

    // 4. 调用诊断服务
    const diagnosisService = new DiagnosisAnalysisService({
      timeoutMs: 30000,
      maxRetries: 2,
      fallbackToMock: true,
      enableLogging: true,
    });

    const diagnosisResult = await diagnosisService.analyzeFault(
      diagnosisRequest
    );

    // 5. 验证结果格式
    if (!validateDiagnosisResult(diagnosisResult)) {
      throw new Error("诊断结果格式验证失败");
    }

    // 6. 构造成功响应
    const response: DiagnosisApiResponse = {
      success: true,
      data: {
        diagnosisResult: diagnosisResult,
        sessionId: diagnosisRequest.sessionId!,
        processingTimeMs: Date.now() - startTime,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("诊断API处理错误:", error);

    // 7. 错误响应
    const response: DiagnosisApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "服务器内部错误",
      timestamp: new Date().toISOString(),
    };

    // 根据错误类型返回不同的HTTP状态码
    const statusCode =
      error instanceof Error && error.message.includes("超时") ? 408 : 500;

    return NextResponse.json(response, { status: statusCode });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "缺少sessionId参数",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 获取会话信息
    const diagnosisService = new DiagnosisAnalysisService();
    const sessionStats = diagnosisService.getSessionStats(sessionId);

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        stats: sessionStats,
        isActive: !!sessionStats,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("获取会话信息错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "服务器内部错误",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "缺少sessionId参数",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 清理会话
    const diagnosisService = new DiagnosisAnalysisService();
    diagnosisService.clearSession(sessionId);

    return NextResponse.json({
      success: true,
      message: "会话已清除",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("清除会话错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "服务器内部错误",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * 验证请求参数
 */
function validateRequest(body: DiagnosisApiRequest): string | null {
  // 必需字段检查
  if (!body.faultDescription) {
    return "故障描述不能为空";
  }

  if (typeof body.faultDescription !== "string") {
    return "故障描述必须是字符串类型";
  }

  if (body.faultDescription.trim().length === 0) {
    return "故障描述不能为空字符串";
  }

  if (body.faultDescription.length > 1000) {
    return "故障描述长度不能超过1000字符";
  }

  // 设备信息验证
  if (body.deviceInfo) {
    if (body.deviceInfo.brand && typeof body.deviceInfo.brand !== "string") {
      return "设备品牌必须是字符串类型";
    }

    if (body.deviceInfo.model && typeof body.deviceInfo.model !== "string") {
      return "设备型号必须是字符串类型";
    }

    if (
      body.deviceInfo.category &&
      typeof body.deviceInfo.category !== "string"
    ) {
      return "设备类别必须是字符串类型";
    }
  }

  // 会话ID验证
  if (body.sessionId && typeof body.sessionId !== "string") {
    return "会话ID必须是字符串类型";
  }

  // 语言验证
  if (body.language && !["zh", "en"].includes(body.language)) {
    return "语言参数只能是zh或en";
  }

  return null;
}

/**
 * API使用示例和文档
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// API路由配置

