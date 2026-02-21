/**
 * 大模型API集成服务
 * 集成DeepSeek和通义千问双模型
 */

import { supabase } from "@/lib/supabase";
import {
  InputType,
  ParsedProcurementRequest,
  ProcurementItem,
  ProcurementStatus,
  RawProcurementRequest,
  UrgencyLevel,
} from "../models/procurement.model";
import { DemandParserService } from "./demand-parser.service";

// 大模型API接口定义
interface ModelAPI {
  analyze(text: string, context?: any): Promise<ModelAnalysisResult>;
  getName(): string;
  getCostPerCall(): number;
  isAvailable(): boolean;
}

// 分析结果接口
interface ModelAnalysisResult {
  entities: Array<{
    text: string;
    type: string;
    confidence: number;
    position: number;
  }>;
  intent: string;
  sentiment: number;
  keyInfo: Record<string, any>;
  rawResponse: any;
  processingTime: number;
}

// DeepSeek API实现
class DeepSeekAPI implements ModelAPI {
  private apiKey: string;
  private baseUrl: string = "https://api.deepseek.com/v1";

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || "";
  }

  getName(): string {
    return "DeepSeek";
  }

  getCostPerCall(): number {
    return 0.002; // 每次调用约￥0.002
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async analyze(text: string, context?: any): Promise<ModelAnalysisResult> {
    if (!this.isAvailable()) {
      throw new Error("DeepSeek API密钥未配置");
    }

    const startTime = Date.now();

    try {
      const prompt = this.buildPrompt(text, context);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "你是一个专业的采购需求分析助手，请严格按照JSON格式返回分析结果",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API调用失败: ${response.status}`);
      }

      const data = await response.json();
      const result = this.parseResponse(data.choices[0].message.content, text);

      return {
        ...result,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error("DeepSeek分析失败:", error);
      throw error;
    }
  }

  private buildPrompt(text: string, context?: any): string {
    return `
请分析以下采购需求文本，提取关键信息并以JSON格式返回：

需求文本: "${text}"

请提取以下信息：
1. 物品名称和数量
2. 预算范围
3. 紧急程度
4. 特殊要求
5. 交付地点
6. 需求类型判断

返回格式示例：
{
  "items": [
    {
      "name": "物品名称",
      "quantity": 数量,
      "unit": "单位"
    }
  ],
  "budget": {
    "min": 最小值,
    "max": 最大值,
    "currency": "货币"
  },
  "urgency": "紧急程度(low/medium/high/urgent)",
  "requirements": ["要求1", "要求2"],
  "delivery_location": "交付地点",
  "intent_type": "需求类型"
}
`;
  }

  private parseResponse(
    response: string,
    originalText: string
  ): ModelAnalysisResult {
    try {
      const jsonData = JSON.parse(response);
      const entities: ModelAnalysisResult["entities"] = [];

      // 提取物品实体
      if (jsonData.items) {
        jsonData.items.forEach((item: any, index: number) => {
          entities.push({
            text: item.name,
            type: "PRODUCT",
            confidence: 0.9,
            position: originalText.indexOf(item.name),
          });

          entities.push({
            text: item.quantity.toString(),
            type: "QUANTITY",
            confidence: 0.95,
            position: originalText.indexOf(item.quantity.toString()),
          });
        });
      }

      // 提取预算实体
      if (jsonData.budget) {
        entities.push({
          text: jsonData.budget.min.toString(),
          type: "BUDGET_MIN",
          confidence: 0.85,
          position: 0,
        });
      }

      return {
        entities,
        intent: jsonData.intent_type || "procurement",
        sentiment: 0, // DeepSeek主要用于事实分析
        keyInfo: jsonData,
        rawResponse: jsonData,
        processingTime: 0,
      };
    } catch (error) {
      console.error("解析DeepSeek响应失败:", error);
      return {
        entities: [],
        intent: "unknown",
        sentiment: 0,
        keyInfo: {},
        rawResponse: response,
        processingTime: 0,
      };
    }
  }
}

// 通义千问API实现
class QwenAPI implements ModelAPI {
  private apiKey: string;
  private baseUrl: string = "https://dashscope.aliyuncs.com/api/v1";

  constructor() {
    this.apiKey = process.env.QWEN_API_KEY || "";
  }

  getName(): string {
    return "通义千问";
  }

  getCostPerCall(): number {
    return 0.005; // 每次调用约￥0.005
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async analyze(text: string, context?: any): Promise<ModelAnalysisResult> {
    if (!this.isAvailable()) {
      throw new Error("通义千问API密钥未配置");
    }

    const startTime = Date.now();

    try {
      const prompt = this.buildPrompt(text, context);

      const response = await fetch(
        `${this.baseUrl}/services/aigc/text-generation/generation`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "X-DashScope-SSE": "enable",
          },
          body: JSON.stringify({
            model: "qwen-plus",
            input: {
              prompt: prompt,
            },
            parameters: {
              temperature: 0.3,
              max_tokens: 1000,
              result_format: "message",
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`通义千问API调用失败: ${response.status}`);
      }

      const data = await response.json();
      const result = this.parseResponse(data.output.text, text);

      return {
        ...result,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error("通义千问分析失败:", error);
      throw error;
    }
  }

  private buildPrompt(text: string, context?: any): string {
    return `
作为采购需求智能分析专家，请仔细分析以下采购需求：

【需求文本】
${text}

【分析要求】
请从文本中提取以下关键信息：

1. 🔍 **物品识别**
   - 具体物品名称
   - 需求数量
   - 计量单位

2. 💰 **预算信息**
   - 预算金额范围
   - 货币类型

3. ⚡ **紧急程度**
   - 紧急、高、中、低四个等级

4. 📋 **特殊要求**
   - 品牌偏好
   - 质量标准
   - 认证要求

5. 📍 **交付信息**
   - 交付地点
   - 时间要求

请以结构化JSON格式返回分析结果：
{
  "entities": [
    {
      "text": "提取的文本内容",
      "type": "实体类型",
      "confidence": 0.95,
      "position": 10
    }
  ],
  "intent": "采购意图分类",
  "urgency": "紧急程度",
  "budget_range": {
    "min": 最小值,
    "max": 最大值
  },
  "requirements": ["要求1", "要求2"]
}
`;
  }

  private parseResponse(
    response: string,
    originalText: string
  ): ModelAnalysisResult {
    try {
      const jsonData = JSON.parse(response);
      return {
        entities: jsonData.entities || [],
        intent: jsonData.intent || "procurement",
        sentiment: jsonData.sentiment || 0,
        keyInfo: jsonData,
        rawResponse: jsonData,
        processingTime: 0,
      };
    } catch (error) {
      console.error("解析通义千问响应失败:", error);
      return {
        entities: [],
        intent: "unknown",
        sentiment: 0,
        keyInfo: {},
        rawResponse: response,
        processingTime: 0,
      };
    }
  }
}

// 模型编排器
class ModelOrchestrator {
  private models: ModelAPI[];
  private ruleBasedParser: DemandParserService;

  constructor() {
    this.models = [new DeepSeekAPI(), new QwenAPI()];
    this.ruleBasedParser = new DemandParserService();
  }

  async processRequest(
    text: string,
    context?: any
  ): Promise<{
    primary: ModelAnalysisResult;
    secondary?: ModelAnalysisResult;
    fusion: ModelAnalysisResult;
    selectedModel: string;
  }> {
    // 智能路由选择最佳模型
    const primaryModel = this.selectPrimaryModel(text);
    const secondaryModel = this.models.find(
      (m) => m.getName() !== primaryModel.getName()
    );

    try {
      // 主模型分析
      const primaryResult = await primaryModel.analyze(text, context);

      // 次要模型分析（可选）
      let secondaryResult: ModelAnalysisResult | undefined;
      if (
        secondaryModel &&
        secondaryModel.isAvailable() &&
        this.shouldUseSecondary(text)
      ) {
        secondaryResult = await secondaryModel.analyze(text, context);
      }

      // 结果融合
      const fusionResult = this.fuseResults(
        primaryResult,
        secondaryResult,
        text
      );

      return {
        primary: primaryResult,
        secondary: secondaryResult,
        fusion: fusionResult,
        selectedModel: primaryModel.getName(),
      };
    } catch (error) {
      console.warn("大模型分析失败，回退到规则引擎:", error);
      // 回退到纯规则引擎
      const fallbackResult = await this.ruleBasedFallback(text);
      return {
        primary: fallbackResult,
        fusion: fallbackResult,
        selectedModel: "Rule Engine",
      };
    }
  }

  private selectPrimaryModel(text: string): ModelAPI {
    // 根据文本特征选择最优模型
    const technicalKeywords = ["服务器", "配置", "处理器", "内存", "存储"];
    const businessKeywords = ["采购", "预算", "交付", "合同", "供应商"];

    const technicalScore = technicalKeywords.filter((keyword) =>
      text.includes(keyword)
    ).length;
    const businessScore = businessKeywords.filter((keyword) =>
      text.includes(keyword)
    ).length;

    // 技术类需求优先DeepSeek，业务类需求优先通义千问
    if (technicalScore > businessScore) {
      return this.models[0]; // DeepSeek
    } else {
      return this.models[1]; // 通义千问
    }
  }

  private shouldUseSecondary(text: string): boolean {
    // 复杂需求或高价值需求使用双模型
    return text.length > 100 || text.includes("预算") || text.includes("紧急");
  }

  private fuseResults(
    primary: ModelAnalysisResult,
    secondary: ModelAnalysisResult | undefined,
    text: string
  ): ModelAnalysisResult {
    if (!secondary) {
      return primary;
    }

    // 置信度加权融合
    const primaryWeight = 0.6;
    const secondaryWeight = 0.4;

    // 融合实体识别结果
    const fusedEntities = this.fuseEntities(
      primary.entities,
      secondary.entities
    );

    // 融合关键信息
    const fusedKeyInfo = this.fuseKeyInfo(primary.keyInfo, secondary.keyInfo);

    // 计算融合后的置信度
    const fusedConfidence = Math.min(
      1,
      (primary.entities.reduce((sum, e) => sum + e.confidence, 0) /
        Math.max(primary.entities.length, 1)) *
        primaryWeight +
        (secondary.entities.reduce((sum, e) => sum + e.confidence, 0) /
          Math.max(secondary.entities.length, 1)) *
          secondaryWeight
    );

    return {
      entities: fusedEntities,
      intent: primary.intent || secondary.intent || "procurement",
      sentiment: (primary.sentiment + secondary.sentiment) / 2,
      keyInfo: fusedKeyInfo,
      rawResponse: {
        primary: primary.rawResponse,
        secondary: secondary.rawResponse,
        fusion_method: "weighted_average",
      },
      processingTime: Math.max(
        primary.processingTime,
        secondary.processingTime
      ),
    };
  }

  /**
   * 融合实体识别结果
   */
  private fuseEntities(
    primaryEntities: ModelAnalysisResult["entities"],
    secondaryEntities: ModelAnalysisResult["entities"]
  ): ModelAnalysisResult["entities"] {
    const fused: ModelAnalysisResult["entities"] = [];

    // 添加主模型的所有实体
    fused.push(...primaryEntities);

    // 添加次模型的高置信度实体（避免重复）
    secondaryEntities.forEach((secEntity) => {
      const isDuplicate = primaryEntities.some(
        (primEntity) =>
          primEntity.text === secEntity.text &&
          primEntity.type === secEntity.type
      );

      if (!isDuplicate && secEntity.confidence > 0.7) {
        fused.push({
          ...secEntity,
          confidence: secEntity.confidence * 0.8, // 降低次模型实体的置信度
        });
      }
    });

    return fused;
  }

  /**
   * 融合关键信息
   */
  private fuseKeyInfo(
    primaryInfo: Record<string, any>,
    secondaryInfo: Record<string, any>
  ): Record<string, any> {
    const fused: Record<string, any> = {};

    // 合并所有键
    const allKeys = new Set([
      ...Object.keys(primaryInfo),
      ...Object.keys(secondaryInfo),
    ]);

    allKeys.forEach((key) => {
      const primaryValue = primaryInfo[key];
      const secondaryValue = secondaryInfo[key];

      if (primaryValue !== undefined && secondaryValue !== undefined) {
        // 两个模型都有值，选择更合理的
        if (Array.isArray(primaryValue) && Array.isArray(secondaryValue)) {
          // 数组合并去重
          fused[key] = [...new Set([...primaryValue, ...secondaryValue])];
        } else if (
          typeof primaryValue === "object" &&
          typeof secondaryValue === "object"
        ) {
          // 对象合并
          fused[key] = { ...primaryValue, ...secondaryValue };
        } else {
          // 简单值，选择主模型的
          fused[key] = primaryValue;
        }
      } else {
        // 只有一个模型有值
        fused[key] = primaryValue !== undefined ? primaryValue : secondaryValue;
      }
    });

    return fused;
  }

  private async ruleBasedFallback(text: string): Promise<ModelAnalysisResult> {
    // 使用现有规则引擎作为兜底
    const mockRawRequest: RawProcurementRequest = {
      id: "fallback_" + Date.now(),
      companyId: "fallback",
      requesterId: "fallback",
      input: text,
      inputType: InputType.TEXT,
      rawDescription: text,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const ruleResult = await this.ruleBasedParser.parseDemand(mockRawRequest);

    return {
      entities: ruleResult.items.map((item) => ({
        text: item.productName,
        type: "PRODUCT",
        confidence: ruleResult.aiConfidence / 100,
        position: text.indexOf(item.productName),
      })),
      intent: "procurement",
      sentiment: 0,
      keyInfo: {
        items: ruleResult.items,
        urgency: ruleResult.urgency,
        budget: ruleResult.budgetRange,
      },
      rawResponse: ruleResult,
      processingTime: ruleResult.processingTimeMs,
    };
  }
}

// 主服务类
export class LargeModelProcurementService {
  private orchestrator: ModelOrchestrator;
  private supabase = supabase;

  constructor() {
    this.orchestrator = new ModelOrchestrator();
  }

  async parseDemand(
    rawRequest: RawProcurementRequest
  ): Promise<ParsedProcurementRequest> {
    const startTime = Date.now();

    try {
      // 调用大模型编排器
      const { primary, secondary, fusion, selectedModel } =
        await this.orchestrator.processRequest(
          rawRequest.rawDescription || rawRequest.input,
          {
            companyId: rawRequest.companyId,
            requesterId: rawRequest.requesterId,
          }
        );

      // 构建最终结果
      const parsedRequest = this.buildParsedRequest(
        fusion,
        rawRequest,
        selectedModel
      );

      // 记录处理日志
      await this.logProcessing(
        rawRequest.id,
        "large_model_parsing",
        {
          selectedModel,
          primaryResult: primary,
          secondaryResult: secondary,
          fusionResult: fusion,
        },
        parsedRequest,
        Date.now() - startTime,
        true
      );

      return parsedRequest;
    } catch (error) {
      console.error("大模型解析失败:", error);

      await this.logProcessing(
        rawRequest.id,
        "large_model_parsing",
        { error: error instanceof Error ? error.message : "未知错误" },
        null,
        Date.now() - startTime,
        false
      );

      throw error;
    }
  }

  private buildParsedRequest(
    analysis: ModelAnalysisResult,
    rawRequest: RawProcurementRequest,
    modelUsed: string
  ): ParsedProcurementRequest {
    const items: ProcurementItem[] = [];

    // 从分析结果构建物品列表
    const productEntities = analysis.entities.filter(
      (e) => e.type === "PRODUCT"
    );
    const quantityEntities = analysis.entities.filter(
      (e) => e.type === "QUANTITY"
    );

    // 如果有明确的产品实体，使用它们
    if (productEntities.length > 0) {
      productEntities.forEach((product, index) => {
        const quantity = quantityEntities[index] || {
          text: "1",
          confidence: 0.5,
        };

        items.push({
          id: `item_${Date.now()}_${index}`,
          productId: `prod_${this.generateProductId(product.text)}`,
          productName: product.text,
          category: this.categorizeProduct(product.text),
          quantity: this.parseQuantity(quantity.text),
          unit: this.inferUnit(this.categorizeProduct(product.text)),
          specifications: this.extractSpecifications(analysis, product.text),
          requiredQuality: this.extractQualityRequirement(analysis),
        });
      });
    }

    // 如果没有识别到物品，尝试从JSON结果中提取
    if (items.length === 0 && analysis.keyInfo.items) {
      const jsonItems = Array.isArray(analysis.keyInfo.items)
        ? analysis.keyInfo.items
        : [analysis.keyInfo.items];
      jsonItems.forEach((item: any, index: number) => {
        if (item.name) {
          items.push({
            id: `item_json_${Date.now()}_${index}`,
            productId: `prod_${this.generateProductId(item.name)}`,
            productName: item.name,
            category: item.category || this.categorizeProduct(item.name),
            quantity: this.parseQuantity(item.quantity || "1"),
            unit:
              item.unit ||
              this.inferUnit(
                item.category || this.categorizeProduct(item.name)
              ),
            specifications: item.specifications || "",
            requiredQuality: item.quality || "standard",
          });
        }
      });
    }

    // 如果仍然没有物品，使用默认项
    if (items.length === 0) {
      items.push({
        id: `item_default_${Date.now()}`,
        productId: "generic_item",
        productName: "通用物品",
        category: "general",
        quantity: 1,
        unit: "件",
        specifications:
          rawRequest.rawDescription ||
          rawRequest.extractedContent ||
          rawRequest.input,
        requiredQuality: "standard",
      });
    }

    return {
      id: `parsed_${rawRequest.id}`,
      rawRequestId: rawRequest.id,
      companyId: rawRequest.companyId,
      requesterId: rawRequest.requesterId,
      inputType: rawRequest.inputType,
      items,
      urgency: this.extractUrgency(analysis),
      budgetRange: this.extractBudget(analysis),
      deliveryDeadline: this.extractDeliveryDeadline(analysis),
      deliveryLocation: this.extractDeliveryLocation(analysis),
      specialRequirements: this.extractRequirements(analysis),
      imageUrl: rawRequest.imageUrl,
      sourceUrl: rawRequest.sourceUrl,
      extractedContent: rawRequest.extractedContent,
      processingContext: {
        modelUsed,
        confidenceLevel: this.determineConfidenceLevel(
          this.calculateConfidence(analysis)
        ),
        processingSteps: ["大模型分析", "结果解析", "结构化转换"],
      },
      status: ProcurementStatus.PROCESSING,
      aiConfidence: this.calculateConfidence(analysis),
      parsedAt: new Date(),
      processingTimeMs: analysis.processingTime,
    };
  }

  private generateProductId(productName: string): string {
    // 生成标准化的产品ID
    return productName
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, "_")
      .substring(0, 50);
  }

  private parseQuantity(quantityText: string): number {
    // 解析数量，处理中文数字
    const chineseNumbers: Record<string, number> = {
      一: 1,
      二: 2,
      三: 3,
      四: 4,
      五: 5,
      六: 6,
      七: 7,
      八: 8,
      九: 9,
      十: 10,
    };

    const lowerText = quantityText.toLowerCase();

    // 检查中文数字
    for (const [chinese, num] of Object.entries(chineseNumbers)) {
      if (lowerText.includes(chinese)) {
        return num;
      }
    }

    // 检查阿拉伯数字
    const numberMatch = lowerText.match(/\d+/);
    if (numberMatch) {
      return parseInt(numberMatch[0]);
    }

    return 1; // 默认数量
  }

  private extractSpecifications(
    analysis: ModelAnalysisResult,
    productName: string
  ): string {
    // 从分析结果中提取规格信息
    const specs: string[] = [];

    // 查找与产品相关的规格实体
    const specEntities = analysis.entities.filter(
      (e) => e.type === "SPECIFICATION" || e.type === "BRAND"
    );

    specEntities.forEach((entity) => {
      specs.push(entity.text);
    });

    // 从keyInfo中提取规格
    if (analysis.keyInfo.requirements) {
      const reqArray = Array.isArray(analysis.keyInfo.requirements)
        ? analysis.keyInfo.requirements
        : [analysis.keyInfo.requirements];

      reqArray.forEach((req) => {
        if (typeof req === "string" && req.length > 0) {
          specs.push(req);
        }
      });
    }

    return specs.join("; ") || "标准规格";
  }

  private extractQualityRequirement(analysis: ModelAnalysisResult): string {
    // 提取质量要求
    const qualityKeywords = ["正品", "原厂", "品牌", "认证", "质量"];
    const text = JSON.stringify(analysis.keyInfo).toLowerCase();

    for (const keyword of qualityKeywords) {
      if (text.includes(keyword)) {
        return "high";
      }
    }

    return "standard";
  }

  private extractDeliveryDeadline(
    analysis: ModelAnalysisResult
  ): Date | undefined {
    // 提取交付截止时间
    if (analysis.keyInfo.delivery_info?.deadline) {
      try {
        return new Date(analysis.keyInfo.delivery_info.deadline);
      } catch {
        // 如果日期解析失败，返回undefined
      }
    }
    return undefined;
  }

  private extractDeliveryLocation(
    analysis: ModelAnalysisResult
  ): ParsedProcurementRequest["deliveryLocation"] {
    // 提取交付地点
    const location =
      analysis.keyInfo.delivery_info?.location ||
      analysis.keyInfo.delivery_location;
    if (location) {
      return {
        address: location,
      };
    }
    return undefined;
  }

  private determineConfidenceLevel(confidence: number): string {
    if (confidence >= 90) return "Excellent";
    if (confidence >= 80) return "Good";
    if (confidence >= 70) return "Fair";
    if (confidence >= 60) return "Poor";
    return "Very Poor";
  }

  private categorizeProduct(productText: string): string {
    const lowerText = productText.toLowerCase();

    if (
      lowerText.includes("电脑") ||
      lowerText.includes("计算机") ||
      lowerText.includes("笔记本")
    ) {
      return "computer";
    } else if (lowerText.includes("手机") || lowerText.includes("移动")) {
      return "mobile";
    } else if (lowerText.includes("服务器") || lowerText.includes("主机")) {
      return "server";
    } else if (lowerText.includes("显示器") || lowerText.includes("屏幕")) {
      return "display";
    }

    return "general";
  }

  private inferUnit(category: string): string {
    const unitMap: Record<string, string> = {
      computer: "台",
      mobile: "部",
      server: "台",
      display: "台",
      printer: "台",
      network: "台",
      storage: "个",
    };

    return unitMap[category] || "件";
  }

  private extractUrgency(analysis: ModelAnalysisResult): UrgencyLevel {
    const urgency = analysis.keyInfo.urgency?.toLowerCase();

    switch (urgency) {
      case "urgent":
        return UrgencyLevel.URGENT;
      case "high":
        return UrgencyLevel.HIGH;
      case "low":
        return UrgencyLevel.LOW;
      default:
        return UrgencyLevel.MEDIUM;
    }
  }

  private extractBudget(
    analysis: ModelAnalysisResult
  ): ParsedProcurementRequest["budgetRange"] {
    const budget = analysis.keyInfo.budget_range;
    if (budget && budget.min && budget.max) {
      return {
        min: budget.min,
        max: budget.max,
        currency: "CNY",
      };
    }
    return undefined;
  }

  private extractRequirements(analysis: ModelAnalysisResult): string[] {
    return analysis.keyInfo.requirements || [];
  }

  private calculateConfidence(analysis: ModelAnalysisResult): number {
    // 基于实体置信度和模型选择计算总体置信度
    const avgEntityConfidence =
      analysis.entities.length > 0
        ? analysis.entities.reduce((sum, e) => sum + e.confidence, 0) /
          analysis.entities.length
        : 0.5;

    // 大模型通常比规则引擎置信度更高
    return Math.min(100, Math.round(avgEntityConfidence * 100 + 10));
  }

  private async logProcessing(
    requestId: string,
    step: string,
    input: any,
    output: any,
    processingTime: number,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    try {
      await this.supabase.from("processing_logs").insert({
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        request_id: requestId,
        processing_step: step,
        input: input,
        output: output,
        processing_time_ms: processingTime,
        success: success,
        error_message: errorMessage,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("记录处理日志失败:", error);
    }
  }

  /**
   * 健康检查方法
   * 检查大模型服务的可用性和配置状态
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    message: string;
    details?: any;
  }> {
    try {
      const healthDetails: any = {
        timestamp: new Date().toISOString(),
        models: [],
      };

      // 检查DeepSeek API
      const deepSeekAPI = new DeepSeekAPI();
      const deepSeekHealthy = deepSeekAPI.isAvailable();
      healthDetails.models.push({
        name: "DeepSeek",
        available: deepSeekHealthy,
        costPerCall: deepSeekAPI.getCostPerCall(),
      });

      // 检查通义千问 API
      const qwenAPI = new QwenAPI();
      const qwenHealthy = qwenAPI.isAvailable();
      healthDetails.models.push({
        name: "通义千问",
        available: qwenHealthy,
        costPerCall: qwenAPI.getCostPerCall(),
      });

      // 检查至少有一个模型可用
      const atLeastOneAvailable = deepSeekHealthy || qwenHealthy;

      if (!atLeastOneAvailable) {
        return {
          healthy: false,
          message: "没有配置可用的大模型API密钥",
          details: healthDetails,
        };
      }

      // 检查数据库连接
      try {
        const { data, error } = await this.supabase
          .from("system_config")
          .select("key")
          .limit(1);

        if (error) {
          healthDetails.database = { connected: false, error: error.message };
        } else {
          healthDetails.database = { connected: true };
        }
      } catch (dbError) {
        healthDetails.database = {
          connected: false,
          error: dbError instanceof Error ? dbError.message : "未知数据库错误",
        };
      }

      return {
        healthy: true,
        message: "大模型服务运行正常",
        details: healthDetails,
      };
    } catch (error) {
      return {
        healthy: false,
        message: `健康检查失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`,
      };
    }
  }
}
