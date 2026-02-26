import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/database.types'

// GET - 获取待审核的店铺列表
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    
    const offset = (page - 1) * pageSize
    
    // 查询待审核店铺
    let query = supabase
      .from('repair_shops')
      .select('*', { count: 'exact' })
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    // 添加搜索条件
    if (search) {
      query = query.or(`name.ilike.%${search}%,contact_person.ilike.%${search}%,city.ilike.%${search}%`)
    }

    // 添加分类筛选
    if (category) {
      query = query.eq('category', category)
    }

    // 分页
    const { data, error, count } = await query
      .range(offset, offset + pageSize - 1)

    if (error) {
      console.error('获取待审核店铺失败:', error)
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

// POST - 批量审核操作（通过或驳回）
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  
  try {
    const { action, ids, rejectionReason } = await request.json()
    
    if (!action || !ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    let updateData: any = {}
    
    if (action === 'approve') {
      updateData = {
        status: 'approved',
        approved_at: new Date().toISOString()
      }
    } else if (action === 'reject') {
      if (!rejectionReason) {
        return NextResponse.json(
          { error: '驳回操作必须提供驳回原因' },
          { status: 400 }
        )
      }
      updateData = {
        status: 'rejected',
        rejection_reason: rejectionReason,
        rejected_at: new Date().toISOString()
      }
    } else {
      return NextResponse.json(
        { error: '不支持的操作类型' },
        { status: 400 }
      )
    }

    // 批量更新店铺状态
    const { data, error } = await supabase
      .from('repair_shops')
      .update(updateData as any)
      .in('id', ids)

    if (error) {
      console.error('批量审核操作失败:', error)
      return NextResponse.json(
        { error: '操作失败', details: error.message },
        { status: 500 }
      )
    }

    // 如果是通过审核，需要给店主用户添加shop_owner角色
    if (action === 'approve') {
      // 获取审核通过的店铺信息
      const { data: approvedShops } = await supabase
        .from('repair_shops')
        .select('id, owner_user_id')
        .in('id', ids)
      
      // 为每个店铺的店主添加shop_owner子角色
      if (approvedShops) {
        for (const shop of approvedShops) {
          if (shop.owner_user_id) {
            // 获取用户当前的sub_roles
            const { data: userProfile } = await supabase
              .from('user_profiles_ext')
              .select('sub_roles')
              .eq('user_id', shop.owner_user_id)
              .single()
            
            // 添加shop_owner角色（避免重复）
            const currentSubRoles = userProfile?.sub_roles || []
            const newSubRoles = Array.from(new Set([...currentSubRoles, 'shop_owner']))
            
            await supabase
              .from('user_profiles_ext')
              .update({ sub_roles: newSubRoles } as any)
              .eq('user_id', shop.owner_user_id)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? '审核通过成功' : '驳回操作成功',
      affected: ids.length
    })

  } catch (error) {
    console.error('批量审核API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}