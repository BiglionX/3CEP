import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少分类 ID',
        },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 检查分类是否存在
    const { data: existingCategory } = await supabase
      .from('skill_categories')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: '分类不存在',
        },
        { status: 404 }
      );
    }

    // 检查是否有 Skills 使用该分类
    const { data: usingSkills } = await supabase
      .from('skills')
      .select('id')
      .eq('category', id)
      .limit(1);

    if (usingSkills && usingSkills.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: '该分类下还有 Skills，无法删除',
        },
        { status: 409 }
      );
    }

    // 删除分类
    const error = await supabase.from('skill_categories').delete().eq('id', id);

    if (error) {
      console.error('删除分类失败:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '分类删除成功',
    });
  } catch (error: any) {
    console.error('删除分类失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
