/**
 * 供应商详情查询API
 */

import { NextResponse } from 'next/server';
import { SupplierService } from '@/supply-chain';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: supplierId } = params;

    if (!supplierId) {
      return NextResponse.json({ error: '缺少供应商ID参数' }, { status: 400 });
    }

    const supplierService = new SupplierService();
    const supplier = await supplierService.getSupplier(supplierId);

    if (!supplier) {
      return NextResponse.json({ error: '供应商不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error('查询供应商详情错误:', error);
    return NextResponse.json(
      {
        error: '查询供应商详情失败',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
