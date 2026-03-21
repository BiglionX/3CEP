import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // 解析请求体
    const body = await request.json();
    const {
      email,
      password,
      confirmPassword,
      name,
      phone,
      user_type,
      account_type,
      companyName,
      shopName,
    } = body;

    // 验证必填字段
    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: '邮箱、密码和确认密码不能为空' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址（例如：user@example.com）' },
        { status: 400 }
      );
    }

    // 验证手机号
    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: '请输入手机号' }, { status: 400 });
    }

    // 验证密码一致性
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: '两次输入的密码不一致' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json({ error: '密码长度至少 6 位' }, { status: 400 });
    }

    // 验证用户类型
    const validUserTypes = [
      'individual',
      'repair_shop',
      'enterprise',
      'foreign_trade_company',
    ];
    if (!user_type || !validUserTypes.includes(user_type)) {
      return NextResponse.json({ error: '无效的用户类型' }, { status: 400 });
    }

    // 根据用户类型验证特定字段
    if (user_type === 'enterprise' && (!companyName || !companyName.trim())) {
      return NextResponse.json({ error: '请输入公司名称' }, { status: 400 });
    }

    if (user_type === 'repair_shop' && (!shopName || !shopName.trim())) {
      return NextResponse.json({ error: '请输入店铺名称' }, { status: 400 });
    }

    // 1. 创建 Supabase 认证用户
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          user_type,
        },
      },
    });

    if (authError) {
      console.error('Supabase 注册失败:', authError);

      // 处理具体错误信息
      let errorMessage = '注册失败';
      if (authError.message.includes('already registered')) {
        errorMessage = '该邮箱已被注册';
      } else if (authError.message.includes('weak password')) {
        errorMessage = '密码强度不够，建议包含字母和数字';
      } else if (authError.code === 'email_address_invalid') {
        errorMessage = '邮箱格式不正确';
      } else if (authError.code === 'over_email_send_rate_limit') {
        errorMessage = '系统邮件发送繁忙，请稍后再试或检查垃圾邮件';
      }

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: '注册失败，未创建用户账户' },
        { status: 500 }
      );
    }

    // 2. 创建 user_accounts 记录
    const { data: accountData, error: accountError } = await supabase
      .from('user_accounts')
      .insert({
        user_id: authData.user.id,
        user_type,
        account_type: account_type || getAccountType(user_type),
        email,
        phone,
        status: 'pending',
        is_verified: false,
        verification_status: 'pending',
        role: getInitialRole(user_type),
      })
      .select()
      .single();

    if (accountError) {
      console.error('创建 user_accounts 失败:', accountError);
      // 回滚：删除已创建的 auth 用户
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: `创建用户账户失败：${accountError.message}` },
        { status: 500 }
      );
    }

    // 3. 根据用户类型创建对应的详情表记录
    let detailError = null;

    if (user_type === 'individual') {
      // 创建个人用户详情
      const [firstName, lastName] = name.split(' ');
      const { error } = await supabase.from('individual_users').insert({
        user_account_id: accountData.id,
        first_name: firstName || name,
        last_name: lastName || '',
      });
      detailError = error;
    } else if (user_type === 'repair_shop' && shopName) {
      // 创建维修店详情
      const { error } = await supabase.from('repair_shop_users_detail').insert({
        user_account_id: accountData.id,
        shop_name: shopName,
        shop_type: 'independent', // 默认值，后续可从前端传递
      });
      detailError = error;
    } else if (user_type === 'enterprise' && companyName) {
      // 创建企业详情
      const { error } = await supabase.from('enterprise_users_detail').insert({
        user_account_id: accountData.id,
        company_name: companyName,
        business_type: 'manufacturer', // 默认值，后续可从前端传递
      });
      detailError = error;
    } else if (user_type === 'foreign_trade_company' && companyName) {
      // 创建外贸公司详情
      const { error } = await supabase.from('enterprise_users_detail').insert({
        user_account_id: accountData.id,
        company_name: companyName,
        business_type: 'foreign_trade',
      });
      detailError = error;
    }

    if (detailError) {
      console.error('创建详情表失败:', detailError);
      // 注意：这里不回滚，因为主账户已创建成功
      // 可以后续通过管理界面补充详情信息
    }

    // 4. 返回成功响应
    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        user_type,
        account_type: account_type || getAccountType(user_type),
      },
      message: '注册成功，请检查邮箱确认账户',
    });
  } catch (error) {
    console.error('注册接口错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    );
  }
}

/**
 * 根据用户类型获取默认的账户类型
 */
function getAccountType(userType: string): string {
  const typeMap: Record<string, string> = {
    individual: 'individual',
    repair_shop: 'repair_shop',
    enterprise: 'factory',
    foreign_trade_company: 'foreign_trade',
  };
  return typeMap[userType] || 'individual';
}

/**
 * 根据用户类型分配初始角色
 */
function getInitialRole(userType: string): string {
  const roleMap: Record<string, string> = {
    individual: 'viewer',
    repair_shop: 'shop_manager',
    enterprise: 'manager',
    foreign_trade_company: 'manager',
  };
  return roleMap[userType] || 'viewer';
}
