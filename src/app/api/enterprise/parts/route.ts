/**
 * 企业配件管理 API 路由
 * 提供配件的增删改查功能
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 获取企业配件列表
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '用户认证失败' },
        { status: 401 }
      );
    }

    // 获取企业信息
    const { data: enterpriseUser, error: enterpriseError } = await supabase
      .from('enterprise_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (enterpriseError || !enterpriseUser) {
      return NextResponse.json(
        { success: false, error: '企业用户信息不存在' },
        { status: 403 }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // 构建查询
    let query = supabase
      .from('enterprise_parts')
      .select('*', { count: 'exact' })
      .eq('enterprise_id', enterpriseUser.id);

    // 应用过滤条件
    if (status) {
      query = query.eq('status', status);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // 分页和排序
    const { data: parts, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取配件列表失败:', error);
      return NextResponse.json(
        { success: false, error: '获取配件列表失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: parts || [],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        totalItems: count || 0,
        itemsPerPage: limit
      }
    });

  } catch (error: any) {
    console.error('获取配件列表错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 创建新配件
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '用户认证失败' },
        { status: 401 }
      );
    }

    // 获取企业信息
    const { data: enterpriseUser, error: enterpriseError } = await supabase
      .from('enterprise_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (enterpriseError || !enterpriseUser) {
      return NextResponse.json(
        { success: false, error: '企业用户信息不存在' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // 验证必需字段
    if (!body.name || !body.category) {
      return NextResponse.json(
        { success: false, error: '配件名称和分类为必填项' },
        { status: 400 }
      );
    }

    // 插入配件数据
    const { data: part, error } = await supabase
      .from('enterprise_parts')
      .insert([{
        enterprise_id: enterpriseUser.id,
        name: body.name,
        category: body.category,
        brand: body.brand || null,
        model: body.model || null,
        part_number: body.part_number || null,
        description: body.description || null,
        specifications: body.specifications || null,
        price: body.price || null,
        currency: body.currency || 'CNY',
        stock_quantity: body.stock_quantity || 0,
        min_stock: body.min_stock || 0,
        warranty_period: body.warranty_period || null,
        image_urls: body.image_urls || [],
        status: body.status || 'draft',
        created_by: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('创建配件失败:', error);
      return NextResponse.json(
        { success: false, error: '创建配件失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: part,
      message: '配件创建成功'
    });

  } catch (error: any) {
    console.error('创建配件错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}