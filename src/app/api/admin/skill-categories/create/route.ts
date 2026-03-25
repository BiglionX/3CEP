import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, name_en, description, sort_order, is_active } = body;

    // 验证必填字段
    if (!name || !name_en) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必填字段',
        },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 检查英文名称是否已存在
    const { data: existingCategory } = await supabase
      .from('skill_categories')
      .select('id')
      .eq('name_en', name_en)
      .single();

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: `分类 (英文名称：${name_en}) 已存在`,
        },
        { status: 409 }
      );
    }

    // 插入新分类
    const { data: newCategory, error: insertError } = await supabase
      .from('skill_categories')
      .insert({
        name,
        name_en,
        description: description || null,
        sort_order: sort_order || 0,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('插入分类失败:', insertError);
      throw insertError;
    }

    return NextResponse.json(
      {
        success: true,
        message: '分类创建成功',
        data: newCategory,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('创建分类失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
