import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/inventory/:id/sync-status - 获取同步状态
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inventoryId = params.id;

    // 获取库存记录
    const { data: inventory, error: invError } = await supabase
      .from('foreign_trade_inventory')
      .select(
        `
        *,
        product_library:product_library_id (
          id,
          name,
          sku_code,
          version,
          updated_at
        )
      `
      )
      .eq('id', inventoryId)
      .single();

    if (invError || !inventory) {
      return NextResponse.json(
        { success: false, error: '库存记录不存在' },
        { status: 404 }
      );
    }

    if (!inventory.product_library_id) {
      return NextResponse.json({
        success: true,
        data: {
          hasProductLibraryRef: false,
          message: '该库存项未关联产品库',
        },
      });
    }

    // 获取引用映射
    const { data: reference } = await supabase
      .from('inventory_product_references')
      .select('*')
      .eq('tenant_inventory_id', inventoryId)
      .eq('product_library_type', 'complete')
      .single();

    // 获取最近的同步日志
    const { data: recentSyncs } = await supabase
      .from('product_sync_logs')
      .select('*')
      .eq('tenant_inventory_id', inventoryId)
      .order('created_at', { ascending: false })
      .limit(5);

    // 检查是否有更新
    const needsSync =
      inventory.product_library &&
      reference &&
      new Date(inventory.product_library.updated_at) >
        new Date(reference.updated_at);

    return NextResponse.json({
      success: true,
      data: {
        hasProductLibraryRef: true,
        inventoryId,
        productLibraryId: inventory.product_library_id,
        syncEnabled: inventory.sync_enabled,
        lastSyncAt: inventory.last_sync_at,
        libraryProduct: inventory.product_library,
        referenceData: reference?.reference_data,
        needsSync,
        recentSyncs: recentSyncs || [],
      },
    });
  } catch (error) {
    console.error('获取同步状态失败:', error);
    return NextResponse.json(
      { success: false, error: '获取同步状态失败' },
      { status: 500 }
    );
  }
}

// POST /api/inventory/:id/sync - 手动同步产品库更新
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inventoryId = params.id;

    // 获取库存记录
    const { data: inventory, error: invError } = await supabase
      .from('foreign_trade_inventory')
      .select('*, product_library_id, sync_enabled')
      .eq('id', inventoryId)
      .single();

    if (invError || !inventory) {
      return NextResponse.json(
        { success: false, error: '库存记录不存在' },
        { status: 404 }
      );
    }

    if (!inventory.product_library_id) {
      return NextResponse.json(
        { success: false, error: '该库存项未关联产品库' },
        { status: 400 }
      );
    }

    // 获取产品库最新数据
    const { data: libraryProduct, error: libError } = await supabase
      .from('product_library.complete_products')
      .select('*')
      .eq('id', inventory.product_library_id)
      .single();

    if (libError || !libraryProduct) {
      return NextResponse.json(
        { success: false, error: '产品库中未找到该产品' },
        { status: 404 }
      );
    }

    // 记录同步开始
    const { data: syncLog } = await supabase
      .from('product_sync_logs')
      .insert([
        {
          tenant_inventory_id: inventoryId,
          product_library_id: inventory.product_library_id,
          sync_type: 'manual',
          status: 'pending',
        },
      ])
      .select()
      .single();

    // 执行同步（仅当 sync_enabled = true 时更新产品名称）
    const updates: any = {
      last_sync_at: new Date().toISOString(),
    };

    if (inventory.sync_enabled) {
      updates.product_name = libraryProduct.name;
    }

    const { error: updateError } = await supabase
      .from('foreign_trade_inventory')
      .update(updates)
      .eq('id', inventoryId);

    if (updateError) {
      // 更新同步日志为失败
      await supabase
        .from('product_sync_logs')
        .update({
          status: 'failed',
          error_message: updateError.message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncLog.id);

      throw new Error(`同步失败: ${updateError.message}`);
    }

    // 更新引用映射
    await supabase
      .from('inventory_product_references')
      .update({
        reference_data: {
          name: libraryProduct.name,
          specifications: libraryProduct.specifications,
          description: libraryProduct.description,
          version: libraryProduct.version,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('tenant_inventory_id', inventoryId)
      .eq('product_library_type', 'complete');

    // 更新同步日志为成功
    await supabase
      .from('product_sync_logs')
      .update({
        status: 'success',
        changes_summary: {
          synced_fields: inventory.sync_enabled ? ['product_name'] : [],
          library_version: libraryProduct.version,
        },
        completed_at: new Date().toISOString(),
      })
      .eq('id', syncLog.id);

    return NextResponse.json({
      success: true,
      data: {
        inventoryId,
        syncedAt: new Date().toISOString(),
        libraryVersion: libraryProduct.version,
        syncEnabled: inventory.sync_enabled,
      },
      message: '同步成功',
    });
  } catch (error) {
    console.error('同步产品库更新失败:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: '同步产品库更新失败' },
      { status: 500 }
    );
  }
}
