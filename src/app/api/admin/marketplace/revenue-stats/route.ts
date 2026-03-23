/**
 * 市场运营管理 API - 收入统计
 * GET /api/admin/marketplace/revenue-stats
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

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'today'; // today, week, month, year, all
    const groupBy = searchParams.get('groupBy') || 'day'; // day, week, month

    // 计算时间范围
    const now = new Date();
    let startTime: Date;

    switch (timeRange) {
      case 'today':
        startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startTime = new Date(now);
        startTime.setDate(startTime.getDate() - 7);
        break;
      case 'month':
        startTime = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startTime = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startTime = new Date(2020, 0, 1); // 所有数据
    }

    const startISO = startTime.toISOString();

    // 获取智能体订单收入
    const { data: agentOrders } = await supabase
      .from('agent_orders')
      .select('actual_amount, created_at')
      .gte('created_at', startISO)
      .in('status', ['paid', 'activated', 'completed'])
      .order('created_at', { ascending: true });

    // 获取 Skill 订单收入
    const { data: skillOrders } = await supabase
      .from('skill_orders')
      .select('actual_amount, created_at')
      .gte('created_at', startISO)
      .in('status', ['paid', 'activated', 'completed'])
      .order('created_at', { ascending: true });

    // 合并订单数据
    const allOrders = [
      ...(agentOrders?.map(o => ({ ...o, type: 'agent' })) || []),
      ...(skillOrders?.map(o => ({ ...o, type: 'skill' })) || []),
    ];

    // 按时间分组统计
    const revenueByDate: Record<string, any> = {};
    allOrders.forEach(order => {
      const dateKey = new Date(order.created_at).toISOString().split('T')[0];
      if (!revenueByDate[dateKey]) {
        revenueByDate[dateKey] = {
          date: dateKey,
          agentRevenue: 0,
          skillRevenue: 0,
          totalRevenue: 0,
          agentOrders: 0,
          skillOrders: 0,
          totalOrders: 0,
        };
      }
      if (order.type === 'agent') {
        revenueByDate[dateKey].agentRevenue += Number(order.actual_amount);
        revenueByDate[dateKey].agentOrders += 1;
      } else {
        revenueByDate[dateKey].skillRevenue += Number(order.actual_amount);
        revenueByDate[dateKey].skillOrders += 1;
      }
      revenueByDate[dateKey].totalRevenue += Number(order.actual_amount);
      revenueByDate[dateKey].totalOrders += 1;
    });

    // 转换为数组并排序
    const revenueData = Object.values(revenueByDate).sort((a: any, b: any) =>
      a.date.localeCompare(b.date)
    );

    // 汇总统计
    const summary = {
      totalRevenue: revenueData.reduce(
        (sum, item: any) => sum + item.totalRevenue,
        0
      ),
      agentRevenue: revenueData.reduce(
        (sum, item: any) => sum + item.agentRevenue,
        0
      ),
      skillRevenue: revenueData.reduce(
        (sum, item: any) => sum + item.skillRevenue,
        0
      ),
      totalOrders: revenueData.reduce(
        (sum, item: any) => sum + item.totalOrders,
        0
      ),
      agentOrders: revenueData.reduce(
        (sum, item: any) => sum + item.agentOrders,
        0
      ),
      skillOrders: revenueData.reduce(
        (sum, item: any) => sum + item.skillOrders,
        0
      ),
    };

    return NextResponse.json({
      success: true,
      data: {
        summary,
        revenueData,
        timeRange,
        groupBy,
      },
    });
  } catch (error: any) {
    console.error('收入统计 API 错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '服务器错误' },
      { status: 500 }
    );
  }
}
