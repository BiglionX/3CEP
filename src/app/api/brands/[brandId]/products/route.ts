import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// 获取品牌的产品列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    const brandSlug = searchParams.get('brandSlug');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!brandId && !brandSlug) {
      return NextResponse.json(
        { error: '请提供 brandId 或 brandSlug 参数' },
        { status: 400 }
      );
    }

    // 先获取品牌信息
    let brandQuery = supabase
      .from('brands')
      .select('id, name, slug, logo_url')
      .eq('is_active', true);

    if (brandId) {
      brandQuery = brandQuery.eq('id', brandId);
    } else if (brandSlug) {
      brandQuery = brandQuery.eq('slug', brandSlug);
    }

    const { data: brand, error: brandError } = await brandQuery.single();

    if (brandError || !brand) {
      return NextResponse.json(
        { error: '品牌未找到' },
        { status: 404 }
      );
    }

    // 获取该品牌的产品列表
    const offset = (page - 1) * limit;
    
    const { data: products, error: productsError, count } = await supabase
      .from('products')
      .select(`
        id,
        name,
        model,
        category,
        qr_url,
        created_at,
        manuals_count:manuals(count)
      `, { count: 'exact' })
      .eq('brand_id', brand.id)
      .eq('is_active', true)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('获取产品列表失败:', productsError);
      return NextResponse.json(
        { error: '获取产品列表失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      brand: {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        logo_url: brand.logo_url
      },
      products: products || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      message: '产品列表获取成功'
    });

  } catch (error) {
    console.error('获取品牌产品列表错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 创建新产品
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brandId, name, model, category, description, specifications } = body;

    // 验证必要参数
    if (!brandId || !name) {
      return NextResponse.json(
        { error: '缺少必要参数：brandId 和 name' },
        { status: 400 }
      );
    }

    // 验证品牌是否存在
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id, name')
      .eq('id', brandId)
      .eq('is_active', true)
      .single();

    if (brandError || !brand) {
      return NextResponse.json(
        { error: '品牌不存在或已被禁用' },
        { status: 404 }
      );
    }

    // 生成产品ID
    const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const productUrl = `https://fx.cn/p/${productId}`;

    // 创建产品
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        id: productId,
        brand_id: brandId,
        name,
        model: model || '',
        category: category || 'electronics',
        qr_url: productUrl,
        description: description || '',
        specifications: specifications || {} as any,
        created_at: new Date().toISOString()
      })
      .select(`
        id,
        name,
        model,
        category,
        qr_url,
        description,
        specifications,
        brand:brands (
          id,
          name,
          slug
        )
      `)
      .single();

    if (productError) {
      console.error('创建产品失败:', productError);
      return NextResponse.json(
        { error: '产品创建失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
      message: '产品创建成功'
    });

  } catch (error) {
    console.error('创建产品错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}