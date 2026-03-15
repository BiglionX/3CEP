/**
 * 寰呭鏍镐緵搴斿晢鐢宠鏌ヨAPI
 */

import { NextResponse } from 'next/server';
import { SupplierService } from '@/supply-chain';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const supplierService = new SupplierService();
    const pendingApplications =
      await supplierService.getPendingApplications(limit);

    return NextResponse.json({
      success: true,
      data: {
        applications: pendingApplications,
        count: pendingApplications.length,
      },
    });
  } catch (error) {
    console.error('鏌ヨ寰呭鏍哥敵璇烽敊', error);
    return NextResponse.json(
      {
        error: '鏌ヨ寰呭鏍哥敵璇峰け,
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

