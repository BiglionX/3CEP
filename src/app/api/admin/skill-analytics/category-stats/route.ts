import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 按分类统计
    const { data: categoryData, error } =
      await supabase.rpc('get_category_stats');

    if (error) {
      // 如果 RPC 函数不存在，使用基础查询
      console.warn('RPC 函数不存在，使用基础查询:', error);

      const { data: skills } = await supabase.from('skills').select('category');

      // 手动统计
      const stats: Record<string, number> = {};
      skills?.forEach(skill => {
        const category = skill.category || '未分类';
        stats[category] = (stats[category] || 0) + 1;
      });

      const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
      const result = Object.entries(stats)
        .map(([category, count]) => ({
          category,
          count,
          percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0',
        }))
        .sort((a, b) => b.count - a.count);

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // 计算百分比
    const total = categoryData?.reduce((sum, item) => sum + item.count, 0) || 0;
    const result = categoryData?.map((item: any) => ({
      category: item.category,
      count: item.count,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : '0.0',
    }));

    return NextResponse.json({
      success: true,
      data: result || [],
    });
  } catch (error: any) {
    console.error('获取分类统计失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
