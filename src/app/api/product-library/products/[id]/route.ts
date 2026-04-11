import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

/**
 * GET /api/product-library/products/[id]
 * 获取整机产品详情
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .schema('product_library')
      .from('complete_products')
      .select('*, brand:brands(*)')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('获取产品详情失败:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: '产品不存在' }, { status: 404 });
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
 * PUT /api/product-library/products/[id]
 * 更新整机产品
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .schema('product_library')
      .from('complete_products')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('更新产品失败:', error);
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
 * DELETE /api/product-library/products/[id]
 * 删除整机产品
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .schema('product_library')
      .from('complete_products')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('删除产品失败:', error);
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
