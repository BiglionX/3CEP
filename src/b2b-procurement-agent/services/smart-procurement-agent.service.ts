import { createClient } from '@supabase/supabase-js';
import {
  quotationConsumptionService,
  QUOTATION_CONSUMPTION_CONFIG,
} from '../../fcx-system';

// 初始化Supabase客户?const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * 智能询价计划接口
 */
export interface SmartQuotationPlan {
  id: string;
  orderId: string;
  supplierGroups: Array<{
    supplierId: string;
    supplierName: string;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unit: string;
    }>;
    estimatedCost: number;
  }>;
  totalEstimatedCost: number;
  quotationCount: number;
  fcxConsumption: number;
  executionTime: string;
}

/**
 * 历史订单分析结果接口
 */
interface HistoricalAnalysis {
  supplierPatterns: Array<{
    supplierId: string;
    supplierName: string;
    suppliedProducts: Array<{
      productId: string;
      productName: string;
      frequency: number;
      avgQuantity: number;
      lastSuppliedDate: string;
    }>;
    reliabilityScore: number; // 0-100
  }>;
  commonProductCombinations: Array<{
    products: string[];
    frequency: number;
  }>;
  seasonalPatterns: Array<{
    month: number;
    products: string[];
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
}

/**
 * 订单修改接口
 */
interface OrderModification {
  type: 'add' | 'remove' | 'modify';
  productId?: string;
  productName?: string;
  quantity?: number;
  unit?: string;
  oldQuantity?: number; // 修改前的数量
}

/**
 * 智能采购代理服务? */
export class SmartProcurementAgentService {
  /**
   * 基于历史订单创建智能询价计划
   */
  async createSmartQuotationFromHistory(
    orderId: string,
    userId: string,
    useHistoricalSuppliersOnly: boolean = true,
    modifications?: OrderModification[]
  ): Promise<{
    success: boolean;
    quotationPlan?: SmartQuotationPlan;
    fcxEstimate?: any;
    errorMessage?: string;
  }> {
    try {
      // 1. 获取原始订单信息
      const order = await this.getOrderById(orderId);
      if (!order) {
        return {
          success: false,
          errorMessage: '订单不存?,
        };
      }

      // 2. 应用订单修改
      const modifiedItems = this.applyModifications(
        order.items,
        modifications || []
      );

      // 3. 分析历史供应商模?      const historicalAnalysis =
        await this.analyzeHistoricalSupplierPatterns(userId);

      // 4. 生成智能询价计划
      const quotationPlan = this.generateSmartQuotationPlan(
        orderId,
        modifiedItems,
        historicalAnalysis,
        useHistoricalSuppliersOnly
      );

      // 5. 计算FCX消?      const fcxEstimate =
        await quotationConsumptionService.estimateQuotationCost(userId, {
          supplierCount: quotationPlan.supplierGroups.length,
          itemCount: modifiedItems.length,
          isUrgent: false,
          useCustomTemplate: false,
          enableAutoFollowUp: true,
          isBatchOperation: quotationPlan.supplierGroups.length > 3,
        });

      return {
        success: true,
        quotationPlan,
        fcxEstimate,
      };
    } catch (error) {
      console.error('创建智能询价计划错误:', error);
      return {
        success: false,
        errorMessage: `创建失败: ${(error as Error).message}`,
      };
    }
  }

  /**
   * 执行智能询价
   */
  async executeSmartQuotation(
    quotationPlan: SmartQuotationPlan,
    userId: string
  ): Promise<{
    success: boolean;
    executedRequests: Array<{
      requestId: string;
      supplierId: string;
      status: string;
    }>;
    totalFcxConsumed: number;
    errorMessage?: string;
  }> {
    try {
      // 1. 检查FCX余额和限?      const fcxCheck =
        await quotationConsumptionService.checkDailyLimits(userId);
      if (!fcxCheck.canSendQuotation) {
        return {
          success: false,
          executedRequests: [],
          totalFcxConsumed: 0,
          errorMessage: fcxCheck.errors.join('; '),
        };
      }

      // 2. 计算总消?      const consumptionParams = {
        supplierCount: quotationPlan.supplierGroups.length,
        itemCount: quotationPlan.supplierGroups.reduce(
          (sum, group) => sum + group.items.length,
          0
        ),
        isUrgent: false,
        useCustomTemplate: false,
        enableAutoFollowUp: true,
        isBatchOperation: quotationPlan.supplierGroups.length > 3,
      };

      const consumptionDetail =
        quotationConsumptionService.calculateConsumption(consumptionParams);

      // 3. 扣除FCX
      const deductionResult =
        await quotationConsumptionService.deductFcxForQuotation(
          userId,
          consumptionDetail,
          quotationPlan.id,
          '智能询价消?
        );

      if (!deductionResult.success) {
        return {
          success: false,
          executedRequests: [],
          totalFcxConsumed: 0,
          errorMessage: deductionResult.errorMessage,
        };
      }

      // 4. 执行询价（模拟）
      const executedRequests =
        await this.simulateQuotationExecution(quotationPlan);

      return {
        success: true,
        executedRequests,
        totalFcxConsumed: consumptionDetail.totalCost,
      };
    } catch (error) {
      console.error('执行智能询价错误:', error);
      return {
        success: false,
        executedRequests: [],
        totalFcxConsumed: 0,
        errorMessage: `执行失败: ${(error as Error).message}`,
      };
    }
  }

  /**
   * 自动完成询价?   */
  async autoCompleteQuotation(
    quotationRequestId: string,
    userId: string
  ): Promise<{
    success: boolean;
    completionStatus: 'completed' | 'partial' | 'failed';
    bestQuotes: Array<any>;
    recommendations: string[];
    savings: number;
    errorMessage?: string;
  }> {
    try {
      // 1. 获取询价请求和报?      const quotationRequest =
        await this.getQuotationRequestById(quotationRequestId);
      if (!quotationRequest) {
        return {
          success: false,
          completionStatus: 'failed',
          bestQuotes: [],
          recommendations: [],
          savings: 0,
          errorMessage: '询价请求不存?,
        };
      }

      const quotes = await this.getSupplierQuotes(quotationRequestId);

      if (quotes.length === 0) {
        return {
          success: false,
          completionStatus: 'failed',
          bestQuotes: [],
          recommendations: [],
          savings: 0,
          errorMessage: '没有收到任何报价',
        };
      }

      // 2. 智能分析和推?      const analysisResult = this.analyzeQuotesIntelligently(
        quotes,
        quotationRequest.items
      );

      // 3. 生成完成状?      const completionStatus = quotes.length >= 3 ? 'completed' : 'partial';

      return {
        success: true,
        completionStatus,
        bestQuotes: analysisResult.bestQuotes,
        recommendations: analysisResult.recommendations,
        savings: analysisResult.estimatedSavings,
      };
    } catch (error) {
      console.error('自动完成询价错误:', error);
      return {
        success: false,
        completionStatus: 'failed',
        bestQuotes: [],
        recommendations: [],
        savings: 0,
        errorMessage: `自动完成失败: ${(error as Error).message}`,
      };
    }
  }

  /**
   * 修改并重新发送订?   */
  async modifyAndResendOrder(
    orderId: string,
    modifications: OrderModification[],
    userId: string
  ): Promise<{
    success: boolean;
    newOrderId?: string;
    quotationPlan?: SmartQuotationPlan;
    errorMessage?: string;
  }> {
    try {
      // 1. 获取原订?      const originalOrder = await this.getOrderById(orderId);
      if (!originalOrder) {
        return {
          success: false,
          errorMessage: '原订单不存在',
        };
      }

      // 2. 应用修改
      const modifiedItems = this.applyModifications(
        originalOrder.items,
        modifications
      );

      // 3. 创建新订?      const newOrder = await this.createNewOrder({
        ...originalOrder,
        items: modifiedItems,
        parentId: orderId,
        status: 'draft',
      });

      // 4. 基于新订单创建智能询价计?      const result = await this.createSmartQuotationFromHistory(
        newOrder.id,
        userId,
        true,
        modifications
      );

      if (!result.success) {
        return {
          success: false,
          errorMessage: result.errorMessage,
        };
      }

      return {
        success: true,
        newOrderId: newOrder.id,
        quotationPlan: result.quotationPlan,
      };
    } catch (error) {
      console.error('修改并重发订单错?', error);
      return {
        success: false,
        errorMessage: `操作失败: ${(error as Error).message}`,
      };
    }
  }

  // 私有辅助方法

  private async getOrderById(orderId: string) {
    const { data, error } = await supabase
      .from('procurement_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('获取订单失败:', error);
      return null;
    }

    return data;
  }

  private applyModifications(
    items: any[],
    modifications: OrderModification[]
  ): any[] {
    let modifiedItems = [...items];

    for (const mod of modifications) {
      switch (mod.type) {
        case 'add':
          modifiedItems.push({
            product_id: mod.productId,
            product_name: mod.productName,
            quantity: mod.quantity,
            unit: mod.unit,
          });
          break;

        case 'remove':
          modifiedItems = modifiedItems.filter(
            item => item.product_id !== mod.productId
          );
          break;

        case 'modify':
          const itemIndex = modifiedItems.findIndex(
            item => item.product_id === mod.productId
          );
          if (itemIndex !== -1 && mod.quantity !== undefined) {
            modifiedItems[itemIndex].quantity = mod.quantity;
          }
          break;
      }
    }

    return modifiedItems;
  }

  private async analyzeHistoricalSupplierPatterns(
    userId: string
  ): Promise<HistoricalAnalysis> {
    // 模拟历史数据分析
    // 在实际项目中这里会查询数据库分析历史供应商模?
    return {
      supplierPatterns: [
        {
          supplierId: 'supplier-001',
          supplierName: '优质供应商A',
          suppliedProducts: [
            {
              productId: 'prod-001',
              productName: '电子元件A',
              frequency: 15,
              avgQuantity: 100,
              lastSuppliedDate: '2024-01-15',
            },
          ],
          reliabilityScore: 95,
        },
      ],
      commonProductCombinations: [
        {
          products: ['prod-001', 'prod-002'],
          frequency: 8,
        },
      ],
      seasonalPatterns: [
        {
          month: 3,
          products: ['prod-001'],
          trend: 'increasing',
        },
      ],
    };
  }

  private generateSmartQuotationPlan(
    orderId: string,
    items: any[],
    analysis: HistoricalAnalysis,
    useHistoricalOnly: boolean
  ): SmartQuotationPlan {
    // 基于历史分析生成智能询价计划
    const supplierGroups = analysis.supplierPatterns
      .filter(supplier => !useHistoricalOnly || supplier.reliabilityScore > 80)
      .slice(0, QUOTATION_CONSUMPTION_CONFIG.MAX_SUPPLIERS_LIMIT)
      .map(supplier => ({
        supplierId: supplier.supplierId,
        supplierName: supplier.supplierName,
        items: items.map(item => ({
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          unit: item.unit,
        })),
        estimatedCost: items.reduce((sum, item) => sum + item.quantity * 50, 0), // 模拟估算
      }));

    const totalEstimatedCost = supplierGroups.reduce(
      (sum, group) => sum + group.estimatedCost,
      0
    );

    return {
      id: this.generateUUID(),
      orderId,
      supplierGroups,
      totalEstimatedCost,
      quotationCount: supplierGroups.length,
      fcxConsumption: quotationConsumptionService.calculateConsumption({
        supplierCount: supplierGroups.length,
        itemCount: items.length,
        isUrgent: false,
        useCustomTemplate: false,
        enableAutoFollowUp: true,
        isBatchOperation: supplierGroups.length > 3,
      }).totalCost,
      executionTime: new Date().toISOString(),
    };
  }

  private async simulateQuotationExecution(
    plan: SmartQuotationPlan
  ): Promise<Array<any>> {
    // 模拟询价执行过程
    const executedRequests = [];

    for (const group of plan.supplierGroups) {
      // 模拟创建询价请求
      const requestId = this.generateUUID();

      executedRequests.push({
        requestId,
        supplierId: group.supplierId,
        status: 'sent',
      });

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`向供应商 ${group.supplierName} 发送询价，ID: ${requestId}`)}

    return executedRequests;
  }

  private async getQuotationRequestById(requestId: string) {
    const { data, error } = await supabase
      .from('quotation_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error) {
      console.error('获取询价请求失败:', error);
      return null;
    }

    return data;
  }

  private async getSupplierQuotes(quotationRequestId: string) {
    const { data, error } = await supabase
      .from('supplier_quotes')
      .select('*')
      .eq('quotation_request_id', quotationRequestId);

    if (error) {
      console.error('获取供应商报价失?', error);
      return [];
    }

    return data || [];
  }

  private analyzeQuotesIntelligently(quotes: any[], items: any[]) {
    // 智能报价分析算法
    const sortedQuotes = [...quotes].sort(
      (a, b) => a.total_amount - b.total_amount
    );
    const bestQuotes = sortedQuotes.slice(0, 3); // 选择最优的3个报?
    const recommendations = [
      `推荐选择供应?${bestQuotes[0]?.supplier_name || '未知'}，价格最优`,
      `建议对比?名供应商的服务条款`,
      `注意检查交货时间和质量保证`,
    ];

    const estimatedSavings =
      sortedQuotes.length > 1
        ? sortedQuotes[0].total_amount -
          sortedQuotes[sortedQuotes.length - 1].total_amount
        : 0;

    return {
      bestQuotes,
      recommendations,
      estimatedSavings,
    };
  }

  private async createNewOrder(orderData: any) {
    const { data, error } = await supabase
      .from('procurement_orders')
      .insert({
        ...orderData,
        id: this.generateUUID(),
        created_at: new Date(),
      } as any)
      .select()
      .single();

    if (error) {
      throw new Error(`创建订单失败: ${error.message}`);
    }

    return data;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    ) as any;
  }
}

// 导出单例实例
export const smartProcurementAgentService = new SmartProcurementAgentService();
