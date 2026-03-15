/**
 * 搴撳棰勭暀API璺敱
 * 澶勭悊搴撳棰勭暀鍜岄噴鏀捐 */
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

    // 鍙傛暟楠岃瘉
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: '璇彁渚涙湁鏁堢殑棰勭暀鍟嗗搧鍒楄〃' },
        { status: 400 }
      );
    }

    // 楠岃瘉姣忎釜鍟嗗搧    for (const item of items) {
      if (!item.partId || !item.warehouseId || !item.quantity) {
        return NextResponse.json(
          { success: false, error: '鍟嗗搧淇℃伅涓嶅畬 },
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

    const reservationService = new InventoryReservationService();

    if (action === 'reserve') {
      // 鎵归噺棰勭暀搴撳
      const result = await reservationService.reserveMultipleItems(
        items.map(item => ({
          partId: item.partId,
          warehouseId: item.warehouseId,
          quantity: item.quantity,
          orderId: item.orderId,
        }))
      );

      if (result.success) {
        return NextResponse.json({
          success: true,
          reservationIds: result.reservationIds,
          message: `鎴愬姛棰勭暀 ${result.reservationIds.length} 涓簱瀛橀」`,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: '搴撳棰勭暀澶辫触',
            failedItems: result.failedItems,
          },
          { status: 400 }
        );
      }
    } else if (action === 'release') {
      // 鎵归噺閲婃斁棰勭暀
      const reservationIds = items
        .map(item => item.reservationId)
        .filter(Boolean);

      if (reservationIds.length === 0) {
        return NextResponse.json(
          { success: false, error: '璇彁渚涙湁鏁堢殑棰勭暀ID鍒楄〃' },
          { status: 400 }
        );
      }

      await reservationService.releaseMultipleReservations(reservationIds);

      return NextResponse.json({
        success: true,
        message: `鎴愬姛閲婃斁 ${reservationIds.length} 涓鐣欓」`,
      });
    } else {
      return NextResponse.json(
        { success: false, error: '犳晥鐨勬搷浣滅被 },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('搴撳棰勭暀API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '搴撳棰勭暀澶勭悊澶辫触',
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
    const partId = searchParams.get('partId');
    const warehouseId = searchParams.get('warehouseId');
    const status = searchParams.get('status') || 'active';

    if (!partId || !warehouseId) {
      return NextResponse.json(
        { success: false, error: '璇彁渚涢厤禝D鍜屼粨搴揑D' },
        { status: 400 }
      );
    }

    // 鏌ヨ搴撳棰勭暀鎯呭喌
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

    // 璁＄畻鎬婚鐣欐暟    const totalReserved =
      data.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return NextResponse.json({
      success: true,
      data: {
        reservations: data || [],
        totalReserved,
        reservationCount: (data as any).(data as any).length || 0,
      },
    });
  } catch (error) {
    console.error('鏌ヨ搴撳棰勭暀閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏌ヨ搴撳棰勭暀澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

