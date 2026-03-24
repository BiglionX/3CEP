/**
 * Skill 商店管理 API - 统计数据
 * GET /api/admin/skill-store/statistics
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

    // 获取基础统计数据
    const { data: totalStats } = await supabase
      .from('skills')
      .select('id, shelf_status, review_status', {
        count: 'exact',
        head: true,
      });

    // 分类统计
    const { data: categoryStats } = await supabase.rpc(
      'get_skill_category_stats'
    );

    // 今日数据
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayOrders } = await supabase
      .from('skill_orders')
      .select('actual_amount', { count: 'exact' })
      .gte('created_at', today.toISOString())
      .in('status', ['paid', 'activated']);

    // 本月数据
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const { data: monthOrders } = await supabase
      .from('skill_orders')
      .select('actual_amount')
      .gte('created_at', monthStart.toISOString())
      .in('status', ['paid', 'activated']);

    // 热门 Skill（按销量）
    const { data: topSkills } = await supabase
      .from('skills')
      .select('id, name, purchase_count, revenue_total')
      .order('purchase_count', { ascending: false })
      .limit(10);

    // 收入统计
    const totalRevenue =
      monthOrders?.reduce(
        (sum, order) => sum + Number(order.actual_amount),
        0
      ) || 0;
    const todayRevenue =
      todayOrders?.reduce(
        (sum, order) => sum + Number(order.actual_amount),
        0
      ) || 0;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalSkills: totalStats?.length || 0,
          onShelfSkills:
            totalStats?.filter(s => s.shelf_status === 'on_shelf').length || 0,
          approvedSkills:
            totalStats?.filter(s => s.review_status === 'approved').length || 0,
          pendingReview:
            totalStats?.filter(s => s.review_status === 'pending').length || 0,
        },
        sales: {
          todayOrders: todayOrders?.length || 0,
          todayRevenue,
          monthOrders: monthOrders?.length || 0,
          monthRevenue: totalRevenue,
        },
        topSkills: topSkills || [],
        categoryStats: categoryStats || [],
      },
    });
  } catch (error: any) {
    console.error('Skill 商店统计 API 错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '服务器错误' },
      { status: 500 }
    );
  }
}
