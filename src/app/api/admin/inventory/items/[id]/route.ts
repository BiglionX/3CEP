import { NextRequest, NextResponse } from 'next/server';

// 模拟库存数据
const mockInventoryItems = [
  {
    id: 'inv_001',
    sku: 'IPH14P-SCR-001',
    name: 'iPhone 14 Pro原装屏幕',
    category: '手机配件',
    brand: 'Apple',
    current_stock: 25,
    reserved_stock: 5,
    available_stock: 20,
    min_stock_level: 10,
    max_stock_level: 50,
    unit_price: 680.0,
    total_value: 17000.0,
    location: 'A区-01货架',
    last_updated: '2024-02-28T10:30:00Z',
    status: 'normal',
  },
  {
    id: 'inv_002',
    sku: 'BAT-GEN-001',
    name: '原装电池',
    category: '电池',
    brand: 'Generic',
    current_stock: 8,
    reserved_stock: 2,
    available_stock: 6,
    min_stock_level: 15,
    max_stock_level: 100,
    unit_price: 60.0,
    total_value: 480.0,
    location: 'B区-03货架',
    last_updated: '2024-02-27T14:15:00Z',
    status: 'low_stock',
  },
  {
    id: 'inv_003',
    sku: 'TC-CBL-001',
    name: 'Type-C数据线',
    category: '数据线',
    brand: 'Samsung',
    current_stock: 120,
    reserved_stock: 20,
    available_stock: 100,
    min_stock_level: 30,
    max_stock_level: 200,
    unit_price: 25.0,
    total_value: 3000.0,
    location: 'C区-02货架',
    last_updated: '2024-02-28T09:20:00Z',
    status: 'normal',
  },
  {
    id: 'inv_004',
    sku: 'MB-CHIP-001',
    name: '主板芯片',
    category: '芯片',
    brand: 'Qualcomm',
    current_stock: 0,
    reserved_stock: 0,
    available_stock: 0,
    min_stock_level: 5,
    max_stock_level: 25,
    unit_price: 1560.0,
    total_value: 0.0,
    location: 'D区-01货架',
    last_updated: '2024-02-25T11:45:00Z',
    status: 'out_of_stock',
  },
  {
    id: 'inv_005',
    sku: 'PRO-TOOL-001',
    name: '专业维修工具套装',
    category: '工具',
    brand: 'Bosch',
    current_stock: 150,
    reserved_stock: 30,
    available_stock: 120,
    min_stock_level: 20,
    max_stock_level: 150,
    unit_price: 4000.0,
    total_value: 600000.0,
    location: 'E区-04货架',
    last_updated: '2024-02-28T13:30:00Z',
    status: 'overstock',
  },
  {
    id: 'inv_006',
    sku: 'WC-PAD-001',
    name: '无线充电器',
    category: '充电设备',
    brand: 'Belkin',
    current_stock: 35,
    reserved_stock: 5,
    available_stock: 30,
    min_stock_level: 10,
    max_stock_level: 60,
    unit_price: 128.0,
    total_value: 4480.0,
    location: 'A区-05货架',
    last_updated: '2024-02-27T16:45:00Z',
    status: 'normal',
  },
  {
    id: 'inv_007',
    sku: 'SM-TEST-001',
    name: '智能检测仪',
    category: '检测设备',
    brand: 'Fluke',
    current_stock: 8,
    reserved_stock: 1,
    available_stock: 7,
    min_stock_level: 3,
    max_stock_level: 15,
    unit_price: 1890.0,
    total_value: 15120.0,
    location: 'F区-02货架',
    last_updated: '2024-02-26T09:15:00Z',
    status: 'normal',
  },
];

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;
    const body = await request.json();

    // 查找库存项目
    const itemIndex = mockInventoryItems.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: '库存项目不存在' },
        { status: 404 }
      );
    }

    // 更新库存信息
    const currentItem = mockInventoryItems[itemIndex];
    const updatedItem = {
      ...currentItem,
      ...body,
      last_updated: new Date().toISOString(),
    };

    // 重新计算相关字段
    if ('current_stock' in body || 'reserved_stock' in body) {
      const current_stock = body.current_stock  currentItem.current_stock;
      const reserved_stock = body.reserved_stock  currentItem.reserved_stock;
      updatedItem.available_stock = current_stock - reserved_stock;
    }

    if ('current_stock' in body || 'unit_price' in body) {
      const current_stock = body.current_stock  currentItem.current_stock;
      const unit_price = body.unit_price  currentItem.unit_price;
      updatedItem.total_value = current_stock * unit_price;
    }

    // 更新状态
    if (
      'current_stock' in body ||
      'min_stock_level' in body ||
      'max_stock_level' in body
    ) {
      const current_stock = body.current_stock  currentItem.current_stock;
      const min_stock_level =
        body.min_stock_level  currentItem.min_stock_level;
      const max_stock_level =
        body.max_stock_level  currentItem.max_stock_level;

      if (current_stock === 0) {
        updatedItem.status = 'out_of_stock';
      } else if (current_stock <= min_stock_level) {
        updatedItem.status = 'low_stock';
      } else if (current_stock >= max_stock_level) {
        updatedItem.status = 'overstock';
      } else {
        updatedItem.status = 'normal';
      }
    }

    mockInventoryItems[itemIndex] = updatedItem;

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: '库存项目更新成功',
    });
  } catch (error) {
    console.error('更新库存项目失败:', error);
    return NextResponse.json(
      { success: false, error: '更新库存项目失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;

    // 查找库存项目
    const itemIndex = mockInventoryItems.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: '库存项目不存在' },
        { status: 404 }
      );
    }

    // 删除库存项目
    mockInventoryItems.splice(itemIndex, 1);

    return NextResponse.json({
      success: true,
      message: '库存项目删除成功',
    });
  } catch (error) {
    console.error('删除库存项目失败:', error);
    return NextResponse.json(
      { success: false, error: '删除库存项目失败' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;

    // 查找库存项目
    const item = mockInventoryItems.find(i => i.id === itemId);

    if (!item) {
      return NextResponse.json(
        { success: false, error: '库存项目不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('获取库存项目详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取库存项目详情失败' },
      { status: 500 }
    );
  }
}
