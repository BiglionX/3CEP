/**
 * FCX鍏戞崲閰嶄欢API璺敱
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

    // 鍙傛暟楠岃瘉
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
    }

    const fcxService = new FcxEquipmentService();
    const result = await fcxService.exchangeEquipment({
      repairShopId,
      items,
      userLocation,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result,
        message: 'FCX鍏戞崲鎴愬姛',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          data: result,
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
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : 20;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '璇锋彁渚涚敤鎴稩D' },
        { status: 400 }
      );
    }

    const fcxService = new FcxEquipmentService();
    const history = await fcxService.getExchangeHistory(userId, limit);

    return NextResponse.json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (error) {
    console.error('鑾峰彇鍏戞崲鍘嗗彶閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鑾峰彇鍏戞崲鍘嗗彶澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

