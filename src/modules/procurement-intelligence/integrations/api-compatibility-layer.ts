// API兼容?// 提供向后兼容的API接口，确保现有客户端可以无缝使用新功?
import { NextRequest, NextResponse } from 'next/server';
import { MarketIntelligenceService } from '../services/market-intelligence.service';
import { DataCollectionService } from '../services/data-collection.service';

// 模拟服务类定?class SupplierProfilingService {
  async smartMatching(criteria: any) {
    // 模拟智能匹配结果
    return {
      matches: [
        {
          supplier: {
            supplier_id: 'SUP-001',
            company_name: '示例供应?,
            geographic_info: { country: 'China' },
            capabilities: { product_categories: ['电子产品'] },
            certifications: ['ISO 9001'],
            risk_profile: { overall_risk_score: 25 },
          },
          matchingScore: 0.85,
        },
      ],
    };
  }

  async assessSupplierRisk(supplierId: string) {
    return {
      overall_risk_score: 25,
      risk_level: 'low',
      financial_risk_score: 20,
      operational_risk_score: 30,
      compliance_risk_score: 15,
      mitigation_recommendations: ['建议定期审查'],
    };
  }
}

class ContractAdvisorService {
  async generateContractClauses(context: any) {
    return [
      {
        category: '价格条款',
        title: '付款条件',
        content: '买方应在收到货物?0天内付款',
        importance: 'high',
        explanation: '标准付款条件',
      },
    ];
  }
}

class ProcurementAnalyticsService {
  async processSmartRequest(request: any) {
    return {
      id: request.id,
      recommendations: ['建议选择信誉良好的供应商'],
      confidenceScore: 0.85,
    };
  }
}

interface LegacyApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  timestamp: string;
}

interface LegacyProcurementRequest {
  company_id: string;
  requester_id: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  budget?: number;
  deadline?: string;
}

export class ApiCompatibilityLayer {
  private supplierProfiling: SupplierProfilingService;
  private marketIntelligence: MarketIntelligenceService;
  private contractAdvisor: ContractAdvisorService;
  private analytics: ProcurementAnalyticsService;

  constructor() {
    this.supplierProfiling = new SupplierProfilingService();
    this.marketIntelligence = new MarketIntelligenceService();
    this.contractAdvisor = new ContractAdvisorService();
    this.analytics = new ProcurementAnalyticsService();
  }

  /**
   * 兼容旧版供应商搜索API
   */
  async legacySupplierSearch(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const keyword = searchParams.get('keyword') || '';
      const category = searchParams.get('category') || '';
      const minScore = parseInt(searchParams.get('min_score') || '0');
      const limit = parseInt(searchParams.get('limit') || '20');

      // 调用新版智能匹配服务
      const results = await this.supplierProfiling.smartMatching({
        productSpecs: {
          category: category,
          technicalRequirements: [],
          qualityStandards: [],
          quantity: 100,
          deliveryTimeline: 30,
        },
        businessConditions: {
          budgetRange: [0, 1000000],
          paymentTerms: '30_days',
          deliveryLocation: 'China',
          currency: 'USD',
        },
        riskTolerance: 'moderate',
        priorities: {
          quality: 0.4,
          price: 0.3,
          delivery: 0.2,
          service: 0.1,
          innovation: 0.0,
        },
      });

      // 转换为旧版格?      const legacyResults = results.matches.map(match => ({
        supplier_id: match.supplier.supplier_id,
        company_name: match.supplier.company_name,
        country: match.supplier.geographic_info.country,
        score: Math.round(match.matchingScore * 100),
        capabilities: match.supplier.capabilities.product_categories,
        certifications: match.supplier.certifications,
        risk_level:
          match.supplier.risk_profile.overall_risk_score > 70
            ? 'high'
            : match.supplier.risk_profile.overall_risk_score > 40
              ? 'medium'
              : 'low',
      }));

      const response: LegacyApiResponse = {
        success: true,
        data: {
          suppliers: legacyResults,
          total: legacyResults.length,
          matched_criteria: keyword,
        },
        message: '供应商搜索完?,
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(response);
    } catch (error: any) {
      console.error('供应商搜索错?', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || '搜索失败',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  }

  /**
   * 兼容旧版价格查询API
   */
  async legacyPriceQuery(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const product = searchParams.get('product') || '';
      const region = searchParams.get('region') || 'global';
      const currency = searchParams.get('currency') || 'USD';

      // 调用新版市场情报服务
      const report =
        await this.marketIntelligence.generateMarketIntelligenceReport(
          [product],
          [region]
        );

      // 从报告中提取价格数据
      const priceData = report.price_indices.map(index => ({
        commodityName: index.commodity,
        price: index.current_price,
        currency: currency,
        unit: 'unit',
        trend: index.trend,
        volatility: index.volatility_index,
        priceDate: index.updated_at,
      }));

      // 转换为旧版格?      const legacyPrices = priceData.map(data => ({
        product_name: data.commodityName,
        current_price: data.price,
        currency: data.currency,
        unit: data.unit,
        trend: data.trend,
        volatility: data.volatility,
        last_updated: data.priceDate,
      }));

      const response: LegacyApiResponse = {
        success: true,
        data: {
          prices: legacyPrices,
          query_product: product,
          query_region: region,
        },
        message: '价格查询完成',
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(response);
    } catch (error: any) {
      console.error('价格查询错误:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || '查询失败',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  }

  /**
   * 兼容旧版采购请求API
   */
  async legacyProcurementRequest(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const legacyRequest: LegacyProcurementRequest = body;

      // 转换为新版格式并处理
      const smartRequest = await this.analytics.processSmartRequest({
        id: `req_${Date.now()}`,
        companyId: legacyRequest.company_id,
        requesterId: legacyRequest.requester_id,
        description: legacyRequest.description,
        parsedRequirements: [
          {
            productId: 'generic',
            productName: legacyRequest.description,
            quantity: 100,
            specifications: {},
          },
        ],
        urgency: legacyRequest.urgency as any,
        budget: legacyRequest.budget,
        deadline: legacyRequest.deadline,
        status: 'submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const response: LegacyApiResponse = {
        success: true,
        data: {
          request_id: smartRequest.id,
          status: 'processed',
          recommendations: smartRequest.recommendations,
          confidence: smartRequest.confidenceScore,
        },
        message: '采购请求处理完成',
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(response);
    } catch (error: any) {
      console.error('采购请求处理错误:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || '请求处理失败',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  }

  /**
   * 兼容旧版风险评估API
   */
  async legacyRiskAssessment(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const supplierId = searchParams.get('supplier_id') || '';

      // 调用新版风险分析服务
      const riskProfile =
        await this.supplierProfiling.assessSupplierRisk(supplierId);

      // 转换为旧版格?      const legacyRisk = {
        supplier_id: supplierId,
        overall_risk: riskProfile.overall_risk_score,
        risk_level: riskProfile.risk_level,
        financial_risk: riskProfile.financial_risk_score,
        operational_risk: riskProfile.operational_risk_score,
        compliance_risk: riskProfile.compliance_risk_score,
        recommendations: riskProfile.mitigation_recommendations,
      };

      const response: LegacyApiResponse = {
        success: true,
        data: legacyRisk,
        message: '风险评估完成',
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(response);
    } catch (error: any) {
      console.error('风险评估错误:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || '评估失败',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  }

  /**
   * 兼容旧版合同条款建议API
   */
  async legacyContractSuggestions(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const { contract_type, value, duration, supplier_risk } = body;

      // 调用新版合同顾问服务
      const suggestions = await this.contractAdvisor.generateContractClauses({
        procurementType: contract_type.includes('service')
          ? 'services'
          : contract_type.includes('construction')
            ? 'construction'
            : 'goods',
        contractValue: value,
        currency: 'USD',
        duration: duration,
        supplierRiskLevel:
          supplier_risk === 'high'
            ? 'high'
            : supplier_risk === 'medium'
              ? 'medium'
              : 'low',
        supplierPerformanceHistory: {
          qualityScore: 80,
          deliveryScore: 85,
          serviceScore: 75,
        },
        qualityRequirements: ['ISO 9001', '行业标准'],
        deliveryRequirements: ['准时交付', '质量保证'],
        paymentPreferences: {
          paymentMethod: 'installment',
          paymentTerm: 30,
        },
        riskTolerance: 'moderate',
        industryType: 'technology',
        regulatoryRequirements: ['合同?, '招投标法'],
      });

      // 转换为旧版格?      const legacySuggestions = suggestions.map(suggestion => ({
        clause_type: suggestion.category,
        clause_title: suggestion.title,
        clause_content: suggestion.content,
        importance: suggestion.importance,
        explanation: suggestion.explanation,
      }));

      const response: LegacyApiResponse = {
        success: true,
        data: {
          suggestions: legacySuggestions,
          contract_type: contract_type,
          total_value: value,
        },
        message: '合同建议生成完成',
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(response);
    } catch (error: any) {
      console.error('合同建议错误:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || '建议生成失败',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  }

  /**
   * 健康检查API
   */
  async healthCheck(): Promise<NextResponse> {
    try {
      const response: LegacyApiResponse = {
        success: true,
        data: {
          status: 'healthy',
          services: {
            supplier_profiling: 'online',
            market_intelligence: 'online',
            contract_advisor: 'online',
            analytics: 'online',
          },
          timestamp: new Date().toISOString(),
        },
        message: '系统运行正常',
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(response);
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: '系统健康检查失?,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  }
}

// 导出实例和路由处理器
export const compatibilityLayer = new ApiCompatibilityLayer();

// 路由处理?export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);

  try {
    if (pathname.includes('/suppliers/search')) {
      return await compatibilityLayer.legacySupplierSearch(request);
    } else if (pathname.includes('/prices/query')) {
      return await compatibilityLayer.legacyPriceQuery(request);
    } else if (pathname.includes('/risk/assessment')) {
      return await compatibilityLayer.legacyRiskAssessment(request);
    } else if (pathname.includes('/health')) {
      return await compatibilityLayer.healthCheck();
    } else {
      return NextResponse.json(
        {
          success: false,
          error: '未找到对应的API端点',
        },
        { status: 404 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '内部服务器错?,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { pathname } = new URL(request.url);

  try {
    if (pathname.includes('/procurement/request')) {
      return await compatibilityLayer.legacyProcurementRequest(request);
    } else if (pathname.includes('/contracts/suggestions')) {
      return await compatibilityLayer.legacyContractSuggestions(request);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: '未找到对应的API端点',
        },
        { status: 404 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '内部服务器错?,
      },
      { status: 500 }
    );
  }
}
