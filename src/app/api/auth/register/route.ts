import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { email, password, confirmPassword, name } = await request.json()

    // 验证输入参数
    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: '邮箱、密码和确认密码不能为空' },
        { status: 400 }
      )
    }

    // 严格的邮箱格式验证
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址（例如：user@example.com）' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: '两次输入的密码不一致' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少6位' },
        { status: 400 }
      )
    }

    // 使用Supabase进行用户注册
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
        }
      }
    })

    if (error) {
      console.error('注册失败:', error)
      
      // 处理具体错误信息
      let errorMessage = '注册失败'
      if (error.code === 'email_address_invalid') {
        errorMessage = '邮箱格式不正确'
      } else if (error.code === 'over_email_send_rate_limit') {
        errorMessage = '系统邮件发送繁忙，请稍后再试或检查垃圾邮件（这不是您的邮箱问题）'
      } else if (error.message.includes('already registered') || error.code === 'user_already_exists') {
        errorMessage = '该邮箱已被注册'
      } else if (error.message.includes('weak password') || error.code === 'weak_password') {
        errorMessage = '密码强度不够'
      } else if (error.message.includes('invalid email')) {
        errorMessage = '邮箱格式不正确'
      } else if (error.code) {
        errorMessage = `注册失败: ${error.message || error.code}`
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    // 注册成功后，可以选择将用户信息存储到自定义表中
    if (data.user) {
      try {
        // 存储额外的用户信息
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          name: name || '',
          created_at: new Date().toISOString(),
        } as any)
      } catch (profileError) {
        console.warn('存储用户档案信息失败:', profileError)
        // 不影响主要注册流程
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
      message: '注册成功，请检查邮箱确认账户'
    })

  } catch (error) {
    console.error('注册接口错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}