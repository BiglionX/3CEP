import { getAuthUser } from '@/lib/auth/utils';
import createClient from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const user = await getAuthUser(request);
    if (
      !user ||
      !user.role ||
      !['admin', 'manager', 'marketplace_admin'].includes(user.role)
    ) {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      );
    }

    const supabase = createClient();

    // 获取总收入
    const { data: ordersData, error: ordersError } = await supabase
      .from('agent_orders')
      .select('total_amount');

    if (ordersError) throw ordersError;

    const totalRevenue =
      ordersData?.reduce(
        (sum: number, order: any) => sum + (order.total_amount || 0),
        0
      ) || 0;

    // 获取总订单数
    const { count: totalOrders } = await supabase
      .from('agent_orders')
      .select('*', { count: 'exact', head: true });

    // 获取智能体总数
    const { count: totalAgents } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true });

    // 获取 Skill 总数
    const { count: totalSkills } = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true });

    // 获取活跃开发者数（有产品的用户）
    const { data: developerIds } = await supabase
      .from('agents')
      .select('developer_id')
      .neq('developer_id', null);

    const uniqueDevelopers = new Set(
      developerIds?.map((d: any) => d.developer_id)
    );
    const activeDevelopers = uniqueDevelopers.size;

    // 计算月增长率（简单实现）
    const now = new Date();
    const lastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const { count: currentMonthOrders } = await supabase
      .from('agent_orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', now.toISOString());

    const { count: lastMonthOrders } = await supabase
      .from('agent_orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastMonth.toISOString())
      .lt('created_at', now.toISOString());

    const monthlyGrowth =
      lastMonthOrders && lastMonthOrders > 0
        ? (((currentMonthOrders || 0) - lastMonthOrders) / lastMonthOrders) *
          100
        : 0;

    // 获取收入趋势（最近 6 个月）
    const revenueTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        1
      );

      const { data: monthOrders } = await supabase
        .from('agent_orders')
        .select('total_amount, created_at')
        .gte('created_at', monthDate.toISOString())
        .lt('created_at', nextMonthDate.toISOString());

      const monthRevenue =
        monthOrders?.reduce(
          (sum: number, order: any) => sum + (order.total_amount || 0),
          0
        ) || 0;
      const monthName = monthDate.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
      });

      revenueTrend.push({
        month: monthName,
        revenue: monthRevenue,
        orders: monthOrders?.length || 0,
      });
    }

    // 获取顶级开发者
    const { data: topAgents } = await supabase
      .from('agents')
      .select(
        `
        developer_id,
        id,
        price
      `
      )
      .eq('review_status', 'approved')
      .eq('shelf_status', 'on_shelf')
      .order('price', { ascending: false })
      .limit(10);

    // 聚合开发者数据
    const developerMap = new Map();
    topAgents?.forEach((agent: any) => {
      const devId = agent.developer_id;
      if (!developerMap.has(devId)) {
        developerMap.set(devId, {
          id: devId,
          totalProducts: 0,
          totalSales: 0,
          revenue: 0,
        });
      }
      const dev = developerMap.get(devId);
      dev.totalProducts += 1;
      dev.revenue += agent.price || 0;
    });

    // 获取开发者详细信息
    const topDevelopers = [];
    for (const [devId, data] of developerMap.entries()) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', devId)
        .single();

      if (profile) {
        topDevelopers.push({
          id: devId,
          name: profile.name || '未知开发者',
          email: profile.email,
          totalProducts: data.totalProducts,
          totalSales: data.totalSales,
          revenue: data.revenue,
        });
      }
    }

    // 按收入排序
    topDevelopers.sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalRevenue,
          totalOrders: totalOrders || 0,
          totalAgents: totalAgents || 0,
          totalSkills: totalSkills || 0,
          activeDevelopers,
          monthlyGrowth,
        },
        revenueTrend,
        topDevelopers: topDevelopers.slice(0, 5),
      },
    });
  } catch (error) {
    console.error('市场统计数据获取失败:', error);
    return NextResponse.json(
      { success: false, error: '查询失败' },
      { status: 500 }
    );
  }
}
