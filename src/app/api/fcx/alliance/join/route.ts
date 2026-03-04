/**
 * 缁翠慨搴楀姞鐩烝PI
 * 澶勭悊搴楅摵鍔犲叆FCX鑱旂洘鐨勮川鎶兼祦? */

import { NextResponse } from 'next/server';
import { AllianceService } from '@/fcx-system';
import { STAKING_CONSTANTS } from '@/modules/fcx-alliance/utils/constants';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shopId, stakingAmount, userId } = body;

    // 鍙傛暟楠岃瘉
    if (!shopId) {
      return NextResponse.json(
        { error: '缂哄皯蹇呰鍙傛暟: shopId' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: '缂哄皯蹇呰鍙傛暟: userId' },
        { status: 400 }
      );
    }

    const amount = stakingAmount || STAKING_CONSTANTS.DEFAULT_AMOUNT;

    if (amount < STAKING_CONSTANTS.MIN_AMOUNT) {
      return NextResponse.json(
        {
          error: `璐ㄦ娂閲戦涓嶈兘灏忎簬${STAKING_CONSTANTS.MIN_AMOUNT} FCX`,
          minAmount: STAKING_CONSTANTS.MIN_AMOUNT,
        },
        { status: 400 }
      );
    }

    if (amount > STAKING_CONSTANTS.MAX_AMOUNT) {
      return NextResponse.json(
        {
          error: `璐ㄦ娂閲戦涓嶈兘澶т簬${STAKING_CONSTANTS.MAX_AMOUNT} FCX`,
          maxAmount: STAKING_CONSTANTS.MAX_AMOUNT,
        },
        { status: 400 }
      );
    }

    // 楠岃瘉搴楅摵鑱旂洘璧勬牸
    const allianceService = new AllianceService();
    const isQualified =
      await allianceService.validateAllianceQualification(shopId);

    if (!isQualified) {
      return NextResponse.json(
        {
          error: '搴楅摵涓嶇鍚堣仈鐩熷姞鍏ユ潯?,
          details: '璇风‘淇濆簵閾轰俊鎭畬鏁淬€佺姸鎬佹甯镐笖宸查€氳繃璁よ瘉',
        },
        { status: 400 }
      );
    }

    // 鎵ц鍔犵洘娴佺▼
    const updatedShop = await allianceService.joinAlliance(shopId, amount);

    return NextResponse.json({
      success: true,
      data: {
        shop: updatedShop,
        stakingAmount: amount,
        message: '鎴愬姛鍔犲叆FCX鑱旂洘',
      },
    });
  } catch (error) {
    console.error('缁翠慨搴楀姞鐩熼敊?', error);
    return NextResponse.json(
      {
        error: '鍔犵洘澶勭悊澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

