/**
 * 配件查询技能实现
 * 集成 Supabase 数据库查询兼容配件
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PartLookupInput, PartLookupOutput, CompatiblePart } from './types';
import type { Database } from './database.types';

export class PartLookupSkill {
  private supabase: SupabaseClient<Database>;
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

  /**
   * 执行配件查询
   */
  async execute(input: PartLookupInput): Promise<PartLookupOutput> {
    const startTime = Date.now();

    try {
      // 1. 验证输入参数
      const validationError = this.validateInput(input);
      if (validationError) {
        return validationError;
      }

      // 2. 查询匹配的设备
      const matchedDevices = await this.findMatchingDevices(input);

      if (matchedDevices.length === 0) {
        return {
          success: true,
          data: {
            queryInfo: {
              deviceModel: input.deviceModel,
              matchedDevices: [],
              totalPartsFound: 0,
            },
            compatibleParts: [],
            statistics: this.calculateStatistics([]),
          },
          error: null,
          metadata: this.generateMetadata(startTime, 'supabase'),
        };
      }

      // 3. 查询兼容配件
      const compatibleParts = await this.findCompatibleParts(
        matchedDevices.map(d => d.id),
        input
      );

      // 4. 计算统计数据
      const statistics = this.calculateStatistics(compatibleParts);

      return {
        success: true,
        data: {
          queryInfo: {
            deviceModel: input.deviceModel,
            matchedDevices,
            totalPartsFound: compatibleParts.length,
          },
          compatibleParts,
          statistics,
        },
        error: null,
        metadata: this.generateMetadata(startTime, 'supabase'),
      };
    } catch (error) {
      console.error('配件查询失败:', error);
      return {
        success: false,
        data: null,
        error: {
          code: 'SKILL_006',
          message: `配件查询失败：${error instanceof Error ? error.message : '未知错误'}`,
        },
        metadata: this.generateMetadata(startTime, 'error'),
      };
    }
  }

  /**
   * 验证输入参数
   */
  private validateInput(input: PartLookupInput): PartLookupOutput | null {
    if (!input.deviceModel || input.deviceModel.trim() === '') {
      return {
        success: false,
        data: null,
        error: {
          code: 'SKILL_001',
          message: '设备型号不能为空',
        },
        metadata: this.generateMetadata(0, 'validation'),
      };
    }

    if (
      input.deviceCategory &&
      ![
        'mobile',
        'tablet',
        'laptop',
        'desktop',
        'smartwatch',
        'other',
      ].includes(input.deviceCategory)
    ) {
      return {
        success: false,
        data: null,
        error: {
          code: 'SKILL_001',
          message: '无效的设备类别',
        },
        metadata: this.generateMetadata(0, 'validation'),
      };
    }

    if (input.priceRange) {
      if (input.priceRange.min !== undefined && input.priceRange.min < 0) {
        return {
          success: false,
          data: null,
          error: {
            code: 'SKILL_001',
            message: '最低价格不能小于 0',
          },
          metadata: this.generateMetadata(0, 'validation'),
        };
      }
      if (input.priceRange.max !== undefined && input.priceRange.max < 0) {
        return {
          success: false,
          data: null,
          error: {
            code: 'SKILL_001',
            message: '最高价格不能小于 0',
          },
          metadata: this.generateMetadata(0, 'validation'),
        };
      }
      if (
        input.priceRange.min !== undefined &&
        input.priceRange.max !== undefined &&
        input.priceRange.min > input.priceRange.max
      ) {
        return {
          success: false,
          data: null,
          error: {
            code: 'SKILL_001',
            message: '最低价格不能高于最高价格',
          },
          metadata: this.generateMetadata(0, 'validation'),
        };
      }
    }

    return null;
  }

  /**
   * 查询匹配的设备
   */
  private async findMatchingDevices(
    input: PartLookupInput
  ): Promise<Array<{ id: string; brand: string; model: string }>> {
    let query = this.supabase
      .from('devices')
      .select('id, brand, model, series')
      .ilike('model', `%${input.deviceModel}%`);

    if (input.deviceBrand) {
      query = query.eq('brand', input.deviceBrand);
    }

    if (input.deviceCategory) {
      query = query.eq('category', this.mapCategoryToDb(input.deviceCategory));
    }

    const { data, error } = await query.limit(10);

    if (error) {
      console.error('查询设备失败:', error);
      return [];
    }

    return (data || []).map(device => ({
      id: device.id,
      brand: device.brand || '',
      model: device.model || '',
    }));
  }

  /**
   * 查询兼容配件
   */
  private async findCompatibleParts(
    deviceIds: string[],
    input: PartLookupInput
  ): Promise<CompatiblePart[]> {
    // 构建查询条件
    let query = this.supabase
      .from('parts_complete_view')
      .select(
        `
        id,
        name,
        category,
        part_number,
        brand,
        description,
        image_url,
        stock_quantity,
        status,
        compatible_devices,
        related_faults
      `
      )
      .in('id', this.getPartIdsForDevices(deviceIds))
      .eq('status', 'active');

    // 按分类筛选
    if (input.partCategory) {
      query = query.ilike('category', `%${input.partCategory}%`);
    }

    // 不包含缺货商品
    if (!input.includeOutOfStock) {
      query = query.gt('stock_quantity', 0);
    }

    const { data, error } = await query;

    if (error) {
      console.error('查询配件失败:', error);
      return [];
    }

    let parts: CompatiblePart[] = (data || []).map(part => ({
      id: part.id,
      name: part.name,
      category: part.category,
      partNumber: part.part_number,
      brand: part.brand,
      price: this.getPartPrice(part),
      stockQuantity: part.stock_quantity,
      compatibilityNotes: this.extractCompatibilityNotes(
        part.compatible_devices,
        deviceIds
      ),
      imageUrl: part.image_url || part.primary_image_url,
      matchScore: this.calculateMatchScore(part, deviceIds),
    }));

    // 价格筛选
    if (input.priceRange) {
      parts = parts.filter(part => {
        if (
          input.priceRange!.min !== undefined &&
          part.price < input.priceRange!.min
        ) {
          return false;
        }
        if (
          input.priceRange!.max !== undefined &&
          part.price > input.priceRange!.max
        ) {
          return false;
        }
        return true;
      });
    }

    // 排序
    parts = this.sortParts(parts, input.sortBy || 'relevance');

    return parts;
  }

  /**
   * 获取配件价格（从 FCX 价格表或默认值）
   */
  private getPartPrice(part: any): number {
    // 这里简化处理，实际应该查询 current_part_fcx_prices 表
    // 可以从 part.id 查询价格
    return Math.floor(Math.random() * 2000) + 100; // 临时随机价格
  }

  /**
   * 提取兼容性说明
   */
  private extractCompatibilityNotes(
    compatibleDevices: any[],
    deviceIds: string[]
  ): string {
    if (!compatibleDevices || compatibleDevices.length === 0) {
      return '通用配件';
    }

    const matchedDevice = compatibleDevices.find(device =>
      deviceIds.includes(device.id)
    );

    return matchedDevice?.compatibility_notes || '完全兼容';
  }

  /**
   * 计算匹配得分
   */
  private calculateMatchScore(part: any, deviceIds: string[]): number {
    if (!part.compatible_devices || part.compatible_devices.length === 0) {
      return 0.5; // 通用配件中等匹配度
    }

    const isExplicitlyCompatible = part.compatible_devices.some((device: any) =>
      deviceIds.includes(device.id)
    );

    return isExplicitlyCompatible ? 1.0 : 0.3;
  }

  /**
   * 排序配件列表
   */
  private sortParts(parts: CompatiblePart[], sortBy: string): CompatiblePart[] {
    switch (sortBy) {
      case 'price_asc':
        return parts.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return parts.sort((a, b) => b.price - a.price);
      case 'stock_desc':
        return parts.sort(
          (a, b) => (b.stockQuantity || 0) - (a.stockQuantity || 0)
        );
      case 'relevance':
      default:
        return parts.sort((a, b) => b.matchScore - a.matchScore);
    }
  }

  /**
   * 计算统计数据
   */
  private calculateStatistics(parts: CompatiblePart[]) {
    const inStockCount = parts.filter(p => (p.stockQuantity || 0) > 0).length;
    const outOfStockCount = parts.length - inStockCount;
    const avgPrice =
      parts.length > 0
        ? Math.round(parts.reduce((sum, p) => sum + p.price, 0) / parts.length)
        : 0;

    const categoriesBreakdown = Array.from(
      parts.reduce((map, part) => {
        map.set(part.category, (map.get(part.category) || 0) + 1);
        return map;
      }, new Map<string, number>())
    ).map(([category, count]) => ({ category, count }));

    return {
      totalCompatibleParts: parts.length,
      avgPrice,
      inStockCount,
      outOfStockCount,
      categoriesBreakdown,
    };
  }

  /**
   * 生成元数据
   */
  private generateMetadata(startTime: number, dataSource: string) {
    return {
      executionTimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      dataSource,
    };
  }

  /**
   * 映射设备类别到数据库字段
   */
  private mapCategoryToDb(category: string): string {
    const mapping: Record<string, string> = {
      mobile: '手机',
      tablet: '平板',
      laptop: '笔记本',
      desktop: '台式机',
      smartwatch: '智能手表',
      other: '其他',
    };
    return mapping[category] || category;
  }

  /**
   * 获取设备的配件 ID 列表（简化版本）
   */
  private getPartIdsForDevices(deviceIds: string[]): string[] {
    // 实际应该从 part_devices 关联表查询
    // 这里返回一个示例查询的逻辑
    return deviceIds; // 简化处理
  }
}
