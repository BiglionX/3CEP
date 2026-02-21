import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/database.types'

// GET - 获取已审核店铺列表（approved/rejected状态）
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const status = searchParams.get('status') || 'approved' // 默认显示已批准的
    const search = searchParams.get('search') || ''
    const city = searchParams.get('city') || ''
    
    const offset = (page - 1) * pageSize
    
    // 查询已审核店铺
    let query = supabase
      .from('repair_shops')
      .select('*', { count: 'exact' })
      .neq('status', 'pending') // 不等于待审核状态
      .order('created_at', { ascending: false })

    // 状态筛选
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // 添加搜索条件
    if (search) {
      query = query.or(`name.ilike.%${search}%,contact_person.ilike.%${search}%,address.ilike.%${search}%`)
    }

    // 城市筛选
    if (city) {
      query = query.eq('city', city)
    }

    // 分页
    const { data, error, count } = await query
      .range(offset, offset + pageSize - 1)

    if (error) {
      console.error('获取已审核店铺失败:', error)
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

// POST - 创建新店铺（管理员操作）
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  
  try {
    const body = await request.json()
    
    // 验证必填字段
    const requiredFields = ['name', 'contact_person', 'phone', 'address', 'city']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缺少必填字段: ${field}` },
          { status: 400 }
        )
      }
    }

    // 设置默认状态为approved（管理员创建的直接通过）
    const shopData = {
      ...body,
      status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // 创建店铺
    const { data, error } = await supabase
      .from('repair_shops')
      .insert(shopData as any)
      .select()
      .single()

    if (error) {
      console.error('创建店铺失败:', error)
      return NextResponse.json(
        { error: '创建店铺失败', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: '店铺创建成功'
    })

  } catch (error) {
    console.error('创建店铺API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}