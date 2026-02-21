import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/database.types'

// GET - 获取单个店铺详情
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  
  try {
    const shopId = params.id
    
    // 获取店铺详细信息
    const { data: shop, error } = await supabase
      .from('repair_shops')
      .select('*')
      .eq('id', shopId)
      .single()

    if (error) {
      console.error('获取店铺详情失败:', error)
      return NextResponse.json(
        { error: '获取店铺详情失败', details: error.message },
        { status: 500 }
      )
    }

    if (!shop) {
      return NextResponse.json(
        { error: '店铺不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: shop
    })

  } catch (error) {
    console.error('获取店铺详情API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// PUT - 更新店铺信息
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  
  try {
    const shopId = params.id
    const body = await request.json()
    
    // 移除不允许更新的字段
    const { id, created_at, updated_at, ...updateData } = body
    
    // 更新店铺信息
    const { data, error } = await supabase
      .from('repair_shops')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', shopId)
      .select()
      .single()

    if (error) {
      console.error('更新店铺信息失败:', error)
      return NextResponse.json(
        { error: '更新店铺信息失败', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: '店铺信息更新成功'
    })

  } catch (error) {
    console.error('更新店铺API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// DELETE - 删除店铺
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  
  try {
    const shopId = params.id
    
    // 删除店铺
    const { error } = await supabase
      .from('repair_shops')
      .delete()
      .eq('id', shopId)

    if (error) {
      console.error('删除店铺失败:', error)
      return NextResponse.json(
        { error: '删除店铺失败', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '店铺删除成功'
    })

  } catch (error) {
    console.error('删除店铺API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}