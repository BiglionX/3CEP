import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 强制使用 Node.js 运行时（避免 Edge Runtime 的兼容性问题）
export const runtime = 'nodejs';

// 模拟维修站业务数据
const mockDashboardData = {
  // 收入趋势数据
  revenueTrend: [
    { month: '1月', income: 125000, orders: 85 },
    { month: '2月', income: 138000, orders: 92 },
    { month: '3月', income: 156000, orders: 108 },
    { month: '4月', income: 142000, orders: 96 },
    { month: '5月', income: 168000, orders: 115 },
    { month: '6月', income: 185000, orders: 128 },
  ],
  // 完工率数据
  completionRate: {
    totalOrders: 245,
    completedOrders: 218,
    completionPercentage: 89.0,
    monthlyCompletion: [
      { month: '1月', rate: 85.2 },
      { month: '2月', rate: 87.8 },
      { month: '3月', rate: 91.5 },
      { month: '4月', rate: 88.3 },
      { month: '5月', rate: 92.1 },
      { month: '6月', rate: 89.0 },
    ],
  },
  // 客户满意度数据
  satisfaction: {
    averageScore: 4.6,
    totalReviews: 187,
    ratingDistribution: [
      { rating: 5, count: 112, percentage: 60.0 },
      { rating: 4, count: 52, percentage: 27.8 },
      { rating: 3, count: 18, percentage: 9.6 },
      { rating: 2, count: 3, percentage: 1.6 },
      { rating: 1, count: 2, percentage: 1.0 },
    ],
    monthlySatisfaction: [
      { month: '1月', score: 4.3 },
      { month: '2月', score: 4.4 },
      { month: '3月', score: 4.6 },
      { month: '4月', score: 4.5 },
      { month: '5月', score: 4.7 },
      { month: '6月', score: 4.6 },
    ],
  },
  // 关键指标概览
  kpiOverview: {
    totalRevenue: 814000,
    activeShops: 42,
    totalCustomers: 1256,
    pendingOrders: 27,
    avgOrderValue: 3320,
    customerRetention: 82.5,
  },
  // 设备维修类别分布
  repairCategories: [
    { category: '手机维修', count: 156, percentage: 38.2 },
    { category: '电脑维修', count: 89, percentage: 21.8 },
    { category: '家电维修', count: 73, percentage: 17.9 },
    { category: '平板维修', count: 45, percentage: 11.0 },
    { category: '其他维修', count: 45, percentage: 11.1 },
  ],
  // 最近活动
  recentActivities: [
    {
      id: 1,
      type: 'order_completed',
      title: 'iPhone 14 Pro 屏幕更换完成',
      description: '客户李女士的iPhone 14 Pro屏幕维修已完成',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      priority: 'high',
    },
    {
      id: 2,
      type: 'new_order',
      title: '新订单：MacBook Air 电池更换',
      description: '收到新的MacBook Air电池更换订单',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      priority: 'medium',
    },
    {
      id: 3,
      type: 'customer_review',
      title: '收到五星好评',
      description: '客户钱先生对华为手机维修服务给予五星评价',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      priority: 'low',
    },
    {
      id: 4,
      type: 'payment_received',
      title: '收到大额付款',
      description: '收到企业客户张先生的大额维修预付款',
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      priority: 'high',
    },
  ],
};

export async function GET(_request: Request) {
  try {
    // 开发环境：跳过身份验证，使用模拟数据
    // 注意：cookies() 在某些 Next.js 版本中需要 await
    let _token: string | undefined;
    try {
      const cookieStore = cookies();
      _token = cookieStore.get('auth-token')?.value;
    } catch (e) {
      // 开发环境下忽略 cookie 错误
      console.warn('获取 cookie 失败，使用开发模式:', e);
    }

    // 开发环境：跳过身份验证
    // 生产环境应该启用身份验证
    // if (!_token) {
    //   return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    // }

    // 模拟权限验证
    const userRole = 'repair_shop_admin';

    // 添加一些随机波动使数据更真实
    const fluctuation = (Math.random() - 0.5) * 0.1; // ±5% 波动

    const enhancedData = {
      ...mockDashboardData,
      kpiOverview: {
        ...mockDashboardData.kpiOverview,
        totalRevenue: Math.round(
          mockDashboardData.kpiOverview.totalRevenue * (1 + fluctuation)
        ),
        avgOrderValue: Math.round(
          mockDashboardData.kpiOverview.avgOrderValue * (1 + fluctuation)
        ),
      },
    };

    return NextResponse.json({
      success: true,
      data: enhancedData,
      timestamp: new Date().toISOString(),
      userRole,
    });
  } catch (error) {
    console.error('获取仪表盘数据失败', error);
    return NextResponse.json(
      {
        error: '获取仪表盘数据失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
