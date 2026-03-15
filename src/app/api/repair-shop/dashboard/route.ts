import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 妯℃嫙缁翠慨搴椾笟鍔℃暟const mockDashboardData = {
  // 鏀跺叆瓒嬪娍鏁版嵁
  revenueTrend: [
    { month: '1, income: 125000, orders: 85 },
    { month: '2, income: 138000, orders: 92 },
    { month: '3, income: 156000, orders: 108 },
    { month: '4, income: 142000, orders: 96 },
    { month: '5, income: 168000, orders: 115 },
    { month: '6, income: 185000, orders: 128 },
  ],

  // 瀹屾垚鐜囨暟  completionRate: {
    totalOrders: 245,
    completedOrders: 218,
    completionPercentage: 89.0,
    monthlyCompletion: [
      { month: '1, rate: 85.2 },
      { month: '2, rate: 87.8 },
      { month: '3, rate: 91.5 },
      { month: '4, rate: 88.3 },
      { month: '5, rate: 92.1 },
      { month: '6, rate: 89.0 },
    ],
  },

  // 瀹㈡埛婊℃剰搴︽暟  satisfaction: {
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
      { month: '1, score: 4.3 },
      { month: '2, score: 4.4 },
      { month: '3, score: 4.6 },
      { month: '4, score: 4.5 },
      { month: '5, score: 4.7 },
      { month: '6, score: 4.6 },
    ],
  },

  // 鍏抽敭鎸囨爣姒傝
  kpiOverview: {
    totalRevenue: 814000,
    activeShops: 42,
    totalCustomers: 1256,
    pendingOrders: 27,
    avgOrderValue: 3320,
    customerRetention: 82.5,
  },

  // 璁惧缁翠慨绫诲埆鍒嗗竷
  repairCategories: [
    { category: '鎵嬫満缁翠慨', count: 156, percentage: 38.2 },
    { category: '鐢佃剳缁翠慨', count: 89, percentage: 21.8 },
    { category: '瀹剁數缁翠慨', count: 73, percentage: 17.9 },
    { category: '骞虫澘缁翠慨', count: 45, percentage: 11.0 },
    { category: '鍏朵粬缁翠慨', count: 45, percentage: 11.1 },
  ],

  // 鏈€杩戞椿  recentActivities: [
    {
      id: 1,
      type: 'order_completed',
      title: 'iPhone 14 Pro 灞忓箷鏇存崲瀹屾垚',
      description: '瀹㈡埛寮犲コ澹殑iPhone 14 Pro灞忓箷缁翠慨宸插畬,
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      priority: 'high',
    },
    {
      id: 2,
      type: 'new_order',
      title: '鏂拌鍗曪細MacBook Air 鐢垫睜鏇存崲',
      description: '鏀跺埌鏂扮殑MacBook Air鐢垫睜鏇存崲璁㈠崟',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      priority: 'medium',
    },
    {
      id: 3,
      type: 'customer_review',
      title: '鏀跺埌浜旀槦濂借瘎',
      description: '瀹㈡埛鏉庡厛鐢熷鍗庝负鎵嬫満缁翠慨鏈嶅姟缁欎簣浜旀槦璇勪环',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      priority: 'low',
    },
    {
      id: 4,
      type: 'payment_received',
      title: '鏀跺埌澶ч樻',
      description: '鏀跺埌佷笟瀹㈡埛鑱旀兂绗旇鏈壒閲忕淮淇,
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      priority: 'high',
    },
  ],
};

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token').value;

    // 妯℃嫙韬唤楠岃瘉妫€    if (!token) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    // 妯℃嫙鏉冮檺妫€    const userRole = 'repair_shop_admin'; // 瀹為檯搴斾粠token瑙ｆ瀽

    // 娣诲姞涓€浜涢殢鏈烘尝鍔ㄤ娇鏁版嵁鏇寸湡    const fluctuation = (Math.random() - 0.5) * 0.1; // 卤5% 娉㈠姩

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
    console.error('鑾峰彇〃鏉挎暟鎹け', error);
    return NextResponse.json(
      {
        error: '鑾峰彇〃鏉挎暟鎹け,
        message: error instanceof Error  error.message : '鏈煡閿欒',
      },
      { status: 500 }
    );
  }
}

