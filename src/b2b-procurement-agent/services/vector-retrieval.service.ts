/**
 * 向量检索服务
 * 支持Pinecone和Weaviate两种向量数据库
 */

import { v4 as uuidv4 } from "uuid";
import { Supplier } from "../../supply-chain/models/supplier.model";
import { ParsedProcurementRequest } from "../models/procurement.model";
import {
  EmbeddingConfig,
  MatchLog,
  ProcurementRequestVector,
  SupplierVector,
  VectorDbConfig,
  VectorDbType,
} from "../models/supplier-vector.model";

// Pinecone客户端
let pineconeClient: any = null;
// Weaviate客户端
let weaviateClient: any = null;

export class VectorRetrievalService {
  private config: VectorDbConfig;
  private embeddingConfig: EmbeddingConfig;
  private initialized: boolean = false;
  private logs: MatchLog[] = [];

  constructor(config: VectorDbConfig, embeddingConfig: EmbeddingConfig) {
    this.config = config;
    this.embeddingConfig = embeddingConfig;
  }

  /**
   * 初始化向量数据库连接
   */
  async initialize(): Promise<void> {
    try {
      if (this.config.type === VectorDbType.PINECONE) {
        await this.initializePinecone();
      } else if (this.config.type === VectorDbType.WEAVIATE) {
        await this.initializeWeaviate();
      }

      this.initialized = true;
      console.log(`向量数据库 ${this.config.type} 初始化成功`);
    } catch (error) {
      console.error("向量数据库初始化失败:", error);
      throw error;
    }
  }

  /**
   * 初始化Pinecone
   */
  private async initializePinecone(): Promise<void> {
    const { Pinecone } = await import("@pinecone-database/pinecone");

    pineconeClient = new Pinecone({
      apiKey: this.config.apiKey,
      environment: this.config.environment!,
    });

    // 检查索引是否存在，不存在则创建
    const indexes = await pineconeClient.listIndexes();
    const indexExists = indexes.some(
      (index: any) => index.name === this.config.indexName
    );

    if (!indexExists) {
      await pineconeClient.createIndex({
        name: this.config.indexName,
        dimension: this.config.dimension,
        metric: this.config.metric || "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-west-2",
          },
        },
      });
      console.log(`Pinecone索引 ${this.config.indexName} 创建成功`);
    }
  }

  /**
   * 初始化Weaviate
   */
  private async initializeWeaviate(): Promise<void> {
    const weaviate = await import("weaviate-ts-client");

    weaviateClient = weaviate.client({
      scheme: "https",
      host: this.config.host!,
      apiKey: new weaviate.ApiKey(this.config.apiKey),
    });

    // 检查类是否存在，不存在则创建
    try {
      await weaviateClient.schema
        .classGetter()
        .withClassName("SupplierVector")
        .do();
    } catch (error) {
      // 类不存在，创建新的类
      const classObj = {
        class: "SupplierVector",
        vectorizer: "none", // 我们自己提供向量
        properties: [
          {
            name: "supplierId",
            dataType: ["string"],
          },
          {
            name: "supplierName",
            dataType: ["string"],
          },
          {
            name: "metadata",
            dataType: ["object"],
          },
        ],
      };

      await weaviateClient.schema.classCreator().withClass(classObj).do();
      console.log("Weaviate类 SupplierVector 创建成功");
    }
  }

  /**
   * 将供应商转换为向量表示
   */
  async convertSupplierToVector(supplier: Supplier): Promise<SupplierVector> {
    try {
      // 提取供应商的关键特征
      const features = this.extractSupplierFeatures(supplier);

      // 生成向量嵌入（简化版本，实际应该调用真实的嵌入模型）
      const vector = await this.generateEmbedding(features);

      return {
        supplierId: supplier.id,
        supplierName: supplier.name,
        vector: vector,
        metadata: {
          supplierType: supplier.type,
          country: supplier.country,
          city: supplier.city,
          productCategories: this.extractProductCategories(supplier),
          productKeywords: this.extractProductKeywords(supplier),
          deliveryRate: supplier.performanceMetrics?.deliveryRate || 0,
          qualityRate: supplier.performanceMetrics?.qualityRate || 0,
          serviceScore: supplier.performanceMetrics?.serviceScore || 0,
          creditScore: supplier.creditScore || 0,
          rating: supplier.rating || 0,
          riskLevel: (supplier.riskAssessment?.overallRisk as any) || "low",
          financialRisk:
            (supplier.riskAssessment?.financialRisk as any) || "low",
          operationalRisk:
            (supplier.riskAssessment?.operationalRisk as any) || "low",
          minOrderQuantity: this.calculateMinOrderQuantity(supplier),
          leadTime: this.calculateAverageLeadTime(supplier),
          paymentTerms: this.extractPaymentTerms(supplier),
          lastUpdated: new Date(),
          createdAt: supplier.createdAt,
        },
      };
    } catch (error) {
      console.error("转换供应商向量失败:", error);
      throw error;
    }
  }

  /**
   * 将采购需求转换为向量表示
   */
  async convertProcurementRequestToVector(
    request: ParsedProcurementRequest
  ): Promise<ProcurementRequestVector> {
    try {
      // 提取采购需求的关键特征
      const features = this.extractProcurementFeatures(request);

      // 生成向量嵌入
      const vector = await this.generateEmbedding(features);

      return {
        requestId: request.id,
        vector: vector,
        metadata: {
          productCategories: request.items.map((item) => item.category),
          productKeywords: this.extractRequestKeywords(request),
          urgencyLevel: request.urgency,
          budgetRange: request.budgetRange,
          deliveryLocation: request.deliveryLocation
            ? {
                country: "",
                city: request.deliveryLocation.address,
              }
            : undefined,
          totalQuantity: request.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
          itemCount: request.items.length,
          specialRequirements: request.specialRequirements || [],
          createdAt: request.parsedAt,
        },
      };
    } catch (error) {
      console.error("转换采购需求向量失败:", error);
      throw error;
    }
  }

  /**
   * 存储供应商向量到数据库
   */
  async storeSupplierVector(supplierVector: SupplierVector): Promise<void> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const logEntry: MatchLog = {
        id: uuidv4(),
        requestId: supplierVector.supplierId,
        supplierId: supplierVector.supplierId,
        action: "vector_index",
        details: { supplierName: supplierVector.supplierName },
        timestamp: new Date(),
        success: false,
      };

      const startTime = Date.now();

      if (this.config.type === VectorDbType.PINECONE) {
        await this.storeInPinecone(supplierVector);
      } else if (this.config.type === VectorDbType.WEAVIATE) {
        await this.storeInWeaviate(supplierVector);
      }

      const processingTime = Date.now() - startTime;
      logEntry.processingTimeMs = processingTime;
      logEntry.success = true;

      this.logs.push(logEntry);
      console.log(`供应商向量存储成功: ${supplierVector.supplierName}`);
    } catch (error) {
      console.error("存储供应商向量失败:", error);
      throw error;
    }
  }

  /**
   * 在Pinecone中存储向量
   */
  private async storeInPinecone(supplierVector: SupplierVector): Promise<void> {
    const index = pineconeClient.Index(this.config.indexName);

    await index.upsert([
      {
        id: supplierVector.supplierId,
        values: supplierVector.vector,
        metadata: {
          supplierName: supplierVector.supplierName,
          ...supplierVector.metadata,
        },
      },
    ]);
  }

  /**
   * 在Weaviate中存储向量
   */
  private async storeInWeaviate(supplierVector: SupplierVector): Promise<void> {
    await weaviateClient.data
      .creator()
      .withClassName("SupplierVector")
      .withProperties({
        supplierId: supplierVector.supplierId,
        supplierName: supplierVector.supplierName,
        metadata: supplierVector.metadata,
      })
      .withVector(supplierVector.vector)
      .do();
  }

  /**
   * 基于采购需求向量搜索匹配的供应商
   */
  async searchMatchingSuppliers(
    requestVector: ProcurementRequestVector,
    topK: number = 10
  ): Promise<Array<{ supplierId: string; similarity: number }>> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (this.config.type === VectorDbType.PINECONE) {
        return await this.searchInPinecone(requestVector, topK);
      } else if (this.config.type === VectorDbType.WEAVIATE) {
        return await this.searchInWeaviate(requestVector, topK);
      }

      return [];
    } catch (error) {
      console.error("搜索匹配供应商失败:", error);
      throw error;
    }
  }

  /**
   * 在Pinecone中搜索
   */
  private async searchInPinecone(
    requestVector: ProcurementRequestVector,
    topK: number
  ): Promise<Array<{ supplierId: string; similarity: number }>> {
    const index = pineconeClient.Index(this.config.indexName);

    const queryResponse = await index.query({
      vector: requestVector.vector,
      topK: topK,
      includeMetadata: true,
    });

    return queryResponse.matches.map((match: any) => ({
      supplierId: match.id,
      similarity: match.score,
    }));
  }

  /**
   * 在Weaviate中搜索
   */
  private async searchInWeaviate(
    requestVector: ProcurementRequestVector,
    topK: number
  ): Promise<Array<{ supplierId: string; similarity: number }>> {
    const result = await weaviateClient.graphql
      .get()
      .withClassName("SupplierVector")
      .withFields("supplierId _additional { id certainty }")
      .withNearVector({ vector: requestVector.vector })
      .withLimit(topK)
      .do();

    return result.data.Get.SupplierVector.map((item: any) => ({
      supplierId: item.supplierId,
      similarity: item._additional.certainty,
    }));
  }

  /**
   * 提取供应商特征（用于向量生成）
   */
  private extractSupplierFeatures(supplier: Supplier): string {
    const features = [
      `供应商名称: ${supplier.name}`,
      `供应商类型: ${supplier.type}`,
      `所在国家: ${supplier.country}`,
      `所在城市: ${supplier.city}`,
      `经营范围: ${supplier.businessScope}`,
      `主营产品: ${this.extractProductCategories(supplier).join(", ")}`,
      `成立年份: ${supplier.establishedYear}`,
      `员工数量: ${supplier.employeeCount}`,
    ];

    return features.join(" | ");
  }

  /**
   * 提取采购需求特征（用于向量生成）
   */
  private extractProcurementFeatures(
    request: ParsedProcurementRequest
  ): string {
    const features = [
      `采购物品: ${request.items
        .map((item) => `${item.productName}(${item.category})`)
        .join(", ")}`,
      `紧急程度: ${request.urgency}`,
      `总数量: ${request.items.reduce((sum, item) => sum + item.quantity, 0)}`,
      `特殊要求: ${(request.specialRequirements || []).join(", ")}`,
    ];

    if (request.budgetRange) {
      features.push(
        `预算范围: ${request.budgetRange.min}-${request.budgetRange.max}${request.budgetRange.currency}`
      );
    }

    if (request.deliveryLocation) {
      features.push(`交货地点: ${request.deliveryLocation.address}`);
    }

    return features.join(" | ");
  }

  /**
   * 生成向量嵌入（简化版本）
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // 简化的向量生成逻辑 - 实际应用中应该调用真实的嵌入模型API
    // 如：OpenAI Ada embeddings, Sentence Transformers等

    // 这里使用简单的词频向量化作为演示
    const words = text.toLowerCase().split(/\s+/);
    const vocab = [...new Set(words)].sort();
    const vector = new Array(this.embeddingConfig.dimension).fill(0);

    words.forEach((word) => {
      const index = vocab.indexOf(word) % this.embeddingConfig.dimension;
      if (index >= 0) {
        vector[index] += 1;
      }
    });

    // 归一化向量
    const magnitude = Math.sqrt(
      vector.reduce((sum, val) => sum + val * val, 0)
    );
    if (magnitude > 0) {
      return vector.map((val) => val / magnitude);
    }

    return vector;
  }

  /**
   * 提取产品类别
   */
  private extractProductCategories(supplier: Supplier): string[] {
    if (supplier.products && supplier.products.length > 0) {
      return [...new Set(supplier.products.map((p) => p.productCategory))];
    }
    return [supplier.businessScope]; // 如果没有具体产品，使用经营范围
  }

  /**
   * 提取产品关键词
   */
  private extractProductKeywords(supplier: Supplier): string[] {
    const keywords = new Set<string>();

    if (supplier.products) {
      supplier.products.forEach((product) => {
        keywords.add(product.productName.toLowerCase());
        keywords.add(product.productCategory.toLowerCase());
        if (product.certifications) {
          product.certifications.forEach((cert) =>
            keywords.add(cert.toLowerCase())
          );
        }
      });
    }

    return Array.from(keywords);
  }

  /**
   * 提取采购需求关键词
   */
  private extractRequestKeywords(request: ParsedProcurementRequest): string[] {
    const keywords = new Set<string>();

    request.items.forEach((item) => {
      keywords.add(item.productName.toLowerCase());
      keywords.add(item.category.toLowerCase());
      if (item.specifications) {
        keywords.add(item.specifications.toLowerCase());
      }
    });

    return Array.from(keywords);
  }

  /**
   * 计算最小起订量
   */
  private calculateMinOrderQuantity(supplier: Supplier): number {
    if (supplier.products && supplier.products.length > 0) {
      return Math.min(...supplier.products.map((p) => p.minOrderQuantity));
    }
    return 1;
  }

  /**
   * 计算平均交货周期
   */
  private calculateAverageLeadTime(supplier: Supplier): number {
    if (supplier.products && supplier.products.length > 0) {
      const avg =
        supplier.products.reduce((sum, p) => sum + p.leadTime, 0) /
        supplier.products.length;
      return Math.round(avg);
    }
    return 7; // 默认7天
  }

  /**
   * 提取付款条件
   */
  private extractPaymentTerms(supplier: Supplier): string[] {
    // 这里可以从合同或其他地方提取付款条件
    return ["30天账期", "预付款30%", "货到付款"];
  }

  /**
   * 获取服务日志
   */
  getLogs(): MatchLog[] {
    return [...this.logs];
  }

  /**
   * 清除日志
   */
  clearLogs(): void {
    this.logs = [];
  }
}
