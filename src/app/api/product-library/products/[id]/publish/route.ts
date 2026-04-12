import { PublishProductUseCase } from '@/modules/product-library/application/use-cases';
import { PostgresProductRepository } from '@/modules/product-library/infrastructure/repositories';
import { NextRequest, NextResponse } from 'next/server';

const productRepository = new PostgresProductRepository();

// POST /api/product-library/products/[id]/publish - 发布产品
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    const publishProductUseCase = new PublishProductUseCase(productRepository);
    const product = await publishProductUseCase.execute(productId);

    return NextResponse.json({
      success: true,
      data: product,
      message: '产品发布成功',
    });
  } catch (error) {
    console.error('发布产品失败:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: '发布产品失败' },
      { status: 500 }
    );
  }
}
