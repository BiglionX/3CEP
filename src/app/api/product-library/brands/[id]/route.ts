import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

/**
 * GET /api/product-library/brands/[id]
 * 获取品牌详情
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .schema('product_library')
      .from('brands')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: '品牌不存在' }, { status: 404 });
      }
      console.error('获取品牌详情失败:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('API错误:', err);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

/**
 * PUT /api/product-library/brands/[id]
 * 更新品牌
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .schema('product_library')
      .from('brands')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('更新品牌失败:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('API错误:', err);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

/**
 * DELETE /api/product-library/brands/[id]
 * 删除品牌
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .schema('product_library')
      .from('brands')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('删除品牌失败:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API错误:', err);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
