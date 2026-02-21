/**
 * 维修店退出联盟API
 * 处理店铺退出FCX联盟和解除质押
 */

import { NextResponse } from 'next/server';
import { AllianceService } from '@/fcx-system';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shopId } = body;

    // 参数验证
    if (!shopId) {
      return NextResponse.json(
        { error: '缺少必要参数: shopId' },
        { status: 400 }
      );
    }

    const allianceService = new AllianceService();
    const updatedShop = await allianceService.leaveAlliance(shopId);

    return NextResponse.json({
      success: true,
      data: {
        shop: updatedShop,
        message: '成功退出FCX联盟'
      }
    });

  } catch (error) {
    console.error('维修店退出联盟错误:', error);
    return NextResponse.json(
      { 
        error: '退出处理失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}