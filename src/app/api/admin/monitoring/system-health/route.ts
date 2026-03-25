import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/monitoring/system-health
 * 获取系统健康状态
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. 检查数据库连接
    const { data: dbCheck, error: dbError } = await supabase
      .from('skills')
      .select('id')
      .limit(1);

    if (dbError) {
      throw new Error(`数据库连接失败：${dbError.message}`);
    }

    // 2. 获取数据库统计信息
    const { count: skillsCount } = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true });

    const { count: usersCount } = await supabase
      .from('auth.users')
      .select('*', { count: 'exact', head: true });

    // 3. 获取慢查询视图
    const { data: slowQueries } = await supabase
      .from('v_slow_queries')
      .select('*')
      .limit(5);

    // 4. 获取表大小统计
    const { data: tableSizes } = await supabase
      .from('v_table_sizes')
      .select('*')
      .limit(10);

    // 5. 检查索引使用情况
    const { data: indexStats } = await supabase
      .from('v_index_usage_stats')
      .select('*')
      .order('idx_scan', { ascending: true })
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: {
          status: 'connected',
          responseTime: Date.now(),
          stats: {
            totalSkills: skillsCount || 0,
            totalUsers: usersCount || 0,
          },
        },
        performance: {
          slowQueries: slowQueries || [],
          unusedIndexes: indexStats || [],
          tableSizes: tableSizes || [],
        },
      },
    });
  } catch (error) {
    console.error('系统健康检查失败:', error);
    return NextResponse.json(
      {
        success: false,
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : '未知错误',
        },
      },
      { status: 500 }
    );
  }
}
