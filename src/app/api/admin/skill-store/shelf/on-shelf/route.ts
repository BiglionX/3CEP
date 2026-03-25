import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 获取已上架的 Skills
    const { data: onShelfSkills, error } = await supabase
      .from('skills')
      .select(
        `
        *,
        admin_users:developer_id (
          email
        )
      `
      )
      .eq('shelf_status', 'on_shelf')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('获取已上架 Skills 失败:', error);
      throw error;
    }

    const formattedSkills =
      onShelfSkills?.map((skill: any) => ({
        ...skill,
        developer_email: skill.admin_users?.[0]?.email || '未知',
      })) || [];

    return NextResponse.json({
      success: true,
      data: formattedSkills,
    });
  } catch (error: any) {
    console.error('获取已上架 Skills 失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
