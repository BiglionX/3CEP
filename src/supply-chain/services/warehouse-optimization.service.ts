/**
 * 智能分仓引擎服务
 * 根据用户地理位置、各仓库库存、运费和时效，自动选择最优发货仓
 */

import {
  CostAnalysis,
  DeliveryEstimates,
  LocationCache,
  OptimizationMetrics,
  ShippingRateRule,
  WarehouseOptimizationRequest,
  WarehouseOptimizationResponse,
  WarehouseScoringFactors,
  WarehouseSelection,
} from "../models/warehouse-optimization.model";
import {
  LogisticsProvider,
  SyncStatus,
  Warehouse,
  WarehouseStatus,
  WarehouseType,
} from "../models/warehouse.model";
// import { generateUUID } from '@/lib/utils'; // 暂时注释，后续添加

export class WarehouseOptimizationService {
  private locationCache: Map<string, LocationCache> = new Map();
  private shippingRateCache: Map<string, ShippingRateRule[]> = new Map();
  private readonly ALGORITHM_VERSION = "1.0.0";

  // 权重配置
  private readonly SCORING_WEIGHTS = {
    distance: 0.25, // 距离权重
    inventory: 0.3, // 库存权重
    cost: 0.2, // 成本权重
    deliveryTime: 0.15, // 时效权重
    serviceQuality: 0.1, // 服务质量权重
  };

  /**
   * 主优化方法 - 选择最优发货仓库
   */
  async optimizeWarehouseSelection(
    request: WarehouseOptimizationRequest
  ): Promise<WarehouseOptimizationResponse> {
    const startTime = Date.now();

    try {
      // 1. 获取所有活跃仓库
      const warehouses = await this.getActiveWarehouses();

      // 2. 获取或解析配送地址坐标
      const deliveryCoordinates = await this.resolveCoordinates(
        request.deliveryAddress
      );

      // 3. 计算每个仓库的评分
      const warehouseScores = await Promise.all(
        warehouses.map(async (warehouse) => {
          return await this.calculateWarehouseScore(
            warehouse,
            deliveryCoordinates,
            request
          );
        })
      );

      // 4. 排序并选择最优仓库
      const sortedWarehouses = this.rankWarehouseScores(warehouseScores);
      const selectedWarehouse = sortedWarehouses[0];

      // 5. 生成替代选项
      const alternativeOptions = sortedWarehouses.slice(1, 4);

      // 6. 计算优化指标
      const optimizationMetrics = this.calculateOptimizationMetrics(
        startTime,
        selectedWarehouse
      );

      // 7. 生成成本分析
      const costAnalysis = await this.analyzeCosts(
        selectedWarehouse,
        alternativeOptions,
        request
      );

      // 8. 生成配送预估
      const deliveryEstimates =
        this.generateDeliveryEstimates(sortedWarehouses);

      // 9. 计算信心度分数
      const confidenceScore = this.calculateConfidenceScore(selectedWarehouse);

      const response: WarehouseOptimizationResponse = {
        selectedWarehouse,
        alternativeOptions,
        optimizationMetrics,
        costAnalysis,
        deliveryEstimates,
        confidenceScore,
      };

      console.log(
        `🚀 智能分仓完成，选中仓库: ${
          selectedWarehouse.warehouseName
        }, 总成本: ¥${selectedWarehouse.totalCost.toFixed(2)}`
      );

      return response;
    } catch (error) {
      console.error("智能分仓引擎错误:", error);
      throw new Error(`分仓优化失败: ${(error as Error).message}`);
    }
  }

  /**
   * 获取活跃仓库列表
   */
  private async getActiveWarehouses(): Promise<Warehouse[]> {
    // 模拟从数据库获取活跃仓库
    // 实际实现应该调用仓库服务
    return [
      {
        id: "wh-shanghai-001",
        code: "SH001",
        name: "上海主仓库",
        type: WarehouseType.DOMESTIC,
        status: WarehouseStatus.ACTIVE,
        location: {
          country: "中国",
          countryCode: "CN",
          city: "上海市",
          province: "上海市",
          address: "上海市浦东新区张江高科技园区",
          postalCode: "201203",
          coordinates: { lat: 31.2304, lng: 121.4737 },
        },
        contactInfo: {
          manager: "张经理",
          phone: "021-12345678",
          email: "shanghai@company.com",
        },
        operationalInfo: {
          timezone: "Asia/Shanghai",
          workingHours: "08:00-18:00",
          holidays: [],
          capacity: 10000,
          currentOccupancy: 6500,
          temperatureControlled: true,
          humidityControlled: true,
        },
        logisticsInfo: {
          providers: [
            LogisticsProvider.SF_EXPRESS,
            LogisticsProvider.YTO,
            LogisticsProvider.ZTO,
          ],
          shippingZones: [],
          deliveryTime: { domestic: 24, international: 168 },
        },
        integrationInfo: {
          wmsProvider: "内部WMS",
          syncStatus: SyncStatus.SYNCED,
          syncFrequency: 30,
        },
        costStructure: {
          storageFee: 2.5,
          handlingFee: 1.0,
          insuranceRate: 0.3,
        },
        performanceMetrics: {
          accuracyRate: 98.5,
          onTimeRate: 95.2,
          damageRate: 0.3,
          lastUpdated: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "wh-shenzhen-001",
        code: "SZ001",
        name: "深圳分仓库",
        type: WarehouseType.DOMESTIC,
        status: WarehouseStatus.ACTIVE,
        location: {
          country: "中国",
          countryCode: "CN",
          city: "深圳市",
          province: "广东省",
          address: "深圳市南山区科技园",
          postalCode: "518000",
          coordinates: { lat: 22.5431, lng: 114.0579 },
        },
        contactInfo: {
          manager: "李经理",
          phone: "0755-87654321",
          email: "shenzhen@company.com",
        },
        operationalInfo: {
          timezone: "Asia/Shanghai",
          workingHours: "08:00-18:00",
          holidays: [],
          capacity: 8000,
          currentOccupancy: 5200,
          temperatureControlled: true,
          humidityControlled: false,
        },
        logisticsInfo: {
          providers: [LogisticsProvider.SF_EXPRESS, LogisticsProvider.EMS],
          shippingZones: [],
          deliveryTime: { domestic: 36, international: 192 },
        },
        integrationInfo: {
          wmsProvider: "内部WMS",
          syncStatus: SyncStatus.SYNCED,
          syncFrequency: 30,
        },
        costStructure: {
          storageFee: 2.0,
          handlingFee: 0.8,
          insuranceRate: 0.3,
        },
        performanceMetrics: {
          accuracyRate: 97.8,
          onTimeRate: 93.5,
          damageRate: 0.5,
          lastUpdated: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "wh-beijing-001",
        code: "BJ001",
        name: "北京分仓库",
        type: WarehouseType.DOMESTIC,
        status: WarehouseStatus.ACTIVE,
        location: {
          country: "中国",
          countryCode: "CN",
          city: "北京市",
          province: "北京市",
          address: "北京市朝阳区望京SOHO",
          postalCode: "100102",
          coordinates: { lat: 39.9939, lng: 116.4856 },
        },
        contactInfo: {
          manager: "王经理",
          phone: "010-11223344",
          email: "beijing@company.com",
        },
        operationalInfo: {
          timezone: "Asia/Shanghai",
          workingHours: "08:00-18:00",
          holidays: [],
          capacity: 6000,
          currentOccupancy: 3800,
          temperatureControlled: false,
          humidityControlled: false,
        },
        logisticsInfo: {
          providers: [LogisticsProvider.SF_EXPRESS, LogisticsProvider.YTO],
          shippingZones: [],
          deliveryTime: { domestic: 48, international: 216 },
        },
        integrationInfo: {
          wmsProvider: "内部WMS",
          syncStatus: SyncStatus.SYNCED,
          syncFrequency: 30,
        },
        costStructure: {
          storageFee: 3.0,
          handlingFee: 1.2,
          insuranceRate: 0.3,
        },
        performanceMetrics: {
          accuracyRate: 96.5,
          onTimeRate: 91.8,
          damageRate: 0.8,
          lastUpdated: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  /**
   * 解析或获取配送地址坐标
   */
  private async resolveCoordinates(
    address: any
  ): Promise<{ lat: number; lng: number }> {
    const cacheKey = `${address.province}-${address.city}-${address.address}`;

    // 检查缓存
    if (this.locationCache.has(cacheKey)) {
      const cached = this.locationCache.get(cacheKey)!;
      // 如果缓存未过期（24小时内），直接返回
      if (Date.now() - cached.lastUpdated.getTime() < 24 * 60 * 60 * 1000) {
        return cached.coordinates;
      }
    }

    // 如果有精确坐标，直接使用
    if (address.coordinates) {
      return address.coordinates;
    }

    // 模拟地理编码服务
    // 实际应该调用百度地图、高德地图等API
    const coordinates = this.simulateGeocoding(address);

    // 缓存结果
    this.locationCache.set(cacheKey, {
      address: cacheKey,
      coordinates,
      lastUpdated: new Date(),
      accuracy: "approximate",
    });

    return coordinates;
  }

  /**
   * 模拟地理编码
   */
  private simulateGeocoding(address: any): { lat: number; lng: number } {
    // 简化的地理编码模拟
    const cityCoords: Record<string, { lat: number; lng: number }> = {
      上海市: { lat: 31.2304, lng: 121.4737 },
      深圳市: { lat: 22.5431, lng: 114.0579 },
      北京市: { lat: 39.9042, lng: 116.4074 },
      广州市: { lat: 23.1291, lng: 113.2644 },
      杭州市: { lat: 30.2741, lng: 120.1551 },
    };

    return cityCoords[address.city] || { lat: 31.2304, lng: 121.4737 };
  }

  /**
   * 计算单个仓库的综合评分
   */
  private async calculateWarehouseScore(
    warehouse: Warehouse,
    deliveryCoords: { lat: number; lng: number },
    request: WarehouseOptimizationRequest
  ): Promise<WarehouseSelection> {
    // 1. 计算距离
    const distance = this.calculateDistance(
      warehouse.location.coordinates,
      deliveryCoords
    );

    // 2. 估计配送时间
    const deliveryTime = this.estimateDeliveryTime(warehouse, distance);

    // 3. 计算运费
    const shippingCost = await this.calculateShippingCost(
      warehouse.id,
      deliveryCoords,
      request.orderItems
    );

    // 4. 获取处理费用
    const handlingCost = this.calculateHandlingCost(
      warehouse,
      request.orderItems
    );

    // 5. 计算保险费用
    const insuranceCost = this.calculateInsuranceCost(
      warehouse,
      request.orderItems
    );

    // 6. 检查库存可用性
    const inventoryAvailability = await this.checkInventoryAvailability(
      warehouse.id,
      request.orderItems
    );

    // 7. 计算各项得分
    const scoringFactors = this.calculateScoringFactors(
      distance,
      inventoryAvailability,
      shippingCost + handlingCost + insuranceCost,
      deliveryTime,
      warehouse.performanceMetrics
    );

    // 8. 生成选择理由
    const selectionReasons = this.generateSelectionReasons(
      scoringFactors,
      inventoryAvailability,
      warehouse
    );

    const totalCost = shippingCost + handlingCost + insuranceCost;

    return {
      warehouseId: warehouse.id,
      warehouseCode: warehouse.code,
      warehouseName: warehouse.name,
      location: {
        country: warehouse.location.country,
        city: warehouse.location.city,
        address: warehouse.location.address,
        coordinates: warehouse.location.coordinates,
      },
      distance,
      estimatedDeliveryTime: deliveryTime,
      totalCost,
      breakdown: {
        shippingCost,
        handlingCost,
        insuranceCost,
      },
      inventoryAvailability,
      serviceLevel: {
        accuracyRate: warehouse.performanceMetrics.accuracyRate,
        onTimeRate: warehouse.performanceMetrics.onTimeRate,
        qualityScore:
          (warehouse.performanceMetrics.accuracyRate +
            warehouse.performanceMetrics.onTimeRate) /
          2,
      },
      optimizationScore: scoringFactors.weightedScore,
      selectionReasons,
    };
  }

  /**
   * 计算两点间距离（公里）
   */
  private calculateDistance(
    coords1: { lat: number; lng: number },
    coords2: { lat: number; lng: number }
  ): number {
    const R = 6371; // 地球半径（公里）
    const dLat = this.deg2rad(coords2.lat - coords1.lat);
    const dLon = this.deg2rad(coords2.lng - coords1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(coords1.lat)) *
        Math.cos(this.deg2rad(coords2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * 角度转弧度
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * 估计配送时间
   */
  private estimateDeliveryTime(warehouse: Warehouse, distance: number): number {
    const baseTime = warehouse.logisticsInfo.deliveryTime.domestic;
    const distanceTime = (distance / 100) * 8; // 每100公里8小时
    const processingTime = 4; // 处理时间4小时

    return baseTime + distanceTime + processingTime;
  }

  /**
   * 计算运费
   */
  private async calculateShippingCost(
    warehouseId: string,
    deliveryCoords: { lat: number; lng: number },
    items: any[]
  ): Promise<number> {
    // 获取运费规则
    let rateRules = this.shippingRateCache.get(warehouseId);
    if (!rateRules) {
      rateRules = await this.getShippingRateRules(warehouseId);
      this.shippingRateCache.set(warehouseId, rateRules);
    }

    // 计算总重量
    const totalWeight = items.reduce((sum, item) => {
      return sum + (item.weight || 0.5) * item.quantity;
    }, 0);

    // 查找适用的费率规则
    const applicableRule = this.findApplicableRateRule(
      rateRules,
      deliveryCoords
    );

    if (!applicableRule) {
      // 使用默认费率
      return Math.max(15, totalWeight * 3);
    }

    // 根据重量区间计算费用
    const weightBracket =
      applicableRule.weightBrackets.find(
        (bracket) =>
          totalWeight >= bracket.minWeight && totalWeight <= bracket.maxWeight
      ) ||
      applicableRule.weightBrackets[applicableRule.weightBrackets.length - 1];

    const shippingCost =
      weightBracket.baseCost +
      Math.max(0, totalWeight - weightBracket.minWeight) *
        weightBracket.costPerKg;

    return shippingCost;
  }

  /**
   * 计算处理费用
   */
  private calculateHandlingCost(warehouse: Warehouse, items: any[]): number {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return warehouse.costStructure.handlingFee * itemCount;
  }

  /**
   * 计算保险费用
   */
  private calculateInsuranceCost(warehouse: Warehouse, items: any[]): number {
    const totalValue = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    return totalValue * (warehouse.costStructure.insuranceRate / 100);
  }

  /**
   * 检查库存可用性
   */
  private async checkInventoryAvailability(
    warehouseId: string,
    items: any[]
  ): Promise<any> {
    // 模拟库存检查
    // 实际应该查询实时库存系统
    const availableQuantities: Record<string, number> = {};
    let hasSufficientStock = true;
    let totalRequired = 0;
    let totalAvailable = 0;

    for (const item of items) {
      // 模拟库存数（实际应该查询数据库）
      const availableQty = Math.floor(Math.random() * 200) + 50;
      availableQuantities[item.productId] = availableQty;

      if (availableQty < item.quantity) {
        hasSufficientStock = false;
      }

      totalRequired += item.quantity;
      totalAvailable += Math.min(availableQty, item.quantity);
    }

    const stockStatus = hasSufficientStock
      ? "in_stock"
      : totalAvailable > 0
      ? "partial_stock"
      : "out_of_stock";

    return {
      hasSufficientStock,
      availableQuantities,
      stockStatus,
    };
  }

  /**
   * 计算评分因子
   */
  private calculateScoringFactors(
    distance: number,
    inventory: any,
    cost: number,
    deliveryTime: number,
    performance: any
  ): WarehouseScoringFactors {
    // 距离得分（距离越近得分越高）
    const distanceScore = Math.max(0, 100 - (distance / 1000) * 10);

    // 库存得分（库存充足得分高）
    const inventoryScore = inventory.hasSufficientStock
      ? 100
      : inventory.stockStatus === "partial_stock"
      ? 60
      : 20;

    // 成本得分（成本越低得分越高）
    const costScore = Math.max(0, 100 - (cost / 100) * 5);

    // 时效得分（时间越短得分越高）
    const deliveryTimeScore = Math.max(0, 100 - (deliveryTime / 24) * 5);

    // 服务得分（性能指标平均值）
    const serviceScore =
      (performance.accuracyRate + performance.onTimeRate) / 2;

    // 加权总分
    const weightedScore =
      distanceScore * this.SCORING_WEIGHTS.distance +
      inventoryScore * this.SCORING_WEIGHTS.inventory +
      costScore * this.SCORING_WEIGHTS.cost +
      deliveryTimeScore * this.SCORING_WEIGHTS.deliveryTime +
      serviceScore * this.SCORING_WEIGHTS.serviceQuality;

    return {
      distanceScore,
      inventoryScore,
      costScore,
      deliveryTimeScore,
      serviceScore,
      weightedScore,
    };
  }

  /**
   * 生成选择理由
   */
  private generateSelectionReasons(
    factors: WarehouseScoringFactors,
    inventory: any,
    warehouse: Warehouse
  ): string[] {
    const reasons: string[] = [];

    if (factors.distanceScore > 80) reasons.push("地理位置优越，配送距离短");
    if (factors.inventoryScore > 80) reasons.push("库存充足，可满足订单需求");
    if (factors.costScore > 80) reasons.push("配送成本合理");
    if (factors.deliveryTimeScore > 80) reasons.push("预计配送时间较短");
    if (factors.serviceScore > 90) reasons.push("仓库服务质量优秀");
    if (warehouse.operationalInfo.temperatureControlled)
      reasons.push("具备温控仓储条件");

    return reasons.length > 0 ? reasons : ["综合表现最佳"];
  }

  /**
   * 对仓库评分进行排序
   */
  private rankWarehouseScores(
    scores: WarehouseSelection[]
  ): WarehouseSelection[] {
    return scores.sort((a, b) => {
      // 首先确保有足够库存
      if (
        !a.inventoryAvailability.hasSufficientStock &&
        b.inventoryAvailability.hasSufficientStock
      )
        return 1;
      if (
        a.inventoryAvailability.hasSufficientStock &&
        !b.inventoryAvailability.hasSufficientStock
      )
        return -1;

      // 按加权得分排序
      return b.optimizationScore - a.optimizationScore;
    });
  }

  /**
   * 计算优化指标
   */
  private calculateOptimizationMetrics(
    startTime: number,
    selectedWarehouse: WarehouseSelection
  ): OptimizationMetrics {
    return {
      algorithmVersion: this.ALGORITHM_VERSION,
      processingTime: Date.now() - startTime,
      factorsConsidered: [
        "distance",
        "inventory_availability",
        "shipping_cost",
        "delivery_time",
        "service_quality",
      ],
      scoringWeights: { ...this.SCORING_WEIGHTS },
      improvementRate: this.calculateImprovementRate(selectedWarehouse),
    };
  }

  /**
   * 计算相比随机选择的改善率
   */
  private calculateImprovementRate(
    selectedWarehouse: WarehouseSelection
  ): number {
    // 模拟随机选择的平均成本（通常比最优选择高15-25%）
    const randomCost = selectedWarehouse.totalCost * 1.2;
    const improvement =
      ((randomCost - selectedWarehouse.totalCost) / randomCost) * 100;
    return Math.round(improvement * 100) / 100;
  }

  /**
   * 成本分析
   */
  private async analyzeCosts(
    selected: WarehouseSelection,
    alternatives: WarehouseSelection[],
    request: WarehouseOptimizationRequest
  ): Promise<CostAnalysis> {
    // 计算随机基准成本
    const randomCosts = alternatives.map((alt) => alt.totalCost);
    const avgRandomCost =
      randomCosts.reduce((sum, cost) => sum + cost, 0) / randomCosts.length;

    return {
      selectedOption: {
        totalCost: selected.totalCost,
        costComponents: [
          {
            type: "shipping",
            amount: selected.breakdown.shippingCost,
            description: "基础运费",
            calculationMethod: "按重量和距离计算",
          },
          {
            type: "handling",
            amount: selected.breakdown.handlingCost,
            description: "订单处理费",
            calculationMethod: "按件数计算",
          },
          {
            type: "insurance",
            amount: selected.breakdown.insuranceCost,
            description: "运输保险费",
            calculationMethod: "按商品价值比例计算",
          },
        ],
      },
      randomBaseline: {
        averageCost: avgRandomCost,
        costComponents: [], // 简化处理
      },
      savings: {
        absolute: avgRandomCost - selected.totalCost,
        percentage:
          ((avgRandomCost - selected.totalCost) / avgRandomCost) * 100,
        roi: 0, // 需要更复杂的ROI计算
      },
    };
  }

  /**
   * 生成配送预估
   */
  private generateDeliveryEstimates(
    warehouses: WarehouseSelection[]
  ): DeliveryEstimates {
    const sortedByTime = [...warehouses].sort(
      (a, b) => a.estimatedDeliveryTime - b.estimatedDeliveryTime
    );
    const sortedByCost = [...warehouses].sort(
      (a, b) => a.totalCost - b.totalCost
    );

    return {
      fastestOption: {
        warehouseId: sortedByTime[0].warehouseId,
        deliveryTime: sortedByTime[0].estimatedDeliveryTime,
        cost: sortedByTime[0].totalCost,
      },
      cheapestOption: {
        warehouseId: sortedByCost[0].warehouseId,
        deliveryTime: sortedByCost[0].estimatedDeliveryTime,
        cost: sortedByCost[0].totalCost,
      },
      balancedOption: {
        warehouseId: warehouses[0].warehouseId,
        deliveryTime: warehouses[0].estimatedDeliveryTime,
        cost: warehouses[0].totalCost,
      },
    };
  }

  /**
   * 计算信心度分数
   */
  private calculateConfidenceScore(selection: WarehouseSelection): number {
    let score = 80; // 基础分数

    // 库存充足加分
    if (selection.inventoryAvailability.hasSufficientStock) score += 10;

    // 距离近加分
    if (selection.distance < 500) score += 5;

    // 成本合理加分
    if (selection.totalCost < 100) score += 5;

    return Math.min(100, score);
  }

  // 以下为辅助方法的简化实现
  private async getShippingRateRules(
    warehouseId: string
  ): Promise<ShippingRateRule[]> {
    // 模拟获取运费规则
    return [
      {
        id: "rule-001",
        warehouseId,
        destinationZone: {
          countries: ["中国"],
        },
        weightBrackets: [
          { minWeight: 0, maxWeight: 1, baseCost: 12, costPerKg: 0 },
          { minWeight: 1, maxWeight: 3, baseCost: 15, costPerKg: 2 },
          { minWeight: 3, maxWeight: 10, baseCost: 20, costPerKg: 3 },
          { minWeight: 10, maxWeight: 50, baseCost: 30, costPerKg: 4 },
        ],
        deliveryTimeEstimate: {
          baseTime: 24,
          timePer100km: 8,
          processingTime: 4,
        },
        isActive: true,
        effectiveFrom: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private findApplicableRateRule(
    rules: ShippingRateRule[],
    coords: { lat: number; lng: number }
  ): ShippingRateRule | undefined {
    return rules.find((rule) => rule.isActive);
  }
}
