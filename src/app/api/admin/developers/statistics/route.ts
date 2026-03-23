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

    // 获取总开发者数（有产品的用户）
    const { data: allAgents } = await supabase
      .from('agents')
      .select('developer_id');
    const uniqueDeveloperIds = Array.from(
      new Set(allAgents?.map((a: any) => a.developer_id))
    );

    // 获取开发者资料
    const { data: developers } = await supabase
      .from('profiles')
      .select('status')
      .in('id', uniqueDeveloperIds);

    const totalDevelopers = uniqueDeveloperIds.length;
    const activeDevelopers =
      developers?.filter((d: any) => d.status === 'active' || !d.status)
        .length || 0;
    const inactiveDevelopers =
      developers?.filter((d: any) => d.status === 'inactive').length || 0;
    const suspendedDevelopers =
      developers?.filter((d: any) => d.status === 'suspended').length || 0;

    return NextResponse.json({
      success: true,
      data: {
        totalDevelopers,
        activeDevelopers,
        inactiveDevelopers,
        suspendedDevelopers,
      },
    });
  } catch (error) {
    console.error('开发者统计数据获取失败:', error);
    return NextResponse.json(
      { success: false, error: '查询失败' },
      { status: 500 }
    );
  }
}
