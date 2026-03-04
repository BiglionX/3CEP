/**
 * 报价服务 - 智能报价生成、定价算法、报价管? */

import { createClient } from '@supabase/supabase-js';
import type {
  Quotation,
  CreateQuotationInput,
  UpdateQuotationInput,
  QuotationItem,
  PricingFactors,
  CustomerGrade,
} from '../types';
import { customerService } from './customer.service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export class QuotationService {
  /**
   * 获取报价列表
   */
  async getQuotations(params?: {
    customerId?: string;
    status?: string;
    created_by?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ quotations: Quotation[]; total: number }> {
    try {
      let query = supabase
        .from('sales_quotations')
        .select('*', { count: 'exact' });

      if (params?.customerId) {
        query = query.eq('customer_id', params.customerId);
      }

      if (params?.status) {
        query = query.eq('status', params.status);
      }

      if (params?.created_by) {
        query = query.eq('created_by', params.created_by);
      }

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      if (params?.offset) {
        query = query.range(
          params.offset,
          params.offset + (params.limit || 0) - 1
        );
      }

      const { data, error, count } = await query.order('created_at', {
        ascending: false,
      });

      if (error) throw error;

      return {
        quotations: data as Quotation[],
        total: count || 0,
      };
    } catch (error) {
      console.error('Error fetching quotations:', error);
      throw error;
    }
  }

  /**
   * 获取报价详情
   */
  async getQuotation(quotationId: string): Promise<Quotation | null> {
    try {
      const { data, error } = await supabase
        .from('sales_quotations')
        .select('*')
        .eq('id', quotationId)
        .single();

      if (error) throw error;

      return data as Quotation;
    } catch (error) {
      console.error('Error fetching quotation:', error);
      return null;
    }
  }

  /**
   * 创建报价（使用智能定价）
   */
  async createQuotation(input: CreateQuotationInput): Promise<Quotation> {
    try {
      // 获取客户信息用于智能定价
      const customer = await customerService.getCustomer(input.customer_id);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // 计算每个产品项的智能价格
      const pricedItems = await this.calculatePricing(
        input.product_items,
        customer.grade || 'D'
      );

      // 计算总额
      const subtotal = pricedItems.reduce(
        (sum, item) =>
          sum + item.unit_price * item.quantity * (1 - item.discount),
        0
      );
      const taxAmount = subtotal * input.tax_rate;
      const totalAmount = subtotal + taxAmount;

      // 生成报价单号
      const quoteNumber = await this.generateQuoteNumber();

      // 插入数据?      const { data, error } = await supabase
        .from('sales_quotations')
        .insert([
          {
            ...input,
            product_items: pricedItems,
            subtotal,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            status: 'draft',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return data as Quotation;
    } catch (error) {
      console.error('Error creating quotation:', error);
      throw error;
    }
  }

  /**
   * 更新报价
   */
  async updateQuotation(
    quotationId: string,
    input: UpdateQuotationInput
  ): Promise<Quotation> {
    try {
      let updateData: any = {
        ...input,
        updated_at: new Date(),
      };

      // 如果更新了产品项，重新计算金?      if (input.product_items) {
        const subtotal = input.product_items.reduce(
          (sum, item) =>
            sum + item.unit_price * item.quantity * (1 - item.discount),
          0
        );
        const taxAmount = subtotal * (input.tax_rate || 0.13); // 默认 13% 税率
        updateData.subtotal = subtotal;
        updateData.tax_amount = taxAmount;
        updateData.total_amount = subtotal + taxAmount;
      }

      const { data, error } = await supabase
        .from('sales_quotations')
        .update(updateData)
        .eq('id', quotationId)
        .select()
        .single();

      if (error) throw error;

      return data as Quotation;
    } catch (error) {
      console.error('Error updating quotation:', error);
      throw error;
    }
  }

  /**
   * 发送报价给客户
   */
  async sendQuotation(quotationId: string): Promise<Quotation> {
    try {
      const quotation = await this.getQuotation(quotationId);
      if (!quotation) {
        throw new Error('Quotation not found');
      }

      // TODO: 发送邮件或短信通知客户

      return await this.updateQuotation(quotationId, {
        status: 'sent',
      });
    } catch (error) {
      console.error('Error sending quotation:', error);
      throw error;
    }
  }

  /**
   * 接受报价
   */
  async acceptQuotation(quotationId: string): Promise<Quotation> {
    try {
      return await this.updateQuotation(quotationId, {
        status: 'accepted',
      });
    } catch (error) {
      console.error('Error accepting quotation:', error);
      throw error;
    }
  }

  /**
   * 拒绝报价
   */
  async rejectQuotation(quotationId: string): Promise<Quotation> {
    try {
      return await this.updateQuotation(quotationId, {
        status: 'rejected',
      });
    } catch (error) {
      console.error('Error rejecting quotation:', error);
      throw error;
    }
  }

  /**
   * 删除报价
   */
  async deleteQuotation(quotationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sales_quotations')
        .delete()
        .eq('id', quotationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting quotation:', error);
      throw error;
    }
  }

  /**
   * 获取报价统计
   */
  async getQuotationStatistics(createdBy?: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    totalAmount: number;
    acceptedAmount: number;
    acceptanceRate: number;
  }> {
    try {
      let query = supabase
        .from('sales_quotations')
        .select('status, total_amount');

      if (createdBy) {
        query = query.eq('created_by', createdBy);
      }

      const { data, error } = await query;
      if (error) throw error;

      const stats = {
        total: data.length,
        byStatus: {} as Record<string, number>,
        totalAmount: 0,
        acceptedAmount: 0,
        acceptanceRate: 0,
      };

      data.forEach((quote: any) => {
        stats.byStatus[quote.status] = (stats.byStatus[quote.status] || 0) + 1;
        stats.totalAmount += quote.total_amount;

        if (quote.status === 'accepted') {
          stats.acceptedAmount += quote.total_amount;
        }
      });

      stats.acceptanceRate =
        stats.total > 0
          ? ((stats.byStatus['accepted'] || 0) / stats.total) * 100
          : 0;

      return stats;
    } catch (error) {
      console.error('Error fetching quotation statistics:', error);
      throw error;
    }
  }

  /**
   * 私有方法：生成报价单?   */
  private async generateQuoteNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    // 获取今天的报价数?    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const { count } = await supabase
      .from('sales_quotations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay.toISOString());

    const sequence = String((count || 0) + 1).padStart(4, '0');

    return `QT-${year}${month}-${sequence}`;
  }

  /**
   * 私有方法：计算智能定?   */
  private async calculatePricing(
    items: Omit<QuotationItem, 'subtotal'>[],
    customerGrade: CustomerGrade
  ): Promise<QuotationItem[]> {
    return items.map(item => {
      // 获取产品成本（这里简化，实际应该从产品表获取?      const baseCost = item.unit_price * 0.6; // 假设成本是价格的 60%

      // 定价因子
      const factors: PricingFactors = {
        baseCost,
        marketPrice: item.unit_price,
        competitorPrice: item.unit_price * 0.95, // 假设竞争对手便宜 5%
        customerGrade,
        orderVolume: item.quantity,
        profitMargin: 0.3, // 目标利润?30%
      };

      // 计算最优价?      const optimalPrice = this.calculateOptimalPrice(factors);

      return {
        ...item,
        unit_price: optimalPrice,
        subtotal: optimalPrice * item.quantity * (1 - item.discount),
      };
    });
  }

  /**
   * 私有方法：智能定价算?   */
  private calculateOptimalPrice(factors: PricingFactors): number {
    const {
      baseCost,
      marketPrice,
      competitorPrice,
      customerGrade,
      orderVolume,
      profitMargin,
    } = factors;

    // 基础价格 = 成本 * (1 + 目标利润?
    let basePrice = baseCost * (1 + profitMargin);

    // 客户等级折扣
    const gradeDiscounts = { A: 0.95, B: 0.98, C: 1.0, D: 1.05 };
    const gradeFactor = gradeDiscounts[customerGrade] || 1.0;

    // 批量折扣
    const volumeDiscount =
      orderVolume > 1000 ? 0.9 : orderVolume > 500 ? 0.95 : 1.0;

    // 竞争调整
    const competitiveFactor = competitorPrice < marketPrice ? 0.98 : 1.0;

    const finalPrice =
      basePrice * gradeFactor * volumeDiscount * competitiveFactor;

    // 确保不低于成本（至少 5% 利润?    return Math.max(finalPrice, baseCost * 1.05);
  }
}

// 导出单例
export const quotationService = new QuotationService();
