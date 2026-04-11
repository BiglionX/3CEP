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
import { ImportProductType, ImportResult } from './CSVImporter';

export class ExcelImporter {
  constructor(
    private productRepository: IProductRepository,
    private accessoryRepository: IAccessoryRepository,
    private componentRepository: IComponentRepository,
    private partRepository: IPartRepository,
    private validationService: ProductValidationService
  ) {}

  async import(workbookData: any[]): Promise<ImportResult> {
    // workbookData 应该是解析后的 Excel 数据数组
    // 格式: [{Sheet1: [...]}, {Sheet2: [...]}]

    if (!workbookData || workbookData.length === 0) {
      throw new Error('Excel文件内容为空');
    }

    const result: ImportResult = {
      success: true,
      totalRecords: 0,
      successRecords: 0,
      failedRecords: 0,
      errors: [],
      warnings: [],
    };

    // 处理每个 sheet
    for (const sheet of workbookData) {
      const sheetName = Object.keys(sheet)[0];
      const rows = sheet[sheetName];

      if (!rows || rows.length < 2) {
        continue; // 跳过空 sheet 或只有表头的 sheet
      }

      // 解析表头
      const headers = rows[0];

      // 解析数据行
      for (let i = 1; i < rows.length; i++) {
        const values = rows[i];

        if (!values || values.length === 0) {
          continue; // 跳过空行
        }

        const record: any = {};
        headers.forEach((header: string, index: number) => {
          if (index < values.length) {
            record[header] = values[index];
          }
        });

        // 转换类型
        if (
          record.specifications &&
          typeof record.specifications === 'string'
        ) {
          try {
            record.specifications = JSON.parse(record.specifications);
          } catch {
            record.specifications = {};
          }
        }

        result.totalRecords++;

        // 导入记录
        try {
          await this.importRecord(record, i + 1);
          result.successRecords++;
        } catch (error) {
          result.failedRecords++;
          result.errors.push({
            row: i + 1,
            skuCode: record.skuCode || 'N/A',
            error: error instanceof Error ? error.message : '未知错误',
          });
        }
      }
    }

    result.success = result.failedRecords === 0;
    return result;
  }

  private async importRecord(record: any, _rowNumber: number): Promise<void> {
    // 确定产品类型
    const type: ImportProductType = record.type || 'complete';

    // 验证数据
    const validationResult = this.validationService.validateProductData(
      record,
      type
    );

    if (!validationResult.isValid) {
      throw new Error(validationResult.errors.join(', '));
    }

    // 根据类型导入
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
      default:
        throw new Error(`不支持的产品类型: ${type}`);
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
