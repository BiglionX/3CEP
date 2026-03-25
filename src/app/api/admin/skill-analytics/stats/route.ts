import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 获取基础统计数据
    const { data: totalData } = await supabase
      .from('skills')
      .select('id', { count: 'exact', head: true });

    const { data: onShelfData } = await supabase
      .from('skills')
      .select('id', { count: 'exact', head: true })
      .eq('shelf_status', 'on_shelf');

    const { data: approvedData } = await supabase
      .from('skills')
      .select('id', { count: 'exact', head: true })
      .eq('review_status', 'approved');

    const { data: pendingData } = await supabase
      .from('skills')
      .select('id', { count: 'exact', head: true })
      .eq('review_status', 'pending');

    const { data: rejectedData } = await supabase
      .from('skills')
      .select('id', { count: 'exact', head: true })
      .eq('review_status', 'rejected');

    return NextResponse.json({
      success: true,
      data: {
        totalSkills: totalData?.length || 0,
        onShelfSkills: onShelfData?.length || 0,
        approvedSkills: approvedData?.length || 0,
        pendingReview: pendingData?.length || 0,
        rejectedSkills: rejectedData?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
