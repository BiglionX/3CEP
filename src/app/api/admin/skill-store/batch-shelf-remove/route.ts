import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skillIds, reason } = body;

    if (!skillIds || !Array.isArray(skillIds) || skillIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少有效的 Skill ID 列表',
        },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: '下架原因不能为空',
        },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 获取当前用户信息
    const authHeader = request.headers.get('authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // 批量下架
    const { data, error } = await supabase
      .from('skills')
      .update({
        shelf_status: 'off_shelf',
        shelf_rejection_reason: reason,
        updated_by: userId,
      })
      .in('id', skillIds)
      .select();

    if (error) {
      console.error('批量下架失败:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `成功下架 ${data?.length || 0} 个 Skill`,
      data,
    });
  } catch (error: any) {
    console.error('批量下架失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
