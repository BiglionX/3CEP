import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 导入mock数据版本
import { GET_BY_ID as MOCK_GET_BY_ID } from '../mock-route';

// 如果数据库表不存在，则使用mock数据
let useMock = false;

// 检查是否可以连接到真实数据库
async function checkDatabaseConnection() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/repair_tutorials?select=*&limit=1`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          Authorization: `Bearer ${
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
          }`,
        },
      }
    );
    useMock = !response.ok;
  } catch (error) {
    useMock = true;
  }
}

// GET /api/tutorials/[id] - 获取单个教程详情
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await checkDatabaseConnection();
  if (useMock) {
    // @ts-ignore
    return MOCK_GET_BY_ID(request, { params });
  }

  // 原有的真实数据库逻辑
  try {
    const { id } = await params;

    // 验证ID格式
    if (!id) {
      return NextResponse.json({ error: '缺少教程ID' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('repair_tutorials')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '教程不存在或未发布' },
          { status: 404 }
        );
      }
      console.error('获取教程详情失败:', error);
      return NextResponse.json(
        { error: '获取教程详情失败', details: error.message },
        { status: 500 }
      );
    }

    // 增加浏览次数
    await supabase
      .from('repair_tutorials')
      .update({ view_count: data.view_count + 1 } as any)
      .eq('id', id);

    return NextResponse.json({
      tutorial: {
        ...data,
        view_count: data.view_count + 1,
      },
    });
  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// PUT /api/tutorials/[id] - 更新教程（需要认证）
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 验证ID格式
    if (!id) {
      return NextResponse.json({ error: '缺少教程ID' }, { status: 400 });
    }

    const tutorialData = await request.json();

    // 移除不允许更新的字段
    const {
      id: _,
      created_at: __,
      created_by: ___,
      ...updateData
    } = tutorialData;

    // 添加更新时间
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('repair_tutorials')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: '教程不存在' }, { status: 404 });
      }
      console.error('更新教程失败:', error);
      return NextResponse.json(
        { error: '更新教程失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '教程更新成功',
      tutorial: data,
    });
  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// DELETE /api/tutorials/[id] - 删除教程（需要认证）
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 验证ID格式
    if (!id) {
      return NextResponse.json({ error: '缺少教程ID' }, { status: 400 });
    }

    const { error } = await supabase
      .from('repair_tutorials')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: '教程不存在' }, { status: 404 });
      }
      console.error('删除教程失败:', error);
      return NextResponse.json(
        { error: '删除教程失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '教程删除成功',
    });
  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
