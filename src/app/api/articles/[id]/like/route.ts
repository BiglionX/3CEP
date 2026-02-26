import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 点赞文章
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id
    const { action } = await request.json() // 'like' 或 'unlike'

    // 验证用户认证
    const cookieStore = await cookies()
    const session = cookieStore.get('supabase-auth-token')
    
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const userId = JSON.parse(session.value).user.id

    if (action === 'like') {
      // 检查是否已点赞
      const { data: existingLike } = await supabase
        .from('article_likes')
        .select('id')
        .eq('article_id', articleId)
        .eq('user_id', userId)
        .single()

      if (existingLike) {
        return NextResponse.json(
          { error: '已点赞' },
          { status: 400 }
        )
      }

      // 添加点赞记录
      const { error: insertError } = await supabase
        .from('article_likes')
        .insert({
          article_id: articleId,
          user_id: userId
        } as any)

      if (insertError) {
        console.error('点赞失败:', insertError)
        return NextResponse.json(
          { error: '点赞失败', details: insertError.message },
          { status: 500 }
        )
      }

      // 更新文章点赞数
      await supabase.rpc('increment_article_like', {
        article_id: articleId
      })

    } else if (action === 'unlike') {
      // 删除点赞记录
      const { error: deleteError } = await supabase
        .from('article_likes')
        .delete()
        .eq('article_id', articleId)
        .eq('user_id', userId)

      if (deleteError) {
        console.error('取消点赞失败:', deleteError)
        return NextResponse.json(
          { error: '取消点赞失败', details: deleteError.message },
          { status: 500 }
        )
      }

      // 更新文章点赞数
      await supabase.rpc('decrement_article_like', {
        article_id: articleId
      })
    }

    // 获取最新的点赞数
    const { data: article } = await supabase
      .from('articles')
      .select('like_count')
      .eq('id', articleId)
      .single()

    return NextResponse.json({
      success: true,
      like_count: article?.like_count || 0,
      message: action === 'like' ? '点赞成功' : '取消点赞成功'
    })

  } catch (error) {
    console.error('点赞操作异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误', details: (error as Error).message },
      { status: 500 }
    )
  }
}

// 检查用户是否已点赞
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id

    // 验证用户认证
    const cookieStore = await cookies()
    const session = cookieStore.get('supabase-auth-token')
    
    if (!session) {
      return NextResponse.json({
        success: true,
        liked: false
      })
    }

    const userId = JSON.parse(session.value).user.id

    // 检查是否已点赞
    const { data: existingLike } = await supabase
      .from('article_likes')
      .select('id')
      .eq('article_id', articleId)
      .eq('user_id', userId)
      .single()

    return NextResponse.json({
      success: true,
      liked: !!existingLike
    })

  } catch (error) {
    console.error('检查点赞状态异常:', error)
    return NextResponse.json({
      success: true,
      liked: false
    })
  }
}