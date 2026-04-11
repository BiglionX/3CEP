import { InventoryManagementService } from '@/modules/inventory-management/application/services/InventoryManagementService';
import { SupabaseInventoryRepository } from '@/modules/inventory-management/infrastructure/persistence/SupabaseInventoryRepository';
import { NextRequest, NextResponse } from 'next/server';

const inventoryRepo = new SupabaseInventoryRepository();
const inventoryService = new InventoryManagementService(inventoryRepo);

/**
 * GET /api/inventory/items/[id]
 * 获取单个库存项详情
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await inventoryRepo.findById(params.id);
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error('Failed to fetch inventory item:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/inventory/items/[id]
 * 更新库存数量
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { quantity } = body;

    if (quantity === undefined || quantity < 0) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }

    const item = await inventoryService.updateStock(params.id, quantity);
    return NextResponse.json(item);
  } catch (error) {
    console.error('Failed to update inventory item:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * DELETE /api/inventory/items/[id]
 * 删除库存项
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await inventoryRepo.delete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete inventory item:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
