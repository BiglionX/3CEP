/**
 * 渚涘簲鍟嗗尮閰岮PI璺敱澶勭悊 * 鎻愪緵 /api/procurement/match-suppliers 鎺ュ彛
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  InputType,
  ParsedProcurementRequest,
  ProcurementItem,
  ProcurementStatus,
  UrgencyLevel,
} from '@/b2b-procurement-agent/models/procurement.model';
import {
  DEFAULT_SCORING_WEIGHTS,
  MatchSuppliersRequest,
  VectorDbType,
} from '@/b2b-procurement-agent/models/supplier-vector.model';
import { MultiFactorScoringService } from '@/b2b-procurement-agent/services/multi-factor-scoring.service';
import { SupplierMatchingService } from '@/b2b-procurement-agent/services/supplier-matching.service';
import { VectorRetrievalService } from '@/b2b-procurement-agent/services/vector-retrieval.service';

// 鍏ㄥ眬鏈嶅姟瀹炰緥
let supplierMatchingService: SupplierMatchingService | null = null;

/**
 * 鍒濆鍖栨湇 */
async function initializeServices(): Promise<void> {
  if (supplierMatchingService) return;

  try {
    // 鍚戦噺鏁版嵁搴撻厤    const vectorDbConfig = {
      type:
        (process.env.VECTOR_DB_TYPE as VectorDbType) || VectorDbType.PINECONE,
      apiKey:
        process.env.PINECONE_API_KEY || process.env.WEAVIATE_API_KEY || '',
      environment: process.env.PINECONE_ENVIRONMENT,
      host: process.env.WEAVIATE_HOST,
      indexName: process.env.PINECONE_INDEX_NAME || 'supplier-match-index',
      dimension: 1536, // OpenAI Ada embeddings缁村害
      metric: 'cosine' as const,
    };

    // 宓屽叆妯″瀷閰嶇疆
    const embeddingConfig = {
      modelName: process.env.EMBEDDING_MODEL || 'text-embedding-ada-002',
      dimension: 1536,
      maxTokens: 8192,
    };

    // 鍒涘缓鏈嶅姟瀹炰緥
    const vectorService = new VectorRetrievalService(
      vectorDbConfig,
      embeddingConfig
    );
    const scoringService = new MultiFactorScoringService();

    supplierMatchingService = new SupplierMatchingService(
      vectorService,
      scoringService
    );

    // 鍒濆鍖栧悜閲忔暟鎹簱
    await vectorService.initialize();

    console.log('渚涘簲鍟嗗尮閰嶆湇鍔″垵濮嬪寲鎴愬姛');
  } catch (error) {
    console.error('渚涘簲鍟嗗尮閰嶆湇鍔″垵濮嬪寲澶辫触:', error);
    throw error;
  }
}

/**
 * POST /api/procurement/match-suppliers
 * 鍖归厤渚涘簲鍟咥PI绔偣
 */
export async function POST(request: NextRequest) {
  try {
    // 鍒濆鍖栨湇    await initializeServices();

    // 瑙ｆ瀽璇眰    const requestBody = await request.json();

    // 楠岃瘉蹇呴渶瀛楁
    if (!requestBody.procurementRequest) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯閲囪喘闇€姹傚弬,
        },
        { status: 400 }
      );
    }

    // 鏋勫缓鍖归厤璇眰
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

    console.log(`鏀跺埌渚涘簲鍟嗗尮閰嶈 ${matchRequest.requestId}`);

    // 鎵ц鍖归厤
    const result = await supplierMatchingService!.matchSuppliers(matchRequest);

    // 杩斿洖鎴愬姛鍝嶅簲
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('渚涘簲鍟嗗尮閰岮PI閿欒:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || '渚涘簲鍟嗗尮閰嶅け,
        details:
          process.env.NODE_ENV === 'development'  error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/procurement/match-suppliers
 * 鑾峰彇鏈嶅姟鐘舵€佸拰缁熻淇℃伅
 */
export async function GET(request: NextRequest) {
  try {
    // 鍒濆鍖栨湇鍔★紙濡傛灉灏氭湭鍒濆鍖栵級
    await initializeServices();

    // 鑾峰彇鏌ヨ鍙傛暟
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'statistics':
        // 杩斿洖鏈嶅姟缁熻淇℃伅
        const statistics = supplierMatchingService!.getStatistics();
        return NextResponse.json({
          success: true,
          data: statistics,
        });

      case 'health':
        // 鍋ュ悍妫€        return NextResponse.json({
          success: true,
          data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'supplier-matching',
          },
        });

      default:
        // 杩斿洖API淇℃伅
        return NextResponse.json({
          success: true,
          data: {
            name: '渚涘簲鍟嗘櫤鑳藉尮閰岮PI',
            version: '1.0.0',
            endpoints: {
              'POST /api/procurement/match-suppliers': '鍖归厤渚涘簲,
              'GET /api/procurement/match-suppliersaction=statistics':
                '鑾峰彇缁熻淇℃伅',
              'GET /api/procurement/match-suppliersaction=health': '鍋ュ悍妫€,
            },
            description: '鍩轰簬鍚戦噺妫€绱㈠拰澶氬洜瀛愯瘎鍒嗙殑鏅鸿兘渚涘簲鍟嗗尮閰嶇郴,
          },
        });
    }
  } catch (error: any) {
    console.error('渚涘簲鍟嗗尮閰岮PI鐘舵€佹鏌ラ敊', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || '鏈嶅姟鐘舵€佹鏌ュけ,
      },
      { status: 500 }
    );
  }
}

/**
 * 鏋勫缓瑙ｆ瀽鍚庣殑閲囪喘闇€姹傚 */
function buildParsedProcurementRequest(
  rawRequest: any
): ParsedProcurementRequest {
  // 楠岃瘉蹇呴渶瀛楁
  if (!rawRequest.items || !Array.isArray(rawRequest.items)) {
    throw new Error('閲囪喘闇€姹傚繀椤诲寘鍚玦tems鏁扮粍');
  }

  // 杞崲閲囪喘鐗╁搧
  const items: ProcurementItem[] = rawRequest.items.map(
    (item: any, index: number) => ({
      id: item.id || `item_${index}`,
      productId: item.productId || `prod_${index}`,
      productName: item.productName || `浜у搧${index + 1}`,
      category: item.category || '氱敤鍟嗗搧',
      quantity: item.quantity || 1,
      unit: item.unit || ',
      specifications: item.specifications,
      requiredQuality: item.requiredQuality,
      estimatedUnitPrice: item.estimatedUnitPrice,
      totalPrice: item.totalPrice,
    })
  );

  // 鏋勫缓閲囪喘闇€姹傚  const procurementRequest: ParsedProcurementRequest = {
    id: rawRequest.id || `pr_${Date.now()}`,
    rawRequestId: rawRequest.rawRequestId || `raw_${Date.now()}`,
    companyId: rawRequest.companyId || 'default_company',
    requesterId: rawRequest.requesterId || 'anonymous',
    inputType: rawRequest.inputType || InputType.TEXT,
    items: items,
    urgency: rawRequest.urgency || UrgencyLevel.MEDIUM,
    budgetRange: rawRequest.budgetRange,
    deliveryDeadline: rawRequest.deliveryDeadline
       new Date(rawRequest.deliveryDeadline)
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
 * 鎵归噺鏇存柊渚涘簲鍟嗗悜閲忕储 */
export async function PUT(request: NextRequest) {
  try {
    await initializeServices();

    const { suppliers } = await request.json();

    if (!suppliers || !Array.isArray(suppliers)) {
      return NextResponse.json(
        {
          success: false,
          error: '蹇呴』鎻愪緵渚涘簲鍟嗘暟,
        },
        { status: 400 }
      );
    }

    await supplierMatchingService!.batchUpdateSupplierVectors(suppliers);

    return NextResponse.json({
      success: true,
      message: `鎴愬姛鏇存柊 ${suppliers.length} 涓緵搴斿晢鍚戦噺`,
    });
  } catch (error: any) {
    console.error('鎵归噺鏇存柊渚涘簲鍟嗗悜閲忓け', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || '鎵归噺鏇存柊澶辫触',
      },
      { status: 500 }
    );
  }
}

