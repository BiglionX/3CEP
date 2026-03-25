import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 尝试调用数据库函数
    let { data: hotTags, error } = await supabase.rpc('get_hot_tags', {
      p_limit: limit,
    });

    // 如果函数不存在，使用基础查询
    if (error && error.code === '42883') {
      console.warn('get_hot_tags 函数不存在，使用基础查询');

      const { data } = await supabase
        .from('skill_tags')
        .select('id, name, usage_count, color')
        .eq('is_hot', true)
        .order('usage_count', { ascending: false })
        .limit(limit);

      hotTags = data || [];
    }

    return NextResponse.json({
      success: true,
      data: hotTags || [],
    });
  } catch (error: any) {
    console.error('获取热门标签失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
