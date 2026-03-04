import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/enterprise/repair-tips - 鑾峰彇缁翠慨鎶€宸у垪?
export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // 鑾峰彇璁よ瘉鐢ㄦ埛
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: '鏈巿鏉冭? }, { status: 401 })
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
      return NextResponse.json({ success: false, error: '浼佷笟璐︽埛涓嶅瓨? }, { status: 404 })
    }

    // 瑙ｆ瀽鏌ヨ鍙傛暟
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const contentType = searchParams.get('content_type') || ''
    const difficulty = searchParams.get('difficulty') || ''

    // 鏋勫缓鏌ヨ
    let query = supabase
      .from('enterprise_repair_tips')
      .select('*')
      .eq('enterprise_id', enterpriseUser.id)

    // 娣诲姞鎼滅储鏉′欢
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

    // 鎺掑簭
    query = query.order('created_at', { ascending: false })

    const { data: repairTips, error } = await query

    if (error) {
      console.error('鑾峰彇缁翠慨鎶€宸у垪琛ㄩ敊?', error)
      return NextResponse.json({ success: false, error: '鑾峰彇缁翠慨鎶€宸у垪琛ㄥけ? }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: repairTips })
  } catch (error) {
    console.error('鏈嶅姟鍣ㄩ敊?', error)
    return NextResponse.json({ success: false, error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊? }, { status: 500 })
  }
}

// POST /api/enterprise/repair-tips - 鍒涘缓鏂扮淮淇妧?
export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: '鏈巿鏉冭? }, { status: 401 })
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
      return NextResponse.json({ success: false, error: '浼佷笟璐︽埛涓嶅瓨? }, { status: 404 })
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

    // 楠岃瘉蹇呭～瀛楁
    if (!title || !content_type) {
      return NextResponse.json({ success: false, error: '缂哄皯蹇呰瀛楁' }, { status: 400 })
    }

    // 楠岃瘉鍐呭绫诲瀷
    const validContentTypes = ['article', 'video', 'image_gallery']
    if (!validContentTypes.includes(content_type)) {
      return NextResponse.json({ success: false, error: '鏃犳晥鐨勫唴瀹圭被? }, { status: 400 })
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
      }) as any
      .select()
      .single()

    if (error) {
      console.error('鍒涘缓缁翠慨鎶€宸ч敊?', error)
      return NextResponse.json({ success: false, error: '鍒涘缓缁翠慨鎶€宸уけ? }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: repairTip })
  } catch (error) {
    console.error('鏈嶅姟鍣ㄩ敊?', error)
    return NextResponse.json({ success: false, error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊? }, { status: 500 })
  }
}
