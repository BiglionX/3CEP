import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/inventory/library-products - 搜索可导入的产品库产品
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const brandId = searchParams.get('brandId') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 构建查询
    let query = supabase
      .from('product_library.complete_products')
      .select(
        `
        *,
        brands (
          id,
          name,
          logo_url
        ),
        categories (
          id,
          name,
          path
        )
      `
      )
      .eq('status', 'published');

    // 添加搜索条件
    if (search) {
      query = query.or(`name.ilike.%${search}%,sku_code.ilike.%${search}%`);
    }

    if (brandId) {
      query = query.eq('brand_id', brandId);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // 分页
    const {
      data: products,
      error,
      count,
    } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`查询产品库失败: ${error.message}`);
    }

    // 检查哪些产品已被当前租户导入
    // 这里需要租户ID，暂时跳过

    return NextResponse.json({
      success: true,
      data: products || [],
      total: count || 0,
      hasMore: offset + limit < (count || 0),
    });
  } catch (error) {
    console.error('搜索产品库失败:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: '搜索产品库失败' },
      { status: 500 }
    );
  }
}
