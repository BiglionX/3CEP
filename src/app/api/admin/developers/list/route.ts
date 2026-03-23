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

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const searchTerm = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    // 获取所有开发者（有产品的用户）
    let query = supabase.from('profiles').select('*', { count: 'exact' });

    // 搜索条件
    if (searchTerm) {
      query = query.or(
        `name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
      );
    }

    const {
      data: allProfiles,
      error: profilesError,
      count: _count,
    } = await query;

    if (profilesError) throw profilesError;

    // 过滤出有产品的开发者
    const developerIds = allProfiles?.map((p: any) => p.id) || [];
    const { data: agents } = await supabase
      .from('agents')
      .select('developer_id')
      .in('developer_id', developerIds);

    const uniqueDeveloperIds = Array.from(
      new Set(agents?.map((a: any) => a.developer_id))
    );
    let developers =
      allProfiles?.filter((p: any) => uniqueDeveloperIds.includes(p.id)) || [];

    // 状态过滤（简化实现）
    if (status) {
      // 这里可以根据业务逻辑实现具体的状态过滤
      // 目前假设所有开发者都是 active
      if (status === 'active') {
        developers = developers.filter(
          (d: any) => d.status === 'active' || !d.status
        );
      } else if (status === 'inactive') {
        developers = developers.filter((d: any) => d.status === 'inactive');
      } else if (status === 'suspended') {
        developers = developers.filter((d: any) => d.status === 'suspended');
      }
    }

    // 分页
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const paginatedDevelopers = developers.slice(from, to + 1);

    // 获取每个开发者的详细信息
    const developersWithDetails = await Promise.all(
      paginatedDevelopers.map(async (profile: any) => {
        // 获取智能体数量
        const { count: agentCount } = await supabase
          .from('agents')
          .select('*', { count: 'exact', head: true })
          .eq('developer_id', profile.id);

        // 获取 Skill 数量
        const { count: skillCount } = await supabase
          .from('skills')
          .select('*', { count: 'exact', head: true })
          .eq('developer_id', profile.id);

        // 获取总收入
        const { data: agentOrders } = await supabase
          .from('agent_orders')
          .select('total_amount')
          .eq('agent_id', profile.id);

        const totalRevenue =
          agentOrders?.reduce(
            (sum: number, order: any) => sum + (order.total_amount || 0),
            0
          ) || 0;

        return {
          id: profile.id,
          name: profile.name || '未知用户',
          email: profile.email,
          avatar: profile.avatar_url,
          totalAgents: agentCount || 0,
          totalSkills: skillCount || 0,
          totalRevenue,
          status: profile.status || 'active',
          joinDate: profile.created_at,
          lastActive: profile.updated_at,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: developersWithDetails,
      pagination: {
        page,
        pageSize,
        total: developers.length,
        totalPages: Math.ceil(developers.length / pageSize),
      },
    });
  } catch (error) {
    console.error('开发者列表查询失败:', error);
    return NextResponse.json(
      { success: false, error: '查询失败' },
      { status: 500 }
    );
  }
}
