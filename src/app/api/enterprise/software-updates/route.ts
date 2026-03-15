import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/enterprise/software-updates - 鑾峰彇杞欢鍗囩骇鍖呭垪
export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // 鑾峰彇璁よ瘉鐢ㄦ埛
    const authHeader = request.headers.get('authorization')
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: '鏈巿鏉冭 }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ success: false, error: '韬唤楠岃瘉澶辫触' }, { status: 401 })
    }

    // 鑾峰彇鐢ㄦ埛瀵瑰簲鐨勪紒涓欼D
    const { data: enterpriseUser, error: enterpriseError } = await supabase
      .from('enterprise_users')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (enterpriseError || !enterpriseUser) {
      return NextResponse.json({ success: false, error: '佷笟璐︽埛涓嶅 }, { status: 404 })
    }

    // 瑙ｆ瀽鏌ヨ鍙傛暟
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const updateType = searchParams.get('update_type') || ''
    const productModel = searchParams.get('product_model') || ''

    // 鏋勫缓鏌ヨ
    let query = supabase
      .from('enterprise_software_updates')
      .select('*')
      .eq('enterprise_id', enterpriseUser.id)

    // 娣诲姞鎼滅储鏉′欢
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

    // 鎺掑簭
    query = query.order('created_at', { ascending: false })

    const { data: softwareUpdates, error } = await query

    if (error) {
      console.error('鑾峰彇杞欢鍗囩骇鍖呭垪琛ㄩ敊', error)
      return NextResponse.json({ success: false, error: '鑾峰彇杞欢鍗囩骇鍖呭垪琛ㄥけ }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: softwareUpdates })
  } catch (error) {
    console.error('鏈嶅姟鍣ㄩ敊', error)
    return NextResponse.json({ success: false, error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 })
  }
}

// POST /api/enterprise/software-updates - 鍒涘缓鏂拌蒋跺崌绾у寘
export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: '鏈巿鏉冭 }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ success: false, error: '韬唤楠岃瘉澶辫触' }, { status: 401 })
    }

    const { data: enterpriseUser, error: enterpriseError } = await supabase
      .from('enterprise_users')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (enterpriseError || !enterpriseUser) {
      return NextResponse.json({ success: false, error: '佷笟璐︽埛涓嶅 }, { status: 404 })
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

    // 楠岃瘉蹇呭～瀛楁
    if (!product_name || !software_version || !update_type || !title || !file_url) {
      return NextResponse.json({ success: false, error: '缂哄皯蹇呰瀛楁' }, { status: 400 })
    }

    // 楠岃瘉鏇存柊绫诲瀷
    const validUpdateTypes = ['firmware', 'driver', 'app', 'system']
    if (!validUpdateTypes.includes(update_type)) {
      return NextResponse.json({ success: false, error: '犳晥鐨勬洿鏂扮被 }, { status: 400 })
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
        file_size: file_size  parseInt(file_size) : null,
        file_hash: file_hash || '',
        release_date: release_date  new Date(release_date).toISOString().split('T')[0] : null,
        compatibility_info: compatibility_info || {} as any,
        installation_guide: installation_guide || '',
        warning_notes: warning_notes || '',
        created_by: user.id,
        status: 'draft'
      }) as any
      .select()
      .single()

    if (error) {
      console.error('鍒涘缓杞欢鍗囩骇鍖呴敊', error)
      return NextResponse.json({ success: false, error: '鍒涘缓杞欢鍗囩骇鍖呭け }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: softwareUpdate })
  } catch (error) {
    console.error('鏈嶅姟鍣ㄩ敊', error)
    return NextResponse.json({ success: false, error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 })
  }
}
