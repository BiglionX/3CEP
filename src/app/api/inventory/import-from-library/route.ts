import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/inventory/import-from-library - 从产品库导入产品
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productLibraryId,
      tenantId,
      customName,
      customSpecifications,
      syncEnabled = false,
    } = body;

    if (!productLibraryId || !tenantId) {
      return NextResponse.json(
        { success: false, error: '产品库ID和租户ID不能为空' },
        { status: 400 }
      );
    }

    // 1. 从产品库获取产品信息
    const { data: product, error: productError } = await supabase
      .from('product_library.complete_products')
      .select(
        `
        *,
        brands (
          name
        )
      `
      )
      .eq('id', productLibraryId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { success: false, error: '产品库中未找到该产品' },
        { status: 404 }
      );
    }

    // 2. 检查是否已存在相同 SKU 的库存记录
    const { data: existingInventory } = await supabase
      .from('foreign_trade_inventory')
      .select('id')
      .eq('sku', product.sku_code)
      .single();

    let inventoryId;

    if (existingInventory) {
      // 更新现有记录
      const { data, error } = await supabase
        .from('foreign_trade_inventory')
        .update({
          product_name: customName || product.name,
          product_library_id: productLibraryId,
          import_source: 'product_library',
          sync_enabled: syncEnabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingInventory.id)
        .select()
        .single();

      if (error) {
        throw new Error(`更新库存记录失败: ${error.message}`);
      }

      inventoryId = data.id;
    } else {
      // 创建新记录
      const { data, error } = await supabase
        .from('foreign_trade_inventory')
        .insert([
          {
            sku: product.sku_code,
            product_name: customName || product.name,
            category: 'imported_from_library',
            quantity: 0,
            unit: '件',
            status: 'normal',
            is_active: true,
            created_by: tenantId,
            product_library_id: productLibraryId,
            import_source: 'product_library',
            sync_enabled: syncEnabled,
            specifications: customSpecifications || product.specifications,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(`创建库存记录失败: ${error.message}`);
      }

      inventoryId = data.id;
    }

    // 3. 创建或更新引用映射
    const { error: refError } = await supabase
      .from('inventory_product_references')
      .upsert(
        {
          tenant_inventory_id: inventoryId,
          product_library_type: 'complete',
          product_library_id: productLibraryId,
          reference_data: {
            name: product.name,
            brand: product.brands?.name,
            specifications: customSpecifications || product.specifications,
            description: product.description,
          },
        },
        {
          onConflict: 'tenant_inventory_id,product_library_type',
        }
      );

    if (refError) {
      console.error('创建引用映射失败:', refError);
    }

    // 4. 记录同步日志
    await supabase.from('product_sync_logs').insert([
      {
        tenant_inventory_id: inventoryId,
        product_library_id: productLibraryId,
        sync_type: 'full',
        status: 'success',
        changes_summary: { action: 'import', source: 'product_library' },
        completed_at: new Date().toISOString(),
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        inventoryId,
        productLibraryId,
        productName: customName || product.name,
        sku: product.sku_code,
        importSource: 'product_library',
      },
      message: '从产品库导入成功',
    });
  } catch (error) {
    console.error('从产品库导入失败:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: '从产品库导入失败' },
      { status: 500 }
    );
  }
}
