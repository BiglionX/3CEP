import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/product-library/traceability
 * 获取溯源码列表
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const code_type = searchParams.get('code_type') || '';

    // 调试信息（开发环境）
    // console.log('查询溯源码, params:', {
    //   page,
    //   limit,
    //   search,
    //   status,
    //   code_type,
    // });

    // 构建查询
    let query = supabaseAdmin
      .from('traceability_codes')
      .select('*', { count: 'exact' });

    // 搜索条件
    if (search) {
      query = query.or(
        `code.ilike.%${search}%,sku.ilike.%${search}%,product_name.ilike.%${search}%`
      );
    }

    // 状态筛选
    if (status) {
      query = query.eq('status', status);
    }

    // 码类型筛选
    if (code_type) {
      query = query.eq('code_type', code_type);
    }

    // 分页和排序
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(page * limit, page * limit + limit - 1);

    if (error) {
      console.error('获取溯源码列表失败:', error);
      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      count: count || 0,
      hasMore: page * limit + limit < (count || 0),
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
 * POST /api/product-library/traceability
 * 批量生成溯源码
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      product_library_id,
      sku,
      product_name,
      quantity,
      code_type = 'qr',
    } = body;

    if (!sku || !product_name || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'SKU、产品名称和数量不能为空，且数量必须大于0' },
        { status: 400 }
      );
    }

    if (quantity > 1000) {
      return NextResponse.json(
        { error: '单次生成数量不能超过1000个' },
        { status: 400 }
      );
    }

    // 批量生成溯源码
    const codes = [];
    const timestamp = Date.now();

    for (let i = 0; i < quantity; i++) {
      const uniqueId = uuidv4();
      const code = `TRC-${uniqueId.substring(0, 8)}-${timestamp}-${i}`;

      codes.push({
        code,
        code_type,
        tenant_product_id: uuidv4(), // 临时UUID，实际使用时需要关联真实库存
        product_library_id: product_library_id || null,
        sku,
        product_name,
        status: 'active',
        lifecycle_events: [
          {
            event: 'generated',
            timestamp: new Date().toISOString(),
            description: '溯源码生成',
          },
        ],
      });
    }

    const { data, error } = await supabaseAdmin
      .from('traceability_codes')
      .insert(codes)
      .select();

    if (error) {
      console.error('创建溯源码失败:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      count: data?.length || 0,
      codes: data || [],
    });
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
