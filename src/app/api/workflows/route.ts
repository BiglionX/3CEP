/**
 * 工作流管理 API 端点
 * 提供工作流列表、详情、执行和回放功能
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 验证用户认证
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-access-token');

    if (!sessionCookie) {
      return NextResponse.json({ error: '用户未认证' }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json({ error: '用户认证失败' }, { status: 401 });
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // 构建查询
    let query = supabase
      .from('workflows')
      .select('*', { count: 'exact' });

    // 应用过滤条件
    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // 分页
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: workflows, error, count } = await query
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('获取工作流列表失败:', error);
      return NextResponse.json(
        { error: '获取工作流列表失败' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: workflows || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error: any) {
    console.error('工作流 API 错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 验证用户认证
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-access-token');

    if (!sessionCookie) {
      return NextResponse.json({ error: '用户未认证' }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json({ error: '用户认证失败' }, { status: 401 });
    }

    // 解析请求体
    const body = await request.json();
    
    // 验证必要字段
    if (!body.name || !body.workflow_data) {
      return NextResponse.json(
        { error: '工作流名称和配置为必填项' }, 
        { status: 400 }
      );
    }

    // 创建工作流
    const { data: workflow, error } = await supabase
      .from('workflows')
      .insert({
        name: body.name.trim(),
        description: body.description?.trim() || null,
        workflow_data: body.workflow_data,
        status: body.status || 'draft',
        version: '1.0.0',
        created_by: user.id,
        updated_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('创建工作流失败:', error);
      return NextResponse.json(
        { error: '创建工作流失败', details: error.message }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '工作流创建成功',
      data: workflow
    }, { status: 201 });

  } catch (error: any) {
    console.error('创建工作流错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' }, 
      { status: 500 }
    );
  }
}