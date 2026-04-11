import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';

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
    location: 'A01货架',
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
    location: 'B03货架',
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
    location: 'C02货架',
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
    location: 'D01货架',
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
    location: 'E04货架',
    last_updated: '2024-02-28T13:30:00Z',
    status: 'overstock',
  },
  {
    id: 'inv_006',
    sku: 'WC-PAD-001',
    name: '无线充电板',
    category: '充电设备',
    brand: 'Belkin',
    current_stock: 35,
    reserved_stock: 5,
    available_stock: 30,
    min_stock_level: 10,
    max_stock_level: 60,
    unit_price: 128.0,
    total_value: 4480.0,
    location: 'A05货架',
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
    location: 'F02货架',
    last_updated: '2024-02-26T09:15:00Z',
    status: 'normal',
  },
];

export async function GET(request: NextRequest) {
  return apiPermissionMiddleware(
    request,
    async () => {
      try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '10');
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';
        const status = searchParams.get('status') || '';

        // 过滤数据
        let filteredItems = [...mockInventoryItems];

        // 搜索过滤
        if (search) {
          filteredItems = filteredItems.filter(
            item =>
              item.sku.toLowerCase().includes(search.toLowerCase()) ||
              item.name.toLowerCase().includes(search.toLowerCase()) ||
              item.brand.toLowerCase().includes(search.toLowerCase())
          );
        }

        // 分类过滤
        if (category && category !== 'all') {
          filteredItems = filteredItems.filter(
            item => item.category === category
          );
        }

        // 状态过滤
        if (status && status !== 'all') {
          filteredItems = filteredItems.filter(item => item.status === status);
        }

        // 分页
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
        console.error('获取库存列表失败:', error);
        return NextResponse.json(
          {
            success: false,
            error: '获取库存列表失败',
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
}

export async function POST(request: NextRequest) {
  return apiPermissionMiddleware(
    request,
    async () => {
      try {
        const body = await request.json();

        // 生成新ID和SKU
        const newId = `inv_${String(mockInventoryItems.length + 1).padStart(3, '0')}`;
        const sku =
          body.sku ||
          `SKU${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Date.now()).slice(-4)}`;

        // 计算可用库存和总价值
        const current_stock = body.current_stock || 0;
        const reserved_stock = body.reserved_stock || 0;
        const unit_price = body.unit_price || 0;

        // 创建新库存项
        const newItem = {
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
              ? 'out_of_stock'
              : current_stock <= (body.min_stock_level || 10)
                ? 'low_stock'
                : current_stock >= (body.max_stock_level || 100)
                  ? 'overstock'
                  : 'normal',
        };

        mockInventoryItems.push(newItem);

        return NextResponse.json({
          success: true,
          data: newItem,
          message: '库存项目创建成功',
        });
      } catch (error) {
        console.error('创建库存项目失败:', error);
        return NextResponse.json(
          { success: false, error: '创建库存项目失败' },
          { status: 500 }
        );
      }
    },
    'inventory_write'
  );
}
