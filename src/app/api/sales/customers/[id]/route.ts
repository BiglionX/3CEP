/**
 * GET /api/sales/customers/[id]
 * 获取客户详情
 *
 * PUT /api/sales/customers/[id]
 * 更新客户信息
 *
 * DELETE /api/sales/customers/[id]
 * 删除客户
 */

import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/modules/sales-agent';
import type { UpdateCustomerInput } from '@/modules/sales-agent';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET 处理函数
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: '客户 ID 不能为空' }, { status: 400 });
    }

    const customer = await customerService.getCustomer(id);

    if (!customer) {
      return NextResponse.json({ error: '客户不存在' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error('Error in GET /api/sales/customers/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PUT 处理函数
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: '客户 ID 不能为空' }, { status: 400 });
    }

    const body = await request.json();
    const customer = await customerService.updateCustomer(
      id,
      body as UpdateCustomerInput
    );

    if (!customer) {
      return NextResponse.json({ error: '客户不存在' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error('Error in PUT /api/sales/customers/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE 处理函数
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: '客户 ID 不能为空' }, { status: 400 });
    }

    await customerService.deleteCustomer(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/sales/customers/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
