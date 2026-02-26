// 合作伙伴详情API路由处理器
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/foreign-trade/partners/[id] - 获取合作伙伴详情
export async function GET(request: Request, { params }: RouteParams) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const { id } = await params
    
    // 查询合作伙伴详情
    const { data, error } = await supabase
      .from('foreign_trade_partners')
      .select(`
        *,
        created_by_user:users(id, email, full_name),
        related_orders:foreign_trade_orders(
          id,
          order_number,
          type,
          amount,
          status,
          created_at
        ),
        related_contracts:foreign_trade_contracts(
          id,
          contract_number,
          title,
          type,
          status,
          start_date,
          end_date
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: '合作伙伴不存在' },
          { status: 404 }
        )
      }
      throw new Error(error.message)
    }

    // 计算业务统计数据
    const orderStats = {
      totalOrders: data.related_orders?.length || 0,
      totalAmount: data.related_orders?.reduce((sum: number, order: any) => sum + order.amount, 0) || 0,
      activeOrders: data.related_orders?.filter((order: any) => 
        ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status)
      ).length || 0
    }

    const contractStats = {
      totalContracts: data.related_contracts?.length || 0,
      activeContracts: data.related_contracts?.filter((contract: any) => 
        contract.status === 'active'
      ).length || 0
    }

    const response = {
      success: true,
      data: {
        ...data,
        business_stats: {
          orders: orderStats,
          contracts: contractStats
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('获取合作伙伴详情错误:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '获取合作伙伴详情失败',
        message: (error as Error).message 
      },
      { status: 500 }
    )
  }
}

// PUT /api/foreign-trade/partners/[id] - 更新合作伙伴
export async function PUT(request: Request, { params }: RouteParams) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      contact_person,
      email,
      phone,
      website,
      address,
      products,
      rating,
      status,
      payment_terms,
      credit_limit,
      notes
    } = body

    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户未登录' },
        { status: 401 }
      )
    }

    // 如果更新名称，检查是否重复
    if (name) {
      const { data: existingPartner } = await supabase
        .from('foreign_trade_partners')
        .select('id')
        .eq('name', name)
        .neq('id', id)
        .single()

      if (existingPartner) {
        return NextResponse.json(
          { 
            success: false, 
            error: '名称已存在',
            message: '该名称的合作伙伴已存在'
          },
          { status: 409 }
        )
      }
    }

    // 更新合作伙伴数据
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (name) updateData.name = name
    if (contact_person) updateData.contact_person = contact_person
    if (email) updateData.email = email
    if (phone) updateData.phone = phone
    if (website !== undefined) updateData.website = website
    if (address !== undefined) updateData.address = address
    if (products) updateData.products = products
    if (rating !== undefined) updateData.rating = rating
    if (status) updateData.status = status
    if (payment_terms !== undefined) updateData.payment_terms = payment_terms
    if (credit_limit !== undefined) updateData.credit_limit = credit_limit
    if (notes !== undefined) updateData.notes = notes

    const { data, error } = await supabase
      .from('foreign_trade_partners')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // 记录操作日志
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'UPDATE_PARTNER',
      table_name: 'foreign_trade_partners',
      record_id: id,
      details: { name: data.name, status: data.status } as any
    })

    return NextResponse.json({
      success: true,
      data,
      message: '合作伙伴更新成功'
    })

  } catch (error) {
    console.error('更新合作伙伴错误:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '更新合作伙伴失败',
        message: (error as Error).message 
      },
      { status: 500 }
    )
  }
}

// DELETE /api/foreign-trade/partners/[id] - 删除合作伙伴
export async function DELETE(request: Request, { params }: RouteParams) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const { id } = await params

    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户未登录' },
        { status: 401 }
      )
    }

    // 检查是否有相关的订单或合同
    const { data: relatedOrders } = await supabase
      .from('foreign_trade_orders')
      .select('id')
      .eq('partner_id', id)
      .limit(1)

    const { data: relatedContracts } = await supabase
      .from('foreign_trade_contracts')
      .select('id')
      .or(`supplier_id.eq.${id},customer_id.eq.${id}`)
      .limit(1)

    if ((relatedOrders && relatedOrders.length > 0) || (relatedContracts && relatedContracts.length > 0)) {
      return NextResponse.json(
        { 
          success: false, 
          error: '无法删除',
          message: '该合作伙伴有关联的订单或合同，无法删除'
        },
        { status: 400 }
      )
    }

    // 删除合作伙伴
    const { error } = await supabase
      .from('foreign_trade_partners')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    // 记录操作日志
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'DELETE_PARTNER',
      table_name: 'foreign_trade_partners',
      record_id: id
    } as any)

    return NextResponse.json({
      success: true,
      message: '合作伙伴删除成功'
    })

  } catch (error) {
    console.error('删除合作伙伴错误:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '删除合作伙伴失败',
        message: (error as Error).message 
      },
      { status: 500 }
    )
  }
}

// PATCH /api/foreign-trade/partners/[id]/status - 更新合作伙伴状态
export async function PATCH(request: Request, { params }: RouteParams) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const { id } = await params
    const body = await request.json()
    const { status, contract_expiry } = body

    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户未登录' },
        { status: 401 }
      )
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (status) updateData.status = status
    if (contract_expiry) updateData.contract_expiry = contract_expiry

    const { data, error } = await supabase
      .from('foreign_trade_partners')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // 记录状态变更
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'UPDATE_PARTNER_STATUS',
      table_name: 'foreign_trade_partners',
      record_id: id,
      details: { status: data.status } as any
    })

    return NextResponse.json({
      success: true,
      data,
      message: '合作伙伴状态更新成功'
    })

  } catch (error) {
    console.error('更新合作伙伴状态错误:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '更新合作伙伴状态失败',
        message: (error as Error).message 
      },
      { status: 500 }
    )
  }
}