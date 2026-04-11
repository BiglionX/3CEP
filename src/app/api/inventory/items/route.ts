import { InventoryManagementService } from '@/modules/inventory-management/application/services/InventoryManagementService';
import { SupabaseInventoryRepository } from '@/modules/inventory-management/infrastructure/persistence/SupabaseInventoryRepository';
import { NextRequest, NextResponse } from 'next/server';

// 初始化服务（在实际生产中建议使用依赖注入容器）
const inventoryRepo = new SupabaseInventoryRepository();
const inventoryService = new InventoryManagementService(inventoryRepo);

/**
 * GET /api/inventory/items
 * 获取库存项列表
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;

    const result = await inventoryRepo.findAll(tenantId, {
      limit,
      offset,
      category,
      status,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch inventory items:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inventory/items
 * 创建新的库存项
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tenantId,
      sku,
      name,
      unitPrice,
      quantity,
      safetyStock,
      reorderPoint,
      currency,
    } = body;

    if (
      !tenantId ||
      !sku ||
      !name ||
      unitPrice === undefined ||
      quantity === undefined
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const item = await inventoryService.createInventoryItem({
      tenantId,
      sku,
      name,
      unitPrice,
      quantity,
      safetyStock,
      reorderPoint,
      currency,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Failed to create inventory item:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
