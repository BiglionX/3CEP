import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

/**
 * GET /api/product-library/accessories/[id]
 * 获取配件详情
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .schema('product_library')
      .from('accessories')
      .select('*, brand:brands(*)')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('获取配件详情失败:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: '配件不存在' }, { status: 404 });
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
 * PUT /api/product-library/accessories/[id]
 * 更新配件
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .schema('product_library')
      .from('accessories')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('更新配件失败:', error);
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
 * DELETE /api/product-library/accessories/[id]
 * 删除配件
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .schema('product_library')
      .from('accessories')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('删除配件失败:', error);
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
