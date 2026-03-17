import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * 获取批次详情
 * GET /api/enterprise/traceability/batches/:batchId
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { batchId: string } }
) {
  try {
    const { batchId } = params;

    const { data: batch, error } = await supabase
      .from('enterprise_qr_batches')
      .select(
        `
        *,
        enterprise_qr_codes (
          id,
          product_id,
          internal_code,
          serial_number,
          scanned_count,
          last_scanned_at,
          is_active
        )
      `
      )
      .eq('batch_id', batchId)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: batch,
    });
  } catch (error) {
    console.error('获取批次详情失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || '服务器内部错误',
      },
      { status: 500 }
    );
  }
}

/**
 * 更新批次状态
 * PATCH /api/enterprise/traceability/batches/:batchId
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { batchId: string } }
) {
  try {
    const { batchId } = params;
    const body = await request.json();
    const { status, start_date, end_date } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (start_date) updateData.start_date = start_date;
    if (end_date) updateData.end_date = end_date;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('enterprise_qr_batches')
      .update(updateData)
      .eq('batch_id', batchId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
      message: '批次更新成功',
    });
  } catch (error) {
    console.error('更新批次失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || '服务器内部错误',
      },
      { status: 500 }
    );
  }
}

/**
 * 删除批次
 * DELETE /api/enterprise/traceability/batches/:batchId
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { batchId: string } }
) {
  try {
    const { batchId } = params;

    const { error } = await supabase
      .from('enterprise_qr_batches')
      .delete()
      .eq('batch_id', batchId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '批次删除成功',
    });
  } catch (error) {
    console.error('删除批次失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || '服务器内部错误',
      },
      { status: 500 }
    );
  }
}
