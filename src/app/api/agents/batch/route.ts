/**
 * 智能体批量操作 API
 *
 * POST /api/agents/batch - 批量操作智能体
 * Body:
 *  - agentIds: 智能体 ID 数组
 *  - action: 操作类型 (approve|reject|delete|publish|archive)
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentIds, action, options = {} } = body;

    // 验证必填参数
    if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_IDS',
            message: '请提供有效的智能体 ID 列表',
          },
        },
        { status: 400 }
      );
    }

    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ACTION',
            message: '请指定操作类型',
          },
        },
        { status: 400 }
      );
    }

    // 执行批量操作
    let result;
    switch (action) {
      case 'approve':
        result = await batchApprove(agentIds, options);
        break;
      case 'reject':
        result = await batchReject(agentIds, options);
        break;
      case 'delete':
        result = await batchDelete(agentIds, options);
        break;
      case 'publish':
        result = await batchPublish(agentIds, options);
        break;
      case 'archive':
        result = await batchArchive(agentIds, options);
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNSUPPORTED_ACTION',
              message: `不支持的操作类型：${action}`,
            },
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `成功处理 ${result.successCount}/${agentIds.length} 个智能体`,
      data: result,
    });
  } catch (error) {
    console.error('批量操作失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BATCH_OPERATION_FAILED',
          message: error instanceof Error ? error.message : '批量操作失败',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * 批量批准
 */
async function batchApprove(agentIds: string[], options: any) {
  const results = await Promise.allSettled(
    agentIds.map(async id => {
      const { error } = await supabase
        .from('agents')
        .update({
          status: 'active',
          approved_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return { id, success: true };
    })
  );

  return processBatchResults(results);
}

/**
 * 批量拒绝
 */
async function batchReject(agentIds: string[], options: any) {
  const rejectionReason = options.reason || '未通过审核';

  const results = await Promise.allSettled(
    agentIds.map(async id => {
      const { error } = await supabase
        .from('agents')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          rejected_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return { id, success: true };
    })
  );

  return processBatchResults(results);
}

/**
 * 批量删除（软删除）
 */
async function batchDelete(agentIds: string[], options: any) {
  const results = await Promise.allSettled(
    agentIds.map(async id => {
      const { error } = await supabase
        .from('agents')
        .update({
          deleted_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return { id, success: true };
    })
  );

  return processBatchResults(results);
}

/**
 * 批量发布
 */
async function batchPublish(agentIds: string[], options: any) {
  const results = await Promise.allSettled(
    agentIds.map(async id => {
      const { error } = await supabase
        .from('agents')
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return { id, success: true };
    })
  );

  return processBatchResults(results);
}

/**
 * 批量归档
 */
async function batchArchive(agentIds: string[], options: any) {
  const results = await Promise.allSettled(
    agentIds.map(async id => {
      const { error } = await supabase
        .from('agents')
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return { id, success: true };
    })
  );

  return processBatchResults(results);
}

/**
 * 处理批量操作结果
 */
function processBatchResults(results: PromiseSettledResult<any>[]) {
  const successCount = results.filter(r => r.status === 'fulfilled').length;

  const failureCount = results.filter(r => r.status === 'rejected').length;

  const failures = results
    .filter(r => r.status === 'rejected')
    .map((r, index) => ({
      index,
      error: r instanceof PromiseRejectedResult ? r.reason : 'Unknown error',
    }));

  return {
    successCount,
    failureCount,
    totalCount: results.length,
    failures,
  };
}
