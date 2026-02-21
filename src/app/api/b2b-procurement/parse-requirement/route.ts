/**
 * B2B采购需求理解引擎API端点
 * 支持文本、图片、链接等多种输入类型的智能解析
 */

import {
  InputType,
  RawProcurementRequest,
} from "@/b2b-procurement-agent/models/procurement.model";
import { RequirementUnderstandingService } from "@/b2b-procurement-agent/services/requirement-understanding.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input, inputType = "auto", companyId, requesterId } = body;

    // 参数验证
    if (!input || typeof input !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "请提供有效的采购需求输入",
        },
        { status: 400 }
      );
    }

    if (!companyId || !requesterId) {
      return NextResponse.json(
        {
          success: false,
          error: "缺少必要的公司ID或请求者ID",
        },
        { status: 400 }
      );
    }

    // 自动检测输入类型
    const detectedInputType =
      inputType === "auto" ? detectInputType(input) : (inputType as InputType);

    // 创建原始请求对象
    const rawRequest: RawProcurementRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      companyId,
      requesterId,
      input: input.trim(),
      inputType: detectedInputType,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 根据输入类型设置相应字段
    switch (detectedInputType) {
      case InputType.IMAGE:
        rawRequest.imageUrl = input.trim();
        break;
      case InputType.LINK:
        rawRequest.sourceUrl = input.trim();
        break;
      case InputType.TEXT:
        rawRequest.rawDescription = input.trim();
        break;
    }

    // 调用需求理解服务
    const understandingService = new RequirementUnderstandingService();
    const result = await understandingService.processRequest(rawRequest);

    return NextResponse.json({
      success: true,
      data: {
        rawRequest,
        parsedRequest: result.parsedRequest,
        processingInfo: {
          inputType: detectedInputType,
          modelUsed: result.modelUsed,
          confidenceLevel: result.confidenceLevel,
          processingSteps: result.processingSteps,
          processingTimeMs: result.processingTimeMs,
        },
      },
      message: "采购需求解析成功",
    });
  } catch (error) {
    console.error("采购需求解析错误:", error);

    return NextResponse.json(
      {
        success: false,
        error: "采购需求解析失败",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    );
  }
}

// GET方法用于健康检查
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "B2B采购需求理解引擎服务运行正常",
    supportedInputTypes: ["text", "image", "link"],
    features: [
      "多模态输入支持",
      "智能输入类型检测",
      "大模型API集成",
      "结构化需求输出",
    ],
    timestamp: new Date().toISOString(),
  });
}

// 辅助函数：自动检测输入类型
function detectInputType(input: string): InputType {
  const trimmedInput = input.trim().toLowerCase();

  // 检测是否为URL
  const urlPattern =
    /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  if (urlPattern.test(trimmedInput)) {
    // 进一步判断是图片还是普通链接
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
    const isImageUrl = imageExtensions.some((ext) =>
      trimmedInput.includes(ext)
    );

    return isImageUrl ? InputType.IMAGE : InputType.LINK;
  }

  // 默认为文本输入
  return InputType.TEXT;
}
