/**
 * 智能推荐引擎服务实现
 * 提供地理位置推荐、库存优化、供应商匹配等核心功能
 */

import { 
  RecommendationType,
  WarehouseRecommendation,
  InventoryOptimizationSuggestion,
  SupplierMatchRecommendation,
  ReplenishmentSuggestion,
  PricingStrategyRecommendation,
  RecommendationContext,
  DemandForecast,
  WarehouseRecommendationRequest,
  InventoryOptimizationRequest,
  SupplierMatchingRequest,
  ReplenishmentRequest,
  PricingStrategyRequest,
  GeoLocation,
  UserLocation
} from '../models/recommendation.model';
import { supabase } from '@/lib/supabase';
import { generateUUID } from '@/fcx-system/utils/helpers';
import { WarehouseService } from './warehouse.service';
import { InventoryService } from './inventory.service';
import { SupplierService } from './supplier.service';
import { DemandForecastService } from './demand-forecast.service';
import { ReplenishmentAdvisorService } from './replenishment-advisor.service';

export class RecommendationService {
  private warehouseService: WarehouseService;
  private inventoryService: InventoryService;
  private supplierService: SupplierService;
  private forecastService: DemandForecastService;
  private replenishmentAdvisor: ReplenishmentAdvisorService;

  constructor() {
    this.warehouseService = new WarehouseService();
    this.inventoryService = new InventoryService();
    this.supplierService = new SupplierService();
    this.forecastService = new DemandForecastService();
    this.replenishmentAdvisor = new ReplenishmentAdvisorService();
  }

  /**
   * 智能仓库位置推荐
   */
  async recommendWarehouses(request: WarehouseRecommendationRequest): Promise<WarehouseRecommendation[]> {
    try {
      const startTime = Date.now();
      
      // 1. 获取所有活跃仓库
      const warehouses = await this.warehouseService.listWarehouses({
        status: 'active' as any
      });

      // 2. 计算距离和配送时间
      const recommendations = await Promise.all(
        warehouses.map(async (warehouse) => {
          const distance = this.calculateDistance(
            request.userLocation.coordinates,
            warehouse.location.coordinates
          );
          
          const deliveryTime = await this.estimateDeliveryTime(
            distance,
            warehouse.logisticsInfo.deliveryTime.domestic,
            warehouse.logisticsInfo.deliveryTime.international
          );

          // 3. 获取产品库存和价格信息
          const productInfo = await Promise.all(
            request.productIds.map(async (productId) => {
              const inventory = await this.inventoryService.getInventory(productId, warehouse.id);
              return {
                productId,
                price: this.calculateProductPrice(productId, warehouse.id),
                inventoryStatus: inventory?.status || 'out_of_stock',
                availableQuantity: inventory?.availableQuantity || 0
              };
            })
          );

          // 4. 计算综合评分
          const scores = this.calculateWarehouseScore(
            distance,
            deliveryTime,
            productInfo,
            warehouse.performanceMetrics.accuracyRate,
            warehouse.performanceMetrics.onTimeRate
          );

          return {
            warehouseId: warehouse.id,
            warehouseName: warehouse.name,
            warehouseCode: warehouse.code,
            location: warehouse.location.coordinates,
            distance,
            estimatedDeliveryTime: deliveryTime,
            shippingCost: this.calculateShippingCost(distance, request.quantities || {}),
            inventoryStatus: this.getOverallInventoryStatus(productInfo.map(p => p.inventoryStatus)),
            availableQuantity: productInfo.reduce((sum, p) => sum + p.availableQuantity, 0),
            productPrices: productInfo,
            serviceScore: warehouse.performanceMetrics.accuracyRate,
            reliabilityScore: warehouse.performanceMetrics.onTimeRate,
            recommendationScore: scores.overallScore,
            reasons: scores.reasons,
            createdAt: new Date()
          };
        })
      );

      // 5. 根据优化目标排序
      const sortedRecommendations = this.rankWarehouseRecommendations(
        recommendations,
        request.optimizationGoal || 'balanced'
      );

      // 6. 应用约束条件过滤
      const filteredRecommendations = this.applyConstraints(
        sortedRecommendations,
        request.deliveryTimePreference,
        request.budgetConstraint
      );

      console.log(`🏪 仓库推荐完成，耗时: ${Date.now() - startTime}ms`);
      return filteredRecommendations.slice(0, 10); // 返回前10个推荐

    } catch (error) {
      console.error('仓库推荐错误:', error);
      throw error;
    }
  }

  /**
   * 库存优化建议
   */
  async getInventoryOptimizationSuggestions(request: InventoryOptimizationRequest): Promise<InventoryOptimizationSuggestion[]> {
    try {
      const startTime = Date.now();
      
      // 1. 获取仓库库存数据
      const inventories = await this.getWarehouseInventories(request.warehouseId, request.productIds);

      // 2. 分析每个产品的库存状况
      const suggestions = await Promise.all(
        inventories.map(async (inventory) => {
          const productInfo = await this.getProductInfo(inventory.productId);
          const salesData = await this.getSalesHistory(inventory.productId, request.analysisPeriodDays || 90);
          
          // 3. 计算关键指标
          const turnoverRate = this.calculateTurnoverRate(salesData, inventory.quantity);
          const obsolescenceRisk = this.assessObsolescenceRisk(salesData, inventory.quantity);
          const safetyStock = this.calculateSafetyStock(salesData);
          const reorderPoint = this.calculateReorderPoint(salesData, safetyStock);

          // 4. 生成优化建议
          const suggestion = this.generateOptimizationSuggestion(
            inventory,
            productInfo,
            salesData,
            safetyStock,
            reorderPoint,
            turnoverRate,
            obsolescenceRisk
          );

          return suggestion;
        })
      );

      // 5. 按优先级排序
      const prioritizedSuggestions = suggestions
        .filter(s => s.priority !== 'low')
        .sort((a, b) => {
          const priorityMap = { high: 3, medium: 2, low: 1 };
          return priorityMap[b.priority] - priorityMap[a.priority];
        });

      console.log(`📊 库存优化建议生成完成，耗时: ${Date.now() - startTime}ms`);
      return prioritizedSuggestions;

    } catch (error) {
      console.error('库存优化建议错误:', error);
      throw error;
    }
  }

  /**
   * 供应商智能匹配
   */
  async matchSuppliers(request: SupplierMatchingRequest): Promise<SupplierMatchRecommendation[]> {
    try {
      const startTime = Date.now();
      
      // 1. 获取合格供应商列表
      const suppliers = await this.supplierService.listSuppliers({
        status: 'approved' as any
      });

      // 2. 为每个供应商计算匹配度
      const matches = await Promise.all(
        suppliers.map(async (supplier) => {
          // 3. 计算各项评分
          const distanceScore = this.calculateDistanceScore(
            request.locationPreferences,
            { address: supplier.address, city: supplier.city, country: supplier.country } // 使用供应商地址信息
          );
          
          const priceScore = await this.calculatePriceCompetitiveness(
            supplier.id,
            request.productRequirements
          );
          
          const qualityScore = this.calculateQualityScore(supplier);
          const deliveryScore = this.calculateDeliveryScore(supplier, request.productRequirements);
          const serviceScore = supplier.rating * 20; // 转换为0-100分

          // 4. 计算综合得分
          const totalScore = (
            distanceScore * 0.2 +
            priceScore * 0.3 +
            qualityScore * 0.25 +
            deliveryScore * 0.15 +
            serviceScore * 0.1
          );

          // 5. 生成匹配理由
          const reasons = this.generateMatchReasons(
            distanceScore,
            priceScore,
            qualityScore,
            deliveryScore,
            serviceScore
          );

          return {
            supplierId: supplier.id,
            supplierName: supplier.name,
            supplierCode: supplier.code,
            supplierRating: supplier.rating,
            creditLevel: supplier.creditLevel,
            distance: this.calculateSupplierDistance(request.locationPreferences, { address: supplier.address, city: supplier.city }),
            leadTime: 7, // 默认7天交货期
            unitPrice: await this.getAverageUnitPrice(supplier.id, request.productRequirements),
            moq: 100, // 默认最小起订量
            qualityScore,
            deliveryReliability: deliveryScore,
            serviceScore,
            totalScore,
            matchReasons: reasons,
            riskFactors: this.identifyRiskFactors(supplier),
            certifications: supplier.certifications?.map(c => c.type) || [],
            createdAt: new Date()
          };
        })
      );

      // 6. 按得分排序并过滤
      const rankedMatches = matches
        .filter(match => match.totalScore >= 60) // 最低60分门槛
        .sort((a, b) => b.totalScore - a.totalScore);

      console.log(`🤝 供应商匹配完成，耗时: ${Date.now() - startTime}ms`);
      return rankedMatches.slice(0, 15);

    } catch (error) {
      console.error('供应商匹配错误:', error);
      throw error;
    }
  }

  /**
   * 智能补货建议
   */
  async getReplenishmentSuggestions(request: ReplenishmentRequest): Promise<ReplenishmentSuggestion[]> {
    try {
      console.log('🚀 启动智能补货建议引擎...');
      
      // 使用增强版补货顾问服务
      const suggestions = await this.replenishmentAdvisor.generateSmartReplenishmentAdvice(request);
      
      console.log(`✅ 智能补货建议完成，生成${suggestions.length}个建议`);
      return suggestions;

    } catch (error) {
      console.error('智能补货建议错误:', error);
      throw error;
    }
  }

  // 私有辅助方法

  private calculateDistance(loc1: GeoLocation, loc2: GeoLocation): number {
    // 使用Haversine公式计算两点间距离
    const R = 6371; // 地球半径(km)
    const dLat = this.deg2rad(loc2.lat - loc1.lat);
    const dLon = this.deg2rad(loc2.lng - loc1.lng);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(loc1.lat)) * Math.cos(this.deg2rad(loc2.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private async estimateDeliveryTime(
    distance: number,
    domesticTime: number,
    internationalTime: number
  ): Promise<number> {
    // 简化的配送时间估算
    if (distance <= 100) {
      return domesticTime * 0.5; // 本地配送
    } else if (distance <= 1000) {
      return domesticTime; // 国内配送
    } else {
      return internationalTime; // 国际配送
    }
  }

  private calculateProductPrice(productId: string, warehouseId: string): number {
    // 模拟价格计算，实际应查询数据库
    return Math.floor(Math.random() * 1000) + 100;
  }

  private calculateWarehouseScore(
    distance: number,
    deliveryTime: number,
    productInfo: any[],
    serviceScore: number,
    reliabilityScore: number
  ): { overallScore: number; reasons: string[] } {
    // 距离得分 (越近越好)
    const distanceScore = Math.max(0, 100 - (distance / 10));
    
    // 配送时间得分 (越快越好)
    const timeScore = Math.max(0, 100 - (deliveryTime / 2));
    
    // 库存充足度得分
    const inStockCount = productInfo.filter(p => p.inventoryStatus === 'in_stock').length;
    const stockScore = (inStockCount / productInfo.length) * 100;
    
    // 综合得分
    const overallScore = (
      distanceScore * 0.25 +
      timeScore * 0.25 +
      stockScore * 0.25 +
      serviceScore * 0.15 +
      reliabilityScore * 0.10
    );

    const reasons = [];
    if (distanceScore > 80) reasons.push('地理位置优越');
    if (timeScore > 80) reasons.push('配送时效快');
    if (stockScore > 80) reasons.push('库存充足');
    if (serviceScore > 90) reasons.push('服务质量高');

    return { overallScore, reasons };
  }

  private rankWarehouseRecommendations(
    recommendations: WarehouseRecommendation[],
    optimizationGoal: string
  ): WarehouseRecommendation[] {
    return recommendations.sort((a, b) => {
      switch (optimizationGoal) {
        case 'fastest_delivery':
          return a.estimatedDeliveryTime - b.estimatedDeliveryTime;
        case 'lowest_cost':
          return a.shippingCost - b.shippingCost;
        case 'best_service':
          return b.serviceScore - a.serviceScore;
        default: // balanced
          return b.recommendationScore - a.recommendationScore;
      }
    });
  }

  private applyConstraints(
    recommendations: WarehouseRecommendation[],
    deliveryTimePreference?: number,
    budgetConstraint?: number
  ): WarehouseRecommendation[] {
    return recommendations.filter(rec => {
      if (deliveryTimePreference && rec.estimatedDeliveryTime > deliveryTimePreference) {
        return false;
      }
      if (budgetConstraint && rec.shippingCost > budgetConstraint) {
        return false;
      }
      return true;
    });
  }

  private getOverallInventoryStatus(statuses: string[]): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (statuses.some(s => s === 'out_of_stock')) return 'out_of_stock';
    if (statuses.some(s => s === 'low_stock')) return 'low_stock';
    return 'in_stock';
  }

  private calculateShippingCost(distance: number, quantities: Record<string, number>): number {
    const baseCost = 10; // 基础运费
    const distanceCost = distance * 0.5; // 距离费用
    const weightEstimate = Object.values(quantities).reduce((sum, qty) => sum + qty, 0) * 0.5; // 估算重量
    const weightCost = weightEstimate * 2; // 重量费用
    
    return baseCost + distanceCost + weightCost;
  }

  // 其他私有方法的简化实现...
  private async getWarehouseInventories(warehouseId: string, productIds?: string[]) {
    // 模拟实现
    return [{
      productId: 'product-001',
      quantity: 100,
      warehouseId
    }];
  }

  private async getProductInfo(productId: string) {
    return { name: '测试产品', category: 'electronics' };
  }

  private async getSalesHistory(productId: string, days: number) {
    return [{ date: new Date(), quantity: 10 }];
  }

  private calculateTurnoverRate(salesData: any[], currentStock: number): number {
    const totalSales = salesData.reduce((sum, sale) => sum + sale.quantity, 0);
    return currentStock > 0 ? (totalSales / currentStock) * 100 : 0;
  }

  private assessObsolescenceRisk(salesData: any[], currentStock: number): 'low' | 'medium' | 'high' {
    const recentSales = salesData.slice(-30).reduce((sum, sale) => sum + sale.quantity, 0);
    const ratio = recentSales / currentStock;
    if (ratio > 0.5) return 'low';
    if (ratio > 0.2) return 'medium';
    return 'high';
  }

  private calculateSafetyStock(salesData: any[]): number {
    // 简化的安全库存计算
    const avgDailySales = salesData.reduce((sum, sale) => sum + sale.quantity, 0) / salesData.length;
    return Math.ceil(avgDailySales * 7); // 7天安全库存
  }

  private calculateReorderPoint(salesData: any[], safetyStock: number): number {
    const avgDailySales = salesData.reduce((sum, sale) => sum + sale.quantity, 0) / salesData.length;
    return Math.ceil(avgDailySales * 3 + safetyStock); // 3天提前期 + 安全库存
  }

  private generateOptimizationSuggestion(
    inventory: any,
    productInfo: any,
    salesData: any[],
    safetyStock: number,
    reorderPoint: number,
    turnoverRate: number,
    obsolescenceRisk: any
  ): InventoryOptimizationSuggestion {
    let optimizationType: 'increase' | 'decrease' | 'maintain' = 'maintain';
    let priority: 'high' | 'medium' | 'low' = 'low';
    let reason = '';

    if (inventory.quantity < safetyStock) {
      optimizationType = 'increase';
      priority = 'high';
      reason = '库存低于安全库存水平';
    } else if (obsolescenceRisk === 'high' && inventory.quantity > reorderPoint) {
      optimizationType = 'decrease';
      priority = 'medium';
      reason = '存在呆滞风险，建议减少库存';
    } else if (turnoverRate < 50) {
      optimizationType = 'decrease';
      priority = 'medium';
      reason = '库存周转率偏低';
    }

    return {
      productId: inventory.productId,
      productName: productInfo.name,
      currentStock: inventory.quantity,
      suggestedStock: optimizationType === 'increase' ? reorderPoint * 2 : 
                     optimizationType === 'decrease' ? safetyStock : inventory.quantity,
      safetyStock,
      reorderPoint,
      maxStock: reorderPoint * 3,
      stockTurnoverRate: turnoverRate,
      obsolescenceRisk,
      optimizationType,
      reason,
      estimatedImpact: {
        costSaving: optimizationType === 'decrease' ? 1000 : 0,
        serviceLevelImprovement: optimizationType === 'increase' ? 15 : 0
      },
      priority,
      implementationSteps: [`调整库存至建议水平`],
      createdAt: new Date()
    };
  }

  // 更多辅助方法...
  private calculateDistanceScore(location1?: GeoLocation, location2?: any): number {
    if (!location1 || !location2) return 50;
    return 80; // 简化实现
  }

  private async calculatePriceCompetitiveness(supplierId: string, requirements: any[]): Promise<number> {
    return 75; // 简化实现
  }

  private calculateQualityScore(supplier: any): number {
    return (supplier.qualityRating || 4) * 20;
  }

  private calculateDeliveryScore(supplier: any, requirements: any[]): number {
    return 80; // 简化实现
  }

  private generateMatchReasons(...scores: number[]): string[] {
    return ['综合评分较高', '满足基本要求'];
  }

  private calculateSupplierDistance(location1?: GeoLocation, location2?: any): number {
    return 500; // 简化实现
  }

  private identifyRiskFactors(supplier: any): string[] {
    return ['无重大风险因素'];
  }

  private async getAverageUnitPrice(supplierId: string, requirements: any[]): Promise<number> {
    return 150; // 简化实现
  }

  private async generateDemandForecasts(warehouseId: string, productIds?: string[], days: number = 30) {
    // 如果没有指定产品ID，获取该仓库的所有活跃产品
    let productsToForecast = productIds;
    if (!productsToForecast || productsToForecast.length === 0) {
      const inventoryRecords = await this.inventoryService.listInventory({ warehouseId });
      productsToForecast = inventoryRecords.map(record => record.productId);
    }

    // 为每个产品生成预测
    const forecasts = await Promise.all(
      productsToForecast.map(async (productId) => {
        try {
          const forecast = await this.forecastService.predictDemand(
            productId,
            warehouseId,
            days,
            'prophet' // 默认使用Prophet算法
          );

          return {
            productId,
            warehouseId,
            forecastPeriod: forecast.forecastPeriod,
            predictedDemand: forecast.predictedDemand,
            confidenceInterval: forecast.confidenceInterval,
            supplierLeadTime: 7, // 默认7天交货期
            trend: forecast.trend,
            seasonalPatterns: forecast.seasonalPatterns,
            externalFactors: forecast.externalFactors
          };
        } catch (error) {
          console.warn(`产品${productId}预测失败，使用默认值:`, error);
          // 降级到简单预测
          return {
            productId,
            warehouseId,
            forecastPeriod: {
              start: new Date(),
              end: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
            },
            predictedDemand: 100,
            confidenceInterval: [80, 120] as [number, number],
            supplierLeadTime: 7
          };
        }
      })
    );

    return forecasts;
  }

  private async getCurrentInventories(warehouseId: string, productIds?: string[]) {
    return [{
      productId: 'product-001',
      quantity: 200,
      warehouseId
    }];
  }

  private calculateEOQ(dailyDemand: number, leadTime: number): number {
    const annualDemand = dailyDemand * 365;
    const orderingCost = 50;
    const holdingCost = 2;
    return Math.ceil(Math.sqrt((2 * annualDemand * orderingCost) / holdingCost));
  }

  private calculateSafetyStockFromForecast(forecast: any): number {
    return Math.ceil(forecast.predictedDemand * 0.2); // 20%安全库存
  }

  private determineReplenishmentUrgency(current: number, safety: number, reorder: number): 'immediate' | 'soon' | 'planned' {
    if (current <= safety) return 'immediate';
    if (current <= reorder) return 'soon';
    return 'planned';
  }

  private analyzeReplenishmentCosts(productId: string, orderQty: number, demand: number) {
    const unitCost = 100;
    const holdingRate = 0.2;
    const orderingCost = 50;
    
    const holdingCost = (orderQty / 2) * unitCost * holdingRate;
    const orderingCostAnnual = (demand / orderQty) * orderingCost;
    const shortageCost = 0; // 简化处理
    
    return {
      holdingCost,
      orderingCost: orderingCostAnnual,
      shortageCost,
      totalAnnualCost: holdingCost + orderingCostAnnual + shortageCost
    };
  }

  private async getProductName(productId: string): Promise<string> {
    return '测试产品名称';
  }

  private async getWarehouseName(warehouseId: string): Promise<string> {
    return '测试仓库名称';
  }

  private generateReplenishmentReason(inventory: any, forecast: any, urgency: string): string {
    return `当前库存${inventory.quantity}低于建议水平，预测需求${forecast.predictedDemand}`;
  }
}