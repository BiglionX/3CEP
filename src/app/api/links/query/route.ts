import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * @swagger
 * /api/links/query:
 *   post:
 *     summary: 查询链接库中的链接
 *     description: 根据关键词查询链接库，返回按优先级排序的结果
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: 查询关键词
 *                 example: "iPhone 12 电池更换"
 *               limit:
 *                 type: integer
 *                 description: 返回结果数量限制
 *                 default: 3
 *                 example: 5
 *               category:
 *                 type: string
 *                 description: 指定分类筛选
 *                 example: "维修教程"
 *     responses:
 *       200:
 *         description: 成功返回链接列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 links:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                         description: 链接地址
 *                       title:
 *                         type: string
 *                         description: 链接标题
 *                       priority:
 *                         type: integer
 *                         description: 优先级
 *                       source:
 *                         type: string
 *                         description: 来源
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器内部错误
 */

export async function POST(req: NextRequest) {
  try {
    const { query, limit = 3, category } = await req.json();
    
    // 参数验证
    if (!query) {
      return NextResponse.json(
        { error: '缺少必要的查询参数: query' },
        { status: 400 }
      );
    }
    
    // 构建查询条件
    let dbQuery = supabase
      .from('unified_link_library')
      .select(`
        id,
        url,
        title,
        description,
        source,
        category,
        sub_category,
        image_url,
        priority,
        ai_tags,
        ai_quality_score,
        views,
        likes,
        created_at
      `)
      .eq('status', 'active')
      .order('priority', { ascending: false });
    
    // 添加分类筛选
    if (category) {
      dbQuery = dbQuery.eq('category', category);
    }
    
    // 添加关键词搜索（支持标题和描述）
    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }
    
    // 限制返回数量
    dbQuery = dbQuery.limit(limit);
    
    const { data, error } = await dbQuery;
    
    if (error) {
      console.error('查询链接库失败:', error);
      return NextResponse.json(
        { error: '查询失败', details: error.message },
        { status: 500 }
      );
    }
    
    // 处理返回数据
    const links = data?.map(item => ({
      id: item.id,
      url: item.url,
      title: item.title,
      description: item.description,
      source: item.source,
      category: item.category,
      sub_category: item.sub_category,
      image_url: item.image_url,
      priority: item.priority,
      ai_tags: item.ai_tags,
      ai_quality_score: item.ai_quality_score,
      views: item.views,
      likes: item.likes,
      created_at: item.created_at
    })) || [];
    
    return NextResponse.json({
      links,
      total: links.length,
      query: query,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API处理错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/links/query:
 *   get:
 *     summary: 获取链接库统计信息
 *     description: 返回链接库的基本统计信息
 *     responses:
 *       200:
 *         description: 成功返回统计信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_links:
 *                   type: integer
 *                   description: 总链接数
 *                 active_links:
 *                   type: integer
 *                   description: 活跃链接数
 *                 high_priority_links:
 *                   type: integer
 *                   description: 高优先级链接数
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       count:
 *                         type: integer
 */
export async function GET() {
  try {
    // 获取统计信息
    const { data: allLinks, error: allError } = await supabase
      .from('unified_link_library')
      .select('status, priority, category');
    
    if (allError) {
      console.error('获取统计信息失败:', allError);
      return NextResponse.json(
        { error: '获取统计信息失败' },
        { status: 500 }
      );
    }
    
    // 计算统计数据
    const totalLinks = allLinks?.length || 0;
    const activeLinks = allLinks?.filter(link => link.status === 'active').length || 0;
    const highPriorityLinks = allLinks?.filter(link => link.priority > 50).length || 0;
    
    // 分类统计
    const categoryStats: Record<string, number> = {};
    allLinks?.forEach(link => {
      const cat = link.category || '未分类';
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });
    
    const categories = Object.entries(categoryStats).map(([name, count]) => ({
      name,
      count
    }));
    
    return NextResponse.json({
      total_links: totalLinks,
      active_links: activeLinks,
      high_priority_links: highPriorityLinks,
      categories: categories.sort((a, b) => b.count - a.count),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('统计API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}