import { supabase } from '@/lib/supabase';
import { CrowdfundingProjectService } from '@/services/crowdfunding/project-service';
import { NextResponse } from 'next/server';

// GET /api/crowdfunding/[id] - 获取项目详情
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await CrowdfundingProjectService.getProjectById(params.id);

    // 如果项目不存在或不是公开状态，返回404
    if (
      !project ||
      (project.status !== 'active' && project.status !== 'success')
    ) {
      return NextResponse.json(
        { error: '项目不存在或不可访问' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error: any) {
    console.error('获取项目详情失败:', error);
    return NextResponse.json(
      { error: error.message || '获取项目详情失败' },
      { status: 500 }
    );
  }
}

// PUT /api/crowdfunding/[id] - 更新项目
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户认证
    const token = request.headers.get('authorization').replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: '无效的认证令牌' }, { status: 401 });
    }

    const body = await request.json();

    const project = await CrowdfundingProjectService.updateProject(
      params.id,
      body,
      user.id
    );

    return NextResponse.json(project);
  } catch (error: any) {
    console.error('更新项目失败:', error);
    return NextResponse.json(
      { error: error.message || '更新项目失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/crowdfunding/[id] - 删除项目
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户认证
    const token = request.headers.get('authorization').replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: '无效的认证令牌' }, { status: 401 });
    }

    // 先获取项目确认用户权限
    const project = await CrowdfundingProjectService.getProjectById(params.id);
    if (project.creator_id !== user.id) {
      return NextResponse.json({ error: '无权删除此项目' }, { status: 403 });
    }

    // 只能删除草稿状态的项目
    if (project.status !== 'draft') {
      return NextResponse.json(
        { error: '只能删除草稿状态的项目' },
        { status: 400 }
      );
    }

    // 删除操作已经在RLS策略中处理
    const { error } = await supabase
      .from('crowdfunding_projects')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ message: '项目删除成功' });
  } catch (error: any) {
    console.error('删除项目失败:', error);
    return NextResponse.json(
      { error: error.message || '删除项目失败' },
      { status: 500 }
    );
  }
}

// POST /api/crowdfunding/[id]/publish - 发布项目
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户认证
    const token = request.headers.get('authorization').replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: '无效的认证令牌' }, { status: 401 });
    }

    const project = await CrowdfundingProjectService.publishProject(
      params.id,
      user.id
    );

    return NextResponse.json(project);
  } catch (error: any) {
    console.error('发布项目失败:', error);
    return NextResponse.json(
      { error: error.message || '发布项目失败' },
      { status: 500 }
    );
  }
}
