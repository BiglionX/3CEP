/**
 * 角色差异化 Dashboard API 端点
 * 根据用户角色返回不同的仪表板数据和功能模块
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 从 cookies 获取会话信息
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-access-token');

    // 验证用户认证
    if (!sessionCookie) {
      return NextResponse.json({ error: '用户未认证' }, { status: 401 });
    }

    // 获取用户信息
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json({ error: '用户认证失败' }, { status: 401 });
    }

    // 获取用户角色信息（简化实现，实际应该从数据库获取）
    const userRoles = await getUserRoles(user.id, supabase);
    const userRole = userRoles[0] || 'viewer';

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    // 根据角色构建差异化的仪表板数据
    const dashboardData = await buildRoleBasedDashboard(userRole, tenantId, supabase);

    return NextResponse.json({
      success: true,
      data: dashboardData,
      userRole: userRole,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Dashboard API 错误:', error);
    return NextResponse.json(
      { error: '获取仪表板数据失败' }, 
      { status: 500 }
    );
  }
}

/**
 * 获取用户角色信息
 */
async function getUserRoles(userId: string, supabase: any): Promise<string[]> {
  try {
    // 简化实现：从用户元数据获取角色
    const { data: userData, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!error && userData?.role) {
      return [userData.role];
    }

    // 默认返回 viewer 角色
    return ['viewer'];
  } catch (error) {
    console.error('获取用户角色失败:', error);
    return ['viewer'];
  }
}

/**
 * 根据用户角色构建差异化的仪表板数据
 */
async function buildRoleBasedDashboard(
  role: string, 
  tenantId: string | null, 
  supabase: any
) {
  const dashboard: any = {
    userRole: role,
    modules: [],
    statistics: {},
    recentActivities: []
  };

  // 根据不同角色提供不同的模块和数据
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

  // 获取最近活动（所有角色通用）
  dashboard.recentActivities = getRecentActivities();

  return dashboard;
}

// 管理员模块
function getAdminModules() {
  return [
    { id: 'system_overview', name: '系统概览', icon: 'Gauge', permission: 'dashboard_read' },
    { id: 'user_management', name: '用户管理', icon: 'Users', permission: 'users_read' },
    { id: 'content_management', name: '内容管理', icon: 'FileText', permission: 'content_read' },
    { id: 'shop_management', name: '店铺管理', icon: 'Store', permission: 'shops_read' },
    { id: 'financial_dashboard', name: '财务看板', icon: 'DollarSign', permission: 'payments_read' },
    { id: 'procurement_center', name: '采购中心', icon: 'ShoppingCart', permission: 'procurement_read' },
    { id: 'warehouse_management', name: '仓储管理', icon: 'Package', permission: 'inventory_read' },
    { id: 'agent_workflows', name: '智能体工作流', icon: 'Bot', permission: 'agents_execute' },
    { id: 'n8n_integration', name: 'n8n 集成', icon: 'Workflow', permission: 'n8n_workflows_read' },
    { id: 'system_audit', name: '系统审计', icon: 'Shield', permission: 'audit_read' },
    { id: 'system_monitoring', name: '系统监控', icon: 'Activity', permission: 'monitoring_read' },
    { id: 'system_settings', name: '系统设置', icon: 'Settings', permission: 'settings_read' }
  ];
}

// 管理员统计数据
function getAdminStatistics() {
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
    systemHealth: 'good'
  };
}

// 其他角色的模块和统计数据
function getManagerModules() {
  return [
    { id: 'business_overview', name: '业务概览', icon: 'BarChart3', permission: 'dashboard_read' },
    { id: 'team_management', name: '团队管理', icon: 'Users', permission: 'users_read' },
    { id: 'content_review', name: '内容审核', icon: 'FileCheck', permission: 'content_approve' },
    { id: 'shop_approval', name: '店铺审批', icon: 'Store', permission: 'shops_approve' },
    { id: 'reports', name: '业务报表', icon: 'PieChart', permission: 'reports_read' }
  ];
}

function getManagerStatistics() {
  return {
    teamMembers: 12,
    pendingContent: 15,
    pendingShops: 3,
    monthlyGrowth: 12.5,
    completionRate: 94.2
  };
}

function getContentManagerModules() {
  return [
    { id: 'content_dashboard', name: '内容看板', icon: 'LayoutDashboard', permission: 'dashboard_read' },
    { id: 'content_list', name: '内容列表', icon: 'Files', permission: 'content_read' },
    { id: 'content_create', name: '新建内容', icon: 'PlusCircle', permission: 'content_create' },
    { id: 'content_review', name: '内容审核', icon: 'FileCheck', permission: 'content_approve' },
    { id: 'analytics', name: '内容分析', icon: 'BarChart', permission: 'reports_read' }
  ];
}

function getContentManagerStatistics() {
  return {
    totalContent: 892,
    publishedContent: 756,
    draftContent: 89,
    pendingReview: 47,
    todayViews: 12500
  };
}

function getShopManagerModules() {
  return [
    { id: 'shop_overview', name: '店铺概览', icon: 'Store', permission: 'dashboard_read' },
    { id: 'shop_list', name: '店铺列表', icon: 'List', permission: 'shops_read' },
    { id: 'shop_approval', name: '店铺审批', icon: 'CheckCircle', permission: 'shops_approve' },
    { id: 'performance', name: '业绩统计', icon: 'TrendingUp', permission: 'reports_read' }
  ];
}

function getShopManagerStatistics() {
  return {
    totalShops: 156,
    activeShops: 142,
    pendingApproval: 8,
    suspendedShops: 6,
    monthlyOrders: 2340
  };
}

function getFinanceManagerModules() {
  return [
    { id: 'finance_dashboard', name: '财务看板', icon: 'DollarSign', permission: 'dashboard_read' },
    { id: 'payment_records', name: '支付记录', icon: 'CreditCard', permission: 'payments_read' },
    { id: 'refund_management', name: '退款管理', icon: 'Undo2', permission: 'payments_refund' },
    { id: 'financial_reports', name: '财务报表', icon: 'FileBarChart', permission: 'reports_read' }
  ];
}

function getFinanceManagerStatistics() {
  return {
    monthlyRevenue: 125000,
    pendingPayments: 12,
    refundRequests: 3,
    accountBalance: 45000,
    transactionCount: 1247
  };
}

function getProcurementSpecialistModules() {
  return [
    { id: 'procurement_dashboard', name: '采购看板', icon: 'ShoppingCart', permission: 'dashboard_read' },
    { id: 'purchase_orders', name: '采购订单', icon: 'FileText', permission: 'procurement_read' },
    { id: 'supplier_management', name: '供应商管理', icon: 'Truck', permission: 'procurement_create' },
    { id: 'approval_center', name: '审批中心', icon: 'CheckCircle', permission: 'procurement_approve' }
  ];
}

function getProcurementSpecialistStatistics() {
  return {
    pendingOrders: 15,
    approvedOrders: 42,
    rejectedOrders: 3,
    totalSpend: 85000,
    supplierCount: 23
  };
}

function getWarehouseOperatorModules() {
  return [
    { id: 'warehouse_dashboard', name: '仓储看板', icon: 'Package', permission: 'dashboard_read' },
    { id: 'inventory_management', name: '库存管理', icon: 'Boxes', permission: 'inventory_read' },
    { id: 'stock_operations', name: '出入库操作', icon: 'Move', permission: 'inventory_update' },
    { id: 'inventory_reports', name: '库存报表', icon: 'BarChart3', permission: 'reports_read' }
  ];
}

function getWarehouseOperatorStatistics() {
  return {
    totalItems: 5678,
    lowStockItems: 23,
    pendingOperations: 12,
    warehouseCapacity: 85,
    dailyMovements: 156
  };
}

function getAgentOperatorModules() {
  return [
    { id: 'agent_dashboard', name: '智能体看板', icon: 'Bot', permission: 'dashboard_read' },
    { id: 'workflow_execution', name: '工作流执行', icon: 'Play', permission: 'agents_execute' },
    { id: 'monitoring', name: '运行监控', icon: 'Activity', permission: 'agents_monitor' },
    { id: 'debug_tools', name: '调试工具', icon: 'Bug', permission: 'agents_debug' }
  ];
}

function getAgentOperatorStatistics() {
  return {
    activeWorkflows: 12,
    completedToday: 89,
    failedTasks: 3,
    avgExecutionTime: '2.3s',
    successRate: 96.7
  };
}

function getViewerModules() {
  return [
    { id: 'overview', name: '数据概览', icon: 'Eye', permission: 'dashboard_read' },
    { id: 'reports', name: '查看报表', icon: 'FileText', permission: 'reports_read' }
  ];
}

function getViewerStatistics() {
  return {
    accessibleReports: 15,
    lastUpdated: '2小时前',
    dataFreshness: 'high'
  };
}

function getDefaultModules() {
  return [
    { id: 'basic_dashboard', name: '基础看板', icon: 'Layout', permission: 'dashboard_read' }
  ];
}

function getDefaultStatistics() {
  return {
    welcomeMessage: '欢迎使用系统'
  };
}

// 获取最近活动
function getRecentActivities() {
  return [
    {
      id: '1',
      type: 'system',
      title: '系统更新完成',
      description: '版本 2.1.0 已部署',
      time: '2小时前',
      icon: 'Rocket'
    },
    {
      id: '2',
      type: 'user',
      title: '新用户注册',
      description: '用户 john_doe 完成注册',
      time: '4小时前',
      icon: 'UserPlus'
    },
    {
      id: '3',
      type: 'content',
      title: '内容待审核',
      description: '有 3 篇文章等待审核',
      time: '1天前',
      icon: 'FileText'
    }
  ];
}