# B2B采购智能体技术架构规范（FixCycle 4.0）

## 概述

本文档详细描述 FixCycle 4.0 B2B采购智能体的完整技术架构设计，涵盖从需求理解到智能决策的全链路AI驱动采购流程。

## 系统架构总览

### 整体架构模式
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   用户交互层    │────│   AI代理引擎层   │────│   数据服务层    │
│ (Web/API/UI)    │    │ (LLM + Agents)   │    │ (Vector DB)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   供应商网络    │    │   决策引擎层     │    │   外部服务层    │
│   匹配系统      │────│ (规则 + ML)      │────│ (API集成)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   风控监控      │    │   流程编排层     │    │   监控分析层    │
│   系统          │────│ (Workflow)       │────│ (Analytics)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 核心技术栈

### AI与机器学习
- **大语言模型**: DeepSeek API (主力) + OpenAI API (备用)
- **向量数据库**: Pinecone (供应商匹配) + Weaviate (语义搜索)
- **机器学习框架**: TensorFlow.js / ONNX Runtime
- **自然语言处理**: LangChain + Transformers

### 后端技术栈
- **运行环境**: Node.js 18+/20+
- **Web框架**: Next.js 14 (App Router)
- **编程语言**: TypeScript 5.0+
- **数据库**: Supabase PostgreSQL
- **缓存**: Redis 7.x
- **消息队列**: BullMQ (Redis-backed)
- **工作流引擎**: Temporal.io 或自研状态机

### 外部服务集成
- **商业数据**: 企查查/天眼查 API
- **汇率服务**: ExchangeRate-API
- **通讯服务**: Twilio (短信/邮件通知)
- **文档处理**: Google Vision API (图片识别)

## 模块详细设计

### 1. 需求理解与结构化引擎

#### 1.1 多模态需求解析
```typescript
// src/lib/procurement/request-parser.ts
interface ProcurementRequest {
  id: string;
  buyerId: string;
  rawInput: string | File | Link;
  inputType: 'text' | 'image' | 'link';
  parsedRequirements: ParsedRequirements;
  confidence: number;
  createdAt: Date;
}

interface ParsedRequirements {
  items: ProcurementItem[];
  quantities: Map<string, number>;
  specifications: ItemSpecifications[];
  deliveryRequirements: DeliveryRequirements;
  budgetConstraints: BudgetConstraints;
  timeline: TimelineRequirements;
}

class MultiModalRequestParser {
  private llmClient: DeepSeekClient;
  private visionProcessor: VisionProcessor;
  private linkExtractor: LinkExtractor;

  async parseRequest(input: string | File | Link): Promise<ParsedRequirements> {
    switch (this.getInputType(input)) {
      case 'text':
        return await this.parseTextRequest(input as string);
      case 'image':
        return await this.parseImageRequest(input as File);
      case 'link':
        return await this.parseLinkRequest(input as string);
      default:
        throw new Error('Unsupported input type');
    }
  }

  private async parseTextRequest(text: string): Promise<ParsedRequirements> {
    const prompt = `
    请分析以下采购需求，提取结构化信息：
    
    需求文本：${text}
    
    请按以下JSON格式返回：
    {
      "items": [{"name": "商品名称", "category": "类别", "description": "描述"}],
      "quantities": {"商品名称": 数量},
      "specifications": [{"item": "商品名称", "specs": "规格要求"}],
      "delivery": {"location": "交货地点", "timeline": "时间要求"},
      "budget": {"range": "预算范围", "currency": "货币"}
    }
    `;

    const response = await this.llmClient.chatCompletion({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    });

    return this.validateAndStructure(JSON.parse(response.content));
  }

  private async parseImageRequest(image: File): Promise<ParsedRequirements> {
    // 1. 图像预处理
    const processedImage = await this.preprocessImage(image);
    
    // 2. OCR文字识别
    const ocrText = await this.visionProcessor.extractText(processedImage);
    
    // 3. 商品识别
    const items = await this.visionProcessor.identifyProducts(processedImage);
    
    // 4. 结构化处理
    return await this.parseTextRequest(ocrText + '\n' + JSON.stringify(items));
  }

  private async parseLinkRequest(url: string): Promise<ParsedRequirements> {
    // 1. 网页内容抓取
    const content = await this.linkExtractor.extractContent(url);
    
    // 2. 内容分析
    const analysis = await this.analyzePageContent(content);
    
    // 3. 需求提取
    return await this.parseTextRequest(analysis.text);
  }
}
```

### 2. 供应商智能匹配系统

#### 2.1 向量检索与多因子评分
```typescript
// src/lib/procurement/supplier-matcher.ts
interface SupplierProfile {
  id: string;
  companyName: string;
  capabilities: string[];
  productCategories: string[];
  certifications: string[];
  responseTime: number; // 小时
  minOrderQuantity: number;
  leadTime: number; // 天
  reliabilityScore: number; // 0-1
  priceCompetitiveness: number; // 0-1
  geographicCoverage: string[];
  languages: string[];
}

interface MatchResult {
  supplier: SupplierProfile;
  score: number;
  matchingFactors: MatchingFactors;
  confidence: number;
}

class IntelligentSupplierMatcher {
  private vectorStore: PineconeClient;
  private embeddingModel: EmbeddingModel;

  async findBestSuppliers(
    requirements: ParsedRequirements,
    limit: number = 10
  ): Promise<MatchResult[]> {
    // 1. 生成需求向量
    const requirementEmbedding = await this.generateRequirementEmbedding(requirements);

    // 2. 向量相似度检索
    const vectorMatches = await this.vectorStore.query({
      vector: requirementEmbedding,
      topK: limit * 2, // 多检索一些用于后续过滤
      includeMetadata: true
    });

    // 3. 多因子评分
    const scoredSuppliers = await Promise.all(
      vectorMatches.matches.map(async (match) => {
        const supplier = match.metadata as SupplierProfile;
        const score = await this.calculateMultiFactorScore(supplier, requirements);
        return { supplier, score, confidence: match.score };
      })
    );

    // 4. 排序和过滤
    return scoredSuppliers
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async calculateMultiFactorScore(
    supplier: SupplierProfile,
    requirements: ParsedRequirements
  ): Promise<number> {
    const factors = {
      // 类别匹配度 (权重: 0.3)
      categoryMatch: this.calculateCategoryMatch(
        supplier.productCategories,
        requirements.items.map(item => item.category)
      ),

      // 能力匹配度 (权重: 0.25)
      capabilityMatch: this.calculateCapabilityMatch(
        supplier.capabilities,
        requirements.specifications
      ),

      // 价格竞争力 (权重: 0.2)
      priceCompetitiveness: supplier.priceCompetitiveness,

      // 可靠性评分 (权重: 0.15)
      reliability: supplier.reliabilityScore,

      // 响应速度 (权重: 0.1)
      responsiveness: this.calculateResponsivenessScore(supplier.responseTime)
    };

    // 加权平均
    return Object.entries(factors).reduce((total, [factor, weight]) => {
      const factorWeight = this.getFactorWeight(factor as keyof typeof factors);
      return total + (factors[factor as keyof typeof factors] * factorWeight);
    }, 0);
  }

  private calculateCategoryMatch(
    supplierCategories: string[],
    requiredCategories: string[]
  ): number {
    const intersection = supplierCategories.filter(cat => 
      requiredCategories.some(reqCat => 
        this.semanticSimilarity(cat, reqCat) > 0.8
      )
    );
    
    return intersection.length / Math.max(requiredCategories.length, 1);
  }
}
```

### 3. 自动询价与比价平台

#### 3.1 批量询价流程编排
```typescript
// src/lib/procurement/quotation-manager.ts
interface QuotationRequest {
  requestId: string;
  suppliers: SupplierProfile[];
  items: ProcurementItem[];
  specifications: ItemSpecifications[];
  deliveryRequirements: DeliveryRequirements;
}

interface SupplierQuote {
  supplierId: string;
  items: QuoteItem[];
  totalPrice: number;
  currency: string;
  validityPeriod: DateRange;
  terms: PaymentTerms;
  deliveryTime: number; // 天
  remarks: string;
}

class AutomatedQuotationManager {
  private workflowEngine: WorkflowEngine;
  private communicationService: CommunicationService;

  async requestQuotes(request: QuotationRequest): Promise<QuotationResponse> {
    // 1. 创建询价工作流
    const workflow = await this.workflowEngine.createWorkflow({
      type: 'bulk_quotation_request',
      data: request,
      timeout: 72 * 60 * 60 * 1000 // 72小时超时
    });

    // 2. 并行发送询价请求
    const quotePromises = request.suppliers.map(supplier =>
      this.sendQuotationRequest(workflow.id, supplier, request)
    );

    // 3. 等待并收集报价
    const quotes = await Promise.allSettled(quotePromises);
    
    // 4. 处理结果
    const successfulQuotes = quotes
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    const failedQuotes = quotes
      .filter(result => result.status === 'rejected')
      .map((result, index) => ({
        supplier: request.suppliers[index],
        error: result.reason
      }));

    // 5. 生成比价报告
    const comparisonReport = await this.generateComparisonReport(successfulQuotes);

    return {
      workflowId: workflow.id,
      quotes: successfulQuotes,
      failures: failedQuotes,
      comparisonReport,
      summary: this.generateSummary(successfulQuotes, failedQuotes)
    };
  }

  private async sendQuotationRequest(
    workflowId: string,
    supplier: SupplierProfile,
    request: QuotationRequest
  ): Promise<SupplierQuote> {
    // 1. 生成标准化询价单
    const quotationDocument = this.generateQuotationTemplate({
      supplier,
      request
    });

    // 2. 多渠道发送（API/邮件/短信）
    const channels = this.determineCommunicationChannels(supplier);
    
    let response: SupplierQuote | null = null;
    for (const channel of channels) {
      try {
        response = await this.sendViaChannel(channel, quotationDocument);
        if (response) break;
      } catch (error) {
        this.logger.warn(`通过${channel}发送询价失败`, error);
      }
    }

    if (!response) {
      throw new Error(`无法从供应商${supplier.companyName}获得报价`);
    }

    // 3. 验证报价完整性
    await this.validateQuote(response, request);

    return response;
  }

  private async generateComparisonReport(quotes: SupplierQuote[]): Promise<ComparisonReport> {
    // 1. 价格标准化（统一货币）
    const standardizedQuotes = await this.standardizeCurrencies(quotes);

    // 2. 关键指标计算
    const metrics = this.calculateKeyMetrics(standardizedQuotes);

    // 3. 风险评估
    const riskAssessments = await Promise.all(
      standardizedQuotes.map(quote => this.assessQuoteRisk(quote))
    );

    // 4. 生成可视化报告
    return {
      quotes: standardizedQuotes,
      metrics,
      riskAssessments,
      recommendations: this.generateRecommendations(metrics, riskAssessments),
      visualization: await this.createVisualizationData(standardizedQuotes)
    };
  }
}
```

### 4. 智能议价与下单系统

#### 4.1 议价策略引擎
```typescript
// src/lib/procurement/negotiation-engine.ts
interface NegotiationStrategy {
  type: 'aggressive' | 'conservative' | 'balanced';
  targetDiscount: number; // 目标折扣百分比
  minimumAcceptable: number; // 最低可接受价格
  escalationThreshold: number; // 升级阈值
  timePressure: 'high' | 'medium' | 'low';
}

interface NegotiationContext {
  supplier: SupplierProfile;
  item: ProcurementItem;
  currentQuote: SupplierQuote;
  marketPrice: number;
  historicalData: HistoricalTransaction[];
  urgencyLevel: number;
}

class IntelligentNegotiationEngine {
  private strategyRepository: StrategyRepository;
  private mlModel: NegotiationMLModel;

  async negotiateBestPrice(
    context: NegotiationContext
  ): Promise<NegotiationOutcome> {
    // 1. 选择议价策略
    const strategy = await this.selectOptimalStrategy(context);

    // 2. 制定议价方案
    const proposal = await this.formulateProposal(context, strategy);

    // 3. 执行议价流程
    const outcome = await this.executeNegotiation(proposal, context);

    // 4. 学习和优化
    await this.learnFromOutcome(outcome, context);

    return outcome;
  }

  private async selectOptimalStrategy(
    context: NegotiationContext
  ): Promise<NegotiationStrategy> {
    // 基于机器学习模型选择最佳策略
    const features = this.extractFeatures(context);
    const prediction = await this.mlModel.predict(features);

    return {
      type: prediction.strategy_type,
      targetDiscount: prediction.target_discount,
      minimumAcceptable: prediction.min_acceptable,
      escalationThreshold: prediction.escalation_threshold,
      timePressure: prediction.time_pressure
    };
  }

  private async formulateProposal(
    context: NegotiationContext,
    strategy: NegotiationStrategy
  ): Promise<NegotiationProposal> {
    const baselinePrice = context.currentQuote.totalPrice;
    const marketPrice = context.marketPrice;
    
    // 计算合理议价区间
    const reasonableRange = this.calculateReasonableRange(
      baselinePrice,
      marketPrice,
      context.historicalData
    );

    // 根据策略调整目标价格
    const targetPrice = baselinePrice * (1 - strategy.targetDiscount / 100);
    
    // 确保在合理范围内
    const finalTarget = Math.max(targetPrice, reasonableRange.min);

    return {
      targetPrice: finalTarget,
      justification: this.generateJustification(context, strategy),
      alternatives: this.generateAlternativeProposals(context, strategy),
      deadline: this.calculateDeadline(strategy, context.urgencyLevel)
    };
  }

  private async executeNegotiation(
    proposal: NegotiationProposal,
    context: NegotiationContext
  ): Promise<NegotiationOutcome> {
    let currentRound = 1;
    let currentPrice = context.currentQuote.totalPrice;
    const maxRounds = 5;

    while (currentRound <= maxRounds && currentPrice > proposal.targetPrice) {
      // 发送议价请求
      const counterOffer = await this.sendCounterOffer(
        context.supplier,
        currentPrice,
        proposal
      );

      if (counterOffer.accepted) {
        return {
          success: true,
          finalPrice: counterOffer.price,
          discountAchieved: ((context.currentQuote.totalPrice - counterOffer.price) / context.currentQuote.totalPrice) * 100,
          rounds: currentRound,
          terms: counterOffer.terms
        };
      }

      // 评估是否接受新价格
      if (this.shouldAccept(counterOffer.price, proposal, currentRound)) {
        return {
          success: true,
          finalPrice: counterOffer.price,
          discountAchieved: ((context.currentQuote.totalPrice - counterOffer.price) / context.currentQuote.totalPrice) * 100,
          rounds: currentRound,
          terms: counterOffer.terms
        };
      }

      // 准备下一轮议价
      currentPrice = counterOffer.price;
      proposal = this.adjustProposal(proposal, counterOffer, currentRound);
      currentRound++;
    }

    return {
      success: false,
      reason: '未能达成协议',
      finalPrice: context.currentQuote.totalPrice,
      rounds: currentRound - 1
    };
  }
}
```

### 5. 供应商风险预警系统

#### 5.1 实时风险监控
```typescript
// src/lib/procurement/risk-monitor.ts
interface RiskIndicator {
  type: 'financial' | 'operational' | 'compliance' | 'market';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  confidence: number;
  source: string;
}

interface SupplierRiskProfile {
  supplierId: string;
  overallRiskScore: number; // 0-100
  riskIndicators: RiskIndicator[];
  lastAssessment: Date;
  trend: 'improving' | 'stable' | 'deteriorating';
}

class SupplierRiskMonitor {
  private externalDataSources: ExternalDataSource[];
  private riskRules: RiskRule[];
  private notificationService: NotificationService;

  async assessSupplierRisk(supplierId: string): Promise<SupplierRiskProfile> {
    // 1. 收集多源数据
    const dataSources = await this.collectSupplierData(supplierId);

    // 2. 应用风险规则
    const indicators = await this.evaluateRiskIndicators(dataSources);

    // 3. 计算综合风险评分
    const riskScore = this.calculateRiskScore(indicators);

    // 4. 生成风险档案
    const riskProfile: SupplierRiskProfile = {
      supplierId,
      overallRiskScore: riskScore,
      riskIndicators: indicators,
      lastAssessment: new Date(),
      trend: await this.calculateRiskTrend(supplierId, riskScore)
    };

    // 5. 触发预警（如有必要）
    if (riskScore > 70) {
      await this.triggerRiskAlert(supplierId, riskProfile);
    }

    return riskProfile;
  }

  private async collectSupplierData(supplierId: string): Promise<DataSource[]> {
    const sources = [
      // 企业工商信息
      this.getExternalData('business_registry', supplierId),
      
      // 财务状况
      this.getExternalData('financial_reports', supplierId),
      
      // 法律诉讼
      this.getExternalData('legal_records', supplierId),
      
      // 行业舆情
      this.getExternalData('news_sentiment', supplierId),
      
      // 内部交易数据
      this.getInternalData('transaction_history', supplierId),
      
      // 质量投诉
      this.getInternalData('quality_issues', supplierId)
    ];

    return await Promise.all(sources);
  }

  private async evaluateRiskIndicators(dataSources: DataSource[]): Promise<RiskIndicator[]> {
    const indicators: RiskIndicator[] = [];

    // 财务风险检查
    const financialData = dataSources.find(d => d.type === 'financial_reports');
    if (financialData) {
      indicators.push(...await this.evaluateFinancialRisk(financialData));
    }

    // 合规风险检查
    const legalData = dataSources.find(d => d.type === 'legal_records');
    if (legalData) {
      indicators.push(...await this.evaluateComplianceRisk(legalData));
    }

    // 运营风险检查
    const businessData = dataSources.find(d => d.type === 'business_registry');
    if (businessData) {
      indicators.push(...await this.evaluateOperationalRisk(businessData));
    }

    return indicators;
  }

  private calculateRiskScore(indicators: RiskIndicator[]): number {
    const severityWeights = {
      low: 1,
      medium: 3,
      high: 7,
      critical: 15
    };

    const totalScore = indicators.reduce((sum, indicator) => {
      return sum + (severityWeights[indicator.severity] * indicator.confidence);
    }, 0);

    // 归一化到0-100分
    return Math.min(100, Math.round(totalScore));
  }

  private async triggerRiskAlert(supplierId: string, riskProfile: SupplierRiskProfile) {
    const alertLevel = riskProfile.overallRiskScore > 85 ? 'critical' : 'warning';
    
    await this.notificationService.send({
      type: 'supplier_risk_alert',
      level: alertLevel,
      recipients: ['procurement_manager', 'category_buyer'],
      data: {
        supplierId,
        riskScore: riskProfile.overallRiskScore,
        criticalIndicators: riskProfile.riskIndicators
          .filter(i => i.severity === 'high' || i.severity === 'critical'),
        recommendedActions: this.generateRiskMitigationActions(riskProfile)
      }
    });
  }
}
```

### 6. 采购数据分析与策略优化

#### 6.1 智能分析引擎
```typescript
// src/lib/procurement/analytics-engine.ts
interface ProcurementAnalysis {
  spendingPatterns: SpendingPattern[];
  supplierPerformance: SupplierPerformance[];
  categoryInsights: CategoryInsight[];
  savingsOpportunities: SavingsOpportunity[];
  riskAssessments: RiskAssessment[];
  optimizationRecommendations: OptimizationRecommendation[];
}

class ProcurementAnalyticsEngine {
  private dataWarehouse: DataWarehouse;
  private mlModels: MLModelRegistry;

  async generateProcurementAnalysis(
    buyerId: string,
    period: DateRange
  ): Promise<ProcurementAnalysis> {
    // 1. 数据提取和清洗
    const rawData = await this.extractProcurementData(buyerId, period);
    const cleanData = await this.cleanAndNormalizeData(rawData);

    // 2. 多维度分析
    const analyses = await Promise.all([
      this.analyzeSpendingPatterns(cleanData),
      this.analyzeSupplierPerformance(cleanData),
      this.analyzeCategoryTrends(cleanData),
      this.identifySavingsOpportunities(cleanData),
      this.assessPortfolioRisks(cleanData)
    ]);

    // 3. 机器学习洞察
    const mlInsights = await this.generateMLInsights(cleanData);

    // 4. 生成优化建议
    const recommendations = await this.generateOptimizationRecommendations(
      analyses,
      mlInsights
    );

    return {
      spendingPatterns: analyses[0],
      supplierPerformance: analyses[1],
      categoryInsights: analyses[2],
      savingsOpportunities: analyses[3],
      riskAssessments: analyses[4],
      optimizationRecommendations: recommendations
    };
  }

  private async analyzeSpendingPatterns(data: CleanedData): Promise<SpendingPattern[]> {
    const patterns: SpendingPattern[] = [];

    // 时间趋势分析
    patterns.push(await this.analyzeTemporalTrends(data));

    // 类别分布分析
    patterns.push(await this.analyzeCategoryDistribution(data));

    // 供应商集中度分析
    patterns.push(await this.analyzeSupplierConcentration(data));

    // 价格波动分析
    patterns.push(await this.analyzePriceVolatility(data));

    return patterns;
  }

  private async identifySavingsOpportunities(data: CleanedData): Promise<SavingsOpportunity[]> {
    const opportunities: SavingsOpportunity[] = [];

    // 1. 重复采购优化
    const duplicateOpportunities = await this.findDuplicatePurchases(data);
    opportunities.push(...duplicateOpportunities);

    // 2. 批量采购建议
    const bulkOpportunities = await this.identifyBulkProcurementOpportunities(data);
    opportunities.push(...bulkOpportunities);

    // 3. 替代品建议
    const substitutionOpportunities = await this.suggestSubstitutions(data);
    opportunities.push(...substitutionOpportunities);

    // 4. 供应商整合建议
    const consolidationOpportunities = await this.suggestSupplierConsolidation(data);
    opportunities.push(...consolidationOpportunities);

    return opportunities
      .sort((a, b) => b.potentialSavings - a.potentialSavings)
      .slice(0, 20); // 返回前20个机会
  }

  private async generateOptimizationRecommendations(
    analyses: any[],
    mlInsights: MLInsights
  ): Promise<OptimizationRecommendation[]> {
    const recommendations: Recommendation[] = [];

    // 基于分析结果生成建议
    recommendations.push(...this.generateStrategicRecommendations(analyses));
    
    // 基于ML洞察生成建议
    recommendations.push(...this.generatePredictiveRecommendations(mlInsights));

    // 优先级排序
    return recommendations
      .map(rec => ({
        ...rec,
        priority: this.calculateRecommendationPriority(rec),
        implementationEffort: this.estimateImplementationEffort(rec)
      }))
      .sort((a, b) => b.priority - a.priority);
  }
}
```

## 数据库设计

### 核心表结构

```sql
-- 供应商信息表
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(100) UNIQUE,
  legal_representative VARCHAR(255),
  registered_capital DECIMAL(15,2),
  establishment_date DATE,
  business_scope TEXT,
  address TEXT,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  capability_tags TEXT[], -- ['小批量出口', '英文支持', '快速响应']
  product_categories TEXT[],
  certifications TEXT[],
  credit_rating DECIMAL(3,2) DEFAULT 0.00,
  response_time_avg INTERVAL,
  lead_time_avg INTERVAL,
  reliability_score DECIMAL(3,2) DEFAULT 0.00,
  price_competitiveness DECIMAL(3,2) DEFAULT 0.00,
  geographic_coverage TEXT[],
  languages_supported TEXT[],
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 采购请求表
CREATE TABLE procurement_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES users(id),
  request_number VARCHAR(100) UNIQUE NOT NULL,
  raw_input TEXT,
  input_type VARCHAR(20),
  parsed_requirements JSONB,
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, cancelled
  ai_analysis JSONB,
  total_items INTEGER,
  estimated_value DECIMAL(12,2),
  currency VARCHAR(3),
  deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 供应商报价表
CREATE TABLE supplier_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES procurement_requests(id),
  supplier_id UUID REFERENCES suppliers(id),
  quote_number VARCHAR(100),
  items JSONB NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  validity_period_start TIMESTAMP,
  validity_period_end TIMESTAMP,
  payment_terms JSONB,
  delivery_time INTEGER, -- 天
  delivery_location TEXT,
  remarks TEXT,
  status VARCHAR(20) DEFAULT 'submitted', -- submitted, accepted, rejected
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 采购订单表
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(100) UNIQUE NOT NULL,
  procurement_request_id UUID REFERENCES procurement_requests(id),
  supplier_quote_id UUID REFERENCES supplier_quotes(id),
  supplier_id UUID REFERENCES suppliers(id),
  items JSONB NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  payment_terms JSONB,
  delivery_schedule JSONB,
  status VARCHAR(20) DEFAULT 'created', -- created, confirmed, shipped, delivered, completed
  po_date TIMESTAMP DEFAULT NOW(),
  expected_delivery TIMESTAMP,
  actual_delivery TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 供应商风险记录表
CREATE TABLE supplier_risk_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id),
  risk_type VARCHAR(50),
  severity VARCHAR(20),
  description TEXT,
  detected_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  resolution_notes TEXT,
  confidence DECIMAL(3,2),
  source VARCHAR(100)
);

-- 采购分析记录表
CREATE TABLE procurement_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES users(id),
  analysis_type VARCHAR(50),
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  insights JSONB,
  recommendations JSONB,
  generated_at TIMESTAMP DEFAULT NOW()
);
```

## API接口设计

### RESTful API端点

```typescript
// src/app/api/procurement/requests/route.ts
export async function POST(request: Request) {
  const requestData = await request.json();
  
  const parser = new MultiModalRequestParser();
  const parsedRequest = await parser.parseRequest(requestData.input);
  
  const procurementRequest = await procurementService.createRequest({
    buyerId: requestData.buyerId,
    parsedRequirements: parsedRequest,
    rawInput: requestData.input
  });
  
  return NextResponse.json(procurementRequest);
}

// src/app/api/procurement/match-suppliers/route.ts
export async function POST(request: Request) {
  const { requestId } = await request.json();
  
  const request = await procurementService.getRequest(requestId);
  const matcher = new IntelligentSupplierMatcher();
  
  const matches = await matcher.findBestSuppliers(request.parsedRequirements);
  
  return NextResponse.json(matches);
}

// src/app/api/procurement/quotes/request/route.ts
export async function POST(request: Request) {
  const { requestId, supplierIds } = await request.json();
  
  const quotationManager = new AutomatedQuotationManager();
  const response = await quotationManager.requestQuotes({
    requestId,
    supplierIds
  });
  
  return NextResponse.json(response);
}

// src/app/api/procurement/negotiate/route.ts
export async function POST(request: Request) {
  const { quoteId } = await request.json();
  
  const quote = await quotationService.getQuote(quoteId);
  const negotiationEngine = new IntelligentNegotiationEngine();
  
  const outcome = await negotiationEngine.negotiateBestPrice({
    quote,
    context: quote.procurementContext
  });
  
  return NextResponse.json(outcome);
}

// src/app/api/procurement/analytics/generate/route.ts
export async function POST(request: Request) {
  const { buyerId, period } = await request.json();
  
  const analyticsEngine = new ProcurementAnalyticsEngine();
  const analysis = await analyticsEngine.generateProcurementAnalysis(
    buyerId,
    period
  );
  
  return NextResponse.json(analysis);
}
```

## 缓存与性能优化

### 智能缓存策略

```typescript
// src/lib/cache/procurement-cache.ts
class ProcurementCacheManager {
  private readonly TTL_CONFIG = {
    supplier_profiles: 86400,    // 24小时
    price_benchmarks: 3600,      // 1小时
    market_intelligence: 1800,   // 30分钟
    risk_scores: 7200,           // 2小时
    ml_model_predictions: 300    // 5分钟
  };

  async getCachedSupplierProfile(supplierId: string): Promise<SupplierProfile | null> {
    const cacheKey = `supplier:profile:${supplierId}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const freshProfile = await supplierService.getProfile(supplierId);
    if (freshProfile) {
      await redis.setex(
        cacheKey,
        this.TTL_CONFIG.supplier_profiles,
        JSON.stringify(freshProfile)
      );
    }

    return freshProfile;
  }

  async invalidateSupplierCache(supplierId: string) {
    const patterns = [
      `supplier:profile:${supplierId}`,
      `supplier:quotes:${supplierId}*`,
      `supplier:risk:${supplierId}`
    ];

    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  }
}
```

## 监控与告警系统

### 关键指标监控

```typescript
// src/lib/monitoring/procurement-monitor.ts
class ProcurementMonitor {
  private readonly ALERT_THRESHOLDS = {
    quote_response_rate: 0.8,
    negotiation_success_rate: 0.6,
    supplier_risk_score: 70,
    cost_savings_target: 0.15,
    processing_time_limit: 72 // 小时
  };

  async monitorProcurementPerformance(buyerId: string): Promise<PerformanceReport> {
    const metrics = await Promise.all([
      this.calculateQuoteResponseRate(buyerId),
      this.calculateNegotiationSuccessRate(buyerId),
      this.calculateAverageSavings(buyerId),
      this.calculateProcessEfficiency(buyerId),
      this.aggregateSupplierRisks(buyerId)
    ]);

    const alerts = this.generateAlerts(metrics);
    
    return {
      buyerId,
      metrics,
      alerts,
      recommendations: this.generateImprovementRecommendations(metrics),
      timestamp: new Date()
    };
  }

  private generateAlerts(metrics: any[]): Alert[] {
    const alerts: Alert[] = [];

    if (metrics.quoteResponseRate < this.ALERT_THRESHOLDS.quote_response_rate) {
      alerts.push({
        type: 'low_quote_response',
        severity: 'warning',
        message: '供应商报价响应率低于阈值',
        value: metrics.quoteResponseRate
      });
    }

    if (metrics.averageRiskScore > this.ALERT_THRESHOLDS.supplier_risk_score) {
      alerts.push({
        type: 'high_supplier_risk',
        severity: 'critical',
        message: '供应商组合风险评分过高',
        value: metrics.averageRiskScore
      });
    }

    return alerts;
  }
}
```

## 安全与合规

### 数据安全措施

```typescript
// src/lib/security/procurement-security.ts
class ProcurementSecurity {
  async validateProcurementAccess(
    userId: string,
    resourceId: string,
    action: string
  ): Promise<boolean> {
    // 1. RBAC权限检查
    const userRole = await authService.getUserRole(userId);
    if (!this.hasPermission(userRole, action)) {
      return false;
    }

    // 2. 数据所有权检查
    const resourceOwner = await this.getResourceOwner(resourceId);
    if (resourceOwner !== userId && userRole !== 'admin') {
      return false;
    }

    // 3. 敏感数据脱敏
    if (action === 'view' && this.containsSensitiveData(resourceId)) {
      await this.applyDataMasking(resourceId);
    }

    return true;
  }

  private async applyDataMasking(resourceId: string) {
    const sensitiveFields = ['supplier_contact', 'pricing_details'];
    // 实施数据脱敏逻辑
  }
}
```

---

*文档版本：v1.0*
*最后更新：2026年2月15日*
*适用范围：FixCycle 4.0 B2B采购智能体系统*