import { NextResponse } from 'next/server';
import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export async function GET(request: Request) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const { searchParams } = new URL(request.url);
    const partId = searchParams.get('partId');

    if (!partId) {
      return NextResponse.json(
        { success: false, error: '缺少配件ID' },
        { status: 400 }
      );
    }

    // 获取配件详细信息
    const { data: partData, error: partError } = await supabase
      .from('parts_complete_view')
      .select('*')
      .eq('id', partId)
      .single();

    if (partError) throw partError;

    // 获取配件的所有图片
    const { data: images, error: imageError } = await supabase
      .from('part_images')
      .select('*')
      .eq('part_id', partId)
      .order('sort_order', { ascending: true });

    if (imageError) throw imageError;

    // 获取库存变动记录
    const { data: inventoryRecords, error: inventoryError } = await supabase
      .from('part_inventory')
      .select(
        `
        *,
        creator:user_profiles(username, avatar_url)
      `
      )
      .eq('part_id', partId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (inventoryError) throw inventoryError;

    return NextResponse.json({
      success: true,
      data: {
        part: partData,
        images: images || [],
        inventoryHistory: inventoryRecords || [],
      },
    });
  } catch (error) {
    console.error('获取配件详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取配件详情失败' },
      { status: 500 }
    );
  }

    },
    'parts_read'
  );

export async function PUT(request: Request) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const body = await request.json();
    const { id, stock_change, transaction_type, reason, reference_number } =
      body;

    if (!id || !stock_change) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 获取当前库存
    const { data: partData, error: partError } = await supabase
      .from('parts')
      .select('stock_quantity')
      .eq('id', id)
      .single();

    if (partError) throw partError;

    const currentStock = partData.stock_quantity || 0;
    const newStock = currentStock + stock_change;

    if (newStock < 0) {
      return NextResponse.json(
        { success: false, error: '库存不能为负数' },
        { status: 400 }
      );
    }

    // 更新库存
    const { error: updateError } = await supabase
      .from('parts')
      .update({
        stock_quantity: newStock,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', id);

    if (updateError) throw updateError;

    // 记录库存变动
    const { error: inventoryError } = await supabase
      .from('part_inventory')
      .insert({
        part_id: id,
        quantity_change: stock_change,
        transaction_type: transaction_type || 'adjustment',
        reason: reason || '库存调整',
        reference_number: reference_number,
        created_by: (await supabase.auth.getUser()).data.id,
      } as any);

    if (inventoryError) throw inventoryError;

    return NextResponse.json({
      success: true,
      data: {
        previous_stock: currentStock,
        new_stock: newStock,
        change_amount: stock_change,
      },
      message: '库存更新成功',
    }) as any;
  } catch (error) {
    console.error('更新库存失败:', error);
    return NextResponse.json(
      { success: false, error: '更新库存失败' },
      { status: 500 }
    );
  }

    },
    'parts_read'
  );
