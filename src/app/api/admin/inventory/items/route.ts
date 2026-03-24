import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';

﻿import { NextRequest, NextResponse } from 'next/server';

// 妯℃嫙搴撳鏁版嵁
const mockInventoryItems = [
  {
    id: 'inv_001',
    sku: 'IPH14P-SCR-001',
    name: 'iPhone 14 Pro鍘熻灞忓箷',
    category: '鎵嬫満閰嶄欢',
    brand: 'Apple',
    current_stock: 25,
    reserved_stock: 5,
    available_stock: 20,
    min_stock_level: 10,
    max_stock_level: 50,
    unit_price: 680.0,
    total_value: 17000.0,
    location: 'A01璐ф灦',
    last_updated: '2024-02-28T10:30:00Z',
    status: 'normal',
  },
  {
    id: 'inv_002',
    sku: 'BAT-GEN-001',
    name: '鍘熻鐢垫睜',
    category: '鐢垫睜',
    brand: 'Generic',
    current_stock: 8,
    reserved_stock: 2,
    available_stock: 6,
    min_stock_level: 15,
    max_stock_level: 100,
    unit_price: 60.0,
    total_value: 480.0,
    location: 'B03璐ф灦',
    last_updated: '2024-02-27T14:15:00Z',
    status: 'low_stock',
  },
  {
    id: 'inv_003',
    sku: 'TC-CBL-001',
    name: 'Type-C鏁版嵁,
    category: '鏁版嵁,
    brand: 'Samsung',
    current_stock: 120,
    reserved_stock: 20,
    available_stock: 100,
    min_stock_level: 30,
    max_stock_level: 200,
    unit_price: 25.0,
    total_value: 3000.0,
    location: 'C02璐ф灦',
    last_updated: '2024-02-28T09:20:00Z',
    status: 'normal',
  },
  {
    id: 'inv_004',
    sku: 'MB-CHIP-001',
    name: '涓绘澘鑺墖',
    category: '鑺墖',
    brand: 'Qualcomm',
    current_stock: 0,
    reserved_stock: 0,
    available_stock: 0,
    min_stock_level: 5,
    max_stock_level: 25,
    unit_price: 1560.0,
    total_value: 0.0,
    location: 'D01璐ф灦',
    last_updated: '2024-02-25T11:45:00Z',
    status: 'out_of_stock',
  },
  {
    id: 'inv_005',
    sku: 'PRO-TOOL-001',
    name: '涓撲笟缁翠慨宸ュ叿濂楄',
    category: '宸ュ叿',
    brand: 'Bosch',
    current_stock: 150,
    reserved_stock: 30,
    available_stock: 120,
    min_stock_level: 20,
    max_stock_level: 150,
    unit_price: 4000.0,
    total_value: 600000.0,
    location: 'E04璐ф灦',
    last_updated: '2024-02-28T13:30:00Z',
    status: 'overstock',
  },
  {
    id: 'inv_006',
    sku: 'WC-PAD-001',
    name: '犵嚎鍏呯數,
    category: '鍏呯數璁惧',
    brand: 'Belkin',
    current_stock: 35,
    reserved_stock: 5,
    available_stock: 30,
    min_stock_level: 10,
    max_stock_level: 60,
    unit_price: 128.0,
    total_value: 4480.0,
    location: 'A05璐ф灦',
    last_updated: '2024-02-27T16:45:00Z',
    status: 'normal',
  },
  {
    id: 'inv_007',
    sku: 'SM-TEST-001',
    name: '鏅鸿兘妫€娴嬩华',
    category: '妫€娴嬭,
    brand: 'Fluke',
    current_stock: 8,
    reserved_stock: 1,
    available_stock: 7,
    min_stock_level: 3,
    max_stock_level: 15,
    unit_price: 1890.0,
    total_value: 15120.0,
    location: 'F02璐ф灦',
    last_updated: '2024-02-26T09:15:00Z',
    status: 'normal',
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
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';

    // 杩囨护鏁版嵁
    let filteredItems = [...mockInventoryItems];

    // 鎼滅储杩囨护
    if (search) {
      filteredItems = filteredItems.filter(
        item =>
          item.sku.toLowerCase().includes(search.toLowerCase()) ||
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.brand.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 鍒嗙被杩囨护
    if (category && category !== 'all') {
      filteredItems = filteredItems.filter(item => item.category === category);
    }

    // 鐘舵€佽繃    if (status && status !== 'all') {
      filteredItems = filteredItems.filter(item => item.status === status);
    }

    // 鍒嗛〉
    const total = filteredItems.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedItems,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('鑾峰彇搴撳鍒楄〃澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鑾峰彇搴撳鍒楄〃澶辫触',
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
    'inventory_read'
  );

export async function POST(request: NextRequest) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const body = await request.json();

    // 鐢熸垚鏂癐D鍜孲KU
    const newId = `inv_${String(mockInventoryItems.length + 1).padStart(3, '0')}`;
    const sku =
      body.sku ||
      `SKU${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Date.now()).slice(-4)}`;

    // 璁＄畻鍙敤搴撳鍜屾€讳环    const current_stock = body.current_stock || 0;
    const reserved_stock = body.reserved_stock || 0;
    const unit_price = body.unit_price || 0;

    // 鍒涘缓鏂板簱瀛橀」    const newItem = {
      id: newId,
      sku: sku,
      ...body,
      current_stock,
      reserved_stock,
      available_stock: current_stock - reserved_stock,
      total_value: current_stock * unit_price,
      last_updated: new Date().toISOString(),
      status:
        current_stock === 0
           'out_of_stock'
          : current_stock <= (body.min_stock_level || 10)
             'low_stock'
            : current_stock >= (body.max_stock_level || 100)
               'overstock'
              : 'normal',
    };

    mockInventoryItems.push(newItem);

    return NextResponse.json({
      success: true,
      data: newItem,
      message: '搴撳椤圭洰鍒涘缓鎴愬姛',
    });
  } catch (error) {
    console.error('鍒涘缓搴撳椤圭洰澶辫触:', error);
    return NextResponse.json(
      { success: false, error: '鍒涘缓搴撳椤圭洰澶辫触' },
      { status: 500 }
    );
  }

    },
    'inventory_read'
  );

