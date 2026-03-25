import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 获取已下架的 Skills (包括下架原因)
    const { data: offShelfSkills, error } = await supabase
      .from('skills')
      .select(
        `
        *,
        admin_users:developer_id (
          email
        )
      `
      )
      .neq('shelf_status', 'on_shelf')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('获取已下架 Skills 失败:', error);
      throw error;
    }

    const formattedSkills =
      offShelfSkills?.map((skill: any) => ({
        ...skill,
        developer_email: skill.admin_users?.[0]?.email || '未知',
        shelf_rejection_reason: skill.shelf_rejection_reason || null,
      })) || [];

    return NextResponse.json({
      success: true,
      data: formattedSkills,
    });
  } catch (error: any) {
    console.error('获取已下架 Skills 失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
