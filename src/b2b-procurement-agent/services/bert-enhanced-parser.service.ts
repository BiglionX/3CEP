/**
 * BERT增强版采购需求解析服务
 * 基于混合架构：BERT + 规则引擎
 */

import { 
  RawProcurementRequest, 
  ParsedProcurementRequest, 
  ProcurementItem,
  ProcurementStatus,
  UrgencyLevel
} from '../models/procurement.model';
import { DemandParserService } from './demand-parser.service';
import { supabase } from '@/lib/supabase';

// 模拟BERT模型接口（实际开发中替换为真实模型）
interface BertModelInterface {
  predict(text: string): Promise<BertPrediction>;
}

interface BertPrediction {
  entities: Array<{
    text: string;
    label: string;
    confidence: number;
    start: number;
    end: number;
  }>;
  confidence: number;
}

export class BertEnhancedParserService {
  private ruleBasedParser: DemandParserService;
  private bertModel: BertModelInterface;
  private supabase = supabase;

  constructor() {
    this.ruleBasedParser = new DemandParserService();
    this.bertModel = this.initializeMockBertModel(); // 实际使用时替换为真实模型
  }

  /**
   * 初始化模拟BERT模型
   * 实际开发中应加载真实的预训练模型
   */
  private initializeMockBertModel(): BertModelInterface {
    return {
      predict: async (text: string): Promise<BertPrediction> => {
        // 模拟BERT预测结果
        // 实际实现中这里会调用真实的BERT模型
        return this.mockBertPrediction(text);
      }
    };
  }

  /**
   * 模拟BERT预测（开发阶段使用）
   */
  private mockBertPrediction(text: string): BertPrediction {
    const entities: BertPrediction['entities'] = [];
    
    // 模拟实体识别
    const quantityMatches = text.match(/(\d+)\s*(?:台|件|个|套|箱|盒)/g);
    if (quantityMatches) {
      quantityMatches.forEach(match => {
        const numMatch = match.match(/(\d+)/);
        if (numMatch) {
          entities.push({
            text: numMatch[1],
            label: 'QUANTITY',
            confidence: 0.92,
            start: text.indexOf(numMatch[1]),
            end: text.indexOf(numMatch[1]) + numMatch[1].length
          });
        }
      });
    }

    // 产品类别识别
    const productPatterns = [
      { pattern: /(?:电脑|计算机|pc|笔记本|台式机)/gi, label: 'PRODUCT', value: 'computer' },
      { pattern: /(?:手机|智能手机|移动电话)/gi, label: 'PRODUCT', value: 'mobile' },
      { pattern: /(?:服务器|主机)/gi, label: 'PRODUCT', value: 'server' },
      { pattern: /(?:显示器|屏幕|液晶屏)/gi, label: 'PRODUCT', value: 'display' }
    ];

    for (const { pattern, label, value } of productPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          entities.push({
            text: match,
            label: label,
            confidence: 0.88,
            start: text.indexOf(match),
            end: text.indexOf(match) + match.length
          });
        });
      }
    }

    return {
      entities,
      confidence: 0.85 // 整体置信度
    };
  }

  /**
   * 混合解析：BERT + 规则引擎
   */
  async parseDemand(rawRequest: RawProcurementRequest): Promise<ParsedProcurementRequest> {
    const startTime = Date.now();
    
    try {
      // 1. BERT模型预测
      const bertResult = await this.bertModel.predict(rawRequest.rawDescription);
      
      // 2. 规则引擎备份解析
      const ruleResult = await this.ruleBasedParser.parseDemand(rawRequest);
      
      // 3. 融合策略
      const fusedResult = this.fusePredictions(bertResult, ruleResult, rawRequest);
      
      // 4. 记录处理日志
      await this.logProcessing(
        rawRequest.id, 
        'bert_enhanced_parsing', 
        {
          bertConfidence: bertResult.confidence,
          ruleConfidence: ruleResult.aiConfidence,
          rawText: rawRequest.rawDescription
        }, 
        fusedResult, 
        Date.now() - startTime, 
        true
      );

      return fusedResult;

    } catch (error) {
      // 错误回退到纯规则引擎
      console.warn('BERT解析失败，回退到规则引擎:', error);
      const fallbackResult = await this.ruleBasedParser.parseDemand(rawRequest);
      
      await this.logProcessing(
        rawRequest.id, 
        'bert_enhanced_parsing', 
        { fallback: true, error: error instanceof Error ? error.message : '未知错误' }, 
        fallbackResult, 
        Date.now() - startTime, 
        false
      );
      
      return fallbackResult;
    }
  }

  /**
   * 融合策略：结合BERT和规则引擎的结果
   */
  private fusePredictions(
    bertResult: BertPrediction,
    ruleResult: ParsedProcurementRequest,
    rawRequest: RawProcurementRequest
  ): ParsedProcurementRequest {
    
    // 高置信度优先策略
    if (bertResult.confidence > 0.9) {
      // BERT置信度很高，主要采用BERT结果
      return this.buildFromBertResult(bertResult, rawRequest, bertResult.confidence);
    } else if (bertResult.confidence > 0.7) {
      // 中等置信度，融合两种结果
      return this.hybridMerge(bertResult, ruleResult, rawRequest);
    } else {
      // 低置信度，主要采用规则引擎结果
      return this.enhanceRuleResult(ruleResult, bertResult);
    }
  }

  /**
   * 从BERT结果构建解析结果
   */
  private buildFromBertResult(
    bertResult: BertPrediction,
    rawRequest: RawProcurementRequest,
    confidence: number
  ): ParsedProcurementRequest {
    
    const items: ProcurementItem[] = [];
    
    // 提取产品信息
    const productEntities = bertResult.entities.filter(e => e.label === 'PRODUCT');
    const quantityEntities = bertResult.entities.filter(e => e.label === 'QUANTITY');
    
    // 简单匹配策略
    productEntities.forEach((product, index) => {
      const quantity = quantityEntities[index] || quantityEntities[0];
      const quantityValue = quantity ? parseInt(quantity.text) : 1;
      
      items.push({
        id: `item_${Date.now()}_${index}`,
        productId: `prod_${product.text}`,
        productName: product.text,
        category: this.categorizeProduct(product.text),
        quantity: quantityValue,
        unit: this.inferUnit(this.categorizeProduct(product.text)),
        specifications: '',
        requiredQuality: 'standard'
      });
    });

    return {
      id: `parsed_${rawRequest.id}`,
      rawRequestId: rawRequest.id,
      companyId: rawRequest.companyId,
      requesterId: rawRequest.requesterId,
      items: items.length > 0 ? items : [{
        id: `item_default_${Date.now()}`,
        productId: 'generic_item',
        productName: '通用物品',
        category: 'general',
        quantity: 1,
        unit: '件',
        specifications: rawRequest.rawDescription,
        requiredQuality: 'standard'
      }],
      urgency: this.extractUrgency(rawRequest.rawDescription),
      budgetRange: this.extractBudget(rawRequest.rawDescription),
      specialRequirements: this.extractSpecialRequirements(rawRequest.rawDescription),
      status: ProcurementStatus.PROCESSING,
      aiConfidence: Math.round(confidence * 100),
      parsedAt: new Date(),
      processingTimeMs: Date.now() - (Date.now() - 100) // 模拟时间
    };
  }

  /**
   * 混合合并策略
   */
  private hybridMerge(
    bertResult: BertPrediction,
    ruleResult: ParsedProcurementRequest,
    rawRequest: RawProcurementRequest
  ): ParsedProcurementRequest {
    
    // 优先采用BERT识别的产品信息
    const bertProducts = bertResult.entities.filter(e => e.label === 'PRODUCT');
    if (bertProducts.length > 0) {
      const enhancedItems = bertProducts.map((product, index) => ({
        ...ruleResult.items[0] || {},
        id: `item_${Date.now()}_${index}`,
        productName: product.text,
        category: this.categorizeProduct(product.text),
        quantity: ruleResult.items[0]?.quantity || 1
      }));
      
      return {
        ...ruleResult,
        items: enhancedItems,
        aiConfidence: Math.round((bertResult.confidence * 0.7 + ruleResult.aiConfidence / 100 * 0.3) * 100)
      };
    }
    
    return ruleResult;
  }

  /**
   * 增强规则结果
   */
  private enhanceRuleResult(
    ruleResult: ParsedProcurementRequest,
    bertResult: BertPrediction
  ): ParsedProcurementRequest {
    // 使用规则结果，但可以利用BERT的一些辅助信息
    return {
      ...ruleResult,
      aiConfidence: Math.min(100, ruleResult.aiConfidence + 5) // 小幅提升置信度
    };
  }

  /**
   * 产品分类
   */
  private categorizeProduct(productText: string): string {
    const lowerText = productText.toLowerCase();
    
    if (lowerText.includes('电脑') || lowerText.includes('计算机') || lowerText.includes('笔记本')) {
      return 'computer';
    } else if (lowerText.includes('手机') || lowerText.includes('移动')) {
      return 'mobile';
    } else if (lowerText.includes('服务器') || lowerText.includes('主机')) {
      return 'server';
    } else if (lowerText.includes('显示器') || lowerText.includes('屏幕')) {
      return 'display';
    }
    
    return 'general';
  }

  /**
   * 推断单位
   */
  private inferUnit(category: string): string {
    const unitMap: Record<string, string> = {
      'computer': '台',
      'mobile': '部',
      'server': '台',
      'display': '台',
      'printer': '台',
      'network': '台',
      'storage': '个'
    };
    
    return unitMap[category] || '件';
  }

  /**
   * 提取紧急程度
   */
  private extractUrgency(text: string): UrgencyLevel {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('紧急') || lowerText.includes('急需') || lowerText.includes('马上')) {
      return UrgencyLevel.URGENT;
    } else if (lowerText.includes('尽快') || lowerText.includes('早日')) {
      return UrgencyLevel.HIGH;
    } else if (lowerText.includes('一般') || lowerText.includes('普通')) {
      return UrgencyLevel.MEDIUM;
    }
    
    return UrgencyLevel.MEDIUM;
  }

  /**
   * 提取预算信息
   */
  private extractBudget(text: string): ParsedProcurementRequest['budgetRange'] {
    const budgetMatch = text.match(/(?:预算|价格|费用|成本)\s*[为是]\s*(\d+(?:\.\d+)?)\s*(?:元|万元|rmb|usd|\$)/i);
    if (budgetMatch) {
      const amount = parseFloat(budgetMatch[1]);
      return {
        min: amount * 0.8,
        max: amount * 1.2,
        currency: 'CNY'
      };
    }
    return undefined;
  }

  /**
   * 提取特殊要求
   */
  private extractSpecialRequirements(text: string): string[] {
    const requirements: string[] = [];
    
    if (text.includes('正品') || text.includes('原厂')) {
      requirements.push('要求正品/原厂');
    }
    
    if (text.includes('认证') || text.includes('资质')) {
      requirements.push('需要相关认证');
    }
    
    return requirements;
  }

  /**
   * 记录处理日志
   */
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
      await this.supabase
        .from('processing_logs')
        .insert({
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          request_id: requestId,
          processing_step: step,
          input: input,
          output: output,
          processing_time_ms: processingTime,
          success: success,
          error_message: errorMessage,
          timestamp: new Date()
        });
    } catch (error) {
      console.error('记录处理日志失败:', error);
    }
  }
}