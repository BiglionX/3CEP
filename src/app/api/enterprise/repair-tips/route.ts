import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/enterprise/repair-tips - 获取维修技巧列表
export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // 获取认证用户
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ success: false, error: '身份验证失败' }, { status: 401 })
    }

    // 获取用户对应的企业ID
    const { data: enterpriseUser, error: enterpriseError } = await supabase
      .from('enterprise_users')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (enterpriseError || !enterpriseUser) {
      return NextResponse.json({ success: false, error: '企业账户不存在' }, { status: 404 })
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const contentType = searchParams.get('content_type') || ''
    const difficulty = searchParams.get('difficulty') || ''

    // 构建查询
    let query = supabase
      .from('enterprise_repair_tips')
      .select('*')
      .eq('enterprise_id', enterpriseUser.id)

    // 添加搜索条件
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (contentType) {
      query = query.eq('content_type', contentType)
    }

    if (difficulty) {
      query = query.eq('difficulty_level', parseInt(difficulty))
    }

    // 排序
    query = query.order('created_at', { ascending: false })

    const { data: repairTips, error } = await query

    if (error) {
      console.error('获取维修技巧列表错误:', error)
      return NextResponse.json({ success: false, error: '获取维修技巧列表失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: repairTips })
  } catch (error) {
    console.error('服务器错误:', error)
    return NextResponse.json({ success: false, error: '服务器内部错误' }, { status: 500 })
  }
}

// POST /api/enterprise/repair-tips - 创建新维修技巧
export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ success: false, error: '身份验证失败' }, { status: 401 })
    }

    const { data: enterpriseUser, error: enterpriseError } = await supabase
      .from('enterprise_users')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (enterpriseError || !enterpriseUser) {
      return NextResponse.json({ success: false, error: '企业账户不存在' }, { status: 404 })
    }

    const body = await request.json()
    const { 
      title,
      description,
      content_type,
      content_html,
      video_url,
      image_urls,
      device_models,
      fault_types,
      difficulty_level,
      estimated_time,
      tools_required,
      parts_required
    } = body

    // 验证必填字段
    if (!title || !content_type) {
      return NextResponse.json({ success: false, error: '缺少必要字段' }, { status: 400 })
    }

    // 验证内容类型
    const validContentTypes = ['article', 'video', 'image_gallery']
    if (!validContentTypes.includes(content_type)) {
      return NextResponse.json({ success: false, error: '无效的内容类型' }, { status: 400 })
    }

    const { data: repairTip, error } = await supabase
      .from('enterprise_repair_tips')
      .insert({
        enterprise_id: enterpriseUser.id,
        title,
        description: description || '',
        content_type,
        content_html: content_html || '',
        video_url: video_url || '',
        image_urls: image_urls || [],
        device_models: device_models || [],
        fault_types: fault_types || [],
        difficulty_level: difficulty_level ? parseInt(difficulty_level) : 1,
        estimated_time: estimated_time ? parseInt(estimated_time) : 0,
        tools_required: tools_required || [],
        parts_required: parts_required || {} as any,
        created_by: user.id,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('创建维修技巧错误:', error)
      return NextResponse.json({ success: false, error: '创建维修技巧失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: repairTip })
  } catch (error) {
    console.error('服务器错误:', error)
    return NextResponse.json({ success: false, error: '服务器内部错误' }, { status: 500 })
  }
}