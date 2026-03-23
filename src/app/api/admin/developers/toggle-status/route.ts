import { getAuthUser } from '@/lib/auth/utils';
import createClient from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const user = await getAuthUser(request);
    if (
      !user ||
      !user.role ||
      !['admin', 'manager', 'marketplace_admin'].includes(user.role)
    ) {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      );
    }

    const supabase = createClient();
    const body = await request.json();
    const { developerId, status } = body;

    if (!developerId || !status) {
      return NextResponse.json(
        { success: false, error: '参数不完整' },
        { status: 400 }
      );
    }

    // 更新开发者状态
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', developerId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: '状态更新成功',
    });
  } catch (error) {
    console.error('更新开发者状态失败:', error);
    return NextResponse.json(
      { success: false, error: '更新失败' },
      { status: 500 }
    );
  }
}
