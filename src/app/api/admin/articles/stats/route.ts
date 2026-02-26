import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // 验证管理员权限
    const cookieStore = await cookies()
    const session = cookieStore.get('supabase-auth-token')
    
    if (!session) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    // 获取统计信息
    const [
      totalResult,
      publishedResult,
      draftResult,
      todayViewsResult
    ] = await Promise.all([
      // 总文章数
      supabase
        .from('articles')
        .select('id', { count: 'exact', head: true }),
      
      // 已发布文章数
      supabase
        .from('articles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published'),
      
      // 草稿数
      supabase
        .from('articles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'draft'),
      
      // 今日浏览量（简化处理，实际应该有专门的统计表）
      supabase
        .from('articles')
        .select('view_count')
        .gte('updated_at', new Date().toISOString().split('T')[0])
    ])

    const stats = {
      total: totalResult.count || 0,
      published: publishedResult.count || 0,
      draft: draftResult.count || 0,
      todayViews: todayViewsResult.data?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('获取统计信息异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误', details: (error as Error).message },
      { status: 500 }
    )
  }
}