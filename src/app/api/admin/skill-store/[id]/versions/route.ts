import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get('skillId');

    if (!skillId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少 Skill ID',
        },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 尝试从版本历史表获取
    let { data: versions, error } = await supabase
      .from('skill_version_history')
      .select(
        `
        id,
        old_version,
        new_version,
        changes,
        changed_by,
        created_at,
        admin_users:changed_by (
          email
        )
      `
      )
      .eq('skill_id', skillId)
      .order('created_at', { ascending: false });

    // 如果版本历史表不存在，从 skills 表推断版本
    if (error && error.code === '42P01') {
      console.warn('skill_version_history 表不存在，从 skills 表推断版本');

      // 获取当前 Skill 信息
      const { data: currentSkill } = await supabase
        .from('skills')
        .select('*')
        .eq('id', skillId)
        .single();

      if (!currentSkill) {
        return NextResponse.json(
          {
            success: false,
            error: 'Skill 不存在',
          },
          { status: 404 }
        );
      }

      // 查找所有具有相同 skill_code 的 Skills (即所有版本)
      const { data: allVersions } = await supabase
        .from('skills')
        .select(
          `
          id,
          version,
          created_at,
          created_by,
          review_status,
          shelf_status
        `
        )
        .eq('skill_code', currentSkill.skill_code)
        .order('created_at', { ascending: false });

      // 转换为版本历史格式
      versions = allVersions?.map((v: any) => ({
        id: v.id,
        new_version: v.version,
        created_at: v.created_at,
        changed_by: v.created_by,
        admin_users: null,
        changes: null,
        review_status: v.review_status,
        shelf_status: v.shelf_status,
      }));
    }

    return NextResponse.json({
      success: true,
      data: versions || [],
    });
  } catch (error: any) {
    console.error('获取版本历史失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
