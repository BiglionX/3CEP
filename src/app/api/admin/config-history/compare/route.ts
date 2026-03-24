/**
 * 配置对比 API
 *
 * GET /api/admin/config-history/compare - 对比两个配置版本
 */

import { JsonDiffUtil } from '@/lib/utils/json-diff';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const versionId1 = searchParams.get('versionId1');
    const versionId2 = searchParams.get('versionId2');

    if (!versionId1 || !versionId2) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PARAMS',
            message: '请提供两个版本 ID',
          },
        },
        { status: 400 }
      );
    }

    // 获取两个版本的配置数据
    const [version1Result, version2Result] = await Promise.all([
      supabase
        .from('agent_config_versions')
        .select('*')
        .eq('id', versionId1)
        .single(),
      supabase
        .from('agent_config_versions')
        .select('*')
        .eq('id', versionId2)
        .single(),
    ]);

    if (version1Result.error) throw version1Result.error;
    if (version2Result.error) throw version2Result.error;

    const version1 = version1Result.data;
    const version2 = version2Result.data;

    // 使用 JsonDiffUtil 进行对比
    const report = JsonDiffUtil.generateReport(
      version1.config_data,
      version2.config_data
    );

    // 生成文本报告
    const textReport = JsonDiffUtil.formatTextReport(
      version1.config_data,
      version2.config_data
    );

    return NextResponse.json({
      success: true,
      data: {
        version1: {
          id: version1.id,
          version_number: version1.version_number,
          created_at: version1.created_at,
          created_by: version1.created_by,
        },
        version2: {
          id: version2.id,
          version_number: version2.version_number,
          created_at: version2.created_at,
          created_by: version2.created_by,
        },
        comparison: report,
        textReport,
      },
    });
  } catch (error) {
    console.error('配置对比失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'COMPARE_FAILED',
          message: error instanceof Error ? error.message : '对比失败',
        },
      },
      { status: 500 }
    );
  }
}
