/**
 * 供应商匹配API路由处理器
 * 提供 /api/procurement/match-suppliers 接口
 */

import { NextRequest, NextResponse } from "next/server";
import {
  InputType,
  ParsedProcurementRequest,
  ProcurementItem,
  ProcurementStatus,
  UrgencyLevel,
} from "@/b2b-procurement-agent/models/procurement.model";
import {
  DEFAULT_SCORING_WEIGHTS,
  MatchSuppliersRequest,
  VectorDbType,
} from "@/b2b-procurement-agent/models/supplier-vector.model";
import { MultiFactorScoringService } from "@/b2b-procurement-agent/services/multi-factor-scoring.service";
import { SupplierMatchingService } from "@/b2b-procurement-agent/services/supplier-matching.service";
import { VectorRetrievalService } from "@/b2b-procurement-agent/services/vector-retrieval.service";

// 全局服务实例
let supplierMatchingService: SupplierMatchingService | null = null;

/**
 * 初始化服务
 */
async function initializeServices(): Promise<void> {
  if (supplierMatchingService) return;

  try {
    // 向量数据库配置
    const vectorDbConfig = {
      type:
        (process.env.VECTOR_DB_TYPE as VectorDbType) || VectorDbType.PINECONE,
      apiKey:
        process.env.PINECONE_API_KEY || process.env.WEAVIATE_API_KEY || "",
      environment: process.env.PINECONE_ENVIRONMENT,
      host: process.env.WEAVIATE_HOST,
      indexName: process.env.PINECONE_INDEX_NAME || "supplier-match-index",
      dimension: 1536, // OpenAI Ada embeddings维度
      metric: "cosine" as const,
    };

    // 嵌入模型配置
    const embeddingConfig = {
      modelName: process.env.EMBEDDING_MODEL || "text-embedding-ada-002",
      dimension: 1536,
      maxTokens: 8192,
    };

    // 创建服务实例
    const vectorService = new VectorRetrievalService(
      vectorDbConfig,
      embeddingConfig
    );
    const scoringService = new MultiFactorScoringService();

    supplierMatchingService = new SupplierMatchingService(
      vectorService,
      scoringService
    );

    // 初始化向量数据库
    await vectorService.initialize();

    console.log("供应商匹配服务初始化成功");
  } catch (error) {
    console.error("供应商匹配服务初始化失败:", error);
    throw error;
  }
}

/**
 * POST /api/procurement/match-suppliers
 * 匹配供应商API端点
 */
export async function POST(request: NextRequest) {
  try {
    // 初始化服务
    await initializeServices();

    // 解析请求体
    const requestBody = await request.json();

    // 验证必需字段
    if (!requestBody.procurementRequest) {
      return NextResponse.json(
        {
          success: false,
          error: "缺少采购需求参数",
        },
        { status: 400 }
      );
    }

    // 构建匹配请求
    const matchRequest: MatchSuppliersRequest = {
      requestId:
        requestBody.requestId ||
        `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      procurementRequest: buildParsedProcurementRequest(
        requestBody.procurementRequest
      ),
      topK: requestBody.topK || 5,
      minScoreThreshold: requestBody.minScoreThreshold || 0,
      scoringWeights: requestBody.scoringWeights || DEFAULT_SCORING_WEIGHTS,
      includePricing: requestBody.includePricing !== false,
      excludeSuppliers: requestBody.excludeSuppliers || [],
    };

    console.log(`收到供应商匹配请求: ${matchRequest.requestId}`);

    // 执行匹配
    const result = await supplierMatchingService!.matchSuppliers(matchRequest);

    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("供应商匹配API错误:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "供应商匹配失败",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/procurement/match-suppliers
 * 获取服务状态和统计信息
 */
export async function GET(request: NextRequest) {
  try {
    // 初始化服务（如果尚未初始化）
    await initializeServices();

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "statistics":
        // 返回服务统计信息
        const statistics = supplierMatchingService!.getStatistics();
        return NextResponse.json({
          success: true,
          data: statistics,
        });

      case "health":
        // 健康检查
        return NextResponse.json({
          success: true,
          data: {
            status: "healthy",
            timestamp: new Date().toISOString(),
            service: "supplier-matching",
          },
        });

      default:
        // 返回API信息
        return NextResponse.json({
          success: true,
          data: {
            name: "供应商智能匹配API",
            version: "1.0.0",
            endpoints: {
              "POST /api/procurement/match-suppliers": "匹配供应商",
              "GET /api/procurement/match-suppliers?action=statistics":
                "获取统计信息",
              "GET /api/procurement/match-suppliers?action=health": "健康检查",
            },
            description: "基于向量检索和多因子评分的智能供应商匹配系统",
          },
        });
    }
  } catch (error: any) {
    console.error("供应商匹配API状态检查错误:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "服务状态检查失败",
      },
      { status: 500 }
    );
  }
}

/**
 * 构建解析后的采购需求对象
 */
function buildParsedProcurementRequest(
  rawRequest: any
): ParsedProcurementRequest {
  // 验证必需字段
  if (!rawRequest.items || !Array.isArray(rawRequest.items)) {
    throw new Error("采购需求必须包含items数组");
  }

  // 转换采购物品
  const items: ProcurementItem[] = rawRequest.items.map(
    (item: any, index: number) => ({
      id: item.id || `item_${index}`,
      productId: item.productId || `prod_${index}`,
      productName: item.productName || `产品${index + 1}`,
      category: item.category || "通用商品",
      quantity: item.quantity || 1,
      unit: item.unit || "件",
      specifications: item.specifications,
      requiredQuality: item.requiredQuality,
      estimatedUnitPrice: item.estimatedUnitPrice,
      totalPrice: item.totalPrice,
    })
  );

  // 构建采购需求对象
  const procurementRequest: ParsedProcurementRequest = {
    id: rawRequest.id || `pr_${Date.now()}`,
    rawRequestId: rawRequest.rawRequestId || `raw_${Date.now()}`,
    companyId: rawRequest.companyId || "default_company",
    requesterId: rawRequest.requesterId || "anonymous",
    inputType: rawRequest.inputType || InputType.TEXT,
    items: items,
    urgency: rawRequest.urgency || UrgencyLevel.MEDIUM,
    budgetRange: rawRequest.budgetRange,
    deliveryDeadline: rawRequest.deliveryDeadline
      ? new Date(rawRequest.deliveryDeadline)
      : undefined,
    deliveryLocation: rawRequest.deliveryLocation,
    specialRequirements: rawRequest.specialRequirements,
    imageUrl: rawRequest.imageUrl,
    sourceUrl: rawRequest.sourceUrl,
    extractedContent: rawRequest.extractedContent,
    processingContext: rawRequest.processingContext,
    status: ProcurementStatus.SUBMITTED,
    aiConfidence: rawRequest.aiConfidence || 90,
    parsedAt: new Date(),
    processingTimeMs: 0,
  };

  return procurementRequest;
}

/**
 * PUT /api/procurement/match-suppliers/suppliers
 * 批量更新供应商向量索引
 */
export async function PUT(request: NextRequest) {
  try {
    await initializeServices();

    const { suppliers } = await request.json();

    if (!suppliers || !Array.isArray(suppliers)) {
      return NextResponse.json(
        {
          success: false,
          error: "必须提供供应商数组",
        },
        { status: 400 }
      );
    }

    await supplierMatchingService!.batchUpdateSupplierVectors(suppliers);

    return NextResponse.json({
      success: true,
      message: `成功更新 ${suppliers.length} 个供应商向量`,
    });
  } catch (error: any) {
    console.error("批量更新供应商向量失败:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "批量更新失败",
      },
      { status: 500 }
    );
  }
}
