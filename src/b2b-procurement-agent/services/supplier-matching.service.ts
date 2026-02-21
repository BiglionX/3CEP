/**
 * 供应商智能匹配主服务
 * 整合向量检索和多因子评分功能
 */

import { Supplier } from "../../supply-chain/models/supplier.model";
import {
  DEFAULT_SCORING_WEIGHTS,
  MatchSuppliersRequest,
  MatchSuppliersResponse,
  ScoringWeights,
  SupplierVector,
} from "../models/supplier-vector.model";
import { MultiFactorScoringService } from "./multi-factor-scoring.service";
import { VectorRetrievalService } from "./vector-retrieval.service";

export class SupplierMatchingService {
  private vectorService: VectorRetrievalService;
  private scoringService: MultiFactorScoringService;
  private supplierCache: Map<string, Supplier> = new Map();
  private supplierVectorCache: Map<string, SupplierVector> = new Map();

  constructor(
    vectorService: VectorRetrievalService,
    scoringService: MultiFactorScoringService
  ) {
    this.vectorService = vectorService;
    this.scoringService = scoringService;
  }

  /**
   * 匹配供应商的主要入口方法
   */
  async matchSuppliers(
    request: MatchSuppliersRequest
  ): Promise<MatchSuppliersResponse> {
    const startTime = Date.now();

    try {
      console.log(`开始匹配供应商请求: ${request.requestId}`);

      // 1. 验证输入参数
      this.validateRequest(request);

      // 2. 获取供应商数据
      const suppliers = await this.getSuppliers(request);

      // 3. 构建或获取供应商向量
      const supplierVectors = await this.buildSupplierVectors(suppliers);

      // 4. 转换采购需求为向量
      const requestVector =
        await this.vectorService.convertProcurementRequestToVector(
          request.procurementRequest
        );

      // 5. 向量搜索匹配的供应商
      const topK = request.topK || 10;
      const vectorMatches = await this.vectorService.searchMatchingSuppliers(
        requestVector,
        topK * 2 // 先获取更多候选，后续再精筛
      );

      console.log(`向量检索返回 ${vectorMatches.length} 个候选供应商`);

      // 6. 应用排除列表过滤
      const filteredMatches = this.applyExclusions(
        vectorMatches,
        request.excludeSuppliers
      );

      // 7. 多因子评分计算
      const weights = this.adjustWeightsForRequest(request);
      const matchResults = this.scoringService.calculateMatchScores(
        request.procurementRequest,
        suppliers,
        supplierVectors,
        requestVector,
        filteredMatches.slice(0, topK),
        weights
      );

      // 8. 应用最小分数阈值过滤
      const finalMatches = this.applyScoreThreshold(
        matchResults,
        request.minScoreThreshold || 0
      );

      // 9. 限制返回数量
      const topMatches = finalMatches.slice(0, request.topK || 5);

      const processingTime = Date.now() - startTime;

      const response: MatchSuppliersResponse = {
        requestId: request.requestId,
        matches: topMatches,
        totalMatches: finalMatches.length,
        processingTimeMs: processingTime,
        scoringWeights: weights,
        matchedAt: new Date(),
      };

      console.log(
        `供应商匹配完成，返回 ${topMatches.length} 个结果，耗时 ${processingTime}ms`
      );

      return response;
    } catch (error) {
      console.error("供应商匹配过程中发生错误:", error);
      throw error;
    }
  }

  /**
   * 批量更新供应商向量索引
   */
  async batchUpdateSupplierVectors(suppliers: Supplier[]): Promise<void> {
    try {
      console.log(`开始批量更新 ${suppliers.length} 个供应商向量`);

      for (const supplier of suppliers) {
        const supplierVector = await this.vectorService.convertSupplierToVector(
          supplier
        );
        await this.vectorService.storeSupplierVector(supplierVector);

        // 更新缓存
        this.supplierCache.set(supplier.id, supplier);
        this.supplierVectorCache.set(supplier.id, supplierVector);
      }

      console.log("供应商向量批量更新完成");
    } catch (error) {
      console.error("批量更新供应商向量失败:", error);
      throw error;
    }
  }

  /**
   * 更新单个供应商向量
   */
  async updateSupplierVector(supplier: Supplier): Promise<void> {
    try {
      const supplierVector = await this.vectorService.convertSupplierToVector(
        supplier
      );
      await this.vectorService.storeSupplierVector(supplierVector);

      // 更新缓存
      this.supplierCache.set(supplier.id, supplier);
      this.supplierVectorCache.set(supplier.id, supplierVector);

      console.log(`供应商 ${supplier.name} 向量更新成功`);
    } catch (error) {
      console.error(`更新供应商 ${supplier.name} 向量失败:`, error);
      throw error;
    }
  }

  /**
   * 验证匹配请求参数
   */
  private validateRequest(request: MatchSuppliersRequest): void {
    if (!request.requestId) {
      throw new Error("请求ID不能为空");
    }

    if (!request.procurementRequest) {
      throw new Error("采购需求不能为空");
    }

    if (
      !request.procurementRequest.items ||
      request.procurementRequest.items.length === 0
    ) {
      throw new Error("采购需求必须包含至少一个商品项");
    }

    if (request.topK !== undefined && request.topK <= 0) {
      throw new Error("topK必须大于0");
    }

    if (
      request.minScoreThreshold !== undefined &&
      (request.minScoreThreshold < 0 || request.minScoreThreshold > 100)
    ) {
      throw new Error("最小分数阈值必须在0-100之间");
    }
  }

  /**
   * 获取供应商数据
   */
  private async getSuppliers(
    request: MatchSuppliersRequest
  ): Promise<Supplier[]> {
    // 这里应该调用供应商服务获取数据
    // 当前使用模拟数据进行演示

    // 实际实现应该是：
    // const supplierService = new SupplierService();
    // const suppliers = await supplierService.getActiveSuppliers();

    // 模拟供应商数据
    const mockSuppliers: Supplier[] = [
      {
        id: "sup-001",
        code: "SUP001",
        name: "优质电子元件供应商",
        type: "manufacturer" as any,
        legalName: "深圳优质电子有限公司",
        contactPerson: "张经理",
        phone: "13800138001",
        email: "zhang@youzhi.com",
        website: "www.youzhi-electronics.com",
        address: "深圳市南山区科技园",
        country: "中国",
        city: "深圳",
        postalCode: "518000",
        businessScope: "电子元件、集成电路、传感器",
        establishedYear: 2010,
        employeeCount: 200,
        annualRevenue: 50000000,
        bankInfo: {
          bankName: "工商银行",
          accountNumber: "1234567890123456",
          swiftCode: "ICBKCNBJ",
        },
        taxId: "91440300123456789X",
        status: "approved" as any,
        creditLevel: "A" as any,
        creditScore: 92,
        rating: 4.8,
        reviewCount: 156,
        cooperationYears: 5,
        lastReviewDate: new Date("2024-01-15"),
        nextReviewDate: new Date("2025-01-15"),
        certifications: [],
        products: [
          {
            id: "prod-001",
            supplierId: "sup-001",
            productId: "elec-001",
            productName: "高性能电容器",
            productCategory: "电子元件",
            unitPrice: 2.5,
            minOrderQuantity: 1000,
            leadTime: 7,
            qualityStandard: "ISO9001",
            certifications: ["RoHS", "CE"],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        contracts: [],
        performanceMetrics: {
          deliveryRate: 98.5,
          qualityRate: 99.2,
          responseTime: 4,
          serviceScore: 4.7,
          complaintCount: 2,
          returnRate: 0.3,
          lastUpdated: new Date(),
        },
        riskAssessment: {
          financialRisk: "low",
          operationalRisk: "low",
          complianceRisk: "low",
          marketRisk: "medium",
          overallRisk: "low",
          riskFactors: ["财务状况良好", "运营稳定"],
          mitigationStrategies: ["定期财务审计", "多元化供应商策略"],
          lastAssessed: new Date("2024-01-15"),
        },
        isActive: true,
        createdAt: new Date("2020-01-01"),
        updatedAt: new Date(),
      },
      {
        id: "sup-002",
        code: "SUP002",
        name: "快速交付科技公司",
        type: "distributor" as any,
        legalName: "北京快速交付科技有限公司",
        contactPerson: "李经理",
        phone: "13800138002",
        email: "li@kuaidesudi.com",
        website: "www.kuaidesudi.com",
        address: "北京市朝阳区CBD",
        country: "中国",
        city: "北京",
        postalCode: "100000",
        businessScope: "电子元件分销、快速交付服务",
        establishedYear: 2015,
        employeeCount: 150,
        annualRevenue: 30000000,
        bankInfo: {
          bankName: "建设银行",
          accountNumber: "9876543210987654",
          swiftCode: "PCBCCNBJ",
        },
        taxId: "91110000987654321Y",
        status: "approved" as any,
        creditLevel: "B" as any,
        creditScore: 85,
        rating: 4.5,
        reviewCount: 89,
        cooperationYears: 3,
        lastReviewDate: new Date("2024-02-01"),
        nextReviewDate: new Date("2025-02-01"),
        certifications: [],
        products: [
          {
            id: "prod-002",
            supplierId: "sup-002",
            productId: "elec-002",
            productName: "通用电容器",
            productCategory: "电子元件",
            unitPrice: 2.2,
            minOrderQuantity: 500,
            leadTime: 3,
            qualityStandard: "ISO9001",
            certifications: ["RoHS"],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        contracts: [],
        performanceMetrics: {
          deliveryRate: 99.8,
          qualityRate: 97.5,
          responseTime: 1,
          serviceScore: 4.9,
          complaintCount: 1,
          returnRate: 0.1,
          lastUpdated: new Date(),
        },
        riskAssessment: {
          financialRisk: "low",
          operationalRisk: "low",
          complianceRisk: "low",
          marketRisk: "low",
          overallRisk: "low",
          riskFactors: ["交付速度快", "库存充足"],
          mitigationStrategies: ["安全库存管理", "多渠道采购"],
          lastAssessed: new Date("2024-02-01"),
        },
        isActive: true,
        createdAt: new Date("2015-06-01"),
        updatedAt: new Date(),
      },
    ];

    return mockSuppliers;
  }

  /**
   * 构建供应商向量
   */
  private async buildSupplierVectors(
    suppliers: Supplier[]
  ): Promise<Map<string, SupplierVector>> {
    const vectors = new Map<string, SupplierVector>();

    for (const supplier of suppliers) {
      // 检查缓存
      if (this.supplierVectorCache.has(supplier.id)) {
        vectors.set(supplier.id, this.supplierVectorCache.get(supplier.id)!);
        continue;
      }

      try {
        const supplierVector = await this.vectorService.convertSupplierToVector(
          supplier
        );
        vectors.set(supplier.id, supplierVector);
        this.supplierVectorCache.set(supplier.id, supplierVector);
      } catch (error) {
        console.warn(`转换供应商 ${supplier.name} 向量失败:`, error);
      }
    }

    return vectors;
  }

  /**
   * 应用排除列表过滤
   */
  private applyExclusions(
    matches: Array<{ supplierId: string; similarity: number }>,
    excludeSuppliers?: string[]
  ): Array<{ supplierId: string; similarity: number }> {
    if (!excludeSuppliers || excludeSuppliers.length === 0) {
      return matches;
    }

    return matches.filter(
      (match) => !excludeSuppliers.includes(match.supplierId)
    );
  }

  /**
   * 根据请求调整评分权重
   */
  private adjustWeightsForRequest(
    request: MatchSuppliersRequest
  ): ScoringWeights {
    let weights = request.scoringWeights || DEFAULT_SCORING_WEIGHTS;

    // 根据紧急程度调整权重
    if (request.procurementRequest.urgency) {
      weights = this.scoringService.adjustWeightsForUrgency(
        weights,
        request.procurementRequest.urgency
      );
    }

    return weights;
  }

  /**
   * 应用分数阈值过滤
   */
  private applyScoreThreshold(matches: any[], threshold: number): any[] {
    return matches.filter((match) => match.matchScore >= threshold);
  }

  /**
   * 获取服务统计信息
   */
  getStatistics(): any {
    return {
      cachedSuppliers: this.supplierCache.size,
      cachedVectors: this.supplierVectorCache.size,
      logs: this.vectorService.getLogs(),
    };
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.supplierCache.clear();
    this.supplierVectorCache.clear();
    this.vectorService.clearLogs();
  }
}
