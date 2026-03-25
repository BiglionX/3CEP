import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 获取待上架审核的 Skills (已审核通过但未上架)
    const { data: pendingSkills, error } = await supabase
      .from('skills')
      .select(
        `
        *,
        admin_users:developer_id (
          email
        )
      `
      )
      .eq('review_status', 'approved')
      .eq('shelf_status', 'off_shelf')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取待上架 Skills 失败:', error);
      throw error;
    }

    // 格式化数据
    const formattedSkills =
      pendingSkills?.map((skill: any) => ({
        ...skill,
        developer_email: skill.admin_users?.[0]?.email || '未知',
      })) || [];

    return NextResponse.json({
      success: true,
      data: formattedSkills,
    });
  } catch (error: any) {
    console.error('获取待上架 Skills 失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
