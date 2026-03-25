import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, name_en, description, sort_order, is_active } = body;

    // 验证必填字段
    if (!id || !name || !name_en) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必填字段',
        },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 检查 ID 是否存在
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

    // 检查英文名称是否与现有记录冲突 (排除自己)
    const { data: conflictingCategory } = await supabase
      .from('skill_categories')
      .select('id')
      .eq('name_en', name_en)
      .neq('id', id)
      .single();

    if (conflictingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: `分类 (英文名称：${name_en}) 已存在`,
        },
        { status: 409 }
      );
    }

    // 更新分类
    const { data: updatedCategory, error: updateError } = await supabase
      .from('skill_categories')
      .update({
        name,
        name_en,
        description: description || null,
        sort_order: sort_order || 0,
        is_active: is_active !== undefined ? is_active : true,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('更新分类失败:', updateError);
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: '分类更新成功',
      data: updatedCategory,
    });
  } catch (error: any) {
    console.error('更新分类失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
