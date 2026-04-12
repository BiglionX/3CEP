import { ProductValidationService } from '@/modules/product-library/domain/services';
import { ExcelImporter } from '@/modules/product-library/infrastructure/importers';
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

// POST /api/product-library/import/excel - 导入Excel文件
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '请上传Excel文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const validExtensions = ['.xlsx', '.xls'];
    const hasValidExtension = validExtensions.some(ext =>
      file.name.endsWith(ext)
    );

    if (!hasValidExtension) {
      return NextResponse.json(
        { success: false, error: '只支持Excel文件格式(.xlsx, .xls)' },
        { status: 400 }
      );
    }

    // 注意: 实际项目中需要安装 xlsx 库来解析 Excel
    // npm install xlsx
    // 这里简化处理，假设前端已经将 Excel 转换为 JSON

    const workbookData = await request.json().catch(() => null);

    if (!workbookData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Excel数据格式不正确，请先将Excel转换为JSON格式',
        },
        { status: 400 }
      );
    }

    // 创建导入器并执行导入
    const importer = new ExcelImporter(
      productRepository,
      accessoryRepository,
      componentRepository,
      partRepository,
      validationService
    );

    const result = await importer.import(workbookData);

    return NextResponse.json({
      success: result.success,
      data: result,
      message: result.success ? '导入成功' : '部分导入失败',
    });
  } catch (error) {
    console.error('Excel导入失败:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Excel导入失败' },
      { status: 500 }
    );
  }
}
