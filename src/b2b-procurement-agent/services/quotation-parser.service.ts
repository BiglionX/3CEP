/**
 * 报价解析服务
 * 负责解析供应商回复的邮件内容，提取结构化报价信息
 */

import { createClient } from '@supabase/supabase-js';
import { QuotationItem, QuoteParseResult } from '../models/quotation.model';

export class QuotationParserService {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
  }

  /**
   * 解析报价邮件内容
   */
  async parseQuoteEmail(
    emailContent: string,
    quotationItems: QuotationItem[]
  ): Promise<QuoteParseResult> {
    try {
      // 移除HTML标签，只保留文本内容
      const cleanContent = this.cleanHtmlContent(emailContent);

      // 提取基本信息
      const quoteInfo = this.extractBasicInfo(cleanContent);

      // 提取报价项目
      const quoteItems = this.extractQuoteItems(cleanContent, quotationItems);

      // 计算总金?      const totalAmount = quoteItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );

      // 计算解析置信?      const confidence = this.calculateConfidence(quoteItems, quotationItems);

      // 识别潜在问题
      const { warnings, errors } = this.identifyIssues(
        quoteItems,
        quotationItems
      );

      return {
        success: errors.length === 0,
        quoteData: {
          quoteNumber: quoteInfo.quoteNumber,
          items: quoteItems,
          totalAmount,
          currency: quoteInfo.currency || 'CNY',
          deliveryTime: quoteInfo.deliveryTime,
          validityDays: quoteInfo.validityDays,
        },
        confidence,
        warnings,
        errors,
      };
    } catch (error) {
      console.error('报价解析错误:', error);
      return {
        success: false,
        confidence: 0,
        errors: [`解析失败: ${(error as Error).message}`],
      };
    }
  }

  /**
   * 清理HTML内容
   */
  private cleanHtmlContent(html: string): string {
    // 移除HTML标签
    let text = html.replace(/<[^>]*>/g, ' ');

    // 替换HTML实体
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // 清理多余空白字符
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  }

  /**
   * 提取基本信息
   */
  private extractBasicInfo(content: string): {
    quoteNumber?: string;
    currency: string;
    deliveryTime?: number;
    validityDays?: number;
  } {
    const result = {
      quoteNumber: undefined as string | undefined,
      currency: 'CNY',
      deliveryTime: undefined as number | undefined,
      validityDays: undefined as number | undefined,
    };

    // 提取报价单号
    const quoteNumberPatterns = [
      /报价单号[:：]\s*([A-Z0-9\-_]+)/i,
      /Quote\s*Number[:：]?\s*([A-Z0-9\-_]+)/i,
      /编号[:：]\s*([A-Z0-9\-_]+)/i,
    ];

    for (const pattern of quoteNumberPatterns) {
      const match = content.match(pattern);
      if (match) {
        result.quoteNumber = match[1];
        break;
      }
    }

    // 提取货币
    const currencyPatterns = [
      /(人民币|CNY|RMB)/i,
      /(美元|USD)/i,
      /(欧元|EUR)/i,
    ];

    for (const [index, pattern] of currencyPatterns.entries()) {
      if (pattern.test(content)) {
        result.currency = ['CNY', 'USD', 'EUR'][index];
        break;
      }
    }

    // 提取交货时间
    const deliveryPatterns = [
      /(\d+)\s*(天|日|工作日|days|day)/i,
      /交货期[:：]?\s*(\d+)/i,
      /Delivery\s*Time[:：]?\s*(\d+)/i,
    ];

    for (const pattern of deliveryPatterns) {
      const match = content.match(pattern);
      if (match) {
        result.deliveryTime = parseInt(match[1]);
        break;
      }
    }

    // 提取有效?    const validityPatterns = [
      /有效期[:：]?\s*(\d+)\s*(天|�?/i,
      /Validity[:：]?\s*(\d+)\s*(days|day)/i,
      /报价有效期[:：]?\s*(\d+)/i,
    ];

    for (const pattern of validityPatterns) {
      const match = content.match(pattern);
      if (match) {
        result.validityDays = parseInt(match[1]);
        break;
      }
    }

    return result;
  }

  /**
   * 提取报价项目
   */
  private extractQuoteItems(
    content: string,
    originalItems: QuotationItem[]
  ): Array<{
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    specifications?: string;
  }> {
    const quoteItems: Array<any> = [];
    const lines = content.split('\n');

    // 查找包含价格信息的行
    for (const line of lines) {
      const priceInfo = this.extractPriceFromLine(line.trim(), originalItems);
      if (priceInfo) {
        quoteItems.push(priceInfo);
      }
    }

    // 如果没有找到结构化的价格信息，尝试智能匹?    if (quoteItems.length === 0) {
      quoteItems.push(...this.intelligentItemMatching(content, originalItems));
    }

    return quoteItems;
  }

  /**
   * 从单行文本中提取价格信息
   */
  private extractPriceFromLine(
    line: string,
    originalItems: QuotationItem[]
  ): any | null {
    // 匹配价格模式：数?+ 价格关键?+ 数字（价格）
    const pricePatterns = [
      /(.+?)\s+(\d+(?:\.\d+)?)\s*(元|￥|\$|�?\s*(\d+(?:\.\d+)?)/i,
      /(.+?)\s+(\d+(?:\.\d+)?)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*(元|￥|\$|�?/i,
      /(.+?)\s*单价[:：]?\s*(\d+(?:\.\d+)?)\s*总价[:：]?\s*(\d+(?:\.\d+)?)/i,
    ];

    for (const pattern of pricePatterns) {
      const match = line.match(pattern);
      if (match) {
        const [, itemName, quantityStr, priceStr] = match;
        const quantity = parseFloat(quantityStr);
        const unitPrice = parseFloat(priceStr);

        if (
          !isNaN(quantity) &&
          !isNaN(unitPrice) &&
          quantity > 0 &&
          unitPrice > 0
        ) {
          // 匹配最相似的商品名?          const matchedItem = this.findMostSimilarItem(
            itemName.trim(),
            originalItems
          );

          return {
            itemName: matchedItem?.productName || itemName.trim(),
            quantity,
            unitPrice,
            totalPrice: quantity * unitPrice,
            specifications: matchedItem?.specifications,
          };
        }
      }
    }

    return null;
  }

  /**
   * 智能商品匹配
   */
  private intelligentItemMatching(
    content: string,
    originalItems: QuotationItem[]
  ): any[] {
    const results: any[] = [];

    for (const originalItem of originalItems) {
      // 在内容中查找商品相关信息
      const itemPattern = new RegExp(
        `(?:${originalItem.productName}|${originalItem.category})`,
        'i'
      );

      if (itemPattern.test(content)) {
        // 尝试提取价格信息
        const priceMatch = content.match(/(\d+(?:\.\d+)?)\s*(?:元|￥|\$|�?/);
        if (priceMatch) {
          const unitPrice = parseFloat(priceMatch[1]);
          if (!isNaN(unitPrice) && unitPrice > 0) {
            results.push({
              itemName: originalItem.productName,
              quantity: originalItem.quantity,
              unitPrice,
              totalPrice: originalItem.quantity * unitPrice,
              specifications: originalItem.specifications,
            });
          }
        }
      }
    }

    return results;
  }

  /**
   * 查找最相似的商?   */
  private findMostSimilarItem(
    itemName: string,
    items: QuotationItem[]
  ): QuotationItem | undefined {
    let bestMatch: QuotationItem | undefined;
    let bestScore = 0;

    for (const item of items) {
      const score = this.calculateSimilarity(itemName, item.productName);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }

    return bestMatch;
  }

  /**
   * 计算字符串相似度
   */
  private calculateSimilarity(str1: string, str2: string): number {
    // 简单的相似度计算（可以替换为更复杂的算法）
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1 === s2) return 1;
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    // 计算编辑距离相似?    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    return maxLength > 0 ? 1 - distance / maxLength : 0;
  }

  /**
   * 计算编辑距离
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str1.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str1.length][str2.length];
  }

  /**
   * 计算解析置信?   */
  private calculateConfidence(
    parsedItems: any[],
    originalItems: QuotationItem[]
  ): number {
    if (parsedItems.length === 0) return 0;

    // 基础分数：成功解析的项目数占?    const itemMatchRatio = parsedItems.length / originalItems.length;
    let confidence = itemMatchRatio * 60; // 最?0�?
    // 价格合理性检?    let priceValidCount = 0;
    for (const parsedItem of parsedItems) {
      const originalItem = originalItems.find(
        item => item.productName === parsedItem.itemName
      );

      if (originalItem && parsedItem.unitPrice > 0) {
        // 检查价格是否在合理范围内（±50%�?        const estimatedPrice = originalItem.estimatedUnitPrice || 0;
        if (
          estimatedPrice === 0 ||
          (parsedItem.unitPrice >= estimatedPrice * 0.5 &&
            parsedItem.unitPrice <= estimatedPrice * 1.5)
        ) {
          priceValidCount++;
        }
      }
    }

    confidence += (priceValidCount / parsedItems.length) * 40; // 最?0�?
    return Math.min(Math.round(confidence), 100);
  }

  /**
   * 识别潜在问题
   */
  private identifyIssues(
    parsedItems: any[],
    originalItems: QuotationItem[]
  ): { warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // 检查是否所有商品都被报?    if (parsedItems.length < originalItems.length) {
      const missingItems = originalItems.filter(
        orig =>
          !parsedItems.some(parsed => parsed.itemName === orig.productName)
      );
      warnings.push(
        `以下商品未被报价: ${missingItems
          .map(item => item.productName)
          .join(', ')}`
      );
    }

    // 检查价格异?    for (const parsedItem of parsedItems) {
      const originalItem = originalItems.find(
        item => item.productName === parsedItem.itemName
      );

      if (originalItem && originalItem.estimatedUnitPrice) {
        const deviation = Math.abs(
          (parsedItem.unitPrice - originalItem.estimatedUnitPrice) /
            originalItem.estimatedUnitPrice
        );

        if (deviation > 0.5) {
          // 偏差超过50%
          warnings.push(
            `${parsedItem.itemName} 的报价与预估价格偏差较大 (${Math.round(
              deviation * 100
            )}%)`
          );
        }
      }
    }

    // 检查数量是否匹?    for (const parsedItem of parsedItems) {
      const originalItem = originalItems.find(
        item => item.productName === parsedItem.itemName
      );

      if (originalItem && parsedItem.quantity !== originalItem.quantity) {
        warnings.push(
          `${parsedItem.itemName} 的报价数?(${parsedItem.quantity}) 与请求数?(${originalItem.quantity}) 不一致`
        );
      }
    }

    return { warnings, errors };
  }

  /**
   * 保存解析结果
   */
  async saveParsedQuote(
    quotationRequestId: string,
    supplierId: string,
    parseResult: QuoteParseResult
  ): Promise<any> {
    if (!parseResult.quoteData || !parseResult.success) {
      throw new Error('无效的解析结?);
    }

    try {
      // 创建供应商报价记?      const { data: quoteData, error: quoteError } = await this.supabase
        .from('supplier_quotes')
        .insert([
          {
            quotation_request_id: quotationRequestId,
            supplier_id: supplierId,
            quote_number: parseResult.quoteData.quoteNumber,
            items: parseResult.quoteData.items,
            total_amount: parseResult.quoteData.totalAmount,
            currency: parseResult.quoteData.currency,
            delivery_time: parseResult.quoteData.deliveryTime,
            validity_period_end: parseResult.quoteData.validityDays
              ? new Date(
                  Date.now() +
                    parseResult.quoteData.validityDays * 24 * 60 * 60 * 1000
                )
              : null,
            status: 'received',
          },
        ])
        .select()
        .single();

      if (quoteError) throw new Error(`保存报价失败: ${quoteError.message}`);

      // 创建报价项目明细
      const quoteItems = parseResult.quoteData.items.map((item: any) => ({
        quote_id: quoteData.id,
        item_id: '', // 需要根据实际情况关?        item_name: item.itemName,
        quantity: item.quantity,
        unit: '�?, // 默认单位
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        specifications: item.specifications,
      }));

      if (quoteItems.length > 0) {
        const { error: itemsError } = await this.supabase
          .from('quote_items')
          .insert(quoteItems);

        if (itemsError) {
          console.warn('保存报价项目明细失败:', itemsError);
        }
      }

      return quoteData;
    } catch (error) {
      console.error('保存解析结果错误:', error);
      throw error;
    }
  }
}

// 导出默认实例
export const quotationParserService = new QuotationParserService();
