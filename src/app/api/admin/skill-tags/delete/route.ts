import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get('id');

    if (!tagId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少标签 ID',
        },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 检查使用次数
    const { data: tag } = await supabase
      .from('skill_tags')
      .select('usage_count')
      .eq('id', tagId)
      .single();

    if (tag && tag.usage_count > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `该标签正在被使用 ${tag.usage_count} 次，无法删除`,
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('skill_tags')
      .delete()
      .eq('id', tagId);

    if (error) {
      console.error('删除标签失败:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '标签已删除',
    });
  } catch (error: any) {
    console.error('删除标签失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
