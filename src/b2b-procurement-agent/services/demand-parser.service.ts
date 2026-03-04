/**
 * 采购需求理解引擎服? * 负责将自然语言描述的采购需求转换为结构化数? */

import {
  RawProcurementRequest,
  ParsedProcurementRequest,
  ProcurementItem,
  ProcurementStatus,
  UrgencyLevel,
} from '../models/procurement.model';
import { supabase } from '@/lib/supabase';

export class DemandParserService {
  private supabase = supabase;

  /**
   * 解析采购需?   * @param rawRequest 原始采购需?   * @returns 解析后的结构化需?   */
  async parseDemand(
    rawRequest: RawProcurementRequest
  ): Promise<ParsedProcurementRequest> {
    const startTime = Date.now();

    try {
      // 1. 文本预处?      const cleanedText = this.preprocessText(rawRequest.rawDescription);

      // 2. 实体识别和抽?      const entities = await this.extractEntities(cleanedText);

      // 3. 关系抽取
      const relationships = this.extractRelationships(entities);

      // 4. 结构化转?      const structuredDemand = this.structureDemand(
        entities,
        relationships,
        rawRequest
      );

      // 5. 质量评估
      const confidence = this.calculateConfidence(
        structuredDemand,
        rawRequest.rawDescription
      );

      const parsedRequest: ParsedProcurementRequest = {
        id: `parsed_${rawRequest.id}`,
        rawRequestId: rawRequest.id,
        companyId: rawRequest.companyId,
        requesterId: rawRequest.requesterId,
        items: structuredDemand.items || [],
        urgency: structuredDemand.urgency || UrgencyLevel.MEDIUM,
        budgetRange: structuredDemand.budgetRange,
        deliveryDeadline: structuredDemand.deliveryDeadline,
        deliveryLocation: structuredDemand.deliveryLocation,
        specialRequirements: structuredDemand.specialRequirements,
        status: ProcurementStatus.PROCESSING,
        aiConfidence: confidence,
        parsedAt: new Date(),
        processingTimeMs: Date.now() - startTime,
      };

      // 6. 记录处理日志
      await this.logProcessing(
        rawRequest.id,
        'parsing',
        rawRequest.rawDescription,
        parsedRequest,
        Date.now() - startTime,
        true
      );

      return parsedRequest;
    } catch (error) {
      // 记录错误日志
      await this.logProcessing(
        rawRequest.id,
        'parsing',
        rawRequest.rawDescription,
        null,
        Date.now() - startTime,
        false,
        error instanceof Error ? error.message : '未知错误'
      );

      throw new Error(
        `需求解析失? ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 文本预处?   */
  private preprocessText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // 保留中英文字符和空格
      .replace(/\s+/g, ' ') // 合并多余空格
      .trim();
  }

  /**
   * 实体识别和抽?   */
  private async extractEntities(text: string): Promise<Entity[]> {
    const entities: Entity[] = [];

    // 数量识别
    const quantityPattern =
      /(\d+(?:\.\d+)?)\s*(?:个|件|台|套|批|箱|盒|包|米|千克|公斤|�?/g;
    let match;
    while ((match = quantityPattern.exec(text)) !== null) {
      entities.push({
        type: 'quantity',
        value: parseFloat(match[1]),
        text: match[0],
        position: match.index,
      });
    }

    // 产品类别识别
    const productPatterns = [
      { pattern: /(?:电脑|计算机|pc|笔记本|台式?/gi, category: 'computer' },
      { pattern: /(?:手机|智能手机|移动电话)/gi, category: 'mobile' },
      { pattern: /(?:服务器|主机)/gi, category: 'server' },
      { pattern: /(?:显示器|屏幕|液晶?/gi, category: 'display' },
      { pattern: /(?:打印机|打印设备)/gi, category: 'printer' },
      { pattern: /(?:网络设备|路由器|交换?/gi, category: 'network' },
      { pattern: /(?:存储设备|硬盘|ssd)/gi, category: 'storage' },
    ];

    for (const { pattern, category } of productPatterns) {
      while ((match = pattern.exec(text)) !== null) {
        entities.push({
          type: 'product_category',
          value: category,
          text: match[0],
          position: match.index,
        });
      }
    }

    // 紧急程度识?    const urgencyPatterns = [
      { pattern: /(?:紧急|急需|马上|立刻)/gi, level: UrgencyLevel.URGENT },
      { pattern: /(?:尽快|早日|快点)/gi, level: UrgencyLevel.HIGH },
      { pattern: /(?:一般|普通|常规)/gi, level: UrgencyLevel.MEDIUM },
    ];

    for (const { pattern, level } of urgencyPatterns) {
      if (pattern.test(text)) {
        entities.push({
          type: 'urgency',
          value: level,
          text: pattern.source,
          position: 0,
        });
        break;
      }
    }

    // 预算识别
    const budgetPattern =
      /(?:预算|价格|费用|成本)\s*[为是]\s*(\d+(?:\.\d+)?)\s*(?:元|万元|rmb|usd|\$)/gi;
    while ((match = budgetPattern.exec(text)) !== null) {
      entities.push({
        type: 'budget',
        value: parseFloat(match[1]),
        text: match[0],
        position: match.index,
      });
    }

    // 时间期限识别
    const timePattern =
      /(?:截止|最晚|限期|交付)\s*(?:时间|日期)?\s*[为是]\s*([\d月日天周]+)/gi;
    while ((match = timePattern.exec(text)) !== null) {
      entities.push({
        type: 'deadline',
        value: match[1],
        text: match[0],
        position: match.index,
      });
    }

    return entities;
  }

  /**
   * 关系抽取
   */
  private extractRelationships(entities: Entity[]): Relationship[] {
    const relationships: Relationship[] = [];

    // 数量与产品的关联关系
    const quantities = entities.filter(e => e.type === 'quantity');
    const products = entities.filter(e => e.type === 'product_category');

    // 简单的就近匹配策略
    quantities.forEach(quantity => {
      const closestProduct = products.reduce(
        (closest, product) => {
          const distance1 = Math.abs(quantity.position - product.position);
          const distance2 = closest
            ? Math.abs(quantity.position - closest.position)
            : Infinity;
          return distance1 < distance2 ? product : closest;
        },
        null as Entity | null
      );

      if (closestProduct) {
        relationships.push({
          type: 'quantity_product',
          from: quantity,
          to: closestProduct,
          strength: 0.8,
        });
      }
    });

    return relationships;
  }

  /**
   * 结构化转?   */
  private structureDemand(
    entities: Entity[],
    relationships: Relationship[],
    rawRequest: RawProcurementRequest
  ): Partial<ParsedProcurementRequest> {
    const items: ProcurementItem[] = [];

    // 根据关系构建采购物品
    const quantityProductRelations = relationships.filter(
      r => r.type === 'quantity_product'
    );

    quantityProductRelations.forEach(rel => {
      const quantityEntity = rel.from;
      const productEntity = rel.to;

      items.push({
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId: `prod_${productEntity.value}`,
        productName: productEntity.text,
        category: productEntity.value as string,
        quantity: quantityEntity.value as number,
        unit: this.inferUnit(productEntity.value as string),
        specifications: '',
        requiredQuality: 'standard',
      });
    });

    // 如果没有识别到具体的物品，创建默认项
    if (items.length === 0) {
      items.push({
        id: `item_default_${Date.now()}`,
        productId: 'generic_item',
        productName: '通用物品',
        category: 'general',
        quantity: 1,
        unit: '�?,
        specifications: rawRequest.rawDescription,
        requiredQuality: 'standard',
      });
    }

    // 确定紧急程?    const urgencyEntity = entities.find(e => e.type === 'urgency');
    const urgency = urgencyEntity
      ? (urgencyEntity.value as UrgencyLevel)
      : UrgencyLevel.MEDIUM;

    // 预算范围
    const budgetEntities = entities.filter(e => e.type === 'budget');
    const budgetRange =
      budgetEntities.length > 0
        ? {
            min: Math.min(...budgetEntities.map(e => e.value as number)),
            max: Math.max(...budgetEntities.map(e => e.value as number)),
            currency: 'CNY',
          }
        : undefined;

    return {
      items,
      urgency,
      budgetRange,
      specialRequirements: this.extractSpecialRequirements(
        rawRequest.rawDescription
      ),
    };
  }

  /**
   * 推断单位
   */
  private inferUnit(category: string): string {
    const unitMap: Record<string, string> = {
      computer: '�?,
      mobile: '�?,
      server: '�?,
      display: '�?,
      printer: '�?,
      network: '�?,
      storage: '�?,
    };

    return unitMap[category] || '�?;
  }

  /**
   * 提取特殊要求
   */
  private extractSpecialRequirements(text: string): string[] {
    const requirements: string[] = [];

    // 品牌要求
    const brandPattern = /[品牌厂牌]\s*[为是]\s*([^\s，。、]+)/g;
    let match;
    while ((match = brandPattern.exec(text)) !== null) {
      requirements.push(`指定品牌: ${match[1]}`);
    }

    // 质量要求
    if (text.includes('正品') || text.includes('原厂')) {
      requirements.push('要求正品/原厂');
    }

    // 认证要求
    if (text.includes('认证') || text.includes('资质')) {
      requirements.push('需要相关认?);
    }

    return requirements;
  }

  /**
   * 计算置信?   */
  private calculateConfidence(
    parsedRequest: Partial<ParsedProcurementRequest>,
    originalText: string
  ): number {
    let confidence = 50; // 基础分数

    // 物品识别加分
    if (parsedRequest.items && parsedRequest.items.length > 0) {
      confidence += 20;
    }

    // 紧急程度识别加?    if (
      parsedRequest.urgency &&
      parsedRequest.urgency !== UrgencyLevel.MEDIUM
    ) {
      confidence += 10;
    }

    // 预算识别加分
    if (parsedRequest.budgetRange) {
      confidence += 10;
    }

    // 特殊要求识别加分
    if (
      parsedRequest.specialRequirements &&
      parsedRequest.specialRequirements.length > 0
    ) {
      confidence += 10;
    }

    // 原文长度惩罚（太短的文本置信度较低）
    if (originalText.length < 10) {
      confidence -= 20;
    }

    return Math.min(100, Math.max(0, confidence));
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
      (await this.supabase.from('processing_logs').insert({
        id: `log_${Date.now()} as any_${Math.random().toString(36).substr(2, 9)}`,
        request_id: requestId,
        processing_step: step,
        input: input,
        output: output,
        processing_time_ms: processingTime,
        success: success,
        error_message: errorMessage,
        timestamp: new Date(),
      })) as any;
    } catch (error) {
      console.error('记录处理日志失败:', error);
    }
  }
}

// 辅助类型定义
interface Entity {
  type: string;
  value: string | number;
  text: string;
  position: number;
}

interface Relationship {
  type: string;
  from: Entity;
  to: Entity;
  strength: number;
}
