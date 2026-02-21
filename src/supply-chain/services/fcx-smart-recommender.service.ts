/**
 * 增强版智能分仓推荐算法
 * 专门为FCX兑换场景优化的仓库推荐引擎
 */

import { 
  WarehouseRecommendation
} from '../../supply-chain/models/inventory.model';
import { GeoLocation } from '../../supply-chain/models/recommendation.model';
import { 
  WarehouseRecommendationRequest,
  UserLocation
} from '../../supply-chain/models/recommendation.model';
import { supabase } from '@/lib/supabase';

interface FcxOptimizedRecommendation extends WarehouseRecommendation {
  fcxDiscountRate: number;        // FCX会员折扣率
  loyaltyBonus: number;           // 忠诚度奖励
  priorityScore: number;          // 综合优先级得分
  realTimeInventory: number;      // 实时库存数量
}

interface FcxRecommendationFactors {
  distanceWeight: number;         // 距离权重 (0-1)
  inventoryWeight: number;        // 库存权重 (0-1)
  serviceWeight: number;          // 服务权重 (0-1)
  fcxBenefitWeight: number;       // FCX权益权重 (0-1)
  costWeight: number;             // 成本权重 (0-1)
}

export class FcxSmartWarehouseRecommender {
  
  /**
   * FCX优化的仓库推荐主方法
   */
  async recommendWarehousesForFcx(
    request: WarehouseRecommendationRequest,
    userFcxLevel: 'bronze' | 'silver' | 'gold' | 'diamond' = 'bronze',
    userLoyaltyScore: number = 0
  ): Promise<FcxOptimizedRecommendation[]> {
    try {
      const startTime = Date.now();
      
      // 1. 获取基础仓库数据
      const warehouses = await this.getAvailableWarehouses();
      
      // 2. 计算各项指标
      const recommendations = await Promise.all(
        warehouses.map(async (warehouse) => {
          // 计算距离
          const distance = this.calculateDistance(
            request.userLocation.coordinates,
            warehouse.location
          );
          
          // 计算配送时间
          const deliveryTime = this.estimateDeliveryTime(distance, warehouse.type);
          
          // 获取实时库存
          const inventoryInfo = await this.getRealTimeInventory(
            warehouse.id,
            request.productIds
          );
          
          // 计算FCX专属权益
          const fcxBenefits = this.calculateFcxBenefits(
            userFcxLevel,
            userLoyaltyScore,
            warehouse.id
          );
          
          // 计算综合得分
          const factors: FcxRecommendationFactors = {
            distanceWeight: 0.25,
            inventoryWeight: 0.30,
            serviceWeight: 0.20,
            fcxBenefitWeight: 0.15,
            costWeight: 0.10
          };
          
          const scores = this.calculateCompositeScores(
            distance,
            inventoryInfo.availabilityRate,
            warehouse.serviceScore,
            fcxBenefits.totalBenefit,
            deliveryTime,
            factors
          );
          
          return {
            warehouseId: warehouse.id,
            warehouseName: warehouse.name,
            warehouseCode: warehouse.code,
            location: warehouse.location,
            distance,
            estimatedDeliveryTime: deliveryTime,
            shippingCost: this.calculateShippingCost(distance, request.quantities || {}),
            inventoryStatus: inventoryInfo.overallStatus,
            availableQuantity: inventoryInfo.totalAvailable,
            productPrices: inventoryInfo.prices,
            serviceScore: warehouse.serviceScore,
            reliabilityScore: warehouse.reliabilityScore,
            recommendationScore: scores.compositeScore,
            reasons: scores.reasons,
            fcxDiscountRate: fcxBenefits.discountRate,
            loyaltyBonus: fcxBenefits.loyaltyBonus,
            priorityScore: scores.priorityScore,
            realTimeInventory: inventoryInfo.totalAvailable
          };
        })
      );
      
      // 3. 排序和过滤
      const sortedRecommendations = this.rankFcxRecommendations(recommendations, request);
      
      console.log(`🏪 FCX智能分仓推荐完成，耗时: ${Date.now() - startTime}ms`);
      return sortedRecommendations.slice(0, 8); // 返回前8个推荐
      
    } catch (error) {
      console.error('FCX仓库推荐错误:', error);
      throw error;
    }
  }
  
  /**
   * 获取可用仓库列表
   */
  private async getAvailableWarehouses(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('is_active', true);
      
      if (error) {
        console.warn('获取仓库列表失败，使用默认数据');
        return this.getDefaultWarehouses();
      }
      
      return data || [];
    } catch (error) {
      console.error('获取仓库数据错误:', error);
      return this.getDefaultWarehouses();
    }
  }
  
  /**
   * 计算两点间距离 (公里)
   */
  private calculateDistance(location1: GeoLocation, location2: GeoLocation): number {
    const R = 6371; // 地球半径(公里)
    const dLat = this.toRadians(location2.lat - location1.lat);
    const dLng = this.toRadians(location2.lng - location1.lng);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(location1.lat)) * Math.cos(this.toRadians(location2.lat)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }
  
  /**
   * 估算配送时间
   */
  private estimateDeliveryTime(distance: number, warehouseType: string): number {
    // 基础配送时间
    let baseTime = distance / 50; // 假设平均速度50km/h
    
    // 根据仓库类型调整
    switch (warehouseType) {
      case 'domestic':
        baseTime += 2; // 国内仓额外2小时处理时间
        break;
      case 'overseas':
        baseTime += 24; // 海外仓额外24小时
        break;
      default:
        baseTime += 4;
    }
    
    return Math.ceil(baseTime);
  }
  
  /**
   * 获取实时库存信息
   */
  private async getRealTimeInventory(warehouseId: string, productIds: string[]): Promise<{
    availabilityRate: number;
    overallStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
    totalAvailable: number;
    prices: Array<{ productId: string; price: number; discount?: number }>;
  }> {
    try {
      const { data, error } = await supabase
        .from('inventory_records')
        .select(`
          product_id,
          available_quantity,
          safety_stock,
          fcx_price
        `)
        .in('product_id', productIds)
        .eq('warehouse_id', warehouseId);
      
      if (error || !data) {
        return {
          availabilityRate: 0,
          overallStatus: 'out_of_stock',
          totalAvailable: 0,
          prices: []
        };
      }
      
      const inStockCount = data.filter(item => item.available_quantity > 0).length;
      const availabilityRate = data.length > 0 ? inStockCount / data.length : 0;
      
      const overallStatus = availabilityRate >= 0.8 ? 'in_stock' :
                           availabilityRate >= 0.3 ? 'low_stock' : 'out_of_stock';
      
      const totalAvailable = data.reduce((sum, item) => sum + item.available_quantity, 0);
      
      const prices = data.map(item => ({
        productId: item.product_id,
        price: item.fcx_price || 0,
        discount: item.fcx_price ? item.fcx_price * 0.1 : 0 // 10% FCX折扣
      }));
      
      return {
        availabilityRate,
        overallStatus,
        totalAvailable,
        prices
      };
      
    } catch (error) {
      console.error('获取库存信息错误:', error);
      return {
        availabilityRate: 0,
        overallStatus: 'out_of_stock',
        totalAvailable: 0,
        prices: []
      };
    }
  }
  
  /**
   * 计算FCX专属权益
   */
  private calculateFcxBenefits(
    userLevel: string,
    loyaltyScore: number,
    warehouseId: string
  ): { discountRate: number; loyaltyBonus: number; totalBenefit: number } {
    // 基础折扣率
    const baseDiscount = {
      bronze: 0.05,   // 5%
      silver: 0.10,   // 10%
      gold: 0.15,     // 15%
      diamond: 0.20   // 20%
    }[userLevel] || 0.05;
    
    // 忠诚度加成
    const loyaltyBonus = Math.min(loyaltyScore / 1000, 0.05); // 最高5%加成
    
    // 仓库特定优惠
    const warehouseBonus = warehouseId.includes('premium') ? 0.03 : 0; // 高级仓库额外3%
    
    const totalDiscount = baseDiscount + loyaltyBonus + warehouseBonus;
    const totalBenefit = totalDiscount + (loyaltyBonus * 0.5); // 忠诚度还有额外价值
    
    return {
      discountRate: totalDiscount,
      loyaltyBonus: loyaltyBonus,
      totalBenefit: totalBenefit
    };
  }
  
  /**
   * 计算综合得分
   */
  private calculateCompositeScores(
    distance: number,
    inventoryRate: number,
    serviceScore: number,
    fcxBenefit: number,
    deliveryTime: number,
    factors: FcxRecommendationFactors
  ): { compositeScore: number; priorityScore: number; reasons: string[] } {
    // 距离得分 (越近越好，满分100)
    const distanceScore = Math.max(0, 100 - (distance / 2));
    
    // 库存得分 (越充足越好)
    const inventoryScore = inventoryRate * 100;
    
    // 服务得分
    const serviceScoreNum = serviceScore;
    
    // FCX权益得分
    const fcxScore = fcxBenefit * 500; // 放大倍数使影响更明显
    
    // 时间得分 (越快越好)
    const timeScore = Math.max(0, 100 - (deliveryTime / 3));
    
    // 综合得分
    const compositeScore = (
      distanceScore * factors.distanceWeight +
      inventoryScore * factors.inventoryWeight +
      serviceScoreNum * factors.serviceWeight +
      fcxScore * factors.fcxBenefitWeight +
      timeScore * factors.costWeight
    );
    
    // 优先级得分 (用于紧急情况下的排序)
    const priorityScore = (
      inventoryScore * 0.4 +
      serviceScoreNum * 0.3 +
      timeScore * 0.3
    );
    
    // 生成推荐理由
    const reasons: string[] = [];
    if (distanceScore > 80) reasons.push('地理位置优越');
    if (inventoryScore > 80) reasons.push('库存充足');
    if (serviceScoreNum > 90) reasons.push('服务质量优秀');
    if (fcxScore > 50) reasons.push('FCX会员专享优惠');
    if (timeScore > 80) reasons.push('配送时效快');
    
    return {
      compositeScore,
      priorityScore,
      reasons
    };
  }
  
  /**
   * FCX专属排序算法
   */
  private rankFcxRecommendations(
    recommendations: FcxOptimizedRecommendation[],
    request: WarehouseRecommendationRequest
  ): FcxOptimizedRecommendation[] {
    return recommendations.sort((a, b) => {
      // 首先按是否有库存过滤
      if (a.inventoryStatus === 'out_of_stock' && b.inventoryStatus !== 'out_of_stock') return 1;
      if (a.inventoryStatus !== 'out_of_stock' && b.inventoryStatus === 'out_of_stock') return -1;
      
      // 根据优化目标排序
      switch (request.optimizationGoal) {
        case 'fastest_delivery':
          return a.deliveryTime - b.deliveryTime;
        case 'lowest_cost':
          return (a.shippingCost * (1 - a.fcxDiscountRate)) - (b.shippingCost * (1 - b.fcxDiscountRate));
        case 'best_service':
          return b.fcxDiscountRate - a.fcxDiscountRate;
        default: // balanced
          return b.score - a.score;
      }
    });
  }
  
  /**
   * 计算运费
   */
  private calculateShippingCost(distance: number, quantities: Record<string, number>): number {
    const baseCost = 15; // 基础运费
    const distanceCost = distance * 0.8; // 距离费用
    const itemCount = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
    const volumeCost = itemCount * 1.5; // 数量费用
    
    return baseCost + distanceCost + volumeCost;
  }
  
  /**
   * 默认仓库数据（用于测试）
   */
  private getDefaultWarehouses(): any[] {
    return [
      {
        id: 'wh-001',
        name: '上海主仓库',
        code: 'SH001',
        location: { lat: 31.2304, lng: 121.4737 },
        type: 'domestic',
        serviceScore: 95,
        reliabilityScore: 92,
        is_active: true
      },
      {
        id: 'wh-002',
        name: '深圳分仓库',
        code: 'SZ001',
        location: { lat: 22.5431, lng: 114.0579 },
        type: 'domestic',
        serviceScore: 92,
        reliabilityScore: 89,
        is_active: true
      },
      {
        id: 'wh-003',
        name: '海外直邮仓',
        code: 'OS001',
        location: { lat: 35.6762, lng: 139.6503 }, // 东京
        type: 'overseas',
        serviceScore: 88,
        reliabilityScore: 85,
        is_active: true
      }
    ];
  }
}