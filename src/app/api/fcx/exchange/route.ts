/**
 * FCX閰嶄欢鍏戞崲API璺敱
 * 鎻愪緵閰嶄欢鍏戞崲鐨勬牳蹇冨姛鑳芥帴? */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import { FcxEquipmentService } from '@/fcx-system/services/fcx-equipment.service';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const body = await request.json();
    const { repairShopId, userId, items, userLocation, shippingAddress } = body;

    // 鍙傛暟楠岃瘉
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '璇锋彁渚涚敤鎴稩D' },
        { status: 400 }
      );
    }

    if (!repairShopId) {
      return NextResponse.json(
        { success: false, error: '璇锋彁渚涚淮淇簵ID' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: '璇锋彁渚涙湁鏁堢殑鍏戞崲鍟嗗搧鍒楄〃' },
        { status: 400 }
      );
    }

    // 楠岃瘉姣忎釜鍟嗗搧?    for (const item of items) {
      if (!item.productId || !item.quantity || !item.fcxPrice) {
        return NextResponse.json(
          { success: false, error: '鍟嗗搧淇℃伅涓嶅畬? },
          { status: 400 }
        );
      }

      if (item.quantity <= 0) {
        return NextResponse.json(
          { success: false, error: '鍟嗗搧鏁伴噺蹇呴』澶т簬0' },
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
      shippingAddress,
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
          transactionId: result.transactionId,
        },
        message: result.message,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          data: {
            totalFcxCost: result.totalFcxCost,
            warehouseId: result.warehouseId,
            estimatedDeliveryTime: result.estimatedDeliveryTime,
          },
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('FCX鍏戞崲閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'FCX鍏戞崲澶辫触',
        details: (error as Error).message,
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
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : 20;
    const offset = searchParams.get('offset')
      ? parseInt(searchParams.get('offset')!)
      : 0;

    if (!userId && !repairShopId) {
      return NextResponse.json(
        { success: false, error: '璇锋彁渚涚敤鎴稩D鎴栫淮淇簵ID' },
        { status: 400 }
      );
    }

    // 鏋勫缓鏌ヨ鏉′欢
    let query = supabase.from('fcx_exchange_orders_complete').select('*');

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
        hasMore: offset + limit < (count || 0),
      },
    });
  } catch (error) {
    console.error('鑾峰彇鍏戞崲璁㈠崟鍒楄〃閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鑾峰彇鍏戞崲璁㈠崟鍒楄〃澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

