/**
 * 智能体API路由
 * 提供智能体列表、创建、更新、删除等功能
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 获取查询参数
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const category = searchParams.get('category');

  try {
    // 构建查询
    let query = supabase.from('agents').select('*', { count: 'exact' });

    // 应用过滤条件
    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // 分页
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: agents, error, count } = await query.order('updated_at', { ascending: false });

    if (error) {
      console.error('获取智能体列表失败:', error);
      return NextResponse.json(
        { error: '获取智能体列表失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: agents || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: unknown) {
    console.error('智能体API错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 解析请求体
    const body = await request.json();

    // 验证必填字段
    if (!body.name || !body.configuration) {
      return NextResponse.json(
        { error: '智能体名称和配置为必填项' },
        { status: 400 }
      );
    }

    // 创建智能体
    const { data: agent, error } = await supabase
      .from('agents')
      .insert({
        name: body.name.trim(),
        description: body.description?.trim() || null,
        configuration: body.configuration,
        category: body.category || 'general',
        status: body.status || 'inactive',
        version: body.version || '1.0.0',
        tags: body.tags || [],
        pricing: body.pricing || { type: 'free', price: 0 },
        created_by: body.userId || 'anonymous',
        updated_by: body.userId || 'anonymous',
      } as any)
      .select()
      .single();

    if (error) {
      console.error('创建智能体失败:', error);
      return NextResponse.json(
        { error: '创建智能体失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: '智能体创建成功',
        data: agent,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('创建智能体出错:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
