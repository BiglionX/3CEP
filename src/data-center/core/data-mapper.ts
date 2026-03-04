import {
  UnifiedDevice,
  UnifiedPart,
  PriceInfo,
  DataSourceMapping,
  DataModelFactory,
} from '../models/unified-models';

// 数据源映射配?interface SourceMappingConfig {
  lionfix: {
    devices: string;
    parts: string;
    prices: string;
  };
  fixcycle: {
    devices: string;
    parts: string;
    prices: string;
    users: string;
  };
}

// 映射配置
const MAPPING_CONFIG: SourceMappingConfig = {
  lionfix: {
    devices: 'lionfix.devices',
    parts: 'lionfix.parts',
    prices: 'lionfix.price_history',
  },
  fixcycle: {
    devices: 'fixcycle.devices',
    parts: 'fixcycle.parts',
    prices: 'fixcycle.part_prices',
    users: 'fixcycle.users',
  },
};

// 数据映射服务
export class DataMapperService {
  private mappings: Map<string, DataSourceMapping[]> = new Map();

  // 设备数据映射
  mapDeviceData(lionfixDevice: any, fixcycleDevice?: any): UnifiedDevice {
    const unifiedDevice = DataModelFactory.createDevice({
      ...lionfixDevice,
      local_id: fixcycleDevice?.id,
      status: this.determineDeviceStatus(lionfixDevice, fixcycleDevice),
      availability: this.determineAvailability(lionfixDevice, fixcycleDevice),
    });

    // 记录映射关系
    if (fixcycleDevice) {
      this.recordMapping(unifiedDevice.id, 'device', {
        local_entity_id: fixcycleDevice.id,
        lionfix_entity_id: lionfixDevice.id,
        mapping_type: 'one_to_one',
        confidence_score: 0.95,
        created_at: new Date().toISOString(),
        validated: true,
      });
    }

    return unifiedDevice;
  }

  // 配件数据映射
  mapPartData(lionfixPart: any, fixcyclePart?: any): UnifiedPart {
    const unifiedPart = DataModelFactory.createPart({
      ...lionfixPart,
      local_id: fixcyclePart?.id,
      stock_quantity: fixcyclePart?.stock_quantity,
      min_stock: fixcyclePart?.min_stock,
      max_stock: fixcyclePart?.max_stock,
      status: this.determinePartStatus(lionfixPart, fixcyclePart),
    });

    // 处理兼容设备映射
    if (lionfixPart.compatible_device_ids) {
      unifiedPart.compatible_devices = lionfixPart.compatible_device_ids;
    }

    // 记录映射关系
    if (fixcyclePart) {
      this.recordMapping(unifiedPart.id, 'part', {
        local_entity_id: fixcyclePart.id,
        lionfix_entity_id: lionfixPart.id,
        mapping_type: 'one_to_one',
        confidence_score: 0.9,
        created_at: new Date().toISOString(),
        validated: true,
      });
    }

    return unifiedPart;
  }

  // 价格数据映射
  mapPriceData(lionfixPrices: any[], fixcyclePrices: any[]): PriceInfo[] {
    const unifiedPrices: PriceInfo[] = [];

    // 处理lionfix价格数据
    lionfixPrices.forEach(price => {
      unifiedPrices.push(
        DataModelFactory.createPriceInfo({
          ...price,
          platform: 'lionfix_source',
          currency: 'CNY',
        })
      );
    });

    // 处理fixcycle价格数据
    fixcyclePrices.forEach(price => {
      unifiedPrices.push(
        DataModelFactory.createPriceInfo({
          ...price,
          platform: price.platform || 'fixcycle_platform',
        })
      );
    });

    return unifiedPrices;
  }

  // 确定设备状?  private determineDeviceStatus(
    lionfixDevice: any,
    fixcycleDevice?: any
  ): 'active' | 'inactive' | 'discontinued' {
    // 优先使用lionfix状?    if (lionfixDevice.status) {
      return lionfixDevice.status;
    }

    // 如果lionfix没有状态，使用fixcycle状?    if (fixcycleDevice?.status) {
      return fixcycleDevice.status;
    }

    // 默认为active
    return 'active';
  }

  // 确定设备可用?  private determineAvailability(
    lionfixDevice: any,
    fixcycleDevice?: any
  ): 'available' | 'limited' | 'unavailable' {
    // 检查是否有库存信息
    if (fixcycleDevice?.stock_quantity !== undefined) {
      if (fixcycleDevice.stock_quantity > 0) {
        return 'available';
      } else if (fixcycleDevice.stock_quantity === 0) {
        return 'limited';
      }
    }

    // 基于状态判?    const status = this.determineDeviceStatus(lionfixDevice, fixcycleDevice);
    if (status === 'active') {
      return 'available';
    } else if (status === 'discontinued') {
      return 'unavailable';
    }

    return 'limited';
  }

  // 确定配件状?  private determinePartStatus(
    lionfixPart: any,
    fixcyclePart?: any
  ): 'active' | 'inactive' | 'discontinued' {
    // 优先使用fixcycle状态（本地业务状态）
    if (fixcyclePart?.status) {
      return fixcyclePart.status;
    }

    // 使用lionfix状?    if (lionfixPart?.status) {
      return lionfixPart.status;
    }

    return 'active';
  }

  // 记录映射关系
  private recordMapping(
    entityId: string,
    entityType: string,
    mapping: Omit<DataSourceMapping, 'entity_id' | 'entity_type'>
  ): void {
    const mappingKey = `${entityType}:${entityId}`;
    const existingMappings = this.mappings.get(mappingKey) || [];

    existingMappings.push({
      ...mapping,
      entity_id: entityId,
      entity_type: entityType,
    });

    this.mappings.set(mappingKey, existingMappings);
  }

  // 获取实体映射关系
  getEntityMappings(entityId: string, entityType: string): DataSourceMapping[] {
    const mappingKey = `${entityType}:${entityId}`;
    return this.mappings.get(mappingKey) || [];
  }

  // 验证映射质量
  validateMappings(): { valid: number; invalid: number; total: number } {
    let valid = 0;
    let invalid = 0;
    let total = 0;

    for (const mappings of this.mappings.values()) {
      total += mappings.length;
      mappings.forEach(mapping => {
        if (mapping.confidence_score >= 0.8 && mapping.validated) {
          valid++;
        } else {
          invalid++;
        }
      });
    }

    return { valid, invalid, total };
  }

  // 清理过期映射
  cleanupExpiredMappings(expiryDays: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - expiryDays);

    let cleanedCount = 0;
    const cutoffISOString = cutoffDate.toISOString();

    for (const [key, mappings] of this.mappings.entries()) {
      const filteredMappings = mappings.filter(
        mapping => mapping.created_at > cutoffISOString
      );

      if (filteredMappings.length !== mappings.length) {
        cleanedCount += mappings.length - filteredMappings.length;
        if (filteredMappings.length > 0) {
          this.mappings.set(key, filteredMappings);
        } else {
          this.mappings.delete(key);
        }
      }
    }

    return cleanedCount;
  }
}

// 数据转换工具?export class DataTransformer {
  // 扁平化嵌套对?  static flattenObject(obj: any, prefix = ''): Record<string, any> {
    const flattened: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }

    return flattened;
  }

  // 标准化字段名?  static standardizeFieldNames(data: Record<string, any>): Record<string, any> {
    const fieldMapping: Record<string, string> = {
      device_id: 'deviceId',
      part_id: 'partId',
      created_time: 'createdAt',
      updated_time: 'updatedAt',
      last_modified: 'updatedAt',
      price_cny: 'price',
      model_name: 'model',
      brand_name: 'brand',
    };

    const standardized: Record<string, any> = {};

    for (const [originalKey, value] of Object.entries(data)) {
      const standardizedKey = fieldMapping[originalKey] || originalKey;
      standardized[standardizedKey] = value;
    }

    return standardized;
  }

  // 数据类型转换
  static convertDataTypes(data: Record<string, any>): Record<string, any> {
    const converted: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      // 转换日期字符?      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        converted[key] = new Date(value).toISOString();
      }
      // 转换数字字符?      else if (typeof value === 'string' && /^[\d.]+$/.test(value)) {
        const numValue = parseFloat(value);
        converted[key] = isNaN(numValue) ? value : numValue;
      }
      // 转换布尔值字符串
      else if (typeof value === 'string' && /^(true|false)$/i.test(value)) {
        converted[key] = value.toLowerCase() === 'true';
      } else {
        converted[key] = value;
      }
    }

    return converted;
  }

  // 数据清洗
  static cleanData(data: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      // 移除空?      if (value === null || value === undefined) {
        continue;
      }

      // 清理字符?      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed) {
          cleaned[key] = trimmed;
        }
      } else {
        cleaned[key] = value;
      }
    }

    return cleaned;
  }
}

// 导出实例
export const dataMapperService = new DataMapperService();
