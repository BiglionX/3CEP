import { PostgresProductRelationRepository } from '@/modules/product-library/infrastructure/repositories';
import { NextRequest, NextResponse } from 'next/server';

const relationRepository = new PostgresProductRelationRepository();

// GET /api/product-library/products/:id/bom - 获取产品BOM
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const relations = await relationRepository.findBOM(productId);

    return NextResponse.json({
      success: true,
      data: relations,
      count: relations.length,
    });
  } catch (error) {
    console.error('获取BOM失败:', error);
    return NextResponse.json(
      { success: false, error: '获取BOM失败' },
      { status: 500 }
    );
  }
}

// POST /api/product-library/products/:id/bom - 添加BOM关系
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const parentId = params.id;
    const body = await request.json();
    const { childProductId, relationType, quantity } = body;

    if (!childProductId || !relationType) {
      return NextResponse.json(
        { success: false, error: '子产品ID和关系类型不能为空' },
        { status: 400 }
      );
    }

    const { ProductRelation } =
      await import('@/modules/product-library/domain/entities');
    const relation = new ProductRelation({
      parentProductId: parentId,
      childProductId,
      relationType,
      quantity: quantity || 1,
    });

    const savedRelation = await relationRepository.create(relation);

    return NextResponse.json(
      {
        success: true,
        data: savedRelation,
        message: 'BOM关系添加成功',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('添加BOM关系失败:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: '添加BOM关系失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/product-library/products/:parentId/bom/:childId - 删除BOM关系
export async function DELETE(
  request: NextRequest,
  { params }: { params: { parentId: string; childId: string } }
) {
  try {
    await relationRepository.deleteByParentAndChild(
      params.parentId,
      params.childId
    );

    return NextResponse.json({
      success: true,
      message: 'BOM关系删除成功',
    });
  } catch (error) {
    console.error('删除BOM关系失败:', error);
    return NextResponse.json(
      { success: false, error: '删除BOM关系失败' },
      { status: 500 }
    );
  }
}
