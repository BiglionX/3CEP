import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/traceability/generate - 批量生成溯源码
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tenantProductId,
      productLibraryId: _productLibraryId,
      sku: _sku,
      productName: _productName,
      codeType = 'qr',
      quantity = 1,
      expiresInDays,
    } = body;

    if (!tenantProductId) {
      return NextResponse.json(
        { success: false, error: '租户产品ID不能为空' },
        { status: 400 }
      );
    }

    // 调用数据库函数批量生成
    const { data, error } = await supabase.rpc(
      'generate_batch_traceability_codes',
      {
        p_tenant_product_id: tenantProductId,
        p_quantity: quantity,
        p_code_type: codeType,
        p_expires_in_days: expiresInDays || null,
      }
    );

    if (error) {
      throw new Error(`生成溯源码失败: ${error.message}`);
    }

    // 获取生成的溯源码详情
    const codes = await Promise.all(
      (data as string[]).map(async code => {
        const { data: codeData } = await supabase
          .from('inventory.traceability_codes')
          .select('*')
          .eq('code', code)
          .single();

        return codeData;
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        codes,
        totalGenerated: codes.length,
      },
      message: `成功生成 ${codes.length} 个溯源码`,
    });
  } catch (error) {
    console.error('生成溯源码失败:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: '生成溯源码失败' },
      { status: 500 }
    );
  }
}
