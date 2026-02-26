import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/enterprise/software-updates - 获取软件升级包列表
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
    const updateType = searchParams.get('update_type') || ''
    const productModel = searchParams.get('product_model') || ''

    // 构建查询
    let query = supabase
      .from('enterprise_software_updates')
      .select('*')
      .eq('enterprise_id', enterpriseUser.id)

    // 添加搜索条件
    if (search) {
      query = query.or(`product_name.ilike.%${search}%,title.ilike.%${search}%`)
    }

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (updateType) {
      query = query.eq('update_type', updateType)
    }

    if (productModel) {
      query = query.eq('product_model', productModel)
    }

    // 排序
    query = query.order('created_at', { ascending: false })

    const { data: softwareUpdates, error } = await query

    if (error) {
      console.error('获取软件升级包列表错误:', error)
      return NextResponse.json({ success: false, error: '获取软件升级包列表失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: softwareUpdates })
  } catch (error) {
    console.error('服务器错误:', error)
    return NextResponse.json({ success: false, error: '服务器内部错误' }, { status: 500 })
  }
}

// POST /api/enterprise/software-updates - 创建新软件升级包
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
      product_name,
      product_model,
      software_version,
      previous_version,
      update_type,
      title,
      description,
      changelog,
      file_url,
      file_size,
      file_hash,
      release_date,
      compatibility_info,
      installation_guide,
      warning_notes
    } = body

    // 验证必填字段
    if (!product_name || !software_version || !update_type || !title || !file_url) {
      return NextResponse.json({ success: false, error: '缺少必要字段' }, { status: 400 })
    }

    // 验证更新类型
    const validUpdateTypes = ['firmware', 'driver', 'app', 'system']
    if (!validUpdateTypes.includes(update_type)) {
      return NextResponse.json({ success: false, error: '无效的更新类型' }, { status: 400 })
    }

    const { data: softwareUpdate, error } = await supabase
      .from('enterprise_software_updates')
      .insert({
        enterprise_id: enterpriseUser.id,
        product_name,
        product_model: product_model || '',
        software_version,
        previous_version: previous_version || '',
        update_type,
        title,
        description: description || '',
        changelog: changelog || '',
        file_url,
        file_size: file_size ? parseInt(file_size) : null,
        file_hash: file_hash || '',
        release_date: release_date ? new Date(release_date).toISOString().split('T')[0] : null,
        compatibility_info: compatibility_info || {} as any,
        installation_guide: installation_guide || '',
        warning_notes: warning_notes || '',
        created_by: user.id,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('创建软件升级包错误:', error)
      return NextResponse.json({ success: false, error: '创建软件升级包失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: softwareUpdate })
  } catch (error) {
    console.error('服务器错误:', error)
    return NextResponse.json({ success: false, error: '服务器内部错误' }, { status: 500 })
  }
}