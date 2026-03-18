import { NextRequest, NextResponse } from 'next/server';

// 区块链码产品
interface BlockchainCodeProduct {
  id: string;
  name: string;
  description: string;
  codeCount: number;
  price: number;
  features: string[];
  status: 'available' | 'unavailable';
  soldCount: number;
}

// 订单
interface Order {
  id: string;
  productId: string;
  productName: string;
  merchantId: string;
  merchantName: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  createdAt: string;
  paidAt?: string;
}

// 模拟产品数据
const products: BlockchainCodeProduct[] = [
  {
    id: 'p1',
    name: '基础版区块链码',
    description: '适用于小型企业，包含基本防伪溯源功能',
    codeCount: 1000,
    price: 0.1,
    features: ['产品防伪验证', '基础溯源记录', '扫码查询'],
    status: 'available',
    soldCount: 156,
  },
  {
    id: 'p2',
    name: '标准版区块链码',
    description: '适用于中型企业，包含完整防伪溯源和营销功能',
    codeCount: 5000,
    price: 0.4,
    features: ['产品防伪验证', '完整溯源记录', '扫码查询', '营销数据分析', '售后关联'],
    status: 'available',
    soldCount: 89,
  },
  {
    id: 'p3',
    name: '企业版区块链码',
    description: '适用于大型企业，包含全部功能和专属服务',
    codeCount: 10000,
    price: 0.7,
    features: ['产品防伪验证', '完整溯源记录', '扫码查询', '营销数据分析', '售后关联', '专属客服', 'API接口'],
    status: 'available',
    soldCount: 45,
  },
  {
    id: 'p4',
    name: '定制版区块链码',
    description: '根据企业需求定制码段数量和功能',
    codeCount: 50000,
    price: 3.0,
    features: ['自定义码段', '完整防伪溯源', '定制功能', '专属客服', 'API接口', '数据报表'],
    status: 'available',
    soldCount: 12,
  },
];

// 模拟订单数据
let orders: Order[] = [
  {
    id: 'o1',
    productId: 'p1',
    productName: '基础版区块链码',
    merchantId: 'm001',
    merchantName: '测试商户A',
    quantity: 1,
    totalPrice: 0.1,
    status: 'completed',
    createdAt: '2024-03-10T10:00:00Z',
    paidAt: '2024-03-10T10:05:00Z',
  },
  {
    id: 'o2',
    productId: 'p2',
    productName: '标准版区块链码',
    merchantId: 'm002',
    merchantName: '测试商户B',
    quantity: 2,
    totalPrice: 0.8,
    status: 'paid',
    createdAt: '2024-03-15T14:00:00Z',
    paidAt: '2024-03-15T14:10:00Z',
  },
  {
    id: 'o3',
    productId: 'p3',
    productName: '企业版区块链码',
    merchantId: 'm003',
    merchantName: '测试商户C',
    quantity: 1,
    totalPrice: 0.7,
    status: 'pending',
    createdAt: '2024-03-18T09:00:00Z',
  },
];

// GET 获取产品列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // products 或 orders

    if (type === 'orders') {
      const status = searchParams.get('status');
      let filteredOrders = [...orders];
      
      if (status && status !== 'all') {
        filteredOrders = orders.filter(o => o.status === status);
      }

      // 统计
      const stats = {
        totalOrders: orders.length,
        pendingCount: orders.filter(o => o.status === 'pending').length,
        paidCount: orders.filter(o => o.status === 'paid').length,
        completedCount: orders.filter(o => o.status === 'completed').length,
        totalRevenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.totalPrice, 0),
      };

      return NextResponse.json({
        success: true,
        data: filteredOrders,
        stats,
      });
    }

    // 返回产品列表
    const productStats = {
      totalProducts: products.length,
      totalSold: products.reduce((sum, p) => sum + p.soldCount, 0),
      totalRevenue: products.reduce((sum, p) => sum + p.soldCount * p.price, 0),
    };

    return NextResponse.json({
      success: true,
      data: products,
      stats: productStats,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

// POST 创建订单
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, merchantId, merchantName, quantity } = body;

    if (!productId || !merchantId || !quantity) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const newOrder: Order = {
      id: `o${orders.length + 1}`,
      productId,
      productName: product.name,
      merchantId,
      merchantName,
      quantity,
      totalPrice: product.price * quantity,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    orders.push(newOrder);

    return NextResponse.json({
      success: true,
      data: newOrder,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// PUT 更新订单状态
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, action } = body;

    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (action === 'pay') {
      // 模拟支付
      orders[orderIndex] = {
        ...orders[orderIndex],
        status: 'paid',
        paidAt: new Date().toISOString(),
      };
    } else if (action === 'complete') {
      orders[orderIndex] = {
        ...orders[orderIndex],
        status: 'completed',
      };
    } else if (action === 'cancel') {
      orders[orderIndex] = {
        ...orders[orderIndex],
        status: 'cancelled',
      };
    }

    return NextResponse.json({
      success: true,
      data: orders[orderIndex],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
