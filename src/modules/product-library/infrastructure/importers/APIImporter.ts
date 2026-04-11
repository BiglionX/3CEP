import {
  Accessory,
  CompleteProduct,
  Component,
  Part,
} from '../../domain/entities';
import {
  IAccessoryRepository,
  IComponentRepository,
  IPartRepository,
  IProductRepository,
} from '../../domain/repositories';
import { ProductValidationService } from '../../domain/services';
import { ImportResult } from './CSVImporter';

export interface APIConfig {
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface APISource {
  name: string;
  config: APIConfig;
  endpoints: {
    products?: string;
    accessories?: string;
    components?: string;
    parts?: string;
  };
}

export class APIImporter {
  constructor(
    private productRepository: IProductRepository,
    private accessoryRepository: IAccessoryRepository,
    private componentRepository: IComponentRepository,
    private partRepository: IPartRepository,
    private validationService: ProductValidationService
  ) {}

  async importFromAPI(source: APISource): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      totalRecords: 0,
      successRecords: 0,
      failedRecords: 0,
      errors: [],
      warnings: [],
    };

    // 导入产品
    if (source.endpoints.products) {
      const productsResult = await this.fetchAndImport(
        source,
        source.endpoints.products,
        'complete'
      );

      result.totalRecords += productsResult.totalRecords;
      result.successRecords += productsResult.successRecords;
      result.failedRecords += productsResult.failedRecords;
      result.errors.push(...productsResult.errors);
      result.warnings.push(...productsResult.warnings);
    }

    // 导入配件
    if (source.endpoints.accessories) {
      const accessoriesResult = await this.fetchAndImport(
        source,
        source.endpoints.accessories,
        'accessory'
      );

      result.totalRecords += accessoriesResult.totalRecords;
      result.successRecords += accessoriesResult.successRecords;
      result.failedRecords += accessoriesResult.failedRecords;
      result.errors.push(...accessoriesResult.errors);
      result.warnings.push(...accessoriesResult.warnings);
    }

    // 导入部件
    if (source.endpoints.components) {
      const componentsResult = await this.fetchAndImport(
        source,
        source.endpoints.components,
        'component'
      );

      result.totalRecords += componentsResult.totalRecords;
      result.successRecords += componentsResult.successRecords;
      result.failedRecords += componentsResult.failedRecords;
      result.errors.push(...componentsResult.errors);
      result.warnings.push(...componentsResult.warnings);
    }

    // 导入零件
    if (source.endpoints.parts) {
      const partsResult = await this.fetchAndImport(
        source,
        source.endpoints.parts,
        'part'
      );

      result.totalRecords += partsResult.totalRecords;
      result.successRecords += partsResult.successRecords;
      result.failedRecords += partsResult.failedRecords;
      result.errors.push(...partsResult.errors);
      result.warnings.push(...partsResult.warnings);
    }

    result.success = result.failedRecords === 0;
    return result;
  }

  private async fetchAndImport(
    source: APISource,
    endpoint: string,
    type: 'complete' | 'accessory' | 'component' | 'part'
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      totalRecords: 0,
      successRecords: 0,
      failedRecords: 0,
      errors: [],
      warnings: [],
    };

    try {
      // 构建请求头
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...source.config.headers,
      };

      if (source.config.apiKey) {
        headers['Authorization'] = `Bearer ${source.config.apiKey}`;
      }

      // 发送请求
      const response = await fetch(`${source.config.baseUrl}${endpoint}`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(source.config.timeout || 30000),
      });

      if (!response.ok) {
        throw new Error(
          `API请求失败: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // 假设返回的是数组格式
      const items = Array.isArray(data) ? data : data.items || data.data || [];

      result.totalRecords = items.length;

      // 逐个导入
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        try {
          // 标准化数据格式
          const record: any = {
            skuCode: item.sku_code || item.skuCode || item.code,
            brandId: item.brand_id || item.brandId,
            name: item.name,
            type: type,
            description: item.description,
            specifications: item.specifications || item.specs || {},
            ...item,
          };

          // 验证
          const validationResult = this.validationService.validateProductData(
            record,
            type
          );

          if (!validationResult.isValid) {
            throw new Error(validationResult.errors.join(', '));
          }

          // 导入
          await this.importRecord(record, type);
          result.successRecords++;
        } catch (error) {
          result.failedRecords++;
          result.errors.push({
            row: i + 1,
            skuCode: item.sku_code || item.skuCode || 'N/A',
            error: error instanceof Error ? error.message : '未知错误',
          });
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push({
        row: 0,
        skuCode: 'N/A',
        error: error instanceof Error ? error.message : 'API请求失败',
      });
    }

    return result;
  }

  private async importRecord(
    record: any,
    type: 'complete' | 'accessory' | 'component' | 'part'
  ): Promise<void> {
    switch (type) {
      case 'complete':
        await this.importCompleteProduct(record);
        break;
      case 'accessory':
        await this.importAccessory(record);
        break;
      case 'component':
        await this.importComponent(record);
        break;
      case 'part':
        await this.importPart(record);
        break;
    }
  }

  private async importCompleteProduct(record: any): Promise<void> {
    const existing = await this.productRepository.findBySkuCode(record.skuCode);
    if (existing) {
      throw new Error(`SKU ${record.skuCode} 已存在`);
    }

    const product = new CompleteProduct({
      skuCode: record.skuCode,
      brandId: record.brandId,
      name: record.name,
      description: record.description,
      specifications: record.specifications || {},
      status: 'draft',
      dataSource: 'imported',
    });

    await this.productRepository.create(product);
  }

  private async importAccessory(record: any): Promise<void> {
    const existing = await this.accessoryRepository.findBySkuCode(
      record.skuCode
    );
    if (existing) {
      throw new Error(`SKU ${record.skuCode} 已存在`);
    }

    const accessory = new Accessory({
      skuCode: record.skuCode,
      brandId: record.brandId,
      name: record.name,
      description: record.description,
      specifications: record.specifications || {},
    });

    await this.accessoryRepository.create(accessory);
  }

  private async importComponent(record: any): Promise<void> {
    const existing = await this.componentRepository.findBySkuCode(
      record.skuCode
    );
    if (existing) {
      throw new Error(`SKU ${record.skuCode} 已存在`);
    }

    const component = new Component({
      skuCode: record.skuCode,
      brandId: record.brandId,
      name: record.name,
      type: record.type,
      description: record.description,
      specifications: record.specifications || {},
    });

    await this.componentRepository.create(component);
  }

  private async importPart(record: any): Promise<void> {
    const existing = await this.partRepository.findBySkuCode(record.skuCode);
    if (existing) {
      throw new Error(`SKU ${record.skuCode} 已存在`);
    }

    const part = new Part({
      skuCode: record.skuCode,
      brandId: record.brandId,
      name: record.name,
      type: record.type,
      description: record.description,
      specifications: record.specifications || {},
      material: record.material,
      dimensions: record.dimensions,
    });

    await this.partRepository.create(part);
  }
}
