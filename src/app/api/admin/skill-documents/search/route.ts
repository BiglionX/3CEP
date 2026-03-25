import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '缺少搜索关键词' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 尝试调用数据库函数
    let { data, error } = await supabase.rpc('search_documents', {
      p_query: query,
      p_limit: limit,
    });

    // 如果函数不存在，使用基础查询
    if (error && error.code === '42883') {
      console.warn('search_documents 函数不存在，使用基础查询');

      const { data: basicData } = await supabase
        .from('skill_documents')
        .select('id, skill_id, title, summary, category')
        .eq('is_published', true)
        .or(
          `title.ilike.%${query}%,summary.ilike.%${query}%,content.ilike.%${query}%`
        )
        .limit(limit);

      data = basicData || [];
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    console.error('搜索文档失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
