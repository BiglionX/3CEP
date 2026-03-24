import { NextRequest, NextResponse } from 'next/server';
import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';

// 模拟采购订单数据
const mockOrders = [
  {
    id: 'po_001',
    order_number: 'PO202402001',
    supplier_name: '华强北电子有限公司',
    supplier_contact: '张经理 13800138001',
    total_amount: 15600.0,
    status: 'approved',
    items: [
      {
        id: 'item_001',
        product_name: 'iPhone 14 Pro原装屏幕',
        sku: 'IPH14P-SCR-001',
        quantity: 20,
        unit_price: 680.0,
        total_price: 13600.0,
        category: '手机配件',
      },
      {
        id: 'item_002',
        product_name: '原装电池',
        sku: 'BAT-GEN-001',
        quantity: 30,
        unit_price: 60.0,
        total_price: 1800.0,
        category: '电池',
      },
    ],
    created_at: '2024-02-25T09:30:00Z',
    updated_at: '2024-02-26T14:20:00Z',
    expected_delivery: '2024-03-05T00:00:00Z',
    actual_delivery: null,
    notes: '紧急订单，请优先处理',
  },
  {
    id: 'po_002',
    order_number: 'PO202402002',
    supplier_name: '深圳数码配件厂',
    supplier_contact: '李主管 13900139002',
    total_amount: 8900.0,
    status: 'processing',
    items: [
      {
        id: 'item_003',
        product_name: 'Type-C数据线',
        sku: 'TC-CBL-001',
        quantity: 100,
        unit_price: 25.0,
        total_price: 2500.0,
        category: '数据线',
      },
      {
        id: 'item_004',
        product_name: '无线充电器',
        sku: 'WC-PAD-001',
        quantity: 50,
        unit_price: 128.0,
        total_price: 6400.0,
        category: '充电设备',
      },
    ],
    created_at: '2024-02-26T11:15:00Z',
    updated_at: '2024-02-27T09:45:00Z',
    expected_delivery: '2024-03-08T00:00:00Z',
    actual_delivery: null,
    notes: '常规补货订单',
  },
  {
    id: 'po_003',
    order_number: 'PO202402003',
    supplier_name: '广州电子元件公司',
    supplier_contact: '王经理 13700137003',
    total_amount: 23400.0,
    status: 'shipped',
    items: [
      {
        id: 'item_005',
        product_name: '主板芯片',
        sku: 'MB-CHIP-001',
        quantity: 15,
        unit_price: 1560.0,
        total_price: 23400.0,
        category: '芯片',
      },
    ],
    created_at: '2024-02-20T14:20:00Z',
    updated_at: '2024-02-28T10:30:00Z',
    expected_delivery: '2024-03-03T00:00:00Z',
    actual_delivery: '2024-03-02T15:45:00Z',
    notes: '高价值芯片订单',
  },
  {
    id: 'po_004',
    order_number: 'PO202402004',
    supplier_name: '北京智能设备供应商',
    supplier_contact: '陈总 13600136004',
    total_amount: 5670.0,
    status: 'completed',
    items: [
      {
        id: 'item_006',
        product_name: '智能检测仪',
        sku: 'SM-TEST-001',
        quantity: 3,
        unit_price: 1890.0,
        total_price: 5670.0,
        category: '检测设备',
      },
    ],
    created_at: '2024-01-15T08:45:00Z',
    updated_at: '2024-02-20T16:30:00Z',
    expected_delivery: '2024-02-25T00:00:00Z',
    actual_delivery: '2024-02-24T11:20:00Z',
    notes: '设备验收合格',
  },
  {
    id: 'po_005',
    order_number: 'PO202402005',
    supplier_name: '上海精密仪器厂',
    supplier_contact: '刘工 13500135005',
    total_amount: 32000.0,
    status: 'pending',
    items: [
      {
        id: 'item_007',
        product_name: '专业维修工具套装',
        sku: 'PRO-TOOL-001',
        quantity: 8,
        unit_price: 4000.0,
        total_price: 32000.0,
        category: '工具',
      },
    ],
    created_at: '2024-02-28T13:20:00Z',
    updated_at: '2024-02-28T13:20:00Z',
    expected_delivery: '2024-03-15T00:00:00Z',
    actual_delivery: null,
    notes: '年度大额采购申请',
  },
];

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const orderId = params.id;
    const body = await request.json();

    // 查找订单
    const orderIndex = mockOrders.findIndex(order => order.id === orderId);

    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, error: '采购订单不存在' },
        { status: 404 }
      );
    }

    // 更新订单信息
    const updatedOrder = {
      ...mockOrders[orderIndex],
      ...body,
      updated_at: new Date().toISOString(),
    };

    mockOrders[orderIndex] = updatedOrder;

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: '采购订单更新成功',
    });
  } catch (error) {
    console.error('更新采购订单失败:', error);
    return NextResponse.json(
      { success: false, error: '更新采购订单失败' },
      { status: 500 }
    );
  }

    },
    'procurement_read'
  );

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const orderId = params.id;

    // 查找订单
    const orderIndex = mockOrders.findIndex(order => order.id === orderId);

    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, error: '采购订单不存在' },
        { status: 404 }
      );
    }

    // 删除订单
    mockOrders.splice(orderIndex, 1);

    return NextResponse.json({
      success: true,
      message: '采购订单删除成功',
    });
  } catch (error) {
    console.error('删除采购订单失败:', error);
    return NextResponse.json(
      { success: false, error: '删除采购订单失败' },
      { status: 500 }
    );
  }

    },
    'procurement_read'
  );

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const orderId = params.id;

    // 查找订单
    const order = mockOrders.find(o => o.id === orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: '采购订单不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('获取采购订单详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取采购订单详情失败' },
      { status: 500 }
    );
  }

    },
    'procurement_read'
  );
