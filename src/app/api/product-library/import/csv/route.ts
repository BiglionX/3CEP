import { ProductValidationService } from '@/modules/product-library/domain/services';
import { CSVImporter } from '@/modules/product-library/infrastructure/importers';
import {
  PostgresAccessoryRepository,
  PostgresComponentRepository,
  PostgresPartRepository,
  PostgresProductRepository,
} from '@/modules/product-library/infrastructure/repositories';
import { NextRequest, NextResponse } from 'next/server';

const productRepository = new PostgresProductRepository();
const accessoryRepository = new PostgresAccessoryRepository();
const componentRepository = new PostgresComponentRepository();
const partRepository = new PostgresPartRepository();
const validationService = new ProductValidationService();

// POST /api/product-library/import/csv - 导入CSV文件
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '请上传CSV文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: '只支持CSV文件格式' },
        { status: 400 }
      );
    }

    // 读取文件内容
    const csvContent = await file.text();

    // 创建导入器并执行导入
    const importer = new CSVImporter(
      productRepository,
      accessoryRepository,
      componentRepository,
      partRepository,
      validationService
    );

    const result = await importer.import(csvContent);

    return NextResponse.json({
      success: result.success,
      data: result,
      message: result.success ? '导入成功' : '部分导入失败',
    });
  } catch (error) {
    console.error('CSV导入失败:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'CSV导入失败' },
      { status: 500 }
    );
  }
}
