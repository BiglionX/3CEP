import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // 计算天数
    let days = 30;
    if (range === '7d') days = 7;
    else if (range === '90d') days = 90;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 获取指定日期范围内的创建记录
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: skills, error } = await supabase
      .from('skills')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('获取趋势数据失败:', error);
      throw error;
    }

    // 按日期分组统计
    const statsByDate: Record<string, number> = {};

    // 初始化所有日期
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
      });
      statsByDate[dateStr] = 0;
    }

    // 统计实际数据
    skills?.forEach(skill => {
      const date = new Date(skill.created_at);
      const dateStr = date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
      });
      if (statsByDate[dateStr] !== undefined) {
        statsByDate[dateStr]++;
      }
    });

    // 转换为数组格式
    const trendData = Object.entries(statsByDate).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json({
      success: true,
      data: trendData,
    });
  } catch (error: any) {
    console.error('获取趋势数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
