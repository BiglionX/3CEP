import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const cookieStore = cookies()
  const authHeader = request.headers.get('authorization')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    let session;
    
    // 优先使用Authorization header中的token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data, error } = await supabase.auth.getUser(token);
      
      if (!error && data.user) {
        session = {
          user: data.user
        };
      }
    }
    
    // 如果header中没有有效的token，尝试从cookie获取
    if (!session) {
      const { data: sessionData } = await supabase.auth.getSession()
      session = sessionData.session;
    }
    
    if (!session) {
      return NextResponse.json(
        { authenticated: false }, 
        { status: 401 }
      )
    }

    // 检查是否为管理员
    let isAdmin = false;
    let adminRole = null;
    
    // 首先检查用户元数据
    if (session.user.user_metadata?.isAdmin === true) {
      isAdmin = true;
      adminRole = session.user.user_metadata.role || 'admin';
    } else {
      // 备用方案：检查数据库
      try {
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('id, role, is_active')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .single()
        
        if (adminUser) {
          isAdmin = true;
          adminRole = adminUser.role;
        }
      } catch (dbError) {
        // 数据库检查失败，使用用户元数据作为判断依据
        console.log('数据库管理员检查失败，使用用户元数据判断');
      }
    }

    return NextResponse.json({
      authenticated: true,
      is_admin: isAdmin,
      user: {
        id: session.user.id,
        email: session.user.email,
        isAdmin: isAdmin,
        role: adminRole
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