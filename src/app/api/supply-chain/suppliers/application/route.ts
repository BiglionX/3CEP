/**
 * 供应商入驻申请API
 */

import { NextResponse } from 'next/server';
// import { SupplierService } from '@/supply-chain'; // 后续实现

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      contactPerson, 
      phone, 
      email, 
      address, 
      country, 
      businessLicense, 
      companyProfile 
    } = body;

    // 参数验证
    const requiredFields = ['name', 'contactPerson', 'phone', 'email', 'address', 'country'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缺少必要参数: ${field}` },
          { status: 400 }
        );
      }
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 验证手机号格式（简单验证）
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: '手机号格式不正确' },
        { status: 400 }
      );
    }

    // 模拟供应商申请处理（实际应该调用SupplierService）
    const applicationId = `APP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 模拟处理时间
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟90%的成功率
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      return NextResponse.json({
        success: true,
        data: {
          applicationId,
          status: 'pending_review',
          message: '供应商入驻申请已提交，请等待审核'
        }
      });
    } else {
      return NextResponse.json(
        { 
          error: '申请提交失败',
          details: '系统繁忙，请稍后重试' 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('供应商申请错误:', error);
    return NextResponse.json(
      { 
        error: '申请处理失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}