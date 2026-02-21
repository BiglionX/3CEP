/**
 * FCX配件兑换API路由
 * 提供配件兑换的核心功能接口
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import { FcxEquipmentService } from '@/fcx-system/services/fcx-equipment.service';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  
  try {
    const body = await request.json();
    const { 
      repairShopId, 
      userId, 
      items, 
      userLocation, 
      shippingAddress 
    } = body;

    // 参数验证
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '请提供用户ID' },
        { status: 400 }
      );
    }

    if (!repairShopId) {
      return NextResponse.json(
        { success: false, error: '请提供维修店ID' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: '请提供有效的兑换商品列表' },
        { status: 400 }
      );
    }

    // 验证每个商品项
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.fcxPrice) {
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

    const fcxService = new FcxEquipmentService();
    const result = await fcxService.exchangeEquipment({
      repairShopId,
      userId,
      items,
      userLocation,
      shippingAddress
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          orderId: result.orderId,
          orderNumber: result.orderNumber,
          totalFcxCost: result.totalFcxCost,
          warehouseId: result.warehouseId,
          estimatedDeliveryTime: result.estimatedDeliveryTime,
          transactionId: result.transactionId
        },
        message: result.message
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.message,
          data: {
            totalFcxCost: result.totalFcxCost,
            warehouseId: result.warehouseId,
            estimatedDeliveryTime: result.estimatedDeliveryTime
          }
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('FCX兑换错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'FCX兑换失败',
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
    const userId = searchParams.get('userId');
    const repairShopId = searchParams.get('repairShopId');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    if (!userId && !repairShopId) {
      return NextResponse.json(
        { success: false, error: '请提供用户ID或维修店ID' },
        { status: 400 }
      );
    }

    // 构建查询条件
    let query = supabase
      .from('fcx_exchange_orders_complete')
      .select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (repairShopId) {
      query = query.eq('repair_shop_id', repairShopId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0)
      }
    });

  } catch (error) {
    console.error('获取兑换订单列表错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取兑换订单列表失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}