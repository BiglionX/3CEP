/**
 * 市场运营管理 API - 开发者统计
 * GET /api/admin/marketplace/developer-stats
 */

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
    const timeRange = searchParams.get('timeRange') || 'all';
    const sortBy = searchParams.get('sortBy') || 'revenue'; // revenue, orders, rating

    // 计算时间范围
    const now = new Date();
    let _startISO: string | null = null;

    if (timeRange !== 'all') {
      let startTime: Date;
      switch (timeRange) {
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
          startTime = new Date(now);
          break;
      }
      _startISO = startTime.toISOString();
    }

    // 获取所有开发者（有产品的用户）- 预留接口，暂时不使用
    // const { data: developers } = await supabase.rpc('get_developer_stats', {
    //   p_time_range: startISO,
    // });

    // 如果没有存储过程，手动查询
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, role')
      .in('role', ['developer', 'enterprise_developer']);

    // 获取开发者的智能体数量
    const { data: agentStats } = await supabase
      .from('agents')
      .select('developer_id, id, purchase_count, revenue_total, rating_avg');

    // 获取开发者的 Skill 数量
    const { data: skillStats } = await supabase
      .from('skills')
      .select('developer_id, id, purchase_count, revenue_total, rating_avg');

    // 合并统计数据
    const developerStatsMap: Record<string, any> = {};

    // 初始化开发者统计
    profiles?.forEach((profile: any) => {
      developerStatsMap[profile.id] = {
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        avatar: profile.avatar_url,
        role: profile.role,
        agentsCount: 0,
        skillsCount: 0,
        totalRevenue: 0,
        totalOrders: 0,
        avgRating: 0,
        agents: [],
        skills: [],
      };
    });

    // 统计智能体数据
    agentStats?.forEach((agent: any) => {
      if (agent.developer_id && developerStatsMap[agent.developer_id]) {
        developerStatsMap[agent.developer_id].agentsCount += 1;
        developerStatsMap[agent.developer_id].totalRevenue += Number(
          agent.revenue_total || 0
        );
        developerStatsMap[agent.developer_id].totalOrders += Number(
          agent.purchase_count || 0
        );
        if (agent.rating_avg) {
          developerStatsMap[agent.developer_id].avgRating = Math.max(
            developerStatsMap[agent.developer_id].avgRating,
            Number(agent.rating_avg)
          );
        }
      }
    });

    // 统计 Skill 数据
    skillStats?.forEach((skill: any) => {
      if (skill.developer_id && developerStatsMap[skill.developer_id]) {
        developerStatsMap[skill.developer_id].skillsCount += 1;
        developerStatsMap[skill.developer_id].totalRevenue += Number(
          skill.revenue_total || 0
        );
        developerStatsMap[skill.developer_id].totalOrders += Number(
          skill.purchase_count || 0
        );
        if (skill.rating_avg) {
          developerStatsMap[skill.developer_id].avgRating = Math.max(
            developerStatsMap[skill.developer_id].avgRating,
            Number(skill.rating_avg)
          );
        }
      }
    });

    // 转换为数组并排序
    const developerStats = Object.values(developerStatsMap);

    switch (sortBy) {
      case 'revenue':
        developerStats.sort((a, b) => b.totalRevenue - a.totalRevenue);
        break;
      case 'orders':
        developerStats.sort((a, b) => b.totalOrders - a.totalOrders);
        break;
      case 'rating':
        developerStats.sort((a, b) => b.avgRating - a.avgRating);
        break;
    }

    // 汇总统计
    const summary = {
      totalDevelopers: developerStats.length,
      totalRevenue: developerStats.reduce(
        (sum, dev) => sum + dev.totalRevenue,
        0
      ),
      totalOrders: developerStats.reduce(
        (sum, dev) => sum + dev.totalOrders,
        0
      ),
      totalAgents: developerStats.reduce(
        (sum, dev) => sum + dev.agentsCount,
        0
      ),
      totalSkills: developerStats.reduce(
        (sum, dev) => sum + dev.skillsCount,
        0
      ),
    };

    return NextResponse.json({
      success: true,
      data: {
        summary,
        developers: developerStats,
        timeRange,
        sortBy,
      },
    });
  } catch (error: any) {
    console.error('开发者统计 API 错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '服务器错误' },
      { status: 500 }
    );
  }
}
