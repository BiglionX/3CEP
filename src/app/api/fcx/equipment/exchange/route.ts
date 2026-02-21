/**
 * FCX兑换配件API路由
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
    const { repairShopId, items, userLocation } = body;

    // 参数验证
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
    }

    const fcxService = new FcxEquipmentService();
    const result = await fcxService.exchangeEquipment({
      repairShopId,
      items,
      userLocation
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result,
        message: 'FCX兑换成功'
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.message,
          data: result
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
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '请提供用户ID' },
        { status: 400 }
      );
    }

    const fcxService = new FcxEquipmentService();
    const history = await fcxService.getExchangeHistory(userId, limit);

    return NextResponse.json({
      success: true,
      data: history,
      count: history.length
    });

  } catch (error) {
    console.error('获取兑换历史错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取兑换历史失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}