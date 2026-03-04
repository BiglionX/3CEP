/**
 * 设备估价技能实现
 * 集成 FixCycle 估值引擎
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import type {
  EstimateValueInput,
  EstimateValueOutput,
  DeviceInfo,
} from './types';

export class EstimateValueSkill {
  private supabase: any;
  private timeoutMs: number;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    this.timeoutMs = parseInt(process.env.API_TIMEOUT_MS || '5000');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('缺少必要的环境变量：SUPABASE_URL 和 SUPABASE_ANON_KEY');
    }

    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  async execute(input: EstimateValueInput): Promise<EstimateValueOutput> {
    const startTime = Date.now();

    try {
      // 验证输入
      if (!input.deviceQrcodeId || input.deviceQrcodeId.trim() === '') {
        return {
          success: false,
          data: null,
          error: {
            code: 'SKILL_001',
            message: '设备二维码 ID 不能为空',
          },
          metadata: this.generateMetadata(startTime, 'validation', 'v1.0.0'),
        };
      }

      // 查询设备信息
      const deviceInfo = await this.getDeviceInfo(input.deviceQrcodeId);

      if (!deviceInfo) {
        return {
          success: true,
          data: {
            deviceInfo: {
              qrcodeId: input.deviceQrcodeId,
              productModel: '未知设备',
              brandName: '未知',
              productCategory: '未知',
            },
            valuation: {
              baseValue: 0,
              componentScore: 0,
              conditionMultiplier: 0,
              finalValue: 0,
              currency: input.currency || 'CNY',
            },
            breakdown:
              input.includeBreakdown !== false
                ? this.getDefaultBreakdown()
                : undefined,
            marketComparison: input.useMarketData
              ? this.getDefaultMarketComparison()
              : undefined,
          },
          error: null,
          metadata: this.generateMetadata(startTime, 'supabase', 'v1.0.0'),
        };
      }

      // 计算估值
      const valuation = this.calculateValuation(deviceInfo, input);
      const breakdown =
        input.includeBreakdown !== false
          ? this.calculateBreakdown(deviceInfo, valuation)
          : undefined;
      const marketComparison = input.useMarketData
        ? await this.getMarketComparison(deviceInfo)
        : undefined;

      return {
        success: true,
        data: {
          deviceInfo,
          valuation,
          breakdown,
          marketComparison,
        },
        error: null,
        metadata: this.generateMetadata(
          startTime,
          'supabase+algorithm',
          'v1.0.0'
        ),
      };
    } catch (error) {
      console.error('设备估价失败:', error);
      return {
        success: false,
        data: null,
        error: {
          code: 'SKILL_006',
          message: `设备估价失败：${error instanceof Error ? error.message : '未知错误'}`,
        },
        metadata: this.generateMetadata(startTime, 'error', 'v1.0.0'),
      };
    }
  }

  private async getDeviceInfo(qrcodeId: string): Promise<DeviceInfo | null> {
    try {
      // 从 device_qrcodes 表查询设备信息
      const { data, error } = await this.supabase
        .from('device_qrcodes')
        .select(
          `
          id,
          device_id,
          qr_code_string
        `
        )
        .eq('id', qrcodeId)
        .single();

      if (error || !data) {
        return null;
      }

      // 进一步查询设备详细信息
      const { data: device } = await this.supabase
        .from('devices')
        .select('brand, model, category, series')
        .eq('id', data.device_id)
        .single();

      return {
        qrcodeId: data.id,
        productModel: device?.model || '未知型号',
        brandName: device?.brand || '未知品牌',
        productCategory: device?.category || '未知类别',
      };
    } catch (error) {
      console.error('获取设备信息失败:', error);
      return null;
    }
  }

  private calculateValuation(
    deviceInfo: DeviceInfo,
    input: EstimateValueInput
  ) {
    // 简化的估值算法示例
    const basePrices: Record<string, number> = {
      iPhone: 5000,
      Samsung: 4000,
      MacBook: 10000,
      iPad: 3500,
      default: 3000,
    };

    let originalPrice = basePrices['default'];
    Object.keys(basePrices).forEach(brand => {
      if (deviceInfo.brandName.includes(brand)) {
        originalPrice = basePrices[brand];
      }
    });

    // 简化的折旧计算（假设 2 年折旧 50%）
    const ageInYears = 2; // 应该从设备信息中获取
    const depreciation = originalPrice * 0.5 * (ageInYears / 2);
    const baseValue = originalPrice - depreciation;

    // 成色系数（假设良好）
    const conditionMultiplier = 0.85;

    // 部件评分
    const componentScore = 0.9;

    const finalValue = baseValue * componentScore * conditionMultiplier;

    return {
      baseValue: Math.round(baseValue),
      componentScore,
      conditionMultiplier,
      finalValue: Math.round(finalValue),
      currency: input.currency || 'CNY',
    };
  }

  private calculateBreakdown(deviceInfo: DeviceInfo, valuation: any) {
    return {
      originalPrice: 5000,
      depreciation: 2500,
      componentAdjustment: valuation.componentScore,
      conditionAdjustment: valuation.conditionMultiplier,
      brandAdjustment: 1.0,
      ageAdjustment: 0.75,
      repairAdjustment: 1.0,
    };
  }

  private async getMarketComparison(deviceInfo: DeviceInfo) {
    // 简化的市场数据
    return {
      marketAveragePrice: 4000,
      priceRange: {
        min: 3500,
        max: 4500,
      },
      confidence: 0.75,
    };
  }

  private getDefaultBreakdown() {
    return {
      originalPrice: 0,
      depreciation: 0,
      componentAdjustment: 0,
      conditionAdjustment: 0,
      brandAdjustment: 0,
      ageAdjustment: 0,
      repairAdjustment: 0,
    };
  }

  private getDefaultMarketComparison() {
    return {
      marketAveragePrice: 0,
      priceRange: { min: 0, max: 0 },
      confidence: 0,
    };
  }

  private generateMetadata(
    startTime: number,
    dataSource: string,
    algorithmVersion: string
  ) {
    return {
      executionTimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      dataSource,
      algorithmVersion,
    };
  }
}
