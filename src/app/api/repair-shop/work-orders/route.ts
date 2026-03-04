/**
 * 缁翠慨搴楀伐鍗曠鐞咥PI璺敱
 * 澶勭悊宸ュ崟鐨勫鍒犳敼鏌ユ搷? */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { WorkOrderStatus, PriorityLevel } from '@/types/repair-shop.types';

// 妯℃嫙鏁版嵁 - 瀹為檯椤圭洰涓簲杩炴帴鐪熷疄鏁版嵁?const MOCK_WORK_ORDERS = [
  {
    id: 'wo_001',
    orderNumber: 'WO20260228001',
    customerId: 'cust_001',
    customerName: '寮犱笁',
    customerPhone: '138****1234',
    deviceInfo: {
      type: '鏅鸿兘鎵嬫満',
      brand: 'Apple',
      model: 'iPhone 14 Pro',
      serialNumber: 'F2LNY9D9Q6MJ',
      imei: '352098091234567',
    },
    faultDescription: '灞忓箷纰庤锛屾棤娉曟甯告樉?,
    faultType: '灞忓箷缁翠慨',
    status: WorkOrderStatus.IN_PROGRESS,
    priority: PriorityLevel.HIGH,
    technicianId: 'tech_001',
    technicianName: '鏉庡笀?,
    assignedAt: '2026-02-28T09:30:00Z',
    estimatedCompletion: '2026-02-28T15:00:00Z',
    price: 880,
    partsCost: 650,
    laborCost: 230,
    totalPrice: 880,
    paymentStatus: 'pending',
    notes: '瀹㈡埛鎬ラ渶浣跨敤锛屼紭鍏堝?,
    photos: ['/images/iphone-screen-damage.jpg'],
    createdAt: '2026-02-28T09:15:00Z',
    updatedAt: '2026-02-28T14:20:00Z',
  },
  {
    id: 'wo_002',
    orderNumber: 'WO20260228002',
    customerId: 'cust_002',
    customerName: '鏉庡洓',
    customerPhone: '139****5678',
    deviceInfo: {
      type: '鏅鸿兘鎵嬫満',
      brand: 'Samsung',
      model: 'Galaxy S23',
      serialNumber: 'R58N823MQYN',
      imei: '352098097654321',
    },
    faultDescription: '鐢垫睜榧撳寘锛屽厖鐢靛紓?,
    faultType: '鐢垫睜鏇存崲',
    status: WorkOrderStatus.PENDING,
    priority: PriorityLevel.MEDIUM,
    technicianId: 'tech_002',
    technicianName: '鐜嬪笀?,
    assignedAt: '2026-02-28T10:15:00Z',
    estimatedCompletion: '2026-02-29T14:00:00Z',
    price: 450,
    partsCost: 280,
    laborCost: 170,
    totalPrice: 450,
    paymentStatus: 'pending',
    notes: '闇€瑕侀绾﹀埌搴楀?,
    photos: ['/images/samsung-battery-issue.jpg'],
    createdAt: '2026-02-28T10:00:00Z',
    updatedAt: '2026-02-28T10:15:00Z',
  },
  {
    id: 'wo_003',
    orderNumber: 'WO20260228003',
    customerId: 'cust_003',
    customerName: '鐜嬩簲',
    customerPhone: '137****9012',
    deviceInfo: {
      type: '骞虫澘鐢佃剳',
      brand: 'Apple',
      model: 'iPad Air 5',
      serialNumber: 'DMQY48J7G5HG',
      imei: '352098091112233',
    },
    faultDescription: 'WiFi杩炴帴涓嶇ǔ瀹氾紝缁忓父鏂紑',
    faultType: '缃戠粶鏁呴殰',
    status: WorkOrderStatus.COMPLETED,
    priority: PriorityLevel.LOW,
    technicianId: 'tech_003',
    technicianName: '寮犲笀?,
    assignedAt: '2026-02-28T08:45:00Z',
    estimatedCompletion: '2026-02-28T12:30:00Z',
    actualCompletion: '2026-02-28T12:25:00Z',
    price: 280,
    partsCost: 80,
    laborCost: 200,
    totalPrice: 280,
    paymentStatus: 'paid',
    notes: '宸叉洿鎹iFi妯″潡锛岄棶棰樿В?,
    photos: ['/images/ipad-wifi-repair.jpg'],
    createdAt: '2026-02-28T08:30:00Z',
    updatedAt: '2026-02-28T12:30:00Z',
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // 鑾峰彇鏌ヨ鍙傛暟
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const status = searchParams.get('status') as WorkOrderStatus | null;
    const priority = searchParams.get('priority') as PriorityLevel | null;
    const customerId = searchParams.get('customerId') || undefined;
    const technicianId = searchParams.get('technicianId') || undefined;
    const searchTerm = searchParams.get('search') || undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;

    // 杩囨护鏁版嵁
    let filteredOrders = [...MOCK_WORK_ORDERS];

    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    if (priority) {
      filteredOrders = filteredOrders.filter(
        order => order.priority === priority
      );
    }

    if (customerId) {
      filteredOrders = filteredOrders.filter(
        order => order.customerId === customerId
      );
    }

    if (technicianId) {
      filteredOrders = filteredOrders.filter(
        order => order.technicianId === technicianId
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredOrders = filteredOrders.filter(
        order =>
          order.customerName.toLowerCase().includes(term) ||
          order.deviceInfo.model.toLowerCase().includes(term) ||
          order.orderNumber.toLowerCase().includes(term)
      );
    }

    if (dateFrom || dateTo) {
      const fromDate = dateFrom ? new Date(dateFrom) : new Date(0);
      const toDate = dateTo ? new Date(dateTo) : new Date();

      filteredOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= fromDate && orderDate <= toDate;
      });
    }

    // 鍒嗛〉澶勭悊
    const total = filteredOrders.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    // 璁＄畻鍒嗛〉淇℃伅
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      success: true,
      data: paginatedOrders,
      count: total,
      currentPage: page,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    });
  } catch (error) {
    console.error('鑾峰彇宸ュ崟鍒楄〃閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鑾峰彇宸ュ崟鍒楄〃澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 楠岃瘉蹇呴渶瀛楁
    const requiredFields = [
      'customerId',
      'customerName',
      'customerPhone',
      'deviceInfo',
      'faultDescription',
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `缂哄皯蹇呰瀛楁: ${field}` },
          { status: 400 }
        );
      }
    }

    // 鐢熸垚鏂扮殑宸ュ崟ID鍜岀紪?    const newId = `wo_${Date.now()}`;
    const orderNumber = `WO${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(MOCK_WORK_ORDERS.length + 1).padStart(3, '0')}`;

    // 鍒涘缓鏂板伐?    const newOrder = {
      id: newId,
      orderNumber,
      ...body,
      status: WorkOrderStatus.PENDING,
      priority: body.priority || PriorityLevel.MEDIUM,
      price: body.price || 0,
      partsCost: body.partsCost || 0,
      laborCost: body.laborCost || 0,
      totalPrice:
        (body.price || 0) + (body.partsCost || 0) + (body.laborCost || 0),
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 鍦ㄥ疄闄呴」鐩腑杩欓噷搴旇淇濆瓨鍒版暟鎹簱
    // MOCK_WORK_ORDERS.push(newOrder);

    return NextResponse.json({
      success: true,
      data: newOrder,
      message: '宸ュ崟鍒涘缓鎴愬姛',
    });
  } catch (error) {
    console.error('鍒涘缓宸ュ崟閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鍒涘缓宸ュ崟澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

