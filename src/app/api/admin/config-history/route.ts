/**
 * 配置历史管理 API
 *
 * GET /api/admin/config-history - 获取配置历史列表
 * POST /api/admin/config-history - 保存配置快照
 * GET /api/admin/config-history/compare - 对比两个版本
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET 请求：获取配置历史列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('agent_config_versions')
      .select(
        `
        id,
        agent_id,
        version_number,
        config_data,
        change_summary,
        created_by,
        created_at,
        profiles (
          full_name,
          email
        )
      `
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('获取配置历史失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: error instanceof Error ? error.message : '获取失败',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST 请求：保存配置快照
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, configData, changeSummary, createdBy } = body;

    if (!agentId || !configData) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PARAMS',
            message: '缺少必填参数：agentId, configData',
          },
        },
        { status: 400 }
      );
    }

    // 获取最新版本号
    const { data: latestVersion } = await supabase
      .from('agent_config_versions')
      .select('version_number')
      .eq('agent_id', agentId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const newVersionNumber = (latestVersion?.version_number || 0) + 1;

    // 保存新版本
    const { data, error } = await supabase
      .from('agent_config_versions')
      .insert({
        agent_id: agentId,
        version_number: newVersionNumber,
        config_data: configData,
        change_summary: changeSummary || '',
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: '配置快照已保存',
      data,
    });
  } catch (error) {
    console.error('保存配置快照失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SAVE_FAILED',
          message: error instanceof Error ? error.message : '保存失败',
        },
      },
      { status: 500 }
    );
  }
}
