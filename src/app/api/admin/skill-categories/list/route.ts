import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 获取所有分类，按排序字段排序
    const { data: categories, error } = await supabase
      .from('skill_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('获取分类失败:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: categories || [],
    });
  } catch (error: any) {
    console.error('获取分类失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
