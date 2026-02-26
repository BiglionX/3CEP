import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 获取热点信息流 (移动端优化版本)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('device_id') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');

    // 计算偏移量
    const offset = (page - 1) * pageSize;

    // 获取热点链接数据
    let query = supabase
      .from('hot_link_pool')
      .select(
        `
        id,
        title,
        url,
        source,
        category,
        sub_category,
        likes,
        views,
        created_at,
        status,
        article_id
      `
      )
      .eq('status', 'promoted')
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    // 如果指定了设备ID，进行筛选
    if (deviceId) {
      query = query.contains('device_ids', [deviceId]);
    }

    const { data: hotLinks, error } = await query;

    if (error) {
      console.error('获取热点信息流失败:', error);
      return NextResponse.json(
        {
          code: 50001,
          message: '获取数据失败',
          data: null,
        },
        { status: 500 }
      );
    }

    // 处理数据格式转换
    const formattedData = (hotLinks || []).map((link: any) => ({
      id: link.id,
      type: link.article_id ? 'article' : 'hot_link',
      title: link.title,
      url: link.article_id ? `/articles/${link.article_id}` : link.url,
      source: link.source,
      device_names: link.category ? [link.category] : [],
      fault_names: link.sub_category ? [link.sub_category] : [],
      like_count: link.likes || 0,
      is_liked: false, // 需要根据用户登录状态判断
      push_reason: deviceId ? `你常修相关设备` : '热门推荐',
      cover_image: '',
      summary: '',
      view_count: link.views || 0,
      created_at: link.created_at,
    }));

    // 获取总数
    const { count } = await supabase
      .from('hot_link_pool')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: {
        list: formattedData,
        total: count || 0,
        page,
        page_size: pageSize,
        total_pages: Math.ceil((count || 0) / pageSize),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('热点信息流API错误:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '服务器内部错误',
        data: null,
      },
      { status: 500 }
    );
  }
}
