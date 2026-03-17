import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      email,
      password,
      contactPerson,
      phone,
      businessType,
      companyName,
      businessLicense,
      shopName,
      shopAddress,
    } = body;

    // 验证必填字段
    if (!email || !password || !contactPerson || !phone || !businessType) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 根据业务类型进行特定验证
    if (businessType === 'enterprise') {
      if (!companyName || !businessLicense) {
        return NextResponse.json(
          { error: '企业用户必须填写公司名称和营业执照号' },
          { status: 400 }
        );
      }
    } else if (businessType === 'repair-shop') {
      if (!shopName || !shopAddress) {
        return NextResponse.json(
          { error: '维修店必须填写店铺名称和地址' },
          { status: 400 }
        );
      }
    } else if (businessType === 'trade') {
      if (!companyName) {
        return NextResponse.json(
          { error: '贸易公司必须填写公司名称' },
          { status: 400 }
        );
      }
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      );
    }

    // 密码强度验证
    if (password.length < 8) {
      return NextResponse.json({ error: '密码长度至少8位' }, { status: 400 });
    }

    // 模拟数据库操作
    // 在实际项目中，这里应该：
    // 1. 检查邮箱是否已注册
    // 2. 检查营业执照号/公司名称是否已存在
    // 3. 创建用户账户
    // 4. 发送验证邮件
    // 5. 返回成功响应

    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟成功响应
    return NextResponse.json(
      {
        success: true,
        message: '注册成功，请等待审核',
        data: {
          businessType,
          email,
          status: 'pending', // 待审核状态
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('商业用户注册失败:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
