import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// GET /api/enterprise/manuals - 获取说明书列表
export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // 获取认证用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 })
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
    const productModel = searchParams.get('product_model') || ''

    // 构建查询
    let query = supabase
      .from('enterprise_manuals')
      .select('*')
      .eq('enterprise_id', enterpriseUser.id)

    // 添加搜索条件
    if (search) {
      query = query.or(`product_name.ilike.%${search}%,title->>zh.ilike.%${search}%`)
    }

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (productModel) {
      query = query.eq('product_model', productModel)
    }

    // 排序
    query = query.order('created_at', { ascending: false })

    const { data: manuals, error } = await query

    if (error) {
      console.error('获取说明书列表错误:', error)
      return NextResponse.json({ success: false, error: '获取说明书列表失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: manuals })
  } catch (error) {
    console.error('服务器错误:', error)
    return NextResponse.json({ success: false, error: '服务器内部错误' }, { status: 500 })
  }
}

// POST /api/enterprise/manuals - 创建新说明书
export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 })
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
      product_name, 
      product_model, 
      title, 
      content, 
      language_codes,
      cover_image_url,
      attachment_urls
    } = body

    // 验证必填字段
    if (!product_name || !title || !content) {
      return NextResponse.json({ success: false, error: '缺少必要字段' }, { status: 400 })
    }

    // 验证多语言字段格式
    if (!title.zh || !content.zh) {
      return NextResponse.json({ success: false, error: '至少需要提供中文标题和内容' }, { status: 400 })
    }

    const { data: manual, error } = await supabase
      .from('enterprise_manuals')
      .insert({
        enterprise_id: enterpriseUser.id,
        product_name,
        product_model: product_model || '',
        title,
        content,
        language_codes: language_codes || ['zh'],
        cover_image_url: cover_image_url || '',
        attachment_urls: attachment_urls || [],
        created_by: user.id,
        status: 'draft'
      } as any)
      .select()
      .single()

    if (error) {
      console.error('创建说明书错误:', error)
      return NextResponse.json({ success: false, error: '创建说明书失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: manual })
  } catch (error) {
    console.error('服务器错误:', error)
    return NextResponse.json({ success: false, error: '服务器内部错误' }, { status: 500 })
  }
}