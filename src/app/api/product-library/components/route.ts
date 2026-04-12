import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

/**
 * GET /api/product-library/components
 * 获取部件列表
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const brand_id = searchParams.get('brand_id') || '';
    const type = searchParams.get('type') || '';

    // 调试信息（开发环境）
    // console.log('调用 RPC get_components, params:', {
    //   page,
    //   limit,
    //   search,
    //   brand_id,
    //   type,
    // });

    // 使用 RPC 调用数据库函数
    const { data, error } = await supabaseAdmin.rpc('get_components', {
      p_page: page,
      p_limit: limit,
      p_search: search,
      p_brand_id: brand_id || null,
      p_type: type || null,
    });

    if (error) {
      console.error('获取部件列表失败 - RPC错误:', error);
      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    // 调试信息（开发环境）
    // console.log('RPC返回数据条数:', data?.length || 0);

    // 从结果中提取总数
    const totalCount = (data as any)?.[0]?.total_count || 0;
    const components =
      (data as any)?.map(
        ({ total_count: _total_count, ...component }: any) => component
      ) || [];

    return NextResponse.json({
      data: components,
      count: totalCount,
      hasMore: page * limit + limit < totalCount,
    });
  } catch (err: any) {
    console.error('API错误 - 异常捕获:', err);
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
 * POST /api/product-library/components
 * 创建部件
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .schema('product_library')
      .from('components')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('创建部件失败:', error);
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
