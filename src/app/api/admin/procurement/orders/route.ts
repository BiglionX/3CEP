import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';

﻿import { NextRequest, NextResponse } from 'next/server';

// 妯℃嫙閲囪喘璁㈠崟鏁版嵁
const mockOrders = [
  {
    id: 'po_001',
    order_number: 'PO202402001',
    supplier_name: '鍗庡己鍖楃數瀛愭湁闄愬叕,
    supplier_contact: '寮犵粡13800138001',
    total_amount: 15600.0,
    status: 'approved',
    items: [
      {
        id: 'item_001',
        product_name: 'iPhone 14 Pro鍘熻灞忓箷',
        sku: 'IPH14P-SCR-001',
        quantity: 20,
        unit_price: 680.0,
        total_price: 13600.0,
        category: '鎵嬫満閰嶄欢',
      },
      {
        id: 'item_002',
        product_name: '鍘熻鐢垫睜',
        sku: 'BAT-GEN-001',
        quantity: 30,
        unit_price: 60.0,
        total_price: 1800.0,
        category: '鐢垫睜',
      },
    ],
    created_at: '2024-02-25T09:30:00Z',
    updated_at: '2024-02-26T14:20:00Z',
    expected_delivery: '2024-03-05T00:00:00Z',
    actual_delivery: null,
    notes: '绱ф€ヨ鍗曪紝璇蜂紭鍏堝,
  },
  {
    id: 'po_002',
    order_number: 'PO202402002',
    supplier_name: '娣卞湷鏁扮爜閰嶄欢,
    supplier_contact: '鏉庝富13900139002',
    total_amount: 8900.0,
    status: 'processing',
    items: [
      {
        id: 'item_003',
        product_name: 'Type-C鏁版嵁,
        sku: 'TC-CBL-001',
        quantity: 100,
        unit_price: 25.0,
        total_price: 2500.0,
        category: '鏁版嵁,
      },
      {
        id: 'item_004',
        product_name: '犵嚎鍏呯數,
        sku: 'WC-PAD-001',
        quantity: 50,
        unit_price: 128.0,
        total_price: 6400.0,
        category: '鍏呯數璁惧',
      },
    ],
    created_at: '2024-02-26T11:15:00Z',
    updated_at: '2024-02-27T09:45:00Z',
    expected_delivery: '2024-03-08T00:00:00Z',
    actual_delivery: null,
    notes: '甯歌琛ヨ揣璁㈠崟',
  },
  {
    id: 'po_003',
    order_number: 'PO202402003',
    supplier_name: '骞垮窞鐢靛瓙鍏冧欢鍏徃',
    supplier_contact: '鐜嬬粡13700137003',
    total_amount: 23400.0,
    status: 'shipped',
    items: [
      {
        id: 'item_005',
        product_name: '涓绘澘鑺墖',
        sku: 'MB-CHIP-001',
        quantity: 15,
        unit_price: 1560.0,
        total_price: 23400.0,
        category: '鑺墖',
      },
    ],
    created_at: '2024-02-20T14:20:00Z',
    updated_at: '2024-02-28T10:30:00Z',
    expected_delivery: '2024-03-03T00:00:00Z',
    actual_delivery: '2024-03-02T15:45:00Z',
    notes: '楂樹环鍊艰姱鐗囪,
  },
  {
    id: 'po_004',
    order_number: 'PO202402004',
    supplier_name: '鍖椾含鏅鸿兘璁惧渚涘簲,
    supplier_contact: '闄13600136004',
    total_amount: 5670.0,
    status: 'completed',
    items: [
      {
        id: 'item_006',
        product_name: '鏅鸿兘妫€娴嬩华',
        sku: 'SM-TEST-001',
        quantity: 3,
        unit_price: 1890.0,
        total_price: 5670.0,
        category: '妫€娴嬭,
      },
    ],
    created_at: '2024-01-15T08:45:00Z',
    updated_at: '2024-02-20T16:30:00Z',
    expected_delivery: '2024-02-25T00:00:00Z',
    actual_delivery: '2024-02-24T11:20:00Z',
    notes: '璁惧楠屾敹鍚堟牸',
  },
  {
    id: 'po_005',
    order_number: 'PO202402005',
    supplier_name: '涓婃捣绮惧瘑櫒,
    supplier_contact: '鍒樺伐 13500135005',
    total_amount: 32000.0,
    status: 'pending',
    items: [
      {
        id: 'item_007',
        product_name: '涓撲笟缁翠慨宸ュ叿濂楄',
        sku: 'PRO-TOOL-001',
        quantity: 8,
        unit_price: 4000.0,
        total_price: 32000.0,
        category: '宸ュ叿',
      },
    ],
    created_at: '2024-02-28T13:20:00Z',
    updated_at: '2024-02-28T13:20:00Z',
    expected_delivery: '2024-03-15T00:00:00Z',
    actual_delivery: null,
    notes: '骞村害澶ч閲囪喘鐢宠',
  },
];

export async function GET(request: NextRequest) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    // 杩囨护鏁版嵁
    let filteredOrders = [...mockOrders];

    // 鎼滅储杩囨护
    if (search) {
      filteredOrders = filteredOrders.filter(
        order =>
          order.order_number.toLowerCase().includes(search.toLowerCase()) ||
          order.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
          order.supplier_contact.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 鐘舵€佽繃    if (status && status !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    // 鍒嗛〉
    const total = filteredOrders.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedOrders,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('鑾峰彇閲囪喘璁㈠崟鍒楄〃澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鑾峰彇閲囪喘璁㈠崟鍒楄〃澶辫触',
        data: [],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0,
        },
      },
      { status: 500 }
    );
  }

    },
    'procurement_read'
  );

export async function POST(request: NextRequest) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const body = await request.json();

    // 鐢熸垚鏂癐D鍜岃鍗曞彿
    const newId = `po_${String(mockOrders.length + 1).padStart(3, '0')}`;
    const orderNumber =
      body.order_number ||
      `PO${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Date.now()).slice(-4)}`;

    // 鍒涘缓鏂拌    const newOrder = {
      id: newId,
      order_number: orderNumber,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: body.items || [],
    };

    mockOrders.push(newOrder);

    return NextResponse.json({
      success: true,
      data: newOrder,
      message: '閲囪喘璁㈠崟鍒涘缓鎴愬姛',
    });
  } catch (error) {
    console.error('鍒涘缓閲囪喘璁㈠崟澶辫触:', error);
    return NextResponse.json(
      { success: false, error: '鍒涘缓閲囪喘璁㈠崟澶辫触' },
      { status: 500 }
    );
  }

    },
    'procurement_read'
  );

