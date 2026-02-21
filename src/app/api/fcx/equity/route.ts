/**
 * FCX权益兑换API接口
 * 提供权益查询、兑换、记录查询等功能
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

    // 获取当前用户信息
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户未登录' },
        { status: 401 }
      );
    }

    const service = new EquityRedemptionService();
    const targetUserId = userId || user.id;

    switch (action) {
      case 'list':
        // 获取用户等级
        const { data: shopData } = await supabase
          .from('repair_shops')
          .select('alliance_level')
          .eq('id', targetUserId)
          .single();

        const userLevel = (shopData as any)?.alliance_level as AllianceLevel || AllianceLevel.BRONZE;
        
        // 获取可兑换权益列表
        const equities = await service.getAvailableEquities(userLevel);
        
        return NextResponse.json({
          success: true,
          data: {
            equities,
            userLevel,
            count: equities.length
          }
        });

      case 'my-equities':
        // 获取我的权益记录
        const userEquities = await service.getUserEquities(targetUserId);
        
        return NextResponse.json({
          success: true,
          data: {
            equities: userEquities,
            count: userEquities.length
          }
        });

      case 'check-availability':
        const equityTypeId = searchParams.get('equityTypeId');
        if (!equityTypeId) {
          return NextResponse.json(
            { success: false, error: '缺少权益类型ID' },
            { status: 400 }
          );
        }

        const availability = await service.checkEquityAvailability(targetUserId, equityTypeId);
        
        return NextResponse.json({
          success: true,
          data: availability
        });

      default:
        return NextResponse.json(
          { success: false, error: '无效的操作类型' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('权益API错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '服务器内部错误',
        details: (error as Error).message 
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

    // 验证用户身份
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户未登录' },
        { status: 401 }
      );
    }

    // 验证必要参数
    if (!equityTypeId) {
      return NextResponse.json(
        { success: false, error: '缺少权益类型ID' },
        { status: 400 }
      );
    }

    if (quantity <= 0 || quantity > 100) {
      return NextResponse.json(
        { success: false, error: '兑换数量必须在1-100之间' },
        { status: 400 }
      );
    }

    const service = new EquityRedemptionService();
    
    switch (action) {
      case 'redeem':
        // 兑换权益
        const result = await service.redeemEquity({
          userId: user.id,
          equityTypeId,
          quantity
        });

        if (result.success) {
          return NextResponse.json({
            success: true,
            message: result.message,
            data: {
              redeemedItems: result.redeemedItems,
              remainingBalance: result.remainingBalance
            }
          });
        } else {
          return NextResponse.json(
            { success: false, error: result.message },
            { status: 400 }
          );
        }

      default:
        return NextResponse.json(
          { success: false, error: '无效的操作类型' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('权益兑换API错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '服务器内部错误',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}