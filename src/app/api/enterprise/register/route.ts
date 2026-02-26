import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      companyName, 
      businessLicense, 
      contactPerson, 
      phone, 
      email, 
      password 
    } = body;

    // 参数验证
    if (!companyName || !contactPerson || !phone || !email || !password) {
      return NextResponse.json(
        { success: false, error: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '请输入有效的邮箱地址' },
        { status: 400 }
      );
    }

    // 检查企业是否已存在
    const { data: existingCompany } = await supabase
      .from('enterprise_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingCompany) {
      return NextResponse.json(
        { success: false, error: '该邮箱已被注册' },
        { status: 409 }
      );
    }

    // 创建企业用户
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: companyName,
          business_license: businessLicense,
          contact_person: contactPerson,
          phone: phone,
          user_type: 'enterprise'
        }
      }
    });

    if (userError) {
      console.error('创建用户失败:', userError);
      return NextResponse.json(
        { success: false, error: '用户创建失败' },
        { status: 500 }
      );
    }

    if (!userData.user) {
      return NextResponse.json(
        { success: false, error: '用户创建失败' },
        { status: 500 }
      );
    }

    // 在企业用户表中创建记录
    const { data: enterpriseData, error: enterpriseError } = await supabase
      .from('enterprise_users')
      .insert({
        user_id: userData.user.id,
        company_name: companyName,
        business_license: businessLicense || null,
        contact_person: contactPerson,
        phone: phone,
        email: email,
        status: 'pending' // 待审核状态
      } as any)
      .select()
      .single();

    if (enterpriseError) {
      console.error('创建企业记录失败:', enterpriseError);
      // 如果企业记录创建失败，删除已创建的用户
      await supabase.auth.admin.deleteUser(userData.user.id);
      return NextResponse.json(
        { success: false, error: '企业信息创建失败' },
        { status: 500 }
      );
    }

    // 记录操作日志
    await supabase.from('audit_logs').insert({
      user_id: userData.user.id,
      action: 'enterprise_register',
      resource_type: 'enterprise_user',
      resource_id: enterpriseData.id,
      details: {
        company_name: companyName,
        contact_person: contactPerson,
        email: email
      } as any,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: '企业注册成功，等待审核',
      data: {
        userId: userData.user.id,
        companyId: enterpriseData.id,
        companyName: enterpriseData.company_name,
        email: enterpriseData.email
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('企业注册错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}