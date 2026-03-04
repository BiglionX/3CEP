import { supabase } from '@/lib/supabase';
import { DeviceProfileService } from '@/services/device-profile.service';
import {
  ValuationEngineService,
  DeviceCondition,
} from '@/lib/valuation/valuation-engine.service';

/**
 * 旧机型升级推荐服? * 基于用户历史购买和扫码记录，推荐合适的升级机型
 */

// 推荐项接?export interface UpgradeRecommendation {
  oldModel: string;
  newModel: string;
  brand: string;
  category: string;
  predictedTradeValue: number;
  discountAmount: number;
  discountRate: number;
  recommendationScore: number;
  recommendationReason: string;
  expiresAt: string;
  isNew?: boolean;
}

// 用户设备历史接口
export interface UserDevice {
  id: string;
  userId: string;
  brand: string;
  model: string;
  category: string;
  purchaseDate?: string;
  purchasePrice?: number;
  conditionRating?: number;
  usageDurationMonths?: number;
  sourceType: 'purchase' | 'scan' | 'manual';
  isCurrent: boolean;
  createdAt: string;
}

// 新旧机型映射接口
export interface ModelUpgradeMapping {
  id: string;
  oldModel: string;
  newModel: string;
  brand: string;
  category: string;
  upgradeDiscountRate: number;
  minTradeValue: number;
  maxTradeValue: number;
  compatibilityScore: number;
  upgradeReason: string;
  priority: number;
  isActive: boolean;
}

export class UpgradeRecommendationService {
  private valuationService: ValuationEngineService;

  constructor() {
    this.valuationService = ValuationEngineService.getInstance();
  }
  /**
   * 获取用户设备历史记录
   */
  async getUserDeviceHistory(
    userId: string,
    limit: number = 10
  ): Promise<UserDevice[]> {
    try {
      const { data, error } = await supabase
        .from('user_device_history')
        .select('*')
        .eq('user_id', userId)
        .eq('is_current', true)
        .order('purchase_date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (
        data?.map(record => ({
          id: record.id,
          userId: record.user_id,
          brand: record.brand,
          model: record.model,
          category: record.category,
          purchaseDate: record.purchase_date,
          purchasePrice: record.purchase_price,
          conditionRating: record.condition_rating,
          usageDurationMonths: record.usage_duration_months,
          sourceType: record.source_type,
          isCurrent: record.is_current,
          createdAt: record.created_at,
        })) || []
      );
    } catch (error) {
      console.error('获取用户设备历史失败:', error);
      throw error;
    }
  }

  /**
   * 从扫描记录中提取用户设备信息
   */
  async extractDevicesFromScanRecords(userId: string): Promise<void> {
    try {
      // 查询用户的扫描记?      const { data: scanRecords, error: scanError } = await supabase
        .from('scan_records')
        .select(
          `
          id,
          product_id,
          scan_time,
          products (
            id,
            brand_id,
            model,
            category,
            brands (name)
          )
        `
        )
        .order('scan_time', { ascending: false })
        .limit(50);

      if (scanError) throw scanError;

      // 处理扫描记录，提取设备信?      if (scanRecords) {
        for (const record of scanRecords) {
          const product = record.products as any;
          if (product && product.brands) {
            // 检查是否已存在该设备记?            const { data: existingDevice } = await supabase
              .from('user_device_history')
              .select('id')
              .eq('user_id', userId)
              .eq('brand', product.brands.name)
              .eq('model', product.model)
              .maybeSingle();

            // 如果不存在，则创建设备记?            if (!existingDevice) {
              await supabase.from('user_device_history').insert({
                user_id: userId,
                device_id: product.id,
                brand: product.brands.name,
                model: product.model,
                category: product.category,
                source_type: 'scan',
                source_id: record.id,
                is_current: true,
                condition_rating: 7, // 默认评分
                usage_duration_months: this.estimateUsageDuration(
                  record.scan_time
                ),
              } as any);
            }
          }
        }
      }
    } catch (error) {
      console.error('从扫描记录提取设备信息失?', error);
    }
  }

  /**
   * 根据扫描时间估算使用时长
   */
  private estimateUsageDuration(scanTime: string): number {
    const scanDate = new Date(scanTime);
    const currentDate = new Date();
    const diffMonths = Math.floor(
      (currentDate.getTime() - scanDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    // 假设设备在扫描前已经使用?个月?年不?    return Math.max(
      6,
      Math.min(diffMonths + Math.floor(Math.random() * 18), 24)
    );
  }

  /**
   * 生成升级推荐
   */
  async generateRecommendations(
    userId: string,
    limit: number = 5
  ): Promise<UpgradeRecommendation[]> {
    try {
      // 首先确保有设备历史数?      await this.extractDevicesFromScanRecords(userId);

      // 获取用户设备历史
      const devices = await this.getUserDeviceHistory(userId, 10);
      if (devices.length === 0) {
        return []; // 没有设备历史，无法推?      }

      const recommendations: UpgradeRecommendation[] = [];

      // 为每个设备查找可能的升级选项
      for (const device of devices) {
        const mappings = await this.findUpgradeMappings(
          device.brand,
          device.model
        );

        for (const mapping of mappings) {
          const recommendation = await this.calculateRecommendation(
            device,
            mapping
          );
          if (recommendation) {
            recommendations.push(recommendation);
          }
        }
      }

      // 按推荐得分排序并限制数量
      return recommendations
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit);
    } catch (error) {
      console.error('生成升级推荐失败:', error);
      throw error;
    }
  }

  /**
   * 查找特定机型的升级映?   */
  private async findUpgradeMappings(
    brand: string,
    oldModel: string
  ): Promise<ModelUpgradeMapping[]> {
    try {
      const { data, error } = (await supabase
        .from('model_upgrade_mappings')
        .select('*')
        .eq('brand', brand)
        .eq('old_model', oldModel)
        .eq('is_active', true)
        .order('priority', { ascending: true })) as any;

      if (error) throw error;

      return (
        data?.map(mapping => ({
          id: mapping.id,
          oldModel: mapping.old_model,
          newModel: mapping.new_model,
          brand: mapping.brand,
          category: mapping.category,
          upgradeDiscountRate: mapping.upgrade_discount_rate,
          minTradeValue: mapping.min_trade_value,
          maxTradeValue: mapping.max_trade_value,
          compatibilityScore: mapping.compatibility_score,
          upgradeReason: mapping.upgrade_reason,
          priority: mapping.priority,
          isActive: mapping.is_active,
        })) || []
      );
    } catch (error) {
      console.error('查找升级映射失败:', error);
      return [];
    }
  }

  /**
   * 计算具体的推荐项（集成真实估值引擎）
   */
  private async calculateRecommendation(
    device: UserDevice,
    mapping: ModelUpgradeMapping
  ): Promise<UpgradeRecommendation | null> {
    try {
      // 获取设备二维码ID（如果有的话?      const deviceQrcodeId = await this.getDeviceQrcodeId(device);

      let predictedTradeValue: number;

      if (deviceQrcodeId) {
        // 使用真实估值引擎计算价?        try {
          // 构造设备档案对?          const mockDeviceProfile = {
            id: device.id,
            qrcodeId: deviceQrcodeId,
            productModel: device.model,
            productCategory: device.category || '未分?,
            brandName: device.brand || '未知品牌',
            manufacturingDate: this.estimateManufactureDate(
              device.purchaseDate || new Date().toISOString()
            ),
            currentStatus: 'active',
            totalRepairCount: 0,
            totalPartReplacementCount: 0,
            totalTransferCount: 0,
            specifications: this.estimateSpecifications(device),
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any;

          // 构造成色状?          const condition: DeviceCondition =
            this.estimateDeviceCondition(device);

          // 计算真实估?          const valuationResult =
            await this.valuationService.calculateBaseValue(
              mockDeviceProfile,
              condition,
              device.purchasePrice
            );

          predictedTradeValue = valuationResult.finalValue;
        } catch (valuationError) {
          console.warn('估值计算失败，使用预估价?', valuationError);
          // 回退到原来的预估方法
          predictedTradeValue = this.estimateFallbackValue(device, mapping);
        }
      } else {
        // 没有二维码ID，使用预估价?        predictedTradeValue = this.estimateFallbackValue(device, mapping);
      }

      // 计算折扣金额
      const discountAmount = predictedTradeValue * mapping.upgradeDiscountRate;

      // 计算推荐得分
      const compatibilityScore = mapping.compatibilityScore / 100;
      const priorityScore = 1 - mapping.priority / 10;
      const conditionScore = (device.conditionRating || 7) / 10;
      const usageScore = device.usageDurationMonths
        ? device.usageDurationMonths > 24
          ? 0.9
          : 0.6
        : 0.7;

      const recommendationScore =
        compatibilityScore * 0.4 +
        priorityScore * 0.3 +
        conditionScore * 0.2 +
        usageScore * 0.1;

      return {
        oldModel: device.model,
        newModel: mapping.newModel,
        brand: device.brand,
        category: device.category,
        predictedTradeValue: Number(predictedTradeValue.toFixed(2)),
        discountAmount: Number(discountAmount.toFixed(2)),
        discountRate: mapping.upgradeDiscountRate,
        recommendationScore: Number(recommendationScore.toFixed(4)),
        recommendationReason: mapping.upgradeReason,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天后过期
      };
    } catch (error) {
      console.error('计算推荐项失?', error);
      return null;
    }
  }

  /**
   * 获取缓存的推荐结?   */
  async getCachedRecommendations(
    userId: string,
    limit: number = 5
  ): Promise<UpgradeRecommendation[]> {
    try {
      const { data, error } = await supabase
        .from('upgrade_recommendations')
        .select('*')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .eq('converted', false)
        .order('recommendation_score', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (
        data?.map(record => ({
          oldModel: record.old_model,
          newModel: record.new_model,
          brand: record.brand,
          category: '', // 需要额外查?          predictedTradeValue: record.predicted_trade_value,
          discountAmount: record.discount_amount,
          discountRate: record.discount_rate,
          recommendationScore: record.recommendation_score,
          recommendationReason: record.recommendation_reason,
          expiresAt: record.expires_at,
          isNew:
            new Date(record.created_at) >
            new Date(Date.now() - 24 * 60 * 60 * 1000), // 24小时内为新推?        })) || []
      );
    } catch (error) {
      console.error('获取缓存推荐失败:', error);
      return [];
    }
  }

  /**
   * 记录推荐点击
   */
  async recordRecommendationClick(
    userId: string,
    oldModel: string,
    newModel: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('upgrade_recommendations')
        .update({ clicked: true } as any)
        .eq('user_id', userId)
        .eq('old_model', oldModel)
        .eq('new_model', newModel);

      if (error) throw error;
    } catch (error) {
      console.error('记录推荐点击失败:', error);
    }
  }

  /**
   * 记录推荐转化（用户下单）
   */
  async recordRecommendationConversion(
    userId: string,
    oldModel: string,
    newModel: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('upgrade_recommendations')
        .update({
          converted: true,
          conversion_date: new Date().toISOString(),
        } as any)
        .eq('user_id', userId)
        .eq('old_model', oldModel)
        .eq('new_model', newModel);

      if (error) throw error;
    } catch (error) {
      console.error('记录推荐转化失败:', error);
    }
  }

  /**
   * 添加用户手动设备记录
   */
  async addUserDevice(
    userId: string,
    deviceData: Omit<UserDevice, 'id' | 'userId' | 'createdAt'>
  ): Promise<void> {
    try {
      const { error } = await supabase.from('user_device_history').insert({
        user_id: userId,
        brand: deviceData.brand,
        model: deviceData.model,
        category: deviceData.category,
        purchase_date: deviceData.purchaseDate,
        purchase_price: deviceData.purchasePrice,
        condition_rating: deviceData.conditionRating,
        usage_duration_months: deviceData.usageDurationMonths,
        source_type: deviceData.sourceType,
        is_current: deviceData.isCurrent,
      } as any);

      if (error) throw error;
    } catch (error) {
      console.error('添加用户设备失败:', error);
      throw error;
    }
  }

  /**
   * 获取设备二维码ID（模拟实现）
   */
  private async getDeviceQrcodeId(device: UserDevice): Promise<string | null> {
    // 在实际实现中，这里应该查询数据库获取设备对应的二维码ID
    // 目前返回null表示没有二维码关?    return null;
  }

  /**
   * 估算设备制造日?   */
  private estimateManufactureDate(purchaseDate: string): string {
    const purchase = new Date(purchaseDate);
    // 假设设备在购买前3-6个月制?    const manufactureDate = new Date(purchase);
    manufactureDate.setMonth(manufactureDate.getMonth() - 4);
    return manufactureDate.toISOString().split('T')[0];
  }

  /**
   * 估算设备规格
   */
  private estimateSpecifications(device: UserDevice): Record<string, any> {
    const model = device.model.toLowerCase();
    const specs: Record<string, any> = {};

    // 基于型号的简单规格推?    if (model.includes('iphone')) {
      specs.ram = '6GB';
      specs.storage = '128GB';
      specs.processor = 'A系列芯片';
    } else if (model.includes('galaxy') || model.includes('samsung')) {
      specs.ram = '8GB';
      specs.storage = '128GB';
      specs.processor = '骁龙处理?;
    } else if (model.includes('macbook')) {
      specs.ram = '16GB';
      specs.storage = '512GB';
      specs.processor = 'M系列芯片';
    } else {
      specs.ram = '8GB';
      specs.storage = '256GB';
    }

    return specs;
  }

  /**
   * 估算设备成色状?   */
  private estimateDeviceCondition(device: UserDevice): DeviceCondition {
    const conditionRating = device.conditionRating || 7;

    let screen: DeviceCondition['screen'] = 'minor_scratches';
    let battery: DeviceCondition['battery'] = 'good';
    let body: DeviceCondition['body'] = 'light_wear';
    let functionality: DeviceCondition['functionality'] = 'perfect';

    if (conditionRating >= 9) {
      screen = 'perfect';
      battery = 'excellent';
      body = 'mint';
    } else if (conditionRating >= 7) {
      screen = 'minor_scratches';
      battery = 'good';
      body = 'light_wear';
    } else if (conditionRating >= 5) {
      screen = 'visible_scratches';
      battery = 'average';
      body = 'moderate_wear';
    } else {
      screen = 'heavy_scratches';
      battery = 'poor';
      body = 'heavy_wear';
      functionality = 'minor_issues';
    }

    return { screen, battery, body, functionality };
  }

  /**
   * 回退的价值估算方?   */
  private estimateFallbackValue(
    device: UserDevice,
    mapping: ModelUpgradeMapping
  ): number {
    // 计算预估回收价?    const baseValue =
      mapping.minTradeValue +
      (mapping.maxTradeValue - mapping.minTradeValue) * 0.5; // 基础价?
    // 根据设备状况调整价?    const conditionFactor = (device.conditionRating || 7) / 10;

    // 根据使用时长调整价?    const usageFactor = device.usageDurationMonths
      ? Math.max(0.3, 1 - device.usageDurationMonths / 60)
      : 0.7;

    return baseValue * conditionFactor * usageFactor;
  }
}

// 导出服务实例
export const upgradeRecommendationService = new UpgradeRecommendationService();
