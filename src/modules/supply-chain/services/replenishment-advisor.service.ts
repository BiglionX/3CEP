/**
 * 智能补货建议顾问服务
 * 基于高级库存管理理论提供精准的补货建? */

import {
  ReplenishmentSuggestion,
  ReplenishmentRequest,
} from '../models/recommendation.model';
import { InventoryRecord } from '../models/inventory.model';
import { DemandForecastService } from './demand-forecast.service';
import { InventoryService } from './inventory.service';
import { supabase } from '@/lib/supabase';

interface CostParameters {
  unitCost: number;
  holdingCostRate: number;
  orderingCost: number;
  shortageCostRate: number;
}

interface LeadTimeInfo {
  averageLeadTime: number;
  leadTimeVariability: number;
  supplierReliability: number;
}

interface SeasonalAdjustment {
  seasonalFactor: number;
  trendFactor: number;
  promotionalFactor: number;
}

export class ReplenishmentAdvisorService {
  private forecastService: DemandForecastService;
  private inventoryService: InventoryService;

  constructor() {
    this.forecastService = new DemandForecastService();
    this.inventoryService = new InventoryService();
  }

  /**
   * 生成智能补货建议
   */
  async generateSmartReplenishmentAdvice(
    request: ReplenishmentRequest
  ): Promise<ReplenishmentSuggestion[]> {
    try {
      const startTime = Date.now();

      // 1. 获取产品列表
      const productIds = await this.getProductList(
        request.warehouseId,
        request.productIds
      );

      // 2. 并行获取所需数据
      const [forecasts, inventories, costParams, leadTimes] = await Promise.all(
        [
          this.getDemandForecasts(
            productIds,
            request.warehouseId,
            request.forecastHorizonDays
          ),
          this.getCurrentInventories(productIds, request.warehouseId),
          this.getCostParameters(productIds),
          this.getLeadTimeInformation(productIds),
        ]
      );

      // 3. 为每个产品生成补货建?      const suggestions = await Promise.all(
        productIds.map(async productId => {
          const forecast = forecasts.find(f => f.productId === productId);
          const inventory = inventories.find(i => i.productId === productId);
          const costs = costParams[productId] || this.getDefaultCosts();
          const leadTime = leadTimes[productId] || this.getDefaultLeadTime();

          if (!forecast || !inventory) return null;

          return await this.calculateReplenishmentAdvice(
            productId,
            forecast,
            inventory,
            costs,
            leadTime,
            request.serviceLevelTarget || 0.95
          );
        })
      );

      // 4. 过滤无效建议并排?      const validSuggestions = suggestions.filter(
        Boolean
      ) as ReplenishmentSuggestion[];

      const prioritizedSuggestions =
        this.prioritizeSuggestions(validSuggestions);

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
        `📈 智能补货建议生成完成，共${validSuggestions.length}个建议，耗时: ${Date.now()- startTime}ms`
      );

      return prioritizedSuggestions;
    } catch (error) {
      console.error('生成补货建议错误:', error);
      throw error;
    }
  }

  /**
   * 计算单个产品的补货建?   */
  private async calculateReplenishmentAdvice(
    productId: string,
    forecast: any,
    inventory: InventoryRecord,
    costs: CostParameters,
    leadTime: LeadTimeInfo,
    serviceLevel: number
  ): Promise<ReplenishmentSuggestion | null> {
    // 1. 计算基础参数
    const dailyDemand = forecast.predictedDemand / 30;
    const leadTimeDays = leadTime.averageLeadTime;

    // 2. 计算安全库存（考虑服务水平?    const safetyStock = this.calculateAdvancedSafetyStock(
      dailyDemand,
      leadTimeDays,
      leadTime.leadTimeVariability,
      serviceLevel,
      forecast.seasonalPatterns
    );

    // 3. 计算重新订购?    const reorderPoint = this.calculateReorderPoint(
      dailyDemand,
      leadTimeDays,
      safetyStock,
      forecast.externalFactors
    );

    // 4. 检查是否需要补?    const needReplenishment = this.shouldReplenish(
      inventory,
      reorderPoint,
      safetyStock
    );
    if (!needReplenishment) return null;

    // 5. 计算最优订货量（EOQ变种?    const eoq = this.calculateEnhancedEOQ(
      dailyDemand,
      costs,
      leadTimeDays,
      forecast.trend
    );

    // 6. 确定建议订货?    const suggestedQuantity = this.determineOrderQuantity(
      inventory.quantity,
      reorderPoint,
      eoq,
      safetyStock
    );

    // 7. 计算紧急程?    const urgency = this.determineUrgency(
      inventory.quantity,
      safetyStock,
      reorderPoint,
      leadTimeDays
    );

    // 8. 成本效益分析
    const costAnalysis = this.performCostBenefitAnalysis(
      suggestedQuantity,
      dailyDemand,
      costs,
      leadTimeDays
    );

    // 9. 生成建议原因
    const recommendationReason = this.generateRecommendationReason(
      inventory,
      forecast,
      urgency,
      suggestedQuantity
    );

    return {
      productId,
      productName: await this.getProductName(productId),
      warehouseId: inventory.warehouseId,
      warehouseName: await this.getWarehouseName(inventory.warehouseId),
      currentStock: inventory.quantity,
      safetyStock,
      reorderPoint,
      suggestedOrderQuantity: suggestedQuantity,
      optimalOrderQuantity: eoq,
      forecastedDemand: forecast.predictedDemand,
      demandVariance:
        forecast.confidenceInterval[1] - forecast.confidenceInterval[0],
      supplierLeadTime: leadTimeDays,
      holdingCost: costAnalysis.holdingCost,
      orderingCost: costAnalysis.orderingCost,
      shortageCost: costAnalysis.shortageCost,
      urgency,
      recommendationReason,
      costAnalysis: {
        totalAnnualCost: costAnalysis.totalAnnualCost,
        holdingCostComponent: costAnalysis.holdingCost,
        orderingCostComponent: costAnalysis.orderingCost,
        shortageCostComponent: costAnalysis.shortageCost,
      },
      createdAt: new Date(),
    };
  }

  /**
   * 高级安全库存计算
   */
  private calculateAdvancedSafetyStock(
    dailyDemand: number,
    leadTimeDays: number,
    leadTimeVariability: number,
    serviceLevel: number,
    seasonalPatterns: number[]
  ): number {
    // 基础安全库存
    const zScore = this.getServiceLevelZScore(serviceLevel);
    const demandStdDev = dailyDemand * 0.3; // 假设30%的需求波?
    let baseSafetyStock =
      zScore *
      Math.sqrt(
        Math.pow(demandStdDev, 2) * leadTimeDays +
          Math.pow(dailyDemand, 2) * Math.pow(leadTimeVariability, 2)
      );

    // 季节性调?    if (seasonalPatterns && seasonalPatterns.length > 0) {
      const seasonalAdjustment =
        Math.max(...seasonalPatterns) /
        (seasonalPatterns.reduce((a, b) => a + b, 0) / seasonalPatterns.length);
      baseSafetyStock *= seasonalAdjustment;
    }

    // 最小安全库存保?    const minSafetyStock = dailyDemand * 3; // 至少3天的安全库存

    return Math.max(Math.ceil(baseSafetyStock), minSafetyStock);
  }

  /**
   * 计算重新订购?   */
  private calculateReorderPoint(
    dailyDemand: number,
    leadTimeDays: number,
    safetyStock: number,
    externalFactors: any[]
  ): number {
    let baseReorderPoint = dailyDemand * leadTimeDays + safetyStock;

    // 考虑外部因素影响
    if (externalFactors && externalFactors.length > 0) {
      const totalImpact = externalFactors.reduce(
        (sum, factor) => sum + factor.impact * factor.confidence,
        0
      );
      baseReorderPoint *= 1 + totalImpact;
    }

    return Math.ceil(baseReorderPoint);
  }

  /**
   * 判断是否需要补?   */
  private shouldReplenish(
    inventory: InventoryRecord,
    reorderPoint: number,
    safetyStock: number
  ): boolean {
    // 当前库存低于重新订购点，或低于安全库存的80%
    return (
      inventory.quantity <= reorderPoint ||
      inventory.quantity <= safetyStock * 0.8
    );
  }

  /**
   * 增强版EOQ计算
   */
  private calculateEnhancedEOQ(
    dailyDemand: number,
    costs: CostParameters,
    leadTimeDays: number,
    trend: string
  ): number {
    const annualDemand = dailyDemand * 365;

    // 考虑趋势调整
    let trendMultiplier = 1;
    if (trend === 'increasing') {
      trendMultiplier = 1.1; // 增加10%
    } else if (trend === 'decreasing') {
      trendMultiplier = 0.9; // 减少10%
    }

    const adjustedAnnualDemand = annualDemand * trendMultiplier;

    // EOQ公式
    const eoq = Math.sqrt(
      (2 * adjustedAnnualDemand * costs.orderingCost) /
        (costs.unitCost * costs.holdingCostRate)
    );

    // 考虑最小订货量约束
    const minOrderQty = Math.max(eoq, dailyDemand * leadTimeDays * 1.5);

    // 考虑最大库存限?    const maxOrderQty = dailyDemand * leadTimeDays * 6; // 最?个补货周期的?
    return Math.min(
      Math.max(Math.ceil(minOrderQty), 1),
      Math.ceil(maxOrderQty)
    );
  }

  /**
   * 确定最终订货量
   */
  private determineOrderQuantity(
    currentStock: number,
    reorderPoint: number,
    eoq: number,
    safetyStock: number
  ): number {
    // 基础订货量：补充到重新订购点以上一个EOQ量级
    let baseOrderQty = reorderPoint + eoq - currentStock;

    // 确保不低于最小安全库存需?    const minRequired = safetyStock * 1.5 - currentStock;
    baseOrderQty = Math.max(baseOrderQty, minRequired);

    // 确保为正?    return Math.max(Math.ceil(baseOrderQty), 1);
  }

  /**
   * 紧急程度判?   */
  private determineUrgency(
    currentStock: number,
    safetyStock: number,
    reorderPoint: number,
    leadTimeDays: number
  ): 'immediate' | 'soon' | 'planned' {
    const daysOfSupply = currentStock / (reorderPoint / leadTimeDays || 1);

    if (currentStock <= safetyStock || daysOfSupply <= 1) {
      return 'immediate'; // 立即补货
    } else if (currentStock <= reorderPoint || daysOfSupply <= 3) {
      return 'soon'; // 尽快补货
    } else {
      return 'planned'; // 计划补货
    }
  }

  /**
   * 成本效益分析
   */
  private performCostBenefitAnalysis(
    orderQuantity: number,
    dailyDemand: number,
    costs: CostParameters,
    leadTimeDays: number
  ) {
    const annualDemand = dailyDemand * 365;
    const cycleTime = (orderQuantity / annualDemand) * 365; // 订货周期（天?
    // 持有成本
    const avgInventory = orderQuantity / 2;
    const holdingCost = avgInventory * costs.unitCost * costs.holdingCostRate;

    // 订购成本
    const orderingCost = (annualDemand / orderQuantity) * costs.orderingCost;

    // 缺货成本（简化估算）
    const serviceLevel = 0.95;
    const shortageUnits = annualDemand * (1 - serviceLevel) * 0.1; // 估算10%的缺货量
    const shortageCost =
      shortageUnits * costs.unitCost * costs.shortageCostRate;

    const totalAnnualCost = holdingCost + orderingCost + shortageCost;

    return {
      holdingCost,
      orderingCost,
      shortageCost,
      totalAnnualCost,
    };
  }

  /**
   * 建议优先级排?   */
  private prioritizeSuggestions(
    suggestions: ReplenishmentSuggestion[]
  ): ReplenishmentSuggestion[] {
    return suggestions.sort((a, b) => {
      // 紧急程度优先级
      const urgencyPriority = { immediate: 3, soon: 2, planned: 1 };

      // 价值优先级（基于建议订单金额）
      const aValue = a.suggestedOrderQuantity * 100; // 假设平均单价100
      const bValue = b.suggestedOrderQuantity * 100;

      // 综合评分
      const aScore = urgencyPriority[a.urgency] * 1000 + aValue;
      const bScore = urgencyPriority[b.urgency] * 1000 + bValue;

      return bScore - aScore;
    });
  }

  // 数据获取辅助方法

  private async getProductList(
    warehouseId: string,
    specifiedProducts?: string[]
  ): Promise<string[]> {
    if (specifiedProducts && specifiedProducts.length > 0) {
      return specifiedProducts;
    }

    // 获取仓库中所有有库存的产?    const inventories = await this.inventoryService.listInventory({
      warehouseId,
    });
    return [...new Set(inventories.map(inv => inv.productId))];
  }

  private async getDemandForecasts(
    productIds: string[],
    warehouseId: string,
    horizonDays?: number
  ) {
    return Promise.all(
      productIds.map(productId =>
        this.forecastService.predictDemand(
          productId,
          warehouseId,
          horizonDays || 30
        )
      )
    );
  }

  private async getCurrentInventories(
    productIds: string[],
    warehouseId: string
  ) {
    return Promise.all(
      productIds.map(productId =>
        this.inventoryService.getInventory(productId, warehouseId)
      )
    ).then(results => results.filter(Boolean) as InventoryRecord[]);
  }

  private async getCostParameters(
    productIds: string[]
  ): Promise<Record<string, CostParameters>> {
    const params: Record<string, CostParameters> = {};

    for (const productId of productIds) {
      try {
        // 从数据库获取实际成本数据
        const { data, error } = await supabase
          .from('products')
          .select('unit_cost, category')
          .eq('id', productId)
          .single();

        if (data && !error) {
          params[productId] = {
            unitCost: data.unit_cost || 100,
            holdingCostRate: 0.2, // 20%年持有成本率
            orderingCost: 50, // 固定订购成本
            shortageCostRate: 0.5, // 50%缺货成本?          };
        } else {
          params[productId] = this.getDefaultCosts();
        }
      } catch (error) {
        params[productId] = this.getDefaultCosts();
      }
    }

    return params;
  }

  private async getLeadTimeInformation(
    productIds: string[]
  ): Promise<Record<string, LeadTimeInfo>> {
    const leadTimes: Record<string, LeadTimeInfo> = {};

    for (const productId of productIds) {
      try {
        // 从采购历史获取供应商交货时间数据
        const { data, error } = await supabase
          .from('purchase_orders')
          .select('actual_delivery_date, expected_delivery_date')
          .eq('product_id', productId)
          .not('actual_delivery_date', 'is', null)
          .limit(20);

        if (data && !error && (data as any)?.data.length > 0) {
          const leadTimeData = data.map(order => {
            const expected = new Date(order.expected_delivery_date);
            const actual = new Date(order.actual_delivery_date);
            return (
              (actual.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24)
            );
          });

          const avgLeadTime =
            leadTimeData.reduce((sum, lt) => sum + lt, 0) / leadTimeData.length;
          const variance =
            leadTimeData.reduce(
              (sum, lt) => sum + Math.pow(lt - avgLeadTime, 2),
              0
            ) / leadTimeData.length;

          leadTimes[productId] = {
            averageLeadTime: Math.max(1, Math.round(avgLeadTime)),
            leadTimeVariability: Math.sqrt(variance),
            supplierReliability: Math.min(1, (data as any)?.data.length / 20), // 基于样本量的可靠性评?          };
        } else {
          leadTimes[productId] = this.getDefaultLeadTime();
        }
      } catch (error) {
        leadTimes[productId] = this.getDefaultLeadTime();
      }
    }

    return leadTimes;
  }

  private getDefaultCosts(): CostParameters {
    return {
      unitCost: 100,
      holdingCostRate: 0.2,
      orderingCost: 50,
      shortageCostRate: 0.5,
    };
  }

  private getDefaultLeadTime(): LeadTimeInfo {
    return {
      averageLeadTime: 7,
      leadTimeVariability: 2,
      supplierReliability: 0.9,
    };
  }

  private getServiceLevelZScore(serviceLevel: number): number {
    // 简化的服务水平到Z分数映射
    const zScores: Record<number, number> = {
      0.8: 0.84,
      0.85: 1.04,
      0.9: 1.28,
      0.95: 1.645,
      0.99: 2.33,
    };

    const closestLevel = Object.keys(zScores)
      .map(Number)
      .reduce((prev, curr) =>
        Math.abs(curr - serviceLevel) < Math.abs(prev - serviceLevel)
          ? curr
          : prev
      );

    return zScores[closestLevel] || 1.645;
  }

  private async getProductName(productId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('name')
        .eq('id', productId)
        .single();

      return data?.name || `产品-${productId}`;
    } catch (error) {
      return `产品-${productId}`;
    }
  }

  private async getWarehouseName(warehouseId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('name')
        .eq('id', warehouseId)
        .single();

      return data?.name || `仓库-${warehouseId}`;
    } catch (error) {
      return `仓库-${warehouseId}`;
    }
  }

  private generateRecommendationReason(
    inventory: InventoryRecord,
    forecast: any,
    urgency: string,
    suggestedQty: number
  ): string {
    const reasons = [];

    if (inventory.quantity <= inventory.safetyStock) {
      reasons.push('库存已低于安全库存水?);
    }

    if (inventory.quantity <= forecast.predictedDemand * 0.1) {
      reasons.push('库存仅够短期需?);
    }

    if (forecast.trend === 'increasing') {
      reasons.push('预期需求呈上升趋势');
    }

    if (forecast.externalFactors && forecast.externalFactors.length > 0) {
      const positiveFactors = forecast.externalFactors.filter(
        (f: any) => f.impact > 0
      );
      if (positiveFactors.length > 0) {
        reasons.push('存在积极的外部影响因?);
      }
    }

    return `${reasons.join('�?)}。建议立即订?{suggestedQty}件以维持正常运营。`;
  }
}
