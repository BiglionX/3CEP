/**
 * 待审核供应商申请查询API
 */

import { NextResponse } from 'next/server';
import { SupplierService } from '@/supply-chain';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const supplierService = new SupplierService();
    const pendingApplications = await supplierService.getPendingApplications(limit);

    return NextResponse.json({
      success: true,
      data: {
        applications: pendingApplications,
        count: pendingApplications.length
      }
    });

  } catch (error) {
    console.error('查询待审核申请错误:', error);
    return NextResponse.json(
      { 
        error: '查询待审核申请失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}