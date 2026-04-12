import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

/**
 * GET /api/product-library/traceability/[id]
 * 获取溯源码详情
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('traceability_codes')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('获取溯源码详情失败:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: '溯源码不存在' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('API错误:', err);
    return NextResponse.json(
      {
        error: '服务器内部错误',
        details: err.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/product-library/traceability/[id]/status
 * 更新溯源码状态
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    if (!status || !['active', 'inactive', 'expired'].includes(status)) {
      return NextResponse.json({ error: '无效的状态值' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('traceability_codes')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('更新溯源码状态失败:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('API错误:', err);
    return NextResponse.json(
      {
        error: '服务器内部错误',
        details: err.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/product-library/traceability/[id]
 * 删除溯源码
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from('traceability_codes')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('删除溯源码失败:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API错误:', err);
    return NextResponse.json(
      {
        error: '服务器内部错误',
        details: err.message,
      },
      { status: 500 }
    );
  }
}
