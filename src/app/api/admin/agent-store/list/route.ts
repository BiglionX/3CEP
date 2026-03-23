/**
 * 智能体商店管理 API - 获取商品列表
 * GET /api/admin/agent-store/list
 */

import { getAuthUser } from '@/lib/auth/utils';
import { createClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const user = await getAuthUser(request);
    if (!user || !['admin', 'marketplace_admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      );
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const searchTerm = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const reviewStatus = searchParams.get('reviewStatus') || '';
    const shelfStatus = searchParams.get('shelfStatus') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const supabase = createClient();

    // 构建查询
    let query = supabase
      .from('agents')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' });

    // 搜索条件
    if (searchTerm) {
      query = query.or(
        `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
      );
    }

    // 分类筛选
    if (category) {
      query = query.eq('category', category);
    }

    // 审核状态筛选
    if (reviewStatus) {
      query = query.eq('review_status', reviewStatus);
    }

    // 上下架状态筛选
    if (shelfStatus) {
      query = query.eq('shelf_status', shelfStatus);
    }

    // 分页
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('获取智能体列表失败:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error: any) {
    console.error('智能体商店列表 API 错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '服务器错误' },
      { status: 500 }
    );
  }
}
