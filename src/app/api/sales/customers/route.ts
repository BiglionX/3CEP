/**
 * GET /api/sales/customers
 * 鑾峰彇瀹㈡埛鍒楄〃锛堟敮鎸佸垎椤靛拰绛涢€夛級
 *
 * POST /api/sales/customers
 * 鍒涘缓鏂板? */

import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/modules/sales-agent';
import type {
  CustomerGrade,
  CustomerStatus,
  CreateCustomerInput,
} from '@/modules/sales-agent';

// GET 澶勭悊鍑芥暟
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // 瑙ｆ瀽鏌ヨ鍙傛暟
    const grade = searchParams.get('grade') as CustomerGrade | undefined;
    const status = searchParams.get('status') as CustomerStatus | undefined;
    const industry = searchParams.get('industry') as string | undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 鑾峰彇瀹㈡埛鍒楄〃
    const result = await customerService.getCustomers({
      grade,
      status,
      industry,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in GET /api/sales/customers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST 澶勭悊鍑芥暟
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 楠岃瘉蹇呭～瀛楁
    if (!body.company_name) {
      return NextResponse.json({ error: '鍏徃鍚嶇О涓哄繀濉」' }, { status: 400 });
    }

    // 鍒涘缓瀹㈡埛
    const customer = await customerService.createCustomer(
      body as CreateCustomerInput
    );

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/sales/customers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create customer' },
      { status: 500 }
    );
  }
}

