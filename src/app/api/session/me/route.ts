import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = cookies()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    // 获取当前会话
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { 
          user: null,
          roles: [],
          tenantId: null,
          isAuthenticated: false 
        }, 
        { status: 401 }
      )
    }

    // 获取管理员用户信息
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id, user_id, role, is_active, created_at, updated_at')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .single()

    // 获取用户租户信息
    let tenantId = null
    if (adminUser) {
      const { data: userTenants } = await supabase
        .from('user_tenants')
        .select('tenant_id')
        .eq('user_id', adminUser.user_id)
        .eq('is_active', true)
        .limit(1)

      tenantId = userTenants?.[0]?.tenant_id || null
    }

    // 确定用户角色
    const roles = adminUser ? [adminUser.role] : ['viewer']

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        user_metadata: session.user.user_metadata,
        created_at: session.user.created_at
      },
      roles,
      tenantId,
      isAuthenticated: true,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Session me 接口错误:', error)
    return NextResponse.json(
      { 
        user: null,
        roles: [],
        tenantId: null,
        isAuthenticated: false,
        error: '服务器内部错误'
      }, 
      { status: 500 }
    )
  }
}