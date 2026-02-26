import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - 获取待审核链接列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const status = searchParams.get('status') || 'pending_review'
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''

    const offset = (page - 1) * pageSize

    // 构建查询条件
    let query = supabase
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
        likes,
        views,
        share_count,
        ai_tags,
        scraped_at,
        status,
        reviewed_at,
        rejection_reason,
        article_id,
        created_at,
        updated_at,
        reviewer:reviewed_by (
          id,
          email
        )
      `, { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false })

    // 添加分类筛选
    if (category) {
      query = query.eq('category', category)
    }

    // 添加搜索条件
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // 分页
    const { data, error, count } = await query
      .range(offset, offset + pageSize - 1)

    if (error) {
      console.error('获取待审核链接失败:', error)
      return NextResponse.json(
        { error: '获取数据失败', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    })

  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// POST - 批量操作（发布或驳回）
export async function POST(request: Request) {
  try {
    const { action, ids, rejectionReason } = await request.json()
    
    if (!action || !ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: '参数不完整' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const session = cookieStore.get('supabase-auth-token')
    
    if (!session) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const userId = JSON.parse(session.value).user.id

    let updateData: any = {
      reviewed_at: new Date().toISOString(),
      reviewed_by: userId
    }

    switch (action) {
      case 'publish':
        // 发布操作：创建文章草稿并更新链接状态
        updateData.status = 'promoted'
        
        // 为每个链接创建对应的文章
        for (const id of ids) {
          const { data: linkData } = await supabase
            .from('unified_link_library')
            .select('*')
            .eq('id', id)
            .single()

          if (linkData) {
            const { data: articleData, error: articleError } = await supabase
              .from('articles')
              .insert({
                title: linkData.title,
                content: linkData.description,
                summary: linkData.description?.substring(0, 200),
                cover_image_url: linkData.image_url,
                author_id: userId,
                status: 'published', // 直接发布
                tags: linkData.ai_tags?.tags || [],
                publish_at: new Date().toISOString()
              } as any)
              .select()
              .single()

            if (articleData && !articleError) {
              // 更新链接关联的文章ID
              await supabase
                .from('unified_link_library')
                .update({ 
                  article_id: articleData.id,
                  ...updateData
                } as any)
                .eq('id', id)
            }
          }
        }
        break

      case 'reject':
        // 驳回操作
        updateData.status = 'rejected'
        updateData.rejection_reason = rejectionReason || '审核未通过'
        
        await supabase
          .from('unified_link_library')
          .update(updateData)
          .in('id', ids)
        break

      default:
        return NextResponse.json(
          { error: '不支持的操作类型' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `成功${action === 'publish' ? '发布' : '驳回'} ${ids.length} 条记录`
    })

  } catch (error) {
    console.error('批量操作失败:', error)
    return NextResponse.json(
      { error: '操作失败', details: (error as Error).message },
      { status: 500 }
    )
  }
}