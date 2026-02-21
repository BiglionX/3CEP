import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 初始化Supabase客户端（使用服务角色密钥）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/tutorials - 管理员获取教程列表（包含所有状态）
export async function GET(request: Request) {
  try {
    // 验证管理员权限
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: '无效的认证令牌' }, { status: 401 });
    }

    // 检查用户是否为管理员
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);

    // 获取查询参数
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const deviceModel = searchParams.get('deviceModel');
    const faultType = searchParams.get('faultType');
    const status = searchParams.get('status'); // 管理员可以查看所有状态
    const search = searchParams.get('search');
    const createdBy = searchParams.get('createdBy');

    // 计算偏移量
    const offset = (page - 1) * pageSize;

    // 构建查询
    let query = supabaseAdmin
      .from('repair_tutorials')
      .select('*', { count: 'exact' })
      .range(offset, offset + pageSize - 1)
      .order('created_at', { ascending: false });

    // 添加过滤条件
    if (status) {
      query = query.eq('status', status);
    }

    if (deviceModel) {
      query = query.eq('device_model', deviceModel);
    }

    if (faultType) {
      query = query.eq('fault_type', faultType);
    }

    if (createdBy) {
      query = query.eq('created_by', createdBy);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('获取管理员教程列表失败:', error);
      return NextResponse.json(
        { error: '获取教程列表失败', details: error.message },
        { status: 500 }
      );
    }

    // 计算分页信息
    const totalPages = Math.ceil((count || 0) / pageSize);

    return NextResponse.json({
      tutorials: data,
      pagination: {
        currentPage: page,
        pageSize,
        totalCount: count || 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('管理员API错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// POST /api/admin/tutorials - 管理员创建教程
export async function POST(request: Request) {
  try {
    // 验证管理员权限
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: '无效的认证令牌' }, { status: 401 });
    }

    // 检查用户是否为管理员
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const tutorialData = await request.json();

    // 验证必需字段
    if (
      !tutorialData.title ||
      !tutorialData.device_model ||
      !tutorialData.fault_type
    ) {
      return NextResponse.json(
        { error: '缺少必需字段: title, device_model, fault_type' },
        { status: 400 }
      );
    }

    // 设置默认值
    const tutorial = {
      ...tutorialData,
      steps: tutorialData.steps || [],
      tools: tutorialData.tools || [],
      parts: tutorialData.parts || [],
      view_count: 0,
      like_count: 0,
      status: tutorialData.status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: user.id,
    };

    const { data, error } = await supabaseAdmin
      .from('repair_tutorials')
      .insert(tutorial)
      .select()
      .single();

    if (error) {
      console.error('管理员创建教程失败:', error);
      return NextResponse.json(
        { error: '创建教程失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: '教程创建成功',
        tutorial: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('管理员API错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
