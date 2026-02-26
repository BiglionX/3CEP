/**
 * 库存预留API路由
 * 处理库存预留和释放请求
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import { InventoryReservationService } from '@/supply-chain/services/inventory-reservation.service';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  
  try {
    const body = await request.json();
    const { items, action } = body;

    // 参数验证
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: '请提供有效的预留商品列表' },
        { status: 400 }
      );
    }

    // 验证每个商品项
    for (const item of items) {
      if (!item.partId || !item.warehouseId || !item.quantity) {
        return NextResponse.json(
          { success: false, error: '商品信息不完整' },
          { status: 400 }
        );
      }
      
      if (item.quantity <= 0) {
        return NextResponse.json(
          { success: false, error: '商品数量必须大于0' },
          { status: 400 }
        );
      }
    }

    const reservationService = new InventoryReservationService();

    if (action === 'reserve') {
      // 批量预留库存
      const result = await reservationService.reserveMultipleItems(
        items.map(item => ({
          partId: item.partId,
          warehouseId: item.warehouseId,
          quantity: item.quantity,
          orderId: item.orderId
        }))
      );

      if (result.success) {
        return NextResponse.json({
          success: true,
          reservationIds: result.reservationIds,
          message: `成功预留 ${result.reservationIds.length} 个库存项`
        });
      } else {
        return NextResponse.json(
          { 
            success: false, 
            error: '库存预留失败',
            failedItems: result.failedItems
          },
          { status: 400 }
        );
      }

    } else if (action === 'release') {
      // 批量释放预留
      const reservationIds = items.map(item => item.reservationId).filter(Boolean);
      
      if (reservationIds.length === 0) {
        return NextResponse.json(
          { success: false, error: '请提供有效的预留ID列表' },
          { status: 400 }
        );
      }

      await reservationService.releaseMultipleReservations(reservationIds);
      
      return NextResponse.json({
        success: true,
        message: `成功释放 ${reservationIds.length} 个预留项`
      });

    } else {
      return NextResponse.json(
        { success: false, error: '无效的操作类型' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('库存预留API错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '库存预留处理失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  
  try {
    const { searchParams } = new URL(request.url);
    const partId = searchParams.get('partId');
    const warehouseId = searchParams.get('warehouseId');
    const status = searchParams.get('status') || 'active';

    if (!partId || !warehouseId) {
      return NextResponse.json(
        { success: false, error: '请提供配件ID和仓库ID' },
        { status: 400 }
      );
    }

    // 查询库存预留情况
    const { data, error } = await supabase
      .from('inventory_reservations')
      .select('*')
      .eq('part_id', partId)
      .eq('warehouse_id', warehouseId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    // 计算总预留数量
    const totalReserved = data?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return NextResponse.json({
      success: true,
      data: {
        reservations: data || [],
        totalReserved,
        reservationCount: (data as any)?.data?.length || 0
      }
    });

  } catch (error) {
    console.error('查询库存预留错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '查询库存预留失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}