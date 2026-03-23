/**
 * 市场运营管理 API - 市场概览
 * GET /api/admin/marketplace/overview
 */

import { getAuthUser } from '@/lib/auth/utils';
import { createClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const user = await getAuthUser(request);
    if (
      !user ||
      !['admin', 'marketplace_admin', 'finance_manager'].includes(user.role)
    ) {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      );
    }

    const supabase = createClient();

    // 获取智能体和 Skill 总数
    const { count: totalAgents } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true });

    const { count: totalSkills } = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true });

    // 获取今日新增
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const { count: todayAgents } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO);

    const { count: todaySkills } = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO);

    // 获取订单统计
    const { data: orderStats } = await supabase.rpc(
      'get_marketplace_order_stats'
    );

    // 获取热门分类
    const { data: topCategories } = await supabase
      .from('agent_categories')
      .select('id, name, description')
      .order('sort_order', { ascending: true })
      .limit(5);

    // 获取活跃开发者数量
    const { count: activeDevelopers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .in('role', ['developer', 'enterprise_developer']);

    return NextResponse.json({
      success: true,
      data: {
        totals: {
          agents: totalAgents || 0,
          skills: totalSkills || 0,
        },
        todayGrowth: {
          agents: todayAgents || 0,
          skills: todaySkills || 0,
        },
        orders: orderStats || {
          totalOrders: 0,
          todayOrders: 0,
          totalRevenue: 0,
          todayRevenue: 0,
        },
        topCategories: topCategories || [],
        activeDevelopers: activeDevelopers || 0,
      },
    });
  } catch (error: any) {
    console.error('市场概览 API 错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '服务器错误' },
      { status: 500 }
    );
  }
}
