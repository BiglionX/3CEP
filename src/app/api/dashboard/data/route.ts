/**
 * 瑙掕壊宸紓?Dashboard API 绔偣
 * 鏍规嵁鐢ㄦ埛瑙掕壊杩斿洖涓嶅悓鐨勪华琛ㄦ澘鏁版嵁鍜屽姛鑳芥ā? */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 锟?cookies 鑾峰彇浼氳瘽淇℃伅
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-access-token');

    // 楠岃瘉鐢ㄦ埛璁よ瘉
    if (!sessionCookie) {
      return NextResponse.json({ error: '鐢ㄦ埛鏈? }, { status: 401 });
    }

    // 鑾峰彇鐢ㄦ埛淇℃伅
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json({ error: '鐢ㄦ埛璁よ瘉澶辫触' }, { status: 401 });
    }

    // 鑾峰彇鐢ㄦ埛瑙掕壊淇℃伅锛堢畝鍖栧疄鐜帮紝瀹為檯搴旇浠庢暟鎹簱鑾峰彇?    const userRoles = await getUserRoles(user.id, supabase);
    const userRole = userRoles[0] || 'viewer';

    // 鑾峰彇鏌ヨ鍙傛暟
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    // 鏍规嵁瑙掕壊鏋勫缓宸紓鍖栫殑浠〃鏉挎暟?    const dashboardData = await buildRoleBasedDashboard(
      userRole,
      tenantId,
      supabase
    );

    return NextResponse.json({
      success: true,
      data: dashboardData,
      userRole: userRole,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Dashboard API 閿欒:', error);
    return NextResponse.json({ error: '鑾峰彇浠〃鏉挎暟鎹け? }, { status: 500 });
  }
}

/**
 * 鑾峰彇鐢ㄦ埛瑙掕壊淇℃伅
 */
async function getUserRoles(userId: string, supabase: any): Promise<string[]> {
  try {
    // 绠€鍖栧疄鐜帮細浠庣敤鎴峰厓鏁版嵁鑾峰彇瑙掕壊
    const { data: userData, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!error && userData?.role) {
      return [userData.role];
    }

    // 榛樿杩斿洖 viewer 瑙掕壊
    return ['viewer'];
  } catch (error) {
    console.error('鑾峰彇鐢ㄦ埛瑙掕壊澶辫触:', error);
    return ['viewer'];
  }
}

/**
 * 鏍规嵁鐢ㄦ埛瑙掕壊鏋勫缓宸紓鍖栫殑浠〃鏉挎暟? */
async function buildRoleBasedDashboard(
  role: string,
  tenantId: string | null,
  supabase: any
) {
  const dashboard: any = {
    userRole: role,
    modules: [],
    statistics: {},
    recentActivities: [],
  };

  // 鏍规嵁涓嶅悓瑙掕壊鎻愪緵涓嶅悓鐨勬ā鍧楀拰鏁版嵁
  switch (role) {
    case 'admin':
      dashboard.modules = getAdminModules();
      dashboard.statistics = getAdminStatistics();
      break;

    case 'manager':
      dashboard.modules = getManagerModules();
      dashboard.statistics = getManagerStatistics();
      break;

    case 'content_manager':
      dashboard.modules = getContentManagerModules();
      dashboard.statistics = getContentManagerStatistics();
      break;

    case 'shop_manager':
      dashboard.modules = getShopManagerModules();
      dashboard.statistics = getShopManagerStatistics();
      break;

    case 'finance_manager':
      dashboard.modules = getFinanceManagerModules();
      dashboard.statistics = getFinanceManagerStatistics();
      break;

    case 'procurement_specialist':
      dashboard.modules = getProcurementSpecialistModules();
      dashboard.statistics = getProcurementSpecialistStatistics();
      break;

    case 'warehouse_operator':
      dashboard.modules = getWarehouseOperatorModules();
      dashboard.statistics = getWarehouseOperatorStatistics();
      break;

    case 'agent_operator':
      dashboard.modules = getAgentOperatorModules();
      dashboard.statistics = getAgentOperatorStatistics();
      break;

    case 'viewer':
      dashboard.modules = getViewerModules();
      dashboard.statistics = getViewerStatistics();
      break;

    default:
      dashboard.modules = getDefaultModules();
      dashboard.statistics = getDefaultStatistics();
  }

  // 鑾峰彇鏈€杩戞椿鍔紙鎵€鏈夎鑹查€氱敤?  dashboard.recentActivities = getRecentActivities();

  return dashboard;
}

// 绠＄悊鍛樻ā?function getAdminModules() {
  return [
    {
      id: 'system_overview',
      name: '绯荤粺姒傝',
      icon: 'Gauge',
      permission: 'dashboard_read',
    },
    {
      id: 'user_management',
      name: '鐢ㄦ埛绠＄悊',
      icon: 'Users',
      permission: 'users_read',
    },
    {
      id: 'content_management',
      name: '鍐呭绠＄悊',
      icon: 'FileText',
      permission: 'content_read',
    },
    {
      id: 'shop_management',
      name: '搴楅摵绠＄悊',
      icon: 'Store',
      permission: 'shops_read',
    },
    {
      id: 'financial_dashboard',
      name: '璐㈠姟鐪嬫澘',
      icon: 'DollarSign',
      permission: 'payments_read',
    },
    {
      id: 'procurement_center',
      name: '閲囪喘涓績',
      icon: 'ShoppingCart',
      permission: 'procurement_read',
    },
    {
      id: 'warehouse_management',
      name: '浠撳偍绠＄悊',
      icon: 'Package',
      permission: 'inventory_read',
    },
    {
      id: 'agent_workflows',
      name: '鏅鸿兘浣撳伐浣滄祦',
      icon: 'Bot',
      permission: 'agents_execute',
    },
    {
      id: 'n8n_integration',
      name: 'n8n 闆嗘垚',
      icon: 'Workflow',
      permission: 'n8n_workflows_read',
    },
    {
      id: 'system_audit',
      name: '绯荤粺瀹¤',
      icon: 'Shield',
      permission: 'audit_read',
    },
    {
      id: 'system_monitoring',
      name: '绯荤粺鐩戞帶',
      icon: 'Activity',
      permission: 'monitoring_read',
    },
    {
      id: 'system_settings',
      name: '绯荤粺璁剧疆',
      icon: 'Settings',
      permission: 'settings_read',
    },
  ];
}

// 绠＄悊鍛樼粺璁℃暟?function getAdminStatistics() {
  return {
    totalUsers: 1247,
    activeUsers: 892,
    totalContent: 3456,
    pendingReviews: 23,
    totalShops: 156,
    activeShops: 142,
    monthlyRevenue: 125000,
    pendingPayments: 12,
    openTickets: 8,
    systemHealth: 'good',
  };
}

// 鍏朵粬瑙掕壊鐨勬ā鍧楀拰缁熻鏁版嵁
function getManagerModules() {
  return [
    {
      id: 'business_overview',
      name: '涓氬姟姒傝',
      icon: 'BarChart3',
      permission: 'dashboard_read',
    },
    {
      id: 'team_management',
      name: '鍥㈤槦绠＄悊',
      icon: 'Users',
      permission: 'users_read',
    },
    {
      id: 'content_review',
      name: '鍐呭瀹℃牳',
      icon: 'FileCheck',
      permission: 'content_approve',
    },
    {
      id: 'shop_approval',
      name: '搴楅摵瀹℃壒',
      icon: 'Store',
      permission: 'shops_approve',
    },
    {
      id: 'reports',
      name: '涓氬姟鎶ヨ〃',
      icon: 'PieChart',
      permission: 'reports_read',
    },
  ];
}

function getManagerStatistics() {
  return {
    teamMembers: 12,
    pendingContent: 15,
    pendingShops: 3,
    monthlyGrowth: 12.5,
    completionRate: 94.2,
  };
}

function getContentManagerModules() {
  return [
    {
      id: 'content_dashboard',
      name: '鍐呭鐪嬫澘',
      icon: 'LayoutDashboard',
      permission: 'dashboard_read',
    },
    {
      id: 'content_list',
      name: '鍐呭鍒楄〃',
      icon: 'Files',
      permission: 'content_read',
    },
    {
      id: 'content_create',
      name: '鏂板缓鍐呭',
      icon: 'PlusCircle',
      permission: 'content_create',
    },
    {
      id: 'content_review',
      name: '鍐呭瀹℃牳',
      icon: 'FileCheck',
      permission: 'content_approve',
    },
    {
      id: 'analytics',
      name: '鍐呭鍒嗘瀽',
      icon: 'BarChart',
      permission: 'reports_read',
    },
  ];
}

function getContentManagerStatistics() {
  return {
    totalContent: 892,
    publishedContent: 756,
    draftContent: 89,
    pendingReview: 47,
    todayViews: 12500,
  };
}

function getShopManagerModules() {
  return [
    {
      id: 'shop_overview',
      name: '搴楅摵姒傝',
      icon: 'Store',
      permission: 'dashboard_read',
    },
    {
      id: 'shop_list',
      name: '搴楅摵鍒楄〃',
      icon: 'List',
      permission: 'shops_read',
    },
    {
      id: 'shop_approval',
      name: '搴楅摵瀹℃壒',
      icon: 'CheckCircle',
      permission: 'shops_approve',
    },
    {
      id: 'performance',
      name: '涓氱哗缁熻',
      icon: 'TrendingUp',
      permission: 'reports_read',
    },
  ];
}

function getShopManagerStatistics() {
  return {
    totalShops: 156,
    activeShops: 142,
    pendingApproval: 8,
    suspendedShops: 6,
    monthlyOrders: 2340,
  };
}

function getFinanceManagerModules() {
  return [
    {
      id: 'finance_dashboard',
      name: '璐㈠姟鐪嬫澘',
      icon: 'DollarSign',
      permission: 'dashboard_read',
    },
    {
      id: 'payment_records',
      name: '鏀粯璁板綍',
      icon: 'CreditCard',
      permission: 'payments_read',
    },
    {
      id: 'refund_management',
      name: '閫€娆剧?,
      icon: 'Undo2',
      permission: 'payments_refund',
    },
    {
      id: 'financial_reports',
      name: '璐㈠姟鎶ヨ〃',
      icon: 'FileBarChart',
      permission: 'reports_read',
    },
  ];
}

function getFinanceManagerStatistics() {
  return {
    monthlyRevenue: 125000,
    pendingPayments: 12,
    refundRequests: 3,
    accountBalance: 45000,
    transactionCount: 1247,
  };
}

function getProcurementSpecialistModules() {
  return [
    {
      id: 'procurement_dashboard',
      name: '閲囪喘鐪嬫澘',
      icon: 'ShoppingCart',
      permission: 'dashboard_read',
    },
    {
      id: 'purchase_orders',
      name: '閲囪喘璁㈠崟',
      icon: 'FileText',
      permission: 'procurement_read',
    },
    {
      id: 'supplier_management',
      name: '渚涘簲鍟嗙?,
      icon: 'Truck',
      permission: 'procurement_create',
    },
    {
      id: 'approval_center',
      name: '瀹℃壒涓績',
      icon: 'CheckCircle',
      permission: 'procurement_approve',
    },
  ];
}

function getProcurementSpecialistStatistics() {
  return {
    pendingOrders: 15,
    approvedOrders: 42,
    rejectedOrders: 3,
    totalSpend: 85000,
    supplierCount: 23,
  };
}

function getWarehouseOperatorModules() {
  return [
    {
      id: 'warehouse_dashboard',
      name: '浠撳偍鐪嬫澘',
      icon: 'Package',
      permission: 'dashboard_read',
    },
    {
      id: 'inventory_management',
      name: '搴撳瓨绠＄悊',
      icon: 'Boxes',
      permission: 'inventory_read',
    },
    {
      id: 'stock_operations',
      name: '鍑哄叆搴撴搷?,
      icon: 'Move',
      permission: 'inventory_update',
    },
    {
      id: 'inventory_reports',
      name: '搴撳瓨鎶ヨ〃',
      icon: 'BarChart3',
      permission: 'reports_read',
    },
  ];
}

function getWarehouseOperatorStatistics() {
  return {
    totalItems: 5678,
    lowStockItems: 23,
    pendingOperations: 12,
    warehouseCapacity: 85,
    dailyMovements: 156,
  };
}

function getAgentOperatorModules() {
  return [
    {
      id: 'agent_dashboard',
      name: '鏅鸿兘浣撶湅?,
      icon: 'Bot',
      permission: 'dashboard_read',
    },
    {
      id: 'workflow_execution',
      name: '宸ヤ綔娴佹墽?,
      icon: 'Play',
      permission: 'agents_execute',
    },
    {
      id: 'monitoring',
      name: '杩愯鐩戞帶',
      icon: 'Activity',
      permission: 'agents_monitor',
    },
    {
      id: 'debug_tools',
      name: '璋冭瘯宸ュ叿',
      icon: 'Bug',
      permission: 'agents_debug',
    },
  ];
}

function getAgentOperatorStatistics() {
  return {
    activeWorkflows: 12,
    completedToday: 89,
    failedTasks: 3,
    avgExecutionTime: '2.3s',
    successRate: 96.7,
  };
}

function getViewerModules() {
  return [
    {
      id: 'overview',
      name: '鏁版嵁姒傝',
      icon: 'Eye',
      permission: 'dashboard_read',
    },
    {
      id: 'reports',
      name: '鏌ョ湅鎶ヨ〃',
      icon: 'FileText',
      permission: 'reports_read',
    },
  ];
}

function getViewerStatistics() {
  return {
    accessibleReports: 15,
    lastUpdated: '2灏忔椂?,
    dataFreshness: 'high',
  };
}

function getDefaultModules() {
  return [
    {
      id: 'basic_dashboard',
      name: '鍩虹鐪嬫澘',
      icon: 'Layout',
      permission: 'dashboard_read',
    },
  ];
}

function getDefaultStatistics() {
  return {
    welcomeMessage: '娆㈣繋浣跨敤绯荤粺',
  };
}

// 鑾峰彇鏈€杩戞椿?function getRecentActivities() {
  return [
    {
      id: '1',
      type: 'system',
      title: '绯荤粺鏇存柊瀹屾垚',
      description: '鐗堟湰 2.1.0 宸查儴?,
      time: '2灏忔椂?,
      icon: 'Rocket',
    },
    {
      id: '2',
      type: 'user',
      title: '鏂扮敤鎴锋敞?,
      description: '鐢ㄦ埛 john_doe 瀹屾垚娉ㄥ唽',
      time: '4灏忔椂?,
      icon: 'UserPlus',
    },
    {
      id: '3',
      type: 'content',
      title: '鍐呭寰呭?,
      description: '锟?3 绡囨枃绔犵瓑寰呭?,
      time: '1澶╁墠',
      icon: 'FileText',
    },
  ];
}

