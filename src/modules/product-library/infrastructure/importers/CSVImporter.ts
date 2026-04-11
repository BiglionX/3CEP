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

export type ImportProductType = 'complete' | 'accessory' | 'component' | 'part';

export interface ImportRecord {
  skuCode: string;
  brandId: string;
  name: string;
  type: ImportProductType;
  description?: string;
  specifications?: Record<string, any>;
  [key: string]: any; // 允许额外字段
}

export interface ImportResult {
  success: boolean;
  totalRecords: number;
  successRecords: number;
  failedRecords: number;
  errors: Array<{
    row: number;
    skuCode: string;
    error: string;
  }>;
  warnings: Array<{
    row: number;
    skuCode: string;
    warning: string;
  }>;
}

export class CSVImporter {
  constructor(
    private productRepository: IProductRepository,
    private accessoryRepository: IAccessoryRepository,
    private componentRepository: IComponentRepository,
    private partRepository: IPartRepository,
    private validationService: ProductValidationService
  ) {}

  async import(csvContent: string): Promise<ImportResult> {
    const lines = csvContent.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      throw new Error('CSV文件内容为空或格式不正确');
    }

    // 解析表头
    const headers = this.parseCSVLine(lines[0]);
    const records: ImportRecord[] = [];

    // 解析数据行
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);

      if (values.length !== headers.length) {
        continue; // 跳过格式不正确的行
      }

      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = values[index];
      });

      // 转换类型
      if (record.specifications && typeof record.specifications === 'string') {
        try {
          record.specifications = JSON.parse(record.specifications);
        } catch {
          record.specifications = {};
        }
      }

      records.push(record as ImportRecord);
    }

    // 批量导入
    return await this.importRecords(records);
  }

  private async importRecords(records: ImportRecord[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      totalRecords: records.length,
      successRecords: 0,
      failedRecords: 0,
      errors: [],
      warnings: [],
    };

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 2; // 从第2行开始（第1行是表头）

      try {
        // 验证数据
        const validationResult = this.validationService.validateProductData(
          record,
          record.type
        );

        // 添加警告
        validationResult.warnings.forEach(warning => {
          result.warnings.push({
            row: rowNumber,
            skuCode: record.skuCode,
            warning,
          });
        });

        if (!validationResult.isValid) {
          throw new Error(validationResult.errors.join(', '));
        }

        // 根据类型导入
        switch (record.type) {
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
          default:
            throw new Error(`不支持的产品类型: ${record.type}`);
        }

        result.successRecords++;
      } catch (error) {
        result.failedRecords++;
        result.errors.push({
          row: rowNumber,
          skuCode: record.skuCode,
          error: error instanceof Error ? error.message : '未知错误',
        });
      }
    }

    result.success = result.failedRecords === 0;
    return result;
  }

  private async importCompleteProduct(record: ImportRecord): Promise<void> {
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

  private async importAccessory(record: ImportRecord): Promise<void> {
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

  private async importComponent(record: ImportRecord): Promise<void> {
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

  private async importPart(record: ImportRecord): Promise<void> {
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

  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  }
}
