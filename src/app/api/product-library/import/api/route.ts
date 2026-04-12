import { ProductValidationService } from '@/modules/product-library/domain/services';
import {
  APIImporter,
  APISource,
} from '@/modules/product-library/infrastructure/importers';
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

// POST /api/product-library/import/api - 从外部API导入
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source } = body as { source: APISource };

    if (!source || !source.config || !source.config.baseUrl) {
      return NextResponse.json(
        { success: false, error: '请提供有效的API配置' },
        { status: 400 }
      );
    }

    // 创建导入器并执行导入
    const importer = new APIImporter(
      productRepository,
      accessoryRepository,
      componentRepository,
      partRepository,
      validationService
    );

    const result = await importer.importFromAPI(source);

    return NextResponse.json({
      success: result.success,
      data: result,
      message: result.success ? 'API导入成功' : '部分导入失败',
    });
  } catch (error) {
    console.error('API导入失败:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'API导入失败' },
      { status: 500 }
    );
  }
}
