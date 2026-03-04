/**
 * FCX鏉冪泭鍏戞崲API鎺ュ彛
 * 鎻愪緵鏉冪泭鏌ヨ銆佸厬鎹€佽褰曟煡璇㈢瓑鍔熻兘
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import { EquityRedemptionService } from '@/fcx-system/services/equity-redemption.service';
import { AllianceLevel } from '@/fcx-system/models/fcx-account.model';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';
    const userId = searchParams.get('userId');

    // 鑾峰彇褰撳墠鐢ㄦ埛淇℃伅
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '鐢ㄦ埛鏈櫥? },
        { status: 401 }
      );
    }

    const service = new EquityRedemptionService();
    const targetUserId = userId || user.id;

    switch (action) {
      case 'list':
        // 鑾峰彇鐢ㄦ埛绛夌骇
        const { data: shopData } = await supabase
          .from('repair_shops')
          .select('alliance_level')
          .eq('id', targetUserId)
          .single();

        const userLevel =
          ((shopData as any)?.alliance_level as AllianceLevel) ||
          AllianceLevel.BRONZE;

        // 鑾峰彇鍙厬鎹㈡潈鐩婂垪?        const equities = await service.getAvailableEquities(userLevel);

        return NextResponse.json({
          success: true,
          data: {
            equities,
            userLevel,
            count: equities.length,
          },
        });

      case 'my-equities':
        // 鑾峰彇鎴戠殑鏉冪泭璁板綍
        const userEquities = await service.getUserEquities(targetUserId);

        return NextResponse.json({
          success: true,
          data: {
            equities: userEquities,
            count: userEquities.length,
          },
        });

      case 'check-availability':
        const equityTypeId = searchParams.get('equityTypeId');
        if (!equityTypeId) {
          return NextResponse.json(
            { success: false, error: '缂哄皯鏉冪泭绫诲瀷ID' },
            { status: 400 }
          );
        }

        const availability = await service.checkEquityAvailability(
          targetUserId,
          equityTypeId
        );

        return NextResponse.json({
          success: true,
          data: availability,
        });

      default:
        return NextResponse.json(
          { success: false, error: '鏃犳晥鐨勬搷浣滅被? },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('鏉冪泭API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const body = await request.json();
    const { action, equityTypeId, quantity = 1 } = body;

    // 楠岃瘉鐢ㄦ埛韬唤
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '鐢ㄦ埛鏈櫥? },
        { status: 401 }
      );
    }

    // 楠岃瘉蹇呰鍙傛暟
    if (!equityTypeId) {
      return NextResponse.json(
        { success: false, error: '缂哄皯鏉冪泭绫诲瀷ID' },
        { status: 400 }
      );
    }

    if (quantity <= 0 || quantity > 100) {
      return NextResponse.json(
        { success: false, error: '鍏戞崲鏁伴噺蹇呴』?-100涔嬮棿' },
        { status: 400 }
      );
    }

    const service = new EquityRedemptionService();

    switch (action) {
      case 'redeem':
        // 鍏戞崲鏉冪泭
        const result = await service.redeemEquity({
          userId: user.id,
          equityTypeId,
          quantity,
        });

        if (result.success) {
          return NextResponse.json({
            success: true,
            message: result.message,
            data: {
              redeemedItems: result.redeemedItems,
              remainingBalance: result.remainingBalance,
            },
          });
        } else {
          return NextResponse.json(
            { success: false, error: result.message },
            { status: 400 }
          );
        }

      default:
        return NextResponse.json(
          { success: false, error: '鏃犳晥鐨勬搷浣滅被? },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('鏉冪泭鍏戞崲API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

