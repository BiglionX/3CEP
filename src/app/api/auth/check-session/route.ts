import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { authenticated: false }, 
        { status: 401 }
      )
    }

    // 检查是否为管理员
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id, role, is_active')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .single()

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        isAdmin: !!adminUser,
        role: adminUser?.role || null
      }
    })

  } catch (error) {
    console.error('会话检查失败:', error)
    return NextResponse.json(
      { authenticated: false }, 
      { status: 500 }
    )
  }
}