/**
 * 维修店加盟API
 * 处理店铺加入FCX联盟的质押流程
 */

import { NextResponse } from 'next/server';
import { AllianceService } from '@/fcx-system';
import { STAKING_CONSTANTS } from '@/fcx-system/utils/constants';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shopId, stakingAmount, userId } = body;

    // 参数验证
    if (!shopId) {
      return NextResponse.json(
        { error: '缺少必要参数: shopId' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: '缺少必要参数: userId' },
        { status: 400 }
      );
    }

    const amount = stakingAmount || STAKING_CONSTANTS.DEFAULT_AMOUNT;

    if (amount < STAKING_CONSTANTS.MIN_AMOUNT) {
      return NextResponse.json(
        { 
          error: `质押金额不能小于${STAKING_CONSTANTS.MIN_AMOUNT} FCX`,
          minAmount: STAKING_CONSTANTS.MIN_AMOUNT
        },
        { status: 400 }
      );
    }

    if (amount > STAKING_CONSTANTS.MAX_AMOUNT) {
      return NextResponse.json(
        { 
          error: `质押金额不能大于${STAKING_CONSTANTS.MAX_AMOUNT} FCX`,
          maxAmount: STAKING_CONSTANTS.MAX_AMOUNT
        },
        { status: 400 }
      );
    }

    // 验证店铺联盟资格
    const allianceService = new AllianceService();
    const isQualified = await allianceService.validateAllianceQualification(shopId);
    
    if (!isQualified) {
      return NextResponse.json(
        { 
          error: '店铺不符合联盟加入条件',
          details: '请确保店铺信息完整、状态正常且已通过认证'
        },
        { status: 400 }
      );
    }

    // 执行加盟流程
    const updatedShop = await allianceService.joinAlliance(shopId, amount);

    return NextResponse.json({
      success: true,
      data: {
        shop: updatedShop,
        stakingAmount: amount,
        message: '成功加入FCX联盟'
      }
    });

  } catch (error) {
    console.error('维修店加盟错误:', error);
    return NextResponse.json(
      { 
        error: '加盟处理失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}