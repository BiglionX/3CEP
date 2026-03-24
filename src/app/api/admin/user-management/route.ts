/**
 * 多类型用户管理 API
 */

import { createClient } from '@supabase/supabase-js';
import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const user_type = searchParams.get('user_type');
    const account_type = searchParams.get('account_type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // 构建查询
    let query = supabase.from('user_accounts').select('*', { count: 'exact' });

    if (user_type) {
      query = query.eq('user_type', user_type);
    }

    if (account_type) {
      query = query.eq('account_type', account_type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // 分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    query = query.range(start, end).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      users: data,
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 });
  }

    },
    'users_read'
  );

export async function DELETE(request: NextRequest) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const { userIds } = body;

    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: '无效的用户 ID 列表' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('user_accounts')
      .delete()
      .in('id', userIds);

    if (error) throw error;

    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('批量删除用户失败:', error);
    return NextResponse.json({ error: '批量删除失败' }, { status: 500 });
  }

    },
    'users_read'
  );
