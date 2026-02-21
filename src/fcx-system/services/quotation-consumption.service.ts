import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

// 初始化Supabase客户端
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * 询价消耗配置常量
 */
export const QUOTATION_CONSUMPTION_CONFIG = {
  // 基础询价消耗
  BASE_QUOTATION_COST: 10,        // 每次询价基础消耗10 FCX
  
  // 供应商数量相关消耗
  PER_SUPPLIER_COST: 2,           // 每个供应商额外消耗2 FCX
  MAX_SUPPLIERS_FREE: 3,          // 前3个供应商不额外收费
  MAX_SUPPLIERS_LIMIT: 20,        // 最多同时询价20个供应商
  
  // 商品数量相关消耗
  PER_ITEM_COST: 1,               // 每个商品项额外消耗1 FCX
  MAX_ITEMS_FREE: 5,              // 前5个商品项不额外收费
  
  // 特殊功能消耗
  URGENT_QUOTATION_COST: 20,      // 加急询价额外消耗20 FCX
  CUSTOM_TEMPLATE_COST: 15,       // 自定义模板额外消耗15 FCX
  AUTO_FOLLOW_UP_COST: 5,         // 自动跟进额外消耗5 FCX
  
  // 批量操作消耗
  BATCH_QUOTATION_DISCOUNT: 0.8,  // 批量询价8折优惠
  MIN_BATCH_SIZE: 5,              // 批量询价最小数量
  
  // 每日限额
  DAILY_QUOTATION_LIMIT: 50,      // 每日最多询价50次
  DAILY_FCX_SPEND_LIMIT: 500,     // 每日FCX消耗上限
} as const;

/**
 * 询价消耗明细接口
 */
interface QuotationConsumptionDetail {
  baseCost: number;              // 基础费用
  supplierCost: number;          // 供应商相关费用
  itemCountCost: number;         // 商品数量费用
  urgentCost: number;            // 加急费用
  templateCost: number;          // 模板费用
  autoFollowUpCost: number;      // 自动跟进费用
  batchDiscount: number;         // 批量折扣
  totalCost: number;             // 总费用
  breakdown: Array<{
    item: string;
    cost: number;
    description: string;
  }>;
}

/**
 * 询价参数接口
 */
interface QuotationParameters {
  supplierCount: number;         // 供应商数量
  itemCount: number;             // 商品项数量
  isUrgent?: boolean;            // 是否加急
  useCustomTemplate?: boolean;   // 是否使用自定义模板
  enableAutoFollowUp?: boolean;  // 是否启用自动跟进
  isBatchOperation?: boolean;    // 是否批量操作
}

/**
 * 询价消耗服务类
 */
export class QuotationConsumptionService {
  
  /**
   * 计算询价消耗
   */
  calculateConsumption(params: QuotationParameters): QuotationConsumptionDetail {
    const config = QUOTATION_CONSUMPTION_CONFIG;
    const breakdown: Array<{ item: string; cost: number; description: string }> = [];
    
    // 1. 基础费用
    let baseCost = config.BASE_QUOTATION_COST;
    breakdown.push({
      item: '基础询价费用',
      cost: baseCost,
      description: '发起询价的基础费用'
    });
    
    // 2. 供应商相关费用
    let supplierCost = 0;
    if (params.supplierCount > config.MAX_SUPPLIERS_FREE) {
      const extraSuppliers = params.supplierCount - config.MAX_SUPPLIERS_FREE;
      supplierCost = extraSuppliers * config.PER_SUPPLIER_COST;
      breakdown.push({
        item: `额外供应商费用 (${extraSuppliers}个)`,
        cost: supplierCost,
        description: `超出免费额度的${extraSuppliers}个供应商`
      });
    }
    
    // 3. 商品数量费用
    let itemCountCost = 0;
    if (params.itemCount > config.MAX_ITEMS_FREE) {
      const extraItems = params.itemCount - config.MAX_ITEMS_FREE;
      itemCountCost = extraItems * config.PER_ITEM_COST;
      breakdown.push({
        item: `额外商品项费用 (${extraItems}项)`,
        cost: itemCountCost,
        description: `超出免费额度的${extraItems}个商品项`
      });
    }
    
    // 4. 加急费用
    let urgentCost = 0;
    if (params.isUrgent) {
      urgentCost = config.URGENT_QUOTATION_COST;
      breakdown.push({
        item: '加急询价费用',
        cost: urgentCost,
        description: '加急处理的额外费用'
      });
    }
    
    // 5. 自定义模板费用
    let templateCost = 0;
    if (params.useCustomTemplate) {
      templateCost = config.CUSTOM_TEMPLATE_COST;
      breakdown.push({
        item: '自定义模板费用',
        cost: templateCost,
        description: '使用自定义模板的费用'
      });
    }
    
    // 6. 自动跟进费用
    let autoFollowUpCost = 0;
    if (params.enableAutoFollowUp) {
      autoFollowUpCost = config.AUTO_FOLLOW_UP_COST;
      breakdown.push({
        item: '自动跟进费用',
        cost: autoFollowUpCost,
        description: '启用自动跟进功能的费用'
      });
    }
    
    // 7. 计算小计
    let subtotal = baseCost + supplierCost + itemCountCost + urgentCost + templateCost + autoFollowUpCost;
    
    // 8. 批量折扣
    let batchDiscount = 0;
    if (params.isBatchOperation) {
      batchDiscount = subtotal * (1 - config.BATCH_QUOTATION_DISCOUNT);
      subtotal = subtotal * config.BATCH_QUOTATION_DISCOUNT;
      breakdown.push({
        item: '批量操作折扣',
        cost: -batchDiscount,
        description: '批量询价享受8折优惠'
      });
    }
    
    const totalCost = Math.max(1, Math.round(subtotal)); // 最少消耗1 FCX
    
    return {
      baseCost,
      supplierCost,
      itemCountCost,
      urgentCost,
      templateCost,
      autoFollowUpCost,
      batchDiscount,
      totalCost,
      breakdown
    };
  }
  
  /**
   * 检查用户是否有足够FCX余额
   */
  async checkUserBalance(userId: string, requiredAmount: number): Promise<{
    hasSufficientBalance: boolean;
    currentBalance: number;
    shortfall: number;
  }> {
    try {
      // 获取用户FCX账户
      const { data: account, error: accountError } = await supabase
        .from('fcx_accounts')
        .select('balance')
        .eq('user_id', userId)
        .single();
      
      if (accountError) {
        console.error('获取用户账户失败:', accountError);
        return {
          hasSufficientBalance: false,
          currentBalance: 0,
          shortfall: requiredAmount
        };
      }
      
      const currentBalance = (account as any)?.balance || 0;
      const hasSufficientBalance = currentBalance >= requiredAmount;
      const shortfall = Math.max(0, requiredAmount - currentBalance);
      
      return {
        hasSufficientBalance,
        currentBalance,
        shortfall
      };
      
    } catch (error) {
      console.error('检查用户余额错误:', error);
      return {
        hasSufficientBalance: false,
        currentBalance: 0,
        shortfall: requiredAmount
      };
    }
  }
  
  /**
   * 扣除FCX并记录交易
   */
  async deductFcxForQuotation(
    userId: string,
    consumptionDetail: QuotationConsumptionDetail,
    quotationRequestId: string,
    description: string = '询价消耗'
  ): Promise<{
    success: boolean;
    transactionId?: string;
    errorMessage?: string;
  }> {
    try {
      // 模拟扣除FCX的过程
      // 在实际项目中这里会调用真实的FCX账户服务
      
      // 1. 检查余额（模拟）
      const hasSufficientBalance = await this.simulateBalanceCheck(userId, consumptionDetail.totalCost);
      
      if (!hasSufficientBalance) {
        return {
          success: false,
          errorMessage: `FCX余额不足，需要${consumptionDetail.totalCost} FCX`
        };
      }
      
      // 2. 生成交易ID
      const transactionId = this.generateUUID();
      
      // 3. 记录交易（模拟）
      await this.simulateTransactionRecord(userId, consumptionDetail.totalCost, quotationRequestId, description);
      
      return {
        success: true,
        transactionId
      };
      
    } catch (error) {
      console.error('扣除FCX错误:', error);
      return {
        success: false,
        errorMessage: `系统错误: ${(error as Error).message}`
      };
    }
  }
  
  /**
   * 模拟余额检查
   */
  private async simulateBalanceCheck(userId: string, requiredAmount: number): Promise<boolean> {
    // 在实际项目中这里会调用真实的FCX账户服务
    // 这里返回true表示余额充足
    return true;
  }
  
  /**
   * 模拟交易记录
   */
  private async simulateTransactionRecord(
    userId: string,
    amount: number,
    quotationRequestId: string,
    description: string
  ): Promise<void> {
    // 在实际项目中这里会调用真实的FCX交易服务
    console.log(`记录FCX交易: 用户${userId}, 消耗${amount} FCX, 询价ID:${quotationRequestId}, 描述:${description}`);
  }
  
  /**
   * 检查每日限额
   */
  async checkDailyLimits(userId: string): Promise<{
    canSendQuotation: boolean;
    quotationCountToday: number;
    fcxSpentToday: number;
    errors: string[];
  }> {
    try {
      const config = QUOTATION_CONSUMPTION_CONFIG;
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      
      // 获取今日询价次数
      const { count: quotationCount, error: countError } = await supabase
        .from('quotation_requests')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());
      
      if (countError) {
        console.error('获取询价次数失败:', countError);
      }
      
      const quotationCountToday = quotationCount || 0;
      
      // 获取今日FCX消耗
      const accountIdResult = await supabase
        .from('fcx_accounts')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      const accountId = (accountIdResult.data as any)?.id;
      
      const { data: transactions, error: transactionError } = await supabase
        .from('fcx_transactions' as any)
        .select('amount')
        .eq('from_account_id', accountId)
        .eq('transaction_type', 'spend')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());
      
      if (transactionError) {
        console.error('获取交易记录失败:', transactionError);
      }
      
      const fcxSpentToday = transactions?.reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) || 0;
      
      const errors: string[] = [];
      let canSendQuotation = true;
      
      // 检查询价次数限制
      if (quotationCountToday >= config.DAILY_QUOTATION_LIMIT) {
        errors.push(`今日询价次数已达上限 (${config.DAILY_QUOTATION_LIMIT}次)`);
        canSendQuotation = false;
      }
      
      // 检查FCX消耗限制
      if (fcxSpentToday >= config.DAILY_FCX_SPEND_LIMIT) {
        errors.push(`今日FCX消耗已达上限 (${config.DAILY_FCX_SPEND_LIMIT} FCX)`);
        canSendQuotation = false;
      }
      
      return {
        canSendQuotation,
        quotationCountToday,
        fcxSpentToday,
        errors
      };
      
    } catch (error) {
      console.error('检查每日限额错误:', error);
      return {
        canSendQuotation: false,
        quotationCountToday: 0,
        fcxSpentToday: 0,
        errors: ['系统错误，请稍后重试']
      };
    }
  }
  
  /**
   * 预估询价消耗（不实际扣费）
   */
  async estimateQuotationCost(
    userId: string,
    params: QuotationParameters
  ): Promise<QuotationConsumptionDetail & { 
    canAfford: boolean; 
    currentBalance: number;
    dailyLimits: {
      canSendQuotation: boolean;
      quotationCountToday: number;
      fcxSpentToday: number;
      errors: string[];
    };
  }> {
    try {
      // 计算消耗明细
      const consumptionDetail = this.calculateConsumption(params);
      
      // 检查余额
      const balanceCheck = await this.checkUserBalance(userId, consumptionDetail.totalCost);
      
      // 检查每日限额
      const dailyLimits = await this.checkDailyLimits(userId);
      
      return {
        ...consumptionDetail,
        canAfford: balanceCheck.hasSufficientBalance && dailyLimits.canSendQuotation,
        currentBalance: balanceCheck.currentBalance,
        dailyLimits
      };
      
    } catch (error) {
      console.error('预估询价消耗错误:', error);
      throw error;
    }
  }
  
  /**
   * 生成UUID
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// 导出单例实例
export const quotationConsumptionService = new QuotationConsumptionService();